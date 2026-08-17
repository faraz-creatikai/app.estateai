'use client';

import React, { useState, useEffect } from "react";
import PopupMenu from "./PopupMenu";
import { IoMdClose } from "react-icons/io";
import DateSelector from "@/app/component/DateSelector";
import SingleSelect from "@/app/component/SingleSelect";
import SaveButton from "@/app/component/buttons/SaveButton";
import { addCustomerFollowup } from "@/store/customerFollowups";
import { archieveCustomer } from "@/store/customer";
import { getStatusType } from "@/store/masters/statustype/statustype";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import TextareaField from "../datafields/TextareaField";
import VoiceToText from "../VoiceToText";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  onArchived?: (id: string) => void; // lets parent remove this customer from its local list
}

interface ErrorInterface {
  [key: string]: string;
}

const FollowupAddDialog = ({ isOpen, onClose, customerId, onArchived }: Props) => {
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<ErrorInterface>({});
  const [archiveOnSave, setArchiveOnSave] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    StartDate: dayjs().format("YYYY-MM-DD"),
    StatusType: "",
    FollowupNextDate: "",
    Description: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchFields();
    } else {
      // reset toggle each time dialog closes so it never carries over to the next customer
      setArchiveOnSave(false);
    }
  }, [isOpen]);

  const fetchFields = async () => {
    await handleFieldOptions(
      [{ key: "StatusType", fetchFn: getStatusType }],
      setFieldOptions
    );
  };

  const handleChange = (key: string, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const newErrors: ErrorInterface = {};
    if (!formData.StartDate) newErrors.StartDate = "Start Date is required";
    if (!formData.StatusType) newErrors.StatusType = "Status is required";
    /*  if (!formData.FollowupNextDate)
       newErrors.FollowupNextDate = "Next Date is required"; */
    if (!formData.Description)
      newErrors.Description = "Description is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validate();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);

    const payload = {
      ...formData,
      customer: customerId as string,
    };

    const data = await addCustomerFollowup(customerId as string, payload);

    if (!data) {
      toast.error("Failed to add Followup");
      setSaving(false);
      return;
    }

    toast.success("Followup Added Successfully!");

    if (archiveOnSave && customerId) {
      const archiveRes = await archieveCustomer(customerId);
      if (archiveRes?.success) {
        toast.success("Customer archived");
        onArchived?.(customerId);
      } else {
        toast.error("Followup saved, but archiving failed");
      }
    }

    setSaving(false);
    onClose();
  };


  if (!isOpen) return null;

  return (
    <PopupMenu isOpen={isOpen} onClose={onClose}>
      <div className="relative w-[600px] max-w-full bg-white max-sm:dark:bg-[var(--color-childbgdark)] rounded-3xl shadow-2xl p-8 max-md:p-4 animate-fadeIn">

        {/* Header */}
        <div className="flex justify-between items-center max-md:px-4 border-b pb-4 mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-secondary-darker)] max-sm:dark:text-[var(--color-primary)]">
            Add <span className="text-[var(--color-primary)]">Followup</span>
          </h2>

          <button
            onClick={onClose}
            className="text-3xl -mt-2 -mr-6 p-2 rounded-md hover:bg-[var(--color-primary)] hover:text-white max-sm:dark:text-white transition-all"
          >
            <IoMdClose />
          </button>
        </div>

        {/* Form */}
        <div className="flex flex-col gap-5">
          <div className=" max-sm:dark:text-white">
            <DateSelector
              label="Start Date"
              value={formData.StartDate}
              onChange={(val) => handleChange("StartDate", val)}
            />
          </div>


          <SingleSelect
            options={Array.isArray(fieldOptions?.StatusType) ? fieldOptions.StatusType : []}
            label="Status Type"
            value={formData.StatusType}
            onChange={(val) => handleChange("StatusType", val)}
          />

          <DateSelector
            label="Followup Next Date"
            value={formData.FollowupNextDate}
            onChange={(val) => handleChange("FollowupNextDate", val)}
          />

          <div className="relative">
            <TextareaField
              name="Description"
              label="Description"
              value={formData.Description}
              onChange={(e) => handleChange("Description", e.target.value)}
              error={errors.Description}
            />

            {/* 🎤 Voice button */}
            <div className="absolute top-2 right-2">
              <VoiceToText
                value={formData.Description}
                onChange={(text) => handleChange("Description", text)}
              />
            </div>
          </div>

          {/* Archive on save */}
          <button
            type="button"
            onClick={() => setArchiveOnSave((prev) => !prev)}
            className={`flex cursor-pointer items-center gap-3 w-full text-left px-4 py-3 rounded-2xl border transition-all ${archiveOnSave
                ? "border-[var(--color-primary)] bg-[var(--color-primary-lighter)]"
                : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
          >
            <span
              className={`shrink-0 w-5 h-5 rounded-md flex items-center justify-center border-2 transition-all ${archiveOnSave
                  ? "bg-[var(--color-primary)] border-[var(--color-primary)]"
                  : "bg-white border-gray-300"
                }`}
            >
              {archiveOnSave && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6 9 17l-5-5" />
                </svg>
              )}
            </span>
            <span className="flex-1">
              <span className={`block text-sm font-semibold ${archiveOnSave ? "text-[var(--color-primary)]" : "text-gray-700"}`}>
                Also archive this customer
              </span>
              <span className="block text-xs text-gray-400 mt-0.5">
                Removes it from your active list only — you can restore it anytime
              </span>
            </span>
          </button>

          <div className="flex justify-end pt-4">
            <SaveButton text={saving ? "Saving..." : "Save"} onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </PopupMenu>
  );
};

export default FollowupAddDialog;