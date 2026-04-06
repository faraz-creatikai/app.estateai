'use client'

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";
import toast, { Toaster } from "react-hot-toast";
import DateSelector from "@/app/component/DateSelector";
import { useRouter } from "next/navigation";
import { addContact, getFilteredContact } from "@/store/contact";
import { contactAllDataInterface } from "@/store/contact.interface";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getCampaign } from "@/store/masters/campaign/campaign";
import { getContactType, getContactTypeByCampaign } from "@/store/masters/contacttype/contacttype";
import { getCity } from "@/store/masters/city/city";
import { getLocation, getLocationByCity } from "@/store/masters/location/location";
import { getIndustries } from "@/store/masters/industries/industries";
import { getFunctionalAreas } from "@/store/masters/functionalarea/functionalarea";
import { getReferences } from "@/store/masters/references/references";
import { InputField } from "@/app/component/InputField";
import TextareaField from "@/app/component/datafields/TextareaField";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import ObjectSelect from "@/app/component/ObjectSelect";
import { getContactCampaign } from "@/store/masters/contactcampaign/contactcampaign";

interface ErrorInterface {
  [key: string]: string; // dynamic key type for any field
}

export default function ContactAdd() {
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

  const [errors, setErrors] = useState<ErrorInterface>({});
  const router = useRouter();
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});



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

  const validateForm = () => {
    const newErrors: ErrorInterface = {};

    if (!contactData.Name.trim()) newErrors.Name = "Name is required";
    if (contactData.Email.trim() && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(contactData.Email)) newErrors.Email = "Invalid email format";

    return newErrors;
  };

  const handleSubmit = async () => {
    const duplicate = await isContactNoExist(contactData.ContactNo);
    if (duplicate) return;
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...contactData,
      Campaign: contactData.Campaign?.name,
      ContactType: contactData.ContactType?.name,
      City: contactData.City?.name,
      Location: contactData.Location?.name
    };
    if (contactData.date === "") delete (payload as any).date;

    const data = await addContact(payload);
    if (data) {
      toast.success("Contact added successfully!");
      setContactData({
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
      setErrors({});
      router.push("/contact");
      return;
    }
    toast.error("Failed to add contact");
  };



  // Object-based fields (for ObjectSelect)
  const objectFields = [
    { key: "Campaign", fetchFn: getContactCampaign },
    { key: "ContactType", staticData: [] },
    { key: "City", fetchFn: getCity },
    { key: "Location", staticData: [] }
  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
    { key: "Status", staticData: ["Active", "Inactive"] },
    { key: "ContactIndustry", fetchFn: getIndustries },
    { key: "ContactFunctionalArea", fetchFn: getFunctionalAreas },
    { key: "ReferenceId", fetchFn: getReferences },
  ];

  useEffect(() => {
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

    if (contactData.City.id) {
      fetchLocation(contactData.City.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, Location: [] }));
    }


  }, [contactData.Campaign.id, contactData.City.id]);

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

  const isContactNoExist = async (contactNo: string) => {
    if (contactNo.trim().length > 0 && contactNo.trim().length < 10) {
      setErrors((prev) => ({
        ...prev,
        ContactNo: "Contact No should at least 10 digits",
      }));
      return true;
    }
    if(contactNo.trim().length === 0){
      return false;
    }
    
    const res = await getFilteredContact(`Keyword=${contactNo}`);
    const isExist = res.length;

    if (isExist && isExist > 0) {
      setErrors((prev) => ({
        ...prev,
        ContactNo: "Contact No already exists",
      }));
      return true;
    }

    return false;
  };


  // Dropdown data
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

        <div className="bg-white/90 max-sm:dark:bg-[var(--color-childbgdark)] backdrop-blur-lg w-full p-10 max-sm:px-5 rounded-3xl shadow-2xl h-auto">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-8 text-left border-b pb-4 border-gray-200 max-sm:dark:border-gray-700">
              <h1 className="text-3xl  max-sm:text-2xl font-extrabold text-[var(--color-secondary-darker)] leading-tight tracking-tight">
                Add <span className="text-[var(--color-primary)]">Contact</span>
              </h1>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
                <ObjectSelect
                  options={Array.isArray(fieldOptions?.Campaign) ? fieldOptions.Campaign : []}
                  label="Campaign"
                  value={contactData.Campaign.id}
                  getLabel={(item) => item?.Name || ""}
                  getId={(item) => item?._id || ""}
                  onChange={(selectedId) => {
                    const selectedObj = fieldOptions.Campaign.find((i) => i._id === selectedId);
                    if (selectedObj) {
                      setContactData((prev) => ({
                        ...prev,
                        Campaign: { id: selectedObj._id, name: selectedObj.Name },
                        ContactType: { id: "", name: "" }, // reset on change
                      }));
                    }
                  }}
                  error={errors.Campaign}
                />

                <ObjectSelect
                  options={Array.isArray(fieldOptions?.ContactType) ? fieldOptions.ContactType : []}
                  label="Contact Type"
                  value={contactData.ContactType.id}
                  getLabel={(item) => item?.Name || ""}
                  getId={(item) => item?._id || ""}
                  onChange={(selectedId) => {
                    const selectedObj = fieldOptions.ContactType.find((i) => i._id === selectedId);
                    if (selectedObj) {
                      setContactData((prev) => ({
                        ...prev,
                        ContactType: { id: selectedObj._id, name: selectedObj.Name },
                      }));
                    }
                  }}
                  error={errors.ContactType}
                />

                <InputField label="Contact Name" name="Name" value={contactData.Name} onChange={handleInputChange} error={errors.Name} />
                <ObjectSelect
                  options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                  label="City"
                  value={contactData.City.id}
                  getLabel={(item) => item?.Name || ""}
                  getId={(item) => item?._id || ""}
                  onChange={(selectedId) => {
                    const selectedObj = fieldOptions.City.find((i) => i._id === selectedId);
                    if (selectedObj) {
                      setContactData((prev) => ({
                        ...prev,
                        City: { id: selectedObj._id, name: selectedObj.Name },
                        Location: { id: "", name: "" }, // reset on change
                      }));
                    }
                  }}
                  error={errors.City}
                />
                <ObjectSelect
                  options={Array.isArray(fieldOptions?.Location) ? fieldOptions.Location : []}
                  label="Location"
                  value={contactData.Location.id}
                  getLabel={(item) => item?.Name || ""}
                  getId={(item) => item?._id || ""}
                  onChange={(selectedId) => {
                    const selectedObj = fieldOptions.Location.find((i) => i._id === selectedId);
                    if (selectedObj) {
                      setContactData((prev) => ({
                        ...prev,
                        Location: { id: selectedObj._id, name: selectedObj.Name },
                      }));
                    }
                  }}
                  error={errors.Location}
                />
                <InputField label="Contact No" name="ContactNo" value={contactData.ContactNo} onChange={handleInputChange} error={errors.ContactNo} />
                <InputField label="Email" name="Email" value={contactData.Email} onChange={handleInputChange} error={errors.Email} />
                <InputField className=" max-sm:hidden" label="Company Name" name="CompanyName" value={contactData.CompanyName} onChange={handleInputChange} />
                <InputField className=" max-sm:hidden" label="Website" name="Website" value={contactData.Website} onChange={handleInputChange} />
                <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.Status) ? fieldOptions.Status : []} label="Status" value={contactData.Status} onChange={(s) => handleSelectChange("Status", s)} />
                <InputField className=" max-sm:hidden" label="Address" name="Address" value={contactData.Address} onChange={handleInputChange} />
                <div className=" max-sm:hidden">
                  <DateSelector label="Date" value={contactData.date} onChange={(val) => handleSelectChange("date", val)} />
                </div>
                <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.ContactIndustry) ? fieldOptions.ContactIndustry : []} label="Contact Industry" value={contactData.ContactIndustry} onChange={(s) => handleSelectChange("ContactIndustry", s)} />
                <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.ContactFunctionalArea) ? fieldOptions.ContactFunctionalArea : []} label="Contact Functional Area" value={contactData.ContactFunctionalArea} onChange={(s) => handleSelectChange("ContactFunctionalArea", s)} />
                <SingleSelect className=" max-sm:hidden" options={Array.isArray(fieldOptions?.ReferenceId) ? fieldOptions.ReferenceId : []} label="Reference Id" value={contactData.ReferenceId} onChange={(s) => handleSelectChange("ReferenceId", s)} />
                <TextareaField label="Notes" name="Notes" value={contactData.Notes} onChange={handleInputChange} />
              </div>

              <div className="flex justify-end mt-4">

                <SaveButton text="Save" onClick={handleSubmit} />

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}



