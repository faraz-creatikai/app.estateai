'use client'

import { useState, useCallback, useEffect } from "react";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, ArrowRight, CheckCircle2, Upload, X, User, MapPin, FileText, Sparkles, Loader2 } from "lucide-react";
import { addCustomer, getFilteredCustomer } from "@/store/customer";
import { customerAllDataInterface } from "@/store/customer.interface";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypesByCampaign } from "@/store/masters/types/types";
import { getCity } from "@/store/masters/city/city";
import { getLocationByCity } from "@/store/masters/location/location";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getSubtypeByCampaignAndType } from "@/store/masters/subtype/subtype";
import { getFacilities } from "@/store/masters/facilities/facilities";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import { trimCountryCodeHelper } from "@/app/utils/trimCountryCodeHelper";
import { getsubLocationByCityLoc } from "@/store/masters/sublocation/sublocation";
import { getReferences } from "@/store/masters/references/references";
import { getPrice } from "@/store/masters/price/price";
import { getCustomerFields } from "@/store/masters/customerfields/customerfields";
import dayjs from "dayjs";

/* ────────────────────────────────────────────────────────── */
/*  Types                                                      */
/* ────────────────────────────────────────────────────────── */
interface ErrorInterface { [key: string]: string }
type CustomFieldsType = { [key: string]: string }

const STEPS = [
    { id: 1, label: "Identity", icon: User },
    { id: 2, label: "Location", icon: MapPin },
    { id: 3, label: "Details", icon: FileText },
    { id: 4, label: "Review", icon: Sparkles },
];

/* ────────────────────────────────────────────────────────── */
/*  Main Component                                             */
/* ────────────────────────────────────────────────────────── */
export default function CustomerWebForm() {
    const [currentStep, setCurrentStep] = useState(1);
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [refId, setRefId] = useState("");

    const [customerData, setCustomerData] = useState<customerAllDataInterface>({
        Campaign: { id: "", name: "" },
        CustomerType: { id: "", name: "" },
        customerName: "",
        CustomerSubtype: { id: "", name: "" },
        ContactNumber: "",
        City: { id: "", name: "" },
        Location: { id: "", name: "" },
        SubLocation: { id: "", name: "" },
        Area: "",
        Address: "",
        Email: "",
        Facilities: "",
        ReferenceId: "",
        CustomerId: "",
        ClientId: "",
        CustomerDate: dayjs().format("YYYY-MM-DD"),
        CustomerYear: "",
        Other: "",
        Price: "",
        URL: "",
        Description: "",
        Video: "",
        GoogleMap: "",
        Verified: "",
        CustomerImage: [],
        SitePlan: {} as File,
    });

    const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
    const [customFields, setCustomFields] = useState<CustomFieldsType>({});
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [sitePlanPreview, setSitePlanPreview] = useState<string>("");
    const [errors, setErrors] = useState<ErrorInterface>({});
    const [consent, setConsent] = useState(false);

    /* ── Load custom fields ── */
    useEffect(() => {
        (async () => {
            const data = await getCustomerFields();
            const active = data.filter((e: any) => e.Status === "Active");
            const obj: CustomFieldsType = {};
            active.forEach((f: any) => { obj[f.Name] = ""; });
            setCustomFields(obj);
        })();
    }, []);

    /* ── Load static options ── */
    useEffect(() => {
        const objectFields = [
            { key: "Campaign", fetchFn: getCampaign },
            { key: "CustomerType", staticData: [] },
            { key: "CustomerSubtype", staticData: [] },
            { key: "City", fetchFn: getCity },
            { key: "Location", staticData: [] },
            { key: "SubLocation", staticData: [] },
        ];
        const arrayFields = [
            { key: "Facilities", fetchFn: getFacilities },
            { key: "ReferenceId", fetchFn: getReferences },
            { key: "Price", fetchFn: getPrice },
        ];
        (async () => {
            await handleFieldOptionsObject(objectFields, setFieldOptions);
            await handleFieldOptions(arrayFields, setFieldOptions);
        })();
    }, []);

    /* ── Dependent dropdowns ── */
    useEffect(() => {
        if (customerData.Campaign.id) {
            getTypesByCampaign(customerData.Campaign.id)
                .then(res => setFieldOptions(p => ({ ...p, CustomerType: res || [] })))
                .catch(() => setFieldOptions(p => ({ ...p, CustomerType: [] })));
        } else {
            setFieldOptions(p => ({ ...p, CustomerType: [] }));
        }
    }, [customerData.Campaign.id]);

    useEffect(() => {
        if (customerData.Campaign.id && customerData.CustomerType.id) {
            getSubtypeByCampaignAndType(customerData.Campaign.id, customerData.CustomerType.id)
                .then(res => setFieldOptions(p => ({ ...p, CustomerSubtype: res || [] })))
                .catch(() => setFieldOptions(p => ({ ...p, CustomerSubtype: [] })));
        } else {
            setFieldOptions(p => ({ ...p, CustomerSubtype: [] }));
        }
    }, [customerData.Campaign.id, customerData.CustomerType.id]);

    useEffect(() => {
        if (customerData.City.id) {
            getLocationByCity(customerData.City.id)
                .then(res => setFieldOptions(p => ({ ...p, Location: res || [] })))
                .catch(() => setFieldOptions(p => ({ ...p, Location: [] })));
        } else {
            setFieldOptions(p => ({ ...p, Location: [] }));
        }
    }, [customerData.City.id]);

    useEffect(() => {
        if (customerData.City.id && customerData.Location.id) {
            getsubLocationByCityLoc(customerData.City.id, customerData.Location.id)
                .then(res => setFieldOptions(p => ({ ...p, SubLocation: res || [] })))
                .catch(() => setFieldOptions(p => ({ ...p, SubLocation: [] })));
        } else {
            setFieldOptions(p => ({ ...p, SubLocation: [] }));
        }
    }, [customerData.City.id, customerData.Location.id]);

    /* ── Handlers ── */
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const { name, value } = e.target;
            setCustomerData(p => ({ ...p, [name]: value }));
            setErrors(p => ({ ...p, [name]: "" }));
        }, []
    );

    const handleCustomInputChange = (key: string, value: string) => {
        setCustomFields(p => ({ ...p, [key]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        const files = e.target.files;
        if (!files) return;
        if (field === "CustomerImage") {
            const newFiles = Array.from(files);
            setCustomerData(p => ({ ...p, CustomerImage: [...p.CustomerImage, ...newFiles] }));
            setImagePreviews(p => [...p, ...newFiles.map(f => URL.createObjectURL(f))]);
        } else if (field === "SitePlan") {
            const file = files[0];
            setCustomerData(p => ({ ...p, SitePlan: file }));
            setSitePlanPreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = (index: number) => {
        setCustomerData(p => ({ ...p, CustomerImage: p.CustomerImage.filter((_, i) => i !== index) }));
        setImagePreviews(p => p.filter((_, i) => i !== index));
    };

    const handleRemoveSitePlan = () => {
        setCustomerData(p => ({ ...p, SitePlan: {} as File }));
        setSitePlanPreview("");
    };

    /* ── Contact duplicate check ── */
    const isContactNoExist = async (contactNo: string): Promise<boolean> => {
        if (contactNo.trim().length < 10 && contactNo.trim().length > 0) {
            setErrors(p => ({ ...p, ContactNumber: "Contact No should be at least 10 digits" }));
            return true;
        }
        if (!contactNo.trim()) return false;
        const res = await getFilteredCustomer(`Keyword=${contactNo}`);
        if (res.length > 0) {
            setErrors(p => ({ ...p, ContactNumber: "Contact No already exists" }));
            return true;
        }
        return false;
    };

    /* ── Per-step validation ── */
    const validateStep = (step: number): boolean => {
        const newErrors: ErrorInterface = {};
        if (step === 1) {
            if (!customerData.Campaign?.name.trim()) newErrors.Campaign = "Campaign is required";
            if (!customerData.customerName.trim()) newErrors.customerName = "Name is required";
            if (!customerData.ContactNumber.trim()) newErrors.ContactNumber = "Contact is required";
            if (customerData.ContactNumber.trim().length > 0 && customerData.ContactNumber.trim().length < 10)
                newErrors.ContactNumber = "Contact must be at least 10 digits";
            if (customerData.Email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(customerData.Email))
                newErrors.Email = "Invalid email format";
        }
        if (step === 2) {
            if (!customerData.City?.name.trim()) newErrors.City = "City is required";
        }
        if (step === 4) {
            if (!consent) newErrors.consent = "Please accept the terms to continue";
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const goNext = async () => {
        if (!validateStep(currentStep)) return;
        /*     if (currentStep === 1) {
              const dup = await isContactNoExist(customerData.ContactNumber);
              if (dup) return;
            } */
        setCurrentStep(s => Math.min(s + 1, STEPS.length));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const goBack = () => {
        setCurrentStep(s => Math.max(s - 1, 1));
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    /* ── Submit ── */
    const handleSubmit = async () => {
        if (!validateStep(4)) return;
        setSubmitting(true);

        const formData = new FormData();
        if (customerData.Campaign) formData.append("Campaign", customerData.Campaign.name);
        if (customerData.CustomerType) formData.append("CustomerType", customerData.CustomerType.name);
        if (customerData.customerName) formData.append("customerName", customerData.customerName);
        if (customerData.CustomerSubtype) formData.append("CustomerSubType", customerData.CustomerSubtype?.name);
        if (customerData.ContactNumber) formData.append("ContactNumber", trimCountryCodeHelper(customerData.ContactNumber));
        if (customerData.City) formData.append("City", customerData.City.name);
        if (customerData.Location) formData.append("Location", customerData.Location?.name);
        if (customerData.SubLocation) formData.append("SubLocation", customerData.SubLocation?.name);
        if (customerData.Area) formData.append("Area", customerData.Area);
        if (customerData.Address) formData.append("Adderess", customerData.Address);
        if (customerData.Email) formData.append("Email", customerData.Email);
        if (customerData.Facilities) formData.append("Facillities", customerData.Facilities);
        if (customerData.ReferenceId) formData.append("ReferenceId", customerData.ReferenceId);
        if (customerData.CustomerId) formData.append("CustomerId", customerData.CustomerId);
        if (customerData.ClientId) formData.append("ClientId", customerData.ClientId);
        if (customerData.CustomerDate) formData.append("CustomerDate", customerData.CustomerDate);
        if (customerData.Price) formData.append("Price", customerData.Price);
        if (customerData.Description) formData.append("Description", customerData.Description);
        if (customerData.Other) formData.append("Other", customerData.Other);
        formData.append("updatedAt", new Date().toISOString());

        customerData.CustomerImage.forEach(f => formData.append("CustomerImage", f));
        if (customerData.SitePlan && (customerData.SitePlan as any).name)
            formData.append("SitePlan", customerData.SitePlan);

        formData.append("CustomerFields", JSON.stringify(customFields));

        const result = await addCustomer(formData);
        setSubmitting(false);

        if (result) {
            setRefId("ENQ-" + Date.now().toString(36).toUpperCase().slice(-6));
            setSubmitted(true);
            toast.success("Enquiry submitted successfully!");
        } else {
            toast.error("Something went wrong. Please try again.");
        }
    };

    /* ── Helpers ── */
    const objOptions = (key: string): any[] =>
        Array.isArray(fieldOptions?.[key]) ? fieldOptions[key] : [];

    /* ───────────────────────────────────────────────────────── */
    /*  Render                                                    */
    /* ───────────────────────────────────────────────────────── */
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Toaster position="top-right" />

            {/* ── Hero Banner ── */}
            <div
                className="relative w-full py-14 px-6 flex flex-col items-center text-center overflow-hidden"
                style={{ background: "linear-gradient(135deg, var(--color-secondary-darker) 0%, var(--color-secondary) 60%, var(--color-primary) 100%)" }}
            >
                {/* Decorative circles */}
                <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full opacity-10 bg-white" />
                <div className="absolute -bottom-20 -right-10 w-80 h-80 rounded-full opacity-10 bg-white" />
                <div className="absolute top-6 right-24 w-20 h-20 rounded-full opacity-5 bg-white" />

                <span
                    className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 backdrop-blur-sm"
                    style={{ background: "rgba(255,255,255,0.15)", color: "white", border: "1px solid rgba(255,255,255,0.25)" }}
                >
                    <Sparkles size={12} /> Customer Enquiry Portal
                </span>
                <h1 className="text-white text-4xl max-sm:text-2xl font-extrabold tracking-tight leading-tight drop-shadow-sm">
                    Register Your Interest
                </h1>
                <p className="text-white/70 mt-2 text-sm max-w-sm font-light">
                    Fill in your details below and our team will get back to you within 24 hours.
                </p>
            </div>

            {/* ── Step Indicators ── */}
            <div className="flex justify-center py-6 px-4 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-20">
                <div className="flex items-center gap-0 w-full max-w-lg">
                    {STEPS.map((step, idx) => {
                        const Icon = step.icon;
                        const isDone = currentStep > step.id;
                        const isActive = currentStep === step.id;
                        return (
                            <div key={step.id} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center gap-1">
                                    <div
                                        className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 font-semibold text-sm border-2
                      ${isDone ? "text-white border-transparent shadow-md" : ""}
                      ${isActive ? "text-white border-transparent shadow-lg scale-110" : ""}
                      ${!isDone && !isActive ? "bg-gray-100 border-gray-200 text-gray-400" : ""}
                    `}
                                        style={
                                            isDone ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } :
                                                isActive ? { background: "var(--color-primary)", borderColor: "var(--color-primary)" } :
                                                    {}
                                        }
                                    >
                                        {isDone ? <CheckCircle2 size={18} /> : <Icon size={16} />}
                                    </div>
                                    <span
                                        className={`text-[10px] font-semibold tracking-wide uppercase hidden sm:block transition-colors ${isActive ? "text-[var(--color-primary)]" : isDone ? "text-gray-500" : "text-gray-400"}`}
                                    >
                                        {step.label}
                                    </span>
                                </div>
                                {idx < STEPS.length - 1 && (
                                    <div className="flex-1 h-0.5 mx-2 rounded transition-all duration-500"
                                        style={{ background: currentStep > step.id ? "var(--color-primary)" : "#e5e7eb" }}
                                    />
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Form Card ── */}
            <div className="flex-1 flex justify-center items-start py-10 px-4">
                <div className="w-full max-w-2xl">

                    {submitted ? (
                        /* ── Success Screen ── */
                        <div className="bg-white rounded-3xl shadow-xl p-12 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div
                                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
                                style={{ background: "var(--color-primary)", opacity: 0.9 }}
                            >
                                <CheckCircle2 size={40} className="text-white" />
                            </div>
                            <h2 className="text-3xl font-extrabold text-gray-800 mb-2">All Done!</h2>
                            <p className="text-gray-500 mb-6 text-sm">
                                Thank you <span className="font-semibold text-gray-700">{customerData.customerName}</span>.
                                Our team will reach out on <span className="font-semibold text-gray-700">{customerData.ContactNumber}</span> within 24 hours.
                            </p>
                            <div
                                className="inline-block px-6 py-2 rounded-full text-sm font-semibold tracking-widest uppercase"
                                style={{ background: "color-mix(in srgb, var(--color-primary) 12%, transparent)", color: "var(--color-primary)", border: "1.5px dashed var(--color-primary)" }}
                            >
                                Ref# {refId}
                            </div>
                            <p className="text-xs text-gray-400 mt-4">Save this reference number for your records.</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-3xl shadow-xl overflow-hidden">

                            {/* Card top accent */}
                            <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, var(--color-primary), var(--color-secondary))" }} />

                            <div className="p-8 max-sm:p-5">

                                {/* Step heading */}
                                <div className="mb-7 pb-5 border-b border-gray-100">
                                    <p className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: "var(--color-primary)" }}>
                                        Step {currentStep} of {STEPS.length}
                                    </p>
                                    <h2 className="text-2xl font-extrabold" style={{ color: "var(--color-secondary-darker)" }}>
                                        {currentStep === 1 && "Personal Information"}
                                        {currentStep === 2 && "Location Details"}
                                        {currentStep === 3 && "Additional Details"}
                                        {currentStep === 4 && "Review & Submit"}
                                    </h2>
                                    <p className="text-sm text-gray-400 mt-1 font-light">
                                        {currentStep === 1 && "Tell us who you are and how to reach you."}
                                        {currentStep === 2 && "Where are you based and what area interests you?"}
                                        {currentStep === 3 && "Any specific requirements or preferences?"}
                                        {currentStep === 4 && "Review your details before submitting."}
                                    </p>
                                </div>

                                {/* ─── STEP 1: Personal ─── */}
                                {currentStep === 1 && (
                                    <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">

                                        <FormField label="Campaign *" error={errors.Campaign} className="col-span-2 max-sm:col-span-1">
                                            <select
                                                name="Campaign"
                                                value={customerData.Campaign.id}
                                                onChange={e => {
                                                    const obj = objOptions("Campaign").find(i => i._id === e.target.value);
                                                    if (obj) setCustomerData(p => ({ ...p, Campaign: { id: obj._id, name: obj.Name }, CustomerType: { id: "", name: "" }, CustomerSubtype: { id: "", name: "" } }));
                                                    else setCustomerData(p => ({ ...p, Campaign: { id: "", name: "" } }));
                                                    setErrors(p => ({ ...p, Campaign: "" }));
                                                }}
                                                className={selectClass(!!errors.Campaign)}
                                            >
                                                <option value="">Select campaign…</option>
                                                {objOptions("Campaign").map(i => <option key={i._id} value={i._id}>{i.Name}</option>)}
                                            </select>
                                        </FormField>

                                        <FormField label="Customer Type" error={errors.CustomerType}>
                                            <select
                                                name="CustomerType"
                                                value={customerData.CustomerType.id}
                                                onChange={e => {
                                                    const obj = objOptions("CustomerType").find(i => i._id === e.target.value);
                                                    if (obj) setCustomerData(p => ({ ...p, CustomerType: { id: obj._id, name: obj.Name }, CustomerSubtype: { id: "", name: "" } }));
                                                    else setCustomerData(p => ({ ...p, CustomerType: { id: "", name: "" } }));
                                                }}
                                                className={selectClass(!!errors.CustomerType)}
                                            >
                                                <option value="">Select type…</option>
                                                {objOptions("CustomerType").map(i => <option key={i._id} value={i._id}>{i.Name}</option>)}
                                            </select>
                                        </FormField>

                                        <FormField label="Customer Subtype" error={errors.CustomerSubtype}>
                                            <select
                                                name="CustomerSubtype"
                                                value={customerData.CustomerSubtype.id}
                                                onChange={e => {
                                                    const obj = objOptions("CustomerSubtype").find(i => i._id === e.target.value);
                                                    if (obj) setCustomerData(p => ({ ...p, CustomerSubtype: { id: obj._id, name: obj.Name } }));
                                                }}
                                                className={selectClass(!!errors.CustomerSubtype)}
                                            >
                                                <option value="">Select subtype…</option>
                                                {objOptions("CustomerSubtype").map(i => <option key={i._id} value={i._id}>{i.Name}</option>)}
                                            </select>
                                        </FormField>

                                        <FormField label="Full Name *" error={errors.customerName} className="col-span-2 max-sm:col-span-1">
                                            <input
                                                type="text" name="customerName" placeholder="e.g. Arjun Sharma"
                                                value={customerData.customerName} onChange={handleInputChange}
                                                className={inputClass(!!errors.customerName)}
                                            />
                                        </FormField>

                                        <FormField label="Contact Number *" error={errors.ContactNumber}>
                                            <div className="flex">
                                                <span className="flex items-center px-3 rounded-l-xl border border-r-0 text-sm font-medium border-gray-200 bg-gray-50" style={{ color: "var(--color-primary)" }}>+91</span>
                                                <input
                                                    type="tel" name="ContactNumber" placeholder="10-digit number" maxLength={10}
                                                    value={customerData.ContactNumber} onChange={handleInputChange}
                                                    className={`${inputClass(!!errors.ContactNumber)} rounded-l-none`}
                                                />
                                            </div>
                                        </FormField>

                                        <FormField label="Email Address" error={errors.Email}>
                                            <input
                                                type="email" name="Email" placeholder="you@example.com"
                                                value={customerData.Email} onChange={handleInputChange}
                                                className={inputClass(!!errors.Email)}
                                            />
                                        </FormField>

                                    </div>
                                )}

                                {/* ─── STEP 2: Location ─── */}
                                {currentStep === 2 && (
                                    <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">

                                        <FormField label="City *" error={errors.City}>
                                            <select
                                                value={customerData.City.id}
                                                onChange={e => {
                                                    const obj = objOptions("City").find(i => i._id === e.target.value);
                                                    if (obj) setCustomerData(p => ({ ...p, City: { id: obj._id, name: obj.Name }, Location: { id: "", name: "" }, SubLocation: { id: "", name: "" } }));
                                                    else setCustomerData(p => ({ ...p, City: { id: "", name: "" } }));
                                                    setErrors(p => ({ ...p, City: "" }));
                                                }}
                                                className={selectClass(!!errors.City)}
                                            >
                                                <option value="">Select city…</option>
                                                {objOptions("City").map(i => <option key={i._id} value={i._id}>{i.Name}</option>)}
                                            </select>
                                        </FormField>

                                        <FormField label="Location">
                                            <select
                                                value={customerData.Location.id}
                                                onChange={e => {
                                                    const obj = objOptions("Location").find(i => i._id === e.target.value);
                                                    if (obj) setCustomerData(p => ({ ...p, Location: { id: obj._id, name: obj.Name }, SubLocation: { id: "", name: "" } }));
                                                }}
                                                className={selectClass(false)}
                                            >
                                                <option value="">Select location…</option>
                                                {objOptions("Location").map(i => <option key={i._id} value={i._id}>{i.Name}</option>)}
                                            </select>
                                        </FormField>

                                        <FormField label="Sub Location">
                                            <select
                                                value={customerData.SubLocation.id}
                                                onChange={e => {
                                                    const obj = objOptions("SubLocation").find(i => i._id === e.target.value);
                                                    if (obj) setCustomerData(p => ({ ...p, SubLocation: { id: obj._id, name: obj.Name } }));
                                                }}
                                                className={selectClass(false)}
                                            >
                                                <option value="">Select sub location…</option>
                                                {objOptions("SubLocation").map(i => <option key={i._id} value={i._id}>{i.Name}</option>)}
                                            </select>
                                        </FormField>

                                        <FormField label="Area / Sector">
                                            <input
                                                type="text" name="Area" placeholder="e.g. Sector 12, Phase II"
                                                value={customerData.Area} onChange={handleInputChange}
                                                className={inputClass(false)}
                                            />
                                        </FormField>

                                        <FormField label="Full Address" className="col-span-2 max-sm:col-span-1">
                                            <input
                                                type="text" name="Address" placeholder="Building, Street, Landmark…"
                                                value={customerData.Address} onChange={handleInputChange}
                                                className={inputClass(false)}
                                            />
                                        </FormField>

                                    </div>
                                )}

                                {/* ─── STEP 3: Details ─── */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">

                                            <FormField label="Budget / Price Range">
                                                <select
                                                    name="Price" value={customerData.Price}
                                                    onChange={e => setCustomerData(p => ({ ...p, Price: e.target.value }))}
                                                    className={selectClass(false)}
                                                >
                                                    <option value="">Select budget…</option>
                                                    {(fieldOptions.Price || []).map((p: string) => <option key={p} value={p}>{p}</option>)}
                                                </select>
                                            </FormField>

                                            <FormField label="Reference Source">
                                                <select
                                                    name="ReferenceId" value={customerData.ReferenceId}
                                                    onChange={e => setCustomerData(p => ({ ...p, ReferenceId: e.target.value }))}
                                                    className={selectClass(false)}
                                                >
                                                    <option value="">How did you hear about us?</option>
                                                    {(fieldOptions.ReferenceId || []).map((r: string) => <option key={r} value={r}>{r}</option>)}
                                                </select>
                                            </FormField>

                                            <FormField label="Facilities">
                                                <select
                                                    name="Facilities" value={customerData.Facilities}
                                                    onChange={e => setCustomerData(p => ({ ...p, Facilities: e.target.value }))}
                                                    className={selectClass(false)}
                                                >
                                                    <option value="">Select facility…</option>
                                                    {(fieldOptions.Facilities || []).map((f: string) => <option key={f} value={f}>{f}</option>)}
                                                </select>
                                            </FormField>

                                            <FormField label="Customer Date">
                                                <input
                                                    type="date" name="CustomerDate"
                                                    value={customerData.CustomerDate} onChange={handleInputChange}
                                                    className={inputClass(false)}
                                                />
                                            </FormField>

                                            <FormField label="Message / Requirements" className="col-span-2 max-sm:col-span-1">
                                                <textarea
                                                    name="Description" rows={4}
                                                    placeholder="Describe what you're looking for — preferred size, type, specific needs…"
                                                    value={customerData.Description} onChange={handleInputChange}
                                                    className={`${inputClass(false)} resize-none`}
                                                />
                                            </FormField>

                                        </div>

                                        {/* Custom dynamic fields */}
                                        {Object.keys(customFields).length > 0 && (
                                            <div>
                                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Additional Information</p>
                                                <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                                                    {Object.keys(customFields).map(key => (
                                                        <FormField key={key} label={key}>
                                                            <input
                                                                type="text" placeholder={`Enter ${key}…`}
                                                                value={customFields[key]}
                                                                onChange={e => handleCustomInputChange(key, e.target.value)}
                                                                className={inputClass(false)}
                                                            />
                                                        </FormField>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* File Uploads */}
                                        <div>
                                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Attachments</p>
                                            <div className="grid grid-cols-2 gap-5 max-sm:grid-cols-1">
                                                <WebFileUpload
                                                    label="Upload Images"
                                                    multiple
                                                    previews={imagePreviews}
                                                    onChange={e => handleFileChange(e, "CustomerImage")}
                                                    onRemove={handleRemoveImage}
                                                />
                                                <WebFileUpload
                                                    label="Site Plan"
                                                    previews={sitePlanPreview ? [sitePlanPreview] : []}
                                                    onChange={e => handleFileChange(e, "SitePlan")}
                                                    onRemove={handleRemoveSitePlan}
                                                />
                                            </div>
                                        </div>

                                    </div>
                                )}

                                {/* ─── STEP 4: Review ─── */}
                                {currentStep === 4 && (
                                    <div className="space-y-5">

                                        <ReviewSection title="Personal Details" icon={User}>
                                            <ReviewRow label="Campaign" value={customerData.Campaign.name} />
                                            <ReviewRow label="Type" value={customerData.CustomerType.name} />
                                            <ReviewRow label="Subtype" value={customerData.CustomerSubtype.name} />
                                            <ReviewRow label="Name" value={customerData.customerName} />
                                            <ReviewRow label="Contact" value={customerData.ContactNumber ? `+91 ${customerData.ContactNumber}` : ""} />
                                            <ReviewRow label="Email" value={customerData.Email} />
                                        </ReviewSection>

                                        <ReviewSection title="Location" icon={MapPin}>
                                            <ReviewRow label="City" value={customerData.City.name} />
                                            <ReviewRow label="Location" value={customerData.Location.name} />
                                            <ReviewRow label="Sub Location" value={customerData.SubLocation.name} />
                                            <ReviewRow label="Area" value={customerData.Area} />
                                            <ReviewRow label="Address" value={customerData.Address} />
                                        </ReviewSection>

                                        <ReviewSection title="Other Details" icon={FileText}>
                                            <ReviewRow label="Budget" value={customerData.Price} />
                                            <ReviewRow label="Reference" value={customerData.ReferenceId} />
                                            <ReviewRow label="Facilities" value={customerData.Facilities} />
                                            <ReviewRow label="Date" value={customerData.CustomerDate} />
                                            <ReviewRow label="Description" value={customerData.Description} />
                                            {Object.keys(customFields).map(k => (
                                                <ReviewRow key={k} label={k} value={customFields[k]} />
                                            ))}
                                        </ReviewSection>

                                        {/* Images preview */}
                                        {imagePreviews.length > 0 && (
                                            <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                                <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Uploaded Images</p>
                                                <div className="flex flex-wrap gap-3">
                                                    {imagePreviews.map((src, i) => (
                                                        <img key={i} src={src} alt="" className="w-20 h-20 object-cover rounded-xl border border-gray-200" />
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Consent */}
                                        <div
                                            className="rounded-2xl p-4 flex items-start gap-3 border"
                                            style={{
                                                background: "color-mix(in srgb, var(--color-primary) 6%, transparent)",
                                                borderColor: errors.consent ? "#ef4444" : "color-mix(in srgb, var(--color-primary) 25%, transparent)"
                                            }}
                                        >
                                            <input
                                                id="consent" type="checkbox" checked={consent}
                                                onChange={e => { setConsent(e.target.checked); setErrors(p => ({ ...p, consent: "" })); }}
                                                className="mt-1 w-4 h-4 rounded cursor-pointer accent-[var(--color-primary)]"
                                            />
                                            <label htmlFor="consent" className="text-xs text-gray-500 leading-relaxed cursor-pointer">
                                                I agree to be contacted by the team regarding my enquiry. My personal data will be handled as
                                                per the <span className="underline font-medium" style={{ color: "var(--color-primary)" }}>Privacy Policy</span> and
                                                I may opt-out at any time.
                                            </label>
                                        </div>
                                        {errors.consent && <p className="text-xs text-red-500 -mt-3">{errors.consent}</p>}

                                    </div>
                                )}

                                {/* ── Navigation Buttons ── */}
                                <div className={`flex mt-8 gap-3 ${currentStep > 1 ? "justify-between" : "justify-end"}`}>
                                    {currentStep > 1 && (
                                        <button
                                            type="button" onClick={goBack}
                                            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-all"
                                        >
                                            <ArrowLeft size={16} /> Back
                                        </button>
                                    )}

                                    {currentStep < STEPS.length ? (
                                        <button
                                            type="button" onClick={goNext}
                                            className="flex items-center gap-2 px-7 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0"
                                            style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)" }}
                                        >
                                            Continue <ArrowRight size={16} />
                                        </button>
                                    ) : (
                                        <button
                                            type="button" onClick={handleSubmit} disabled={submitting}
                                            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                                            style={{ background: "linear-gradient(135deg, var(--color-primary) 0%, var(--color-secondary) 100%)" }}
                                        >
                                            {submitting ? <><Loader2 size={16} className="animate-spin" /> Submitting…</> : <>Submit Enquiry <CheckCircle2 size={16} /></>}
                                        </button>
                                    )}
                                </div>

                            </div>
                        </div>
                    )}

                    {/* Footer note */}
                    {!submitted && (
                        <p className="text-center text-xs text-gray-400 mt-6">
                            🔒 Your information is secure and will never be shared with third parties.
                        </p>
                    )}

                </div>
            </div>
        </div>
    );
}

/* ────────────────────────────────────────────────────────── */
/*  Helper style functions                                     */
/* ────────────────────────────────────────────────────────── */
const inputBase = "w-full rounded-xl border px-3.5 py-2.5 text-sm text-gray-800 placeholder:text-gray-300 outline-none transition-all duration-200 focus:ring-2 bg-white";
const inputClass = (hasError: boolean) =>
    `${inputBase} ${hasError ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[var(--color-primary)] focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"}`;
const selectClass = (hasError: boolean) =>
    `${inputBase} cursor-pointer ${hasError ? "border-red-400 focus:border-red-400 focus:ring-red-100" : "border-gray-200 focus:border-[var(--color-primary)] focus:ring-[color-mix(in_srgb,var(--color-primary)_15%,transparent)]"} appearance-none bg-[url('data:image/svg+xml,%3Csvg xmlns%3D%22http%3A//www.w3.org/2000/svg%22 width%3D%2212%22 height%3D%2212%22 viewBox%3D%220 0 24 24%22 fill%3D%22none%22 stroke%3D%22%236b7280%22 stroke-width%3D%222%22%3E%3Cpolyline points%3D%226 9 12 15 18 9%22%3E%3C/polyline%3E%3C/svg%3E')] bg-no-repeat bg-[right_12px_center] pr-9`;

/* ────────────────────────────────────────────────────────── */
/*  Sub-components                                             */
/* ────────────────────────────────────────────────────────── */
const FormField: React.FC<{
    label: string;
    error?: string;
    className?: string;
    children: React.ReactNode;
}> = ({ label, error, className = "", children }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
        <label className="text-xs font-semibold text-gray-500 tracking-wide">{label}</label>
        {children}
        {error && <p className="text-xs text-red-500 mt-0.5">{error}</p>}
    </div>
);

const ReviewSection: React.FC<{
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
}> = ({ title, icon: Icon, children }) => (
    <div className="rounded-2xl border border-gray-100 overflow-hidden">
        <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100"
            style={{ background: "color-mix(in srgb, var(--color-primary) 6%, transparent)" }}
        >
            <Icon size={14} style={{ color: "var(--color-primary)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-primary)" }}>{title}</span>
        </div>
        <div className="divide-y divide-gray-50">{children}</div>
    </div>
);

const ReviewRow: React.FC<{ label: string; value?: string }> = ({ label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3 px-4 py-2.5">
            <span className="text-xs text-gray-400 w-28 shrink-0 pt-0.5">{label}</span>
            <span className="text-sm text-gray-700 font-medium break-words">{value}</span>
        </div>
    );
};

const WebFileUpload: React.FC<{
    label: string;
    multiple?: boolean;
    previews?: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove?: (index: number) => void;
}> = ({ label, multiple, previews = [], onChange, onRemove }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-semibold text-gray-500 tracking-wide">{label}</label>
        <label
            className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-200 p-5 cursor-pointer hover:border-[var(--color-primary)] hover:bg-[color-mix(in_srgb,var(--color-primary)_4%,transparent)] transition-all"
        >
            <Upload size={20} className="text-gray-300" />
            <span className="text-xs text-gray-400">Click to upload</span>
            <input type="file" multiple={multiple} onChange={onChange} className="hidden" />
        </label>
        {previews.length > 0 && (
            <div className="flex flex-wrap gap-2">
                {previews.map((src, i) => (
                    <div key={i} className="relative">
                        <img src={src} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200" />
                        {onRemove && (
                            <button
                                type="button" onClick={() => onRemove(i)}
                                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                            >
                                <X size={11} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
);