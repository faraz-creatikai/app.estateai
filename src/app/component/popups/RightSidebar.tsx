'use client';
import React, { MouseEvent, ReactNode, useEffect } from 'react';

interface PopupMenuProps {
  children: ReactNode;
  onClose?: () => void;
  isOpen?: boolean;
}

const RightSidebar: React.FC<PopupMenuProps> = ({ children, onClose, isOpen = false }) => {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 flex justify-end transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}
      style={{ zIndex: 9999, backgroundColor: isOpen ? 'rgba(15,23,42,0.22)' : 'transparent', backdropFilter: isOpen ? 'blur(2px)' : 'none', transition: 'background-color 0.3s, backdrop-filter 0.3s' }}
      onClick={handleBackdropClick}
    >
      <div
        className={`relative bg-white h-full w-full max-w-[8000px] flex flex-col overflow-hidden transition-transform duration-300 ease-out shadow-2xl ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        style={{ borderLeft: '1px solid #e8ecf0' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-sky-500 z-10" />
        {children}
      </div>
    </div>
  );
};

export default RightSidebar;