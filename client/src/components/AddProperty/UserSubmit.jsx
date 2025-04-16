import React from "react";
import { useAuth } from "@/components/hooks/useAuth";

export default function UserSubmit() {
  const { user } = useAuth();

  // Get display name based on available information
  const displayName = user ? 
    (user.firstName && user.lastName ? 
      `${user.firstName} ${user.lastName}` : 
      user.email) : 
    "Not logged in";

  return (
    <div className="bg-[#f0f0f0] p-4 rounded-[12px] border border-[rgba(200,200,200,0.6)]">
      <p className="text-base font-semibold text-[#333]">
        You are uploading as:{" "}
        {user ? (
          <span className="font-bold text-[#000]">{displayName}</span>
        ) : (
          <span className="text-red-600">Not logged in</span>
        )}
      </p>
    </div>
  );
}