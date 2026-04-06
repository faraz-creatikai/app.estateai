'use client';

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { contacttypeAllDataInterface } from "@/store/masters/contacttype/contacttype.interface";
import { addContactType } from "@/store/masters/contacttype/contacttype";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import { getCampaign } from "@/store/masters/campaign/campaign";
import ObjectSelect from "@/app/component/ObjectSelect";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
import { getContactCampaign } from "@/store/masters/contactcampaign/contactcampaign";

interface ErrorInterface {
  [key: string]: string;
}

export default function ContactTypeAdd() {
  const [contactTypeData, setContactTypeData] = useState<contacttypeAllDataInterface>({
    Campaign: "",
    Name: "",
    Status: "",
  });

  const [errors, setErrors] = useState<ErrorInterface>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const router = useRouter();

  useEffect(() => {
    fetchFields();
  }, [])

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setContactTypeData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleSelectChange = useCallback((label: string, selected: string) => {
    setContactTypeData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!contactTypeData.Name.trim()) newErrors.Name = "Contact Type Name is required";
    if (!contactTypeData.Status.trim()) newErrors.Status = "Status is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }


    const result = await addContactType(contactTypeData);
    if (result) {
      toast.success("Contact Type added successfully!");
      router.push("/masters/contact-type");
      return;
    }

    toast.error("Failed to add contact type");


  };

  const fetchFields = async () => {
    await handleFieldOptionsObject(
      [
        { key: "Status", staticData: ["Active", "Inactive"] },
        { key: "Campaign", fetchFn: getContactCampaign },
      ],
      setFieldOptions
    );
  };

  const statusOptions = ["Active", "Inactive"];

  return (
    <MasterProtectedRoute>
    <div className="bg-slate-200 min-h-screen p-6 flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        {/* Back Button */}
        <div className="flex justify-end mb-4">

          <BackButton
            url="/masters/contact-type"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl">
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <div className="mb-8 text-left border-b pb-4 border-gray-200">
              <h1 className="text-3xl font-extrabold text-gray-800 leading-tight tracking-tight">
                Add <span className="text-[var(--color-primary)]">Contact Type</span>
              </h1>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                {/* Campaign Options */}
                <ObjectSelect
                  options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                  label="Campaign"
                  value={contactTypeData.Campaign}
                  getLabel={(item) => item?.Name || ""}
                  getId={(item) => item?._id || ""}
                  onChange={(selected) => {
                    setContactTypeData((prev) => ({ ...prev, Campaign: selected }));
                    setErrors((prev) => ({ ...prev, Campaign: "" }));
                  }}
                  error={errors.Campaign}
                />
                {/* Contact Type Name */}
                <InputField
                  label="Contact Type Name"
                  name="Name"
                  value={contactTypeData.Name}
                  onChange={handleInputChange}
                  error={errors.Name}
                />

                {/* Status Dropdown */}
                <SingleSelect
                  options={statusOptions}
                  label="Status"
                  value={contactTypeData.Status}
                  onChange={(v) => handleSelectChange("Status", v)}
                />
              </div>

              {/* Save Button */}
              <div className="flex justify-end mt-4">

                <SaveButton text="Save" onClick={handleSubmit} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </MasterProtectedRoute>
  );
}

// 🟩 Reusable Input Field
const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ label, name, value, onChange, error }) => (
  <label className="relative block w-full">
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      className={`peer w-full border rounded-sm bg-transparent py-3 px-4 outline-none 
        ${error ? "border-red-500 focus:border-red-500" : "border-gray-400 focus:border-blue-500"}`}
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
