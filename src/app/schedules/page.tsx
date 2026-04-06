"use client";

import React, { useEffect, useState, useMemo } from "react";
import { BookDownIcon, PlusSquare } from "lucide-react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from '@mui/material/Button';
import { useRouter } from "next/navigation";
import PopupMenu from "../component/popups/PopupMenu"; // Reuse your popup
import { ScheduleType, DeleteDialogDataInterface, schedulesDeletePayloadInterface, ScheduleTetDataInterface } from "../../store/schedules.interface";
import { deleteSchedules, getSchedules } from "@/store/schedules";
import ProtectedRoute from "../component/ProtectedRoutes";
import AddButton from "../component/buttons/AddButton";
import PageHeader from "../component/labels/PageHeader";
import DeleteDialog from "../component/popups/DeleteDialog";



interface DeleteAllDialogDataInterface { }

export default function SchedulePage() {
  const [schedules, setSchedules] = useState<ScheduleTetDataInterface[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<DeleteDialogDataInterface | null>(null);
  const [deleteAllDialogData, setDeleteAllDialogData] =
    useState<DeleteAllDialogDataInterface | null>(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);



  const router = useRouter();
  const API_URL = "https://live-project-backend-viiy.onrender.com/api/sch";
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);

  const [scheduleIds, setSchedulesIds] = useState<string[]>([]);


  // Fetch schedules from API
  const fetchSchedules = async () => {
    const data = await getSchedules();
    if (data) setSchedules(data);
  };

  useEffect(() => {
    fetchSchedules();
  }, []);

  

  // Unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = schedules.map((s) => s.User).filter(Boolean);
    return Array.from(new Set(users));
  }, [schedules]);

  // Filtered schedules
  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      const matchesUser =
        selectedUser === "" || s.User.toLowerCase().includes(selectedUser.toLowerCase());
      const matchesKeyword =
        keyword === "" ||
        s.Description.toLowerCase().includes(keyword.toLowerCase()) ||
        s.date.includes(keyword) ||
        s.Time.includes(keyword);
      return matchesUser && matchesKeyword;
    });
  }, [schedules, keyword, selectedUser]);

  const totalTablePages = Math.ceil(filteredSchedules.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredSchedules.slice(indexOfFirstRow, indexOfLastRow);
  const nexttablePage = () => { if (currentTablePage !== totalTablePages) setCurrentTablePage(currentTablePage + 1); };
  const prevtablePage = () => { if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1); };

  // Delete schedule via API
  const deleteSchedule = async () => {
    //if (!data) return;

    const payload = {
      scheduleIds: [...scheduleIds]
      
    }
    const res = await deleteSchedules(payload);
    if (res) {
      toast.success("Schedule deleted successfully!");
      setIsDeleteDialogOpen(false);
      setIsDeleteAllDialogOpen(false);
      setDeleteDialogData(null);
      setSchedulesIds([]);
      fetchSchedules();
      return;
    }
    toast.error("Failed to delete schedule.");
  };

  //Edit redirect
  const editCustomer = (id?: string) => {
    router.push(`schedules/edit?id=${id}`);
  };
  const addShedules = () => {
    router.push(`/schedules/add`);
  };

  const handleClear = () => {
    setKeyword("");
    setSelectedUser("");
  };

  const handleSelectAll = () => {
    const allIds = currentRows.map((s) => s._id);

    setSchedulesIds((prev) =>
      allIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !allIds.includes(id)) // unselect all
        : [...new Set([...prev, ...allIds])]        // select all
    );
  };


  const handleSelectRow = (id: string) => {
    setSchedulesIds((prev) =>
      prev.includes(id)
        ? prev.filter((sid) => sid !== id)
        : [...prev, id]
    );
  };



  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-56px)] overflow-auto  max-md:py-10">
        {/* Header */}


        {/* DELETE POPUP */}
        <DeleteDialog<DeleteDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this schedule?"
          data={deleteDialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
          }}
          onDelete={deleteSchedule}
        />

        <DeleteDialog<DeleteAllDialogDataInterface>
          isOpen={isDeleteAllDialogOpen}
          title="Are you sure you want to delete ALL schedules?"
          data={deleteAllDialogData}
          onClose={() => {
            setIsDeleteAllDialogOpen(false);
            setDeleteAllDialogData(null);
          }}
          onDelete={deleteSchedule}
        />


        <div className=" w-full bg-white shadow-indigo-200 shadow-2xl rounded-md p-4">
          <div className="flex justify-between items-center">
            <PageHeader title="Dashboard" subtitles={["Schedules"]} />

            <AddButton
              url="/schedules/add"
              text="Add"
              icon={<PlusSquare size={18} />}
            />
          </div>
          {/* Add Button */}


          {/* Filter Form */}
          <form className="w-full flex flex-wrap gap-6 items-end mb-6 mt-16">
            {/* User Filter */}
            <div className="flex flex-col w-60">
              <label htmlFor="user" className="text-lg font-medium text-gray-900 pl-1">
                User
              </label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              >
                <option value="">All Users</option>
                {uniqueUsers.map((user, idx) => (
                  <option key={idx} value={user}>
                    {user}
                  </option>
                ))}
              </select>
            </div>

            {/* Keyword Filter */}
            <div className="flex flex-col flex-1 w-60">
              <label htmlFor="keyword" className="text-lg font-medium text-gray-900 pl-1">
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="Search description, date, or time..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full outline-none border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              />
            </div>

            {/* Clear & Export */}
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
          <div className="flex gap-10 items-center px-3 py-4 min-w-max text-gray-700">
            <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
              if (filteredSchedules.length > 0) {
                if(scheduleIds.length<1){
                 const firstPageIds = currentRows.map((c) => c._id);
                    setSchedulesIds(firstPageIds);
                }
                setIsDeleteAllDialogOpen(true);
                setDeleteAllDialogData({});
              }
            }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
              <span className="relative ">Delete All</span>
            </button>
            <label htmlFor="selectall" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
              <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
              <span className="relative">Select All</span>
            </label>

          </div>
          <div className="overflow-auto">

            <table className="table-auto w-full border-collapse text-sm border border-gray-200">
              <thead className="bg-[var(--color-primary)] text-white">
                <tr>
                  <th className="px-2 py-3 border border-[var(--color-secondary-dark)] text-left">
                    <input
                      id="selectall"
                      type="checkbox"
                      checked={
                        currentRows.length > 0 &&
                        currentRows.every((r) => scheduleIds.includes(r._id))
                      }
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">S.No.</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">User</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Description</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Date</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Time</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Action</th>
                </tr>
              </thead>
              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((s, i) => (
                    <tr key={s._id || i} className="border-t hover:bg-[#f7f6f3] transition-all duration-200">
                      <td className="px-2 py-3 border border-gray-200">
                        <input
                          type="checkbox"
                          checked={scheduleIds.includes(s._id)}
                          onChange={() => handleSelectRow(s._id)}
                        />
                      </td>

                      <td className="px-4 py-3 border border-gray-200">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</td>
                      <td className="px-4 py-3 border border-gray-200">{s.User}</td>
                      <td className="px-4 py-3 border border-gray-200">{s.Description}</td>
                      <td className="px-4 py-3 border border-gray-200">{s.date}</td>
                      <td className="px-4 py-3 border border-gray-200">{s.Time}</td>
                      <td className="px-4 py-2 flex gap-2 items-center">
                        <Button
                          sx={{
                            backgroundColor: "#E8F5E9",
                            color: "var(--color-primary)",
                            minWidth: "32px",
                            height: "32px",
                            borderRadius: "8px",
                          }}
                          onClick={() => editCustomer(s._id || String(i))}
                        >
                          <MdEdit />
                        </Button>
                        <Button
                          sx={{
                            backgroundColor: "#F9D0C4",
                            color: "#C62828",
                            minWidth: "32px",
                            height: "32px",
                            borderRadius: "8px",
                          }}
                          onClick={() => {
                            setSchedulesIds([s._id || ""])
                            setIsDeleteDialogOpen(true);
                            setDeleteDialogData({
                              id: s._id || String(i),
                              description: s.Description,
                              date: s.date,
                            });
                          }}
                        >
                          <MdDelete />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No schedules match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-3 py-3 px-5">
            <p className="text-sm">Page {currentTablePage} of {totalTablePages}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={prevtablePage}
                disabled={currentTablePage === 1}
                className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                type="button"
                onClick={nexttablePage}
                disabled={(currentTablePage === totalTablePages) || (currentRows.length <= 0)}
                className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>


        </div>
      </div>
    </ProtectedRoute>
  );
}
