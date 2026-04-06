'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { typesAllDataInterface } from "@/store/masters/types/types.interface";
import { getTypesById, updateTypes } from "@/store/masters/types/types";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getCampaign } from "@/store/masters/campaign/campaign";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

interface ErrorInterface {
  [key: string]: string;
}

export default function CustomerTypeEdit() {
  const [typeData, setTypeData] = useState<typesAllDataInterface>({
    Campaign: "",
    Name: "",
    Status: "",
  });

  const [errors, setErrors] = useState<ErrorInterface>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});


  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setTypeData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleSelectChange = useCallback((label: string, selected: string) => {
    setTypeData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!typeData.Campaign.trim()) newErrors.Campaign = "Campaign is required";
    if (!typeData.Name.trim()) newErrors.Name = "Customer Type Name is required";
    if (!typeData.Status.trim()) newErrors.Status = "Status is required";
    return newErrors;
  };

  // Fetch existing data
  useEffect(() => {
    const fetchTypeData = async () => {
      const res = await getTypesById(id as string);
      console.log(res)
      if (res) {
        setTypeData({
          Campaign: res.Campaign?._id,
          Name: res.Name,
          Status: res.Status,
        });
      } else {
        toast.error("Failed to fetch Customer Type details");
      }
      setLoading(false);
    };
    if (id) {
      fetchFields();
      fetchTypeData();
    }
  }, [id]);

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await updateTypes(id as string, typeData);
      if (result) {
        toast.success("Customer Type updated successfully!");
        router.push("/masters/customer-types");
      }
    } catch (error) {
      toast.error("Failed to update Customer Type");
      console.error("CustomerType Update Error:", error);
    }
  };

  const fetchFields = async () => {
    await handleFieldOptionsObject(
      [
        { key: "Status", staticData: ["Active", "Inactive"] },
        { key: "Campaign", fetchFn: getCampaign },
      ],
      setFieldOptions
    );
  };

  const statusOptions = ["Active", "Inactive"];
  const campaignOptions = ["Real Estate 2025", "Campaign A", "Campaign B", "Campaign C"];
  // dummy options

  if (loading) null;
  /* return (
    <div className="flex justify-center items-center min-h-screen text-gray-700 text-lg">
      Loading...
    </div>
  ); */

  return (
    <MasterProtectedRoute>
    <div className=" min-h-screen flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        {/* Back Button */}
        <div className="flex justify-end mb-4">

          <BackButton
            url="/masters/customer-types"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl">
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <div className="mb-8 text-left border-b pb-4 border-gray-200">
              <h1 className="text-3xl font-extrabold text-gray-800 leading-tight tracking-tight">
                Edit <span className="text-[var(--color-primary)]">Customer Type</span>
              </h1>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                {/* Campaign Dropdown */}
                
                <ObjectSelect
                  options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                  label="Campaign"
                  value={typeData.Campaign}
                  getLabel={(item) => item?.Name || ""}
                  getId={(item) => item?._id || ""}
                  onChange={(selected) => {
                    setTypeData((prev) => ({ ...prev, Campaign: selected }));
                    setErrors((prev) => ({ ...prev, Campaign: "" }));
                  }}
                  error={errors.Campaign}
                />

                {/* Customer Type Name */}
                <InputField
                  label="Customer Type Name"
                  name="Name"
                  value={typeData.Name}
                  onChange={handleInputChange}
                  error={errors.Name}
                />

                {/* Status Dropdown */}
                <SingleSelect
                  options={statusOptions}
                  label="Status"
                  value={typeData.Status}
                  onChange={(v) => handleSelectChange("Status", v)}
                />
              </div>

              {/* Update Button */}
              <div className="flex justify-end mt-4">

                <SaveButton text="Update" onClick={handleSubmit} />
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
