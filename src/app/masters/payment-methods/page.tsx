'use client';

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from "@mui/material/Button";
import { PlusSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteDialog from "@/app/component/popups/DeleteDialog";
import { paymentsGetDataInterface, paymentsDialogDataInterface } from "@/store/masters/payments/payments.interface";
import { getPayments, deletePayments } from "@/store/masters/payments/payments";
import AddButton from "@/app/component/buttons/AddButton";
import PageHeader from "@/app/component/labels/PageHeader";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

export default function PaymentMethodPage() {
  const [payments, setPayments] = useState<paymentsGetDataInterface[]>([]);
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState("10");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<paymentsDialogDataInterface | null>(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
  const router = useRouter();

  // Fetch payments from API
  const fetchPayments = async () => {
    const data = await getPayments();
    if (data) {
      const formattedData = data.map((p: paymentsGetDataInterface) => ({
        ...p,
        Name: p.Name.charAt(0).toUpperCase() + p.Name.slice(1)
      }));
      setPayments(formattedData);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  useEffect(() => {
    setRowsPerTablePage(Number(limit));
    setCurrentTablePage(1);
  }, [limit])

  // Filtered payments
  const filteredPayments = useMemo(() => {
    return payments
      .filter((p) => keyword === "" || p.Name.toLowerCase().includes(keyword.toLowerCase()))
  }, [payments, keyword]);

  // Delete payment method
  const handleDelete = async (data: paymentsDialogDataInterface | null) => {
    if (!data) return;
    const res = await deletePayments(data.id);
    if (res) {
      toast.success("Payment method deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteDialogData(null);
      fetchPayments();
      return;
    }
    toast.error("Failed to delete payment method.");
  };

  // Edit payment method
  const handleEdit = (id?: string) => {
    router.push(`/masters/payment-methods/edit/${id}`);
  };

  const handleClear = () => {
    setKeyword("");
    setLimit("10");
  };

  const totalTablePages = Math.ceil(filteredPayments.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredPayments.slice(indexOfFirstRow, indexOfLastRow);

  const nextTablePage = () => {
    if (currentTablePage !== totalTablePages) setCurrentTablePage(currentTablePage + 1);
  };
  const prevTablePage = () => {
    if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1);
  };

  return (
    <MasterProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">


        {/* DELETE POPUP */}
        <DeleteDialog<paymentsDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this payment method?"
          data={deleteDialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
          }}
          onDelete={handleDelete}
        />

        {/* Card Container */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 relative">
          <PageHeader title="Dashboard" subtitles={["Payment Methods"]} />
          {/* Add Button */}

          <AddButton
            url="/masters/payment-methods/add"
            text="Add"
            icon={<PlusSquare size={18} />}
          />

          {/* Filter Form */}
          <form className="w-full flex flex-wrap gap-6 items-end mb-6 mt-16">
            {/* Keyword */}
            <div className="flex flex-col flex-1 w-60">
              <label htmlFor="keyword" className="text-lg font-medium text-gray-900 pl-1">
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="Search by payment name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full outline-none border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              />
            </div>

            {/* Limit */}
            <div className="flex flex-col w-40">
              <label htmlFor="limit" className="text-lg font-medium text-gray-900 pl-1">
                Limit
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            {/* Clear */}
            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm hover:underline transition-all"
              >
                Clear Search
              </button>
            </div>
          </form>

          {/* Table */}
          <div className="overflow-auto">
            <table className="table-auto w-full border-collapse text-sm border border-gray-200">
              <thead className="bg-[var(--color-primary)] text-white">
                <tr className="flex justify-between items-center w-full">
                  <th className="flex items-center gap-10 px-8 py-3 border border-[var(--color-secondary-dark)] text-left w-1/2">
                    <p className="w-[60px] text-left">S.No.</p>
                    <p className="w-[200px] text-left">Name</p>
                  </th>
                  <th className="flex items-center gap-10 px-8 py-3 border border-[var(--color-secondary-dark)] text-left w-1/2 justify-end">
                    <p className="w-[120px] text-left">Status</p>
                    <p className="w-[120px] text-left">Action</p>
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((p, i) => (
                    <tr
                      key={p._id || i}
                      className="border-t flex justify-between items-center w-full hover:bg-[#f7f6f3] transition-all duration-200"
                    >
                      <td className="flex items-center gap-10 px-8 py-3 w-1/2">
                        <p className="w-[60px]">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</p>
                        <p className="w-[200px] font-semibold">{p.Name}</p>
                      </td>

                      <td className="flex items-center gap-10 px-8 py-3 w-1/2 justify-end">
                        <div className="w-[120px]">
                          <span
                            className={`px-3 py-1 rounded-[2px] text-xs font-semibold ${p.Status === "Active"
                              ? "bg-[#E8F5E9] text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {p.Status}
                          </span>
                        </div>

                        <div className="w-[120px] flex gap-2 items-center justify-start">
                          <Button
                            sx={{
                              backgroundColor: "#E8F5E9",
                              color: "var(--color-primary)",
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                            }}
                            onClick={() => handleEdit(p._id || String(i))}
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
                                id: p._id || String(i),
                                Name: p.Name,
                                Status: p.Status,
                              });
                            }}
                          >
                            <MdDelete />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-4 text-gray-500">
                      No payment methods match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentTablePage} of {totalTablePages}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevTablePage}
                  disabled={currentTablePage === 1}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={nextTablePage}
                  disabled={currentTablePage === totalTablePages || currentRows.length <= 0}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterProtectedRoute>
  );
}
