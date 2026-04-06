'use client'
import { useEffect, useState } from "react";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import Button from '@mui/material/Button';
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusSquare } from "lucide-react";
import ProtectedRoute from "../component/ProtectedRoutes";
import PopupMenu from "../component/popups/PopupMenu";
import toast, { Toaster } from "react-hot-toast";
import { companyprojectDialogDataInterface, companyprojectGetDataInterface } from "@/store/companyproject/companyproject.interface";
import { deleteCompanyProjects, getCompanyProjects } from "@/store/companyproject/companyproject";
import DeleteDialog from "../component/popups/DeleteDialog";
import AddButton from "../component/buttons/AddButton";
import PageHeader from "../component/labels/PageHeader";


export default function CompanyProjects() {
  const router = useRouter();

  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<companyprojectDialogDataInterface | null>(null);

  const rowsPerTablePage = 10;
  const [projectsData, setProjectsData] = useState<companyprojectGetDataInterface[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    const data = await getCompanyProjects();
    if (data) setProjectsData(data);
  };

  const handleDelete = async (data: companyprojectDialogDataInterface | null) => {
    if (!data) return;
    const response = await deleteCompanyProjects(data.id);
    if (response) {
      toast.success("Project deleted successfully");
      setIsDeleteDialogOpen(false);
      setDeleteDialogData(null);
      fetchProjects();
    }
  };

  const editProject = (id: string | number) => {
    router.push(`/company_project/edit/${id}`);
  };

  const addProject = () => {
    router.push(`/company_project/add`);
  };

  const totalTablePages = Math.ceil(projectsData.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = projectsData.slice(indexOfFirstRow, indexOfLastRow);
  

  const nextTablePage = () => {
    if (currentTablePage !== totalTablePages) setCurrentTablePage(currentTablePage + 1);
  };
  const prevTablePage = () => {
    if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1);
  };

  return (
    <ProtectedRoute>
      <div className=" min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">
        <Toaster position="top-right" />

        {/* DELETE POPUP */}
        <DeleteDialog<companyprojectDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this followup?"
          data={deleteDialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
          }}
          onDelete={handleDelete}
        />


        <div className=" w-full bg-white shadow-indigo-200 shadow-2xl rounded-md p-4">
          <div className="flex justify-between items-center">
            <PageHeader title="Dashboard" subtitles={["Company Projects"]} />

            <AddButton
              url="/company_project/add"
              text="Add"
              icon={<PlusSquare size={18} />}
            />

          </div>

          {/* TABLE */}
          <section className="flex flex-col mt-6 ">
            <div className=" overflow-auto ">
              <table className="table-auto w-full border-collapse text-sm border border-gray-200">
                <thead className="bg-[var(--color-primary)] text-white">
                  <tr>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">S.No.</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Project Name</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Project Type</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Location</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Area</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Range</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Date</th>
                    <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-100 transition-colors duration-200"
                      >
                        <td className="px-4 py-3 border border-gray-200">{indexOfFirstRow + index + 1}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.ProjectName}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.ProjectType}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Location}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Area}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Range}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Date}</td>
                        <td className="px-4 py-2  flex gap-2 items-center">
                          <Button
                            sx={{
                              backgroundColor: "#D4EDDA",
                              color: "#2E7D32",
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                            }}
                            onClick={() => editProject(item._id)}
                          >
                            <MdEdit />
                          </Button>
                          <Button
                            sx={{
                              backgroundColor: "#F8D7D5",
                              color: "#C62828",
                              minWidth: "32px",
                              height: "32px",
                              borderRadius: "8px",
                            }}
                            onClick={() => {
                              setIsDeleteDialogOpen(true);
                              setDeleteDialogData({
                                id: item._id,
                                ProjectName: item.ProjectName,
                                ProjectType: item.ProjectType,
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
                      <td
                        colSpan={8}
                        className="text-center py-4 text-gray-500 border border-gray-200"
                      >
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="flex justify-between mt-2 items-center py-3 px-5">
              <p className="text-sm">Page {currentTablePage} of {totalTablePages}</p>
              <div className="flex gap-3">
                <button type="button" onClick={prevTablePage} disabled={currentTablePage === 1} className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50">Prev</button>
                <button type="button" onClick={nextTablePage} disabled={(currentTablePage === totalTablePages) || (currentRows.length <= 0)} className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50">Next</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
