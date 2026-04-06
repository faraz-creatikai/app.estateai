"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { locationAllDataInterface } from "@/store/masters/location/location.interface";
import { addLocation } from "@/store/masters/location/location";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import { getCity } from "@/store/masters/city/city";
import ObjectSelect from "@/app/component/ObjectSelect";

interface ErrorInterface {
  [key: string]: string;
}

export default function LocationAdd() {
  const [locationData, setLocationData] = useState<locationAllDataInterface>(() => ({
    Name: "" as string,
    Status: "" as string,
    City: "" as string,
  }));
  ;

  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});

  const [errors, setErrors] = useState<ErrorInterface>({});
  const router = useRouter();

  useEffect(() => {
    fetchFields();
  }, [])

  // Handle text input changes
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setLocationData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // Handle dropdown changes
  const handleSelectChange = useCallback((label: string, selected: string) => {
    setLocationData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  // Validate form fields
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!locationData.Name.trim()) newErrors.Name = "Location Name is required";
    if (!locationData.City.trim()) newErrors.City = "City is required";
    if (!locationData.Status.trim()) newErrors.Status = "Status is required";
    return newErrors;
  };

  // Handle form submit
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await addLocation(locationData);
      if (result) {
        toast.success("Location added successfully!");
        router.push("/masters/locations");
      }
    } catch (error) {
      toast.error("Failed to add location");
      console.error("Location Add Error:", error);
    }
  };

  const fetchFields = async () => {
    await handleFieldOptionsObject(
      [
        { key: "Status", staticData: ["Active", "Inactive"] },
        { key: "City", fetchFn: getCity },
      ],
      setFieldOptions
    );
  };

  const statusOptions = ["Active", "Inactive"];

  return (
    <MasterProtectedRoute>
      <div className=" min-h-screen flex justify-center">
        <Toaster position="top-right" />
        <div className="w-full">
          {/* Back Button */}
          <div className="flex justify-end mb-4">

            <BackButton
              url="/masters/locations"
              text="Back"
              icon={<ArrowLeft size={18} />}
            />
          </div>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl">
            <form onSubmit={(e) => e.preventDefault()} className="w-full">
              <div className="mb-8 text-left border-b pb-4 border-gray-200">
                <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                  Add <span className="text-[var(--color-primary)]">Location</span>
                </h1>
              </div>

              <div className="flex flex-col space-y-6">
                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                  {/* Location Name */}
                  <InputField
                    label="Location Name"
                    name="Name"
                    value={locationData.Name}
                    onChange={handleInputChange}
                    error={errors.Name}
                  />

                  {/* City Name */}
                  <ObjectSelect
                    options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                    label="City"
                    value={locationData.City}
                    getLabel={(item) => item?.Name || ""}
                    getId={(item) => item?._id || ""}
                    onChange={(selected) => {
                      setLocationData((prev) => ({ ...prev, City: selected }));
                      setErrors((prev) => ({ ...prev, City: "" }));
                    }}
                    error={errors.City}
                  />

                  {/* Status Dropdown */}
                  <SingleSelect
                    options={statusOptions}
                    label="Status"
                    value={locationData.Status}
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
