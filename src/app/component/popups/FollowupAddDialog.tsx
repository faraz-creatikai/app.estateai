'use client';

import React, { useState, useEffect } from "react";
import PopupMenu from "./PopupMenu";
import { IoMdClose } from "react-icons/io";
import DateSelector from "@/app/component/DateSelector";
import SingleSelect from "@/app/component/SingleSelect";
import SaveButton from "@/app/component/buttons/SaveButton";
import { addCustomerFollowup } from "@/store/customerFollowups";
import { getStatusType } from "@/store/masters/statustype/statustype";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import TextareaField from "../datafields/TextareaField";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
}

interface ErrorInterface {
  [key: string]: string;
}

const FollowupAddDialog = ({ isOpen, onClose, customerId }: Props) => {
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<ErrorInterface>({});

  const [formData, setFormData] = useState({
    StartDate: dayjs().format("YYYY-MM-DD"),
    StatusType: "",
    FollowupNextDate: "",
    Description: "",
  });

  useEffect(() => {
    if (isOpen) {
      fetchFields();
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
    if (!formData.FollowupNextDate)
      newErrors.FollowupNextDate = "Next Date is required";
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

    const payload = {
      ...formData,
      customer: customerId as string,
    };

    const data = await addCustomerFollowup(customerId as string, payload);

    if (data) {
      toast.success("Followup Added Successfully!");
      onClose();
    } else {
      toast.error("Failed to add Followup");
    }
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

          <TextareaField
            name="Description"
            label="Description"
            value={formData.Description}
            onChange={(e) => handleChange("Description", e.target.value)}
            error={errors.Description}
          />

          <div className="flex justify-end pt-4">
            <SaveButton text="Save" onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </PopupMenu>
  );
};

export default FollowupAddDialog;
