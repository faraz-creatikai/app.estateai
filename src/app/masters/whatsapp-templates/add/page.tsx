'use client';

import { useState, useCallback } from "react";
import Link from "next/link";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { whatsappAllDataInterface } from "@/store/masters/whatsapp/whatsapp.interface";
import { addWhatsapp } from "@/store/masters/whatsapp/whatsapp";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

interface ErrorInterface {
  [key: string]: string;
}

export default function WhatsappAdd() {
  const [whatsappData, setWhatsappData] = useState<whatsappAllDataInterface>(() => ({
    name: "",
    body: "",
    status: "",
  }));

  const [errors, setErrors] = useState<ErrorInterface>({});
  const [whatsappImagePreview, setWhatsappImagePreview] = useState<string | null>(null);
  const [whatsappImageFile, setWhatsappImageFile] = useState<File | null>(null);

  const router = useRouter();

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setWhatsappData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleSelectChange = useCallback((label: string, selected: string) => {
    setWhatsappData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  const handleWhatsappImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setWhatsappImageFile(file);
    setWhatsappImagePreview(URL.createObjectURL(file));
  };

  const handleRemoveWhatsappImage = () => {
    setWhatsappImageFile(null);
    setWhatsappImagePreview(null);
  };


  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!whatsappData.name.trim()) newErrors.name = "Template name is required";
    if (!whatsappData.body.trim()) newErrors.body = "Body is required";
    if (!whatsappData.status.trim()) newErrors.status = "Status is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("name", whatsappData.name)
      formData.append("status", whatsappData.status)
      formData.append("body", whatsappData.body)
      formData.append("type",'whatsapp')
      if (whatsappImageFile) {
        formData.append("whatsappImage", whatsappImageFile);
      }
      const result = await addWhatsapp(formData);
      if (result) {
        toast.success("WhatsApp Template added successfully!");
        router.push("/masters/whatsapp-templates");
      }
    } catch (error) {
      toast.error("Failed to add WhatsApp template");
      console.error("Add Whatsapp Error:", error);
    }
  };

  const statusOptions = ["Active", "Inactive"];

  return (
    <MasterProtectedRoute>
      <div className=" min-h-screen  flex justify-center">
        <Toaster position="top-right" />
        <div className="w-full">
          <div className="flex justify-end mb-4">

            <BackButton
              url="/masters/whatsapp-templates"
              text="Back"
              icon={<ArrowLeft size={18} />}
            />
          </div>

          <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl">
            <form onSubmit={(e) => e.preventDefault()} className="w-full">
              <div className="mb-8 text-left border-b pb-4 border-gray-200">
                <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                  Add <span className="text-[var(--color-primary)]">WhatsApp Template</span>
                </h1>
              </div>

              <div className="flex flex-col space-y-6">
                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                  <InputField
                    label="Template Name"
                    name="name"
                    value={whatsappData.name}
                    onChange={handleInputChange}
                    error={errors.name}
                  />

                  <SingleSelect
                    options={statusOptions}
                    label="status"
                    value={whatsappData.status}
                    onChange={(v) => handleSelectChange("status", v)}
                  />
                  

                </div>

                <TextAreaField
                  label="Body"
                  name="body"
                  value={whatsappData.body}
                  onChange={handleInputChange}
                  error={errors.body}
                />
                <FileUpload
                    label="WhatsApp Image"
                    multiple={false}
                    previews={whatsappImagePreview ? [whatsappImagePreview] : []}
                    onChange={handleWhatsappImageChange}
                    onRemove={handleRemoveWhatsappImage}
                  />

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
        ${error ? "border-red-500" : "border-gray-400 focus:border-blue-500"}`}
    />
    <p
      className={`absolute left-2 bg-white px-1 text-gray-500 text-sm transition-all duration-300
      ${value || error
          ? "-top-2 text-xs text-[var(--color-primary)]"
          : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[var(--color-primary)]"
        }`}
    >
      {label}
    </p>
    {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
  </label>
);

// 🟩 Reusable Textarea Field
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
      rows={5}
      className={`peer w-full border rounded-sm bg-transparent py-3 px-4 outline-none resize-none 
        ${error ? "border-red-500" : "border-gray-400 focus:border-blue-500"}`}
    />
    <p
      className={`absolute left-2 bg-white px-1 text-gray-500 text-sm transition-all duration-300
      ${value || error
          ? "-top-2 text-xs text-[var(--color-primary)]"
          : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-[var(--color-primary)]"
        }`}
    >
      {label}
    </p>
    {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
  </label>
);



// File upload with preview and remove
const FileUpload: React.FC<{
  label: string;
  multiple?: boolean;
  previews?: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: (index: number) => void;
}> = ({ label, multiple, previews = [], onChange, onRemove }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type="file"
      multiple={multiple}
      onChange={onChange}
      className="border border-gray-300 rounded-md p-2"
    />
    {previews.length > 0 && (
      <div className="flex flex-wrap gap-3 mt-3">
        {previews.map((src, index) => (
          <div key={index} className="relative">
            <img
              src={src}
              alt={`preview-${index}`}
              className="w-24 h-24 object-cover rounded-md border"
            />
            {onRemove && (
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
);
