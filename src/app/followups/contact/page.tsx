'use client'
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowUp, IoIosArrowDown, IoMdClose } from "react-icons/io";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import Button from '@mui/material/Button';
import SingleSelect from "@/app/component/SingleSelect";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import ProtectedRoute from "@/app/component/ProtectedRoutes";
import PopupMenu from "@/app/component/popups/PopupMenu";
import DeleteDialog from "@/app/component/popups/DeleteDialog";

import {
    getAllContactFollowups,
    getFilteredContactFollowups,
    deleteContactFollowup,
    getFollowupByContactId,
    deleteContactFollowupById,
} from "@/store/contactFollowups";

import {
    contactFollowupGetDataInterface,
    ContactFollowupAdvInterface,
    DeleteDialogDataInterface,
    FollowupDeleteDialogDataInterface,
    contactFollowupAllDataInterface,
} from "@/store/contactFollowups.interface";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getCity } from "@/store/masters/city/city";
import { getLocation, getLocationByCity } from "@/store/masters/location/location";
import { getAllAdmins } from "@/store/auth";
import PageHeader from "@/app/component/labels/PageHeader";
import { getContactType, getContactTypeByCampaign } from "@/store/masters/contacttype/contacttype";
import { getContactCampaign } from "@/store/masters/contactcampaign/contactcampaign";
import { getContactStatusType } from "@/store/masters/contactstatustype/contactstatustype";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import ContactFollowupTable from "@/app/phonescreens/DashboardScreens/tables/ContactFollowupTable";
import DynamicAdvance from "@/app/phonescreens/DashboardScreens/DynamicAdvance";

export default function ContactFollowups() {
    const router = useRouter();
    const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
    const [currentTablePage, setCurrentTablePage] = useState(1);
    const [followupData, setFollowupData] = useState<contactFollowupGetDataInterface[]>([]);
    const [followupAdv, setFollowupAdv] = useState<ContactFollowupAdvInterface[]>([]);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteDialogData, setDeleteDialogData] = useState<DeleteDialogDataInterface | null>(null);
    const [isFollowupDeleteDialogOpen, setIsFollowupDeleteDialogOpen] = useState(false);
    const [followupdeleteDialogData, setFollowupDeleteDialogData] = useState<FollowupDeleteDialogDataInterface | null>(null);
    const [isfollowupDialogOpen, setIsFollowupDialogOpen] = useState(false);
    const [followupDialogData, setFollowupDialogData] = useState<contactFollowupAllDataInterface[] | null>([]);
    const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});

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

    const [dependent, setDependent] = useState({
        Campaign: { id: "", name: "" },
        PropertyType: { id: "", name: "" },
        City: { id: "", name: "" },
        Location: { id: "", name: "" },
    });

    // 🔹 Fetch All Followups
    useEffect(() => {
        getFollowups();

    }, []);

    const getFollowups = async () => {
        const data = await getAllContactFollowups();
        if (data) {
            console.log(" nice ", data)
            setFollowupData(data.map((item: any) => {
                const date = new Date(item.updatedAt);
                const formattedDate =
                    date.getDate().toString().padStart(2, "0") + "-" +
                    (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
                    date.getFullYear();
                return {
                    _id: item._id,
                    contactid: item.contact._id,
                    Name: item.contact.Name,
                    ContactNumber: item.contact.ContactNo,
                    User: item.contact.AssignTo?.name ?? "",
                    Date: formattedDate,
                }
            }));
            setFollowupAdv(
                data.map((item: any) => ({
                    _id: [item._id],
                    Campaign: item.Campaign || [],
                    PropertyType: item.PropertyType || [],
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
        const response = await deleteContactFollowup(data.id);
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
    const editFollowup = (id: string) => router.push(`/contact/edit/${id}`);
    const addFollowup = (id: string) => router.push(`/followups/contact/add/${id}`);

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

        const data = await getFilteredContactFollowups(queryParams.toString());
        if (data) setFollowupData(data.map((item: any) => {
            const date = new Date(item.updatedAt);
            const formattedDate =
                date.getDate().toString().padStart(2, "0") + "-" +
                (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
                date.getFullYear();
            return {
                _id: item._id,
                contactid: item.contact._id,
                Name: item.contact.Name,
                ContactNumber: item.contact.ContactNo,
                User: item.contact.AssignTo?.name ?? "",
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
        setDependent({
            Campaign: { id: "", name: "" },
            PropertyType: { id: "", name: "" },
            City: { id: "", name: "" },
            Location: { id: "", name: "" },
        });
        await getFollowups();
    };

    const handleFollowups = async (id: string) => {
        const data = await getFollowupByContactId(id);
        if (data) {
            setFollowupDialogData(data.map((item: any) => ({
                _id: item._id,
                contact: item.contact._id,
                StartDate: item.StartDate,
                StatusType: item.StatusType,
                FollowupNextDate: item.FollowupNextDate,
                Description: item.Description,
            })));
        }
    };

    const editThisFollowup = (id: string) => {
        router.push(`/followups/contact/edit/${id}`);
    };

    const deleteThisFollowup = async (data: FollowupDeleteDialogDataInterface) => {
        if (!data) return;
        const response = await deleteContactFollowupById(data.id);
        if (response && response.success) {
            toast.success("Followup deleted successfully");
            setIsFollowupDialogOpen(false);
            setIsFollowupDeleteDialogOpen(true);
            setFollowupDeleteDialogData(null);
            getFollowups();
        } else {
            toast.error("Failed to delete followup");
        }
    };

    const getContactName = (id: string) => {
        const data = followupData.find(item => item.contactid === id);
        return data ? data.Name : "";
    };



    // Object-based fields (for ObjectSelect)
    const objectFields = [
        { key: "Campaign", fetchFn: getContactCampaign },
        { key: "PropertyType", fetchFn: getContactType },
        { key: "City", fetchFn: getCity },
        { key: "Location", fetchFn: getLocation },
    ];

    // Simple array fields (for normal Select)
    const arrayFields = [
        { key: "StatusAssign", staticData: ["Assigned", "Unassigned"] },
        { key: "StatusTypes", fetchFn: getContactStatusType },
        { key: "Users", fetchFn: getAllAdmins },
    ];

    useEffect(() => {
        const loadFieldOptions = async () => {
            await handleFieldOptionsObject(objectFields, setFieldOptions);
            await handleFieldOptions(arrayFields, setFieldOptions);
        };
        loadFieldOptions();
    }, []);

    useEffect(() => {
        const campaignId = dependent.Campaign.id;
        const cityId = dependent.City.id;
        if (campaignId) {
            fetchContactType(campaignId);
        } else {
            setFieldOptions((prev) => ({ ...prev, PropertyType: [] }));
            setFilters(prev => ({ ...prev, PropertyType: [] }));
        }

        if (cityId) {
            fetchLocation(cityId);
        } else {
            setFieldOptions((prev) => ({ ...prev, Location: [] }));
            setFilters(prev => ({ ...prev, Location: [] }));
        }

    }, [dependent.Campaign.id, dependent.City.id]);

    const fetchContactType = async (campaignId: string) => {
        try {
            const res = await getContactTypeByCampaign(campaignId);
            setFieldOptions((prev) => ({ ...prev, PropertyType: res?.data || [] }));

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
                title={`Are you sure you want delete the followup for contact ${getContactName(followupdeleteDialogData?.id || "")}?`}
                data={followupdeleteDialogData}
                onClose={() => {
                    setFollowupDeleteDialogData(null);
                    setIsFollowupDeleteDialogOpen(false);
                }}
                onDelete={deleteThisFollowup}
            />

            {isfollowupDialogOpen && Array.isArray(followupDialogData) && followupDialogData.length > 0 && (
                <PopupMenu onClose={() => { setIsFollowupDialogOpen(false); setFollowupDialogData([]); }}>
                    <div className="flex flex-col border border-gray-300/30 overflow-y-auto bg-gray-100 text-[var(--color-secondary-darker)] rounded-xl shadow-lg p-6 max-w-[800px] gap-6 m-2 w-full max-h-[80vh]">
                        <h2 className="text-2xl text-[var(--color-secondary-darker)] font-extrabold flex justify-between items-center"><div>Contact <span className="text-[var(--color-primary)]">Followups</span></div><button className=" cursor-pointer" onClick={() => {
                            setFollowupDialogData(null)
                            setIsFollowupDialogOpen(false);
                        }}><IoMdClose /></button></h2>
                        <div className="overflow-y-auto max-h-[100vh]">
                            {followupDialogData.map((item, index) => (
                                <div key={item._id ?? +index} className="flex justify-between border border-gray-300 rounded-md p-4">
                                    <div className=" flex flex-col gap-2">
                                        <p><span className="font-semibold">Followup Date:</span> {item.StartDate}</p>
                                        <p><span className="font-semibold">Status Type:</span> {item.StatusType}</p>
                                        <p><span className="font-semibold">Next Followup Date:</span> {item.FollowupNextDate}</p>
                                        <p><span className="font-semibold">Description:</span> {item.Description}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-2 justify-center items-center">
                                        <Button
                                            sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                                            onClick={() => editThisFollowup(item._id ?? "")}
                                        >
                                            <MdEdit />
                                        </Button>
                                        <Button
                                            sx={{ backgroundColor: "#FDECEA", color: "#C62828", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                                            onClick={() => {
                                                setIsFollowupDialogOpen(false);
                                                setIsFollowupDeleteDialogOpen(true);
                                                setFollowupDeleteDialogData({
                                                    id: item._id ?? "",
                                                    Name: getContactName(item.contact)
                                                });
                                            }}
                                        >
                                            <MdDelete />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </PopupMenu>
            )}

            <div className=" sm:hidden min-h-[calc(100vh-56px)] overflow-auto max-sm:py-2">
                <h1 className=" text-[var(--color-primary)] font-bold text-2xl px-0 py-0">Contact Followups</h1>
                <div>
                    <DynamicAdvance addUrl="/contact/add">
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
                                        PropertyType: []
                                    };
                                    setFilters(updatedFilters);
                                    setDependent(prev => ({
                                        ...prev,
                                        Campaign: { id: selectedObj._id, name: selectedObj.Name },
                                        PropertyType: { id: "", name: "" }
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
                                        PropertyType: [selectedObj.Name],
                                    };
                                    setFilters(updatedFilters);
                                    setDependent(prev => ({
                                        ...prev,
                                        PropertyType: { id: selectedObj._id, name: selectedObj.Name },
                                    }));
                                    handleSelectChange("PropertyType", selectedObj.Name, updatedFilters)
                                }
                            }}

                        />
                        <SingleSelect options={Array.isArray(fieldOptions?.StatusTypes) ? fieldOptions.StatusTypes : []} value={filters.StatusType[0]} label="Status Type" onChange={(val) => handleSelectChange("StatusType", val)} />
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
                                        Location: [] // reset Location
                                    };
                                    setFilters(updatedFilters);
                                    setDependent(prev => ({
                                        ...prev,
                                        City: { id: selectedObj._id, name: selectedObj.Name },
                                        Location: { id: "", name: "" },
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
                                    }));
                                    handleSelectChange("Location", selectedObj.Name, updatedFilters)
                                }
                            }}
                        />

                    </DynamicAdvance>
                </div>
                <ContactFollowupTable
                    leads={followupData}
                    labelLeads={phonetableheader}
                    onFollowup={(lead) => {
                        setIsFollowupDialogOpen(true);
                        handleFollowups(lead.contactid);
                    }}
                    onAdd={(id) => addFollowup(id)}
                    onEdit={(id) => editFollowup(id)}
                    onDelete={(lead) => {
                        setIsDeleteDialogOpen(true);
                        setDeleteDialogData({
                            id: lead.contactid,
                            ContactNumber: lead.ContactNumber
                        });
                    }}
                />
            </div>

            <div className=" min-h-[calc(100vh-56px)] max-sm:hidden overflow-auto max-md:py-10">

                <div className="bg-white rounded-md p-4 max-md:p-3 w-full">
                    <div className="flex justify-between items-center">
                        <PageHeader title="Dashboard" subtitles={["Followups", "Contact"]} />
                    </div>

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
                                                        PropertyType: []
                                                    };
                                                    setFilters(updatedFilters);
                                                    setDependent(prev => ({
                                                        ...prev,
                                                        Campaign: { id: selectedObj._id, name: selectedObj.Name },
                                                        PropertyType: { id: "", name: "" }
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
                                                        PropertyType: [selectedObj.Name],
                                                    };
                                                    setFilters(updatedFilters);
                                                    setDependent(prev => ({
                                                        ...prev,
                                                        PropertyType: { id: selectedObj._id, name: selectedObj.Name },
                                                    }));
                                                    handleSelectChange("PropertyType", selectedObj.Name, updatedFilters)
                                                }
                                            }}

                                        />
                                        <SingleSelect options={Array.isArray(fieldOptions?.StatusTypes) ? fieldOptions.StatusTypes : []} value={filters.StatusType[0]} label="Status Type" onChange={(val) => handleSelectChange("StatusType", val)} />
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
                                                        Location: [] // reset Location
                                                    };
                                                    setFilters(updatedFilters);
                                                    setDependent(prev => ({
                                                        ...prev,
                                                        City: { id: selectedObj._id, name: selectedObj.Name },
                                                        Location: { id: "", name: "" },
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
                                                    }));
                                                    handleSelectChange("Location", selectedObj.Name, updatedFilters)
                                                }
                                            }}
                                        />

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
                                        <button type="reset" onClick={clearFilter} className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2 mt-6 rounded-md ml-3">
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
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left"></th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">S.No.</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Name</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Contact No</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">User</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Date</th>
                                        <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentRows.length > 0 ? (
                                        currentRows
                                            .filter(
                                                (item, index, arr) =>
                                                    arr.findIndex((row) => row.contactid === item.contactid) === index // ✅ keeps only first occurrence
                                            )
                                            .map((item, index) => (
                                                <tr
                                                    key={item._id}
                                                    className="border-t hover:bg-[#f7f6f3] transition-all duration-200"
                                                >
                                                    <td
                                                        className="px-4 py-3 border border-gray-200 text-sky-500 cursor-pointer hover:underline"
                                                        onClick={() => {
                                                            setIsFollowupDialogOpen(true);
                                                            handleFollowups(item.contactid);
                                                        }}
                                                    >
                                                        Follow UP
                                                    </td>
                                                    <td className="px-4 py-3 border border-gray-200">{indexOfFirstRow + index + 1}</td>
                                                    <td className="px-4 py-3 border border-gray-200">{item.Name}</td>
                                                    <td className="px-4 py-3 border border-gray-200">{item.ContactNumber}</td>
                                                    <td className="px-4 py-3 border border-gray-200">{item.User}</td>
                                                    <td className="px-4 py-3 border border-gray-200">{item.Date}</td>
                                                    <td className="px-4 py-2 border-r border-r-gray-200 flex gap-2 items-center">
                                                        <Button
                                                            sx={{
                                                                backgroundColor: "#E8F5E9",
                                                                color: "var(--color-primary)",
                                                                minWidth: "32px",
                                                                height: "32px",
                                                                borderRadius: "8px",
                                                            }}
                                                            onClick={() => addFollowup(item.contactid)}
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
                                                            onClick={() => editFollowup(item.contactid)}
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
                                                                    id: item.contactid,
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
