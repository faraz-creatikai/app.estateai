"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import { PlusSquare, KeyRound } from "lucide-react";
import Button from "@mui/material/Button";
import { Toaster } from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProtectedRoute from "../component/ProtectedRoutes";
import PopupMenu from "../component/popups/PopupMenu";
import SingleSelect from "@/app/component/SingleSelect";
import toast from "react-hot-toast";
import { Admin, userDeleteDialogueInterface } from "@/store/auth.interface";
import { API_ROUTES } from "@/constants/ApiRoute";
import DeleteDialog, { DeleteDialogData } from "../component/popups/DeleteDialog";
import { InputField } from "../component/InputField";
import { updateAdminPassword } from "@/store/auth";
import { useAuth } from "@/context/AuthContext";
import AddButton from "../component/buttons/AddButton";
import PageHeader from "../component/labels/PageHeader";


interface ErrorInterface {
    [key: string]: string;
}

export default function UsersPage() {

    const router = useRouter();
    const { admin } = useAuth();

    const [adminList, setAdminList] = useState<Admin[]>([]);
    const [filters, setFilters] = useState({
        Role: [] as string[],
        City: [] as string[],
        Status: [] as string[],
        Keyword: "" as string,
        Limit: [] as string[],
    });


    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [deleteDialogData, setDeleteDialogData] = useState<userDeleteDialogueInterface | null>(null);
    const [userId, setUserId] = useState("");
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [errors, setErrors] = useState<ErrorInterface>({});
    const [currentPage, setCurrentPage] = useState(1);
    const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: ""
    })

    // ✅ Fetch admin list using fetch()
    const getAdminList = async () => {
        try {
            const params = new URLSearchParams();

            if (filters.Role[0]) params.append("role", filters.Role[0]);
            if (filters.City[0]) params.append("city", filters.City[0]);
            if (filters.Status[0]) params.append("status", filters.Status[0]);

            const res = await fetch(`${API_ROUTES.ADMIN.GET_ALL}?${params}`, {
                method: "GET",
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load users");

            if (data.success) {
                let admins: Admin[] = data.admins || [];

                if (filters.Keyword) {
                    const keyword = filters.Keyword.toLowerCase();
                    admins = admins.filter(
                        (a) =>
                            a.name?.toLowerCase().includes(keyword) ||
                            a.email?.toLowerCase().includes(keyword) ||
                            a.city?.toLowerCase().includes(keyword)
                    );
                }

                setAdminList(admins);
            }
        } catch (error: any) {
            console.error("Error fetching admins:", error);
            toast.error(error.message || "Failed to load users");
        }
    };

    useEffect(() => {
        getAdminList();
    }, [filters]);

    const handleSelectChange = async (
        field: keyof typeof filters,
        selected: string | string[]
    ) => {
        const updatedFilters = {
            ...filters,
            [field]: Array.isArray(selected) ? selected : selected ? [selected] : [],
        };
        setFilters(updatedFilters);
    };

    const clearFilter = async () => {
        setFilters({
            Role: [],
            City: [],
            Status: [],
            Keyword: "",
            Limit: [],
        });
        await getAdminList();
    };

    const handleChangePassword = async () => {
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        let payload: any = passwordData;
        if (admin?.role === "administrator") {
            const { currentPassword, ...restData } = passwordData;
            payload = restData;
        }
        console.log("password data and user id : ", userId, "    ", payload, "  ", admin)
        const response = await updateAdminPassword(userId, payload);
        if (response.success) {
            toast.success("password changed successfully");
            setIsChangePasswordOpen(false);
            setUserId("");
            return;
        }
       // toast.error("failed to update password");

    }

    // Delete admin using fetch()
    const handleDelete = async (deletedata: DeleteDialogData) => {
        if (!deletedata) return;
        try {
            const res = await fetch(API_ROUTES.ADMIN.DELETE(deletedata._id), {
                method: "DELETE",
                credentials: "include",
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Delete failed");

            toast.success("User deleted successfully");
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
            getAdminList();
        } catch (error: any) {
            toast.error(error.message || "Delete failed");
        }
    };

    const validateForm = () => {
        const newErrors: ErrorInterface = {};
        if (admin?.role !== "administrator" && !passwordData.currentPassword.trim())
            newErrors.FirstName = "current password is required";
        if (!passwordData.newPassword.trim())
            newErrors.FirstName = "new password is required";

        return newErrors;
    };

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setPasswordData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => ({ ...prev, [name]: "" }));
        },
        []
    );

    // Pagination
    const totalPages = Math.ceil(adminList.length / rowsPerTablePage);
    const startIndex = (currentPage - 1) * rowsPerTablePage;
    const currentRows = adminList.slice(startIndex, startIndex + rowsPerTablePage);

    // Dynamic dropdowns
    const roles = ["administrator", "city_admin", "user"];
    const cities = Array.from(
        new Set(adminList.map((a) => a.city).filter(Boolean))
    ) as string[];
    const statuses = ["active", "inactive"];
    const limits = ["10", "25", "50", "100"];

    return (
        <ProtectedRoute>
            <div className=" min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">
                <Toaster position="top-right" />

                {/* DELETE POPUP */}
                <DeleteDialog<userDeleteDialogueInterface>
                    isOpen={isDeleteDialogOpen}
                    title="Are you sure you want to delete this customer?"
                    data={deleteDialogData}
                    onClose={() => {
                        setIsDeleteDialogOpen(false);
                        setDeleteDialogData(null);
                    }}
                    onDelete={handleDelete}
                />

                {/* change password popup  */}

                {isChangePasswordOpen && (
                    <PopupMenu onClose={() => setIsChangePasswordOpen(false)}>
                        <div className="flex flex-col gap-8 m-2 bg-white p-6 w-full max-w-[400px] rounded-md">
                            <h2 className="font-semibold text-lg text-gray-800">
                                Change Password
                            </h2>
                            <div>
                                {
                                    admin?.role !== "administrator" && <InputField
                                        label="Old Password"
                                        name="currentPassword"
                                        value={passwordData.currentPassword}
                                        onChange={handleInputChange}
                                    />
                                }
                                <InputField
                                    label="New Password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="flex justify-between items-center">
                                <button
                                    className="text-[#C62828] bg-[#FDECEA] hover:bg-[#F9D0C4] cursor-pointer rounded-md px-4 py-2"
                                    onClick={handleChangePassword}
                                >
                                    Change
                                </button>
                                <button
                                    className="cursor-pointer text-blue-800 hover:bg-gray-200 rounded-md px-4 py-2"
                                    onClick={() => setIsChangePasswordOpen(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </PopupMenu>
                )}


                <div className="w-full bg-white shadow-indigo-200 shadow-2xl rounded-md p-4">
                    {/* HEADER */}
                    <div className="flex justify-between items-center">
                        <PageHeader title="Dashboard" subtitles={["Users"]} />

                        
                        <AddButton
                            url="/users/add"
                            text="Add"
                            icon={<PlusSquare size={18} />}
                        />
                    </div>

                    {/* SEARCH FILTERS */}
                    <div className=" mt-6 rounded-md">
                        <h3 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
                            Search Filters
                        </h3>
                        <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-5">
                            <SingleSelect
                                options={roles}
                                label="Role"
                                value={filters.Role[0]}
                                onChange={(val) => handleSelectChange("Role", val)}
                            />
                            <SingleSelect
                                options={cities}
                                label="City"
                                value={filters.City[0]}
                                onChange={(val) => handleSelectChange("City", val)}
                            />
                            <SingleSelect
                                options={statuses}
                                label="Status"
                                value={filters.Status[0]}
                                onChange={(val) => handleSelectChange("Status", val)}
                            />
                            <div>
                                <label className="block mb-2 text-sm font-medium text-gray-900">
                                    Keyword
                                </label>
                                <input
                                    type="text"
                                    placeholder="Search by name, email or city"
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
                                    className="text-red-500 border border-red-300 hover:bg-red-50 px-4 py-2 rounded-md"
                                >
                                    Clear Search
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* TABLE */}
                    <section className="flex flex-col mt-6 p-2 rounded-md ">
                        <div className=" overflow-auto ">
                            <table className="table-auto w-full border-collapse text-sm border border-gray-200">
                                <thead className="bg-[var(--color-primary)] text-white">
                                    <tr>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">S.No.</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Role</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Name</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Email</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">City</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Status</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.length > 0 ? (
                                        currentRows.map((item, index) => (
                                            <tr
                                                key={item._id}
                                                className="border-t hover:bg-[#f7f6f3] transition-all duration-200"
                                            >
                                                <td className="px-4 border border-gray-200 py-3">{startIndex + index + 1}</td>
                                                <td className="px-4 py-3 border border-gray-200 capitalize">{item.role}</td>
                                                <td className="px-4 py-3 border border-gray-200">{item.name}</td>
                                                <td className="px-4 py-3 border border-gray-200">{item.email}</td>
                                                <td className="px-4 py-3 border border-gray-200">{item.city || "-"}</td>
                                                <td className="px-4 py-3 border border-gray-200 capitalize">
                                                    {item.status || "active"}
                                                </td>
                                                <td className="px-4 py-2 flex gap-2 items-center">
                                                    <Button
                                                        sx={{
                                                            backgroundColor: "#E3F2FD",
                                                            color: "#1565C0",
                                                            minWidth: "32px",
                                                            height: "32px",
                                                            borderRadius: "8px",
                                                        }}
                                                        onClick={() => {

                                                            setIsChangePasswordOpen(true);

                                                            setUserId(item?._id ?? "");
                                                        }}
                                                    >
                                                        <KeyRound size={16} />
                                                    </Button>
                                                    <Button
                                                        sx={{
                                                            backgroundColor: "#E8F5E9",
                                                            color: "var(--color-primary)",
                                                            minWidth: "32px",
                                                            height: "32px",
                                                            borderRadius: "8px",
                                                        }}
                                                        onClick={() => router.push(`/users/edit/${item._id}`)}
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
                                                                _id: item._id ?? "",
                                                                name: item.name
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
                                            <td colSpan={7} className="text-center py-4 text-gray-500">
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
