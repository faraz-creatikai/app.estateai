'use client'

import { useEffect, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import { PlusSquare } from "lucide-react";
import Button from "@mui/material/Button";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import ProtectedRoute from "../component/ProtectedRoutes";
import PopupMenu from "../component/popups/PopupMenu";
import toast from "react-hot-toast";
import AddButton from "../component/buttons/AddButton";
import PageHeader from "../component/labels/PageHeader";

interface RequirementData {
  _id: string;
  user: string;
  contact: string;
  campaign: string;
  propertyType: string;
  city: string;
  location: string;
  priceRange: string;
  description: string;
  dateManage: string;
}

export default function RequirementsPage() {
  const router = useRouter();

  const [requirementData, setRequirementData] = useState<RequirementData[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);

  useEffect(() => {
    getRequirementsList();
  }, []);

  const getRequirementsList = async () => {
    // Example placeholder for fetching API data
    // const data = await getRequirements();
    // if (data) setRequirementData(data);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    // const res = await deleteRequirement(deleteId);
    // if (res) {
    //   toast.success("Requirement deleted successfully");
    //   setIsDeleteDialogOpen(false);
    //   getRequirementsList();
    // }
  };

  // Pagination logic
  const totalPages = Math.ceil(requirementData.length / rowsPerTablePage);
  const startIndex = (currentPage - 1) * rowsPerTablePage;
  const currentRows = requirementData.slice(startIndex, startIndex + rowsPerTablePage);

  return (
    <ProtectedRoute>
      <div className=" min-h-[calc(100vh-56px)] overflow-auto  max-md:py-10">
        <Toaster position="top-right" />

        {/* DELETE POPUP */}
        {isDeleteDialogOpen && (
          <PopupMenu onClose={() => setIsDeleteDialogOpen(false)}>
            <div className="flex flex-col gap-8 m-2">
              <h2 className="font-semibold text-lg text-gray-800">
                Are you sure you want to delete this requirement?
              </h2>
              <div className="flex justify-between items-center">
                <button
                  className="text-[#C62828] bg-[#FDECEA] hover:bg-[#F9D0C4] cursor-pointer rounded-md px-4 py-2"
                  onClick={handleDelete}
                >
                  Yes, delete
                </button>
                <button
                  className="cursor-pointer text-blue-800 hover:bg-gray-200 rounded-md px-4 py-2"
                  onClick={() => setIsDeleteDialogOpen(false)}
                >
                  No
                </button>
              </div>
            </div>
          </PopupMenu>
        )}

        <div className="p-4 bg-white rounded-md w-full">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <PageHeader title="Dashboard" subtitles={["Requirements"]} />

            <AddButton
               url="/customer/add"
               text="Add"
               icon={<PlusSquare size={18} />}
             />
          </div>

          {/* TABLE */}
          <section className="flex flex-col mt-6  ">
            <div className=" overflow-auto">
            <table className="table-auto w-full border-collapse text-sm border border-gray-200">
              <thead className="bg-[var(--color-primary)] text-white">
                <tr>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">S.No.</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">User</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Contact</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Campaign</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Property Type</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">City</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Location</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Price Range</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Description</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Date Manage</th>
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
                      <td className="px-4 py-3 border border-gray-200">{item.user}</td>
                      <td className="px-4 py-3 border border-gray-200">{item.contact}</td>
                      <td className="px-4 py-3 border border-gray-200">{item.campaign}</td>
                      <td className="px-4 py-3 border border-gray-200">{item.propertyType}</td>
                      <td className="px-4 py-3 border border-gray-200">{item.city}</td>
                      <td className="px-4 py-3 border border-gray-200">{item.location}</td>
                      <td className="px-4 py-3 border border-gray-200">{item.priceRange}</td>
                      <td className="px-4 py-3 border border-gray-200">{item.description}</td>
                      <td className="px-4 py-3 border border-gray-200">{item.dateManage}</td>

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
                            router.push(`/customer/edit/${item._id}`)
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
                    <td
                      colSpan={11}
                      className="text-center py-4 text-gray-500"
                    >
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
                Page {currentPage} of {totalPages || 1}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      prev < totalPages ? prev + 1 : prev
                    )
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
