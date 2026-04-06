"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

import { getAdminById, updateAdminDetails } from "@/store/auth";
import { Admin, UpdateAdminDetailsData } from "@/store/auth.interface";
import BackButton from "@/app/component/buttons/BackButton";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getCity } from "@/store/masters/city/city";

interface ErrorInterface {
  [key: string]: string;
}

export default function AdminEditPage() {
  const { id } = useParams();
  const router = useRouter();

  const [userData, setUserData] = useState({
    Role: "",
    FirstName: "",
    Email: "",
    MobileNumber: "",
    City: "",
    Status: "",
    AddressLine1: "",
    AddressLine2: "",
  });

  const [loading, setLoading] = useState(false);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<ErrorInterface>({});

  // ✅ Fetch user data
  useEffect(() => {
    loadUserDetails();
    fetchFields();
  }, []);

  const loadUserDetails = async () => {
    const res = await getAdminById(String(id));

    if (!res.success || !res.adminData) {
      toast.error("Failed to load user details");
      return;
    }

    const data: Admin = res.adminData;

    // ✅ Map backend fields → frontend fields of Add Page
    setUserData({
      Role: data.role || "",
      FirstName: data.name || "",
      Email: data.email || "",
      MobileNumber: data.phone || "",
      City: data.city || "",
      Status:data.status || "",
      AddressLine1: data.AddressLine1 || "",
      AddressLine2: data.AddressLine2 || "",
    });
  };

  // ✅ Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setUserData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // ✅ Handle dropdown change
  const handleSelectChange = useCallback((label: string, selected: string) => {
    setUserData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  // ✅ Form validation (Password removed ✅)
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!userData.FirstName.trim())
      newErrors.FirstName = "First Name is required";
    if (!userData.Email.trim()) newErrors.Email = "Email is required";
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userData.Email))
      newErrors.Email = "Invalid email format";
    if (!userData.Role.trim()) newErrors.Role = "Role is required";
    if (!userData.AddressLine1.trim())
      newErrors.AddressLine1 = "AddressLine1 is required";

    return newErrors;
  };

  // ✅ Submit handler (UPDATE)
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);



    const res = await updateAdminDetails(String(id), userData);

    if (res.success) {
      toast.success("User updated successfully!");
      setTimeout(() => router.push("/users"), 1500);
    } else {
      toast.error(res.message || "Failed to update user");
    }

    setLoading(false);
  };

  const fetchFields = async () => {
    await handleFieldOptions(
      [

        { key: "City", fetchFn: getCity },
         { key:" Status", staticData:["Active", "Inactive"] }
      ],
      setFieldOptions
    );
  }

  // ✅ Dropdown values
  const roles = ["administrator", "city_admin", "user"];
  const cities = ["Jaipur", "Ajmer", "Udaipur"];

  return (
    <div className=" min-h-screen flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full max-w-[900px]">
        <div className="flex max-sm:hidden justify-end mb-4">
          <BackButton
            url="/users"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        <div className="bg-white/90 max-sm:dark:bg-[var(--color-childbgdark)] backdrop-blur-lg p-10 rounded-3xl shadow-2xl h-auto">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-8 text-left border-b pb-4 border-gray-200 max-sm:dark:border-gray-700">
              <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)] max-sm:dark:text-[var(--color-primary)] leading-tight tracking-tight">
                Edit <span className="text-[var(--color-primary)]">Admin</span>
              </h1>
            </div>

            <div className="flex flex-col space-y-10">
              {/* USER LEVEL */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 max-sm:dark:text-gray-400 mb-4">
                  User Level
                </h2>

                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                  <SingleSelect
                    options={roles}
                    label="Role"
                    value={userData.Role}
                    onChange={(selected) =>
                      handleSelectChange("Role", selected)
                    }
                  />
                  {errors.Role && (
                    <span className="text-red-500 text-sm">{errors.Role}</span>
                  )}
                </div>
              </div>

              {/* PERSONAL INFORMATION */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 max-sm:dark:text-gray-400 mb-4">
                  Personal Information
                </h2>

                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                  <InputField
                    label="First Name"
                    name="FirstName"
                    value={userData.FirstName}
                    onChange={handleInputChange}
                    error={errors.FirstName}
                  />

                  <InputField
                    label="Email"
                    name="Email"
                    value={userData.Email}
                    onChange={handleInputChange}
                    error={errors.Email}
                  />

                  <InputField
                    label="Mobile Number"
                    name="MobileNumber"
                    value={userData.MobileNumber}
                    onChange={handleInputChange}
                  />

                  <SingleSelect
                    options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                    label="City"
                    value={userData.City}
                    onChange={(selected) =>
                      handleSelectChange("City", selected)
                    }
                  />
                  <SingleSelect
                    options={Array.isArray(fieldOptions?.Status) ? fieldOptions.Status : []}
                    label="Status"
                    value={userData.Status}
                    onChange={(selected) =>
                      handleSelectChange("Status", selected)
                    }
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div>
                <h2 className="text-xl font-semibold text-gray-700 max-sm:dark:text-gray-400 mb-4">
                  Address Information
                </h2>

                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                  <InputField
                    label="Address Line 1"
                    name="AddressLine1"
                    value={userData.AddressLine1}
                    onChange={handleInputChange}
                    error={errors.AddressLine1}
                  />

                  <InputField
                    label="Address Line 2"
                    name="AddressLine2"
                    value={userData.AddressLine2}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              {/* BUTTON */}
              <div className="flex justify-end mt-6">
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className={`bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-darker)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-secondary-darker)] cursor-pointer text-white p-2 w-32 rounded-md font-semibold  transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""
                    }`}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ✅ Reusable Input Component
const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: any;
}> = ({ label, name, value, onChange, error }) => (
  <label className="relative block w-full">
    <input
      type="text"
      name={name}
      value={value}
      onChange={onChange}
      placeholder=" "
      className={`peer w-full max-sm:dark:text-gray-300 border rounded-sm bg-transparent py-3 px-4 outline-none 
        ${error
          ? "border-red-500 focus:border-red-500"
          : "border-gray-400 max-sm:dark:border-gray-700 focus:border-blue-500"
        }`}
    />
    <p
      className={`absolute left-2 bg-white max-sm:dark:bg-[var(--color-childbgdark)] px-1 text-gray-400 text-sm transition-all duration-300
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
