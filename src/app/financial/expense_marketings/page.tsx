'use client';

import { useEffect, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import { PlusSquare } from "lucide-react";
import Button from "@mui/material/Button";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "@/app/component/ProtectedRoutes";
import PopupMenu from "@/app/component/popups/PopupMenu";
import SingleSelect from "@/app/component/SingleSelect";
import toast from "react-hot-toast";

import {
  ExpenseMarketingGetDataInterface,
  ExpenseMarketingDialogDataInterface,
} from "@/store/financial/expensemarketing/expensemarketing.interface";

import {
  deleteExpenseMarketing,
  getFilteredExpenseMarketing,
  getExpenseMarketing,
} from "@/store/financial/expensemarketing/expensemarketing";

import DeleteDialog from "@/app/component/popups/DeleteDialog";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getExpenses } from "@/store/masters/expenses/expenses";
import { getPayments } from "@/store/masters/payments/payments";
import { getAllAdmins } from "@/store/auth";
import AddButton from "@/app/component/buttons/AddButton";
import PageHeader from "@/app/component/labels/PageHeader";

export default function FinanceExpense() {
  const router = useRouter();

  const [expenseData, setExpenseData] = useState<ExpenseMarketingGetDataInterface[]>([]);
  const [filters, setFilters] = useState({
    User: [] as string[],
    Expense: [] as string[],
    PaymentMethode: [] as string[],
    Keyword: "" as string,
    Limit: ["10"] as string[],
  });

  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<ExpenseMarketingDialogDataInterface | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});

  useEffect(() => {
    getExpenseList();
    fetchFields();
  }, []);

  const getExpenseList = async () => {
    const data = await getExpenseMarketing();
    if (data) setExpenseData(data);
  };

  const handleSelectChange = async (
    field: keyof typeof filters,
    selected: string | string[]
  ) => {
    const updatedFilters = {
      ...filters,
      [field]: Array.isArray(selected)
        ? selected
        : selected
          ? [selected]
          : [],
    };
    setFilters(updatedFilters);

    const queryParams = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => queryParams.append(key, v));
      } else if (typeof value === "string" && value) {
        queryParams.append(key, value);
      }
    });

    const data = await getFilteredExpenseMarketing(queryParams.toString());
    if (data) setExpenseData(data);
  };

  const clearFilter = async () => {
    setFilters({
      User: [],
      Expense: [],
      PaymentMethode: [],
      Keyword: "",
      Limit: ["10"],
    });
    await getExpenseList();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await deleteExpenseMarketing(deleteId);
    if (res) {
      toast.success("Expense record deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeleteDialogData(null);
      setDeleteId(null);
      getExpenseList();
    } else {
      toast.error("Failed to delete expense record");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(expenseData.length / rowsPerTablePage) || 1;
  const startIndex = (currentPage - 1) * rowsPerTablePage;
  const currentRows = expenseData.slice(startIndex, startIndex + rowsPerTablePage);

  // Dummy dropdown options (replace with dynamic adv API if available)

  const fetchFields = async () => {
    await handleFieldOptions(
      [
        { key: "Expenses", fetchFn: getExpenses },
        { key: "PropertyTypes", staticData: ["Flat", "Villa", "Plot", "Coomercial"] },
        { key: "PaymentMethods", fetchFn: getPayments },
        { key: "Users", fetchFn: getAllAdmins }
      ],
      setFieldOptions
    );
  }

  useEffect(() => {
    setRowsPerTablePage(Number(filters.Limit));
    setCurrentPage(1);
  }, [filters.Limit])
  const users = ["Admin", "Staff1", "Staff2"];
  const expenses = ["Purchase", "Salary", "Utility"];
  const paymentMethods = ["Cash", "UPI", "Bank Transfer"];
  const limits = ["10", "25", "50", "100"];

  return (
    <ProtectedRoute>
      <div className="min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">
        <Toaster position="top-right" />

        {/* DELETE POPUP */}
        <DeleteDialog<ExpenseMarketingDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this expense?"
          data={deleteDialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
            setDeleteId(null);
          }}
          onDelete={handleDelete}
        />

        <div className="p-4 w-full bg-white rounded-md">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <PageHeader title="Dashboard" subtitles={["Finance", "Expense"]} />


            <AddButton
              url="/financial/expense_marketings/add"
              text="Add"
              icon={<PlusSquare size={18} />}
            />
          </div>

          {/* SEARCH FILTERS */}
          <div className="mt-6 p-5 rounded-md ">
            <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
              Search Filters
            </h3>
            <div className=" grid  grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-5">
              <SingleSelect
                options={Array.isArray(fieldOptions?.Users) ? fieldOptions.Users : []}
                label="User"
                value={filters.User[0]}
                onChange={(val) => handleSelectChange("User", val)}
              />
              <SingleSelect
                options={Array.isArray(fieldOptions?.Expenses) ? fieldOptions.Expenses : []}
                label="Expense"
                value={filters.Expense[0]}
                onChange={(val) => handleSelectChange("Expense", val)}
              />
              <SingleSelect
                options={Array.isArray(fieldOptions?.PaymentMethods) ? fieldOptions.PaymentMethods : []}
                label="Payment Method"
                value={filters.PaymentMethode[0]}
                onChange={(val) => handleSelectChange("PaymentMethode", val)}
              />
              <SingleSelect
                options={limits}
                label="Limit"
                value={filters.Limit[0]}
                onChange={(val) => handleSelectChange("Limit", val)}
              />


            </div>
            <div className="w-full flex flex-wrap gap-6 items-end mb-6 mt-5">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900">
                  Keyword
                </label>
                <input
                  type="text"
                  placeholder="Search..."
                  value={filters.Keyword}
                  onChange={(e) =>
                    handleSelectChange("Keyword", e.target.value)
                  }
                  className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full"
                />
              </div>

              <div className="flex items-end gap-3">
                <button
                  onClick={clearFilter}
                  className="text-red-500 cursor-pointer border border-red-300 hover:bg-red-50 px-4 py-2 rounded-md"
                >
                  Clear Search
                </button>
              </div>
            </div>
          </div>

          {/* TABLE */}
          <section className="flex flex-col mt-6 p-2 rounded-md">
            <div className="overflow-auto">
              <table className="table-auto w-full border-collapse text-sm border border-gray-200">
                <thead className="bg-[var(--color-primary)] text-white">
                  <tr>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">S.No.</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Date</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Party Name</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">User</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Expense</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Amount</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Due Amount</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Payment Method</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Status</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((item, index) => (
                      <tr
                        key={item._id}
                        className="border-t hover:bg-[#f7f6f3] transition-all duration-200"
                      >
                        <td className="px-4 py-3 border border-gray-200">{startIndex + index + 1}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Date}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.PartyName}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.User}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Expense}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Amount}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.DueAmount}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.PaymentMethode}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Status}</td>
                        <td className="px-4 py-2 flex gap-2 items-center">
                          <Button
                            sx={{
                              backgroundColor: "#E8F5E9",
                              color: "var(--color-primary)",
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                            }}
                            onClick={() =>
                              router.push(`/financial/expense_marketings/edit/${item._id}`)
                            }
                          >
                            <MdEdit />
                          </Button>
                          <Button
                            sx={{
                              backgroundColor: "#FDECEA",
                              color: "#C62828",
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                            }}
                            onClick={() => {
                              setIsDeleteDialogOpen(true);
                              setDeleteDialogData({
                                id: item._id,
                                PartyName: item.PartyName,
                                Amount: item.Amount,
                              });
                              setDeleteId(item._id);
                            }}
                          >
                            <MdDelete />
                          </Button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="text-center py-4 text-gray-500">
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) => (prev < totalPages ? prev + 1 : prev))
                  }
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
