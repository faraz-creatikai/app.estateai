'use client'

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import DateSelector from "@/app/component/DateSelector";
import {
  getFollowupByCustomerId,
  getFollowupByFollowupId,
  updateCustomerFollowup,
} from "@/store/customerFollowups";
import { customerFollowupAllDataInterface } from "@/store/customerFollowups.interface";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getStatusType } from "@/store/masters/statustype/statustype";

interface ErrorInterface {
  [key: string]: string;
}

export default function CustomerFollowupEdit() {
  const { id } = useParams();
  const router = useRouter();

  const [followupData, setFollowupData] = useState<customerFollowupAllDataInterface>({
    customer: "",
    StartDate: "",
    StatusType: "",
    FollowupNextDate: "",
    Description: "",
  });

  const [errors, setErrors] = useState<ErrorInterface>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});

  // Fetch existing followup data
  useEffect(() => {
    const fetchFollowup = async () => {
      const data = await getFollowupByFollowupId(id as string);
      console.log("something ", data)
      if (data) {
        setFollowupData({
          customer: data.customer,
          StartDate: data.StartDate,
          StatusType: data.StatusType,
          FollowupNextDate: data.FollowupNextDate,
          Description: data.Description
        });
      } else {
        toast.error("No followup found for this customer!");
      }
    };
    if (id) {
      fetchFollowup();
      fetchFields();
    }
  }, [id]);

  // Handlers
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFollowupData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleSelectChange = useCallback(
    (label: string, selected: string) => {
      setFollowupData((prev) => ({ ...prev, [label]: selected }));
      setErrors((prev) => ({ ...prev, [label]: "" }));
    },
    []
  );

  // Validation
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!followupData.StartDate.trim()) newErrors.StartDate = "Start Date is required";
    if (!followupData.StatusType.trim()) newErrors.StatusType = "Status Type is required";
    if (!followupData.FollowupNextDate.trim())
      newErrors.FollowupNextDate = "Followup Next Date is required";
    if (!followupData.Description.trim())
      newErrors.Description = "Description is required";
    return newErrors;
  };

  // Submit
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = { ...followupData };
    if (followupData.StartDate === "") delete (payload as any).StartDate;

    const data = await updateCustomerFollowup(id as string, payload);
    if (data) {
      toast.success("Customer Followup updated successfully!");
      router.push("/followups/customer");
      return;
    }

    toast.error("Failed to update followup!");
  };

  const statusOptions = ["Active","Inactive"];
    const fetchFields = async () => {
      await handleFieldOptions(
        [
          { key: "StatusType", fetchFn:getStatusType },
        ],
        setFieldOptions
      );
    }

  return (
    <div className=" min-h-screen flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-[900px]">
        {/* Back Button */}
        <div className="flex justify-end mb-4">
          <BackButton
            url="/followups/customer"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        {/* Form */}
        <div className="bg-white/90 backdrop-blur-lg p-10 max-sm:px-5 rounded-3xl shadow-2xl h-auto">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-8 text-left border-b pb-4 border-gray-200 max-sm:dark:border-gray-700">
              <h1 className="text-3xl max-sm:text-2xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                Edit <span className="text-[var(--color-primary)]">Customer Followup</span>
              </h1>
            </div>

            <div className="flex flex-col space-y-10">
              {/* Customer Followup Section */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Followup Information
                </h2>

                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                  <DateSelector
                    label="Start Date"
                    value={followupData.StartDate}
                    onChange={(val) => handleSelectChange("StartDate", val)}
                  />

                  <SingleSelect
                    options={Array.isArray(fieldOptions?.StatusType) ? fieldOptions.StatusType : []}
                    label="Status Type"
                    value={followupData.StatusType}
                    onChange={(selected) => handleSelectChange("StatusType", selected)}
                  />

                  <DateSelector
                    label="Followup Next Date"
                    value={followupData.FollowupNextDate}
                    onChange={(val) => handleSelectChange("FollowupNextDate", val)}
                  />

                  <TextAreaField
                    label="Description"
                    name="Description"
                    value={followupData.Description}
                    onChange={handleInputChange}
                    error={errors.Description}
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6 max-sm:mt-0">
               
                <SaveButton text="Save Changes" onClick={handleSubmit} />

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// TextAreaField
const TextAreaField: React.FC<{
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, name, value, onChange, error }) => (
  <label className="relative block w-full">
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      rows={4}
      className={`peer w-full border rounded-sm bg-transparent py-3 px-4 outline-none resize-none 
        ${error
          ? "border-red-500 focus:border-red-500"
          : "border-gray-400 focus:border-blue-500"
        }`}
    />
    <p
      className={`absolute left-2 bg-white px-1 text-gray-500 text-sm transition-all duration-300
      ${value || error
          ? "-top-2 text-xs text-blue-500"
          : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"
        }`}
    >
      {label}
    </p>
    {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
  </label>
);
