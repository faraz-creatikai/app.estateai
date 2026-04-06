'use client';

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";
import DateSelector from "@/app/component/DateSelector";
import toast, { Toaster } from "react-hot-toast";
import {
  getExpenseMarketingById,
  updateExpenseMarketing,
} from "@/store/financial/expensemarketing/expensemarketing";
import { ExpenseMarketingAllDataInterface } from "@/store/financial/expensemarketing/expensemarketing.interface";
import { getPayments } from "@/store/masters/payments/payments";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getAllAdmins } from "@/store/auth";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";

interface ErrorInterface {
  [key: string]: string;
}

export default function ExpenseMarketingEdit() {
  const { id } = useParams();
  const router = useRouter();

  const [expenseData, setExpenseData] = useState<ExpenseMarketingAllDataInterface>({
    Date: "",
    PartyName: "",
    User: "",
    Expense: "",
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
    const fetchExpense = async () => {
      try {
        if (!id) return;
        const data = await getExpenseMarketingById(id as string);
        if (data) {
           const date = new Date(data.createdAt);
          const formattedDate =
            date.getFullYear()+"-"+(date.getMonth() + 1).toString().padStart(2, "0")+"-"+date.getDate().toString().padStart(2, "0");
            console.log(" nice ",formattedDate)
          setExpenseData({
            Date: data.Date ?? formattedDate,
            PartyName: data.PartyName ?? "",
            User: data.User ?? "",
            Expense: data.Expense ?? "",
            Amount: data.Amount ?? "",
            DueAmount: data.DueAmount ?? "",
            PaymentMethode: data.PaymentMethode ?? "",
            Status: data.Status ?? "",
          });
        } else {
          toast.error("Expense Marketing not found");
        }
      } catch (error) {
        toast.error("Error fetching Expense Marketing details");
        console.error("Fetch Expense Marketing Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpense();
    fetchFields();
  }, [id]);

  // Input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setExpenseData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // Dropdown/Date selector handler
  const handleSelectChange = useCallback((label: string, selected: string) => {
    setExpenseData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  // Validation
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!expenseData.User?.toString().trim()) newErrors.User = "User is required";
    if (!expenseData.PartyName?.toString().trim()) newErrors.PartyName = "Party Name is required";
    if (!expenseData.Expense?.toString().trim()) newErrors.Expense = "Expense is required";
    if (!expenseData.PaymentMethode?.toString().trim()) newErrors.PaymentMethode = "Payment Method is required";
    if (!expenseData.Amount?.toString().trim()) newErrors.Amount = "Amount is required";
    if (!expenseData.Status?.toString().trim()) newErrors.Status = "Status is required";
    if (!expenseData.Date?.toString().trim()) newErrors.Date = "Date is required";
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
      const result = await updateExpenseMarketing(id as string, expenseData);
      if (result) {
        toast.success("Expense Marketing updated successfully!");
        router.push("/financial/expense_marketings");
      } else {
        toast.error("Failed to update Expense Marketing");
      }
    } catch (error) {
      toast.error("Failed to update Expense Marketing");
      console.error("Update Expense Marketing Error:", error);
    }
  };

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

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading expense marketing details...
      </div>
    );

  return (
    <div className=" min-h-screen flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        {/* Back Button */}
        <div className="flex justify-end mb-4">

          <BackButton
            url="/financial/expense_marketings"
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
                Edit <span className="text-[var(--color-primary)]">Expense Marketing</span>
              </h1>
            </div>

            {/* Form Fields */}
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                {/* User */}
                <SingleSelect
                  options={Array.isArray(fieldOptions?.Users) ? fieldOptions.Users : []}
                  label="User"
                  value={expenseData.User}
                  onChange={(v) => handleSelectChange("User", v)}
                />

                {/* Party Name */}
                <InputField
                  label="Party Name"
                  name="PartyName"
                  value={expenseData.PartyName}
                  onChange={handleInputChange}
                  error={errors.PartyName}
                />

                {/* Date */}
                <DateSelector
                  label="Date"
                  value={expenseData.Date}
                  onChange={(v) => handleSelectChange("Date", v)}
                />

                {/* Expense */}
                <InputField
                  label="Expense"
                  name="Expense"
                  value={expenseData.Expense}
                  onChange={handleInputChange}
                  error={errors.Expense}
                />

                {/* Payment Method */}
                <SingleSelect
                  options={Array.isArray(fieldOptions?.PaymentMethods) ? fieldOptions.PaymentMethods : []}
                  label="PaymentMethode"
                  value={expenseData.PaymentMethode}
                  onChange={(v) => handleSelectChange("PaymentMethode", v)}
                />

                {/* Amount */}
                <InputField
                  label="Amount"
                  name="Amount"
                  value={expenseData.Amount ?? ""}
                  onChange={handleInputChange}
                  error={errors.Amount}
                />

                {/* Due Amount */}
                <InputField
                  label="Due Amount"
                  name="DueAmount"
                  value={expenseData.DueAmount ?? ""}
                  onChange={handleInputChange}
                />

                {/* Status */}
                <SingleSelect
                  options={statusOptions}
                  label="Status"
                  value={expenseData.Status}
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
