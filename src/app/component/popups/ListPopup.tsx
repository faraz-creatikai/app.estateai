"use client";

import React from "react";
import PopupMenu from "./PopupMenu";

interface ListItem {
  _id: string;
  name: string;
  body?: string;
}

interface ListPopupProps {
  title: string;
  list: ListItem[];
  selected: string | string[] | undefined;   // ✅ allow undefined
  onSelect: (id: string) => void;
  onSubmit: () => void;
  submitLabel: string;
  onClose: () => void;
  multiSelect?: boolean;
  children?: React.ReactNode;
}


export default function ListPopup({
  title,
  list,
  selected,
  onSelect,
  onSubmit,
  submitLabel,
  onClose,
  multiSelect,
  children,
}: ListPopupProps) {
  return (
    <PopupMenu onClose={onClose}>
      <div className="flex flex-col gap-8 py-6 px-2 m-2 bg-white w-full max-w-[400px] rounded-md">

        <h2 className="text-2xl text-[var(--color-secondary-darker)] px-6 font-extrabold">
          {title.split(" ")[0]}{" "}
          <span className="text-[var(--color-primary)]">
            {title.split(" ").slice(1).join(" ")}
          </span>
        </h2>
        {children}
        <div className="max-h-[40vh] flex flex-col gap-2 overflow-y-auto">
          {list.length > 0 ? (
            list.map((item) => (
              <div key={item._id}>
                <label className="flex justify-between gap-2 cursor-pointer px-6 py-2 hover:bg-gray-100">
                  <div className=" flex flex-col gap-1">
                    <div>{item.name}</div>
                    <div className=" text-xs text-gray-500 truncate max-w-[200px]">{item?.body}</div>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      multiSelect
                        ? (Array.isArray(selected) ? selected.includes(item._id) : false) // multi-select
                        : selected === item._id // single-select
                    }
                    onChange={() => onSelect(item._id)}
                  />

                </label>
              </div>
            ))
          ) : (
            <div className="flex justify-center items-center py-2 px-4 text-gray-400">
              No items available at the moment
            </div>
          )}
        </div>

        <div className="flex justify-between px-6 items-center">
          <button
            className="text-[var(--color-primary)] bg-[var(--color-primary-lighter)] hover:bg-[var(--color-primary-light)] cursor-pointer rounded-md px-4 py-2"
            onClick={onSubmit}
          >
            {submitLabel}
          </button>

          <button
            className="cursor-pointer text-[#C62828] bg-[#FDECEA] hover:bg-red-200/60 rounded-md px-4 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </PopupMenu>
  );
}
