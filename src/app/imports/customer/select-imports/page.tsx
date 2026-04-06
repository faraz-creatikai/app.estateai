'use client'

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import SingleSelect from "@/app/component/SingleSelect";
import DateSelector from "@/app/component/DateSelector";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { addCustomer, importCustomer } from "@/store/customer";
import { customerAllDataInterface, customerImportDataInterface } from "@/store/customer.interface";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypes, getTypesByCampaign } from "@/store/masters/types/types";
import { getCity } from "@/store/masters/city/city";
import { getLocation } from "@/store/masters/location/location";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getSubtype, getSubtypeByCampaignAndType } from "@/store/masters/subtype/subtype";
import { getFacilities } from "@/store/masters/facilities/facilities";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import CustomerSubtypeAdd from "@/app/masters/customer-subtype/add/page";
import { useCustomerImport } from "@/context/CustomerImportContext";
import LoaderCircle from "@/app/component/LoaderCircle";
import { getCustomerFields } from "@/store/masters/customerfields/customerfields";


type CategorizedHeader = {
    header: string;
    type: "system" | "custom";
    mappedTo: string;
};

export default function SelectImports() {
    const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
    const [importLoader, setImportLoader] = useState(false);


    const router = useRouter();
    const { excelHeaders, file } = useCustomerImport();
    const [customerFieldMasters, setCustomerFieldMasters] = useState<string[]>([]);
    const [categorizedHeaders, setCategorizedHeaders] = useState<CategorizedHeader[]>([]);

    const normalize = (str: string) =>
        str
            .toLowerCase()
            .replace(/[^a-z0-9]/g, "");


    useEffect(() => {
        if (excelHeaders.length === 0) {
            // user opened this page directly
            router.push("/imports/customer");
        }
    }, [excelHeaders]);

    useEffect(() => {
        const loadCustomerFields = async () => {
            const res = await getCustomerFields(); 
             const activeFields = res.filter((e: any) => e.Status === "Active");
            setCustomerFieldMasters(activeFields.map((f: any) => f.Name));
        };
        loadCustomerFields();
    }, []);




    //Submit Form
    const handleSubmit = async () => {
        /*          const validationErrors = validateForm();
                 if (Object.keys(validationErrors).length > 0) {
                     setErrors(validationErrors);
                     return;
                 } */
        setImportLoader(true);


        const formData = new FormData();
        formData.append("fieldMapping", JSON.stringify(fieldMapping))

        if (file) {
            formData.append("file", file);
        }
        //console.log(customerData)
        const result = await importCustomer(formData);

        if (result) {
            toast.success("Customer imported successfully!");
            setImportLoader(false);
            router.push("/customer");
            return;
        } else {
            toast.error("Failed to import customer");
        }

        //  toast.error("Error importing customer");
        // console.error("Customer import Error:", error);
        router.push("/customer");
        setImportLoader(false);
    };



    const systemFields = [
        "Campaign",
        "CustomerType",
        "CustomerSubType",
        "customerName",
        "ContactNumber",
        "City",
        "Location",
        "SubLocation",
        "Area",
        "Adderess",
        "Email",
        "Facillities",
        "ReferenceId",
        "CustomerId",
        "CustomerDate",
        "CustomerYear",
        "Price",
        "URL",
        "Other",
        "Description",
        "Video",
        "GoogleMap",
        "Verified",
    ];

    const customerFields =[  ...customerFieldMasters,...systemFields];


    useEffect(() => {
        if (!excelHeaders.length) return;

        const categorized: CategorizedHeader[] = excelHeaders.map((header) => {
            const systemMatch = systemFields.find(
                (field) => normalize(field) === normalize(header)
            );

            if (systemMatch) {
                return {
                    header,
                    type: "system",
                    mappedTo: systemMatch, // auto-mapped
                };
            }

            return {
                header,
                type: "custom",
                mappedTo: "", // user will select
            };
        });

        setCategorizedHeaders(categorized);

        // Also initialize fieldMapping
        const initialMapping: Record<string, string> = {};
        categorized.forEach((item) => {
            if (item.mappedTo) {
                initialMapping[item.header] = item.mappedTo;
            }
        });

        setFieldMapping(initialMapping);
    }, [excelHeaders]);




    return (
        <div className=" min-h-screen flex justify-center">
            <Toaster position="top-right" />
            <div className="w-full">
                <div className="flex justify-end mb-4">
                    <BackButton
                        url="/customer"
                        text="Back"
                        icon={<ArrowLeft size={18} />}
                    />
                </div>

                <div className="bg-white backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl h-auto">
                    <form onSubmit={(e) => e.preventDefault()} className="w-full">
                        <div className="mb-8 text-left border-b pb-4 border-gray-200">
                            <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                                Customer <span className="text-[var(--color-primary)]">Selected Imports</span>
                            </h1>
                        </div>

                        <h2 className="text-xl font-semibold text-gray-700 mt-8">
                            Map System Fields
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {categorizedHeaders
                                .filter((item) => item.type === "system")
                                .map(({ header }) => (
                                    <div key={`system-${header}`}>
                                        <label className="text-sm font-medium mb-2 block">
                                            {header}
                                        </label>

                                        <SingleSelect
                                            label="Map to system field"
                                            options={systemFields}
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
                        <h2 className="text-xl font-semibold text-gray-700 mt-10">
                           Map Custom Fields
                        </h2>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            {categorizedHeaders
                                .filter((item) => item.type === "custom")
                                .map(({ header }) => (
                                    <div key={`custom-${header}`}>
                                        <label className="text-sm font-medium mb-2 block">
                                            {header}
                                        </label>

                                        <SingleSelect
                                            label="Map to custom field"
                                            options={customerFields}
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
                    </form>
                </div>
            </div>
        </div>
    );
}


const InputField: React.FC<{
    label: string;
    name: string;
    value: string;
    error?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}> = ({ label, name, value, onChange, error }) => (
    <label className="relative block w-full">
        <input
            type="text"
            name={name}
            value={value}
            onChange={onChange}
            placeholder=" "
            className={`peer w-full border rounded-sm bg-transparent py-3 px-4 outline-none 
        ${error ? "border-red-500 focus:border-red-500" : "border-gray-400 focus:border-blue-500"}`}
        />
        <p className={`absolute left-2 bg-white px-1 text-gray-500 text-sm transition-all duration-300
      ${value || error ? "-top-2 text-xs text-blue-500" : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"}`}>
            {label}
        </p>
        {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
    </label>
);

// Textarea field
const TextareaField: React.FC<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}> = ({ label, name, value, onChange }) => (
    <label className="relative block w-full">
        <textarea
            name={name}
            value={value}
            onChange={onChange}
            placeholder=" "
            className="peer w-full border rounded-sm border-gray-400 bg-transparent py-3 px-4 outline-none focus:border-blue-500 min-h-[100px]"
        ></textarea>
        <p className={`absolute left-2 bg-white px-1 text-gray-500 text-sm transition-all duration-300
      ${value ? "-top-2 text-xs text-blue-500" : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"}`}>
            {label}
        </p>
    </label>
);

// File upload with preview and remove
const FileUpload: React.FC<{
    label: string;
    multiple?: boolean;
    previews?: string[];
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemove?: (index: number) => void;
}> = ({ label, multiple, previews = [], onChange, onRemove }) => (
    <div className="flex flex-col">
        <label className="font-semibold text-gray-700 mb-2">{label}</label>
        <input
            type="file"
            multiple={multiple}
            onChange={onChange}
            className="border border-gray-300 rounded-md p-2"
        />
        {previews.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-3">
                {previews.map((src, index) => (
                    <div key={index} className="relative">
                        <img
                            src={src}
                            alt={`preview-${index}`}
                            className="w-24 h-24 object-cover rounded-md border"
                        />
                        {onRemove && (
                            <button
                                type="button"
                                onClick={() => onRemove(index)}
                                className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                            >
                                <X size={14} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
    </div>
);