"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from "@mui/material/Button";
import { PlusSquare } from "lucide-react";
import { useRouter } from "next/navigation";

import DeleteDialog from "../../component/popups/DeleteDialog";
import PageHeader from "@/app/component/labels/PageHeader";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
import AddButton from "@/app/component/buttons/AddButton";

import {
  contactstatustypeGetDataInterface,
  contactstatustypeDialogDataInterface
} from "@/store/masters/contactstatustype/contactstatustype.interface";

import {
  getContactStatusType,
  deleteContactStatusType
} from "@/store/masters/contactstatustype/contactstatustype";

export default function ContactStatusTypePage() {
  const [contactStatusTypes, setContactStatusTypes] = useState<contactstatustypeGetDataInterface[]>([]);
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState("10");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<contactstatustypeDialogDataInterface | null>(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);

  const router = useRouter();

  // Fetch contact status types
  const fetchContactStatusTypes = async () => {
    try {
      const data = await getContactStatusType();
      if (data) {
        const formatted = data.map((s: contactstatustypeGetDataInterface) => ({
          ...s,
          Name: s.Name.charAt(0).toUpperCase() + s.Name.slice(1),
        }));
        setContactStatusTypes(formatted);
      }
    } catch (error) {
      toast.error("Failed to fetch contact status types");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchContactStatusTypes();
  }, []);

  useEffect(() => {
    setRowsPerTablePage(Number(limit));
    setCurrentTablePage(1);
  }, [limit]);

  // Filter
  const filteredData = useMemo(() => {
    return contactStatusTypes.filter((s) =>
      keyword === "" || s.Name.toLowerCase().includes(keyword.toLowerCase())
    );
  }, [contactStatusTypes, keyword]);

  // Delete
  const handleDelete = async (data: contactstatustypeDialogDataInterface | null) => {
    if (!data) return;

    try {
      const res = await deleteContactStatusType(data.id);
      if (res) {
        toast.success("Contact status type deleted successfully!");
        setIsDeleteDialogOpen(false);
        setDeleteDialogData(null);
        fetchContactStatusTypes();
        return;
      }
      toast.error("Failed to delete contact status type");
    } catch (error) {
      toast.error("Failed to delete contact status type");
      console.error(error);
    }
  };

  // Edit
  const handleEdit = (id?: string) => {
    router.push(`/masters/contact-statustype/edit/${id}`);
  };

  const handleClear = () => {
    setKeyword("");
    setLimit("10");
  };

  // Pagination
  const totalTablePages = Math.ceil(filteredData.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const nextPage = () => {
    if (currentTablePage !== totalTablePages) setCurrentTablePage(currentTablePage + 1);
  };
  const prevPage = () => {
    if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1);
  };

  return (
    <MasterProtectedRoute>
      <Toaster position="top-right" />

      <div className="min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">

        {/* DELETE DIALOG */}
        <DeleteDialog<contactstatustypeDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this Contact Status Type?"
          data={deleteDialogData}
          onClose={() => { setIsDeleteDialogOpen(false); setDeleteDialogData(null); }}
          onDelete={handleDelete}
        />

        {/* Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 relative">
          <PageHeader title="Dashboard" subtitles={["Contact Status Type"]} />

          {/* Add Button */}
          <AddButton
            url="/masters/contact-statustype/add"
            text="Add"
            icon={<PlusSquare size={18} />}
          />

          {/* Filters */}
          <form className="w-full flex flex-wrap gap-6 items-end mb-6 mt-16">
            <div className="flex flex-col flex-1 w-60">
              <label htmlFor="keyword" className="text-lg font-medium text-gray-900 pl-1">Keyword</label>
              <input
                id="keyword"
                type="text"
                placeholder="Search by name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full outline-none border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              />
            </div>

            <div className="flex flex-col w-40">
              <label htmlFor="limit" className="text-lg font-medium text-gray-900 pl-1">Limit</label>
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
                  currentRows.map((s, i) => (
                    <tr key={s._id} className="border-t flex justify-between items-center w-full hover:bg-[#f7f6f3] transition-all">
                      <td className="flex items-center gap-10 px-8 py-3 w-1/2">
                        <p className="w-[60px]">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</p>
                        <p className="w-[200px] font-semibold">{s.Name}</p>
                      </td>

                      <td className="flex items-center gap-10 px-8 py-3 w-1/2 justify-end">
                        <div className="w-[120px]">
                          <span
                            className={`px-3 py-1 rounded-[2px] text-xs font-semibold
                              ${s.Status === "Active" ? "bg-[#E8F5E9] text-green-700" : "bg-red-100 text-red-700"}
                            `}
                          >
                            {s.Status}
                          </span>
                        </div>

                        <div className="w-[120px] flex gap-2 items-center justify-start">
                          <Button
                            sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                            onClick={() => handleEdit(s._id)}
                          >
                            <MdEdit />
                          </Button>

                          <Button
                            sx={{ backgroundColor: "#FDECEA", color: "#C62828", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                            onClick={() => {
                              setIsDeleteDialogOpen(true);
                              setDeleteDialogData({ id: s._id, Name: s.Name, Status: s.Status });
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
                      No contact status types found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

           

          </div>
           {/* Pagination */}
            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentTablePage} of {totalTablePages}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevPage}
                  disabled={currentTablePage === 1}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={nextPage}
                  disabled={currentTablePage === totalTablePages || currentRows.length <= 0}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
        </div>

      </div>
    </MasterProtectedRoute>
  );
}
