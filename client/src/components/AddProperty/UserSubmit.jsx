"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/hooks/useAuth";
import { useUserProfileApi } from '@/utils/api';
import { useVipBuyer } from '@/utils/VipBuyerContext';

export default function UserSubmit() {
  // State for the database user
  const [dbUser, setDbUser] = useState(null);
  
  // Use the same authentication hook that Header and Profile use
  const { user, isLoading } = useAuth();
  
  // Use the API hook to get the authenticated getUserProfile function
  const { getUserProfile } = useUserProfileApi();
  
  // Also access VIP buyer data in case user is a VIP buyer
  const { isVipBuyer, vipBuyerData } = useVipBuyer();

  // Load database user profile data using the authenticated method
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user?.sub && !isLoading) {
        try {
          const profile = await getUserProfile();
          setDbUser(profile);
        } catch (error) {
          console.error('Error loading user profile in UserSubmit:', error);
        }
      }
    };
    
    loadUserProfile();
  }, [user, isLoading, getUserProfile]);

  // Get user display name with proper prioritization
  const getUserDisplayName = () => {
    if (!user) return "Not logged in";
    
    // First priority: Complete name from database user profile
    if (dbUser?.firstName && dbUser?.lastName) {
      return `${dbUser.firstName} ${dbUser.lastName}`;
    }
    
    // Second priority: Complete name from VIP buyer data
    if (isVipBuyer && vipBuyerData?.firstName && vipBuyerData?.lastName) {
      return `${vipBuyerData.firstName} ${vipBuyerData.lastName}`;
    }
    
    // Third priority: Partial name from database
    if (dbUser?.firstName) {
      return dbUser.firstName;
    }
    
    if (isVipBuyer && vipBuyerData?.firstName) {
      return vipBuyerData.firstName;
    }
    
    // Fourth priority: Auth0 given_name and family_name
    if (user.given_name && user.family_name) {
      return `${user.given_name} ${user.family_name}`;
    }
    
    // Fifth priority: Auth0 name if not an email
    if (user.name && !user.name.includes('@')) {
      return user.name;
    }
    
    // Sixth priority: nickname
    if (user.nickname && !user.nickname.includes('@')) {
      return user.nickname;
    }
    
    // Final fallback: email
    return user.email;
  };

  return (
    <div className="bg-[#f0f0f0] p-4 rounded-[12px] border border-[rgba(200,200,200,0.6)]">
      <p className="text-base font-semibold text-[#333]">
        You are uploading as:{" "}
        {isLoading ? (
          <span className="italic text-gray-500">Loading user info...</span>
        ) : user ? (
          <span className="font-bold text-[#000]">{getUserDisplayName()}</span>
        ) : (
          <span className="text-red-600">Not logged in</span>
        )}
      </p>
      {user && user.email && (
        <input type="hidden" name="userEmail" value={user.email} />
      )}
    </div>
  );
}