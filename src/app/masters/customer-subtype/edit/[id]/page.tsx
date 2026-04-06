"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { subtypeAllDataInterface } from "@/store/masters/subtype/subtype.interface";
import { getSubtypeById, updateSubtype } from "@/store/masters/subtype/subtype";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypesByCampaign } from "@/store/masters/types/types";
import ObjectSelect from "@/app/component/ObjectSelect";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";


interface ErrorInterface { [key: string]: string; }

export default function CustomerSubtypeEdit() {
  const [data, setData] = useState<subtypeAllDataInterface>({
    Campaign: "",
    CustomerType: "",
    Name: "",
    Status: "",
  });
  const [errors, setErrors] = useState<ErrorInterface>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { id } = useParams();
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [customerTypesOptions, setCustomerTypesOptions] = useState<string[] | null>([]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: "" }));
  }, []);

  const handleSelectChange = useCallback((label: string, selected: string) => {
    setData(prev => ({ ...prev, [label]: selected }));
    setErrors(prev => ({ ...prev, [label]: "" }));
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const res = await getSubtypeById(id as string);
      if (res) {
        setData({
          Campaign: res.Campaign?._id || "",
          CustomerType: res.CustomerType?._id || "",
          Name: res.Name || "",
          Status: res.Status || "",
        });
      } else {
        toast.error("Failed to fetch subtype details");
      }
      setLoading(false);
    };
    if (id) {
      fetch();
      fetchFields();
    }
  }, [id]);

  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!data.Campaign.trim()) newErrors.Campaign = "Campaign is required";
    if (!data.CustomerType.trim()) newErrors.CustomerType = "Customer Type is required";
    if (!data.Name.trim()) newErrors.Name = "Subtype Name is required";
    if (!data.Status.trim()) newErrors.Status = "Status is required";
    return newErrors;
  };

  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const res = await updateSubtype(id as string, data);
      if (res) {
        toast.success("Customer Subtype updated successfully!");
        router.push("/masters/customer-subtype");
      }
    } catch (err) {
      toast.error("Failed to update Customer Subtype");
      console.error(err);
    }
  };

  const fetchFields = async () => {
    await handleFieldOptionsObject(
      [
        { key: "Status", staticData: ["Active", "Inactive"] },
        { key: "Campaign", fetchFn: getCampaign },
        { key: "CustomerTypes", staticData: customerTypeOptions },
      ],
      setFieldOptions
    );
  };

  useEffect(() => {
    if (data.Campaign) {
      fetchCustomerType();
    } else {
      setCustomerTypesOptions([]); // clear options if no campaign
    }
  }, [data.Campaign]);


  const fetchCustomerType = async () => {
    try {
      const res = await getTypesByCampaign(data.Campaign); // returns array
      console.log("achchaaaa ", res)
      setFieldOptions(prev => ({ ...prev, CustomerTypes: res || [] }));
    } catch (err) {
      console.error("Error fetching customer types:", err);
      setFieldOptions(prev => ({ ...prev, CustomerTypes: [] }));
    }
  };

  const campaignOptions = ["Campaign A", "Campaign B", "Campaign C"]; // dummy
  const customerTypeOptions = ["Type A", "Type B", "Type C"]; // dummy
  const statusOptions = ["Active", "Inactive"];

  if (loading) return null;

  return (
    <MasterProtectedRoute>
    <div className=" min-h-screen  flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        <div className="flex justify-end mb-4">

          <BackButton
            url="/masters/customer-subtype"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl">
          <form onSubmit={(e) => e.preventDefault()} className="w-full">
            <div className="mb-8 text-left border-b pb-4 border-gray-200">
              <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)]">Edit <span className="text-[var(--color-primary)]">Customer Subtype</span></h1>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                {/*  <SingleSelect options={campaignOptions} label="Campaign" value={data.Campaign} onChange={(v) => handleSelectChange("Campaign", v)} /> */}
                <ObjectSelect
                  options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                  label="Campaign"
                  value={data.Campaign}
                  getLabel={(item) => item?.Name || ""}
                  getId={(item) => item?._id || ""}
                  onChange={(selected) => {
                    setData((prev) => ({ ...prev, Campaign: selected }));
                    setErrors((prev) => ({ ...prev, Campaign: "" }));
                  }}
                  error={errors.Campaign}
                />
                {/* <SingleSelect options={customerTypeOptions} label="Customer Type" value={data.CustomerType} onChange={(v) => handleSelectChange("CustomerType", v)} /> */}
                <ObjectSelect
                  options={Array.isArray(fieldOptions?.CustomerTypes) ? fieldOptions.CustomerTypes : []}
                  label="Customer Type"
                  value={data.CustomerType}
                  getLabel={(item) => item?.Name || ""}
                  getId={(item) => item?._id || ""}
                  onChange={(selected) => {
                    setData((prev) => ({ ...prev, CustomerType: selected }));
                    setErrors((prev) => ({ ...prev, CustomerType: "" }));
                  }}
                  error={errors.CustomerType}
                />
                <InputField label="Subtype Name" name="Name" value={data.Name} onChange={handleInputChange} error={errors.Name} />
                <SingleSelect options={statusOptions} label="Status" value={data.Status} onChange={(v) => handleSelectChange("Status", v)} />
              </div>

              <div className="flex justify-end mt-4">

                <SaveButton text="Update" onClick={handleSubmit} />
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
    </MasterProtectedRoute>
  );
}

const InputField: React.FC<{ label: string; name: string; value: string; error?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, name, value, onChange, error }) => (
  <label className="relative block w-full">
    <input type="text" name={name} value={value} onChange={onChange} placeholder=" " className={`peer w-full border rounded-sm bg-transparent py-3 px-4 outline-none ${error ? "border-red-500 focus:border-red-500" : "border-gray-400 focus:border-blue-500"}`} />
    <p className={`absolute left-2 bg-white px-1 text-gray-500 text-sm transition-all duration-300 ${value || error ? "-top-2 text-xs text-blue-500" : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"}`}>{label}</p>
    {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
  </label>
);
