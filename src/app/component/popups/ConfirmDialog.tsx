'use client';
import React from 'react';
import PopupMenu from './PopupMenu';

export interface ConfirmDialogData {
  [key: string]: any;
}

interface ConfirmDialogProps<T extends ConfirmDialogData> {
  isOpen: boolean;
  title?: string;
  description?: string;
  data: T | null;
  onClose: () => void;
  onConfirm: (data: T) => void;
  /** Optional — allows mapping keys to user-friendly labels */
  fieldLabels?: Record<keyof T, string>;
  confirmLabel?:string;
}

const ConfirmDialog = <T extends ConfirmDialogData>({
  isOpen,
  title = 'Are you sure you want to Accept this request?',
  description,
  data,
  onClose,
  onConfirm,
  fieldLabels,
  confirmLabel="Yes"
}: ConfirmDialogProps<T>) => {
  if (!isOpen || !data) return null;

  return (
    <PopupMenu onClose={onClose} isOpen={isOpen}>
      <div className="flex flex-col border border-gray-300/30 bg-gray-100 text-[var(--color-secondary-darker)] rounded-xl shadow-lg p-6 max-w-[800px] gap-8 m-2">
        {/* Title */}
        <h2 className="font-bold text-lg text-[var(--color-secondary-darker)]">{title}</h2>

        {/* Optional description */}
        {description && <p className="text-gray-600 text-sm">{description}</p>}

        {/* Dynamic key/value pairs */}
        <div className="flex flex-col gap-2">
          {Object.entries(data) .filter(([key]) => (key !== 'id' )).filter(([key])=>(key!=="isFavourite")).map(([key, value]) => {
            const label =
              fieldLabels && fieldLabels[key as keyof T]
                ? fieldLabels[key as keyof T]
                : key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
            return (
              <div key={key} className="flex items-center gap-2">
                <span className="font-semibold">{label}:</span>
                <span className="text-gray-700 text-sm">
                  {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Buttons */}
        <div className="flex justify-between items-center pt-4">
          <button
            className="text-[var(--color-primary)] bg-[var(--color-primary-lighter)] hover:bg-[var(--color-primary-light)] cursor-pointer rounded-md px-4 py-2"
            onClick={() => onConfirm(data)}
          >
            {confirmLabel}
          </button>
          <button
            className="cursor-pointer text-[#C62828] bg-[#FDECEA] hover:bg-red-200/60 rounded-md px-4 py-2"
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </PopupMenu>
  );
};

export default ConfirmDialog;
