'use client'

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import SingleSelect from "@/app/component/SingleSelect";
import { useRouter } from "next/navigation";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypes } from "@/store/masters/types/types";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { importCustomer } from "@/store/customer";
import { getSubtype } from "@/store/masters/subtype/subtype";

export default function CustomerImport() {
  const [importData, setImportData] = useState({
    Campaign: "",
    CustomerType: "",
    CustomerSubType: "",
    file: null as File | null,
  });

  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();

  // 🔹 Fetch dropdown data
  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    await handleFieldOptions(
      [
        { key: "Campaign", fetchFn: getCampaign },
        { key: "CustomerType", fetchFn: getTypes },
        { key: "CustomerSubType", fetchFn: getSubtype },
      ],
      setFieldOptions
    );
  };

  // 🔹 Handle select changes
  const handleSelectChange = useCallback(
    (label: string, value: string) => {
      setImportData((prev) => ({ ...prev, [label]: value }));
      setErrors((prev) => ({ ...prev, [label]: "" }));
    },
    []
  );

  // 🔹 Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setImportData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // 🔹 Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportData((prev) => ({ ...prev, file: file }));
  };

  // 🔹 Validate fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!importData.Campaign) newErrors.Campaign = "Campaign is required";
    if (!importData.CustomerType) newErrors.CustomerType = "Customer Type is required";
     if (!importData.CustomerSubType) newErrors.CustomerSubType = "Customer SubType is required";
    if (!importData.file) newErrors.file = "Please choose an Excel file";
    return newErrors;
  };

  // 🔹 Handle submit
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Campaign", importData.Campaign);
      formData.append("CustomerType", importData.CustomerType);
      formData.append("CustomerSubType", importData.CustomerSubType);
      if (importData.file) formData.append("file", importData.file);
  
      console.log(importData)
      // 🔹 Replace this with your import API call
       const result = await importCustomer(formData); // mock success

      if (result) {
        toast.success("Customer data imported successfully!");
        router.push("/customer");
      } else {
        toast.error("Failed to import data");
      }
    } catch (error) {
      console.error("Import Error:", error);
      toast.error("Error importing customers");
    }
  };

  return (
    <div className="bg-slate-200 min-h-screen p-6 flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        <div className="flex justify-end mb-4">
          <Link
            href="/customer"
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-all"
          >
            <ArrowLeft size={18} /> Back
          </Link>
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl h-auto">
          <h1 className="text-3xl font-extrabold text-gray-800 mb-8 border-b pb-4">
            Import <span className="text-blue-600">Customer Dataasdf</span>
          </h1>

          <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
            <SingleSelect
              options={Array.isArray(fieldOptions?.Campaign)?fieldOptions.Campaign:[]}
              label="Campaign"
              value={importData.Campaign}
              onChange={(v) => handleSelectChange("Campaign", v)}
              error={errors.Campaign}
            />

            <SingleSelect
              options={Array.isArray(fieldOptions?.CustomerType)?fieldOptions.CustomerType:[]}
              label="Customer Type"
              value={importData.CustomerType}
              onChange={(v) => handleSelectChange("CustomerType", v)}
              error={errors.CustomerType}
            />

            <SingleSelect
              options={Array.isArray(fieldOptions?.CustomerSubType)?fieldOptions.CustomerSubType:[]}
              label="Customer SubType"
              value={importData.CustomerSubType}
              onChange={(v) => handleSelectChange("CustomerSubType", v)}
              error={errors.CustomerSubType}
            />

          

           

            <FileUpload
              label="Choose Excel File"
              onChange={handleFileChange}
              error={errors.file}
            />
          </div>

          <div className="flex justify-end mt-8">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-2 w-40 rounded-md font-semibold hover:scale-105 transition-all"
            >
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// 🟦 Input Field
const InputField = ({ label, name, value, error, onChange }: any) => (
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
    <p className={`absolute left-2 bg-white px-1 text-gray-500 text-sm transition-all duration-300
      ${value || error ? "-top-2 text-xs text-blue-500" : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"}`}>
      {label}
    </p>
    {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
  </label>
);

// 🟦 File Upload
const FileUpload = ({ label, onChange, error }: any) => (
  <div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type="file"
      accept=".xlsx, .xls"
      onChange={onChange}
      className="border border-gray-300 rounded-md p-2"
    />
    {error && <span className="text-red-500 text-sm mt-2">{error}</span>}
  </div>
);
