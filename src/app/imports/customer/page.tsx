'use client'

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import SingleSelect from "@/app/component/SingleSelect";
import { useRouter } from "next/navigation";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypes, getTypesByCampaign } from "@/store/masters/types/types";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { customerExcelHeaders, importCustomer } from "@/store/customer";
import { getSubtype, getSubtypeByCampaignAndType } from "@/store/masters/subtype/subtype";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import { useCustomerImport } from "@/context/CustomerImportContext";
import { FaArrowDownLong } from "react-icons/fa6";
export default function CustomerImport() {
  const [importData, setImportData] = useState({
    Campaign: { id: "", name: "" },
    CustomerType: { id: "", name: "" },
    CustomerSubType: { id: "", name: "" },
    file: null as File | null,
  });

  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { setExcelHeaders, setFile } = useCustomerImport();



  const objectFields = [
    { key: "Campaign", fetchFn: getCampaign },
    { key: "CustomerType", staticData: [] },
    { key: "CustomerSubtype", staticData: [] } // dependent

  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
  ];

  useEffect(() => {
    const loadFieldOptions = async () => {
      await handleFieldOptionsObject(objectFields, setFieldOptions);
      // await handleFieldOptions(arrayFields, setFieldOptions);
    };
    loadFieldOptions();
  }, []);

  useEffect(() => {
    if (importData.Campaign.id) {
      fetchCustomerType(importData.Campaign.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, CustomerType: [] }));
    }

    if (importData.Campaign.id && importData.CustomerType.id) {
      fetchCustomerSubType(importData.Campaign.id, importData.CustomerType.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: [] }));
    }
  }, [importData.Campaign.id, importData.CustomerType.id]);

  const fetchCustomerType = async (campaignId: string) => {
    try {
      const res = await getTypesByCampaign(campaignId);
      setFieldOptions((prev) => ({ ...prev, CustomerType: res || [] }));
    } catch (error) {
      console.error("Error fetching types:", error);
      setFieldOptions((prev) => ({ ...prev, CustomerType: [] }));
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

  // Handle select changes
  const handleSelectChange = useCallback(
    (label: string, value: string) => {
      setImportData((prev) => ({ ...prev, [label]: value }));
      setErrors((prev) => ({ ...prev, [label]: "" }));
    },
    []
  );

  // Handle input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setImportData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // 🔹 Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportData((prev) => ({ ...prev, file: file }));
    setFile(file);
  };

  // Validate fields
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!importData.file) newErrors.file = "Please choose an Excel file";
    return newErrors;
  };

  // Handle submit
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      /* formData.append("Campaign", importData.Campaign?.name);
      formData.append("CustomerType", importData.CustomerType?.name);
      formData.append("CustomerSubType", importData.CustomerSubType?.name); */
      if (importData.file) formData.append("file", importData.file);

      console.log(importData)
      // customer import api call
      /*  const result = await importCustomer(formData); // mock success */
      /* customer header select api call  */
      const result = await customerExcelHeaders(formData);

      if (result?.headers) {
        console.log(" result ", result)
        // toast.success(`${result.importedCount} customers imported successfully. ${result.skippedCount} duplicates skipped.`);
        setExcelHeaders(result.headers);
        router.push("/imports/customer/select-imports/");
      } else {
        toast.error("Failed to import data");
      }
    } catch (error) {
      console.error("Import Error:", error);
      toast.error("Error importing customers");
    }
  };

  // download demo file function
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = "/files/customer-import-file.xlsx";
    link.download = "customer-import-template.xlsx";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex  mx-auto w-full justify-center">
        <div className=" min-h-fix max-md:p-0 max-w-[700px] w-[100%] mt-12   flex justify-center">
          <Toaster position="top-right" />
          <div className="w-full">
            <div className="flex justify-end mb-4">
              <BackButton
                url="/customer"
                text="Back"
                icon={<ArrowLeft size={18} />}
              />
            </div>

            <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl h-auto">
              <h1 className="text-2xl font-extrabold text-[var(--color-secondary-darker)] mb-8 border-b pb-4">
                Import <span className="text-[var(--color-primary)]
">Customers</span>
              </h1>

              <div className=" w-full">


                <FileUpload
                  label="Choose Excel File"
                  onChange={handleFileChange}
                  error={errors.file}
                />
              </div>

              <div className="flex justify-end mt-8">

                <SaveButton text="Import" onClick={handleSubmit} />

              </div>
            </div>
          </div>
        </div>

        {/* second */}
        <div className=" w-[35%]">
          <div className="bg-white border-neutral-400  p-6 rounded-lg   ml-6  hidden lg:block  relative top-11">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-orange-500">🔥</span>
              <h2 className="text-xl font-bold text-[var(--color-secondary-darker)]">Product Upload Tips</h2>
            </div>
            <ul className="space-y-3 text-sm text-gray-700 font-semibold" >
              <li className=" flex gap-1">
                <p>•</p>
                <div>
                  Phone numbers must contain digits only. <br />
                  Do not use special symbols such as -, /, or spaces.
                </div>
              </li>
              <li className=" flex gap-1"><p>•</p>
                <div>Only 10-digit phone numbers are allowed. <br />
                  Do not include country codes like +91 or prefixes such as 91.</div>
              </li>
              <li className=" flex gap-1"><p>•</p>
                <div>For multiple phone numbers, separate each number with a comma and a space. <br />
                  Example: 9876543210, 9123456789</div>
              </li>
              <li className=" flex gap-1">
                <p>•</p> <div> Supported file formats for upload are: <br />
                  .xlsx, .xlsm, .xlsb, .xls, .ods, .csv</div>
              </li>
              <li className=" flex gap-1"><p>•</p>
                <div>Unsupported file formats will not be accepted, including: <br />
                  .txt, .json, .pdf, .xml, and similar formats.</div>
              </li>

            </ul>
            <p className="text-[var(--color-secondary-darker)] text-sm font-semibold text-center mt-5">Want Demo ?</p>
            <div onClick={handleDownload} className=" cursor-pointer bg-gradient-to-r mt-1 from-[var(--color-primary-dark)] to-[var(--color-secondary)]  hover:from-[var(--color-primary-darker)] hover:to-[var(--color-secondary-dark)]  w-fit px-3 py-2 flex flex-row gap-x-2 items-center text-white font-medium rounded-md text-xs  mx-auto"><span className=" bg-transparent border-b-2 text-white border-white "><FaArrowDownLong className="animate-bounce" /></span>Download</div>
          </div>

        </div>
      </div>
    </>
  );
}

// 🟦 Input Field
const InputField = ({ label, name, value, error, onChange }: any) => (
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

// 🟦 File Upload
const FileUpload = ({ label, onChange, error }: any) => (
  <div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type="file"
      accept=".xlsx, .xls"
      onChange={onChange}
      className="border border-gray-300 cursor-pointer rounded-md p-2"
    />
    {error && <span className="text-red-500 text-sm mt-2">{error}</span>}
  </div>
);
