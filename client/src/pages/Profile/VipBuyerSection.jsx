// client/src/pages/Profile/VipBuyerSection.jsx
import React from 'react';
import { useVipBuyer } from '@/utils/VipBuyerContext';
import { StarIcon } from '@heroicons/react/24/solid';

const VipBuyerSection = () => {
  const { isVipBuyer, vipBuyerData, isLoading: vipStatusLoading } = useVipBuyer();

  // Don't render anything if not a VIP buyer and not loading VIP status
  if (!isVipBuyer && !vipStatusLoading) {
    return null;
  }

  if (vipStatusLoading) {
    return (
      <div className="mt-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  // Only show the VIP section if the user is a VIP buyer
  if (isVipBuyer) {
    return (
      <div className="mt-6">
        <div className="bg-accent-50 border border-accent rounded-md px-4 py-3 flex items-center">
          <StarIcon className="h-5 w-5 text-accent mr-2" />
          <div>
            <p className="text-accent-700 font-semibold">VIP Buyer</p>
            <p className="text-sm text-secondary-600">
              Preferred areas: {vipBuyerData?.preferredAreas?.join(', ') || 'N/A'}
            </p>
            {vipBuyerData?.buyerType && (
              <p className="text-sm text-secondary-600">
                Buyer type: {vipBuyerData.buyerType}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default VipBuyerSection;