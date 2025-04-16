// client/src/pages/Profile/VipBuyerSection.jsx
import React from 'react';
import { useVipBuyer } from '@/utils/VipBuyerContext';
import { StarIcon } from '@heroicons/react/24/solid';

const VipBuyerSection = () => {
  const { isVipBuyer, vipBuyerData, isLoading: vipStatusLoading } = useVipBuyer();

  if (vipStatusLoading) {
    return (
      <div className="mt-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32"></div>
      </div>
    );
  }

  if (!isVipBuyer) {
    return null;
  }

  return (
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
  );
};

export default VipBuyerSection;