"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

import { getCustomerById, updateCustomer } from "@/store/customer";
import { customerAllDataInterface } from "@/store/customer.interface";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import { trimCountryCodeHelper } from "@/app/utils/trimCountryCodeHelper";

import { getCampaign } from "@/store/masters/campaign/campaign";
import { getTypesByCampaign } from "@/store/masters/types/types";
import { getLocationByCity } from "@/store/masters/location/location";
import { getCity } from "@/store/masters/city/city";
import { getFacilities } from "@/store/masters/facilities/facilities";
import { getSubtypeByCampaignAndType } from "@/store/masters/subtype/subtype";
import { getsubLocationByCityLoc } from "@/store/masters/sublocation/sublocation";
import { getReferences } from "@/store/masters/references/references";
import { getPrice } from "@/store/masters/price/price";
import { getCustomerFields } from "@/store/masters/customerfields/customerfields";
import { useCustomerFieldLabel } from "@/context/customer/CustomerFieldLabelContext";
import SaveButton from "../buttons/SaveButton";
import { InputField } from "../InputField";
import SingleSelect from "../SingleSelect";
import TextareaField from "../datafields/TextareaField";
import DateSelector from "../DateSelector";
import ObjectSelect from "../ObjectSelect";
import PopupMenu from "./PopupMenu";
import { getLeadType } from "@/store/masters/leadtype/leadtype";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  onCustomerUpdated: (customer: any) => void;
}

interface ErrorInterface {
  [key: string]: string;
}

type CustomFieldsType = {
  [key: string]: string;
};

export default function CustomerEditDialog({
  isOpen,
  onClose,
  customerId,
  onCustomerUpdated,
}: Props) {
  const { getLabel } = useCustomerFieldLabel();

  const [customerData, setCustomerData] =
    useState<customerAllDataInterface>({
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
      CustomerDate: "",
      CustomerYear: "",
      Price: "",
      LeadType: "",
      URL: "",
      Other: "",
      Description: "",
      Video: "",
      GoogleMap: "",
      Verified: "",
      CustomerImage: [],
      SitePlan: {} as File,
    });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [sitePlanPreview, setSitePlanPreview] = useState("");
  const [errors, setErrors] = useState<ErrorInterface>({});
  const [loading, setLoading] = useState(true);
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const [customFields, setCustomFields] = useState<CustomFieldsType>({});
  const [removedCustomerImages, setRemovedCustomerImages] = useState<string[]>([]);
  const [removedSitePlans, setRemovedSitePlans] = useState<string[]>([]);

  /* ================= FETCH CUSTOMER ================= */

  useEffect(() => {
    if (!isOpen || !customerId) return;

    const fetchCustomer = async () => {
      try {
        const data = await getCustomerById(customerId);
        if (!data) {
          toast.error("Customer not found");
          return;
        }

        setCustomerData({
          ...data,
          Campaign: {
            id: data?.Campaign?._id || "",
            name: data?.Campaign?.Name || ""
          },
          CustomerType: {
            id: data?.CustomerType?._id || "",
            name: data?.CustomerType?.Name || ""
          },
          CustomerSubtype: {
            id: data?.CustomerSubType?._id || "",  // map the backend typo
            name: data?.CustomerSubType?.Name || ""
          },
          City: {
            id: data?.City?._id || "",
            name: data.City?.Name || ""
          },
          Location: {
            id: data.Location?._id || "",
            name: data.Location?.Name || ""
          },
          SubLocation: {
            id: data.SubLocation?._id || "",
            name: data.SubLocation?.Name || ""
          },
          AssignTo: data.AssignTo ?? [],
          Address: data.Adderess || "",
          CustomerDate: data?.CustomerDate,
          CustomerImage: [],
          SitePlan: {} as File,
        });

        const customerFieldsBase = await getCustomerFields();
        const activeFields = customerFieldsBase.filter((e: any) => e.Status === "Active");

        const fieldsObj: CustomFieldsType = {};
        activeFields.forEach((field: any) => {
          fieldsObj[field.Name] = "";
        });

        setCustomFields({ ...fieldsObj, ...data.CustomerFields });

        setImagePreviews(Array.isArray(data.CustomerImage) ? data.CustomerImage : []);
        setSitePlanPreview(data.SitePlan?.[0] || "");

      } catch (error) {
        toast.error("Error fetching customer");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, isOpen]);

  /* ================= INPUT ================= */

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setCustomerData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleCustomInputChange = (key: string, value: string) => {
    setCustomFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSelectChange = useCallback((label: string, selected: any) => {
    setCustomerData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  /* ================= FILE HANDLING ================= */

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files) return;

    if (field === "CustomerImage") {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
      setCustomerData((prev) => ({
        ...prev,
        CustomerImage: [...prev.CustomerImage, ...newFiles],
      }));
      setImagePreviews((prev) => [...prev, ...newPreviews]);
    } else if (field === "SitePlan") {
      const file = files[0];
      setCustomerData((prev) => ({ ...prev, SitePlan: file }));
      setSitePlanPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (index: number) => {
    setCustomerData((prev) => ({
      ...prev,
      CustomerImage: prev.CustomerImage.filter((_, i) => i !== index),
    }));

    setImagePreviews((prev) => {
      const removedUrl = prev[index];
      if (removedUrl?.startsWith("http")) {
        setRemovedCustomerImages((prevDel) =>
          prevDel.includes(removedUrl) ? prevDel : [...prevDel, removedUrl]
        );
      }
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleRemoveSitePlan = () => {
    if (sitePlanPreview?.startsWith("http")) {
      setRemovedSitePlans((prev) => [...prev, sitePlanPreview]);
    }
    setCustomerData((prev) => ({ ...prev, SitePlan: {} as File }));
    setSitePlanPreview("");
  };

  /* ================= SUBMIT ================= */

  const handleSubmit = async () => {
    const formData = new FormData();

    // Append normal fields
    if (customerData.Campaign) formData.append("Campaign", customerData.Campaign?.name);
    if (customerData.CustomerType) formData.append("CustomerType", customerData.CustomerType?.name);
    if (customerData.customerName) formData.append("customerName", customerData.customerName);
    if (customerData.CustomerSubtype) formData.append("CustomerSubType", customerData.CustomerSubtype?.name);
    if (customerData.ContactNumber) formData.append("ContactNumber", trimCountryCodeHelper(customerData.ContactNumber));
    if (customerData.City) formData.append("City", customerData.City?.name);
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
    if (customerData.CustomerYear) formData.append("CustomerYear", customerData.CustomerYear);
    if (customerData.Price) formData.append("Price", customerData.Price);
    if (customerData.LeadType) formData.append("LeadType", customerData.LeadType);
    if (customerData.URL) formData.append("URL", customerData.URL);
    if (customerData.Other) formData.append("Other", customerData.Other);
    if (customerData.Description) formData.append("Description", customerData.Description);
    if (customerData.Video) formData.append("Video", customerData.Video);
    if (customerData.GoogleMap) formData.append("GoogleMap", customerData.GoogleMap);
    if (customerData.Verified) formData.append("Verified", customerData.Verified);

    // ✅ Append files correctly
    if (Array.isArray(customerData.CustomerImage)) {
      customerData.CustomerImage.forEach((file) => formData.append("CustomerImage", file));
    }

    if (customerData.SitePlan && (customerData.SitePlan as any).name) {
      formData.append("SitePlan", customerData.SitePlan);
    }

    // ✅ Add deletion info
    formData.append("removedCustomerImages", JSON.stringify(removedCustomerImages));
    formData.append("removedSitePlans", JSON.stringify(removedSitePlans));
    console.log(" removed siteplan ", removedSitePlans)

    formData.append("CustomerFields", JSON.stringify(customFields));



    const result = await updateCustomer(customerId as string, formData);

    if (result) {
      toast.success("Customer updated successfully!");
      onCustomerUpdated(result.data);
      onClose();
    } else {
      toast.error("Update failed");
    }
  };
  const dropdownOptions = ["Option1", "Option2", "Option3"];
  // Object-based fields (for ObjectSelect)
  const objectFields = [
    { key: "Campaign", fetchFn: getCampaign },
    { key: "CustomerType", staticData: [] },
    { key: "CustomerSubtype", staticData: [] },
    { key: "City", fetchFn: getCity },
    { key: "Location", staticData: [] },  // dependent
    { key: "SubLocation", staticData: [] }  // dependent

  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
    { key: "Verified", staticData: ["yes", "no"] },
    { key: "Gender", staticData: ["male", "female", "other"] },
    { key: "Facilities", fetchFn: getFacilities },
    { key: "ReferenceId", fetchFn: getReferences },
    { key: "Price", fetchFn: getPrice },
    { key: "LeadType", fetchFn: getLeadType }
  ];


  useEffect(() => {
    const loadFieldOptions = async () => {
      await handleFieldOptionsObject(objectFields, setFieldOptions);
      await handleFieldOptions(arrayFields, setFieldOptions);
    };
    loadFieldOptions();
  }, []);


  useEffect(() => {
    if (customerData.Campaign.id) {
      fetchCustomerType(customerData.Campaign.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, CustomerType: [] }));
    }

    if (customerData.Campaign.id && customerData.CustomerType.id) {
      fetchCustomerSubType(customerData.Campaign.id, customerData.CustomerType.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, CustomerSubtype: [] }));
    }

    if (customerData.City.id) {
      fetchLocation(customerData.City.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, Location: [] }));
    }
    if (customerData.City.id && customerData.Location.id) {
      fetchSubLocation(customerData.City.id, customerData.Location.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, SubLocation: [] }));
    }
  }, [customerData.Campaign.id, customerData.CustomerType.id, customerData.City.id, customerData.Location.id]);

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

  if (!isOpen) return null;
  if (loading) return null;

  return (
    <PopupMenu onClose={onClose} isOpen={isOpen}>
      <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div className="bg-white  max-sm:dark:bg-[var(--color-childbgdark)]  w-[1000px] max-w-full rounded-2xl shadow-xl max-h-[90vh] flex flex-col">

          {/* HEADER (Fixed) */}
          <div className="flex justify-between items-center border-b p-6">
            <h2 className="text-2xl font-bold max-sm:dark:text-[var(--color-primary)]">
              Edit Customer Information
            </h2>
            <button className=" max-sm:dark:text-white hover:bg-[var(--color-primary)] hover:text-white p-2 rounded-md cursor-pointer" onClick={onClose}>
              <X size={22} />
            </button>
          </div>

          {/* SCROLLABLE BODY */}
          <div className="flex-1 overflow-y-auto px-6 py-4">


            <div className="grid grid-cols-3 gap-6 max-xl:grid-cols-2 max-lg:grid-cols-1">
              {/*  <SingleSelect options={Array.isArray(fieldOptions?.Campaign)?fieldOptions.Campaign:[]} label="Campaign" value={customerData.Campaign} onChange={(v) => handleSelectChange("Campaign", v)} />
              <SingleSelect options={Array.isArray(fieldOptions?.CustomerType)?fieldOptions.CustomerType:[]} label="Customer Type" value={customerData.CustomerType} onChange={(v) => handleSelectChange("CustomerType", v)} /> */}
              <ObjectSelect
                options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                label={getLabel("Campaign", "Campaign")}
                value={customerData.Campaign.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      Campaign: { id: selectedObj._id, name: selectedObj.Name },
                      CustomerType: { id: "", name: "" }, // reset on change
                    }));
                  }
                }}
                error={errors.Campaign}
              />

              <ObjectSelect
                options={Array.isArray(fieldOptions?.CustomerType) ? fieldOptions.CustomerType : []}
                label={getLabel("CustomerType", "Customer Type")}
                value={customerData.CustomerType.name}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.CustomerType.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      CustomerType: { id: selectedObj._id, name: selectedObj.Name },
                      CustomerSubtype: { id: "", name: "" } // reset on change
                    }));
                  }
                }}
                error={errors.CustomerType}
              />

              <ObjectSelect
                options={Array.isArray(fieldOptions?.CustomerSubtype) ? fieldOptions.CustomerSubtype : []}
                label={getLabel("CustomerSubType", "Customer Subtype")}
                value={customerData.CustomerSubtype?.name}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.CustomerSubtype.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      CustomerSubtype: { id: selectedObj._id, name: selectedObj.Name },
                    }));
                  }
                }}
                error={errors.CustomerSubtype}
              />

              <InputField label={getLabel("customerName", "Customer Name")} name="customerName" value={customerData.customerName} onChange={handleInputChange} error={errors.CustomerName} />
              <InputField label={getLabel("ContactNumber", "Contact No")} name="ContactNumber" value={customerData.ContactNumber} onChange={handleInputChange} error={errors.ContactNumber} />
              <ObjectSelect
                options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                label={getLabel("City", "City")}
                value={customerData.City.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.City.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      City: { id: selectedObj._id, name: selectedObj.Name },
                      Location: { id: "", name: "" }, // reset on change
                      SubLocation: { id: "", name: "" } // reset on change
                    }));
                  }
                }}
                error={errors.City}
              />
              <ObjectSelect
                options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []}
                label={getLabel("Location", "Location")}
                value={customerData.Location.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.Location.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      Location: { id: selectedObj._id, name: selectedObj.Name },
                      SubLocation: { id: "", name: "" }, // reset on change
                    }));
                  }
                }}
                error={errors.Location}
                isSearchable
              />
              <ObjectSelect
                options={Array.isArray(fieldOptions?.SubLocation) ? fieldOptions.SubLocation : []}
                label={getLabel("SubLocation", "Sub Location")}
                value={customerData.SubLocation.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.SubLocation.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setCustomerData((prev) => ({
                      ...prev,
                      SubLocation: { id: selectedObj._id, name: selectedObj.Name },
                    }));
                  }
                }}
                error={errors.SubLocation}
                isSearchable
              />
              <InputField className=" max-sm:hidden" label={getLabel("Area", "Area")} name="Area" value={customerData.Area} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label={getLabel("Address", "Address")} name="Address" value={customerData.Address} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label={getLabel("Email", "Email")} name="Email" value={customerData.Email} onChange={handleInputChange} error={errors.Email} />
              <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.Facilities) ? fieldOptions.Facilities : []} label={getLabel("Facillities", "Facilites")} value={customerData.Facilities} onChange={(v) => handleSelectChange("Facilities", v)} />
              <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.ReferenceId) ? fieldOptions.ReferenceId : []} label={getLabel("ReferenceId", "Reference Id")} value={customerData.ReferenceId} onChange={(v) => handleSelectChange("ReferenceId", v)} />
              {/* <InputField className=" max-sm:hidden" label="Reference ID" name="ReferenceId" value={customerData.ReferenceId} onChange={handleInputChange} /> */}
              <InputField className=" max-sm:hidden" label={getLabel("CustomerId", "Customer ID")} name="CustomerId" value={customerData.CustomerId} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label={getLabel("ClientId", "Client ID")} name="ClientId" value={customerData.ClientId ?? ""} onChange={handleInputChange} />
              <div className=" max-sm:hidden">
                <DateSelector label={getLabel("CustomerDate", "Customer Date")} value={customerData.CustomerDate} onChange={(val) => handleSelectChange("CustomerDate", val)} />
              </div>
              <InputField className=" max-sm:hidden" label={getLabel("CustomerYear", "Customer Year")} name="CustomerYear" value={customerData.CustomerYear} onChange={handleInputChange} />
              {/*  <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.Price) ? fieldOptions.Price : []} label={getLabel("Price", "Price")} value={customerData.Price} onChange={(v) => handleSelectChange("Price", v)} /> */}
              <InputField className=" max-sm:hidden" label={getLabel("Price", "Price")} name="Price" value={customerData.Price ?? ""} onChange={handleInputChange} />
              <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.LeadType) ? fieldOptions.LeadType : []} label={getLabel("LeadType", "LeadType")} value={customerData.LeadType} onChange={(v: any) => handleSelectChange("LeadType", v)} />
              <InputField className=" max-sm:hidden" label={getLabel("URL", "URL")} name="URL" value={customerData.URL ?? ""} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label={getLabel("Other", "Others")} name="Other" value={customerData.Other} onChange={handleInputChange} />
              <TextareaField label={getLabel("Description", "Description")} name="Description" value={customerData.Description} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label={getLabel("Video", "Video")} name="Video" value={customerData.Video} onChange={handleInputChange} />
              <InputField className=" max-sm:hidden" label={getLabel("GoogleMap", "Google Map")} name="GoogleMap" value={customerData.GoogleMap} onChange={handleInputChange} />
              <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.Verified) ? fieldOptions.Verified : []} label={getLabel("Verified", "Verified")} value={customerData.Verified} onChange={(v) => handleSelectChange("Verified", v)} />

            </div>

            <div className=" sm:flex flex-wrap my-5 gap-5">
              <FileUpload label={getLabel("CustomerImage", "Customer Images")} multiple onChange={(e) => handleFileChange(e, "CustomerImage")} previews={imagePreviews} onRemove={handleRemoveImage} />
              <FileUpload label={getLabel("SitePlan", "Site Plan")} onChange={(e) => handleFileChange(e, "SitePlan")} previews={sitePlanPreview ? [sitePlanPreview] : []} onRemove={() => handleRemoveSitePlan()} />
            </div>
            <div className=" mt-10 w-full">
              <h2 className="text-xl font-semibold text-gray-700 mb-4 ">
                Additional Information
              </h2>
              <div className=" grid grid-cols-3 gap-6 max-lg:grid-cols-1 my-6">
                {Object.keys(customFields).map((key) => (
                  <InputField
                    key={key}
                    className="max-sm:hidden"
                    label={key}
                    name={key}
                    value={customFields[key]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                      handleCustomInputChange(key, e.target.value)
                    }
                  />
                ))}
              </div>

            </div>


          </div>

          {/* FOOTER (Fixed) */}
          <div className="border-t p-6 flex justify-end">
            <SaveButton text="Update" onClick={handleSubmit} />
          </div>

        </div>
      </div>
    </PopupMenu>
  );
}


// File upload with preview and remove
const FileUpload: React.FC<{
  label: string;
  multiple?: boolean;
  previews?: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove?: (index: number) => void;
}> = ({ label, multiple, previews = [], onChange, onRemove }) => (
  <div className="flex flex-col">
    <label className="font-semibold text-gray-700 max-sm:dark:text-gray-400 mb-2">{label}</label>
    <input
      type="file"
      multiple={multiple}
      onChange={onChange}
      className="border border-gray-300 max-sm:dark:border-gray-700 max-sm:dark:text-gray-400 rounded-md p-2"
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
