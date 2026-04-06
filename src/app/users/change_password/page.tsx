'use client'

import { useState, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { InputField } from "@/app/component/InputField";
import { updateAdminPassword } from "@/store/auth";
import { useAuth } from "@/context/AuthContext";
import BackButton from "@/app/component/buttons/BackButton";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { admin } = useAuth();

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: ""
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setPasswordData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: "" }));
    },
    []
  );

  // Form validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (admin?.role !== "administrator" && !passwordData.currentPassword.trim()) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword.trim()) {
      newErrors.newPassword = "New password is required";
    }
    return newErrors;
  };

  // Submit handler
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    let payload: any = passwordData;
    if (admin?.role === "administrator") {
      const { currentPassword, ...restData } = passwordData;
      payload = restData;
    }

    const response = await updateAdminPassword(admin?._id ?? "", payload);
    if (response) {
      toast.success("Password changed successfully!");
      router.push("/users"); // redirect after success
    } else {
      toast.error("Failed to change password");
    }
  };

  return (
    <div className=" min-h-screen  max-md:p-0 flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full ">
        <div className="flex max-sm:hidden justify-end mb-10">
          <BackButton
                      url="/users"
                      text="Back"
                      icon={<ArrowLeft size={18} />}
                    />
        </div>

        <div className="bg-white/90 max-sm:dark:bg-[var(--color-childbgdark)] backdrop-blur-lg p-10 mx-auto w-full max-w-[500px] rounded-3xl shadow-2xl h-auto">
          <h1 className="text-2xl font-extrabold text-[var(--color-secondary-darker)] max-sm:dark:text-[var(--color-primary)] mb-8 border-b pb-4">
            Change <span className="text-[var(--color-primary)]">Password</span>
          </h1>

          <div className="grid grid-cols-1 gap-6">
            {admin?.role !== "administrator" && (
              <InputField
                label="Current Password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handleInputChange}
                error={errors.currentPassword}
              />
            )}
            <InputField
              label="New Password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handleInputChange}
              error={errors.newPassword}
            />
          </div>

          <div className="flex justify-between mt-8 gap-4 w-full">
            <button
              onClick={handleSubmit}
              className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-darker)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-secondary-darker)] cursor-pointer text-white p-2 w-40 rounded-md font-semibold  transition-all"
            >
              Change Password
            </button>
            <Link
              href="/users"
              className="text-[var(--color-primary)] px-4 py-2 max-sm:hidden rounded-md border hover:bg-gray-100"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
