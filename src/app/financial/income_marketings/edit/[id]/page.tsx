'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";
import DateSelector from "@/app/component/DateSelector";
import toast, { Toaster } from "react-hot-toast";
import {
  getIncomeMarketingById,
  updateIncomeMarketing,
} from "@/store/financial/incomemarketing/incomemarketing";
import { IncomeMarketingAllDataInterface } from "@/store/financial/incomemarketing/incomemarketing.interface";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getPayments } from "@/store/masters/payments/payments";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { getAllAdmins } from "@/store/auth";

interface ErrorInterface {
  [key: string]: string;
}

export default function IncomeMarketingEdit() {
  const { id } = useParams();
  const router = useRouter();

  const [incomeData, setIncomeData] =
    useState<IncomeMarketingAllDataInterface>({
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
  const [loading, setLoading] = useState(true);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});

  // Fetch by id
  useEffect(() => {
    const fetchIncome = async () => {
      try {
        if (!id) return;
        const data = await getIncomeMarketingById(id as string);
        if (data) {

          const date = new Date(data.createdAt);
          const formattedDate =
            date.getFullYear()+"-"+(date.getMonth() + 1).toString().padStart(2, "0")+"-"+date.getDate().toString().padStart(2, "0");
            console.log(" nice ",formattedDate)
          // Ensure numbers are numbers
          setIncomeData({
            Date: data.Date??formattedDate,
            PartyName: data.PartyName ,
            User: data.User ,
            Income: data.Income ,
            Amount: data.Amount ,
            DueAmount: data.DueAmount ,
            PaymentMethode: data.PaymentMethode ,
            Status: data.Status,
          });
        } else {
          toast.error("Income Marketing not found");
        }
      } catch (error) {
        toast.error("Error fetching Income Marketing details");
        console.error("Fetch Income Marketing Error:", error);
      } finally {
        setLoading(false);
      }
    };
    if(id){
      fetchIncome();
    fetchFields();
    }
    
  }, [id]);

  // Input change handler (handles numeric fields too)
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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

  // Validation (note: uses keys as in the interface)
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!incomeData.User?.toString().trim()) newErrors.User = "User is required";
    if (!incomeData.PartyName?.toString().trim()) newErrors.PartyName = "Party Name is required";
    if (!incomeData.Income?.toString().trim()) newErrors.Income = "Income is required";
    if (!incomeData.PaymentMethode?.toString().trim()) newErrors.PaymentMethode = "Payment Method is required";
    if (!incomeData.Amount) newErrors.Amount = "Amount is required";
    if (!incomeData.Status?.toString().trim()) newErrors.Status = "Status is required";
    if (!incomeData.Date?.toString().trim()) newErrors.Date = "Date is required";
    return newErrors;
  };

  // Submit update
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      console.log(" response",incomeData)
      const result = await updateIncomeMarketing(id as string, incomeData);
      if (result) {
        toast.success("Income Marketing updated successfully!");
        router.push("/financial/income_marketings");
      } else {
        toast.error("Failed to update Income Marketing");
      }
    } catch (error) {
      toast.error("Failed to update Income Marketing");
      console.error("Update Income Marketing Error:", error);
    }
  };

  const fetchFields = async () => {
    await handleFieldOptions(
      [
        { key: "PaymentMethods", fetchFn: getPayments },
        { key: "Users", fetchFn: getAllAdmins },
      ],
      setFieldOptions
    );
  }

  const users = ["Admin", "Seller", "Visitor"];
  const paymentMethods = ["Cash", "UPI", "Bank Transfer"];
  const statusOptions = ["Active", "Inactive"];


  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading income marketing details...
      </div>
    );

  return (
    <div className="min-h-screen flex justify-center">
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
                Edit <span className="text-[var(--color-primary)]">Income Marketing</span>
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
                  label="PaymentMethode"
                  value={incomeData.PaymentMethode}
                  onChange={(v) => handleSelectChange("PaymentMethode", v)}
                />

                {/* Amount */}
                <InputField
                  label="Amount"
                  name="Amount"
                  value={incomeData.Amount?.toString() ?? "0"}
                  onChange={handleInputChange}
                  error={errors.Amount}
                />

                {/* Due Amount */}
                <InputField
                  label="Due Amount"
                  name="DueAmount"
                  value={incomeData.DueAmount?.toString() ?? "0"}
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

              {/* Update Button */}
              <div className="flex justify-end mt-4">

                <SaveButton text="Update" onClick={handleSubmit} />

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// 🟦 Reusable Input Field (copied from add/edit reference)
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
