'use client'
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import Button from '@mui/material/Button';
import SingleSelect from "@/app/component/SingleSelect";
import DateSelector from "@/app/component/DateSelector";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { PlusSquare } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from "@/app/component/ProtectedRoutes";
import PopupMenu from "@/app/component/popups/PopupMenu";
import DeleteDialog from "@/app/component/popups/DeleteDialog";
import { IoMdClose } from "react-icons/io";

import {
    getAllCustomerFollowups,
    getFilteredFollowups,
    deleteCustomerFollowup,
    getFollowupByCustomerId,
    deleteFollowup,
} from "@/store/customerFollowups";

import {
    customerFollowupGetDataInterface,
    CustomerFollowupAdvInterface,
    DeleteDialogDataInterface,
    FollowupDeleteDialogDataInterface,
    customerFollowupAllDataInterface,
} from "@/store/customerFollowups.interface";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getCity } from "@/store/masters/city/city";
import { getLocation } from "@/store/masters/location/location";
import { getAllAdmins } from "@/store/auth";
import PageHeader from "@/app/component/labels/PageHeader";
import { getTypes } from "@/store/masters/types/types";
import { getStatusType } from "@/store/masters/statustype/statustype";
import LeadsSection from "@/app/phonescreens/DashboardScreens/LeadsSection";
import FollowupTable from "@/app/phonescreens/DashboardScreens/tables/FollowupTable";
import DynamicAdvance from "@/app/phonescreens/DashboardScreens/DynamicAdvance";

export default function CustomerFollowups() {
    const router = useRouter();
    const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
    const [currentTablePage, setCurrentTablePage] = useState(1);
    const [followupData, setFollowupData] = useState<customerFollowupGetDataInterface[]>([]);
    const [followupAdv, setFollowupAdv] = useState<CustomerFollowupAdvInterface[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteDialogData, setDeleteDialogData] = useState<DeleteDialogDataInterface | null>(null);

    const [isFollowupDeleteDialogOpen, setIsFollowupDeleteDialogOpen] = useState(false);
    const [followupdeleteDialogData, setFollowupDeleteDialogData] = useState<FollowupDeleteDialogDataInterface | null>(null);
    const [isfollowupDialogOpen, setIsFollowupDialogOpen] = useState(false);
    const [followupDialogData, setFollowupDialogData] = useState<customerFollowupAllDataInterface[] | null>([]);
    const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
    const searchParams = useSearchParams();

    const [rowsPerTablePage, setRowsPerTablePage] = useState(10);

    const [filters, setFilters] = useState({
        Campaign: [] as string[],
        PropertyType: [] as string[],
        StatusType: [] as string[],
        City: [] as string[],
        Location: [] as string[],
        User: [] as string[],
        Keyword: "" as string,
        StartDate: "",
        EndDate: "",
        Limit: ["10"] as string[],
    });

    // 🔹 Fetch All Followups
    useEffect(() => {
        getFollowups();
        fetchFields();
    }, []);

    useEffect(() => {
        const status = searchParams.get("StatusType");

        if (status) {
            // Auto set filter
            setFilters((prev) => ({
                ...prev,
                StatusAssign: [status],
            }));

            // Fetch filtered data
            handleSelectChange("StatusType", status);
        }
    }, [searchParams, followupData]);
    const getFollowups = async () => {
        const data = await getAllCustomerFollowups();
        // console.log(" data of luffy , ", data)
        if (data) {
            setFollowupData(data.map((item: any) => {
                const date = new Date(item.updatedAt);
                const formattedDate =
                    date.getDate().toString().padStart(2, "0") + "-" +
                    (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
                    date.getFullYear();
                return {
                    _id: item._id,
                    customerid: item.customer._id,
                    Name: item.customer.customerName,
                    ContactNumber: item.customer.ContactNumber,
                    User: item.customer.AssignTo?.name ?? "",
                    Date: formattedDate,
                }
            }));
            setFollowupAdv(
                data.map((item: any) => ({
                    _id: [item._id],
                    Campaign: item.Campaign || [],
                    PropertyType: item.CustomerType || [],
                    StatusType: item.StatusType || [],
                    City: item.City || [],
                    Location: item.Location || [],
                    User: item.User || [],
                    Keyword: "",
                    StartDate: "",
                    EndDate: "",
                    Limit: [],
                }))
            );
        }
    };

    // 🔹 Delete Followup
    const handleDelete = async (data: DeleteDialogDataInterface | null) => {
        if (!data) return;
        const response = await deleteCustomerFollowup(data.id);
        if (response && response.success) {
            toast.success("Followup deleted successfully");
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
            getFollowups();
        } else {
            toast.error("Failed to delete followup");
        }
    };

    // 🔹 Edit + Add
    const editFollowup = (id: string) => router.push(`/customer/edit/${id}`);
    const addFollowup = (id: string) => router.push(`/followups/customer/add/${id}`);

    // 🔹 Pagination
    const totalTablePages = Math.ceil(followupData.length / rowsPerTablePage);
    const indexOfLastRow = currentTablePage * rowsPerTablePage;
    const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
    const currentRows = followupData?.slice(indexOfFirstRow, indexOfLastRow);
    const nexttablePage = () => { if (currentTablePage !== totalTablePages) setCurrentTablePage(currentTablePage + 1); };
    const prevtablePage = () => { if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1); };

    useEffect(() => {
        const safeLimit = Number(filters.Limit?.[0]);
        setRowsPerTablePage(safeLimit);
        setCurrentTablePage(1);
    }, [filters.Limit]);

    // 🔹 Filters
    const handleSelectChange = async (field: keyof typeof filters, selected: string | string[]) => {
        const updatedFilters = {
            ...filters,
            [field]: Array.isArray(selected) ? selected : selected ? [selected] : [],
        };
        setFilters(updatedFilters);

        const queryParams = new URLSearchParams();
        Object.entries(updatedFilters).forEach(([key, value]) => {
            if (key === "Limit") return;
            if (Array.isArray(value) && value.length > 0) value.forEach(v => queryParams.append(key, v));
            else if (typeof value === "string" && value) queryParams.append(key, value);
        });

        const data = await getFilteredFollowups(queryParams.toString());
        console.log("filtered followups ", data)
        if (data) setFollowupData(data.map((item: any) => {
            const date = new Date(item.updatedAt);
            const formattedDate =
                date.getDate().toString().padStart(2, "0") + "-" +
                (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
                date.getFullYear();
            return {
                _id: item._id,
                customerid: item.customer._id,
                Name: item.customer.customerName,
                ContactNumber: item.customer.ContactNumber,
                User: item.customer.AssignTo?.name ?? "",
                Date: formattedDate,
            }
        }));
    };

    const clearFilter = async () => {
        setFilters({
            Campaign: [],
            PropertyType: [],
            StatusType: [],
            City: [],
            Location: [],
            User: [],
            Keyword: "",
            StartDate: "",
            EndDate: "",
            Limit: ["10"],
        });
        await getFollowups();
    };

    const handleFollowups = async (id: string) => {
        const data = await getFollowupByCustomerId(id as string);
        if (data) {
            console.log("Followups customer data", data)
            setFollowupDialogData(data.map((item: any) => ({
                _id: item._id,
                customer: item.customer._id,
                StartDate: item.StartDate,
                StatusType: item.StatusType,
                FollowupNextDate: item.FollowupNextDate,
                Description: item.Description,
            })));
            return;
        }
    }
    const editThisFollowup = async (id: string) => {
        router.push(`/followups/customer/edit/${id}`);
    }

    const deleteThisFollowup = async (data: FollowupDeleteDialogDataInterface) => {
        //alert(id)
        if (!data) return;
        const response = await deleteFollowup(data.id);
        if (response && response.success) {
            toast.success("Followup deleted successfully");
            setIsFollowupDialogOpen(false);
            setIsFollowupDeleteDialogOpen(true);
            setFollowupDeleteDialogData(null);
            getFollowups();
        } else {
            toast.error("Failed to delete followup");
        }
    }

    const getCustomerName = (id: string) => {
        const data = followupData.find(item => item.customerid === id);
        // console.log("Customer Name Data", data)
        return data ? data.Name : "";
    }




    const fetchFields = async () => {
        await handleFieldOptions(
            [
                { key: "StatusTypes", fetchFn: getStatusType },
                { key: "Campaign", fetchFn: getCampaign },
                { key: "PropertyTypes", fetchFn: getTypes },
                { key: "City", fetchFn: getCity },
                { key: "Location", fetchFn: getLocation },
                { key: "Users", fetchFn: getAllAdmins },
            ],
            setFieldOptions
        );
    }

    const campaign = ['Buyer', 'Seller', 'Rent Out', 'Rent In', 'Hostel/PG', 'Agents', 'Services', 'Others', 'Guest House', 'Happy Stay'];
    const propertyTypes = ['Flat', 'Villa', 'Plot', 'Commercial'];
    const statusTypes = ['Open', 'Closed', 'Pending'];
    const cities = ['Mumbai', 'Delhi', 'Bangalore'];
    const locations = ['Andheri', 'Borivali', 'Powai'];
    const users = ['Admin', 'Agent1', 'Agent2'];
    const phonetableheader = [{
        key: "Name", label: "Name"
    },
    {
        key: "ContactNumber", label: "Contact No"
    },
    {
        key: "User", label: "User"
    },
    {
        key: "Date", label: "Date"
    },]
    // 🔹 UI
    return (
        <ProtectedRoute>
            <Toaster position="top-right" />

            {/* DELETE POPUP */}
            <DeleteDialog<DeleteDialogDataInterface>
                isOpen={isDeleteDialogOpen}
                title="Are you sure you want to delete this followup?"
                data={deleteDialogData}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setDeleteDialogData(null);
                }}
                onDelete={handleDelete}
            />
            <DeleteDialog<FollowupDeleteDialogDataInterface>
                isOpen={isFollowupDeleteDialogOpen}
                title={`Are you sure you want delete the followup for customer ${getCustomerName(followupdeleteDialogData?.id || "")}?`}
                data={followupdeleteDialogData}
                onClose={() => {
                    setFollowupDeleteDialogData(null)
                    setIsFollowupDeleteDialogOpen(false);
                }}
                onDelete={deleteThisFollowup}
            />
            {
                isfollowupDialogOpen && Array.isArray(followupDialogData) && followupDialogData.length > 0 && (
                    <PopupMenu onClose={() => { setIsFollowupDialogOpen(false); setFollowupDialogData([]); }}>
                        <div className="flex flex-col border border-gray-300/30 overflow-y-auto  bg-gray-100 text-[var(--color-secondary-darker)] rounded-xl shadow-lg p-6 max-w-[800px] gap-6 m-2 w-full  max-h-[80vh] overflow-auto">
                            <h2 className="text-2xl text-[var(--color-secondary-darker)] font-extrabold flex justify-between items-center"><div>Customer <span className=" text-[var(--color-primary)]">Followups</span> </div> <button className=" cursor-pointer" onClick={() => {
                                setFollowupDialogData(null)
                                setIsFollowupDialogOpen(false);
                            }}><IoMdClose /></button></h2>
                            <div className=" overflow-y-auto max-h-[100vh]">
                                {
                                    followupDialogData.map((item, index) => (
                                        <div key={item._id ?? +index} className=" flex justify-between border border-gray-300 rounded-md p-4">
                                            <div className=" flex flex-col gap-2">
                                                <p><span className="font-semibold">Followup Date:</span> {item.StartDate}</p>
                                                <p><span className="font-semibold">Status Type:</span> {item.StatusType}</p>
                                                <p><span className="font-semibold">Next Followup Date:</span> {item.FollowupNextDate}</p>
                                                <p><span className="font-semibold">Description:</span> {item.Description}</p>
                                            </div>
                                            <div className=" flex flex-wrap gap-2 justify-center items-center-safe ">
                                                <Button
                                                    sx={{
                                                        backgroundColor: "#E8F5E9",
                                                        color: "var(--color-primary)",
                                                        minWidth: "32px",
                                                        height: "32px",
                                                        borderRadius: "8px",
                                                    }}
                                                    onClick={() => editThisFollowup(item._id ?? "")}
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
                                                        setIsFollowupDialogOpen(false);
                                                        setIsFollowupDeleteDialogOpen(true);
                                                        setFollowupDeleteDialogData({
                                                            id: item._id ?? "",
                                                            Name: getCustomerName(item.customer)
                                                        });
                                                    }}
                                                >
                                                    <MdDelete />
                                                </Button>
                                            </div>

                                        </div>
                                    ))
                                }
                            </div>

                        </div>
                    </PopupMenu>
                )
            }

            <div className=" sm:hidden min-h-[calc(100vh-56px)] overflow-auto max-sm:py-2">
                <h1 className=" text-[var(--color-primary)] font-bold text-2xl px-0 ">Report</h1>
                <div>
                    <DynamicAdvance>
                        <SingleSelect options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []} value={filters.Campaign[0]} label="Campaign" onChange={(val) => handleSelectChange("Campaign", val)} />
                        <SingleSelect options={Array.isArray(fieldOptions?.PropertyTypes) ? fieldOptions.PropertyTypes : []} value={filters.PropertyType[0]} label="Property Type" onChange={(val) => handleSelectChange("PropertyType", val)} />
                        <SingleSelect options={Array.isArray(fieldOptions?.StatusTypes) ? fieldOptions.StatusTypes : []} value={filters.StatusType[0]} label="Status Type" onChange={(val) => handleSelectChange("StatusType", val)} />
                        <SingleSelect options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []} value={filters.City[0]} label="City" onChange={(val) => handleSelectChange("City", val)} />
                        <SingleSelect options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []} value={filters.Location[0]} label="Location" onChange={(val) => handleSelectChange("Location", val)} />
                        <div className=" w-full flex justify-end">
                            <button type="reset" onClick={clearFilter} className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2 rounded-md">
                                Clear Search
                            </button>
                        </div>
                    </DynamicAdvance>
                </div>
                <FollowupTable
                    leads={followupData}
                    labelLeads={phonetableheader}
                    onFollowup={(lead) => {
                        setIsFollowupDialogOpen(true);
                        handleFollowups(lead.customerid);
                    }}
                    onAdd={(id) => addFollowup(id)}
                    onEdit={(id) => editFollowup(id)}
                    onDelete={(lead) => {
                        setIsDeleteDialogOpen(true);
                        setDeleteDialogData({
                            id: lead.customerid,
                            ContactNumber: lead.ContactNumber
                        });
                    }}
                />

            </div>
            <div className="min-h-[calc(100vh-56px)] max-sm:hidden overflow-auto max-md:py-10">







                <div className="p-4 bg-white rounded-md max-md:p-3 w-full">
                    <div className="flex justify-between items-center">
                        <PageHeader title="Dashboard" subtitles={["Followups", "Customer"]} />
                        {/* <Link href="/followups/customer/add">
              <button className="flex items-center gap-2 bg-gradient-to-r from-gray-900 to-[#4e6787] text-white px-4 py-2 rounded-md font-semibold">
                <PlusSquare size={18} /> Add
              </button>
            </Link> */}
                    </div>

                    {/* Advanced Search */}
                    <section className="flex flex-col mt-6 p-2 bg-white rounded-md">
                        <div className="m-5 relative">
                            <div className="flex justify-between items-center py-1 px-2 border border-gray-800 rounded-md cursor-pointer" onClick={() => setToggleSearchDropdown(!toggleSearchDropdown)}>
                                <h3 className="flex items-center gap-1"><CiSearch />Advance Search</h3>
                                <button type="button" className="p-2 hover:bg-gray-200 rounded-md cursor-pointer">
                                    {toggleSearchDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                                </button>
                            </div>

                            <div className={`overflow-hidden ${toggleSearchDropdown ? 'max-h-[2000px]' : 'max-h-0'} transition-all duration-500 ease-in-out px-5`}>
                                <div className="flex flex-col gap-5 my-5">
                                    <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1 max-lg:grid-cols-2">
                                        <SingleSelect options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []} value={filters.Campaign[0]} label="Campaign" onChange={(val) => handleSelectChange("Campaign", val)} />
                                        <SingleSelect options={Array.isArray(fieldOptions?.PropertyTypes) ? fieldOptions.PropertyTypes : []} value={filters.PropertyType[0]} label="Property Type" onChange={(val) => handleSelectChange("PropertyType", val)} />
                                        <SingleSelect options={Array.isArray(fieldOptions?.StatusTypes) ? fieldOptions.StatusTypes : []} value={filters.StatusType[0]} label="Status Type" onChange={(val) => handleSelectChange("StatusType", val)} />
                                        <SingleSelect options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []} value={filters.City[0]} label="City" onChange={(val) => handleSelectChange("City", val)} />
                                        <SingleSelect options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []} value={filters.Location[0]} label="Location" onChange={(val) => handleSelectChange("Location", val)} />
                                        {/* <SingleSelect options={Array.isArray(fieldOptions?.Users) ? fieldOptions.Users : []} value={filters.User[0]} label="User" onChange={(val) => handleSelectChange("User", val)} /> */}
                                        <SingleSelect options={["10", "25", "50", "100"]} value={filters.Limit[0]} label="Limit" onChange={(val) => handleSelectChange("Limit", val)} />
                                    </div>
                                </div>

                                <form className="flex flex-wrap max-md:flex-col justify-between items-center mb-5">
                                    <div className="min-w-[80%]">
                                        <label className="block mb-2 text-sm font-medium text-[var(--color-secondary-darker)]">AI Genie</label>
                                        <input
                                            type="text"
                                            placeholder="type text here.."
                                            className="border border-gray-300 rounded-md px-3 py-2 outline-none w-full"
                                            value={filters.Keyword}
                                            onChange={(e) => handleSelectChange("Keyword", e.target.value)}
                                        />
                                    </div>
                                    <div className="flex justify-center items-center">
                                        <button type="submit" className="border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 cursor-pointer px-3 py-2 mt-6 rounded-md">
                                            Explore
                                        </button>
                                        <button type="reset" onClick={clearFilter} className="text-red-500 text-sm px-5 py-2 mt-6 hover:underline cursor-pointer rounded-md ml-3">
                                            Clear Search
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* TABLE */}
                        <div className=" overflow-auto">
                            <table className="table-auto w-full border-collapse text-sm border border-gray-200">
                                <thead className="bg-[var(--color-primary)] text-white">
                                    <tr>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)]  text-left"></th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)]  text-left">S.No.</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)]  text-left">Name</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)]  text-left">Contact No</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)]  text-left">User</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)]  text-left">Date</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)]  text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.length > 0 ? (
                                        currentRows
                                            .filter(
                                                (item, index, arr) =>
                                                    arr.findIndex((row) => row.customerid === item.customerid) === index //keeps only first occurrence
                                            )
                                            .map((item, index) => (
                                                <tr
                                                    key={item._id}
                                                    className="border-t hover:bg-[#f7f6f3] transition-all duration-200"
                                                >
                                                    <td
                                                        className="px-4 py-3  border border-gray-200 text-[var(--color-primary)] cursor-pointer hover:underline"
                                                        onClick={() => {
                                                            setIsFollowupDialogOpen(true);
                                                            handleFollowups(item.customerid);
                                                        }}
                                                    >
                                                        Follow UP
                                                    </td>
                                                    <td className="px-4 py-3  border border-gray-200">{indexOfFirstRow + index + 1}</td>
                                                    <td className="px-4 py-3  border border-gray-200">{item.Name}</td>
                                                    <td className="px-4 py-3  border border-gray-200">{item.ContactNumber}</td>
                                                    <td className="px-4 py-3  border border-gray-200">{item.User}</td>
                                                    <td className="px-4 py-3  border border-gray-200">{item.Date}</td>
                                                    <td className="px-4 py-2  flex gap-2 items-center">
                                                        <Button
                                                            sx={{
                                                                backgroundColor: "#E8F5E9",
                                                                color: "var(--color-primary)",
                                                                minWidth: "32px",
                                                                height: "32px",
                                                                borderRadius: "8px",
                                                            }}
                                                            onClick={() => addFollowup(item.customerid)}
                                                        >
                                                            <MdAdd />
                                                        </Button>

                                                        <Button
                                                            sx={{
                                                                backgroundColor: "#E8F5E9",
                                                                color: "var(--color-primary)",
                                                                minWidth: "32px",
                                                                height: "32px",
                                                                borderRadius: "8px",
                                                            }}
                                                            onClick={() => editFollowup(item.customerid)}
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
                                                                    id: item.customerid,
                                                                    ContactNumber: item.ContactNumber
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
                                                No followups available.
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
                    </section>
                </div>
            </div>
        </ProtectedRoute>
    );
}
