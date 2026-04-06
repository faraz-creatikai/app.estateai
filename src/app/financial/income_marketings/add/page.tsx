'use client';

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import DateSelector from "@/app/component/DateSelector";
import { IncomeMarketingAllDataInterface } from "@/store/financial/incomemarketing/incomemarketing.interface";
import { addIncomeMarketing } from "@/store/financial/incomemarketing/incomemarketing";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getPayments } from "@/store/masters/payments/payments";
import { getAllAdmins } from "@/store/auth";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";

interface ErrorInterface {
  [key: string]: string;
}

export default function IncomeMarketingAdd() {
  const [incomeData, setIncomeData] = useState<IncomeMarketingAllDataInterface>({
    Date: "",
    PartyName: "",
    User: "",
    Income: "",
    Amount: "",
    DueAmount: "",
    PaymentMethode: "",
    Status: "",
  });

  const [errors, setErrors] = useState<ErrorInterface>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const router = useRouter();

  useEffect(() => {
    fetchFields();
  }, [])

  // Input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setIncomeData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // Dropdown/Date selector handler
  const handleSelectChange = useCallback((label: string, selected: string) => {
    setIncomeData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!incomeData.User.trim()) newErrors.User = "User is required";
    if (!incomeData.PartyName.trim()) newErrors.PartyName = "Party Name is required";
    if (!incomeData.Income.trim()) newErrors.Income = "Income is required";
    if (!incomeData.PaymentMethode.trim()) newErrors.PaymentMethod = "Payment Method is required";
    if (!incomeData.Amount) newErrors.Amount = "Amount is required";
    if (!incomeData.Status.trim()) newErrors.Status = "Status is required";
    if (!incomeData.Date.trim()) newErrors.Date = "Date is required";
    return newErrors;
  };

  // Submit handler
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {

      /* console.log("Submitting Income Marketing Data:", incomeData); */ // Debug log
      const result = await addIncomeMarketing(incomeData);

      if (result) {
        toast.success("Income Marketing added successfully!");
         router.push("/financial/income_marketings");
      }
    } catch (error) {
      toast.error("Failed to add Income Marketing");
      console.error("Income Marketing Add Error:", error);
    }
  };

  // Dropdown data
  const fetchFields = async () => {
    await handleFieldOptions(
      [
        { key: "Users", fetchFn: getAllAdmins },
        { key: "PaymentMethods", fetchFn: getPayments },
      ],
      setFieldOptions
    );
  }


  const users = ["Admin", "Seller", "Visitor"];
  const paymentMethods = ["Cash", "UPI", "Bank Transfer"];
  const statusOptions = ["Active", "Inactive"];

  return (
    <div className=" min-h-screen flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        {/* Back Button */}
        <div className="flex justify-end mb-4">
          
          <BackButton
            url="/financial/income_marketings"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        {/* Form Card */}
        <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl">
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            {/* Header */}
            <div className="mb-8 text-left border-b pb-4 border-gray-200">
              <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                Add <span className="text-[var(--color-primary)]">Income Marketing</span>
              </h1>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                {/* User */}
                <SingleSelect
                  options={Array.isArray(fieldOptions?.Users) ? fieldOptions.Users : []}
                  label="User"
                  value={incomeData.User}
                  onChange={(v) => handleSelectChange("User", v)}
                />

                {/* Party Name */}
                <InputField
                  label="Party Name"
                  name="PartyName"
                  value={incomeData.PartyName}
                  onChange={handleInputChange}
                  error={errors.PartyName}
                />

                {/* Date */}
                <DateSelector
                  label="Date"
                  value={incomeData.Date}
                  onChange={(v) => handleSelectChange("Date", v)}
                />

                {/* Income */}
                <InputField
                  label="Income"
                  name="Income"
                  value={incomeData.Income}
                  onChange={handleInputChange}
                  error={errors.Income}
                />

                {/* Payment Method */}
                <SingleSelect
                  options={Array.isArray(fieldOptions?.PaymentMethods) ? fieldOptions.PaymentMethods : []}
                  label="Payment Method"
                  value={incomeData.PaymentMethode}
                  onChange={(v) => handleSelectChange("PaymentMethode", v)}
                />

                {/* Amount */}
                <InputField
                  label="Amount"
                  name="Amount"
                  value={incomeData.Amount.toString()}
                  onChange={handleInputChange}
                  error={errors.Amount}
                />

                {/* Due Amount */}
                <InputField
                  label="Due Amount"
                  name="DueAmount"
                  value={incomeData.DueAmount.toString()}
                  onChange={handleInputChange}
                />

                {/* Status */}
                <SingleSelect
                  options={statusOptions}
                  label="Status"
                  value={incomeData.Status}
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
  );
}

// 🟦 Reusable Input Field
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
