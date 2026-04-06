'use client';

import React from 'react';
import PopupMenu from './PopupMenu';

interface GoogleMapDialogProps {
  isOpen: boolean;
  address: string | null;
  onClose: () => void;
}

const GoogleMapDialog: React.FC<GoogleMapDialogProps> = ({
  isOpen,
  address,
  onClose,
}) => {
  if (!isOpen || !address) return null;

  const encodedAddress = encodeURIComponent(address);

  return (
    <PopupMenu isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col bg-white rounded-xl m-[0.5px] shadow-lg p-4 w-full h-full max-w-[1000px] max-h-[600px] ">

        {/* Header */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-semibold text-lg">Customer Location</h2>
          <button
            onClick={onClose}
            className="text-red-600 hover:bg-gray-200 px-3 py-1 rounded-md"
          >
            Close
          </button>
        </div>

        {/* Google Map */}
        <iframe
          width="100%"
          height="100%"
          style={{ border: 0, borderRadius: '12px' }}
          loading="lazy"
          allowFullScreen
          src={`https://www.google.com/maps?q=${encodedAddress}&output=embed`}
        />
      </div>
    </PopupMenu>
  );
};

export default GoogleMapDialog;
