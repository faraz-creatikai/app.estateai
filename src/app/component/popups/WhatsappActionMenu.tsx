import React from 'react';
import PopupMenu from './PopupMenu';

interface WhatsAppActionMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: () => void;
  onSelectProperties: () => void;
  onSelectDirect: () => void;
}

const WhatsAppIcon = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg
    className={`block ${className}`}
    viewBox="-3 -3 30 30"
    fill="none"
    style={{ filter: 'drop-shadow(0 2px 5px rgba(0,0,0,0.18))' }}
  >
    {/* Bubble with white outline ring */}
    <path
      fill="#25D366"
      stroke="#FFFFFF"
      strokeWidth="4"
      strokeLinejoin="round"
      strokeLinecap="round"
      style={{ paintOrder: 'stroke fill' }}
      d="M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.36.101 11.943c0 2.11.549 4.166 1.595 5.986L0 24l6.335-1.652a11.882 11.882 0 0 0 5.71 1.442h.006c6.582 0 11.94-5.36 11.943-11.943a11.87 11.87 0 0 0-3.474-8.398"
    />
    {/* Phone handset */}
    <path
      fill="#FFFFFF"
      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347"
    />
  </svg>
);

const WhatsAppActionMenu: React.FC<WhatsAppActionMenuProps> = ({ 
  isOpen, 
  onClose, 
  onSelectTemplate, 
  onSelectProperties,
  onSelectDirect
}) => {
  return (
    <PopupMenu isOpen={isOpen} onClose={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-xl p-6 w-[90%] max-w-sm" 
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside from closing the popup
      >
        <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-2 relative">
    {/* Icon badge */}
<WhatsAppIcon className="w-9 h-9 " />
    
          <h3 className="text-lg font-bold text-gray-900">WhatsApp Action</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 cursor-pointer hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full p-1.5 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <p className="text-[13px] text-gray-500 mb-5">
          What type of message would you like to send to this customer?
        </p>

        <div className="flex flex-col gap-3">
          {/* Option 1: Send Template */}
          <button
            onClick={() => {
              onSelectTemplate();
              onClose();
            }}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[var(--color-primary)] hover:bg-blue-50 transition-all text-left group cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100/50 text-[varnn(--color-primary)] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">
                Send Template
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Standard text, images, location, or polls
              </div>
            </div>
          </button>

          {/* Option 2: Send Properties */}
          <button
            onClick={() => {
              onSelectProperties();
              onClose();
            }}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[var(--color-primary)] hover:bg-blue-50 transition-all text-left group cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100/50 text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">
                Send Properties
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Forward property listings and layout plans
              </div>
            </div>
          </button>

          {/* Option 3: Direct Message */}
          <button
            onClick={() => {
              onSelectDirect(); // Add this to your props!
              onClose();
            }}
            className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 hover:border-[var(--color-primary)] hover:bg-blue-50 transition-all text-left group cursor-pointer shadow-sm"
          >
            <div className="w-10 h-10 rounded-full bg-blue-100/50 text-[var(--color-primary)] flex items-center justify-center shrink-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <div className="text-[14px] font-bold text-gray-800 group-hover:text-[var(--color-primary)] transition-colors">
                Direct Message
              </div>
              <div className="text-[11px] text-gray-500 mt-0.5">
                Type a custom message with direct attachments
              </div>
            </div>
          </button>
        </div>
      </div>
    </PopupMenu>
  );
};

export default WhatsAppActionMenu;