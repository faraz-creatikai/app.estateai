"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from "@mui/material/Button";
import { PlusSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import PopupMenu from "../../component/popups/PopupMenu";
import DeleteDialog from "@/app/component/popups/DeleteDialog";
import { deleteAllLocation, deleteLocation, getLocation } from "@/store/masters/location/location";
import { locationAllDataInterface } from "@/store/masters/location/location.interface";
import AddButton from "@/app/component/buttons/AddButton";
import PageHeader from "@/app/component/labels/PageHeader";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
/* import { getLocations, deleteLocation } from "@/store/locations"; */ // for future API integration

interface LocationType {
  _id?: string;
  Name: string;
  City: {
    _id: string;
    Name: string;
  };
  Status: string;
}

interface DeleteDialogData {
  id: string;
  name: string;
}

interface DeleteAllDialogDataInterface { }

export default function LocationPage() {
  const [locations, setLocations] = useState<LocationType[]>([]);
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState("10");
  const [selectedCity, setSelectedCity] = useState("");
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<DeleteDialogData | null>(null);
  const [deleteAllDialogData, setDeleteAllDialogData] =
    useState<DeleteAllDialogDataInterface | null>(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const router = useRouter();

  // Fetch locations
  const fetchLocations = async () => {
    const data = await getLocation();
    if (data) setLocations(data);
    /* const data = [
      { Name: "Main Warehouse", City: "Jaipur", Status: "Active" },
      { Name: "Secondary Storage", City: "Delhi", Status: "Inactive" },
      { Name: "North Outlet", City: "Mumbai", Status: "Active" },
    ]; */

    const dataFormat = data.map((l: locationAllDataInterface) => ({
      ...l,
      Name: l.Name.charAt(0).toUpperCase() + l.Name.slice(1),

    }));

    setLocations(dataFormat);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    setRowsPerTablePage(Number(limit));
    setCurrentTablePage(1);
  }, [limit])

  // Filter and limit data
  const filteredLocations = useMemo(() => {
    return locations
      .filter((l) => {
        const matchesKeyword =
          keyword === "" ||
          l.Name.toLowerCase().includes(keyword.toLowerCase());
        const matchesCity =
          selectedCity === "" ||
          l.City?.Name.toLowerCase() === selectedCity.toLowerCase();
        return matchesKeyword && matchesCity;
      })
  }, [locations, keyword, selectedCity, limit]);

  /* SELECT ALL HANDLER */
  const handleSelectAll = () => {
    const allIds = currentRows.map((c) => c._id);
    setSelectedLocations((prev: any) =>
      allIds.every((id) => prev.includes(id))
        ? prev.filter((id: any) => !allIds.includes(id)) // unselect all
        : [...new Set([...prev, ...allIds])] // select all visible rows
    );
  };
  /* ✅ SELECT SINGLE ROW HANDLER */
  const handleSelectRow = (id: string) => {
    setSelectedLocations((prev) =>
      prev.includes(id)
        ? prev.filter((cid) => cid !== id)
        : [...prev, id]
    );
  };

  // Pagination
  const totalTablePages = Math.ceil(filteredLocations.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredLocations.slice(indexOfFirstRow, indexOfLastRow);

  const nexttablePage = () => {
    if (currentTablePage !== totalTablePages) setCurrentTablePage(currentTablePage + 1);
  };
  const prevtablePage = () => {
    if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1);
  };

  // Delete location
  const handleDelete = async (data: DeleteDialogData | null) => {
    if (!data) return;
    const res = await deleteLocation(data.id);
    if (res) {
      toast.success("Location deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteDialogData(null);
      fetchLocations();
      return;
    }
    toast.error("Failed to delete location.");
  };

  const handleDeleteAll = async () => {
    if (filteredLocations.length === 0) return;
    const payload = {
      locationIds: [...selectedLocations]
    }
    const response = await deleteAllLocation(payload);
    if (response) {
      toast.success(`All types deleted`);
      setIsDeleteAllDialogOpen(false);
      setDeleteAllDialogData(null);
      setSelectedLocations([]);

      fetchLocations();
      return;
    }
  };

  // Edit location
  const handleEdit = (id?: string) => {
    router.push(`/masters/locations/edit/${id}`);
  };

  const handleClear = () => {
    setKeyword("");
    setSelectedCity("");
    setLimit("10");
  };

  return (
    <MasterProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">


        {/* DELETE POPUP */}
        <DeleteDialog<DeleteDialogData>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this followup?"
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


        {/* Main Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 relative">
          <PageHeader title="Dashboard" subtitles={["Locations"]} />
          {/* Add Button */}

          <AddButton
            url="/masters/locations/add"
            text="Add"
            icon={<PlusSquare size={18} />}
          />

          {/* Filters */}
          <form className="w-full flex flex-wrap gap-6 items-end mb-6 mt-16">
            {/* Keyword */}
            <div className="flex flex-col flex-1 w-60">
              <label htmlFor="keyword" className="text-lg font-medium text-gray-900 pl-1">
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="Search by location name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full outline-none border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              />
            </div>

            {/* City Filter */}
            <div className="flex flex-col w-40">
              <label htmlFor="city" className="text-lg font-medium text-gray-900 pl-1">
                City
              </label>
              <select
                id="city"
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              >
                <option value="">All Cities</option>
                <option value="Jaipur">Jaipur</option>
                <option value="Delhi">Delhi</option>
                <option value="Mumbai">Mumbai</option>
              </select>
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
            <div className=" flex justify-between items-center sticky top-0 left-0 w-full">
              <div className="flex gap-10 items-center px-3 py-4 min-w-max text-gray-700">
                <label htmlFor="selectall" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
                    <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">Select All</span>
                  </label>
                  <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                      if (filteredLocations.length > 0) {
                        if (selectedLocations.length < 1) {
                          const firstPageIds = currentRows.map((c) => c._id).filter((id): id is string => id !== undefined);
                          setSelectedLocations(firstPageIds);
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
                          currentRows.every((r: any) => selectedLocations.includes(r._id))
                        }
                        onChange={handleSelectAll}
                      />
                    </p>
                    <p className="w-[60px] text-left">S.No.</p>
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
                            checked={selectedLocations.includes(l._id ?? '')}
                            onChange={() => handleSelectRow(l._id ?? '')}
                          />
                        </p>
                        <p className="w-[60px]">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</p>
                        <p className="w-[200px] font-semibold">{l.Name}</p>
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

            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentTablePage} of {totalTablePages}
              </p>
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
                  disabled={
                    currentTablePage === totalTablePages || currentRows.length <= 0
                  }
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
