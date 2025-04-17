"use client";

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../utils/api";
import { parsePhoneNumber } from "libphonenumber-js";
import ContactCard from "@/components/ContactCard/ContactCard";
import { useAuth } from "@/components/hooks/useAuth";
import { useUserProfileApi } from '@/utils/api';
import { useVipBuyer } from '@/utils/VipBuyerContext';


// ShadCN UI components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Offer({ propertyData }) {
  if (!propertyData) {
    return (
      <div className="min-h-screen bg-[#FFF] text-[#050002] flex items-center justify-center">
        Error: Property data not found.
      </div>
    );
  }

  const navigate = useNavigate();
  const [offerPrice, setOfferPrice] = useState("");
  const [buyerType, setBuyerType] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // State for the Dialog notification
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");
  const [dialogType, setDialogType] = useState("success"); // "success" or "warning"

  // Get user data from different sources
  const { user: authUser } = useAuth();
  const { getUserProfile } = useUserProfileApi();
  const { vipBuyerData, isVipBuyer } = useVipBuyer();

  // Auto-populate fields based on available data sources
  useEffect(() => {
    const populateUserData = async () => {
      setIsLoading(true);
      
      // Priority 1: Database Buyer info (VIP Buyer data or user profile)
      if (isVipBuyer && vipBuyerData) {
        // Use VIP Buyer data
        setFirstName(vipBuyerData.firstName || "");
        setLastName(vipBuyerData.lastName || "");
        setEmail(vipBuyerData.email || "");
        setPhone(vipBuyerData.phone ? formatPhoneNumber(vipBuyerData.phone) : "");
        setBuyerType(vipBuyerData.buyerType || "");
        setIsLoading(false);
        return;
      }
      
      // Try getting user profile from database
      try {
        const userProfile = await getUserProfile();
        if (userProfile) {
          setFirstName(userProfile.firstName || "");
          setLastName(userProfile.lastName || "");
          setEmail(userProfile.email || "");
          // Phone might not be in user profile, but we'll check
          if (userProfile.phone) {
            setPhone(formatPhoneNumber(userProfile.phone));
          }
          // Buyer type might not be in user profile
          if (userProfile.buyerType) {
            setBuyerType(userProfile.buyerType);
          }
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.log("No user profile found in database, falling back to Auth0");
      }
      
      // Priority 2: Auth0 data
      if (authUser) {
        // Try to extract first/last name from Auth0 name if available
        if (authUser.name) {
          const nameParts = authUser.name.split(' ');
          if (nameParts.length >= 2) {
            setFirstName(nameParts[0] || "");
            setLastName(nameParts.slice(1).join(' ') || "");
          } else if (nameParts.length === 1) {
            setFirstName(nameParts[0] || "");
          }
        }
        
        // Or use given_name and family_name if available
        if (authUser.given_name) setFirstName(authUser.given_name);
        if (authUser.family_name) setLastName(authUser.family_name);
        
        // Use Auth0 email
        setEmail(authUser.email || "");
        
        // Auth0 typically doesn't provide phone or buyer type
      }
      
      setIsLoading(false);
    };

    populateUserData();
  }, [isVipBuyer, vipBuyerData, authUser, getUserProfile]);

  // Format the offer price as the user types
  const handleOfferPriceChange = (e) => {
    let value = e.target.value;
    // Remove commas from the value
    value = value.replace(/,/g, "");
    if (value === "") {
      setOfferPrice("");
      return;
    }
    const floatValue = parseFloat(value);
    if (!isNaN(floatValue)) {
      // Format number with commas
      setOfferPrice(floatValue.toLocaleString("en-US"));
    } else {
      // If not a valid number, keep the raw value
      setOfferPrice(value);
    }
  };

  // Phone number validation using libphonenumber-js
  const validatePhone = (phoneInput) => {
    try {
      const phoneNumber = parsePhoneNumber(phoneInput, "US"); // "US" as default country code
      if (!phoneNumber?.isValid()) {
        return false;
      }
      return true;
    } catch (error) {
      console.error("Phone validation error:", error);
      return false;
    }
  };

  // Format phone number as user types
  const handlePhoneChange = (e) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
  };

  const formatPhoneNumber = (input) => {
    // Strip all non-numeric characters
    const digitsOnly = input.replace(/\D/g, '');
    
    // Format the number as user types
    let formattedNumber = '';
    if (digitsOnly.length === 0) {
      return '';
    } else if (digitsOnly.length <= 3) {
      formattedNumber = digitsOnly;
    } else if (digitsOnly.length <= 6) {
      formattedNumber = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3)}`;
    } else {
      formattedNumber = `(${digitsOnly.slice(0, 3)}) ${digitsOnly.slice(3, 6)}-${digitsOnly.slice(6, Math.min(10, digitsOnly.length))}`;
    }
    
    return formattedNumber;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic required field check
    if (!offerPrice || !email || !firstName || !lastName || !phone || !buyerType) {
      setDialogMessage("All fields are required.");
      setDialogType("warning");
      setDialogOpen(true);
      return;
    }
    
    // === Phone Validation with libphonenumber-js ===
    if (!validatePhone(phone)) {
      setDialogMessage("Invalid phone number. Please enter a valid number.");
      setDialogType("warning");
      setDialogOpen(true);
      return;
    }

    // Remove commas before converting to float
    const parsedOfferPrice = parseFloat(offerPrice.replace(/,/g, ""));

    const offerData = {
      email,
      phone,
      buyerType,
      propertyId: propertyData?.id,
      offeredPrice: parsedOfferPrice,
      firstName,
      lastName,
    };

    try {
      await api.post("/buyer/makeOffer", offerData);

      // If offer is below minPrice, show a warning and do not redirect
      if (parsedOfferPrice < propertyData?.minPrice) {
        setDialogMessage(
          `At this time we cannot accept any offers below $${propertyData?.minPrice.toLocaleString()}. Consider offering a higher price.`
        );
        setDialogType("warning");
        setDialogOpen(true);
        return;
      }

      // If valid offer, show success and (optionally) navigate back
      setDialogMessage("Offer submitted successfully!");
      setDialogType("success");
      setDialogOpen(true);
    } catch (error) {
      setDialogMessage(
        "You've already offered this or a higher amount. Please adjust your offer to continue!"
      );
      setDialogType("warning");
      setDialogOpen(true);
    }
  };

  return (
    <div className="bg-white text-[#050002]">
      <Card className="w-full max-w-md border border-[#405025]/20 bg-white shadow-lg mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-[#405025]">
            Make An Offer
          </CardTitle>
          <CardDescription className="text-[#324d49]">
            For {propertyData.streetAddress || "This Property"}
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <Label htmlFor="firstName" className="text-sm text-[#050002]">
                First Name
              </Label>
              <Input
                id="firstName"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>

            {/* Last Name */}
            <div>
              <Label htmlFor="lastName" className="text-sm text-[#050002]">
                Last Name
              </Label>
              <Input
                id="lastName"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-sm text-[#050002]">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-sm text-[#050002]">
                Phone
              </Label>
              <Input
                id="phone"
                type="text"
                placeholder="(555) 555-5555"
                value={phone}
                onChange={handlePhoneChange}
                required
              />
            </div>

            {/* Buyer Type */}
            <div>
              <Label className="text-sm text-[#050002] mb-1 block">
                Buyer Type
              </Label>
              <Select
                value={buyerType}
                onValueChange={(val) => setBuyerType(val)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Buyer Type" />
                </SelectTrigger>
                <SelectContent className="bg-[#FFF] text-[#050002] border border-[#405025]/20">
                  <SelectItem value="CashBuyer">Cash Buyer</SelectItem>
                  <SelectItem value="Builder">Builder</SelectItem>
                  <SelectItem value="Developer">Developer</SelectItem>
                  <SelectItem value="Realtor">Realtor</SelectItem>
                  <SelectItem value="Investor">Investor</SelectItem>
                  <SelectItem value="Wholesaler">Wholesaler</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Offer Price */}
            <div>
              <Label htmlFor="offerPrice" className="text-sm text-[#050002]">
                Offer Price ($)
              </Label>
              <Input
                id="offerPrice"
                type="text" // Changed to text to allow comma formatting
                placeholder="500,000"
                value={offerPrice}
                onChange={handleOfferPriceChange}
                required
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-[#324c48] text-[#FFF] hover:bg-[#324c48]/90 font-semibold mt-4"
            >
              Submit Offer
            </Button>
          </form>
          <div className="py-6">
      <ContactCard />
    </div>
        </CardContent>
      </Card>

      {/* Dialog Notification */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="bg-[#FFF] text-[#050002] border border-[#405025]/30 shadow-lg">
          <DialogHeader>
            <DialogTitle
              className={dialogType === "success" ? "text-green-600" : "text-red-600"}
            >
              {dialogType === "success" ? "Success" : "Warning"}
            </DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={() => {
                setDialogOpen(false);
                if (dialogType === "success") {
                  navigate("/properties");
                }
              }}
              className="bg-[#324c48] text-[#FFF]"
            >
              Okay
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}