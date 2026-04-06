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
import { getLocation, getLocationByCity } from "@/store/masters/location/location";
import { getAllAdmins } from "@/store/auth";
import PageHeader from "@/app/component/labels/PageHeader";
import { getTypes, getTypesByCampaign } from "@/store/masters/types/types";
import { getStatusType } from "@/store/masters/statustype/statustype";
import LeadsSection from "@/app/phonescreens/DashboardScreens/LeadsSection";
import FollowupTable from "@/app/phonescreens/DashboardScreens/tables/FollowupTable";
import DynamicAdvance from "@/app/phonescreens/DashboardScreens/DynamicAdvance";
import { getSubtypeByCampaignAndType } from "@/store/masters/subtype/subtype";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import { getsubLocationByCityLoc } from "@/store/masters/sublocation/sublocation";
import { Sub } from "@radix-ui/react-dropdown-menu";
import { BsPersonFill } from "react-icons/bs";

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
        SubLocation: [] as string[],
        User: [] as string[],
        Keyword: "" as string,
        StartDate: "",
        EndDate: "",
        Limit: ["10"] as string[],
    });

    const [dependent, setDependent] = useState({
        Campaign: { id: "", name: "" },
        PropertyType: { id: "", name: "" },
        City: { id: "", name: "" },
        Location: { id: "", name: "" },
        SubLocation: { id: "", name: "" },
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
        console.log(" data of luffy , ", data, " length ", data?.length)
        if (data) {
            const filteredData = data.filter((item, index, arr) => {
                if (!item.customer?._id) return false;

                return (
                    arr.findIndex(
                        t => t.customer?._id === item.customer?._id
                    ) === index
                );
            });

            setFollowupData(filteredData.map((item: any) => {
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
    const handleSelectChange = async (field: keyof typeof filters, selected: string | string[], filtersOverride?: typeof filters) => {
        const updatedFilters = filtersOverride || {
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
        if (data) {
            const filteredData = data.filter((item, index, arr) => {
                if (!item.customer?._id) return false;

                return (
                    arr.findIndex(
                        t => t.customer?._id === item.customer?._id
                    ) === index
                );
            });
            setFollowupData(filteredData.map((item: any) => {
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
        }
    };

    const clearFilter = async () => {
        setFilters({
            Campaign: [],
            PropertyType: [],
            StatusType: [],
            City: [],
            Location: [],
            SubLocation: [],
            User: [],
            Keyword: "",
            StartDate: "",
            EndDate: "",
            Limit: ["10"],
        });
        setDependent({
            Campaign: { id: "", name: "" },
            PropertyType: { id: "", name: "" },
            City: { id: "", name: "" },
            Location: { id: "", name: "" },
            SubLocation: { id: "", name: "" },
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
                /*  { key: "StatusTypes", fetchFn: getStatusType },
                 { key: "Campaign", fetchFn: getCampaign },
                 { key: "PropertyTypes", fetchFn: getTypes },
                 { key: "City", fetchFn: getCity },
                 { key: "Location", fetchFn: getLocation },
                 { key: "Users", fetchFn: getAllAdmins }, */
            ],
            setFieldOptions
        );
    }

    // Object-based fields (for ObjectSelect)
    const objectFields = [

        { key: "Campaign", fetchFn: getCampaign },
        { key: "PropertyTypes", fetchFn: getTypes },
        { key: "City", fetchFn: getCity },
        { key: "Location", staticData: [] },// dependent
        { key: "SubLocation", staticData: [] },// dependent

    ];

    // Simple array fields (for normal Select)
    const arrayFields = [
        { key: "StatusTypes", fetchFn: getStatusType },
        { key: "StatusAssign", staticData: ["Assigned", "Unassigned"] },
        { key: "User", fetchFn: getAllAdmins },
    ];


    useEffect(() => {
        const loadFieldOptions = async () => {
            await handleFieldOptionsObject(objectFields, setFieldOptions);
            await handleFieldOptions(arrayFields, setFieldOptions);
        };
        loadFieldOptions();
    }, []);


    // Run this whenever parent filter changes
    useEffect(() => {
        const campaignId = dependent.Campaign.id;
        const cityId = dependent.City.id;
        const locationId = dependent.Location.id;

        if (campaignId) {
            fetchCustomerType(campaignId);
        } else {
            setFieldOptions(prev => ({ ...prev, PropertyType: [] }));
            setFilters(prev => ({ ...prev, PropertyType: [] }));
        }



        if (cityId) {
            fetchLocation(cityId);
        } else {
            setFieldOptions(prev => ({ ...prev, Location: [] }));
            setFilters(prev => ({ ...prev, Location: [] }));
        }
        if (cityId && locationId) {
            fetchSubLocation(cityId, locationId);
        } else {
            setFieldOptions(prev => ({ ...prev, SubLocation: [] }));
            setFilters(prev => ({ ...prev, SubLocation: [] }));
        }

    }, [dependent.Campaign.id, dependent.City.id, dependent.Location.id]);


    const fetchCustomerType = async (campaignId: string) => {
        try {
            const res = await getTypesByCampaign(campaignId);
            setFieldOptions((prev) => ({ ...prev, PropertyType: res || [] }));
        } catch (error) {
            console.error("Error fetching types:", error);
            setFieldOptions((prev) => ({ ...prev, PropertyType: [] }));
        }
    };

    const fetchLocation = async (cityId: string) => {
        try {

            const res = await getLocationByCity(cityId);
            setFieldOptions((prev) => ({ ...prev, Location: res || [] }));
        } catch (error) {
            console.error("Error fetching location:", error);
            setFieldOptions((prev) => ({ ...prev, Location: [] }));
        }
    };

    const fetchSubLocation = async (cityId: string, locationId: string) => {
        try {
            const res = await getsubLocationByCityLoc(cityId, locationId);
            setFieldOptions((prev) => ({ ...prev, SubLocation: res || [] }));
        } catch (error) {
            console.error("Error fetching sublocation:", error);
            setFieldOptions((prev) => ({ ...prev, SubLocation: [] }));
        }
    };


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


    /*follow up filter : 
                                            .filter(
                                                (item, index, arr) =>
                                                    arr.findIndex((row) => row.customerid === item.customerid) === index //keeps only first occurrence
                                            )
                                            */

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
                        <div className="flex flex-col border border-white/20 overflow-hidden bg-white/80 max-sm:dark:bg-[var(--color-childbgdark)] backdrop-blur-xl text-[var(--color-secondary-darker)] rounded-2xl shadow-2xl p-0 max-w-[800px] gap-0 m-2 w-full max-h-[85vh] overflow-hidden ring-1 ring-black/5">
                                     {/* Header - Glassmorphism effect */}
                                     <div className="flex flex-col justify-between  p-6 py-5 bg-gradient-to-r from-[var(--color-secondary-darker)] to-[var(--color-secondary)] text-white sticky top-0 z-10 backdrop-blur-md bg-opacity-95">
                                       <div className=" flex justify-between items-center">
                                         <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 tracking-tight">
                                           <div className="flex text-[var(--color-primary-light)] items-center gap-2">
                                             <span className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                                               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                                 <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                                                 <path fillRule="evenodd" d="M4 5a2 2 0 012-2 1 1 0 000 2H6a2 2 0 00-2 2v6a2 2 0 002 2h2a1 1 0 100-2H6V7h5a1 1 0 011-1h5a1 1 0 011 1v5h2V7a3 3 0 00-3-3h-5a2 2 0 00-2 2H6z" clipRule="evenodd" />
                                               </svg>
                                             </span>
                                             <span>Customer</span>
                                             <span className=" font-black drop-shadow-sm">Followups</span>
                                           </div>
                       
                                         </h2>
                                         <button
                                           className="cursor-pointer hover:bg-white/20 p-2 rounded-full transition-all duration-300 ease-out hover:rotate-90 active:scale-95 group"
                                           onClick={() => {
                                             setFollowupDialogData(null)
                                             setIsFollowupDialogOpen(false);
                                           }}
                                         >
                                           <IoMdClose className="w-6 h-6 group-hover:text-[var(--color-primary)] transition-colors" />
                                         </button>
                                       </div>
                                       <div className=" flex items-center gap-2 ml-[45px] mt-2 font-light  text-[var(--color-primary-light)]">
                                         <span className=" bg-[var(--color-primary-light)] p-1 rounded-full"><BsPersonFill className=" text-[var(--color-primary-dark)]" /></span>
                                         <span>{followupDialogData[0].Name ?? ""}
                                         </span>
                                       </div>
                                     </div>
                       
                                     {/* Content Area with custom scrollbar */}
                                     <div className="overflow-y-auto max-h-[calc(85vh-80px)] p-2 md:p-6 space-y-4 scrollbar-thin scrollbar-thumb-[var(--color-primary)]/30 scrollbar-track-transparent hover:scrollbar-thumb-[var(--color-primary)]/50">
                                       {
                                         followupDialogData.map((item, index) => (
                                           <div
                                             key={item._id ?? +index}
                                             className="group relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white max-sm:dark:bg-[var(--color-childbgdark)] max-sm:dark:border-gray-700 border border-gray-100 rounded-xl p-3 shadow-sm hover:shadow-xl hover:border-[var(--color-primary)]/20 transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden"
                                           >
                                             {/* Decorative gradient line */}
                                             <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[var(--color-primary)] to-[var(--color-secondary)] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                       
                                             {/* Content Section */}
                                             <div className="flex flex-col gap-3 flex-1 w-full md:w-auto pl-0 md:pl-2">
                                               <div className="flex flex-wrap items-center gap-2 mb-1">
                                                 <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold bg-[var(--color-primary)]/10 text-[var(--color-primary)] border border-[var(--color-primary)]/20">
                                                   Follow-up #{index + 1}
                                                 </span>
                                                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-semibold ${item.StatusType?.toLowerCase().includes('complete') || item.StatusType?.toLowerCase().includes('done')
                                                   ? 'bg-green-100 text-green-700 border border-green-200'
                                                   : item.StatusType?.toLowerCase().includes('pending') || item.StatusType?.toLowerCase().includes('wait')
                                                     ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                                     : 'bg-blue-100 text-blue-700 border border-blue-200'
                                                   }`}>
                                                   {item.StatusType}
                                                 </span>
                                               </div>
                       
                                               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                                                 <div className="flex items-center gap-2 text-gray-600">
                                                   <span className="p-1.5 bg-gray-50 rounded-md text-[var(--color-secondary)]">
                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                     </svg>
                                                   </span>
                                                   <div>
                                                     <p className="text-xs mb-1 text-gray-400 font-medium uppercase tracking-wider">Follow-up Date</p>
                                                     <p className="font-semibold text-[var(--color-secondary-darker)] max-sm:dark:text-[var(--color-secondary)]">{item.StartDate}</p>
                                                   </div>
                                                 </div>
                       
                                                 <div className="flex items-center gap-2 text-gray-600">
                                                   <span className="p-1.5 bg-gray-50 rounded-md text-[var(--color-secondary)]">
                                                     <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                     </svg>
                                                   </span>
                                                   <div>
                                                     <p className="text-xs mb-1 text-gray-400 font-medium uppercase tracking-wider">Next Follow-up</p>
                                                     <p className="font-semibold text-[var(--color-secondary-darker)] max-sm:dark:text-[var(--color-secondary)]">{item.FollowupNextDate}</p>
                                                   </div>
                                                 </div>
                                               </div>
                       
                                               <div className="mt-2 p-3 bg-gray-50/50 max-sm:dark:bg-[var(--color-primary-darker)]/50 rounded-lg border border-gray-100 max-sm:dark:border-none">
                                                 <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Description</p>
                                                 <p className="text-sm text-gray-700 max-sm:dark:text-gray-300 leading-relaxed line-clamp-3">{item.Description}</p>
                                               </div>
                                             </div>
                       
                                             {/* Action Buttons */}
                                             <div className="flex flex-row gap-3 justify-end items-center w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-100 max-sm:dark:border-gray-600 mt-2 md:mt-0">
                                               <Button
                                                 sx={{
                                                   backgroundColor: "#E8F5E9",
                                                   color: "var(--color-primary)",
                                                   minWidth: "40px",
                                                   height: "40px",
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
                                                   minWidth: "40px",
                                                   height: "40px",
                                                   borderRadius: "8px",
                                                 }}
                                                 onClick={() => {
                                                   setIsFollowupDialogOpen(false);
                                                   setIsFollowupDeleteDialogOpen(true);
                                                   setFollowupDeleteDialogData({
                                                     id: item._id ?? "",
                                                     Name: item.Name ?? ""
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
                <h1 className=" text-[var(--color-primary)] font-bold text-2xl px-0  ">Followups</h1>
                <div>
                    <DynamicAdvance>
                        <ObjectSelect
                            options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                            label="Campaign"
                            value={dependent.Campaign.id}
                            getLabel={(item) => item?.Name || ""}
                            getId={(item) => item?._id || ""}
                            onChange={(selectedId) => {
                                const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                                if (selectedObj) {
                                    const updatedFilters = {
                                        ...filters,
                                        Campaign: [selectedObj.Name],
                                        PropertyType: [],   // reset

                                    };
                                    setFilters(updatedFilters);

                                    setDependent(prev => ({
                                        ...prev,
                                        Campaign: { id: selectedObj._id, name: selectedObj.Name },
                                        PropertyType: { id: "", name: "" },   // reset
                                    }));
                                    handleSelectChange("Campaign", selectedObj.Name, updatedFilters)
                                }
                            }}
                        />

                        <ObjectSelect
                            options={Array.isArray(fieldOptions?.PropertyType) ? fieldOptions.PropertyType : []}
                            label="Property Type"
                            value={dependent.PropertyType.name}
                            getLabel={(item) => item?.Name || ""}
                            getId={(item) => item?._id || ""}
                            onChange={(selectedId) => {
                                const selectedObj = fieldOptions.PropertyType.find((i) => i._id === selectedId);
                                if (selectedObj) {
                                    const updatedFilters = {
                                        ...filters,
                                        PropertyType: [selectedObj.Name],   // reset

                                    };
                                    setFilters(updatedFilters);


                                    setDependent(prev => ({
                                        ...prev,
                                        PropertyType: { id: selectedObj._id, name: selectedObj.Name },   // reset

                                    }));
                                    handleSelectChange("PropertyType", selectedObj.Name, updatedFilters)
                                }
                            }}

                        />


                        <ObjectSelect
                            options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                            label="City"
                            value={dependent.City.id}
                            getLabel={(item) => item?.Name || ""}
                            getId={(item) => item?._id || ""}
                            onChange={(selectedId) => {
                                const selectedObj = fieldOptions.City.find((i) => i._id === selectedId);
                                if (selectedObj) {
                                    const updatedFilters = {
                                        ...filters,
                                        City: [selectedObj.Name],
                                        Location: []
                                    };
                                    setFilters(updatedFilters);

                                    setDependent(prev => ({
                                        ...prev,
                                        City: { id: selectedObj._id, name: selectedObj.Name },
                                        Location: { id: "", name: "" },
                                        SubLocation: { id: "", name: "" },
                                    }));
                                    handleSelectChange("City", selectedObj.Name, updatedFilters)
                                }
                            }}
                        />
                        <ObjectSelect
                            options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []}
                            label="Location"
                            value={dependent.Location.id}
                            getLabel={(item) => item?.Name || ""}
                            getId={(item) => item?._id || ""}
                            onChange={(selectedId) => {
                                const selectedObj = fieldOptions.Location.find((i) => i._id === selectedId);
                                if (selectedObj) {
                                    const updatedFilters = {
                                        ...filters,
                                        Location: [selectedObj.Name]
                                    };
                                    setFilters(updatedFilters);

                                    setDependent(prev => ({
                                        ...prev,
                                        Location: { id: selectedObj._id, name: selectedObj.Name },
                                        SubLocation: { id: "", name: "" },
                                    }));
                                    handleSelectChange("Location", selectedObj.Name, updatedFilters)
                                }
                            }}
                        />
                        <SingleSelect options={Array.isArray(fieldOptions?.StatusTypes) ? fieldOptions.StatusTypes : []} value={filters.StatusType[0]} label="Status Type" onChange={(val) => handleSelectChange("StatusType", val)} />
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

                            <div className={`overflow-hidden ${toggleSearchDropdown ? ' overflow-visible max-h-[2000px]' : ' overflow-hidden max-h-0'} transition-all duration-500 ease-in-out px-5`}>
                                <div className="flex flex-col gap-5 my-5">
                                    <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1 max-lg:grid-cols-2">
                                        <ObjectSelect
                                            options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                                            label="Campaign"
                                            value={dependent.Campaign.id}
                                            getLabel={(item) => item?.Name || ""}
                                            getId={(item) => item?._id || ""}
                                            onChange={(selectedId) => {
                                                const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                                                if (selectedObj) {
                                                    const updatedFilters = {
                                                        ...filters,
                                                        Campaign: [selectedObj.Name],
                                                        PropertyType: [],   // reset

                                                    };
                                                    setFilters(updatedFilters);

                                                    setDependent(prev => ({
                                                        ...prev,
                                                        Campaign: { id: selectedObj._id, name: selectedObj.Name },
                                                        PropertyType: { id: "", name: "" },   // reset
                                                    }));
                                                    handleSelectChange("Campaign", selectedObj.Name, updatedFilters)
                                                }
                                            }}
                                        />

                                        <ObjectSelect
                                            options={Array.isArray(fieldOptions?.PropertyType) ? fieldOptions.PropertyType : []}
                                            label="Property Type"
                                            value={dependent.PropertyType.name}
                                            getLabel={(item) => item?.Name || ""}
                                            getId={(item) => item?._id || ""}
                                            onChange={(selectedId) => {
                                                const selectedObj = fieldOptions.PropertyType.find((i) => i._id === selectedId);
                                                if (selectedObj) {
                                                    const updatedFilters = {
                                                        ...filters,
                                                        PropertyType: [selectedObj.Name],   // reset

                                                    };
                                                    setFilters(updatedFilters);


                                                    setDependent(prev => ({
                                                        ...prev,
                                                        PropertyType: { id: selectedObj._id, name: selectedObj.Name },   // reset

                                                    }));
                                                    handleSelectChange("PropertyType", selectedObj.Name, updatedFilters)
                                                }
                                            }}

                                        />


                                        <ObjectSelect
                                            options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                                            label="City"
                                            value={dependent.City.id}
                                            getLabel={(item) => item?.Name || ""}
                                            getId={(item) => item?._id || ""}
                                            onChange={(selectedId) => {
                                                const selectedObj = fieldOptions.City.find((i) => i._id === selectedId);
                                                if (selectedObj) {
                                                    const updatedFilters = {
                                                        ...filters,
                                                        City: [selectedObj.Name],
                                                        Location: []
                                                    };
                                                    setFilters(updatedFilters);

                                                    setDependent(prev => ({
                                                        ...prev,
                                                        City: { id: selectedObj._id, name: selectedObj.Name },
                                                        Location: { id: "", name: "" },
                                                        SubLocation: { id: "", name: "" },
                                                    }));
                                                    handleSelectChange("City", selectedObj.Name, updatedFilters)
                                                }
                                            }}
                                        />
                                        <ObjectSelect
                                            options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []}
                                            label="Location"
                                            value={dependent.Location.id}
                                            getLabel={(item) => item?.Name || ""}
                                            getId={(item) => item?._id || ""}
                                            onChange={(selectedId) => {
                                                const selectedObj = fieldOptions.Location.find((i) => i._id === selectedId);
                                                if (selectedObj) {
                                                    const updatedFilters = {
                                                        ...filters,
                                                        Location: [selectedObj.Name]
                                                    };
                                                    setFilters(updatedFilters);

                                                    setDependent(prev => ({
                                                        ...prev,
                                                        Location: { id: selectedObj._id, name: selectedObj.Name },
                                                        SubLocation: { id: "", name: "" },
                                                    }));
                                                    handleSelectChange("Location", selectedObj.Name, updatedFilters)
                                                }
                                            }}
                                        />
                                        <ObjectSelect
                                            options={Array.isArray(fieldOptions?.SubLocation) ? fieldOptions.SubLocation : []}
                                            label="Sub Location"
                                            value={dependent.SubLocation.id}
                                            getLabel={(item) => item?.Name || ""}
                                            getId={(item) => item?._id || ""}
                                            onChange={(selectedId) => {
                                                const selectedObj = fieldOptions.SubLocation.find((i) => i._id === selectedId);
                                                if (selectedObj) {
                                                    const updatedFilters = {
                                                        ...filters,
                                                        SubLocation: [selectedObj.Name]
                                                    };
                                                    setFilters(updatedFilters);
                                                    setDependent(prev => ({
                                                        ...prev,
                                                        SubLocation: { id: selectedObj._id, name: selectedObj.Name },
                                                    }));
                                                    handleSelectChange("SubLocation", selectedObj.Name, updatedFilters)
                                                }
                                            }}
                                        />


                                        <SingleSelect options={Array.isArray(fieldOptions?.StatusTypes) ? fieldOptions.StatusTypes : []} value={filters.StatusType[0]} label="Status Type" onChange={(val) => handleSelectChange("StatusType", val)} />
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
                                        currentRows.map((item, index) => (
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
