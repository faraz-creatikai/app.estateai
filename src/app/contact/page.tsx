'use client';
import { useEffect, useState } from "react";
import { CiExport, CiSearch } from "react-icons/ci";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import { MdEdit, MdDelete, MdAdd } from "react-icons/md";
import Button from "@mui/material/Button";
import SingleSelect from "@/app/component/SingleSelect";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusSquare } from "lucide-react";
import ProtectedRoute from "../component/ProtectedRoutes";
import PopupMenu from "../component/popups/PopupMenu";
import toast, { Toaster } from "react-hot-toast";

import {
  getContact,
  deleteContact,
  getFilteredContact,
  deleteAllContact,
  assignContact,
} from "@/store/contact";

import {
  ContactAdvInterface,
  contactGetDataInterface,
  DeleteDialogDataInterface,
  contactAssignInterface,
} from "@/store/contact.interface";

import DeleteDialog from "../component/popups/DeleteDialog";
import { getAllAdmins } from "@/store/auth";
import { handleFieldOptions } from "../utils/handleFieldOptions";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getContactType, getContactTypeByCampaign } from "@/store/masters/contacttype/contacttype";
import { getCity } from "@/store/masters/city/city";
import { getLocation, getLocationByCity } from "@/store/masters/location/location";
import AddButton from "../component/buttons/AddButton";
import PageHeader from "../component/labels/PageHeader";
import { usersGetDataInterface } from "@/store/auth.interface";
import { emailAllContact, getMail } from "@/store/masters/mail/mail";
import { mailAllContactInterface, mailGetDataInterface } from "@/store/masters/mail/mail.interface";
import { getWhatsapp, whatsappAllContact } from "@/store/masters/whatsapp/whatsapp";
import { whatsappAllContactInterface, whatsappGetDataInterface } from "@/store/masters/whatsapp/whatsapp.interface";
import ListPopup from "../component/popups/ListPopup";
import { getContactCampaign } from "@/store/masters/contactcampaign/contactcampaign";
import LeadsSection from "../phonescreens/DashboardScreens/LeadsSection";
import ContactTable from "../phonescreens/DashboardScreens/tables/ContactTable";
import DynamicAdvance from "../phonescreens/DashboardScreens/DynamicAdvance";
import { handleFieldOptionsObject } from "../utils/handleFieldOptionsObject";
import ObjectSelect from "../component/ObjectSelect";
import { exportToExcel } from "../utils/exportToExcel";
import { useAuth } from "@/context/AuthContext";

interface DeleteAllDialogDataInterface { }

export default function Contacts() {
  const router = useRouter();

  /* Status for Selections of Data */
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>();
  const [selectedWhatsapptemplate, setSelectedWhatsapptemplate] = useState<string>();
  const [selectedMailtemplate, setSelectedMailtemplate] = useState<string>();
  const [users, setUsers] = useState<usersGetDataInterface[]>([])
  const [mailTemplates, setMailtemplates] = useState<mailGetDataInterface[]>([])
  const [whatsappTemplates, setWhatsappTemplates] = useState<whatsappGetDataInterface[]>([])
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isMailAllOpen, setIsMailAllOpen] = useState(false);
  const [isWhatsappAllOpen, setIsWhatsappAllOpen] = useState(false);
  /* OTHER STATES */
  const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] =
    useState<DeleteDialogDataInterface | null>(null);
  const [deleteAllDialogData, setDeleteAllDialogData] =
    useState<DeleteAllDialogDataInterface | null>(null);
  const { admin } = useAuth();

  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);

  const [filters, setFilters] = useState({
    StatusAssign: [] as string[],
    Campaign: [] as string[],
    ContactType: [] as string[],
    City: [] as string[],
    Location: [] as string[],
    User: [] as string[],
    Keyword: "" as string,
    Limit: ["10"] as string[],
  });

  const [dependent, setDependent] = useState({
    Campaign: { id: "", name: "" },
    ContactType: { id: "", name: "" },
    City: { id: "", name: "" },
    Location: { id: "", name: "" },
  });

  const [contactData, setContactData] = useState<contactGetDataInterface[]>([]);
  const [exportingContactData, setExportingContactData] = useState<contactGetDataInterface[]>([]);
  const [contactAdv, setContactAdv] = useState<ContactAdvInterface[]>([]);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});

  /* ✅ FETCH CONTACTS */
  useEffect(() => {
    getContacts();
    fetchFields();
  }, []);

  useEffect(() => {
    const datatoExport = contactData.filter((customer) => selectedContacts.includes(customer._id));
    setExportingContactData(datatoExport);
  }, [selectedContacts, contactData]);

  const getContacts = async () => {
    const data = await getContact();
    console.log(" contact data ", data)
    if (data) {
      console.log("contact data ", data)
      setContactData(data.map((item: any) => {
        const date = new Date(item.createdAt);
        const formattedDate =
          date.getDate().toString().padStart(2, "0") + "-" +
          (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
          date.getFullYear();
        return {
          _id: item._id,
          Name: item.Name,
          Email: item.Email,
          Campaign: item.Campaign,
          Qualifications: item.Qualifications,
          Location: item.Location,
          ContactNo: item.ContactNo,
          AssignTo: item.AssignTo?.name,
          date: (item.date === "") ? formattedDate : item.date,
        }
      }));


      setContactAdv(
        data.map((item: any) => ({
          _id: item._id,
          Campaign: item.Campaign || [],
          ContactType: item.ContactType || [],
          City: item.City || [],
          Location: item.Location || [],
          User: item.User || [],
          Limit: item.Limit || [],
        }))
      );
    }
  };

  /* ✅ DELETE SINGLE */
  const handleDelete = async (data: DeleteDialogDataInterface | null) => {
    if (!data) return;

    const response = await deleteContact(data.id);
    if (response) {
      toast.success(`Contact deleted successfully`);
      setIsDeleteDialogOpen(false);
      setDeleteDialogData(null);
      getContacts();
    }
  };

  /* ✅ DELETE ALL */
  const handleDeleteAll = async () => {
    if (contactData.length === 0) return;
    const payload = {
      contactIds: [...selectedContacts]
    }
    const response = await deleteAllContact(payload);
    if (response) {
      toast.success(`All contacts deleted`);
      setIsDeleteAllDialogOpen(false);
      setSelectedContacts([]);
      setDeleteAllDialogData(null);
      getContacts();
    }
  };

  /* handle popup reqeusts */

  const handleAssignto = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    const payload: contactAssignInterface = {
      contactIds: selectedContacts,
      assignToId: selectedUser,
    };

    console.log(payload)

    const response = await assignContact(payload);
    if (response) {
      toast.success(" customers assigned succesfully")
      await getContacts();
      setIsAssignOpen(false);
      return response
    }
    toast.error("failed to assign customers")
    setIsAssignOpen(false)
  };

  const handleMailAll = async () => {
    if (!selectedMailtemplate) {
      toast.error("Please select a template");
      return;
    }

    const payload: mailAllContactInterface = {
      contactIds: selectedContacts,
      templateId: selectedMailtemplate,
    };

    console.log(payload)

    const response = await emailAllContact(payload);
    if (response) {
      toast.success("Email customers succesfully")
      setIsMailAllOpen(false);
      return response
    }
    toast.error("failed to email customers")
    setIsMailAllOpen(false);
  };

  const handleWhatsappAll = async () => {
    if (!selectedWhatsapptemplate) {
      toast.error("Please select a template");
      return;
    }

    const payload: whatsappAllContactInterface = {
      contactIds: selectedContacts,
      templateId: selectedWhatsapptemplate,
    };

    console.log(payload)

    const response = await whatsappAllContact(payload);
    if (response) {
      toast.success("Whatsapp customers succesfully")
      setIsWhatsappAllOpen(false);
      return response
    }
    toast.error("failed to whatsapp customers")
    setIsWhatsappAllOpen(false);
  };



  /*  FETCH USERS FOR ASSIGN POPUP */

  const fetchUsers = async () => {
    const response = await getAllAdmins();

    if (response) {
      console.log("response ", response);

      const admins = response?.admins?.filter((e) => e.role === "user") ?? []; //ensure only user roles are fetched

      setUsers(
        admins.map((item: any): usersGetDataInterface => ({
          _id: item?._id ?? "",
          name: item?.name ?? "",
        }))
      );

      return;
    }
  };

  const fetchEmailTemplates = async () => {
    const response = await getMail();

    if (response) {
      console.log("response ", response);

      const mailtemplates = response?.filter((e: any) => e.status === "Active") ?? []; //ensure only user roles are fetched
      console.log(" mail data ", response)
      setMailtemplates(
        mailtemplates.map((item: any): mailGetDataInterface => ({
          _id: item?._id ?? "",
          name: item?.name ?? "",
          body: item?.body ?? ""
        }))
      );

      return;
    }
  };

  const fetchWhatsappTemplates = async () => {
    const response = await getWhatsapp();

    if (response) {
      console.log("response ", response);

      const whatsapptemplates = response?.filter((e: any) => e.status === "Active") ?? []; //ensure only active status are fetched
      console.log(" mail data ", response)
      setWhatsappTemplates(
        whatsapptemplates.map((item: any): whatsappGetDataInterface => ({
          _id: item?._id ?? "",
          name: item?.name ?? "",
          body: item?.body ?? ""
        }))
      );

      return;
    }
  };

  /*  SELECT ALL CHECKBOX */
  const handleSelectAll = () => {
    const allIds = currentRows.map((c) => c._id);

    setSelectedContacts((prev) =>
      allIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !allIds.includes(id))
        : [...new Set([...prev, ...allIds])]
    );
  };

  /*  SELECT SINGLE ROW */
  const handleSelectRow = (id: string) => {
    setSelectedContacts((prev) =>
      prev.includes(id)
        ? prev.filter((cid) => cid !== id)
        : [...prev, id]
    );
  };

  /*  SELECT ONLY ONE USER */

  const handleSelectUser = (id: string) => {
    setSelectedUser(prev => (prev === id ? undefined : id)); //  only one user at a time
  };

  const handleSelectMailtemplate = (id: string) => {
    setSelectedMailtemplate(prev => (prev === id ? undefined : id)); //  only one user at a time
  };

  const handleSelectWhatsapptemplate = (id: string) => {
    setSelectedWhatsapptemplate(prev => (prev === id ? undefined : id)); // only one user at a time
  };

  /*  ASSIGN TO API CALL */
  const handleAssignTo = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    const payload: contactAssignInterface = {
      contactIds: selectedContacts,
      assignToId: selectedUser,
    };

    const response = await assignContact(payload);

    if (response) {
      toast.success("Contacts assigned successfully");
      setIsAssignOpen(false);
      setSelectedContacts([]);
      setSelectedUser(undefined);
      getContacts();
    } else {
      toast.error("Failed to assign contacts");
    }
  };

  /*  PAGINATION */
  const totalTablePages = Math.ceil(contactData.length / rowsPerTablePage);
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = contactData.slice(indexOfFirstRow, indexOfLastRow);

  useEffect(() => {
    const safeLimit = Number(filters.Limit?.[0]);
    setRowsPerTablePage(safeLimit);
    setCurrentTablePage(1);
  }, [filters.Limit]);

  const nexttablePage = () => {
    if (currentTablePage !== totalTablePages)
      setCurrentTablePage(currentTablePage + 1);
  };

  const prevtablePage = () => {
    if (currentTablePage !== 1)
      setCurrentTablePage(currentTablePage - 1);
  };

  /*  FILTERS */
  const statusAssign = ["Assigned", "Unassigned"];
  const campaign = [
    "Buyer",
    "Seller",
    "Rent Out",
    "Rent In",
    "Hostel/PG",
    "Agents",
    "Services",
    "Others",
    "Guest House",
    "Happy Stay",
  ];
  const customerTypes = ["New", "Existing", "Lead"];
  const cities = ["Mumbai", "Delhi", "Bangalore", "Chennai", "Kolkata"];
  const locations = ["Andheri", "Borivali", "Powai", "Juhu", "Malad"];
  const usersList = ["Admin", "Agent1", "Agent2"];

  const handleSelectChange = async (
    field: keyof typeof filters,
    selected: string | string[],
    filtersOverride?: typeof filters
  ) => {
    const updatedFilters = filtersOverride || {
      ...filters,
      [field]: Array.isArray(selected) ? selected : selected ? [selected] : [],
    };

    setFilters(updatedFilters);

    const queryParams = new URLSearchParams();
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (key === "Limit") return; // 
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => queryParams.append(key, v));
      } else if (typeof value === "string" && value) {
        queryParams.append(key, value);
      }
    });

    const data = await getFilteredContact(queryParams.toString());
    if (data) setContactData(data.map((item: any) => {
      const date = new Date(item.createdAt);
      const formattedDate =
        date.getDate().toString().padStart(2, "0") + "-" +
        (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
        date.getFullYear();
      return {
        _id: item._id,
        Name: item.Name,
        Email: item.Email,
        Campaign: item.Campaign,
        Qualifications: item.Qualifications,
        Location: item.Location,
        ContactNo: item.ContactNo,
        AssignTo: item.AssignTo?.name,
        date: (item.date === "") ? formattedDate : item.date,
      }
    }));
  };

  const fetchFields = async () => {
    /*     await handleFieldOptions(
          [
            { key: "StatusAssign", staticData: ["Assigned", "Unassigned"] },
            { key: "Campaign", fetchFn: getContactCampaign },
            { key: "ContactType", fetchFn: getContactType },
            { key: "City", fetchFn: getCity },
            { key: "Location", fetchFn: getLocation },
            { key: "User", fetchFn: getAllAdmins },
            { key: "Verified", staticData: ["yes", "no"] },
          ],
          setFieldOptions
        ); */
  }

  // Object-based fields (for ObjectSelect)
  const objectFields = [
    { key: "Campaign", fetchFn: getContactCampaign },
    { key: "ContactType", staticData: [] },
    { key: "City", fetchFn: getCity },
    { key: "Location", staticData: [] }
  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
    { key: "StatusAssign", staticData: ["Assigned", "Unassigned"] },
    { key: "Status", staticData: ["Active", "Inactive"] },
    { key: "Verified", staticData: ["yes", "no"] },
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
      setFieldOptions((prev) => ({ ...prev, ContactType: [] }));
      setFilters(prev => ({ ...prev, ContactType: [] }));
    }

    if (cityId) {
      fetchLocation(cityId);
    } else {
      setFieldOptions((prev) => ({ ...prev, Location: [] }));
      setFilters(prev => ({ ...prev, Location: [] }));
    }


  }, [dependent.Campaign, dependent.City]);

  const fetchContactType = async (campaignId: string) => {
    try {
      const res = await getContactTypeByCampaign(campaignId);
      setFieldOptions((prev) => ({ ...prev, ContactType: res?.data || [] }));

    } catch (error) {
      console.error("Error fetching types:", error);
      setFieldOptions((prev) => ({ ...prev, ContactType: [] }));
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

  const clearFilter = async () => {
    setFilters({
      StatusAssign: [],
      Campaign: [],
      ContactType: [],
      City: [],
      Location: [],
      User: [],
      Keyword: "",
      Limit: ["10"],
    });
    setDependent({
      Campaign: { id: "", name: "" },
      ContactType: { id: "", name: "" },
      City: { id: "", name: "" },
      Location: { id: "", name: "" },
    })
    await getContacts();
  };

  const phonetableheader = [{
    key: "Campaign", label: "Campaign"
  },
  {
    key: "Name", label: "Name"
  },
  {
    key: "Location", label: "Location"
  },
  {
    key: "ContactNo", label: "Contact No"
  }]

  return (
    <ProtectedRoute>
      <Toaster position="top-right" />
      {/* mail all popup */}
      {isMailAllOpen && selectedContacts.length > 0 && (
        <ListPopup
          title="Mail Contacts"
          list={mailTemplates}
          selected={selectedMailtemplate}
          onSelect={handleSelectMailtemplate}
          onSubmit={handleMailAll}
          submitLabel="Mail"
          onClose={() => {
            setSelectedContacts([]);
            setIsMailAllOpen(false)
          }}
        />
      )}


      {/* whatsapp all popup */}
      {isWhatsappAllOpen && selectedContacts.length > 0 && (
        <ListPopup
          title="Whatsapp Contacts"
          list={whatsappTemplates}
          selected={selectedWhatsapptemplate}
          onSelect={handleSelectWhatsapptemplate}
          onSubmit={handleWhatsappAll}
          submitLabel="Whatsapp"
          onClose={() => {
            setSelectedContacts([]);
            setIsWhatsappAllOpen(false)
          }}
        />
      )}
      <div className=" sm:hidden min-h-[calc(100vh-56px)] overflow-auto max-sm:py-2">

        <div className=" flex justify-between items-center px-0 pb-0  ">
          <h1 className=" text-[var(--color-primary)] font-extrabold text-2xl ">Contacts</h1>

        </div>
        <div className=" w-full">
          <DynamicAdvance addUrl="/contact/add">
            <SingleSelect options={Array.isArray(fieldOptions.StatusAssign) ? fieldOptions.StatusAssign : []} value={filters.StatusAssign[0]} label="Status Assign" onChange={(v) => handleSelectChange("StatusAssign", v)} />

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
                    ContactType: []
                  };
                  setFilters(updatedFilters);
                  setDependent(prev => ({
                    ...prev,
                    Campaign: { id: selectedObj._id, name: selectedObj.Name },
                    CustomerType: { id: "", name: "" }
                  }));
                  handleSelectChange("Campaign", selectedObj.Name, updatedFilters)
                }
              }}
            />

            <ObjectSelect
              options={Array.isArray(fieldOptions?.ContactType) ? fieldOptions.ContactType : []}
              label="Contact Type"
              value={dependent.ContactType.name}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {
                const selectedObj = fieldOptions.ContactType.find((i) => i._id === selectedId);
                if (selectedObj) {

                  const updatedFilters = {
                    ...filters,
                    ContactType: [selectedObj.Name],
                  };
                  setFilters(updatedFilters);
                  setDependent(prev => ({
                    ...prev,
                    ContactType: { id: selectedObj._id, name: selectedObj.Name },
                  }));
                  handleSelectChange("ContactType", selectedObj.Name, updatedFilters)
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

            <SingleSelect options={Array.isArray(fieldOptions.User) ? fieldOptions.User : []} value={filters.User[0]} label="User" onChange={(v) => handleSelectChange("User", v)} />
            <div className=" w-full flex justify-end">
              <button type="reset" onClick={clearFilter} className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2 rounded-md">
                Clear Search
              </button>
            </div>
          </DynamicAdvance>
        </div>
        <ContactTable
          leads={contactData}
          labelLeads={phonetableheader}
          onEdit={(id) => router.push(`/contact/edit/${id}`)}
          onWhatsappClick={(lead) => {
            setSelectedContacts([lead._id]);
            setIsWhatsappAllOpen(true);
            fetchWhatsappTemplates();
          }}
          onMailClick={(lead) => {
            setSelectedContacts([lead._id]);
            setIsMailAllOpen(true);
            fetchEmailTemplates();
          }}
        />
      </div>
      <div className=" min-h-[calc(100vh-56px)] max-sm:hidden overflow-auto bg-gray-200 max-md:py-10">


        {/*DELETE SINGLE POPUP */}
        <DeleteDialog<DeleteDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this contact?"
          data={deleteDialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
          }}
          onDelete={handleDelete}
        />

        {/* ✅ DELETE ALL POPUP */}
        <DeleteDialog<DeleteAllDialogDataInterface>
          isOpen={isDeleteAllDialogOpen}
          title="Are you sure you want to delete ALL contacts?"
          data={deleteAllDialogData}
          onClose={() => {
            setIsDeleteAllDialogOpen(false);
            setDeleteAllDialogData(null);
          }}
          onDelete={handleDeleteAll}
        />

        {/* Assign User Popup */}
        {isAssignOpen && selectedContacts.length > 0 && (
          <ListPopup
            title="Assign Contacts"
            list={users}
            selected={selectedUser}
            onSelect={handleSelectUser}
            onSubmit={handleAssignto}
            submitLabel="Assign"
            onClose={() => setIsAssignOpen(false)}
          />
        )}



        {/* ✅ TABLE */}
        <div className="p-4 max-md:p-3 bg-white rounded-md w-full">
          <div className="flex justify-between items-center">
            <PageHeader title="Dashboard" subtitles={["Contact"]} />
            <div className=" flex items-center gap-4">
              {
                admin?.role === "administrator" && <button className=" flex justify-center items-center gap-1 hover:bg-[var(--color-primary-light)] cursor-pointer text-[var(--color-primary)] text-sm bg-[var(--color-primary-lighter)] px-2 py-1 rounded-sm " onClick={() => {
                  if (selectedContacts.length === 0) {
                    toast.error("Please select at least one contact to export")
                    return
                  }
                  exportToExcel(exportingContactData, "contact_list")
                }}>
                  <CiExport /> Export
                </button>
              }
              <AddButton
                url="/contact/add"
                text="Add"
                icon={<PlusSquare size={18} />}
              />
            </div>
          </div>

          {/* TABLE SECTION */}
          <section className="flex flex-col mt-6 p-2  rounded-md">
            <div className="m-5 relative">
              <div className="flex justify-between cursor-pointer items-center py-1 px-2 border border-gray-800 rounded-md" onClick={() => setToggleSearchDropdown(!toggleSearchDropdown)}>
                <h3 className="flex items-center gap-1"><CiSearch />Advance Search</h3>
                <button
                  type="button"

                  className="p-2 hover:bg-gray-200 rounded-md cursor-pointer"
                >
                  {toggleSearchDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
              </div>

              <div className={`overflow-hidden ${toggleSearchDropdown ? "overflow-visible max-h-[2000px]" : " overflow-hidden max-h-0"} transition-all duration-500 ease-in-out px-5`}>

                <div className="flex flex-col gap-5 my-5">
                  <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1 max-lg:grid-cols-2">

                    <SingleSelect options={Array.isArray(fieldOptions.StatusAssign) ? fieldOptions.StatusAssign : []} value={filters.StatusAssign[0]} label="Status Assign" onChange={(v) => handleSelectChange("StatusAssign", v)} />

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
                            ContactType: []
                          };
                          setFilters(updatedFilters);
                          setDependent(prev => ({
                            ...prev,
                            Campaign: { id: selectedObj._id, name: selectedObj.Name },
                            ContactType: { id: "", name: "" }
                          }));
                          handleSelectChange("Campaign", selectedObj.Name, updatedFilters)
                        }
                      }}
                    />

                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.ContactType) ? fieldOptions.ContactType : []}
                      label="Contact Type"
                      value={dependent.ContactType.name}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {
                        const selectedObj = fieldOptions.ContactType.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            ContactType: [selectedObj.Name],
                          };
                          setFilters(updatedFilters);
                          setDependent(prev => ({
                            ...prev,
                            ContactType: { id: selectedObj._id, name: selectedObj.Name },
                          }));
                          handleSelectChange("ContactType", selectedObj.Name, updatedFilters)
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

                    <SingleSelect options={Array.isArray(fieldOptions.User) ? fieldOptions.User : []} value={filters.User[0]} label="User" onChange={(v) => handleSelectChange("User", v)} />

                    <SingleSelect options={Array.isArray(["10", "25", "50", "100"]) ? ["10", "25", "50", "100"] : []} value={filters.Limit[0]} label="Limit" onChange={(v) => handleSelectChange("Limit", v)} />

                  </div>

                </div>

                {/* ✅ Keyword Search */}
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
            <div className=" overflow-auto">
              <div className="flex gap-10 items-center px-3 py-4 min-w-max text-gray-700">

                <label htmlFor="selectall" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
                  <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative">Select All</span>
                </label>
                <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                  if (selectedContacts.length <= 0) toast.error("please select atleast 1 customer")
                  else {
                    setIsAssignOpen(true);
                    fetchUsers()
                  } 0
                }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative">Asign To</span></button>
                <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                  if (selectedContacts.length <= 0) toast.error("please select atleast 1 customer")
                  else {
                    setIsMailAllOpen(true);
                    fetchEmailTemplates()
                  }
                }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative">Email All</span></button>
                <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                  if (selectedContacts.length <= 0) toast.error("please select atleast 1 customer")
                  else {
                    setIsWhatsappAllOpen(true);
                    fetchWhatsappTemplates()
                  }
                }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative">SMS All</span></button>
                {/* <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
                  <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative ">Mass Update</span>
                </button> */}
                <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                  if (contactData.length > 0) {
                    if (selectedContacts.length < 1) {
                      const firstPageIds = currentRows.map((c) => c._id);
                      setSelectedContacts(firstPageIds);
                    }
                    setIsDeleteAllDialogOpen(true);
                    setDeleteAllDialogData({});
                  }
                }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative ">Delete All</span>
                </button>
              </div>


              {/* TABLE */}
              <table className="table-auto w-full border-collapse text-sm border border-gray-200">
                <thead className="bg-[var(--color-primary)] rounmd text-white">
                  <tr>
                    {/* SELECT ALL */}
                    <th className="px-2 py-3 text-left">
                      <input
                        id="selectall"
                        type="checkbox"
                        onChange={handleSelectAll}
                        checked={
                          currentRows.length > 0 &&
                          currentRows.every((r) =>
                            selectedContacts.includes(r._id)
                          )
                        }
                      />
                    </th>

                    <th className="px-4 py-3 border-r border-r-[var(--color-secondary-dark)] text-left">S.No.</th>
                    <th className="px-4 py-3 border-r border-r-[var(--color-secondary-dark)] text-left">Campaign</th>
                    <th className="px-4 py-3 border-r border-r-[var(--color-secondary-dark)] text-left">Qualifications</th>
                    <th className="px-4 py-3 border-r border-r-[var(--color-secondary-dark)] text-left">Locations</th>
                    <th className="px-4 py-3 border-r border-r-[var(--color-secondary-dark)] text-left">Contact No</th>
                    <th className="px-4 py-3 border-r border-r-[var(--color-secondary-dark)] text-left">Assign To</th>
                    <th className="px-4 py-3 border-r border-r-[var(--color-secondary-dark)] text-left">Date</th>
                    <th className="px-4 py-3 border-r border-r-[var(--color-secondary-dark)] text-left">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((item, index) => (
                      <tr
                        key={item._id}
                        className="border-t hover:bg-[#f7f6f3] transition-all duration-200"
                      >
                        {/* ✅ ROW CHECKBOX */}
                        <td className="px-2 py-3 border border-gray-200">
                          <input
                            type="checkbox"
                            checked={selectedContacts.includes(item._id)}
                            onChange={() => handleSelectRow(item._id)}
                          />
                        </td>

                        <td className="px-4 py-3">
                          {indexOfFirstRow + index + 1}
                        </td>
                        <td className="px-4 py-3 border border-gray-200">{item.Campaign}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Qualifications}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.Location}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.ContactNo}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.AssignTo ? item.AssignTo : "N/A"}</td>
                        <td className="px-4 py-3 border border-gray-200">{item.date}</td>

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
                              router.push(
                                `/followups/contact/add/${item._id}`
                              )
                            }
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
                            onClick={() => router.push(`/contact/edit/${item._id}`)}
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
                                id: item._id,
                                contactName: item.Name,
                                contactEmail: item.Email,
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
                        colSpan={9}
                        className="text-center py-4 text-gray-500"
                      >
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>


            </div>
            {/* ✅ PAGINATION */}
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
                    currentTablePage === totalTablePages ||
                    currentRows.length <= 0
                  }
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
