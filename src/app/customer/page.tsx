"use client"
import { useEffect, useMemo, useRef, useState } from "react";
import { CiExport, CiSearch } from "react-icons/ci";
import { IoIosArrowUp, IoIosArrowDown, IoMdClose } from "react-icons/io";
import { MdEdit, MdDelete, MdAdd, MdFavorite, MdFavoriteBorder, MdEmail } from "react-icons/md";
import Button from '@mui/material/Button';
import SingleSelect from "@/app/component/SingleSelect";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowDown, ArrowUp, ArrowUpRight, Bot, ChevronsLeft, ChevronsRight, PlusSquare, Sparkles, UserPlus, Zap } from "lucide-react";
import ProtectedRoute from "../component/ProtectedRoutes";
import toast, { Toaster } from "react-hot-toast";
import { getCustomer, deleteCustomer, getFilteredCustomer, updateCustomer, assignCustomer, deleteAllCustomer, getDuplicateContacts, getTodayCustomer, startCallByAIAgent, getCallLogs, getCallReport } from "@/store/customer";
import { CheckDialogDataInterface, CustomerAdvInterface, customerAssignInterface, customerGetDataInterface, DeleteDialogDataInterface } from "@/store/customer.interface";
import DeleteDialog from "../component/popups/DeleteDialog";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypes, getTypesByCampaign } from "@/store/masters/types/types";
import { getCity } from "@/store/masters/city/city";
import { getLocation, getLocationByCity } from "@/store/masters/location/location";
import { handleFieldOptions } from "../utils/handleFieldOptions";
import PopupMenu from "../component/popups/PopupMenu";
import { getAllAdmins } from "@/store/auth";
import { usersGetDataInterface } from "@/store/auth.interface";
import { getSubtype, getSubtypeByCampaignAndType } from "@/store/masters/subtype/subtype";
import { mailAllCustomerInterface, mailGetDataInterface } from "@/store/masters/mail/mail.interface";
import { whatsappAllCustomerInterface, whatsappGetDataInterface } from "@/store/masters/whatsapp/whatsapp.interface";
import { emailAllCustomer, getMail } from "@/store/masters/mail/mail";
import { getWhatsapp, whatsappAllCustomer } from "@/store/masters/whatsapp/whatsapp";
import FavouriteDialog from "../component/popups/FavouriteDialog";
import AddButton from "../component/buttons/AddButton";
import PageHeader from "../component/labels/PageHeader";
import ListPopup from "../component/popups/ListPopup";
import LoaderCircle from "../component/LoaderCircle";
import useHorizontalScroll from "@/hooks/useHorizontalScroll";
import { Description } from "@radix-ui/react-dialog";
import LeadsSection from "../phonescreens/DashboardScreens/LeadsSection";
import CustomerTable from "../phonescreens/DashboardScreens/tables/CustomerTable";
import DynamicAdvance from "../phonescreens/DashboardScreens/DynamicAdvance";
import { handleFieldOptionsObject } from "../utils/handleFieldOptionsObject";
import ObjectSelect from "../component/ObjectSelect";
import { FaCaretDown, FaCaretUp, FaCheck, FaCheckDouble, FaEye, FaMicrophone, FaPhone, FaWhatsapp } from "react-icons/fa";
import { useAuth } from "@/context/AuthContext";
import { exportToExcel } from "../utils/exportToExcel";
import { getsubLocationByCityLoc } from "@/store/masters/sublocation/sublocation";
import { Sub } from "@radix-ui/react-dropdown-menu";
import { formatDateDMY } from "../utils/formatDateDMY";
import TableDialog from "../component/popups/TableDialog";
import { IoCheckmark, IoCheckmarkDoneOutline } from "react-icons/io5";
import DateSelector from "../component/DateSelector";
import BounceLoader from "react-spinners/BounceLoader";
import SyncLoader from "react-spinners/SyncLoader"
import BeatLoader from "react-spinners/BeatLoader"
import HashLoader from "react-spinners/HashLoader"
import { getReferences } from "@/store/masters/references/references";
import { getPrice } from "@/store/masters/price/price";
import { useCustomerFieldLabel } from "@/context/customer/CustomerFieldLabelContext";
import Tablesetting from "../component/table/TableSetting";
import FollowupAddDialog from "../component/popups/FollowupAddDialog";
import { deleteFollowup, getFollowupByCustomerId } from "@/store/customerFollowups";
import { customerFollowupAllDataInterface } from "@/store/customerFollowups.interface";
import { FollowupDeleteDialogDataInterface } from "@/store/contactFollowups.interface";
import { BsArrowLeftShort, BsPersonFill } from "react-icons/bs";
import GoogleMapDialog from "../component/popups/GoogleMapDialogue";
import CustomerEditDialog from "../component/popups/CustomerEditDialog";
import { callAllDataInterface } from "@/store/masters/call/call.interface";
import { callCustomer } from "@/store/masters/call/call";
import { useAIAgents } from "@/hooks/useAIAgents";
import AgentSelector from "../component/AgentSelector";
import RightSidebar from "../component/popups/RightSidebar";
import FollowupAgentWorkspace from "../component/aiagents/FollowupAgentWorkspace";
import { getLeadType } from "@/store/masters/leadtype/leadtype";
import PriceRange from "../component/PriceRange";
import BottomSheet from "../component/popups/BottomSheet";
import BottomPopup from "../component/popups/BottomPopup";
import AIChatMessages from "../component/aiagents/AIChatMessages";
import AIAgentDropdown from "../component/aiagents/AIAgentDropdown";
import TodayCustomerDialog from "../component/popups/TodayCustomerDialog";
import { HiCalendar } from "react-icons/hi2";
import { create } from "domain";
import QualificationAgentWorkspace from "../component/aiagents/QualificationAgentWorkspace";
import CallingAgentWorkspace from "../component/aiagents/CallingAgentWorkspace";
import RecommendAgentWorkspace from "../component/aiagents/RecommendAgentWorkspace";
import AIAgentSidebar from "../component/aiagents/AIAgentSidebar";
import DataMiningAgentWorkspace from "../component/aiagents/AnalyticsAgentWorkspace";
import AnalyticsAgentWorkspace from "../component/aiagents/AnalyticsAgentWorkspace";
import SocialMiningAgentWorkspace from "../component/aiagents/MiningAgentWorkspace";


interface DeleteAllDialogDataInterface { }

interface AIAgent {
  id: string
  name: string
  description: string
  type: string
  status: string
  campaign?: string
  targetSegment?: string
  capability?: string
  tasksCompleted?: number
  accuracy?: number
  createdAt?: string
  assignedUsers?: string[]
}

export default function Customer() {
  const router = useRouter();
  const hasInitialFetched = useRef(false);
  const { getLabel, labels } = useCustomerFieldLabel();
  const { getUserAgents, getAdminAgents } = useAIAgents();
  const [agents, setAgents] = useState<AIAgent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<AIAgent | null>(null);
  const [isAIAgentsDialogOpen, setIsAIAgentDialogOpen] = useState(false);
  /* fetch */
  const FETCH_CHUNK = 100;
  const [keywordInput, setKeywordInput] = useState("");
  const [fetchedCount, setFetchedCount] = useState(0);
  const [hasMoreCustomers, setHasMoreCustomers] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [totalCustomers, setTotalCustomers] = useState(0);
  const [totalCustomerPage, setTotalCustomerPage] = useState(1)
  const [isFilteredTrigger, setIsFilteredTrigger] = useState(false);
  const lastAppliedFiltersRef = useRef<typeof filters | null>(null);
  const [isDupContactTableLoading, setIsDupContactTableLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [messages, setMessages] = useState<
    { role: 'user' | 'ai'; text: string }[]
  >([]);

  const [qualificationAiMessages, setQualificationAiMessages] = useState<
    { role: 'user' | 'ai'; text: string }[]
  >([]);
  const totalCustomersRef = useRef(0);

  /*NEW STATE FOR SELECTED CUSTOMERS */
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [selectedUser, setSelectUser] = useState<string[]>([]);
  const [selectedWhatsapptemplate, setSelectedWhatsapptemplate] = useState<string>();
  const [selectedMailtemplate, setSelectedMailtemplate] = useState<string>();
  const [users, setUsers] = useState<usersGetDataInterface[]>([])

  const [mailTemplates, setMailtemplates] = useState<mailGetDataInterface[]>([])
  const [whatsappTemplates, setWhatsappTemplates] = useState<whatsappGetDataInterface[]>([])


  /*REST OF YOUR STATES (UNCHANGED) */
  const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isMailAllOpen, setIsMailAllOpen] = useState(false);
  const [isWhatsappAllOpen, setIsWhatsappAllOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteAllDialogOpen, setIsDeleteAllDialogOpen] = useState(false);
  const [isFavouriteDialogOpen, setIsFavouriteDialogOpen] = useState(false);
  const [dialogData, setDialogData] = useState<DeleteDialogDataInterface | null>(null);
  const [dialogType, setDialogType] = useState<"delete" | "favourite" | null>(null);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [isFavrouteCustomer, setIsFavrouteCustomer] = useState<boolean>(false);
  const [customerTableLoader, setCustomerTableLoader] = useState(true);
  const [deleteAllDialogData, setDeleteAllDialogData] = useState<DeleteAllDialogDataInterface | null>(null);
  const [isTableDialogOpen, setIsTableDialogOpen] = useState(false);
  const [tableDialogcustomerData, setTableDialogCustomerData] = useState<customerGetDataInterface[]>([]);

  const [isFollowupOpen, setIsFollowupOpen] = useState(false);
  const [selectedCustomerFollowupId, setSelectedCustomerFollowupId] = useState<string | null>(null);
  const [followupDialogData, setFollowupDialogData] = useState<customerFollowupAllDataInterface[] | null>([]);
  const [isfollowupDialogOpen, setIsFollowupDialogOpen] = useState(false);
  const [isFollowupDeleteDialogOpen, setIsFollowupDeleteDialogOpen] = useState(false);
  const [followupdeleteDialogData, setFollowupDeleteDialogData] = useState<FollowupDeleteDialogDataInterface | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<any>(null);
  const [assignMode, setAssignMode] = useState<"selected" | "campaign">("selected");
  const [selectedCampaign, setSelectedCampaign] = useState<string[] | undefined>([]);
  const [campaignList, setCampaignList] = useState<
    { _id: string; Name: string; Status: string }[]
  >([]);

  const [isMapOpen, setIsMapOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [isTemperatureDialogOpen, setIsTemperatureDialogOpen] = useState(false);
  const [temperatureDialogData, setTemperatureDialogData] = useState<any>(null);
  const [isTodayDialogOpen, setIsTodayDialogOpen] = useState(false);

  const temperatureConfig: any = {
    hot: {
      bg: "#FDECEA",
      color: "#D32F2F",
      icon: "🔥"
    },
    warm: {
      bg: "#FFF8E1",
      color: "#F9A825",
      icon: "🌤️"
    },
    cold: {
      bg: "#E3F2FD",
      color: "#1976D2",
      icon: "❄️"
    }
  };



  const scrollRef = useHorizontalScroll();
  const searchParams = useSearchParams();
  const { admin } = useAuth();

  const [rowsPerTablePage, setRowsPerTablePage] = useState(100);
  const SEARCH_FIELDS = [
    "Description",
    "Campaign",
    "CustomerType",
    "CustomerSubType",
    "City",
    "Location",
    "SubLocation",
    "Price",
    "ReferenceId",
  ] as const;
  const [toggleAiGenieSearchBy, setToggleAiGenieSearchBy] = useState(true);

  const [filters, setFilters] = useState({
    StatusAssign: [] as string[],
    Campaign: [] as string[],
    CustomerType: [] as string[],
    CustomerSubType: [] as string[],
    City: [] as string[],
    Location: [] as string[],
    SubLocation: [] as string[],
    User: [] as string[],
    Keyword: "" as string,
    SearchIn: [] as string[],
    ReferenceId: [] as string[],
    MinPrice: [] as string[],
    MaxPrice: [] as string[],
    Price: [] as string[],
    LeadType: [] as string[],
    LeadTemperature: [] as string[],
    isFavourite: false as boolean,
    Limit: ["100"] as string[],
    StartDate: [] as string[],
    EndDate: [] as string[],
  });

  const [dependent, setDependent] = useState({
    Campaign: { id: "", name: "" },
    CustomerType: { id: "", name: "" },
    CustomerSubType: { id: "", name: "" },
    City: { id: "", name: "" },
    Location: { id: "", name: "" },
    SubLocation: { id: "", name: "" },
  });

  //this is for setting button
  // for header
  type Column = {
    key: string;
    label: string;
    isPinned: boolean;
    visible: boolean;
  };




  const [newHeader, setNewHeader] = useState("");
  //end here setting button 

  const [customerData, setCustomerData] = useState<customerGetDataInterface[]>([]);
  const [todaycustomerData, setTodayCustomerData] = useState<customerGetDataInterface[]>([]);
  const [customerAdv, setCustomerAdv] = useState<CustomerAdvInterface[]>([]);
  const [exportingCustomerData, setExportingCustomerData] = useState<customerGetDataInterface[]>([]);
  const [duplicateContacts, setDuplicateContacts] = useState<Record<string, boolean>>({});

  const dynamicFieldKeys = useMemo(() => {
    if (!customerData.length) return [];

    const keys = new Set<string>();

    customerData.forEach(customer => {
      if (customer.CustomerFields) {
        Object.keys(customer.CustomerFields).forEach(key => {
          keys.add(key);
        });
      }
    });

    return Array.from(keys);
  }, [customerData]);
  const DEFAULT_COLUMNS: Column[] = useMemo(() => {
    const staticColumns = [
      { key: "sno", label: "S.No.", isPinned: true, visible: true },
      { key: "campaign", label: getLabel("Campaign", "Campaign"), isPinned: true, visible: true },
      { key: "type", label: getLabel("CustomerType", "CustomerType"), isPinned: true, visible: true },
      { key: "subtype", label: getLabel("CustomerSubType", "Customer Subtype"), isPinned: true, visible: true },
      { key: "name", label: getLabel("customerName", "Customer Name"), isPinned: true, visible: true },
      { key: "leadtype", label: getLabel("LeadType", "Lead Type"), isPinned: true, visible: true },
      { key: "City", label: getLabel("City", "City"), isPinned: true, visible: true },
      { key: "Area", label: getLabel("Area", "Area"), isPinned: true, visible: true },
      { key: "Email", label: getLabel("Email", "Email"), isPinned: true, visible: true },
      { key: "Facillities", label: getLabel("Facillities", "Facillities"), isPinned: true, visible: true },
      { key: "CustomerId", label: getLabel("CustomerId", "Customer Id"), isPinned: true, visible: true },
      { key: "ClientId", label: getLabel("ClientId", "Client Id"), isPinned: true, visible: true },
      { key: "CustomerYear", label: getLabel("CustomerYear", "Customer Year"), isPinned: true, visible: true },
      { key: "Other", label: getLabel("Other", "Other"), isPinned: true, visible: true },
      { key: "description", label: getLabel("Description", "Description"), isPinned: true, visible: true },
      { key: "location", label: getLabel("Location", "Location"), isPinned: true, visible: true },
      { key: "sublocation", label: getLabel("SubLocation", "Sub Location"), isPinned: true, visible: true },
      { key: "contact", label: getLabel("ContactNumber", "Contact No"), isPinned: true, visible: true },
      { key: "assign", label: getLabel("AssignTo", "Assign To"), isPinned: true, visible: true },
      { key: "reference", label: getLabel("ReferenceId", "Reference Id"), isPinned: true, visible: true },
      { key: "Adderess", label: getLabel("Adderess", "Adderess"), isPinned: true, visible: true },
      { key: "url", label: getLabel("URL", "URL"), isPinned: true, visible: true },
      { key: "video", label: getLabel("Video", "Video"), isPinned: true, visible: true },
      { key: "googlemap", label: getLabel("GoogleMap", "GoogleMap"), isPinned: true, visible: true },
      { key: "price", label: getLabel("Price", "Price"), isPinned: true, visible: true },
      { key: "date", label: getLabel("CustomerDate", "Date"), isPinned: true, visible: true },
      /* { key: "actions", label: "Actions", isPinned: true, visible: true }, */
    ]

    const actionsColumn = {
      key: "actions",
      label: "Actions",
      isPinned: true,
      visible: true,
    };
    const dynamicColumns = dynamicFieldKeys.map(key => ({
      key: `cf_${key}`, // prefix to avoid collision
      label: key,
      isPinned: false,
      visible: false,
    }));

    return [...staticColumns, ...dynamicColumns, actionsColumn];
  }, [labels, dynamicFieldKeys]);
  // console.log("this is my default columns", DEFAULT_COLUMNS);
  const [columns, setColumns] = useState<Column[]>(() => {
    const saved = localStorage.getItem("table-columns");
    return saved ? JSON.parse(saved) : DEFAULT_COLUMNS;
  });



  const STEPS = {
    SEARCH: "Searching Customer Data",
    SHOW: "Showing Result",
    FOUND: (count: number) => `${count} Customers Found`,

  } as const;


  const [currentStep, setCurrentStep] = useState<string>("");
  const [fade, setFade] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const changeStep = async (text: string) => {
    setFade(true);              // fade out
    await new Promise(r => setTimeout(r, 2000));

    setCurrentStep(text);       // replace text
    setFade(false);             // fade in
  };

  const wait = (ms: number) =>
    new Promise(resolve => setTimeout(resolve, ms));

  // header effect
  useEffect(() => {
    setColumns(prevColumns =>
      DEFAULT_COLUMNS.map(defaultCol => {
        const existing = prevColumns.find(c => c.key === defaultCol.key);

        return existing
          ? { ...existing, label: defaultCol.label } // keep user settings
          : defaultCol; // new column added
      })
    );
  }, [DEFAULT_COLUMNS]);

  const fetchCampaigns = async () => {
    const res = await getCampaign();
    if (res) {
      setCampaignList(res);
    }
  };

  useEffect(() => {
    localStorage.setItem("table-columns", JSON.stringify(columns));
  }, [columns]);

  const fetchAiAgents = async () => {
    if (admin?.role === "administrator") {
      const res = await getAdminAgents();
      setAgents(res);
      return;
    }
    const agents = await getUserAgents();
    setAgents(agents);
  }

  useEffect(() => {
    const status = searchParams.get("Campaign");
    const reference = searchParams.get("ReferenceId");
    const leadtemperature = searchParams.get("LeadTemperature");
    if (!fieldOptions?.Campaign?.length) return;
    if (!fieldOptions?.ReferenceId?.length) return;
    if (!fieldOptions?.LeadTemperature?.length) return;

    if (status) {

      const campaignObj = fieldOptions?.Campaign?.find(
        (c) => c.Name === status
      );
      // Auto set filter
      setFilters((prev) => ({
        ...prev,
        StatusAssign: [status],
      }));
      setDependent((prev) => ({
        ...prev,
        Campaign: { id: campaignObj?._id, name: campaignObj?.Name }
      }))

      const updatedFilters = {
        ...filters,
        Campaign: [status],
      };

      setCustomerTableLoader(false);

      // Fetch filtered data
      handleSelectChange("Campaign", status, updatedFilters);
    }
    else if (reference) {

      const referenceObj = fieldOptions?.ReferenceId?.find(
        (c) => c.Name === reference
      );
      // Auto set filter
      setFilters((prev) => ({
        ...prev,
        ReferenceId: [reference],
      }));
      setDependent((prev) => ({
        ...prev,
        ReferenceId: { id: referenceObj?._id, name: referenceObj?.Name }
      }))

      const updatedFilters = {
        ...filters,
        ReferenceId: [reference],
      };

      setCustomerTableLoader(false);

      // Fetch filtered data
      handleSelectChange("ReferenceId", reference, updatedFilters);
    }
    else if (leadtemperature) {

      const leadtemperatureObj = fieldOptions?.LeadTemperature?.find(
        (c) => c.Name === leadtemperature
      );
      // Auto set filter
      setFilters((prev) => ({
        ...prev,
        LeadTemperature: [leadtemperature],
      }));
      setDependent((prev) => ({
        ...prev,
        LeadTemperature: { id: leadtemperatureObj?._id, name: leadtemperatureObj?.Name }
      }))

      const updatedFilters = {
        ...filters,
        LeadTemperature: [leadtemperature],
      };

      setCustomerTableLoader(false);

      // Fetch filtered data
      handleSelectChange("LeadTemperature", leadtemperature, updatedFilters);
    }
    else {
      getCustomers();
      fetchFields();
      getTotalCustomerPage();
    }
    fetchAiAgents();
    fetchTodayCustomer();
    audioRef.current = new Audio(
      "https://res.cloudinary.com/dsyzuwice/video/upload/v1774423860/voicepop_ypkmtz.mp3"
    );

    fetchcalllogs();

  }, [searchParams, fieldOptions.Campaign, fieldOptions.ReferenceId]);

  const fetchcalllogs = async () => {
    const res = await getCallReport();

    const res2 = await getCallLogs();

    console.log("call data", res);
    console.log("call logs", res2);
  }


  useEffect(() => {
    const datatoExport = customerData.filter((customer) => selectedCustomers.includes(customer._id));
    setExportingCustomerData(datatoExport);
  }, [selectedCustomers]);

  const getTotalCustomerPage = async () => {
    const data = await getCustomer();
    const total = Math.ceil(data.length / Number(filters.Limit[0])) || 1
    setTotalCustomerPage(total);
    setTotalCustomers(data.length);
  }

  const fetchTodayCustomer = async () => {
    const data = await getTodayCustomer();

    if (data) {
      const mapped = data.map(mapCustomer);
      setTodayCustomerData(mapped);
    }
  }

  const handleOpenTodayCustomers = async () => {
    setIsTodayDialogOpen(true);
    await fetchTodayCustomer();
  };


  useEffect(() => {
    const total = Math.ceil(totalCustomers / Number(filters.Limit[0])) || 1
    setTotalCustomerPage(total);
  }, [filters, totalCustomers]);


  function getPlainTextFromHTML(htmlString: string) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    return doc.body.textContent || "";
  }

  const getCustomers = async () => {
    setCustomerTableLoader(true);
    setFetchedCount(0);
    setHasMoreCustomers(true);

    const queryParams = new URLSearchParams();
    queryParams.append("Limit", FETCH_CHUNK.toString());
    queryParams.append("Skip", "0");

    const data = await getFilteredCustomer(queryParams.toString());

    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(mapped);
      setFetchedCount(mapped.length);
      setHasMoreCustomers(mapped.length === FETCH_CHUNK);
    }


    setCustomerTableLoader(false);
  };


  const handleEditClick = (id: string | number) => {
    setCustomerToEdit(id);
    setIsEditOpen(true);
  };

  const handleFollowups = async (id: string, Name: string) => {
    const data = await getFollowupByCustomerId(id as string);
    if (data) {
      console.log("Followups customer data", data)
      setFollowupDialogData(data.map((item: any) => ({
        _id: item._id,
        customer: item.customer._id,
        Name: Name,
        StartDate: item.StartDate,
        StatusType: item.StatusType,
        FollowupNextDate: item.FollowupNextDate,
        Description: item.Description,
      })));
      if (data.length === 0)
        toast.error("no followup available")
      return;
    }
    toast.error("no followup available")

  }


  const mapCustomer = (item: any) => {
    const date = new Date(item.createdAt);
    const formattedDate =
      date.getDate().toString().padStart(2, "0") + "-" +
      (date.getMonth() + 1).toString().padStart(2, "0") + "-" +
      date.getFullYear();

    return {
      _id: item._id,
      Campaign: item.Campaign,
      Type: item.CustomerType,
      SubType: item.CustomerSubType,
      Name: item.customerName,
      Description: item.Description,
      Email: item.Email,
      City: item.City,
      Location: item.Location,
      Adderess: item.Adderess,
      Area: item.Area,
      SubLocation: item.SubLocation,
      CustomerId: item.CustomerId,
      ClientId: item.ClientId,
      CustomerYear: item.CustomerYear,
      Facillities: item.Facillities,
      ContactNumber: item.ContactNumber?.slice(0, 10),
      ReferenceId: item.ReferenceId,
      AssignTo: item.AssignTo ?? [],
      isFavourite: item.isFavourite,
      isChecked: item.isChecked,
      LeadTemperature: item.LeadTemperature || "cold",
      Other: item.Other,
      Date:
        item.CustomerDate === "N/A"
          ? "N/A"
          : item.CustomerDate
            ? formatDateDMY(item.CustomerDate)
            : formattedDate,
      CustomerImage: item.CustomerImage || "",
      SitePlan: item.SitePlan || "",
      URL: item.URL || "",
      Video: item.Video || "",
      GoogleMap: item.GoogleMap || "",
      Price: item.Price || "",
      LeadType: item.LeadType || "",
      CustomerFields: item.CustomerFields || {},
      createdAt: formattedDate,
    };
  };


  const fetchMore = async () => {
    if (isFetchingMore || !hasMoreCustomers) return;

    setIsFetchingMore(true);
    setCustomerTableLoader(true);

    const queryParams = new URLSearchParams();
    queryParams.append("Limit", FETCH_CHUNK.toString());
    queryParams.append("Skip", customerData.length.toString());

    Object.entries(filters).forEach(([key, value]) => {
      if (key === "Limit") return;
      if (Array.isArray(value)) value.forEach(v => queryParams.append(key, v));
      if (typeof value === "string" && value) queryParams.append(key, value);
    });

    const data = await getFilteredCustomer(queryParams.toString());

    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(prev => [...prev, ...mapped]);
      setFetchedCount(prev => prev + mapped.length);
      setHasMoreCustomers(mapped.length === FETCH_CHUNK);
    }

    setCustomerTableLoader(false);
    setIsFetchingMore(false);
  };


  const handleLastPage = async () => {
    setCustomerTableLoader(true);

    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (key === "Limit") return;
      if (Array.isArray(value)) value.forEach(v => queryParams.append(key, v));
      if (typeof value === "string" && value) queryParams.append(key, value);
    });

    // Fetch all rows at once by not limiting
    queryParams.delete("Limit");
    queryParams.delete("Skip");

    const data = await getFilteredCustomer(queryParams.toString());
    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(mapped);
      setFetchedCount(mapped.length);
      setHasMoreCustomers(false); // all loaded
      setTotalCustomers(mapped.length);
      // calculate last page using the freshly fetched data
      const finalTotalPages = Math.ceil(mapped.length / rowsPerTablePage) || 1;
      setCurrentTablePage(finalTotalPages); // jump to last page
    }

    setCustomerTableLoader(false);
  };


  const handleCustomerUpdated = (updatedCustomer: any) => {
    const mappedCustomer = mapCustomer(updatedCustomer);

    setCustomerData((prev: any[]) =>
      prev.map((cust) =>
        cust._id === mappedCustomer._id ? mappedCustomer : cust
      )
    );
  };


  const handleDelete = async (data: DeleteDialogDataInterface | null) => {
    if (!data) return;
    const response = await deleteCustomer(data.id);
    if (response) {
      toast.success(`Customer deleted successfully`);
      setIsDeleteDialogOpen(false);
      setDialogData(null);
      if (isFilteredTrigger) {
        await refreshCustomersWithLastFilters();
        return;
      }
      handleTableDialogData(data.ContactNumber);
      await getCustomers();
    }
  };

  const handleFavourite = async (data: DeleteDialogDataInterface | null) => {
    if (!data) return;

    const current = customerData.find(c => c._id === data.id);
    if (!current) return;

    const newFav = !current.isFavourite;

    const formData = new FormData();
    formData.append("isFavourite", newFav.toString());



    const res = await updateCustomer(data.id, formData);

    if (res) {
      // 🔥 Optimistic update (instant UI update)
      setCustomerData(prev =>
        prev.map(c =>
          c._id === data.id
            ? { ...c, isFavourite: newFav }
            : c
        )
      );
      toast.success("Favourite updated successfully");
    } else {
      toast.error("Failed to update favourite");

      // 🔁 rollback if API fails
      setCustomerData(prev =>
        prev.map(c =>
          c._id === data.id
            ? { ...c, isFavourite: current.isFavourite }
            : c
        )
      );
    }

    setIsFavouriteDialogOpen(false);
    setDialogData(null);
  };

  const handleCall = async (data: callAllDataInterface | null) => {
    if (!data) return;
    const res = await callCustomer(data);

    if (res) {
      console.log(" response is here ", res);
      toast.success("call sent successfully");
      return;
    }

    toast.error(" failed to call this customer ");
  }


  const handleChecked = async (data: CheckDialogDataInterface | null) => {
    if (!data) return;
    console.log("data is ", data)
    const formData = new FormData();
    const current = customerData.find(c => c._id === data.id);
    const newChecked = !current?.isChecked;
    console.log(" yes ", current?.isChecked)
    formData.append("isChecked", newChecked.toString());

    const res = await updateCustomer(data.id, formData);
    if (res) {
      // toast.success("Favourite updated successfully");
      // setIsFavouriteDialogOpen(false);
      setCustomerData(prev =>
        prev.map(customer =>
          customer._id === data.id
            ? { ...customer, isChecked: newChecked }
            : customer
        )
      );
      // await getCustomers();
    } else {
      toast.error("Failed to check customer");
    }
  };

  const handleFavouriteToggle = (id: string, name: string, number: string, isFavourite: boolean) => {
    setDialogType("favourite");
    setIsFavouriteDialogOpen(true);
    setDialogData({
      id,
      customerName: name,
      ContactNumber: number
    });
    setIsFavrouteCustomer(isFavourite);
  };

  /*   useEffect(() => {
      filterByDate();
    }, [filters.StartDate[0], filters.EndDate[0]]) */
  const filterByDate = async () => {
    if (!filters.StartDate[0] || !filters.EndDate[0])
      return

    const updatedFilters = {
      ...filters,
    };

    //  CRITICAL: sync pagination filter state
    lastAppliedFiltersRef.current = updatedFilters;
    setIsFilteredTrigger(true);

    const queryParams = new URLSearchParams();
    queryParams.append("StartDate", filters.StartDate[0]);
    queryParams.append("EndDate", filters.EndDate[0]);
    /*     queryParams.append("Limit", FETCH_CHUNK.toString());
        queryParams.append("Skip", "0");
     */
    const data = await getFilteredCustomer(queryParams.toString());
    const totalQueryParams = new URLSearchParams(queryParams);
    /*   queryParams.append("Limit", FETCH_CHUNK.toString());
      queryParams.append("Skip", "0"); */
    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(mapped);
      setFetchedCount(mapped.length);
      setHasMoreCustomers(mapped.length === FETCH_CHUNK);
      setCurrentTablePage(1);
    }
    const totalfilteredData = await getFilteredCustomer(
      totalQueryParams.toString()
    );

    if (totalfilteredData) {
      setTotalCustomers(totalfilteredData.length);
    }

    setCustomerTableLoader(false);

  }

  const handleSelectChange = async (
    field: keyof typeof filters,
    selected: string | string[] | boolean,
    filtersOverride?: typeof filters
  ) => {
    setCustomerTableLoader(true);

    const updatedFilters = filtersOverride || {
      ...filters,
      [field]: Array.isArray(selected)
        ? selected
        : typeof selected === "boolean"
          ? field === "isFavourite"
            ? selected // keep boolean
            : selected
              ? ["true"]
              : []
          : selected
            ? [selected]
            : [],
    };

    setFilters(updatedFilters);
    lastAppliedFiltersRef.current = updatedFilters;
    setIsFilteredTrigger(true);

    try {
      const hasBothDates =
        updatedFilters.StartDate?.length > 0 &&
        updatedFilters.EndDate?.length > 0;

      const queryParams = new URLSearchParams();

      Object.entries(updatedFilters).forEach(([key, value]) => {
        if (key === "Limit") return;

        if (
          (key === "StartDate" || key === "EndDate") &&
          !hasBothDates
        ) {
          return;
        }

        if (key === "isFavourite" && value === true) {
          queryParams.append(key, "true");
          return;
        }

        if (Array.isArray(value) && value.length > 0) {
          value.forEach((v) => queryParams.append(key, v));
        } else if (typeof value === "string" && value) {
          queryParams.append(key, value);
        }
      });

      if (!hasBothDates) {
        queryParams.append("Limit", FETCH_CHUNK.toString());
        queryParams.append("Skip", "0");
      }

      // 👇 ensures loader renders before API call
      await new Promise(requestAnimationFrame);

      const data = await getFilteredCustomer(queryParams.toString());

      if (data) {
        const mapped = data.map(mapCustomer);
        setCustomerData(mapped);
        setFetchedCount(mapped.length);
        setHasMoreCustomers(mapped.length === FETCH_CHUNK);
        setCurrentTablePage(1);
      }

      const totalQueryParams = new URLSearchParams(queryParams);
      totalQueryParams.delete("Limit");
      totalQueryParams.delete("Skip");

      const totalfilteredData = await getFilteredCustomer(
        totalQueryParams.toString()
      );

      if (totalfilteredData) {
        setTotalCustomers(totalfilteredData.length);
        if (field === "Keyword") {
          await changeStep(STEPS.FOUND(totalfilteredData.length));
        }
      }

      return data;
    } finally {
      // 👇 ALWAYS runs even if API fails
      setCustomerTableLoader(false);
    }
  };

  const clearFilter = async () => {
    setFilters({
      StatusAssign: [],
      Campaign: [],
      CustomerType: [],
      CustomerSubType: [],
      City: [],
      Location: [],
      SubLocation: [],
      User: [],
      Keyword: "",
      SearchIn: [],
      ReferenceId: [],
      MinPrice: [],
      MaxPrice: [],
      Price: [],
      LeadType: [],
      LeadTemperature: [],
      isFavourite: false,
      Limit: ["100"],
      StartDate: [],
      EndDate: [],
    });
    setDependent({
      Campaign: { id: "", name: "" },
      CustomerType: { id: "", name: "" },
      CustomerSubType: { id: "", name: "" },
      City: { id: "", name: "" },
      Location: { id: "", name: "" },
      SubLocation: { id: "", name: "" },
    })
    setCurrentStep("")
    setAiLoading(false)
    setIsFilteredTrigger(false);
    await getCustomers();

    getTotalCustomerPage();
  };

  const refreshCustomersWithLastFilters = async () => {
    const appliedFilters = lastAppliedFiltersRef.current;

    if (!appliedFilters) return;

    setCustomerTableLoader(true);

    const queryParams = new URLSearchParams();
    Object.entries(appliedFilters).forEach(([key, value]) => {
      if (key === "Limit") return;
      if (Array.isArray(value) && value.length > 0) {
        value.forEach((v) => queryParams.append(key, v));
      } else if (typeof value === "string" && value) {
        queryParams.append(key, value);
      }
    });

    queryParams.append("Limit", FETCH_CHUNK.toString());
    queryParams.append("Skip", "0");

    const data = await getFilteredCustomer(queryParams.toString());

    if (data) {
      const mapped = data.map(mapCustomer);
      setCustomerData(mapped);
      setFetchedCount(mapped.length);
      setHasMoreCustomers(mapped.length === FETCH_CHUNK);
      setCurrentTablePage(1);
    }

    setCustomerTableLoader(false);
  };


  const totalTablePages = useMemo(() => {
    return Math.ceil(customerData.length / rowsPerTablePage) || 1;
  }, [customerData, rowsPerTablePage]);

  const startIndex = (currentTablePage - 1) * rowsPerTablePage;
  const currentRows = customerData.slice(startIndex, startIndex + rowsPerTablePage);


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
    if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1);
  };

  const [filterOptions, setFilterOptions] = useState({
    StatusAssign: [] as string[],
    Campaign: [],
    CustomerType: [],
    CustomerSubtype: [],
    City: [],
    Location: [],
    User: [] as string[],
  });

  const fetchUsers = async () => {
    const response = await getAllAdmins();

    if (response) {
      // console.log("response ", response);

      const admins = response?.admins?.filter((e) => e.role === "user" || e.role === "city_admin") ?? []; //ensure only user and city_admin roles are fetched

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
      //  console.log("response ", response);

      const mailtemplates = response?.filter((e: any) => e.status === "Active") ?? []; //ensure only user roles are fetched
      //  console.log(" mail data ", response)
      setMailtemplates(
        mailtemplates.map((item: any): mailGetDataInterface => ({
          _id: item?._id ?? "",
          name: item?.name ?? "",
          body: getPlainTextFromHTML(item?.body) ?? ""
        }))
      );

      return;
    }
  };

  const fetchWhatsappTemplates = async () => {
    const response = await getWhatsapp();

    if (response) {
      //console.log("response ", response);

      const whatsapptemplates = response?.filter((e: any) => e.status === "Active") ?? []; //ensure only active status are fetched
      //console.log(" mail data ", response)
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


  const handleDeleteAll = async () => {
    if (customerData.length === 0) return;
    const payload = {
      customerIds: [...selectedCustomers]
    }
    const response = await deleteAllCustomer(payload);
    if (response) {
      toast.success(`All contacts deleted`);
      setIsDeleteAllDialogOpen(false);
      setDeleteAllDialogData(null);
      setSelectedCustomers([]);
      if (isFilteredTrigger) {
        await refreshCustomersWithLastFilters();
        return;
      }
      getCustomers();


    }
  };


  //Fetch dropdown data
  const fetchFields = async () => {
    /*     await handleFieldOptions(
          [
            { key: "StatusAssign", staticData: ["Assigned", "Unassigned"] },
            { key: "Campaign", fetchFn: getCampaign },
            { key: "CustomerType", fetchFn: getTypes },
            { key: "CustomerSubtype", fetchFn: getSubtype },
            { key: "City", fetchFn: getCity },
            { key: "Location", fetchFn: getLocation },
            { key: "User", fetchFn: getAllAdmins },
          ],
          setFieldOptions
        ); */
  };

  // Object-based fields (for ObjectSelect)
  const objectFields = [
    { key: "Campaign", fetchFn: getCampaign },
    { key: "CustomerType", staticData: [] },
    { key: "CustomerSubtype", staticData: [] },
    { key: "City", fetchFn: getCity },
    { key: "Location", staticData: [] }, // dependent
    { key: "SubLocation", staticData: [] }, // dependent

  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
    { key: "StatusAssign", staticData: ["Assigned", "Unassigned"] },
    { key: "LeadTemperature", staticData: ["hot", "warm", "cold"] },
    { key: "User", fetchFn: getAllAdmins },
    { key: "ReferenceId", fetchFn: getReferences },
    { key: "Price", fetchFn: getPrice },
    { key: "LeadType", fetchFn: getLeadType },
    { key: "MinPrice", staticData: ["1000", "10,000", "20,000", "40,000", "60,000", "100,000", "200,000", "1,000,000", "2,000,000", "10,000,000", "100,000,000"] },
    { key: "MaxPrice", staticData: ["5000", "10,000", "20,000", "40,000", "60,000", "100,000", "200,000", "1,000,000", "2,000,000", "10,000,000", "100,000,000"] },
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
    const customerTypeId = dependent.CustomerType.id;
    const cityId = dependent.City.id;
    const locationId = dependent.Location.id;

    if (campaignId) {
      fetchCustomerType(campaignId);
    } else {
      setFieldOptions(prev => ({ ...prev, CustomerType: [] }));
      setFilters(prev => ({ ...prev, CustomerType: [], CustomerSubType: [] }));
    }

    if (campaignId && customerTypeId) {
      fetchCustomerSubType(campaignId, customerTypeId);
    } else {
      setFieldOptions(prev => ({ ...prev, CustomerSubType: [] }));
      setFilters(prev => ({ ...prev, CustomerSubType: [] }));
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

  }, [dependent.Campaign.id, dependent.CustomerType.id, dependent.City.id, dependent.Location.id]);


  const fetchCustomerType = async (campaignId: string) => {
    try {
      const res = await getTypesByCampaign(campaignId);
      setFieldOptions((prev) => ({ ...prev, CustomerType: res || [] }));
    } catch (error) {
      console.error("Error fetching types:", error);
      setFieldOptions((prev) => ({ ...prev, CustomerType: [] }));
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


  const fetchCustomerSubType = async (campaignId: string, customertypeId: string) => {
    try {
      const res = await getSubtypeByCampaignAndType(campaignId, customertypeId);
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: res || [] }));
    } catch (error) {
      console.error("Error fetching types:", error);
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: [] }));
    }
  };



  /* SELECT ALL HANDLER */
  const handleSelectAll = () => {
    const allIds = currentRows.map((c) => c._id);
    setSelectedCustomers((prev) =>
      allIds.every((id) => prev.includes(id))
        ? prev.filter((id) => !allIds.includes(id)) // unselect all
        : [...new Set([...prev, ...allIds])] // select all visible rows
    );
  };

  /* ✅ SELECT SINGLE ROW HANDLER */
  const handleSelectRow = (id: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(id)
        ? prev.filter((cid) => cid !== id)
        : [...prev, id]
    );
  };

  const handleSelectUser = (id: string) => {
    setSelectUser((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id]
    ); //  only one user at a time
  };

  const handleSelectMailtemplate = (id: string) => {
    setSelectedMailtemplate(prev => (prev === id ? undefined : id)); //  only one user at a time
  };

  const handleSelectWhatsapptemplate = (id: string) => {
    setSelectedWhatsapptemplate(prev => (prev === id ? undefined : id)); // only one user at a time
  };


  const handleAssignto = async () => {
    if (!selectedUser) {
      toast.error("Please select a user");
      return;
    }

    if (assignMode === "selected" && selectedCustomers.length === 0) {
      toast.error("Please select customers");
      return;
    }

    if (assignMode === "campaign" && !selectedCampaign) {
      toast.error("Please select a campaign");
      return;
    }

    const payload: customerAssignInterface = {
      assignToId: selectedUser,
      ...(assignMode === "selected"
        ? { customerIds: selectedCustomers }
        : { campaign: selectedCampaign }),
    };

    const response = await assignCustomer(payload);

    if (response.success) {
      toast.success("Customers assigned successfully");
      await getCustomers();
      setIsAssignOpen(false);
      return response;
    }
    //console.log(" faraz is here wow brother ",response)
    toast.error(response.message);
    setIsAssignOpen(false);
  };

  const handleMailAll = async () => {
    if (!selectedMailtemplate) {
      toast.error("Please select a template");
      return;
    }

    const payload: mailAllCustomerInterface = {
      customerIds: selectedCustomers,
      templateId: selectedMailtemplate,
    };

    // console.log(payload)

    const response = await emailAllCustomer(payload);
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

    const payload: whatsappAllCustomerInterface = {
      customerIds: selectedCustomers,
      templateId: selectedWhatsapptemplate,
    };

    // console.log(payload)

    const response = await whatsappAllCustomer(payload);
    if (response) {
      toast.success("Whatsapp customers succesfully")
      setIsWhatsappAllOpen(false);
      return response
    }
    toast.error("failed to whatsapp customers")
    setIsWhatsappAllOpen(false);
  };

  const phonetableheader = [{
    key: "Campaign", label: getLabel("Campaign", "Campaign")
  },
  {
    key: "Name", label: getLabel("customerName", "Name")
  },
  {
    key: "Location", label: getLabel("Location", "Location")
  },
  {
    key: "Description", label: getLabel("Description", "Description")
  },
  {
    key: "ContactNumber", label: "Ph. No."
  }]

  const phoneViewAllHaders = [
    {
      key: "Campaign", label: getLabel("Campaign", "Campaign")
    },
    {
      key: "Type", label: getLabel("CustomerType", "Customer Type")
    },
    {
      key: "SubType", label: getLabel("CustomerSubType", "Customer Subtype")
    },
    {
      key: "Name", label: getLabel("customerName", "Name")
    },
    {
      key: "Location", label: getLabel("Location", "Location")
    },
    {
      key: "Description", label: getLabel("Description", "Description")
    },
    {
      key: "Adderess", label: "Address"
    },
    {
      key: "ContactNumber", label: "Contact No"
    },
    {
      key: "AssignTo", label: getLabel("AssignTo", "Assign To")
    },
    {
      key: "Date", label: getLabel("CustomerDate", "Date")
    }
  ]

  /* followup navigations */
  const addFollowup = (id: string) => router.push(`/followups/customer/add/${id}`);
  const editThisFollowup = async (id: string) => {
    router.push(`/followups/customer/edit/${id}`);
  }

  const handleUpdateTemperature = async (id: string, value: string) => {

    console.log(" id is ", id, "payload is ", value)

    const formData = new FormData();
    formData.append("LeadTemperature", value.toString());

    const res = await updateCustomer(id, formData);

    if (res) {
      setTemperatureDialogData((prev: any) => ({
        ...prev,
        current: value
      }));

      setCustomerData(prev =>
        prev.map(customer =>
          customer._id === id
            ? { ...customer, LeadTemperature: value }
            : customer
        )
      );

      toast.success(`Marked as ${value.toUpperCase()}`);
      setIsTemperatureDialogOpen(false);
      return;
    }


    toast.error("Failed to update");

  };

  const deleteThisFollowup = async (data: FollowupDeleteDialogDataInterface) => {
    //alert(id)
    if (!data) return;
    const response = await deleteFollowup(data.id);
    if (response && response.success) {
      toast.success("Followup deleted successfully");
      setIsFollowupDialogOpen(false);
      setIsFollowupDeleteDialogOpen(true);
      setFollowupDeleteDialogData(null);
      setFollowupDialogData([]);
      //   getFollowups();
    } else {
      toast.error("Failed to delete followup");
    }
  }



  const handleTableDialogData = async (contactno: string) => {
    setIsDupContactTableLoading(true);

    const queryParams = new URLSearchParams();
    /*     queryParams.append("Limit", "100000");
        queryParams.append("Skip", "0"); */
    queryParams.append("ContactNumber", contactno);
    const data = await getFilteredCustomer(queryParams.toString());
    if (data.length > 0) {
      // console.log(" data of contact no is ", data)
      const mapped = data.map(mapCustomer);
      setTableDialogCustomerData(mapped)
      setIsDupContactTableLoading(false);
      return mapped
    }
    toast.error("Sever Error, please try again")
    setIsDupContactTableLoading(false);
    return [];
  }

  const isDuplicateContactNo = async (contactNo: string, currentId: string) => {
    if (duplicateContacts[contactNo] !== undefined) return duplicateContacts[contactNo];

    const queryParams = new URLSearchParams();
    /*  queryParams.append("Limit", "100000");
     queryParams.append("Skip", "0"); */
    queryParams.append("ContactNumber", contactNo);

    const data = await getFilteredCustomer(queryParams.toString());

    // Exclude current row
    const hasDuplicates = data.filter((d: any) => d._id !== currentId).length > 0;

    setDuplicateContacts(prev => ({ ...prev, [contactNo]: hasDuplicates }));

    return hasDuplicates;
  };

  const addFollowupFromDialogue = (id: string) => {
    setSelectedCustomerFollowupId(id)
    setIsFollowupOpen(true);
  };

  useEffect(() => {
    /*   currentRows.forEach(item => {
      isDuplicateContactNo(item.ContactNumber, item._id);
    }); */
    if (currentRows.length > 0) {
      checkDuplicateContactsBatch();
    }
  }, [JSON.stringify(currentRows.map(r => r.ContactNumber))]);

  useEffect(() => {
    totalCustomersRef.current = totalCustomers;
  }, [totalCustomers]);

  const checkDuplicateContactsBatch = async () => {
    const contactNumbers = currentRows.map(item => item.ContactNumber);

    const data = await getDuplicateContacts({ contactNumbers: contactNumbers });
    console.log(" contact dup data ", data)

    // Expected response: { "9876543210": true, "9999999999": false }

    setDuplicateContacts((data || {}) as Record<string, boolean>);
  };

  const aiGenieSearch = async (keyword?: string) => {
    const finalKeyword = keyword ?? keywordInput;

    if (!finalKeyword.trim()) return;

    console.log(" searching for ", finalKeyword);

    await wait(800);

    await changeStep(STEPS.SHOW);
    await wait(800);

    const filtersOverride = {
      ...filters,
      Keyword: finalKeyword,
    };

    if (filters.SearchIn.length > 0) {
      filtersOverride.SearchIn = filters.SearchIn;
    }

    const data = await handleSelectChange("Keyword", finalKeyword, filtersOverride);

    const count = data?.length ?? 0;

    await wait(1000);

    setAiLoading(false);

    return {
      data,
      count: totalCustomers, // still risky but we'll fix below
    };
  };

  const handleAgentCalling = async (id: string) => {

    const payload = {
      customerId: id
    }

    const res = await startCallByAIAgent(payload);

    console.log(" response is here ", res);

    if (res) {
      toast.success("call initiated successfully");
      return;
    }
  }



  const avatarColors = [
    { bg: "bg-[#EEEDFE]", text: "text-[#3C3489]", tag: "bg-[#EEEDFE] text-[#3C3489]" },
    { bg: "bg-[#E1F5EE]", text: "text-[#085041]", tag: "bg-[#E1F5EE] text-[#085041]" },
    { bg: "bg-[#FAEEDA]", text: "text-[#633806]", tag: "bg-[#FAEEDA] text-[#633806]" },
    { bg: "bg-[#E6F1FB]", text: "text-[#0C447C]", tag: "bg-[#E6F1FB] text-[#0C447C]" },
  ];

  const startListening = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    setIsListening(true); // 👈 START UI

    // ⏱ Auto stop after 10 sec
    const timeout = setTimeout(() => {
      recognition.stop();
    }, 10000);

    recognition.onresult = async (event: any) => {
      const transcript = event.results[0][0].transcript;

      setKeywordInput(transcript);
      setAiLoading(true);
      setCurrentStep(STEPS.SEARCH)
      // DIRECT CALL (no state dependency)
      await aiGenieSearch(transcript);
    };

    recognition.onerror = () => {
      setIsListening(false);
      clearTimeout(timeout);
    };

    recognition.onend = () => {
      setIsListening(false); // 👈 STOP UI
      clearTimeout(timeout);
    };


  };
  const playSound = () => {
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.currentTime = 0; // restart every time
        audioRef.current.play();
        console.log("working yes ")
      }
    }, 100);
  };

  const handleSend = async () => {
    if (!keywordInput.trim() || aiLoading) return;

    const userText = keywordInput;

    // 1. Show user message
    setMessages((prev) => [
      ...prev,
      { role: 'user', text: userText },
    ]);

    setKeywordInput('');
    setAiLoading(true);
    setCurrentStep(STEPS.SEARCH);

    try {
      // 2. Call your existing logic
      const result = await aiGenieSearch(userText);

      // 3. Show AI response (use real later, dummy for now)
      await new Promise(requestAnimationFrame);

      const total = totalCustomersRef.current;
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text:
            /*  result?.message || */
            `Found ${total} matching leads for "${userText}". Showing best results based on AI scoring.`,
        },
      ]);


    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          text: 'Something went wrong while finding matches.',
        },
      ]);
    } finally {
      setAiLoading(false);
      setCurrentStep('');
    }
  };

  const AGENTS_TYPE_ICON: Record<string, any> = {
    Outreach: <Sparkles />,
    Analytics: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335552/img-8_twulvb.png" alt="Analytics" className=" object-contain w-10 h-10" />,
    Calling: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335521/img-6_mky5rb.png" alt="Calling" className=" object-contain w-10 h-10" />,
    Research: <img src="/icons/research.png" alt="Research" />,
    Automation: <img src="/icons/automation.png" alt="Automation" />,
    Followup: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335523/img-7_xjwzbl.png" alt="Followup" className=" object-contain w-10 h-10" />,
    Matching: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-2_l1xdll.png" alt="Matching" className="object-contain w-10 h-10" />,
    Qualification: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-1_nz99v7.png" alt="Qualification" className=" object-contain w-10 h-10" />,
    Recommendation: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-3_scja92.png" alt="Recommendation" className=" object-contain w-10 h-10" />,
    Mining: <img src="https://res.cloudinary.com/djipgt6vc/image/upload/v1774335520/img-3_scja92.png" alt="Mining" className=" object-contain w-10 h-10" />,
    default: "AG",
  };

  return (
    <ProtectedRoute>
      {/* whatsapp all popup */}
      <Toaster position="top-right" />
      {isWhatsappAllOpen && selectedCustomers.length > 0 && (
        <ListPopup
          title="Whatsapp Customers"
          list={whatsappTemplates}
          selected={selectedWhatsapptemplate}
          onSelect={handleSelectWhatsapptemplate}
          onSubmit={handleWhatsappAll}
          submitLabel="Whatsapp"
          onClose={() => {
            setSelectedCustomers([]);
            setIsWhatsappAllOpen(false)
          }}
        />
      )}
      {/* mail all popup */}
      {isMailAllOpen && selectedCustomers.length > 0 && (
        <ListPopup
          title="Mail Customers"
          list={mailTemplates}
          selected={selectedMailtemplate}
          onSelect={handleSelectMailtemplate}
          onSubmit={handleMailAll}
          submitLabel="Mail"
          onClose={() => {
            setSelectedCustomers([]);
            setIsMailAllOpen(false)
          }}
        />
      )}

      {/* Favourite Dialog */}
      <FavouriteDialog<DeleteDialogDataInterface>
        isOpen={isFavouriteDialogOpen}
        title={`Are you sure you want to ${isFavrouteCustomer ? "unfavourite" : "favourite"} this customer?`}
        data={dialogData}
        onClose={() => {
          setIsFavouriteDialogOpen(false);
          setDialogData(null);
        }}
        onDelete={handleFavourite}
      />






      {/* today customer dialogue */}
      <TodayCustomerDialog
        isOpen={isTodayDialogOpen}
        data={todaycustomerData}
        onClose={() => setIsTodayDialogOpen(false)}
        onDelete={(item) => {
          setIsDeleteDialogOpen(true);
          setDialogType("delete");

          setDialogData({
            id: item._id,
            customerName: item.Name,
            ContactNumber: item.ContactNumber,
          });
        }}
        onEdit={(item) => {
          handleEditClick(item._id)
        }}
        onDeleteAll={(ids) => {
          setSelectedCustomers(ids);
          setIsDeleteAllDialogOpen(true);
          setDeleteAllDialogData({});
          console.log(" ids are ", ids)
        }}
      />

      {/* customer by contact number */}
      <TableDialog
        isOpen={isTableDialogOpen}
        isLoading={isDupContactTableLoading}
        title="Customers By"
        data={tableDialogcustomerData}
        onClose={() => {
          setIsTableDialogOpen(false);
          setTableDialogCustomerData([]);
        }}
        renderActions={(item) => (
          <div className="grid grid-cols-2 max-md:flex gap-3 items-center h-full">

            <Button
              sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px" }}
              /* onClick={() => router.push(`/followups/customer/add/${item._id}`)} */
              onClick={() => {
                setSelectedCustomerFollowupId(item._id);
                setIsFollowupOpen(true);
              }}
            >
              <MdAdd />
            </Button>

            <Button
              sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px" }}
              onClick={() => router.push(`/customer/edit/${item._id}`)}
            >
              <MdEdit />
            </Button>
            {admin?.role === "administrator" && <Button
              sx={{ backgroundColor: "#FDECEA", color: "#C62828", minWidth: "32px", height: "32px", borderRadius: "8px" }}
              onClick={() => {
                setIsDeleteDialogOpen(true);
                setDialogType("delete");
                setDialogData({
                  id: item._id,
                  customerName: item.Name,
                  ContactNumber: item.ContactNumber,
                });
              }}
            >
              <MdDelete />
            </Button>
            }


          </div>
        )}
      />


      <CustomerEditDialog
        isOpen={isEditOpen}
        customerId={customerToEdit}
        onClose={() => {
          setIsEditOpen(false);
          setCustomerToEdit(null);
        }}
        onCustomerUpdated={handleCustomerUpdated}
      />

      {/* Delete Dialog */}
      <DeleteDialog<DeleteDialogDataInterface>
        isOpen={isDeleteDialogOpen}
        title="Are you sure you want to delete this customer?"
        data={dialogData}
        onClose={() => {
          setIsDeleteDialogOpen(false);
          setDialogData(null);
        }}
        onDelete={handleDelete}
      />

      <DeleteDialog<DeleteAllDialogDataInterface>
        isOpen={isDeleteAllDialogOpen}
        title="Are you sure you want to delete ALL customers?"
        data={deleteAllDialogData}
        onClose={() => {
          setIsDeleteAllDialogOpen(false);
          setDeleteAllDialogData(null);
        }}
        onDelete={handleDeleteAll}
      />

      <DeleteDialog<FollowupDeleteDialogDataInterface>
        isOpen={isFollowupDeleteDialogOpen}
        title={`Are you sure you want delete the followup for customer?`}
        data={followupdeleteDialogData}
        onClose={() => {
          setFollowupDeleteDialogData(null)
          setIsFollowupDeleteDialogOpen(false);
        }}
        onDelete={deleteThisFollowup}
      />

      <FollowupAddDialog
        isOpen={isFollowupOpen}
        customerId={selectedCustomerFollowupId}
        onClose={() => {
          setIsFollowupOpen(false)
          setSelectedCustomerFollowupId(null)
        }}
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

      {
        isTemperatureDialogOpen && temperatureDialogData && (
          <PopupMenu
            onClose={() => {
              setIsTemperatureDialogOpen(false);
              setTemperatureDialogData(null);
            }}
          >
            <div className="flex flex-col bg-white rounded-3xl shadow-2xl max-w-[380px] w-full m-3 overflow-hidden"
              style={{ boxShadow: "0 24px 60px rgba(0,0,0,0.18)" }}
            >
              {/* Header */}
              <div
                className="relative px-6 pt-6 pb-5 overflow-hidden"
                style={{ background: "linear-gradient(135deg, var(--color-secondary-darker) 0%, var(--color-secondary) 100%)" }}
              >
                {/* Decorative circles */}
                <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-4 -left-4 w-16 h-16 rounded-full opacity-10 bg-white" />

                <div className="relative flex justify-between items-start">
                  <div>
                    <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">Lead Status</p>
                    <h2 className="text-white text-xl font-bold leading-tight">Update Temperature</h2>
                    <p className="text-white/80 text-sm mt-1 font-medium">{temperatureDialogData.name}</p>
                  </div>
                  <button
                    onClick={() => {
                      setIsTemperatureDialogOpen(false);
                      setTemperatureDialogData(null);
                    }}
                    className="w-8 h-8 cursor-pointer rounded-full flex items-center justify-center bg-white/15 hover:bg-white/25 transition-colors mt-0.5"
                  >
                    <IoMdClose className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>

              {/* Options */}
              <div className="flex flex-col gap-2.5 p-5">

                {/* HOT */}
                <button
                  onClick={() => handleUpdateTemperature(temperatureDialogData.id, "hot")}
                  className={`group cursor-pointer relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${temperatureDialogData.current === "hot"
                    ? "border-red-400 bg-red-50 shadow-sm shadow-red-100"
                    : "border-gray-100 hover:border-red-200 hover:bg-red-50/50"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all ${temperatureDialogData.current === "hot" ? "bg-red-100" : "bg-gray-100 group-hover:bg-red-100"
                    }`}>
                    🔥
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">Hot</p>
                    <p className="text-xs text-gray-400 mt-0.5">High chance to convert</p>
                  </div>
                  {temperatureDialogData.current === "hot" && (
                    <div className="w-5 h-5 rounded-full bg-red-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* WARM */}
                <button
                  onClick={() => handleUpdateTemperature(temperatureDialogData.id, "warm")}
                  className={`group cursor-pointer relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${temperatureDialogData.current === "warm"
                    ? "border-yellow-400 bg-yellow-50 shadow-sm shadow-yellow-100"
                    : "border-gray-100 hover:border-yellow-200 hover:bg-yellow-50/50"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all ${temperatureDialogData.current === "warm" ? "bg-yellow-100" : "bg-gray-100 group-hover:bg-yellow-100"
                    }`}>
                    🌤️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">Warm</p>
                    <p className="text-xs text-gray-400 mt-0.5">Moderate interest</p>
                  </div>
                  {temperatureDialogData.current === "warm" && (
                    <div className="w-5 h-5 rounded-full bg-yellow-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

                {/* COLD */}
                <button
                  onClick={() => handleUpdateTemperature(temperatureDialogData.id, "cold")}
                  className={`group cursor-pointer relative flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${temperatureDialogData.current === "cold"
                    ? "border-blue-400 bg-blue-50 shadow-sm shadow-blue-100"
                    : "border-gray-100 hover:border-blue-200 hover:bg-blue-50/50"
                    }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 transition-all ${temperatureDialogData.current === "cold" ? "bg-blue-100" : "bg-gray-100 group-hover:bg-blue-100"
                    }`}>
                    ❄️
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-800 text-sm">Cold</p>
                    <p className="text-xs text-gray-400 mt-0.5">Low or no interest</p>
                  </div>
                  {temperatureDialogData.current === "cold" && (
                    <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>

              </div>

              {/* Footer hint */}
              <p className="text-center text-xs text-gray-300 pb-4">Tap an option to update the lead status</p>
            </div>
          </PopupMenu>
        )
      }

      {/* Mobile Customer Page */}
      <div className=" sm:hidden min-h-[calc(100vh-56px)] overflow-auto max-sm:py-2">

        <div className=" flex justify-between items-center px-0">
          <h1 className=" text-[var(--color-primary)] font-extrabold text-2xl ">Leads</h1>

        </div>
        <div className=" w-full">
          <DynamicAdvance>
            <ObjectSelect
              options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
              label={getLabel("Campaign", "Campaign")}
              value={dependent.Campaign.id}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {
                const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                if (selectedObj) {
                  const updatedFilters = {
                    ...filters,
                    Campaign: [selectedObj.Name],
                    CustomerType: [],   // reset
                    CustomerSubType: []
                  };
                  setFilters(updatedFilters);

                  setDependent(prev => ({
                    ...prev,
                    Campaign: { id: selectedObj._id, name: selectedObj.Name },
                    CustomerType: { id: "", name: "" },   // reset
                    CustomerSubType: { id: "", name: "" }
                  }));
                  handleSelectChange("Campaign", selectedObj.Name, updatedFilters)
                }
              }}
            />

            <ObjectSelect
              options={Array.isArray(fieldOptions?.CustomerType) ? fieldOptions.CustomerType : []}
              label={getLabel("CustomerType", "Customer Type")}
              value={dependent.CustomerType.name}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {
                const selectedObj = fieldOptions.CustomerType.find((i) => i._id === selectedId);
                if (selectedObj) {
                  const updatedFilters = {
                    ...filters,
                    CustomerType: [selectedObj.Name],   // reset
                    CustomerSubType: []
                  };
                  setFilters(updatedFilters);


                  setDependent(prev => ({
                    ...prev,
                    CustomerType: { id: selectedObj._id, name: selectedObj.Name },   // reset
                    CustomerSubType: { id: "", name: "" }
                  }));
                  handleSelectChange("CustomerType", selectedObj.Name, updatedFilters)
                }
              }}

            />

            <ObjectSelect
              options={Array.isArray(fieldOptions?.CustomerSubtype) ? fieldOptions.CustomerSubtype : []}
              label={getLabel("CustomerSubType", "Customer Subtype")}
              value={dependent.CustomerSubType.name}
              getLabel={(item) => item?.Name || ""}
              getId={(item) => item?._id || ""}
              onChange={(selectedId) => {

                const selectedObj = fieldOptions.CustomerSubtype.find((i) => i._id === selectedId);
                if (selectedObj) {
                  const updatedFilters = {
                    ...filters,
                    CustomerSubType: [selectedObj.Name]
                  };
                  setFilters(updatedFilters);

                  setDependent(prev => ({
                    ...prev,
                    CustomerSubType: { id: selectedObj._id, name: selectedObj.Name }
                  }));
                  handleSelectChange("CustomerSubType", selectedObj.Name, updatedFilters)
                }
              }}
            />


            <ObjectSelect
              options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
              label={getLabel("City", "City")}
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
              label={getLabel("Location", "Location")}
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


            <SingleSelect options={Array.isArray(fieldOptions?.User) ? fieldOptions.User : []} value={filters.User[0]} label="User" onChange={(v) => handleSelectChange("User", v)} isSearchable />
            {/* Keyword Search */}
            <form className="flex  max-lg:flex-col justify-between items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (keywordInput.trim() === "")
                  return
                setAiLoading(true);
                setCurrentStep(STEPS.SEARCH)
                aiGenieSearch();
              }}
            >

              <div className=" w-full ">
                <div>
                  <div className=" flex justify-between">
                    <label className="flex gap-1 mb-2 items-center text-sm font-bold text-[var(--color-secondary-darker)] ml-1">{aiLoading ? <span>
                      <BounceLoader
                        loading={true}
                        color="var(--color-primary)"
                        size={25}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      /></span> : <span><img className=" w-[25px] " src="/aiBot.png" /></span>
                    }
                      <div className="">AI Genie</div>


                    </label>
                    {/*  {isListening && (
                          <div className="flex items-center gap-2.5 mt-2 ml-1 px-3 py-2 rounded-xl bg-red-50 border border-red-100 w-fit">
                           
                            <div className="flex items-center gap-[3px]">
                              {[0, 1, 2, 3].map((i) => (
                                <span
                                  key={i}
                                  className="block w-[3px] rounded-full bg-red-500"
                                  style={{
                                    animation: `soundBar 0.8s ease-in-out infinite alternate`,
                                    animationDelay: `${i * 0.15}s`,
                                    height: "14px",
                                  }}
                                />
                              ))}
                            </div>

                            <p className="text-red-500 text-xs font-semibold tracking-wide">
                              Listening…
                            </p>

                           
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>

                            <style>{`
      @keyframes soundBar {
        from { transform: scaleY(0.3); opacity: 0.5; }
        to   { transform: scaleY(1);   opacity: 1;   }
      }
    `}</style>
                          </div>
                        )} */}
                  </div>
                  <p className={`text-gray-400 font-light text-xs ml-2 mb-2  flex items-center gap-[1px] `}>
                    <span
                      className={`transition-opacity duration-300 `}
                    >
                      {currentStep}
                    </span>

                    {aiLoading && <span className="translate-y-[2px]">
                      <BeatLoader size={2} color="gray" />
                    </span>}

                  </p>
                  <div className="">

                    <div className=" flex justify-between items-center border border-gray-300 rounded-md w-full">
                      <input
                        type="text"
                        placeholder="What you want to search?"
                        className="outline-none w-full px-3 py-2 "
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                      />
                      <span
                        className={`relative mr-3 cursor-pointer flex items-center justify-center`}
                        onClick={() => {
                          playSound();      // 🔊 sound plays
                          startListening(); // 🎤 mic starts
                        }}
                      >
                        {/* Pulse Ring */}
                        {isListening && (
                          <span className="absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                        )}

                        {/* Mic Icon */}
                        <span
                          className={`relative z-10 p-2 rounded-full transition-all duration-300 
    ${isListening ? "bg-red-500 text-white scale-110" : "text-gray-500 hover:text-blue-500"}
  `}
                        >
                          <FaMicrophone />
                        </span>
                      </span>
                      <span className=" cursor-pointer mr-3" onClick={() => setToggleAiGenieSearchBy(!toggleAiGenieSearchBy)}>{toggleAiGenieSearchBy ? <FaCaretDown /> : <FaCaretUp />}</span>
                    </div>

                    <div className={` mt-5 overflow-hidden transition-all duration-300 ${toggleAiGenieSearchBy ? " h-0" : " h-[150px]"}`}>
                      {/* Unselected Fields */}
                      <div className="flex flex-wrap gap-2 px-3 mb-5">
                        {SEARCH_FIELDS.filter(f => !filters.SearchIn.includes(f)).map((field) => (
                          <button
                            key={field}
                            type="button"
                            className="px-2 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition"
                            onClick={() =>
                              setFilters(prev => ({
                                ...prev,
                                SearchIn: [...prev.SearchIn, field],
                              }))
                            }
                          >
                            {field.toLowerCase()}
                          </button>
                        ))}
                      </div>

                      {/* Selected Fields */}
                      <div className="">
                        {filters.SearchIn.length > 0 && <h5 className=" text-gray-500 text-sm my-2 mx-2">Selected</h5>}
                        <div className="flex flex-wrap gap-2 px-3">

                          {filters.SearchIn.map((field) => (
                            <div
                              key={field}
                              className="group relative flex items-center px-2 py-1 border border-blue-400 rounded-md text-sm bg-blue-100"
                            >
                              {field.toLowerCase()}
                              <button
                                className="ml-2 opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity text-sm text-[var(--color-primary)]"
                                onClick={() =>
                                  setFilters(prev => ({
                                    ...prev,
                                    SearchIn: prev.SearchIn.filter(f => f !== field),
                                  }))
                                }
                              >
                                <IoMdClose />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              <div className={` flex justify-center items-center w-full transition duration-300  ${toggleAiGenieSearchBy ? " lg:-mt-32" : " lg:mt-5"} `}>
                {!aiLoading ? <button type="submit" className="border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 cursor-pointer px-3 py-2  rounded-md">
                  Explore
                </button> : <button type="button" className="flex gap-1 justify-center items-center border border-[var(--color-primary)]  bg-[var(--color-primary)] text-white transition-all duration-300 cursor-pointer px-3 py-2  rounded-md">
                  Exploring <HashLoader
                    loading={true}
                    color="white"
                    size={12}
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
                </button>}

                <button type="reset" onClick={clearFilter} className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2  rounded-md ml-3">
                  Clear Search
                </button>
              </div>
            </form>
            <div className=" w-full flex justify-end"></div>
            {/*  <div className=" w-full flex justify-end">
              <button type="reset" onClick={clearFilter} className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2 rounded-md">
                Clear Search
              </button>
            </div> */}

          </DynamicAdvance>
        </div>
        <CustomerTable
          leads={customerData}
          labelLeads={phonetableheader}
          allLabelLeads={phoneViewAllHaders}
          onAdd={(id) => addFollowupFromDialogue(id)}
          onEdit={(id) => /* router.push(`/customer/edit/${id}`) */ handleEditClick(id)}
          onWhatsappClick={(lead) => {
            setSelectedCustomers([lead._id]);
            setIsWhatsappAllOpen(true);
            fetchWhatsappTemplates();
          }}
          onMailClick={(lead) => {
            setSelectedCustomers([lead._id]);
            setIsMailAllOpen(true);
            fetchEmailTemplates();
          }}
          onFavourite={(lead) => {
            handleFavouriteToggle(lead._id, lead.Name, lead.ContactNumber, lead.isFavourite ?? false)
          }}
          onViewFollowup={(id, Name) => {
            setIsFollowupDialogOpen(true);
            handleFollowups(id, Name);
          }}
          onGoogleMapViewAddress={(address) => {
            if (!address) return;
            setSelectedAddress(address);
            setIsMapOpen(true);
          }}
          loader={customerTableLoader}
          hasMoreCustomers={hasMoreCustomers}
          fetchMore={fetchMore}
          duplicateContacts={duplicateContacts}
          onViewDuplicate={(contactNumber) => {
            setIsTableDialogOpen(true);
            handleTableDialogData(contactNumber);
          }}
        />


      </div>

      <GoogleMapDialog
        isOpen={isMapOpen}
        address={selectedAddress}
        onClose={() => {
          setIsMapOpen(false);
          setSelectedAddress(null);
        }}
      />

      {/* Desktop Customer page */}
      <div className=" min-h-[calc(100vh-56px)] max-sm:hidden overflow-auto max-md:py-10">





        {/* Assign User Popup */}
        {isAssignOpen && (
          <ListPopup
            title="Assign Customers"
            list={users}
            selected={selectedUser}
            onSelect={handleSelectUser}
            onSubmit={handleAssignto}
            submitLabel="Assign"
            onClose={() => setIsAssignOpen(false)}
            multiSelect
          >
            <div className="px-6 flex flex-col gap-3">

              {/* Mode Switch */}
              <div className="flex gap-4 text-sm">
                <label className="flex gap-2 items-center">
                  <input
                    type="radio"
                    checked={assignMode === "selected"}
                    onChange={() => setAssignMode("selected")}
                  />
                  Selected Customers
                </label>

                <label className="flex gap-2 items-center" onClick={() => fetchCampaigns()}>
                  <input
                    type="radio"
                    checked={assignMode === "campaign"}
                    onChange={() => setAssignMode("campaign")}
                  />
                  Entire Campaign
                </label>
              </div>

              {/* Campaign Dropdown */}
              {assignMode === "campaign" && (

                <SingleSelect
                  options={
                    campaignList
                      .filter((c) => c.Status === "Active")
                      .map((c) => (c.Name))
                  }
                  value={selectedCampaign}
                  label="Select Campaign"
                  onChange={(v: any) => setSelectedCampaign(v)}
                  isSearchable
                />
              )}
            </div>
          </ListPopup>
        )}


        {/* ---------- TABLE START ---------- */}

        <div className="p-4 px-0 max-md:p-3 w-full rounded-md bg-white max-[450px]:hidden">
          <div className="flex justify-between items-center p-2 px-4">
            <PageHeader title="Dashboard" subtitles={["Customer"]} />
            <div className=" flex items-center gap-4">
              {
                admin?.role === "administrator" && <button className=" flex justify-center items-center gap-1 hover:bg-[var(--color-primary-light)] cursor-pointer text-[var(--color-primary)] text-sm bg-[var(--color-primary-lighter)] px-2 py-1 rounded-sm " onClick={() => {
                  if (selectedCustomers.length === 0) {
                    toast.error("Please select at least one customer to export")
                    return
                  }
                  exportToExcel(exportingCustomerData, "customer_list")
                }}>
                  <CiExport /> Export
                </button>
              }
              <AddButton
                url="/customer/add"
                text="Add"
                icon={<PlusSquare size={18} />}
              />
            </div>


          </div>



          <div className="mb-4 mx-4 flex justify-between items-center">
            <button
              onClick={handleOpenTodayCustomers}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--color-primary)]/25 bg-[var(--color-primary)]/8 dark:bg-[var(--color-primary)]/12 text-[var(--color-primary)] text-[13px] font-semibold transition-all duration-150 hover:bg-[var(--color-primary)]/15 hover:border-[var(--color-primary)]/40 active:scale-[0.97] cursor-pointer"
            >
              <HiCalendar size={14} className="opacity-80" />
              Today
              {todaycustomerData?.length > 0 && (
                <span className="min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-[var(--color-primary)] text-white text-[10px] font-bold leading-none">
                  {todaycustomerData.length}
                </span>
              )}
            </button>
            <AIAgentDropdown
              agents={agents}
              setSelectedAgent={setSelectedAgent}
              setIsAIAgentDialogOpen={setIsAIAgentDialogOpen}
            />
          </div>

          <BottomPopup onClose={() => setIsAIAgentDialogOpen(false)} isOpen={isAIAgentsDialogOpen}>
            {({ isMaximized, toggleMaximize }) => (
              <div className={` flex flex-row relative overflow-hidden ${isMaximized ? "" : "rounded-t-2xl"}  h-[100%] w-full `} style={{ background: "#ffffff" }}>

                {/* LEFT DARK SIDEBAR */}
                {
                  !isMaximized && <AIAgentSidebar
                    selectedAgent={selectedAgent}
                    AGENTS_TYPE_ICON={AGENTS_TYPE_ICON}
                    onClose={() => setIsAIAgentDialogOpen(false)}
                  />
                }


                {/* RIGHT WORKSPACE */}
                <div className="flex-1 flex flex-col pb-5 w-full overflow-hidden bg-white">

                  {/* ── Top strip ── */}
                  <div
                    className="flex items-center justify-between relative px-5 flex-shrink-0 border-b"
                    style={{ height: "44px", background: "#f8fafc", borderColor: "#e2e8f0" }}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                        Workspace
                      </span>
                      <div className="w-px h-3.5" style={{ background: "#e2e8f0" }} />
                      {/* Live badge */}
                      <div
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-full"
                        style={{
                          background: aiLoading ? "rgba(56,189,248,0.1)" : "rgba(16,185,129,0.08)",
                          border: `1px solid ${aiLoading ? "rgba(56,189,248,0.25)" : "rgba(16,185,129,0.2)"}`,
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            background: aiLoading ? "#38bdf8" : "#10b981",
                            animation: aiLoading ? "pulse 1s infinite" : "none",
                          }}
                        />
                        <span
                          className="text-[9px] font-mono font-medium flex items-center gap-1"
                          style={{ color: aiLoading ? "#0ea5e9" : "#10b981" }}
                        >
                          {currentStep || "Ready"}
                          {aiLoading && <BeatLoader size={2} color="#0ea5e9" />}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons: maximize + close */}
                    <div className="flex items-center gap-1 absolute top-2 right-2 z-50">

                      {/* Maximize / Minimize button */}
                      <button
                        onClick={toggleMaximize}
                        title={isMaximized ? "Minimize" : "Maximize"}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-transparent text-[#94a3b8] hover:bg-[#e0f2fe] hover:text-[#0284c7] transition-all cursor-pointer"
                      >
                        {isMaximized ? (
                          /* Minimize icon — two inward arrows */
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="4 14 10 14 10 20" />
                            <polyline points="20 10 14 10 14 4" />
                            <line x1="10" y1="14" x2="3" y2="21" />
                            <line x1="21" y1="3" x2="14" y2="10" />
                          </svg>
                        ) : (
                          /* Maximize icon — two outward arrows */
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 3 21 3 21 9" />
                            <polyline points="9 21 3 21 3 15" />
                            <line x1="21" y1="3" x2="14" y2="10" />
                            <line x1="3" y1="21" x2="10" y2="14" />
                          </svg>
                        )}
                      </button>

                      {/* Close button */}
                      <button
                        onClick={() => setIsAIAgentDialogOpen(false)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-transparent text-[#94a3b8] hover:bg-[#fee2e2] hover:text-[#ef4444] transition-all cursor-pointer"
                      >
                        <IoMdClose size={18} />
                      </button>
                    </div>
                  </div>

                  {/* ── MATCHING AGENT ── */}
                  {selectedAgent && selectedAgent.type === "Matching" ? (
                    <div className="flex flex-col overflow-hidden flex-1">

                      {/* Chat messages — your existing AIChatMessages component, restyled */}
                      <AIChatMessages
                        agentName={selectedAgent.name}
                        messages={messages}
                        aiLoading={aiLoading}
                        currentStep={currentStep}
                        hints={[
                          "High-value leads in Mumbai",
                          "Active last 30 days",
                          "Enterprise, no contact",
                        ]}
                        onHintClick={(hint) => setKeywordInput(hint)}
                        maxHeight="100%"
                      />

                      {/* ── INPUT AREA ── */}
                      <div
                        className="flex-shrink-0 border-t px-4  pt-3"
                        style={{ borderColor: "#e2e8f0", background: "#ffffff" }}
                      >
                        {/* Collapsible fields panel */}
                        <div
                          className="overflow-hidden transition-all duration-300"
                          style={{
                            maxHeight: toggleAiGenieSearchBy ? "160px" : "0",
                            opacity: toggleAiGenieSearchBy ? 1 : 0,
                            marginBottom: toggleAiGenieSearchBy ? "10px" : "0",
                          }}
                        >
                          <div
                            className="rounded-[14px] p-3 border"
                            style={{ background: "#f8fafc", borderColor: "#e2e8f0" }}
                          >
                            <p className="text-[9px] font-semibold uppercase tracking-widest mb-2" style={{ color: "#94a3b8" }}>
                              Search in fields
                            </p>
                            <div className="flex flex-wrap gap-1.5">
                              {SEARCH_FIELDS.filter(f => !filters.SearchIn.includes(f)).map((field) => (
                                <button
                                  key={field}
                                  type="button"
                                  onClick={() => setFilters(prev => ({ ...prev, SearchIn: [...prev.SearchIn, field] }))}
                                  className="text-[10.5px] font-medium px-2 py-1 rounded-lg border transition-all"
                                  style={{ borderColor: "#e2e8f0", background: "#ffffff", color: "#64748b" }}
                                >
                                  {field.toLowerCase()}
                                </button>
                              ))}
                            </div>
                            {filters.SearchIn.length > 0 && (
                              <div className="mt-2 pt-2 border-t" style={{ borderColor: "#e2e8f0" }}>
                                <p className="text-[9px] font-semibold uppercase tracking-widest mb-1.5" style={{ color: "#94a3b8" }}>
                                  Active
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                  {filters.SearchIn.map((field) => (
                                    <div
                                      key={field}
                                      className="flex items-center gap-1 text-[10.5px] font-medium px-2 py-1 rounded-lg"
                                      style={{ background: "#e0f2fe", color: "#0284c7", border: "1px solid #bae6fd" }}
                                    >
                                      {field.toLowerCase()}
                                      <button
                                        type="button"
                                        onClick={() => setFilters(prev => ({ ...prev, SearchIn: prev.SearchIn.filter(f => f !== field) }))}
                                        className="leading-none ml-0.5 opacity-60 hover:opacity-100 transition-opacity"
                                      >
                                        ✕
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Textarea + send */}
                        <div
                          className={`flex items-end gap-2 rounded-2xl px-3.5 pt-2.5 pb-2 transition-all duration-200 border-[1.5px] ${aiLoading
                            ? "border-sky-200"
                            : "border-slate-200 focus-within:border-sky-300 focus-within:shadow-[0_0_0_3px_rgba(125,211,252,0.12)]"
                            }`}
                          style={{ background: "#ffffff" }}
                        >
                          <div className="flex-1">
                            <textarea
                              rows={2}
                              placeholder="Describe the leads you're looking for…"
                              className="w-full resize-none bg-transparent outline-none leading-relaxed disabled:opacity-40"
                              style={{ fontSize: "12.5px", color: "#0f172a" }}
                              value={keywordInput}
                              disabled={aiLoading}
                              onChange={(e) => setKeywordInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                  e.preventDefault();
                                  if (keywordInput.trim() && !aiLoading) {
                                    setAiLoading(true);
                                    setCurrentStep(STEPS.SEARCH);
                                    handleSend();
                                  }
                                }
                              }}
                            />
                            <div className="flex items-center justify-between mt-1 pt-1.5 border-t" style={{ borderColor: "#f1f5f9" }}>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  disabled={aiLoading}
                                  onClick={() => setToggleAiGenieSearchBy(!toggleAiGenieSearchBy)}
                                  className="flex items-center gap-1 text-[10px] font-medium transition-colors disabled:opacity-40"
                                  style={{ color: "#94a3b8" }}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h18M7 8h10M11 12h4" />
                                  </svg>
                                  Fields {toggleAiGenieSearchBy ? "▴" : "▾"}
                                  {filters.SearchIn.length > 0 && (
                                    <span
                                      className="ml-1 rounded-full px-1.5 text-[8.5px] font-bold"
                                      style={{ background: "#e0f2fe", color: "#0284c7" }}
                                    >
                                      {filters.SearchIn.length}
                                    </span>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={clearFilter}
                                  disabled={aiLoading}
                                  className="text-[10px] transition-colors disabled:opacity-40 hover:text-rose-500"
                                  style={{ color: "#94a3b8" }}
                                >
                                  Clear
                                </button>
                              </div>
                              <span className="text-[9.5px] font-mono" style={{ color: "#cbd5e1" }}>↵ to send</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            disabled={aiLoading || !keywordInput.trim()}
                            onClick={() => {
                              if (keywordInput.trim() && !aiLoading) {
                                setAiLoading(true);
                                setCurrentStep(STEPS.SEARCH);
                                handleSend();
                              }
                            }}
                            className="w-9 h-9 mb-1 rounded-[11px] flex items-center justify-center text-white transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 active:scale-95 hover:brightness-110"
                            style={{ background: "#0284c7", boxShadow: "0 2px 8px rgba(2,132,199,0.3)" }}
                          >
                            {aiLoading
                              ? <BounceLoader loading color="#fff" size={10} />
                              : <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                              </svg>
                            }
                          </button>
                        </div>
                      </div>
                    </div>

                    /* ── FOLLOWUP AGENT ── */
                  ) : selectedAgent && selectedAgent.type === "Followup" ? (
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      <FollowupAgentWorkspace data={selectedAgent} />
                    </div>

                    /* ── Qualification STATE ── */
                  ) : selectedAgent && selectedAgent.type === "Qualification" ? (
                    <div className="flex-1 overflow-hidden px-6 py-4">
                      <QualificationAgentWorkspace isOpen={isAIAgentsDialogOpen} />
                    </div>

                    /* ── RECOMMEND CUSTOMER STATE ── */
                  ) : selectedAgent && selectedAgent.type === "Recommendation" ? (
                    <div className="flex-1 overflow-hidden px-6 py-4">
                      <RecommendAgentWorkspace isOpen={isAIAgentsDialogOpen} />
                    </div>

                    /* ── CALLING STATE ── */
                  ) : selectedAgent && selectedAgent.type === "Calling" ? (
                    <div className="flex-1 overflow-y-auto px-6">
                      <CallingAgentWorkspace isOpen={isAIAgentsDialogOpen} />
                    </div>
                  ) : selectedAgent && selectedAgent.type === "Followup" ? (
                    <div className="flex-1 overflow-y-auto px-6 py-4">
                      <FollowupAgentWorkspace data={selectedAgent} />
                    </div>

                    /* ── Data Mining STATE ── */
                  ) : selectedAgent && selectedAgent.type === "Mining" ? (
                    <div className="flex-1 overflow-hidden ">
                      <SocialMiningAgentWorkspace isOpen={isAIAgentsDialogOpen} />
                    </div>

                    /* ── Error STATE ── */
                  ) : selectedAgent && selectedAgent.type === "Analytics" ? (
                    <div className="flex-1 overflow-hidden px-6 py-4">
                      <AnalyticsAgentWorkspace isOpen={isAIAgentsDialogOpen} />
                    </div>

                    /* ── Error STATE ── */
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-6">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                        style={{ background: "#fff1f2" }}
                      >
                        <span className="text-xl" style={{ color: "#f43f5e" }}>!</span>
                      </div>
                      <p className="text-[14px] font-semibold" style={{ color: "#334155" }}>Something went wrong</p>
                      <p className="text-[12px] mt-1" style={{ color: "#94a3b8" }}>Please try again later</p>
                    </div>
                  )}

                </div>
              </div>
            )}
          </BottomPopup>

          {/* TABLE */}
          <section className="flex flex-col mt-6 rounded-md">

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

              <div className={`overflow-hidden ${toggleSearchDropdown ? "overflow-visible max-h-[2000px]" : "overflow-hidden max-h-0"} transition-all duration-500 ease-in-out px-5`}>
                <div className="flex flex-col gap-5 my-5">
                  <div className="grid grid-cols-3 gap-5 max-md:grid-cols-1 max-lg:grid-cols-2">
                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                      label={getLabel("Campaign", "Campaign")}
                      value={dependent.Campaign.id}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {
                        const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            Campaign: [selectedObj.Name],
                            CustomerType: [],   // reset
                            CustomerSubType: []
                          };
                          setFilters(updatedFilters);

                          setDependent(prev => ({
                            ...prev,
                            Campaign: { id: selectedObj._id, name: selectedObj.Name },
                            CustomerType: { id: "", name: "" },   // reset
                            CustomerSubType: { id: "", name: "" }
                          }));
                          handleSelectChange("Campaign", selectedObj.Name, updatedFilters)
                        }
                      }}
                    />

                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.CustomerType) ? fieldOptions.CustomerType : []}
                      label={getLabel("CustomerType", "Customer Type")}
                      value={dependent.CustomerType.name}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {
                        const selectedObj = fieldOptions.CustomerType.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            CustomerType: [selectedObj.Name],   // reset
                            CustomerSubType: []
                          };
                          setFilters(updatedFilters);


                          setDependent(prev => ({
                            ...prev,
                            CustomerType: { id: selectedObj._id, name: selectedObj.Name },   // reset
                            CustomerSubType: { id: "", name: "" }
                          }));
                          handleSelectChange("CustomerType", selectedObj.Name, updatedFilters)
                        }
                      }}

                    />

                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.CustomerSubtype) ? fieldOptions.CustomerSubtype : []}
                      label={getLabel("CustomerSubType", "Customer Subtype")}
                      value={dependent.CustomerSubType.name}
                      getLabel={(item) => item?.Name || ""}
                      getId={(item) => item?._id || ""}
                      onChange={(selectedId) => {

                        const selectedObj = fieldOptions.CustomerSubtype.find((i) => i._id === selectedId);
                        if (selectedObj) {
                          const updatedFilters = {
                            ...filters,
                            CustomerSubType: [selectedObj.Name]
                          };
                          setFilters(updatedFilters);

                          setDependent(prev => ({
                            ...prev,
                            CustomerSubType: { id: selectedObj._id, name: selectedObj.Name }
                          }));
                          handleSelectChange("CustomerSubType", selectedObj.Name, updatedFilters)
                        }
                      }}
                    />


                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                      label={getLabel("City", "City")}
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
                      label={getLabel("Location", "Location")}
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
                      isSearchable
                    />
                    <ObjectSelect
                      options={Array.isArray(fieldOptions?.SubLocation) ? fieldOptions.SubLocation : []}
                      label={getLabel("SubLocation", "Sub Location")}
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
                      isSearchable
                    />

                    <SingleSelect options={Array.isArray(fieldOptions?.ReferenceId) ? fieldOptions.ReferenceId : []} value={filters.ReferenceId[0]} label={getLabel("ReferenceId", "Reference Id")} onChange={(v) => handleSelectChange("ReferenceId", v)} isSearchable />
                    {/*   <SingleSelect options={Array.isArray(fieldOptions?.MinPrice) ? fieldOptions.MinPrice : []} value={filters.MinPrice[0]} label={getLabel("MinPrice", "Min Price")} onChange={(v) => handleSelectChange("MinPrice", v)} isSearchable />
                    <SingleSelect options={Array.isArray(fieldOptions?.MaxPrice) ? fieldOptions.MaxPrice : []} value={filters.MaxPrice[0]} label={getLabel("MaxPrice", "Max Price")} onChange={(v) => handleSelectChange("MaxPrice", v)} isSearchable /> */}

                    <SingleSelect options={Array.isArray(fieldOptions?.LeadType) ? fieldOptions.LeadType : []} value={filters.LeadType[0]} label={getLabel("LeadType", "Lead Type")} onChange={(v) => handleSelectChange("LeadType", v)} isSearchable />
                    <SingleSelect options={Array.isArray(fieldOptions?.LeadTemperature) ? fieldOptions.LeadTemperature : []} value={filters.LeadTemperature[0]} label={getLabel("LeadTemperature", "Lead Status")} onChange={(v) => handleSelectChange("LeadTemperature", v)} isSearchable />
                    {/*   <SingleSelect options={Array.isArray(fieldOptions?.Price) ? fieldOptions.Price : []} value={filters.Price[0]} label={getLabel("Price", "Price")} onChange={(v) => handleSelectChange("Price", v)} isSearchable /> */}
                    {/* <SingleSelect options={Array.isArray(fieldOptions?.isFavourite) ? fieldOptions.isFavourite : []} value={filters.isFavourite[0]} label="favroutie" onChange={(v) => handleSelectChange("isFavourite", v)}  /> */}

                    <SingleSelect options={Array.isArray(fieldOptions?.User) ? fieldOptions.User : []} value={filters.User[0]} label="User" onChange={(v) => handleSelectChange("User", v)} isSearchable />

                    <SingleSelect options={["10", "25", "50", "100"]} value={filters.Limit[0]} label="Limit" onChange={(v) => {

                      handleSelectChange("Limit", v)
                    }} />
                    <DateSelector label="From" value={filters.StartDate[0]} onChange={(v) => handleSelectChange("StartDate", v)} />
                    <DateSelector label="To" value={filters.EndDate[0]} onChange={(v) => handleSelectChange("EndDate", v)} />
                    <PriceRange
                      filters={filters}
                      handleSelectChange={handleSelectChange}
                    />
                    <div>
                      <input
                        id="favouriteFilter"
                        type="checkbox"
                        className="hidden"
                        checked={filters.isFavourite}
                        onChange={(e) =>
                          handleSelectChange("isFavourite", e.target.checked)
                        }
                      />

                      <label
                        htmlFor="favouriteFilter"
                        className={`
    inline-flex items-center justify-center
    h-10 px-4 rounded-md border
    text-sm font-medium cursor-pointer
    transition-colors duration-200 gap-2
    ${filters.isFavourite
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                            : "bg-white text-gray-700 border-gray-300"
                          }
  `}
                      >
                        {filters.isFavourite ? <MdFavorite /> : <MdFavoriteBorder />}
                        Favourite
                      </label>
                    </div>

                  </div>


                </div>

                {/* Keyword Search */}
                <form className="flex  max-lg:flex-col justify-between items-center gap-2"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (keywordInput.trim() === "")
                      return
                    setAiLoading(true);
                    setCurrentStep(STEPS.SEARCH)
                    aiGenieSearch();
                  }}
                >

                  <div className=" w-[80%] ">
                    <div>
                      <div className=" flex justify-between">
                        <label className="flex gap-1 mb-2 items-center text-sm font-bold text-[var(--color-secondary-darker)] ml-1">{aiLoading ? <span>
                          <BounceLoader
                            loading={true}
                            color="var(--color-primary)"
                            size={25}
                            aria-label="Loading Spinner"
                            data-testid="loader"
                          /></span> : <span><img className=" w-[25px] " src="/aiBot.png" /></span>
                        }
                          <div className="">AI Genie</div>


                        </label>
                        {/*  {isListening && (
                          <div className="flex items-center gap-2.5 mt-2 ml-1 px-3 py-2 rounded-xl bg-red-50 border border-red-100 w-fit">
                           
                            <div className="flex items-center gap-[3px]">
                              {[0, 1, 2, 3].map((i) => (
                                <span
                                  key={i}
                                  className="block w-[3px] rounded-full bg-red-500"
                                  style={{
                                    animation: `soundBar 0.8s ease-in-out infinite alternate`,
                                    animationDelay: `${i * 0.15}s`,
                                    height: "14px",
                                  }}
                                />
                              ))}
                            </div>

                            <p className="text-red-500 text-xs font-semibold tracking-wide">
                              Listening…
                            </p>

                           
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
                            </span>

                            <style>{`
      @keyframes soundBar {
        from { transform: scaleY(0.3); opacity: 0.5; }
        to   { transform: scaleY(1);   opacity: 1;   }
      }
    `}</style>
                          </div>
                        )} */}
                      </div>
                      <p className={`text-gray-400 font-light text-xs ml-2 mb-2  flex items-center gap-[1px] `}>
                        <span
                          className={`transition-opacity duration-300 `}
                        >
                          {currentStep}
                        </span>

                        {aiLoading && <span className="translate-y-[2px]">
                          <BeatLoader size={2} color="gray" />
                        </span>}

                      </p>
                      <div className="">

                        <div className=" flex justify-between items-center border border-gray-300 rounded-md w-full">
                          <input
                            type="text"
                            placeholder="What you want to search?"
                            className="outline-none w-full px-3 py-2 "
                            value={keywordInput}
                            onChange={(e) => setKeywordInput(e.target.value)}
                          />
                          <span
                            className={`relative mr-3 cursor-pointer flex items-center justify-center`}
                            onClick={() => {
                              playSound();      // 🔊 sound plays
                              startListening(); // 🎤 mic starts
                            }}
                          >
                            {/* Pulse Ring */}
                            {isListening && (
                              <span className="absolute inline-flex h-8 w-8 rounded-full bg-red-400 opacity-75 animate-ping"></span>
                            )}

                            {/* Mic Icon */}
                            <span
                              className={`relative z-10 p-2 rounded-full transition-all duration-300 
    ${isListening ? "bg-red-500 text-white scale-110" : "text-gray-500 hover:text-blue-500"}
  `}
                            >
                              <FaMicrophone />
                            </span>
                          </span>
                          <span className=" cursor-pointer mr-3" onClick={() => setToggleAiGenieSearchBy(!toggleAiGenieSearchBy)}>{toggleAiGenieSearchBy ? <FaCaretUp /> : <FaCaretDown />}</span>
                        </div>

                        <div className={` mt-5 overflow-hidden transition-all duration-300 ${toggleAiGenieSearchBy ? " h-[150px]" : " h-0"}`}>
                          {/* Unselected Fields */}
                          <div className="flex flex-wrap gap-2 px-3 mb-5">
                            {SEARCH_FIELDS.filter(f => !filters.SearchIn.includes(f)).map((field) => (
                              <button
                                key={field}
                                type="button"
                                className="px-2 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-100 transition"
                                onClick={() =>
                                  setFilters(prev => ({
                                    ...prev,
                                    SearchIn: [...prev.SearchIn, field],
                                  }))
                                }
                              >
                                {field.toLowerCase()}
                              </button>
                            ))}
                          </div>

                          {/* Selected Fields */}
                          <div className="">
                            {filters.SearchIn.length > 0 && <h5 className=" text-gray-500 text-sm my-2 mx-2">Selected</h5>}
                            <div className="flex flex-wrap gap-2 px-3">

                              {filters.SearchIn.map((field) => (
                                <div
                                  key={field}
                                  className="group relative flex items-center px-2 py-1 border border-blue-400 rounded-md text-sm bg-blue-100"
                                >
                                  {field.toLowerCase()}
                                  <button
                                    className="ml-2 opacity-0 cursor-pointer group-hover:opacity-100 transition-opacity text-sm text-[var(--color-primary)]"
                                    onClick={() =>
                                      setFilters(prev => ({
                                        ...prev,
                                        SearchIn: prev.SearchIn.filter(f => f !== field),
                                      }))
                                    }
                                  >
                                    <IoMdClose />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                  <div className={` flex justify-center items-center w-[30%] transition duration-300  ${toggleAiGenieSearchBy ? " lg:-mt-32" : " lg:mt-5"} `}>
                    {!aiLoading ? <button type="submit" className="border border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-all duration-300 cursor-pointer px-3 py-2  rounded-md">
                      Explore
                    </button> : <button type="button" className="flex gap-1 justify-center items-center border border-[var(--color-primary)]  bg-[var(--color-primary)] text-white transition-all duration-300 cursor-pointer px-3 py-2  rounded-md">
                      Exploring <HashLoader
                        loading={true}
                        color="white"
                        size={12}
                        aria-label="Loading Spinner"
                        data-testid="loader"
                      />
                    </button>}

                    <button type="reset" onClick={clearFilter} className="text-red-500 cursor-pointer hover:underline text-sm px-5 py-2  rounded-md ml-3">
                      Clear Search
                    </button>
                  </div>
                </form>

              </div>
            </div>
            {/*  <AgentSelector
  agents={agents}
  keywordInput={keywordInput}
  setKeywordInput={setKeywordInput}
  filters={filters}
  setFilters={setFilters}
  aiLoading={aiLoading}
  setAiLoading={setAiLoading}
  currentStep={currentStep}
  setCurrentStep={setCurrentStep}
  toggleAiGenieSearchBy={toggleAiGenieSearchBy}
  setToggleAiGenieSearchBy={setToggleAiGenieSearchBy}
  STEPS={STEPS}
  aiGenieSearch={aiGenieSearch}
  clearFilter={clearFilter}
/> */}
            <div className="  relative" ref={scrollRef}>

              <div className=" flex justify-between items-center sticky top-0 left-0 overflow-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden w-full">
                <div className="flex gap-5 items-center px-3 py-4 text-[13px] min-w-max text-gray-700">

                  <label htmlFor="selectall" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
                    <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">Select All</span>
                  </label>
                  <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                    if (selectedCustomers.length <= 0) toast.error("please select atleast 1 customer")
                    else {
                      setIsAssignOpen(true);
                      fetchUsers()
                    } 0
                  }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">Asign To</span></button>
                  <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                    if (selectedCustomers.length <= 0) toast.error("please select atleast 1 customer")
                    else {
                      setIsMailAllOpen(true);
                      fetchEmailTemplates()
                    }
                  }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">Email All</span></button>
                  <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                    if (selectedCustomers.length <= 0) toast.error("please select atleast 1 customer")
                    else {
                      setIsWhatsappAllOpen(true);
                      fetchWhatsappTemplates()
                    }
                  }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                    <span className="relative">SMS All</span></button>
                  {/*                 <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer">
                  <div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                  <span className="relative ">Mass Update</span>
                </button> */}

                  {
                    admin?.role !== "user" && <button type="button" className=" relative overflow-hidden py-[2px] group hover:bg-[var(--color-primary-lighter)] hover:text-white text-[var(--color-primary)] bg-[var(--color-primary-lighter)]  rounded-tr-sm rounded-br-sm  border-l-[3px] px-2 border-l-[var(--color-primary)] cursor-pointer" onClick={() => {
                      if (customerData.length > 0) {
                        if (selectedCustomers.length < 1) {
                          const firstPageIds = currentRows.map((c) => c._id);
                          setSelectedCustomers(firstPageIds);
                        }

                        setIsDeleteAllDialogOpen(true);
                        setDeleteAllDialogData({});
                      }
                    }}><div className=" absolute top-0 left-0 z-0 h-full bg-[var(--color-primary)] w-0 group-hover:w-full transition-all duration-300 "></div>
                      <span className="relative ">Delete All</span>
                    </button>
                  }

                </div>

                {
                  isFilteredTrigger && <p className={`text-gray-400 font-light text-xs mx-3  mt-2  flex items-center gap-[1px] `}>
                    Customers Found {totalCustomers}
                  </p>
                }
                {selectedCustomers.length > 0 && <p className=" text-gray-400 font-extralight text-sm mx-3">selected {selectedCustomers.length}</p>}
              </div>
              <Tablesetting columns={columns} setColumns={setColumns} />
              <div className=" max-h-[600px]  w-full overflow-y-auto">
                <table className="table-auto relative w-full border-separate border-spacing-0 text-sm border border-gray-200">
                  <thead className="bg-[var(--color-primary)] h-16 text-white sticky top-0 left-0 z-[5]">
                    <tr>

                      {/* ✅ SELECT ALL CHECKBOX COLUMN */}
                      <th className="px-2 py-3 border border-[var(--color-secondary-dark)] bg-[var(--color-primary)] sticky left-0 z-20 text-left">

                        <input
                          id="selectall"
                          type="checkbox"
                          className="hidden"
                          checked={
                            currentRows.length > 0 &&
                            currentRows.every((r) => selectedCustomers.includes(r._id))
                          }
                          onChange={handleSelectAll}
                        />
                      </th>

                      {columns
                        .filter(col => col.visible)
                        .map((header, index) => (
                          <th
                            key={header.key}
                            className={`px-2 py-3 border border-[var(--color-secondary-dark)] text-left  
                ${header.key === "sno" ? "sticky left-7.5 z-20 bg-[var(--color-primary)]" : ""}`}
                          >
                            {header.label}
                          </th>
                        ))}

                    </tr>
                  </thead>

                  <tbody>
                    {customerTableLoader ?
                      <tr>
                        <td colSpan={12} className="text-center py-4 text-gray-500">
                          Loading customers...
                        </td>
                      </tr> : currentRows.length > 0 ? (
                        currentRows.map((item, index) => (
                          <tr key={item._id} className="border-t hover:bg-[#f7f6f3] transition-all duration-200">

                            {/* ✅ ROW CHECKBOX */}
                            <td className="px-2 py-3 sticky left-0 bg-white  border border-gray-200">
                              <input
                                type="checkbox"
                                checked={selectedCustomers.includes(item._id)}
                                onChange={() => handleSelectRow(item._id)}
                              />
                            </td>

                            {columns.filter(col => col.visible).map((col) => {
                              let cellValue;
                              if (col.key.startsWith("cf_")) {
                                const originalKey = col.key.replace("cf_", "");
                                cellValue = item.CustomerFields?.[originalKey] ?? "-";
                              } else {
                                switch (col.key) {
                                  case "sno":
                                    cellValue = (currentTablePage - 1) * rowsPerTablePage + (index + 1);
                                    break;
                                  case "campaign":
                                    cellValue = item.Campaign;
                                    break;
                                  case "type":
                                    cellValue = item.Type;
                                    break;
                                  case "subtype":
                                    cellValue = item.SubType;
                                    break;
                                  case "leadtype":
                                    cellValue = item.LeadType;
                                    break;
                                  case "City":

                                    cellValue = item.City;
                                    break;
                                  case "Area":
                                    cellValue = item.Area;
                                    break;
                                  case "Email":
                                    cellValue = item.Email;
                                    break;

                                  case "Facillities":
                                    cellValue = item.Facillities;
                                    break;

                                  case "CustomerId":
                                    cellValue = item.CustomerId;
                                    break;
                                  case "ClientId":
                                    cellValue = item.ClientId;
                                    break;
                                  case "Adderess":
                                    cellValue = (<>
                                      <span
                                        className="text-blue-600 cursor-pointer underline"
                                        onClick={() => {
                                          setSelectedAddress(item.Adderess);
                                          setIsMapOpen(true);
                                        }}
                                      >
                                        {item.Adderess}
                                      </span>

                                    </>);
                                    break;
                                  case "CustomerYear":
                                    cellValue = item.CustomerYear;
                                    break;
                                  case "Other":
                                    cellValue = item.Other;
                                    break;
                                  case "name":
                                    cellValue = item.Name;
                                    break;
                                  case "description":
                                    cellValue = item.Description;
                                    break;
                                  case "location":
                                    cellValue = item.Location;
                                    break;
                                  case "sublocation":
                                    cellValue = item.SubLocation;
                                    break;
                                  case "contact":
                                    cellValue = (
                                      <>
                                        {item.ContactNumber && (
                                          <>
                                            <div className=" text-center" onClick={() => handleAgentCalling(item._id)}>{item.ContactNumber}</div>
                                            <span className="flex">
                                              <Button
                                                component="a"
                                                /* href={`tel:${item.ContactNumber}`} */
                                                onClick={() => handleCall({ customerNumber: item.ContactNumber })}
                                                sx={{
                                                  backgroundColor: "#E8F5E9",
                                                  color: "var(--color-primary)",
                                                  minWidth: "14px",
                                                  height: "24px",
                                                  borderRadius: "8px",
                                                  margin: "4px"
                                                }}
                                              >
                                                <FaPhone size={12} />
                                              </Button>
                                              <Button
                                                sx={{
                                                  backgroundColor: "#E8F5E9",
                                                  color: "var(--color-primary)",
                                                  minWidth: "14px",
                                                  height: "24px",
                                                  borderRadius: "8px",
                                                  margin: "4px"
                                                }}
                                                onClick={() => {
                                                  setSelectedCustomers([item._id]);
                                                  setSelectUser([item._id]);
                                                  setIsMailAllOpen(true);
                                                  fetchEmailTemplates();
                                                }}
                                              >
                                                <MdEmail size={14} />
                                              </Button>
                                              <Button
                                                onClick={() => {
                                                  setSelectedCustomers([item._id]);
                                                  setSelectUser([item._id]);
                                                  setIsWhatsappAllOpen(true);
                                                  fetchWhatsappTemplates();
                                                }}
                                                sx={{
                                                  backgroundColor: "#E8F5E9",
                                                  color: "var(--color-primary)",
                                                  minWidth: "14px",
                                                  height: "24px",
                                                  borderRadius: "8px",
                                                  margin: "4px"
                                                }}
                                              >
                                                <FaWhatsapp size={14} />
                                              </Button>
                                            </span>
                                            {duplicateContacts[item.ContactNumber] && (
                                              <span>
                                                <Button
                                                  onClick={() => {
                                                    setIsTableDialogOpen(true);
                                                    handleTableDialogData(item.ContactNumber);
                                                  }}
                                                  sx={{
                                                    backgroundColor: "#E8F5E9",
                                                    color: "var(--color-primary)",
                                                    minWidth: "100px",
                                                    height: "24px",
                                                    borderRadius: "8px",
                                                    margin: "4px"
                                                  }}
                                                >
                                                  <FaEye size={12} />
                                                </Button>
                                              </span>
                                            )}
                                          </>
                                        )}
                                      </>
                                    );
                                    break;
                                  case "assign":
                                    cellValue = item.AssignTo.map((e: any) => e.name + ", ");
                                    break;
                                  case "reference":
                                    cellValue = item.ReferenceId;
                                    break;

                                  case "url":
                                    cellValue = item.URL;
                                    break;
                                  case "video":
                                    cellValue = item.Video;
                                    break;
                                  case "googlemap":
                                    cellValue = item.GoogleMap;
                                    break;
                                  case "price":
                                    cellValue = item.Price;
                                    break;
                                  case "date":
                                    cellValue = item.Date;
                                    break;
                                  case "actions":
                                    cellValue = (
                                      <div className="grid grid-cols-2 gap-3 items-center h-full">
                                        <Button
                                          sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                                          /*  onClick={() => router.push(`/followups/customer/add/${item._id}`)} */
                                          onClick={() => {
                                            setSelectedCustomerFollowupId(item._id);
                                            setIsFollowupOpen(true);
                                          }}
                                        >
                                          <MdAdd />
                                        </Button>
                                        <Button
                                          sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                                          onClick={() => /* router.push(`/customer/edit/${item._id}`) */ handleEditClick(item._id)}
                                        >
                                          <MdEdit />
                                        </Button>
                                        {admin?.role === "administrator" && <Button
                                          sx={{ backgroundColor: "#FDECEA", color: "#C62828", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                                          onClick={() => {
                                            setIsDeleteDialogOpen(true);
                                            setDialogType("delete");
                                            setDialogData({
                                              id: item._id,
                                              customerName: item.Name,
                                              ContactNumber: item.ContactNumber,
                                            });
                                          }}
                                        >
                                          <MdDelete />
                                        </Button>}

                                        <Button
                                          sx={{ backgroundColor: "#FFF0F5", color: item.isFavourite ? "#E91E63" : "#C62828", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                                          onClick={() =>
                                            handleFavouriteToggle(item._id, item.Name, item.ContactNumber, item.isFavourite ?? false)
                                          }
                                        >
                                          {item.isFavourite ? <MdFavorite /> : <MdFavoriteBorder />}
                                        </Button>
                                        <Button
                                          className=" bg-gray-500"
                                          sx={{ backgroundColor: item.isChecked ? "#E8F5E9" : "#FFF0F5", color: item.isChecked ? "var(--color-primary)" : "#E91E63", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                                          onClick={() =>
                                            handleChecked({ id: item._id, isChecked: item.isChecked })
                                          }
                                        >
                                          {item.isChecked ? <IoCheckmarkDoneOutline size={20} /> : <IoCheckmark size={20} />}
                                        </Button>
                                        <Button
                                          sx={{ backgroundColor: "#E8F5E9", color: "var(--color-primary)", minWidth: "32px", height: "32px", borderRadius: "8px" }}
                                          onClick={() => {
                                            setIsFollowupDialogOpen(true);
                                            handleFollowups(item._id, item.Name);
                                          }}
                                        >
                                          <UserPlus />
                                        </Button>
                                        <Button
                                          sx={{
                                            backgroundColor: temperatureConfig[item.LeadTemperature || "cold"]?.bg,
                                            color: temperatureConfig[item.LeadTemperature || "cold"]?.color,
                                            minWidth: "32px",
                                            height: "32px",
                                            borderRadius: "8px",
                                            transition: "all 0.2s ease",
                                            "&:hover": {
                                              filter: "brightness(0.95)",
                                              transform: "scale(1.05)"
                                            }
                                          }}
                                          onClick={() => {
                                            setTemperatureDialogData({
                                              id: item._id,
                                              name: item.CustomerName,
                                              current: item.LeadTemperature || "cold"
                                            });
                                            setIsTemperatureDialogOpen(true);
                                          }}
                                        >
                                          {temperatureConfig[item.LeadTemperature || "cold"]?.icon}
                                        </Button>
                                      </div>
                                    );
                                    break;
                                  default:
                                    cellValue = null;
                                }
                              }

                              return (
                                <td key={col.key} className={`px-2 py-3 border border-gray-200 break-all whitespace-normal 
                                    ${col.key !== "sno" ? "min-w-[100px]" : ""}
             ${col.key === "description" && item.Description ? "min-w-[160px]" : ""} 
            ${col.key === "sno" ? "sticky left-7.5  bg-white max-w-[60px]" : ""}
             ${col.key === "type" ? "max-w-[80px]" : ""}
             ${col.key === "subtype" ? "max-w-[90px]" : ""} 
             ${col.key === "contact" ? "max-w-[140px]" : ""} 
             ${col.key === "reference" ? "max-w-[70px]" : ""}
              ${col.key === "date" ? "min-w-[100px]" : ""} 
             ${col.key === "actions" ? "min-w-[90px] align-middle" : ""}
             `}>
                                  {cellValue}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={10} className="text-center py-4 w-full text-gray-500">
                            No data available.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentTablePage} of {totalCustomerPage}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentTablePage(1)}
                  disabled={currentTablePage === 1}
                  className="p-2 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                  title="First page"
                >
                  <ChevronsLeft size={16} />
                </button>
                <button
                  onClick={() =>
                    setCurrentTablePage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentTablePage === 1}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  onClick={async () => {
                    // normal pagination
                    if (currentTablePage < totalTablePages) {
                      setCurrentTablePage(prev => prev + 1);
                      return;
                    }

                    // last page → fetch more → then move
                    if (hasMoreCustomers) {
                      await fetchMore();
                      setCurrentTablePage(prev => prev + 1);
                    }
                  }}
                  disabled={!hasMoreCustomers && currentTablePage === totalTablePages}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
                <button
                  onClick={handleLastPage}
                  disabled={currentTablePage === totalTablePages && !hasMoreCustomers}
                  className="p-2 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                  title="Last page"
                >
                  <ChevronsRight size={16} />
                </button>


              </div>
            </div>
          </section>

        </div>
      </div>
    </ProtectedRoute>
  );
}
