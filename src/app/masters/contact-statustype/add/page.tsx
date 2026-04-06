'use client';

import { useState, useCallback } from "react";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

import SingleSelect from "@/app/component/SingleSelect";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

import {
  contactstatustypeAllDataInterface
} from "@/store/masters/contactstatustype/contactstatustype.interface";

import { addContactStatusType } from "@/store/masters/contactstatustype/contactstatustype";

interface ErrorInterface {
  [key: string]: string;
}

export default function ContactStatusTypeAdd() {
  const [formData, setFormData] = useState<contactstatustypeAllDataInterface>({
    Name: "",
    Status: "",
  });

  const [errors, setErrors] = useState<ErrorInterface>({});
  const router = useRouter();

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    setFormData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, []);

  const handleSelectChange = useCallback((label: string, value: string) => {
    setFormData(prev => ({ ...prev, [label]: value }));
    setErrors(prev => ({ ...prev, [label]: "" }));
  }, []);

  const validateForm = () => {
    const newErrors: ErrorInterface = {};

    if (!formData.Name.trim()) newErrors.Name = "Name is required";
    if (!formData.Status.trim()) newErrors.Status = "Status is required";

    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await addContactStatusType(formData);
      if (result) {
        toast.success("Contact Status Type added successfully!");
        router.push("/masters/contact-statustype");
      }
    } catch (error) {
      toast.error("Failed to add contact status type");
      console.error(error);
    }
  };

  const statusOptions = ["Active", "Inactive"];

  return (
    <MasterProtectedRoute>
      <Toaster position="top-right" />
      
      <div className="min-h-screen flex justify-center">
        <div className="w-full">

          <div className="flex justify-end mb-4">
            <BackButton
              url="/masters/contact-status-type"
              text="Back"
              icon={<ArrowLeft size={18} />}
            />
          </div>

          <div className="bg-white p-10 rounded-3xl shadow-2xl">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold">
                  Add <span className="text-[var(--color-primary)]">Contact Status Type</span>
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                <InputField
                  label="Contact Status Type Name"
                  name="Name"
                  value={formData.Name}
                  onChange={handleInputChange}
                  error={errors.Name}
                />

                <SingleSelect
                  options={statusOptions}
                  label="Status"
                  value={formData.Status}
                  onChange={(v) => handleSelectChange("Status", v)}
                />
              </div>

              <div className="flex justify-end mt-4">
                <SaveButton text="Save" onClick={handleSubmit} />
              </div>
            </form>
          </div>

        </div>
      </div>
    </MasterProtectedRoute>
  );
}

/* REUSABLE INPUT */
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
      ${
        value || error
          ? "-top-2 text-xs text-blue-500"
          : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"
      }`}
    >
      {label}
    </p>
    {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
  </label>
);
