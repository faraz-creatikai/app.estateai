'use client';
import React from 'react';
import PopupMenu from './PopupMenu';

export interface DeleteDialogData {
  [key: string]: any;
}

interface FavouriteDialogProps<T extends DeleteDialogData> {
  isOpen: boolean;
  title?: string;
  description?: string;
  data: T | null;
  onClose: () => void;
  onDelete: (data: T) => void;
  /** Optional — allows mapping keys to user-friendly labels */
  fieldLabels?: Record<keyof T, string>;
}

const FavouriteDialog = <T extends DeleteDialogData>({
  isOpen,
  title = 'Are you sure you want to delete this item?',
  description,
  data,
  onClose,
  onDelete,
  fieldLabels,
}: FavouriteDialogProps<T>) => {
  if (!isOpen || !data) return null;

  return (
    <PopupMenu onClose={onClose} isOpen={isOpen}>
      <div className="flex flex-col border border-gray-300/30 bg-gray-100 text-[var(--color-secondary-darker)] rounded-xl shadow-lg p-6 max-w-[600px] gap-8 m-2">
        {/* Title */}
        <h2 className="font-bold text-lg ">{title}</h2>

        {/* Optional description */}
        {description && <p className="text-gray-600 text-sm">{description}</p>}

        {/* Dynamic key/value pairs */}
        <div className="flex flex-col gap-2">
          {Object.entries(data) .filter(([key]) => key !== 'id').map(([key, value]) => {
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
            className="text-[#C62828] bg-[#FDECEA] hover:bg-[#F9D0C4] cursor-pointer rounded-md px-4 py-2"
            onClick={() => onDelete(data)}
          >
            Yes
          </button>
          <button
            className="cursor-pointer text-blue-800 hover:bg-gray-200 rounded-md px-4 py-2"
            onClick={onClose}
          >
            No
          </button>
        </div>
      </div>
    </PopupMenu>
  );
};

export default FavouriteDialog;
