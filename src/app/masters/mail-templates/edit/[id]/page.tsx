'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { getMailById, updateMail } from "@/store/masters/mail/mail"; // 🔧 You can adjust this import path
import { mailAllDataInterface } from "@/store/masters/mail/mail.interface";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
import JoditEditorClient from "@/app/component/editors/JoditEditorClient";

interface ErrorInterface {
  [key: string]: string;
}

export default function MailEdit() {
  const { id } = useParams();
  const router = useRouter();

  const [mailData, setMailData] = useState<mailAllDataInterface>({
    name: "",
    subject: "",
    body: "",
    status: "",
  });

  const [errors, setErrors] = useState<ErrorInterface>({});
  const [loading, setLoading] = useState(true);

  // 🟩 Fetch Mail by ID
  useEffect(() => {
    const fetchMail = async () => {
      try {
        const data = await getMailById(id as string);
        if (data) {
          setMailData(data);
        } else {
          toast.error("Mail not found");
        }
      } catch (error) {
        toast.error("Error fetching mail details");
        console.error("Fetch Mail Error:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchMail();
  }, [id]);

  // 🟩 Handle Input Change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setMailData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // 🟩 Handle Dropdown
  const handleSelectChange = useCallback((label: string, selected: string) => {
    setMailData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  // 🟩 Validate Form
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!mailData.name.trim()) newErrors.name = "Mail name is required";
    if (!mailData.subject.trim()) newErrors.subject = "Subject is required";
    if (!mailData.body.trim()) newErrors.body = "Body is required";
    if (!mailData.status.trim()) newErrors.status = "Status is required";
    return newErrors;
  };

  // 🟩 Submit Update
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await updateMail(id as string, mailData);
      if (result) {
        toast.success("Mail updated successfully!");
        router.push("/masters/mail-templates");
      } else {
        toast.error("Failed to update mail");
      }
    } catch (error) {
      toast.error("Failed to update mail");
      console.error("Update Mail Error:", error);
    }
  };

  const statusOptions = ["Active", "Inactive"];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading mail details...
      </div>
    );

  return (
    <MasterProtectedRoute>
    <div className=" min-h-screen flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        {/* Back Button */}
        <div className="flex justify-end mb-4">
          
          <BackButton
            url="/masters/mail-templates"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl">
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <div className="mb-8 text-left border-b pb-4 border-gray-200">
              <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                Edit <span className="text-[var(--color-primary)]">Mail</span>
              </h1>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                {/* Mail Name */}
                <InputField
                  label="Mail Name"
                  name="name"
                  value={mailData.name}
                  onChange={handleInputChange}
                  error={errors.name}
                />

                {/* Subject */}
                <InputField
                  label="Subject"
                  name="subject"
                  value={mailData.subject}
                  onChange={handleInputChange}
                  error={errors.subject}
                />
                {/* Status */}
                <SingleSelect
                  options={statusOptions}
                  label="Status"
                  value={mailData.status}
                  onChange={(v) => handleSelectChange("status", v)}
                />

                {/* Body using JoditEditorClient */}
                  <div className="flex flex-col col-span-2">
                    <label className="text-gray-700 mb-2 font-medium">Body</label>
                    <JoditEditorClient
                      value={mailData.body}
                      onChange={(html: string) => {
                        setMailData((prev) => ({ ...prev, body: html }));
                        setErrors((prev) => ({ ...prev, body: "" }));
                      }}
                    />
                    {errors.body && (
                      <span className="text-red-500 text-sm mt-1">{errors.body}</span>
                    )}
                  </div>

                
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

// 🟩 Textarea Field
const TextAreaField: React.FC<{
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}> = ({ label, name, value, onChange, error }) => (
  <label className="relative block w-full col-span-2">
    <textarea
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      rows={5}
      className={`peer w-full border rounded-sm bg-transparent py-3 px-4 outline-none resize-none
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
