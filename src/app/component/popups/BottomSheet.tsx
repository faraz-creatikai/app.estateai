'use client';
import React, { MouseEvent, ReactNode, useEffect } from 'react';

interface BottomSheetProps {
  children: ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
}

const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  onClose,
  isOpen = false,
}) => {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  // Escape close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 flex items-end justify-center transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible'
      }`}
      style={{
        zIndex: 9999,
        backgroundColor: isOpen ? 'rgba(15,23,42,0.22)' : 'transparent',
        backdropFilter: isOpen ? 'blur(2px)' : 'none',
        transition: 'background-color 0.3s, backdrop-filter 0.3s',
      }}
      onClick={handleBackdropClick}
    >
      {/* Sheet */}
      <div
        className={`relative w-full max-w-2xl mx-auto transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Centered Content Wrapper */}
        <div className="min-h-[40vh] max-h-[90vh] flex items-center justify-center">
          
          {/* Actual Content */}
          <div className="bg-white w-full rounded-2xl shadow-2xl p-6 overflow-y-auto max-h-[80vh]">
            
            {/* Optional drag handle */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-4" />
            
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomSheet;