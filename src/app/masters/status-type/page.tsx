"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from "@mui/material/Button";
import { PlusSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import DeleteDialog from "../../component/popups/DeleteDialog";
import {
  statustypeGetDataInterface,
  statustypeDialogDataInterface
} from "@/store/masters/statustype/statustype.interface";
import { deleteStatusType, getStatusType } from "@/store/masters/statustype/statustype"; // You'll implement these
import PageHeader from "@/app/component/labels/PageHeader";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
import AddButton from "@/app/component/buttons/AddButton";
import LeadStatus from "@/app/phonescreens/DashboardScreens/LeadStatus";

export default function StatusTypePage() {
  const [statusTypes, setStatusTypes] = useState<statustypeGetDataInterface[]>([]);
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState("10");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<statustypeDialogDataInterface | null>(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
  const router = useRouter();

  // Fetch status types
  const fetchStatusTypes = async () => {
    try {
      const data = await getStatusType(); // API call
      if (data) {
        const formatted = data.map((s: statustypeGetDataInterface) => ({
          ...s,
          Name: s.Name.charAt(0).toUpperCase() + s.Name.slice(1),
        }));
        setStatusTypes(formatted);
      }
    } catch (error) {
      toast.error("Failed to fetch status types");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchStatusTypes();
  }, []);

  useEffect(() => {
    setRowsPerTablePage(Number(limit));
    setCurrentTablePage(1);
  }, [limit])

  // Filtered Data
  const filteredStatusTypes = useMemo(() => {
    return statusTypes
      .filter(s => keyword === "" || s.Name.toLowerCase().includes(keyword.toLowerCase()))
  }, [statusTypes, keyword, limit]);

  // Delete Status Type
  const handleDelete = async (data: statustypeDialogDataInterface | null) => {
    if (!data) return;
    try {
      const res = await deleteStatusType(data.id);
      if (res) {
        toast.success("Status type deleted successfully!");
        setIsDeleteDialogOpen(false);
        setDeleteDialogData(null);
        fetchStatusTypes();
        return;
      }
      toast.error("Failed to delete status type");
    } catch (error) {
      toast.error("Failed to delete status type");
      console.error(error);
    }
  };

  // Edit Status Type
  const handleEdit = (id?: string) => {
    router.push(`/masters/status-type/edit/${id}`);
  };

  const handleClear = () => {
    setKeyword("");
    setLimit("10");
  };

  const totalTablePages = Math.ceil(filteredStatusTypes.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredStatusTypes.slice(indexOfFirstRow, indexOfLastRow);

  const nexttablePage = () => {
    if (currentTablePage !== totalTablePages) setCurrentTablePage(currentTablePage + 1);
  };
  const prevtablePage = () => {
    if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1);
  };

  return (
    <MasterProtectedRoute>
      <Toaster position="top-right" />
      <div className=" sm:hidden py-2">
        <h1 className=" text-[var(--color-primary)] font-bold text-2xl px-0 py-2">Status Types</h1>
        <LeadStatus leadStatuses={statusTypes.map((item) => ({ name: item.Name }))} />
      </div>
      <div className="min-h-[calc(100vh-56px)] max-sm:hidden overflow-auto max-md:py-10">


        {/* DELETE DIALOG */}
        <DeleteDialog<statustypeDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this status type?"
          data={deleteDialogData}
          onClose={() => { setIsDeleteDialogOpen(false); setDeleteDialogData(null); }}
          onDelete={handleDelete}
        />

        {/* Card Container */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 relative">
          <PageHeader title="Dashboard" subtitles={["Status Type"]} />
          {/* Add Button */}

          <AddButton
            url="/masters/status-type/add"
            text="Add"
            icon={<PlusSquare size={18} />}
          />

          {/* Filter Form */}
          <form className="w-full flex flex-wrap gap-6 items-end mb-6 mt-16">
            <div className="flex flex-col flex-1 w-60">
              <label htmlFor="keyword" className="text-lg font-medium text-gray-900 pl-1">Keyword</label>
              <input
                id="keyword"
                type="text"
                placeholder="Search by status type..."
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
              <button type="button" onClick={handleClear} className="px-4 py-2 text-sm hover:underline transition-all">
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
                    <tr key={s._id || i} className="border-t flex justify-between items-center w-full hover:bg-[#f7f6f3] transition-all duration-200">
                      <td className="flex items-center gap-10 px-8 py-3 w-1/2">
                        <p className="w-[60px]">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</p>
                        <p className="w-[200px] font-semibold">{s.Name}</p>
                      </td>
                      <td className="flex items-center gap-10 px-8 py-3 w-1/2 justify-end">
                        <div className="w-[120px]">
                          <span className={`px-3 py-1 rounded-[2px] text-xs font-semibold ${s.Status === "Active" ? "bg-[#E8F5E9] text-green-700" : "bg-red-100 text-red-700"}`}>
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
                      No status types match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">Page {currentTablePage} of {totalTablePages}</p>
              <div className="flex gap-3">
                <button type="button" onClick={prevtablePage} disabled={currentTablePage === 1} className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50">Prev</button>
                <button type="button" onClick={nexttablePage} disabled={(currentTablePage === totalTablePages) || (currentRows.length <= 0)} className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50">Next</button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </MasterProtectedRoute>
  );
}
