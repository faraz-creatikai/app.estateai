"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from "@mui/material/Button";
import { PlusSquare } from "lucide-react";
import { useRouter } from "next/navigation";

import DeleteDialog from "@/app/component/popups/DeleteDialog";
import AddButton from "@/app/component/buttons/AddButton";
import PageHeader from "@/app/component/labels/PageHeader";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

import {
  getsubLocation,
  deletesubLocation,
  deleteallsubLocation,
} from "@/store/masters/sublocation/sublocation";

import {
  subLocationAllDataInterface,
  subLocationGetDataInterface,
} from "@/store/masters/sublocation/sublocation.interface";

/* ================= TYPES ================= */
interface DeleteDialogData {
  id: string;
  name: string;
}

interface DeleteAllDialogDataInterface { }

export default function SubLocationPage() {
  const router = useRouter();

  const [subLocations, setSubLocations] = useState<
    subLocationGetDataInterface[]
  >([]);
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState("10");
  const [selectedCity, setSelectedCity] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] =
    useState<DeleteDialogData | null>(null);
  const [deleteAllDialogData, setDeleteAllDialogData] =
    useState<DeleteAllDialogDataInterface | null>(null);

  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
  const [selectedSubLocations, setSelectedSubLocations] = useState<string[]>([]);

  /* ================= FETCH ================= */
  const fetchSubLocations = async () => {
    const data = await getsubLocation();
    if (!data) return;

    const formatted = data.map((l: subLocationAllDataInterface) => ({
      ...l,
      Name: l.Name.charAt(0).toUpperCase() + l.Name.slice(1),
    }));

    setSubLocations(formatted);
  };

  useEffect(() => {
    fetchSubLocations();
  }, []);

  useEffect(() => {
    setRowsPerTablePage(Number(limit));
    setCurrentTablePage(1);
  }, [limit]);

  /* ================= FILTER ================= */
  const filteredSubLocations = useMemo(() => {
    return subLocations.filter((l) => {
      const matchesKeyword =
        keyword === "" ||
        l.Name.toLowerCase().includes(keyword.toLowerCase());

      const matchesCity =
        selectedCity === "" ||
        l.City?.Name.toLowerCase() === selectedCity.toLowerCase();

      const matchesLocation =
        selectedLocation === "" ||
        l.Location?.Name.toLowerCase() === selectedLocation.toLowerCase();

      return matchesKeyword && matchesCity && matchesLocation;
    });
  }, [subLocations, keyword, selectedCity, selectedLocation]);

  /* ================= PAGINATION ================= */
  const totalTablePages = Math.ceil(
    filteredSubLocations.length / rowsPerTablePage
  );
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredSubLocations.slice(
    indexOfFirstRow,
    indexOfLastRow
  );

  const nexttablePage = () => {
    if (currentTablePage !== totalTablePages)
      setCurrentTablePage(currentTablePage + 1);
  };

  const prevtablePage = () => {
    if (currentTablePage !== 1)
      setCurrentTablePage(currentTablePage - 1);
  };

  /* SELECT ALL HANDLER */
  const handleSelectAll = () => {
    const allIds = currentRows.map((c) => c._id);
    setSelectedSubLocations((prev) =>
      allIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !allIds.includes(id)) // unselect all
        : [...new Set([...prev, ...allIds])] // select all visible rows
    );
  };
  /* ✅ SELECT SINGLE ROW HANDLER */
  const handleSelectRow = (id: string) => {
    setSelectedSubLocations((prev) =>
      prev.includes(id)
        ? prev.filter((cid) => cid !== id)
        : [...prev, id]
    );
  };

  /* ================= ACTIONS ================= */
  const handleDelete = async (data: DeleteDialogData | null) => {
    if (!data) return;

    const res = await deletesubLocation(data.id);
    if (res) {
      toast.success("Sub Location deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteDialogData(null);
      fetchSubLocations();
      return;
    }
    toast.error("Failed to delete sub location.");
  };

  const handleDeleteAll = async () => {
    if (filteredSubLocations.length === 0) return;
    const payload = {
      subLocationIds: [...selectedSubLocations]
    }
    const response = await deleteallsubLocation(payload);
    if (response) {
      toast.success(`All types deleted`);
      setIsDeleteAllDialogOpen(false);
      setDeleteAllDialogData(null);
      setSelectedSubLocations([]);

      fetchSubLocations();
      return;
    }
  };

  const handleEdit = (id?: string) => {
    router.push(`/masters/sublocation/edit/${id}`);
  };

  const handleClear = () => {
    setKeyword("");
    setSelectedCity("");
    setSelectedLocation("");
    setLimit("10");
  };

  return (
    <MasterProtectedRoute>
      <Toaster position="top-right" />

      {/* DELETE POPUP */}
      <DeleteDialog<DeleteDialogData>
        isOpen={isDeleteDialogOpen}
        title="Are you sure you want to delete this sub location?"
        data={deleteDialogData}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDeleteDialogData(null);
        }}
        onDelete={handleDelete}
      />
      <DeleteDialog<DeleteAllDialogDataInterface>
        isOpen={isDeleteAllDialogOpen}
        title="Are you sure you want to delete selected locations?"
        data={deleteAllDialogData}
        onClose={() => {
          setIsDeleteAllDialogOpen(false);
          setDeleteAllDialogData(null);
        }}
        onDelete={handleDeleteAll}
      />

      <div className="min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 relative">
          <PageHeader title="Dashboard" subtitles={["Sub Locations"]} />

          <AddButton
            url="/masters/sublocation/add"
            text="Add"
            icon={<PlusSquare size={18} />}
          />

          {/* ================= FILTERS ================= */}
          <form className="w-full flex flex-wrap gap-6 items-end mb-6 mt-16">
            <div className="flex flex-col flex-1 w-60">
              <label className="text-lg font-medium pl-1">Keyword</label>
              <input
                className="border rounded-md px-3 py-2"
                placeholder="Search by sub location name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
              />
            </div>

            <div className="flex flex-col w-40">
              <label className="text-lg font-medium pl-1">City</label>
              <select
                className="border rounded-md px-3 py-2"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
              >
                <option value="">All Cities</option>
                {Array.from(
                  new Set(subLocations.map((l) => l.City?.Name))
                ).map(
                  (city) =>
                    city && (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    )
                )}
              </select>
            </div>

            <div className="flex flex-col w-40">
              <label className="text-lg font-medium pl-1">Location</label>
              <select
                className="border rounded-md px-3 py-2"
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
              >
                <option value="">All Locations</option>
                {Array.from(
                  new Set(subLocations.map((l) => l.Location?.Name))
                ).map(
                  (loc) =>
                    loc && (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    )
                )}
              </select>
            </div>

            <div className="flex flex-col w-40">
              <label className="text-lg font-medium pl-1">Limit</label>
              <select
                className="border rounded-md px-3 py-2"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="ml-auto">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm hover:underline"
              >
                Clear Search
              </button>
            </div>
          </form>

          {/* ================= TABLE ================= */}
          <div className="overflow-auto relative">
            <div className=" flex justify-between items-center sticky top-0 left-0 w-full">
              <div className="flex gap-10 items-center px-3 py-4 min-w-max text-gray-700">
                <label htmlFor="selectall" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
                  <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative">Select All</span>
                </label>
                <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                  if (filteredSubLocations.length > 0) {
                    if (selectedSubLocations.length < 1) {
                      const firstPageIds = currentRows.map((c) => c._id).filter((id): id is string => id !== undefined);
                      setSelectedSubLocations(firstPageIds);
                    }

                    setIsDeleteAllDialogOpen(true);
                    setDeleteAllDialogData({});
                  }
                }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative ">Delete All</span>
                </button>
              </div>
            </div>
            <table className="table-auto w-full border-collapse text-sm border border-gray-200">
              <thead className="bg-[var(--color-primary)] text-white">
                <tr className="flex justify-between items-center w-full">
                  {/* Left section (S.No + Name + City) */}
                  <th className="flex items-center gap-10 px-8 py-3 border border-[var(--color-secondary-dark)] text-left w-2/3">
                    <p className="w-[30px]">
                      <input
                        id="selectall"
                        type="checkbox"
                        className=" hidden"
                        checked={
                          currentRows.length > 0 &&
                          currentRows.every((r: any) => selectedSubLocations.includes(r._id))
                        }
                        onChange={handleSelectAll}
                      />
                    </p>
                    <p className="w-[60px] text-left">S.No.</p>
                    <p className="w-[200px] text-left">Sub Location</p>
                    <p className="w-[200px] text-left">Location Name</p>
                    <p className="w-[200px] text-left">City</p>
                  </th>

                  {/* Right section (Status + Action) */}
                  <th className="flex items-center gap-10 px-8 py-3 border border-[var(--color-secondary-dark)] text-left w-1/3 justify-end">
                    <p className="w-[120px] text-left">Status</p>
                    <p className="w-[120px] text-left">Action</p>
                  </th>
                </tr>
              </thead>

              <tbody>
                {currentRows.length > 0 ? (
                  currentRows.map((l, i) => (
                    <tr
                      key={l._id || i}
                      className="border-t flex justify-between items-center w-full hover:bg-[#f7f6f3] transition-all duration-200"
                    >
                      <td className="flex items-center gap-10 px-8 py-3 w-2/3">
                        <p className="w-[60px]">
                          <input
                            type="checkbox"
                            checked={selectedSubLocations.includes(l._id ?? '')}
                            onChange={() => handleSelectRow(l._id ?? '')}
                          />
                        </p>
                        <p className="w-[60px]">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</p>
                        <p className="w-[200px] font-semibold">{l.Name}</p>
                        <p className="w-[200px] font-semibold">{l.Location?.Name}</p>
                        <p className="w-[200px]">{l.City?.Name}</p>
                      </td>

                      <td className="flex items-center gap-10 px-8 py-3 w-1/3 justify-end">
                        <div className="w-[120px]">
                          <span
                            className={`px-3 py-1 rounded-[2px] text-xs font-semibold ${l.Status === "Active"
                              ? "bg-[#E8F5E9] text-green-700"
                              : "bg-red-100 text-red-700"
                              }`}
                          >
                            {l.Status}
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
                            onClick={() => handleEdit(l._id || String(i))}
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
                                id: l._id || String(i),
                                name: l.Name,
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
                      No locations match your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentTablePage} of {totalTablePages}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={prevtablePage}
                  disabled={currentTablePage === 1}
                  className="px-3 py-1 bg-gray-200 border rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={nexttablePage}
                  disabled={currentTablePage === totalTablePages}
                  className="px-3 py-1 bg-gray-200 border rounded disabled:opacity-50"
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
