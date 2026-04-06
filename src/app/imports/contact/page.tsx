'use client'

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import SingleSelect from "@/app/component/SingleSelect";
import { useRouter } from "next/navigation";

import { getCampaign } from "@/store/masters/campaign/campaign";   // Range
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";

import { contactExcelHeaders, importContact } from "@/store/contact";   // ✅ Your contact import API
import { getContactType, getContactTypeByCampaign } from "@/store/masters/contacttype/contacttype";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import { useContactImport } from "@/context/ContactImportContext";
import { FaArrowDownLong } from "react-icons/fa6";


export default function ContactImport() {

  const [importData, setImportData] = useState({
    Campaign: { id: "", name: "" },
    ContactType: { id: "", name: "" },
    Range: "",
    file: null as File | null,
  });

  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const router = useRouter();
  const { setExcelHeaders, setFile } = useContactImport();


  // ✅ Fetch dropdown data

  // Object-based fields (for ObjectSelect)
  const objectFields = [
    { key: "Campaign", fetchFn: getCampaign },
    { key: "ContactType", staticData: [] },

  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
    { key: "Range", staticData: ["10", "20", "30"] }
  ];
  const rangeOptions = ["10", "20", "30"]

  useEffect(() => {
    const loadFieldOptions = async () => {
      await handleFieldOptionsObject(objectFields, setFieldOptions);
      // await handleFieldOptions(arrayFields, setFieldOptions);
    };
    loadFieldOptions();
  }, []);

  useEffect(() => {
    if (importData.Campaign.id) {
      fetchContactType(importData.Campaign.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, ContactType: [] }));
    }


  }, [importData.Campaign.id]);

  const fetchContactType = async (campaignId: string) => {
    try {
      const res = await getContactTypeByCampaign(campaignId);
      setFieldOptions((prev) => ({ ...prev, ContactType: res?.data || [] }));

    } catch (error) {
      console.error("Error fetching types:", error);
      setFieldOptions((prev) => ({ ...prev, ContactType: [] }));
    }
  };


  // Select change
  const handleSelectChange = useCallback((label: string, value: string) => {
    setImportData((prev) => ({ ...prev, [label]: value }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);


  // File upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImportData((prev) => ({ ...prev, file }));
  };


  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!importData.file) newErrors.file = "Please upload an Excel file";

    return newErrors;
  };


  //  Submit
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      /*  formData.append("Campaign", importData.Campaign?.name);
       formData.append("ContactType", importData.ContactType?.name);
       formData.append("Range", importData.Range); */
      if (importData.file) formData.append("file", importData.file);

      const result = await contactExcelHeaders(formData);
      console.log(" result naruto", result)

      if (result?.headers) {
        //toast.success("Contacts imported successfully!");
        setExcelHeaders(result.headers);
        setFile(importData.file)
        router.push("/imports/contact/select-imports");
      } else {
        toast.error("Failed to import contacts");
      }
    } catch (error) {
      console.error("Import Error:", error);
      toast.error("Error importing contacts");
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
    <div className="flex  mx-auto w-full justify-center">
      <div className="  min-h-fix max-md:p-0 max-w-[700px] w-[100%] mt-12   flex justify-center">
        <Toaster position="top-right" />

        <div className="w-full">
          <div className="flex justify-end mb-4">
            <BackButton
              url="/contact"
              text="Back"
              icon={<ArrowLeft size={18} />}
            />
          </div>

          <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl h-auto">
            <h1 className="text-2xl font-extrabold text-[var(--color-secondary-darker)] mb-8 border-b pb-4">
              Import <span className="text-[var(--color-primary)]
">Contacts</span>
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
  );
}



// ✅ File Upload Component
const FileUpload = ({ label, onChange, error }: any) => (
  <div className="flex flex-col">
    <label className="font-semibold text-gray-700 mb-2">{label}</label>
    <input
      type="file"
      accept=".xlsx, .xls"
      onChange={onChange}
      className="border border-gray-300 rounded-md p-2"
    />
    {error && <span className="text-red-500 text-sm mt-2">{error}</span>}
  </div>
);
