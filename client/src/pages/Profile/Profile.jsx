import React, { useState, useEffect } from "react";
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '@/components/hooks/useAuth';
import { usePermissions } from '@/components/Auth0/PermissionsContext';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  CalendarClock, 
  Mail, 
  User, 
  Shield, 
  Key, 
  Users, 
  Home, 
  FileText, 
  LogOut 
} from 'lucide-react';
import Auth0DebugComponent from '@/components/Auth0/Auth0DebugComponent';
import { useVipBuyer } from '@/utils/VipBuyerContext';
import { StarIcon } from '@heroicons/react/24/solid';
import { getUserProfile, updateUserProfile } from '@/utils/api';

const Profile = () => {
  const { 
    user, 
    isLoading, 
    isAuthenticated, 
    logout, 
    getAccessTokenSilently 
  } = useAuth0();
  const { userRoles, userPermissions } = useAuth();
  const permissions = usePermissions();
  const { isVipBuyer, vipBuyerData, isLoading: vipStatusLoading } = useVipBuyer();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [dbUserData, setDbUserData] = useState(null);

  // Load user profile data
  useEffect(() => {
    const loadUserProfile = async () => {
      if (isAuthenticated && user?.sub) {
        try {
          const userProfile = await getUserProfile();
          if (userProfile) {
            setDbUserData(userProfile);
            setProfileData({
              firstName: userProfile.firstName || '',
              lastName: userProfile.lastName || ''
            });
          }
        } catch (error) {
          console.error("Error loading user profile:", error);
        }
      }
    };
    
    loadUserProfile();
  }, [isAuthenticated, user]);

  // Handle profile form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setUpdateSuccess(false);
    
    try {
      await updateUserProfile(profileData);
      setUpdateSuccess(true);
      setIsEditing(false);
      
      // Update local data
      setDbUserData({
        ...dbUserData,
        firstName: profileData.firstName,
        lastName: profileData.lastName
      });
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] bg-background/50">
        <Card className="w-full max-w-md shadow-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-semibold text-text-700">Not Logged In</h2>
            <p className="mt-2 text-text-500">Please log in to view your profile</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format the date when user signed up (if available)
  const createdAt = user.created_at
    ? new Date(user.created_at).toLocaleDateString()
    : 'Not available';
    
  // Group permissions by category
  const permissionCategories = {
    user: userPermissions.filter(p => p.includes('user')),
    property: userPermissions.filter(p => p.includes('propert')),
    buyer: userPermissions.filter(p => p.includes('buyer')),
    offer: userPermissions.filter(p => p.includes('offer')),
    qualification: userPermissions.filter(p => p.includes('qualification')),
    admin: userPermissions.filter(p => p.includes('admin')),
    other: userPermissions.filter(p => 
      !p.includes('user') && 
      !p.includes('propert') && 
      !p.includes('buyer') && 
      !p.includes('offer') && 
      !p.includes('qualification') && 
      !p.includes('admin')
    )
  };

  // Debug token data
  useEffect(() => {
    const getAndDecodeToken = async () => {
      try {
        const token = await getAccessTokenSilently();
        // Log the raw token
        console.log('Raw token:', token);
        
        // Log the parsed token parts
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const header = JSON.parse(atob(tokenParts[0]));
          const payload = JSON.parse(atob(tokenParts[1]));
          console.log('Token header:', header);
          console.log('Token payload:', payload);
          
          // Check for permissions in various locations
          const namespace = 'https://landivo.com';
          console.log('Looking for permissions in these locations:');
          console.log(`1. permissions:`, payload.permissions);
          console.log(`2. ${namespace}/permissions:`, payload[`${namespace}/permissions`]);
          console.log(`3. Inside namespace object:`, payload[namespace]?.permissions);
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    };
    
    if (isAuthenticated) {
      getAndDecodeToken();
    }
  }, [isAuthenticated, getAccessTokenSilently]);

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <Card className="w-full shadow-lg overflow-hidden bg-background">
        {/* Header with proper spacing for avatar */}
        <div className="relative">
          {/* Background banner */}
          <div className="h-40 bg-gradient-to-r from-primary-600 to-secondary-600"></div>
          
          {/* User info with aligned profile picture */}
          <div className="px-6 pb-4 pt-4 flex flex-col md:flex-row md:items-end gap-4">
            {/* Profile picture */}
            <Avatar className="h-24 w-24 border-4 border-background mt-[-3rem] bg-white shadow-md">
              {user.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || "User"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <User className="h-14 w-14 text-gray-400" />
              )}
            </Avatar>
            
            {/* User name and email */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-text-800">
                {user.name || user.nickname || 'User'}
              </h1>
              <div className="flex items-center mt-1 text-text-500">
                <Mail className="w-4 h-4 mr-2" />
                <span>{user.email}</span>
              </div>
            </div>
            
            {/* Logout Button */}
            <Button
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 whitespace-nowrap mt-2 md:mt-0"
              onClick={() => logout({
                logoutParams: { returnTo: window.location.origin }
              })}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        <Separator />

        {/* Profile Main Content */}
        <CardContent className="px-6 py-6">
          {/* User Details */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-5">
              {isEditing ? (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="firstName" className="text-sm font-medium text-text-500">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="lastName" className="text-sm font-medium text-text-500">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                      className="mt-1"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      type="submit" 
                      className="bg-primary hover:bg-primary-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "Save Profile"}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                  
                  {updateSuccess && (
                    <Alert className="mt-4 bg-green-50 border-green-200">
                      <AlertTitle className="text-green-800">Success!</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Your profile has been updated successfully.
                      </AlertDescription>
                    </Alert>
                  )}
                </form>
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-text-500 mb-2">Name</h3>
                    <p className="text-text-700">
                      {dbUserData?.firstName || profileData.firstName || "Not set"} {dbUserData?.lastName || profileData.lastName || ""}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-text-500 mb-2">Email</h3>
                    <p className="text-text-700">{user?.email}</p>
                  </div>
                  
                  <Button
                    onClick={() => setIsEditing(true)}
                    className="mt-4"
                    variant="outline"
                  >
                    Edit Profile
                  </Button>
                </>
              )}

              <div>
                <h3 className="text-sm font-medium text-text-500 mb-2">Email Verification</h3>
                {user.email_verified ? (
                  <Badge className="bg-primary-100 text-primary-800 hover:bg-primary-100">
                    Verified
                  </Badge>
                ) : (
                  <Badge className="bg-accent-100 text-accent-800 hover:bg-accent-100">
                    Not Verified
                  </Badge>
                )}
              </div>

              {user.nickname && (
                <div>
                  <h3 className="text-sm font-medium text-text-500 mb-2">Nickname</h3>
                  <p className="text-text-700">{user.nickname}</p>
                </div>
              )}

              {user.locale && (
                <div>
                  <h3 className="text-sm font-medium text-text-500 mb-2">Locale</h3>
                  <p className="text-text-700">{user.locale}</p>
                </div>
              )}
              
              {/* Roles */}
              <div>
                <h3 className="text-sm font-medium text-text-500 mb-2">
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-primary" />
                    Roles
                  </div>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {userRoles && userRoles.length > 0 ? (
                    userRoles.map((role) => (
                      <Badge 
                        key={role}
                        className="bg-primary-50 text-primary-700 hover:bg-primary-100"
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-text-400 text-sm italic">No roles assigned</span>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-5">
              <div>
                <h3 className="text-sm font-medium text-text-500 mb-2">Authentication Method</h3>
                <Badge className="capitalize bg-secondary-100 text-secondary-700 hover:bg-secondary-100">
                  {user.sub?.split('|')[0] || 'auth0'}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-text-500 mb-2">Account Created</h3>
                <div className="flex items-center">
                  <CalendarClock className="w-4 h-4 mr-2 text-text-400" />
                  <p className="text-text-700">{createdAt}</p>
                </div>
              </div>

              {user.updated_at && (
                <div>
                  <h3 className="text-sm font-medium text-text-500 mb-2">Last Updated</h3>
                  <p className="text-text-700">
                    {new Date(user.updated_at).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* VIP Badge section */}
          {vipStatusLoading ? (
            <div className="mt-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-32"></div>
            </div>
          ) : isVipBuyer && (
            <div className="mt-6">
              <div className="bg-accent-50 border border-accent rounded-md px-4 py-3 flex items-center">
                <StarIcon className="h-5 w-5 text-accent mr-2" />
                <div>
                  <p className="text-accent-700 font-semibold">VIP Buyer</p>
                  <p className="text-sm text-secondary-600">
                    Preferred areas: {vipBuyerData?.preferredAreas?.join(', ') || 'N/A'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Permissions Section */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold text-text-800 flex items-center mb-4">
              <Key className="w-5 h-5 mr-2 text-secondary-600" />
              Permissions
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* User Permissions */}
              {permissionCategories.user.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-700 flex items-center">
                    <Users className="w-4 h-4 mr-2 text-secondary-600" />
                    User Management
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissionCategories.user.map(perm => (
                      <Badge 
                        key={perm}
                        className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Property Permissions */}
              {permissionCategories.property.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-700 flex items-center">
                    <Home className="w-4 h-4 mr-2 text-secondary-600" />
                    Property Management
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissionCategories.property.map(perm => (
                      <Badge 
                        key={perm}
                        className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Buyer Permissions */}
              {permissionCategories.buyer.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-700 flex items-center">
                    <User className="w-4 h-4 mr-2 text-secondary-600" />
                    Buyer Management
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissionCategories.buyer.map(perm => (
                      <Badge 
                        key={perm}
                        className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Offer Permissions */}
              {permissionCategories.offer.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-secondary-600" />
                    Offer Management
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissionCategories.offer.map(perm => (
                      <Badge 
                        key={perm}
                        className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Qualification Permissions */}
              {permissionCategories.qualification.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-700 flex items-center">
                    <FileText className="w-4 h-4 mr-2 text-secondary-600" />
                    Qualification Management
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissionCategories.qualification.map(perm => (
                      <Badge 
                        key={perm}
                        className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Admin Permissions */}
              {permissionCategories.admin.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-700 flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-secondary-600" />
                    Admin Access
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissionCategories.admin.map(perm => (
                      <Badge 
                        key={perm}
                        className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Other Permissions */}
              {permissionCategories.other.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-text-700 flex items-center">
                    <Key className="w-4 h-4 mr-2 text-secondary-600" />
                    Other Permissions
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {permissionCategories.other.map(perm => (
                      <Badge 
                        key={perm}
                        className="bg-secondary-50 text-secondary-700 hover:bg-secondary-100"
                      >
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* No Permissions */}
              {userPermissions.length === 0 && (
                <div className="col-span-2 text-center py-4">
                  <p className="text-text-400 italic">No permissions assigned</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="bg-background-50 py-4 border-t text-sm text-text-500">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span>User ID: {user.sub}</span>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

// Loading skeleton 
const ProfileSkeleton = () => (
  <div className="container max-w-4xl mx-auto py-8 px-4">
    <Card className="w-full shadow-lg overflow-hidden">
      <div className="h-40 bg-gradient-to-r from-gray-200 to-gray-300"></div>
      <div className="px-6 pb-4 pt-4 flex flex-col md:flex-row md:items-end gap-4">
        <Skeleton className="h-24 w-24 rounded-full mt-[-3rem] border-4 border-white" />
        <div className="flex-1">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64 mb-1" />
        </div>
        <Skeleton className="h-10 w-28 mt-2 md:mt-0" />
      </div>
      
      <Separator />
      
      <CardContent className="px-6 py-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="space-y-5">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </div>
        <Skeleton className="h-40 w-full mt-8" />
      </CardContent>
      
      <CardFooter className="bg-gray-50 py-4 border-t">
        <Skeleton className="h-4 w-48" />
      </CardFooter>
    </Card>
  </div>
);

export default Profile;