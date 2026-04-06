"use client";

import { useState, useCallback, useRef } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { builderslidersAllDataInterface } from "@/store/masters/buildersliders/buildersliders.interface";
import { addBuildersliders } from "@/store/masters/buildersliders/buildersliders";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

interface ErrorInterface {
  [key: string]: string;
}

export default function BuilderSliderAdd() {
  const [sliderData, setSliderData] = useState<builderslidersAllDataInterface>({
    Image: {} as File,
    Status: "",
  });

  const [errors, setErrors] = useState<ErrorInterface>({});
  const [preview, setPreview] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  // ✅ Handle Image Select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSliderData((prev) => ({ ...prev, Image: file }));
    setPreview(URL.createObjectURL(file));
    setErrors((prev) => ({ ...prev, Image: "" }));
  };

  // ✅ Remove Image
  const handleRemoveImage = () => {
    setSliderData((prev) => ({ ...prev, Image: {} as File }));
    setPreview("");
      if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }
  };

  // ✅ Handle Dropdown Change
  const handleSelectChange = useCallback((label: string, selected: string) => {
    setSliderData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  // ✅ Form Validation
  const validateForm = () => {
    const newErrors: ErrorInterface = {};

    if (!sliderData.Status.trim()) newErrors.Status = "Status is required";
    if (!(sliderData.Image as any).name) newErrors.Image = "Image is required";

    return newErrors;
  };

  // ✅ Submit Form
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Status", sliderData.Status);
      formData.append("Image", sliderData.Image);

      const res = await addBuildersliders(formData);

      if (res) {
        toast.success("Builder Slider added successfully!");
        router.push("/masters/builder-sliders");
      } else {
        toast.error("Failed to add slider");
      }
    } catch (err) {
      toast.error("Error while adding slider");
      console.error(err);
    }
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
            url="/masters/builder-sliders"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl">
          <div className="mb-8 border-b pb-4">
            <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)]">
              Add <span className="text-[var(--color-primary)]">Builder Slider</span>
            </h1>
          </div>

          <form onSubmit={(e) => e.preventDefault()}>

            <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">

              {/* ✅ Status Dropdown */}
              <SingleSelect
                label="Status"
                value={sliderData.Status}
                options={statusOptions}
                onChange={(v) => handleSelectChange("Status", v)}
                error={errors.Status}
              />

              {/* ✅ Image Upload */}
              <div className="flex flex-col">
                <label className="font-semibold text-gray-700 mb-2">Slider Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="border border-gray-300 rounded-md p-2"
                />

                {errors.Image && (
                  <p className="text-red-500 text-sm mt-1">{errors.Image}</p>
                )}

                {preview && (
                  <div className="relative w-fit mt-3">
                    <img
                      src={preview}
                      className="w-32 h-32 object-cover rounded-md border"
                    />
                    <button
                      onClick={handleRemoveImage}
                      type="button"
                      className="absolute -top-2 -right-2 p-1 bg-red-600 text-white rounded-full"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ✅ Save Button */}
            <div className="flex justify-end mt-6">
              
              <SaveButton text="Save" onClick={handleSubmit} />
            </div>

          </form>
        </div>
      </div>
    </div>
    </MasterProtectedRoute>
  );
}

/* ------------------------- REUSABLE COMPONENT ------------------------- */
const SingleSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  error?: string;
  onChange: (v: string) => void;
}> = ({ label, value, options, error, onChange }) => (
  <div className="flex flex-col w-full">
    <label className="text-gray-700 font-semibold mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`border rounded-md px-3 py-2 outline-none
        ${error ? "border-red-500" : "border-gray-400"}`}
    >
      <option value="">Select</option>
      {options.map((opt, i) => (
        <option key={i} value={opt}>{opt}</option>
      ))}
    </select>
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);
