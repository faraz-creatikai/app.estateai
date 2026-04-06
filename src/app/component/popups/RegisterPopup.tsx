'use client';
import React, { ReactNode, MouseEvent, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PopupMenuProps {
  
  onClose?: () => void;
  isOpen?: boolean; // optional prop to control visibility
}
type MarqueeProps = {
  text: string;
};

const RegisterPopup: React.FC<PopupMenuProps> = ({  onClose, isOpen = true }) => {
  const handleBackdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose?.();
    }
  };

    useEffect(() => {
    if (isOpen) {
      document.body.style.overflowY = 'hidden';
    } else {
      document.body.style.overflowY = 'auto';
    }
   

    return () => {
      document.body.style.overflowY = 'auto'; // cleanup
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          onClick={handleBackdropClick}
          className="fixed z-50 top-0 left-0 px-0.5 backdrop-blur-[0.5px] w-screen grid place-items-center  bg-[rgba(30,16,39,0.8)]"
          style={{ height: '100dvh' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
          onClick={handleBackdropClick}
            className="w-full flex justify-center items-center  text-[var(--color-primary-light)] text-2xl bg-[var(--color-secondary-darker)] max-w-[450px]  p-5 rounded-md font-semibold"
            initial={{ y: -50, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.9 }}
            transition={{ duration: .4 }}
          >
            <div className='flex flex-col justify-center items-center'>
         <p className='text-2xl text-center mb-5'> Request Sent</p>
     <div className="overflow-hidden text-center mb-4">
  <div className="animate-marquee text-[var(--color-primary-light)] text-lg font-normal">
    <p>Your request for registration has been sent successfully. Please wait for admin approval.</p>

  </div>
</div>

<button onClick={onClose}  className='text-white px-8 rounded-sm py-2 mr-3 mt-2 font-light bg-[var(--color-primary)]  text-sm'>Ok</button>
</div>

          </motion.div>
        </motion.div>
      )}

    </AnimatePresence>
  );
};

export default RegisterPopup;
