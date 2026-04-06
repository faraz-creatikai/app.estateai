'use client';
import React, { MouseEvent, ReactNode, useEffect } from 'react';

interface PopupMenuProps {
  children: ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
}

const BottomPopup: React.FC<PopupMenuProps> = ({
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
      className={`fixed inset-0 flex flex-col items-center justify-center py-2 px-1 transition-all duration-300 ${
        isOpen ? 'visible' : 'invisible'
      }`}
      style={{
        zIndex: 9999,
        height: '100dvh',
        backgroundColor: isOpen ? 'rgba(15,23,42,0.22)' : 'transparent',
        backdropFilter: isOpen ? 'blur(2px)' : 'none',
        transition: 'background-color 0.3s, backdrop-filter 0.3s',
      }}
      onClick={handleBackdropClick}
    >
      {/* POPUP */}
      <div
        className={`relative bg-white shadow-2xl h-full rounded-xl w-full max-w-[1200px] mx-1 transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
        }`}
      
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

export default BottomPopup;