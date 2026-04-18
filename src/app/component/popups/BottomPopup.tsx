'use client';
import React, { MouseEvent, ReactNode, useEffect, useState } from 'react';

interface PopupRenderProps {
  isMaximized: boolean;
  toggleMaximize: () => void;
}

interface PopupMenuProps {
  children: ReactNode | ((props: PopupRenderProps) => ReactNode);
  onClose?: () => void;
  isOpen?: boolean;
}

const BottomPopup: React.FC<PopupMenuProps> = ({
  children,
  onClose,
  isOpen = false,
}) => {
  const [isMaximized, setIsMaximized] = useState(false);

  const toggleMaximize = () => setIsMaximized((prev) => !prev);

  // Reset maximized state when popup closes
  useEffect(() => {
    if (!isOpen) setIsMaximized(false);
    const html = document.documentElement;
    const body = document.body;

    if (isOpen) {
      html.style.overflow = 'hidden';
      body.style.overflow = 'hidden';
    } else {
      html.style.overflow = '';
      body.style.overflow = '';
    }

    return () => {
      html.style.overflow = '';
      body.style.overflow = '';
    };
  }, [isOpen]);

  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose?.();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };
    if (isOpen) window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <div
      className={`fixed inset-0 flex flex-col items-center justify-center transition-all duration-300 ${isMaximized ? 'p-0' : 'py-2 px-1'
        } ${isOpen ? 'visible' : 'invisible'}`}
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
        className={`relative bg-white shadow-2xl transition-all duration-300 ease-out ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'
          } ${isMaximized
            ? 'w-full h-full max-w-none rounded-none'
            : 'h-full rounded-xl w-full max-w-[1210px] mx-1'
          }`}
        onClick={(e) => e.stopPropagation()}
      >
        {typeof children === 'function'
          ? children({ isMaximized, toggleMaximize })
          : children}
      </div>
    </div>
  );
};

export default BottomPopup;