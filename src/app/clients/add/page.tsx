"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { createAdmin } from "@/store/auth"; // ✅ import your API call
import { CreateAdminData } from "@/store/auth.interface"; // ✅ types
import BackButton from "@/app/component/buttons/BackButton";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getCity } from "@/store/masters/city/city";

interface ErrorInterface {
    [key: string]: string;
}

export default function AdminCreatePage() {
    const [userData, setUserData] = useState({
        Role: "client_admin",
        FirstName: "",
        Email: "",
        MobileNumber: "",
        City: "",
        Company: "",
        Password: "",
        AddressLine1: "",
        AddressLine2: "",
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<ErrorInterface>({});
    const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
    const router = useRouter();

    useEffect(() => {
        fetchFields();
    }, [])

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

    // ✅ Form validation
    const validateForm = () => {
        const newErrors: ErrorInterface = {};
        if (!userData.FirstName.trim())
            newErrors.FirstName = "First Name is required";
        if (!userData.Email.trim()) newErrors.Email = "Email is required";
        else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(userData.Email))
            newErrors.Email = "Invalid email format";
        if (!userData.Password.trim()) newErrors.Password = "Password is required";
        if (userData.Password.trim() && userData.Password.trim().length < 6) newErrors.Password = "Password is must be 6 characters";
        if (!userData.Company.trim()) newErrors.Company = "Company is required";
        if (!userData.Role.trim()) newErrors.Role = "Role is required";
        if (!userData.AddressLine1.trim()) newErrors.AddressLine1 = "AddressLine1 is required";
        return newErrors;
    };

    // ✅ Submit handler
    const handleSubmit = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setLoading(true);

        // ✅ Prepare admin payload matching backend
        const adminPayload: CreateAdminData = {
            name: `${userData.FirstName}`.trim(),
            email: userData.Email,
            password: userData.Password,
            role:
                userData.Role === "administrator"
                    ? "administrator"
                    : userData.Role === "city_admin"
                        ? "city_admin"
                        : userData.Role === "client_admin" ?
                            "client_admin"
                            : "user",
            city: userData.City, // hide for admin
            phone: userData.MobileNumber,
            company: userData.Company,
            AddressLine1: userData.AddressLine1,
            AddressLine2: userData.AddressLine2,
        };

        console.log("Sending adminPayload:", adminPayload);

        try {
            const res = await createAdmin(adminPayload);

            if (res.success) {
                toast.success(res.message || "Admin created successfully!");
                setUserData({
                    Role: "",
                    FirstName: "",
                    Email: "",
                    MobileNumber: "",
                    City: "",
                    Password: "",
                    Company: "",
                    AddressLine1: "",
                    AddressLine2: "",
                });
                setErrors({});
                setTimeout(() => router.push("/users"), 1500);
            } else {
                toast.error(res.message || "Failed to create admin");
            }
        } catch (error: any) {
            toast.error(error.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    // Dropdown data
    const roles = ["client_admin"];
    const statusOptions = ["Active", "Inactive"];
    const cities = ["Jaipur", "Ajmer", "Udaipur"];

    const fetchFields = async () => {
        await handleFieldOptions(
            [

                { key: "City", fetchFn: getCity },
            ],
            setFieldOptions
        );
    }

    return (
        <div className=" min-h-screen flex justify-center">
            <Toaster position="top-right" />
            <div className="w-full max-w-[900px]">
                <div className="flex justify-end mb-4">
                    <BackButton
                        url="/clients"
                        text="Back"
                        icon={<ArrowLeft size={18} />}
                    />
                </div>

                <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl h-auto">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="mb-8 text-left border-b pb-4 border-gray-200">
                            <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                                Add <span className="text-[var(--color-primary)]">Client</span>
                            </h1>
                        </div>

                        <div className="flex flex-col space-y-10">
                            {/* USER LEVEL */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                    User Level
                                </h2>
                                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                                    <SingleSelect
                                        options={roles}
                                        label="Role"
                                        value={userData.Role}
                                        onChange={(selected:any) =>
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
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">
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

                                    <InputField
                                        label="Company"
                                        name="Company"
                                        value={userData.Company}
                                        onChange={handleInputChange}
                                        error={errors.Company}
                                    />

                                    <SingleSelect
                                        options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                                        label="City"
                                        value={userData.City}
                                        onChange={(selected) =>
                                            handleSelectChange("City", selected)
                                        }
                                    />

                                    <InputField
                                        label="Password"
                                        name="Password"
                                        value={userData.Password}
                                        onChange={handleInputChange}
                                        error={errors.Password}
                                    />
                                </div>
                            </div>

                            {/* ADDRESS INFORMATION */}
                            <div>
                                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                                    Address Information
                                </h2>
                                <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                                    <InputField
                                        label="Address Line 1"
                                        name="AddressLine1"
                                        value={userData.AddressLine1}
                                        error={errors.AddressLine1}
                                        onChange={handleInputChange}
                                    />
                                    <InputField
                                        label="Address Line 2"
                                        name="AddressLine2"
                                        value={userData.AddressLine2}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end mt-6">
                                <button
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className={`bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-primary-darker)] hover:from-[var(--color-primary-dark)] hover:to-[var(--color-secondary-darker)] cursor-pointer text-white p-2 w-32 rounded-md font-semibold  transition-all ${loading ? "opacity-70 cursor-not-allowed" : ""
                                        }`}
                                >
                                    {loading ? "Saving..." : "Save"}
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
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
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
