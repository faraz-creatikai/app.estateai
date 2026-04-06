'use client'

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import DateSelector from "@/app/component/DateSelector";
import { useRouter } from "next/navigation";
import { addContact, importContact } from "@/store/contact";
import { contactAllDataInterface } from "@/store/contact.interface";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getContactType, getContactTypeByCampaign } from "@/store/masters/contacttype/contacttype";
import { getCity } from "@/store/masters/city/city";
import { getLocation } from "@/store/masters/location/location";
import { getIndustries } from "@/store/masters/industries/industries";
import { getFunctionalAreas } from "@/store/masters/functionalarea/functionalarea";
import { getReferences } from "@/store/masters/references/references";
import { InputField } from "@/app/component/InputField";
import TextareaField from "@/app/component/datafields/TextareaField";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import { useCustomerImport } from "@/context/CustomerImportContext";
import { useContactImport } from "@/context/ContactImportContext";
import LoaderCircle from "@/app/component/LoaderCircle";

interface ErrorInterface {
    [key: string]: string; // dynamic key type for any field
}

export default function SelectImports() {
    const [contactData, setContactData] = useState<contactAllDataInterface>({
        Campaign: { id: "", name: "" },
        Name: "",
        City: { id: "", name: "" },
        ContactType: { id: "", name: "" },
        ContactNo: "",
        Location: { id: "", name: "" },
        Email: "",
        CompanyName: "",
        Website: "",
        Status: "",
        Address: "",
        ContactIndustry: "",
        ContactFunctionalArea: "",
        ReferenceId: "",
        Notes: "",
        date: ""
    });
    const [Range, setRange] = useState("")

    const [errors, setErrors] = useState<ErrorInterface>({});
    const router = useRouter();
    const { excelHeaders, file } = useContactImport();
    const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [importLoader, setImportLoader] = useState(false);





    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setContactData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => ({ ...prev, [name]: "" }));
        },
        []
    );

    const handleSelectChange = useCallback(
        (label: string, selected: string) => {
            setContactData((prev) => ({ ...prev, [label]: selected }));
            setErrors((prev) => ({ ...prev, [label]: "" }));
        },
        []
    );
    const handleSelectRange = useCallback((label: string, selected: string) => {
        setRange((prev) => (selected));
        setErrors((prev) => ({ ...prev, [label]: "" }));
    },
        [])

    const validateForm = () => {
        const newErrors: ErrorInterface = {};

        if (!contactData.Campaign.name.trim()) newErrors.Campaign = "Campaign is required";
        if (!Range.trim()) newErrors.Range = "Range is required";
        if (!contactData.ContactType.name.trim()) newErrors.ContactType = "ContactType is required";


        return newErrors;
    };

    const handleSubmit = async () => {
        /*   const validationErrors = validateForm();
          if (Object.keys(validationErrors).length > 0) {
              setErrors(validationErrors);
              console.log(validationErrors, " error coming")
              return;
          } */
        setImportLoader(true);

        const formData = new FormData();
        formData.append("fieldMapping", JSON.stringify(fieldMapping))

        if (file) {
            formData.append("file", file);
        }
        const data = await importContact(formData);
        if (data) {
            toast.success("Contact imported successfully!");
            setImportLoader(false);
            router.push("/contact");
            return;
        }
        toast.error("Failed to import contact");
        setImportLoader(false);
    };



    // Object-based fields (for ObjectSelect)
    const objectFields = [
        { key: "Campaign", fetchFn: getCampaign },
        { key: "ContactType", staticData: [] },

    ];

    // Simple array fields (for normal Select)
    const arrayFields = [
        { key: "Status", staticData: ["Active", "Inactive"] },
        { key: "City", fetchFn: getCity },
        { key: "Location", fetchFn: getLocation },
        { key: "ContactIndustry", fetchFn: getIndustries },
        { key: "ContactFunctionalArea", fetchFn: getFunctionalAreas },
        { key: "ReferenceId", fetchFn: getReferences },
    ];


    useEffect(() => {
        console.log("excel headers", excelHeaders)
        const loadFieldOptions = async () => {
            await handleFieldOptionsObject(objectFields, setFieldOptions);
            await handleFieldOptions(arrayFields, setFieldOptions);
        };
        loadFieldOptions();
    }, []);

    useEffect(() => {
        if (contactData.Campaign.id) {
            fetchContactType(contactData.Campaign.id);
        } else {
            setFieldOptions((prev) => ({ ...prev, ContactType: [] }));
        }


    }, [contactData.Campaign.id]);

    const fetchContactType = async (campaignId: string) => {
        try {
            const res = await getContactTypeByCampaign(campaignId);
            setFieldOptions((prev) => ({ ...prev, ContactType: res?.data || [] }));

        } catch (error) {
            console.error("Error fetching types:", error);
            setFieldOptions((prev) => ({ ...prev, ContactType: [] }));
        }
    };

    const mappingFields = [
        "ContactType",
        "Campaign",
        "Name",
        "City",
        "ContactNo",
        "Location",
        "Email",
        "CompanyName",
        "Website",
        "Status",
        "Address",
        "ContactIndustry",
        "ContactFunctionalArea",
        "ReferenceId",
        "Notes",
        "date"
    ];

    // Dropdown data
    const rangeOptions = ["10", "20", "30"]
    const campaign = ['Buyer', 'Seller', 'Rent Out', 'Rent In', 'Hostel/PG', 'Agents', 'Services', 'Others', 'Guest House', 'Happy Stay'];
    const city = ['Jaipur', 'Ajmer'];
    const contactType = ['Personal', 'Business'];
    const location = ['Location 1', 'Location 2'];
    const contactIndustry = ['IT', 'Finance', 'Real Estate'];
    const contactFunctionalArea = ['HR', 'Sales', 'Tech'];
    const referenceId = ['Ref001', 'Ref002'];
    const status = ['Active', 'Inactive'];

    return (
        <div className=" min-h-screen flex justify-center">
            <Toaster position="top-right" />
            <div className="w-full ">
                <div className="flex justify-end mb-4">

                    <BackButton
                        url="/contact"
                        text="Back"
                        icon={<ArrowLeft size={18} />}
                    />
                </div>
                <div className="bg-white/90 backdrop-blur-lg w-full p-10 rounded-3xl shadow-2xl h-auto">
                    <form onSubmit={(e) => e.preventDefault()}>
                        <div className="mb-8 text-left border-b pb-4 border-gray-200">
                            <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                                Contact <span className="text-[var(--color-primary)]">Select Import</span>
                            </h1>
                        </div>

                        <div className="flex flex-col space-y-6">
                            <h2 className=" text-xl font-semibold text-gray-700 my-5 mt-10">Map Fields</h2>
                            <div className="grid grid-cols-3 max-lg:grid-cols-2 max-md:grid-cols-1 gap-4 w-full">
                                {excelHeaders.map((header) => (
                                    <div key={header} className="flex flex-col m-4">
                                        <label className="text-sm font-medium mb-4">{header}</label>

                                        <SingleSelect
                                            label="Map To"
                                            options={mappingFields}
                                            value={fieldMapping[header] || ""}
                                            onChange={(value) =>
                                                setFieldMapping((prev) => ({
                                                    ...prev,
                                                    [header]: value,
                                                }))
                                            }
                                        />


                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-end mt-4">

                                <SaveButton text={` ${importLoader ? "Saving.." : "Save Import"}`} icon={importLoader && <LoaderCircle />} onClick={handleSubmit} />

                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}



