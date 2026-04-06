"use client";

import React, { useEffect, useState, useMemo } from "react";
import { PlusSquare } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from '@mui/material/Button';
import { useRouter } from "next/navigation";
import { deleteTask, getTask } from "@/store/task";
import { TaskType, DeleteDialogDataInterface, TaskGetDataInterface } from "@/store/task.interface";
import ProtectedRoute from "../component/ProtectedRoutes";
import AddButton from "../component/buttons/AddButton";
import PageHeader from "../component/labels/PageHeader";
import DeleteDialog from "../component/popups/DeleteDialog";
import LeadsSection from "../phonescreens/DashboardScreens/LeadsSection";
import TaskTable from "../phonescreens/DashboardScreens/tables/TaskTable";

export default function TaskPage() {
  const [task, setTask] = useState<TaskGetDataInterface[]>([]);
  const [keyword, setKeyword] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<DeleteDialogDataInterface | null>(null);
  const [taskIds, setTaskIds] = useState<string[]>([]);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);

  const router = useRouter();

  // Fetch Task from API
  const fetchTask = async () => {
    const data = await getTask();
    if (data) setTask(data);
  };

  useEffect(() => {
    fetchTask();
  }, []);

  // Unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = task.map((s) => s.User).filter(Boolean);
    return Array.from(new Set(users));
  }, [task]);

  // Filtered task
  const filteredTask = useMemo(() => {
    return task.filter((s) => {
      const matchesUser =
        selectedUser === "" || s.User.toLowerCase().includes(selectedUser.toLowerCase());
      const matchesKeyword =
        keyword === "" ||
        s.Description.toLowerCase().includes(keyword.toLowerCase()) ||
        s.date.includes(keyword) ||
        s.Time.includes(keyword);
      return matchesUser && matchesKeyword;
    });
  }, [task, keyword, selectedUser]);

  const totalTablePages = Math.ceil(filteredTask.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredTask.slice(indexOfFirstRow, indexOfLastRow);
  const nextTablePage = () => { if (currentTablePage < totalTablePages) setCurrentTablePage(currentTablePage + 1); };
  const prevTablePage = () => { if (currentTablePage > 1) setCurrentTablePage(currentTablePage - 1); };

  // Delete task via API
  const deleteTaskFunc = async () => {
    const payload = { taskIds: [...taskIds] };
    const res = await deleteTask(payload);
    if (res) {
      toast.success("Task deleted successfully!");
      setIsDeleteDialogOpen(false);
      setIsDeleteAllDialogOpen(false);
      setDeleteDialogData(null);
      setTaskIds([]);
      fetchTask();
      return;
    }
    toast.error("Failed to delete task.");
  };

  // Edit redirect
  const editTask = (id?: string) => {
    router.push(`task/edit?id=${id}`);
  };
  const addTask = () => {
    router.push(`/task/add`);
  };

  const handleClear = () => {
    setKeyword("");
    setSelectedUser("");
  };

  // Row selection
  const handleSelectAll = () => {
    const allIds = currentRows.map((t) => t._id);
    setTaskIds((prev) =>
      allIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !allIds.includes(id)) // unselect all
        : [...new Set([...prev, ...allIds])]        // select all
    );
  };

  const handleSelectRow = (id: string) => {
    setTaskIds((prev) =>
      prev.includes(id)
        ? prev.filter((tid) => tid !== id)
        : [...prev, id]
    );
  };

  const phonetableheader = [{
    key: "date", label: "Date"
  },
  {
    key: "Time", label: "Time"
  },
  {
    key: "Description", label: "Description"
  },
  {
    key: "User", label: "User"
  },]

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      {/* DELETE POPUPS */}
      <DeleteDialog<DeleteDialogDataInterface>
        isOpen={isDeleteDialogOpen}
        title="Are you sure you want to delete this task?"
        data={deleteDialogData}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteDialogData(null);
        }}
        onDelete={deleteTaskFunc}
      />
      <DeleteDialog<{}>
        isOpen={isDeleteAllDialogOpen}
        title="Are you sure you want to delete ALL selected tasks?"
        data={{}}
        onClose={() => setIsDeleteAllDialogOpen(false)}
        onDelete={deleteTaskFunc}
      />

      <div className=" sm:hidden min-h-[calc(100vh-56px)] overflow-auto max-sm:py-2">
        <div className=" flex justify-between items-center px-2 mb-4">
          <h1 className=" text-[var(--color-primary)] font-extrabold text-2xl ">Tasks</h1>
          <AddButton url="/task/add" text="Add" icon={<PlusSquare size={18} />} />
        </div>
        <TaskTable
          leads={task}
          labelLeads={phonetableheader}
          onEdit={(id) => editTask(id)}
          onDelete={(lead) => {
            setTaskIds([lead._id || ""]);
            setIsDeleteDialogOpen(true);
            setDeleteDialogData({ id: lead._id, description: lead.Description, date: lead.date });
          }}
        />
      </div>
      <div className="min-h-[calc(100vh-56px)] max-sm:hidden overflow-auto max-md:py-10">

        {/* DELETE POPUPS */}
        <DeleteDialog<DeleteDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this task?"
          data={deleteDialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
          }}
          onDelete={deleteTaskFunc}
        />
        <DeleteDialog<{}>
          isOpen={isDeleteAllDialogOpen}
          title="Are you sure you want to delete ALL selected tasks?"
          data={{}}
          onClose={() => setIsDeleteAllDialogOpen(false)}
          onDelete={deleteTaskFunc}
        />

        {/* Card Container */}
        <div className=" w-full bg-white shadow-indigo-200 shadow-2xl rounded-md p-4">
          <div className="flex justify-between items-center">
            <PageHeader title="Dashboard" subtitles={["Tasks"]} />
            <AddButton url="/task/add" text="Add" icon={<PlusSquare size={18} />} />
          </div>

          {/* Filter Form */}
          <form className="w-full flex flex-wrap gap-6 items-end mb-6 mt-16">
            <div className="flex flex-col w-60">
              <label htmlFor="user" className="text-lg font-medium text-gray-900 pl-1">User</label>
              <select
                id="user"
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#d4af37]"
              >
                <option value="">All Users</option>
                {uniqueUsers.map((user, idx) => <option key={idx} value={user}>{user}</option>)}
              </select>
            </div>

            <div className="flex flex-col flex-1 w-60">
              <label htmlFor="keyword" className="text-lg font-medium text-gray-900 pl-1">Keyword</label>
              <input
                id="keyword"
                type="text"
                placeholder="Search description, date, or time..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full border outline-none border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              />
            </div>

            <div className="flex gap-3 ml-auto">
              <button type="button" onClick={handleClear} className="px-4 py-2 text-sm hover:underline transition-all">Clear Search</button>
            </div>
          </form>

          {/* Table Controls */}
          <div className="flex gap-10 items-center px-3 py-4 min-w-max text-gray-700">
            {/* <button type="button" className="hover:text-gray-950 cursor-pointer" onClick={() => { if(taskIds.length) setIsDeleteAllDialogOpen(true); }}>Delete All</button> */}
            <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
              if (filteredTask.length > 0) {
                if(taskIds.length<1){
                 const firstPageIds = currentRows.map((c) => c._id);
                    setTaskIds(firstPageIds);
                }
                setIsDeleteAllDialogOpen(true);
              }
            }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
              <span className="relative ">Delete All</span>
            </button>
            <label htmlFor="selectall" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
              <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
              <span className="relative">Select All</span>
            </label>
            {/* Add other buttons here: SMS All, Email All, Mass Update */}
          </div>

          {/* Table */}
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
                        currentRows.every((r) => taskIds.includes(r._id))
                      }
                      onChange={handleSelectAll}
                    />

                  </th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">S.No.</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Date</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Time</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Description</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">User</th>
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
                          checked={taskIds.includes(s._id)}
                          onChange={() => handleSelectRow(s._id)}
                        />
                      </td>
                      <td className="px-4 py-3 border border-gray-200">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</td>
                      <td className="px-4 py-3 border border-gray-200">{s.date}</td>
                      <td className="px-4 py-3 border border-gray-200">{s.Time}</td>
                      <td className="px-4 py-3 border border-gray-200">{s.Description}</td>
                      <td className="px-4 py-3 border border-gray-200">{s.User}</td>
                      <td className="px-4 py-2 flex gap-2 items-center">
                        <Button sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px" }} onClick={() => editTask(s._id || String(i))}><MdEdit /></Button>
                        <Button sx={{ backgroundColor: "#F9D0C4", color: "#C62828", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                          onClick={() => { setTaskIds([s._id || ""]); setIsDeleteDialogOpen(true); setDeleteDialogData({ id: s._id || String(i), description: s.Description, date: s.date }); }}>
                          <MdDelete />
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-4 text-gray-500">
                      No task match your search.
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
              <button type="button" onClick={prevTablePage} disabled={currentTablePage === 1} className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50">Prev</button>
              <button type="button" onClick={nextTablePage} disabled={currentTablePage === totalTablePages || currentRows.length <= 0} className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50">Next</button>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
