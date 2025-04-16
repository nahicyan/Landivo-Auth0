"use client";

import React from "react";
import { useAuth } from "@/components/hooks/useAuth";

export default function UserSubmit() {
  // Use the same authentication hook that Header and Profile use
  const { user, isLoading } = useAuth();

  // Get user display name 
  const getUserDisplayName = () => {
    if (!user) return "Not logged in";
    
    // Check for firstName and lastName from user profile
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    }
    
    // Check for name (from Auth0)
    if (user.name) {
      return user.name;
    }
    
    // Check for nickname
    if (user.nickname) {
      return user.nickname;
    }
    
    // Fallback to email
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