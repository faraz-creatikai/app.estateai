'use client';

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft, X } from "lucide-react";
import { useRouter } from "next/navigation";
import SingleSelect from "@/app/component/SingleSelect";
import { companyprojectAllDataInterface } from "@/store/companyproject/companyproject.interface";
import { addCompanyProjects } from "@/store/companyproject/companyproject";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";
import { getCity } from "@/store/masters/city/city";
import { getLocationByCity } from "@/store/masters/location/location";
import ObjectSelect from "@/app/component/ObjectSelect";
import { getAmenities } from "@/store/masters/amenities/amenities";


interface ErrorInterface {
  [key: string]: string;
}

export default function CompanyProjectAdd() {
  const [projectData, setProjectData] = useState<companyprojectAllDataInterface>({
    ProjectName: "",
    ProjectType: "",
    ProjectStatus: "",
    City: { id: "", name: "" },
    Location: { id: "", name: "" },
    Area: "",
    Range: "",
    Adderess: "",
    Facillities: "",
    Amenities: "",
    Description: "",
    Video: "",
    GoogleMap: "",
    CustomerImage: [],
    SitePlan: {} as File
  });

  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [sitePlanPreview, setSitePlanPreview] = useState<string>("");
  const [errors, setErrors] = useState<ErrorInterface>({});
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});
  const router = useRouter();



  // Input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setProjectData(prev => ({ ...prev, [name]: value }));
      setErrors(prev => ({ ...prev, [name]: "" }));
    },
    []
  );

  const handleSelectChange = useCallback((label: string, value: string) => {
    setProjectData(prev => ({ ...prev, [label]: value }));
    setErrors(prev => ({ ...prev, [label]: "" }));
  }, []);

  // File change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const files = e.target.files;
    if (!files) return;

    if (field === "CustomerImage") {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setProjectData(prev => ({ ...prev, CustomerImage: [...prev.CustomerImage, ...newFiles] }));
      setImagePreviews(prev => [...prev, ...newPreviews]);
    } else if (field === "SitePlan") {
      const file = files[0];
      setProjectData(prev => ({ ...prev, SitePlan: file }));
      setSitePlanPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (index: number) => {
    setProjectData(prev => ({
      ...prev,
      CustomerImage: prev.CustomerImage.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleRemoveSitePlan = () => {
    setProjectData(prev => ({ ...prev, SitePlan: {} as File }));
    setSitePlanPreview("");
  };

  // Validation
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!projectData.ProjectName.trim()) newErrors.ProjectName = "Project Name is required";
    if (!projectData.ProjectType.trim()) newErrors.ProjectType = "Project Type is required";
    if (!projectData.ProjectStatus.trim()) newErrors.ProjectStatus = "Project Status is required";
    return newErrors;
  };

  // Submit
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      Object.entries(projectData).forEach(([key, value]) => {
        if(key==="City" || key==="Location"){
          return;
        }
        if (key === "CustomerImage" && Array.isArray(value)) {
          value.forEach(file => formData.append("CustomerImage", file));
        } else if (key === "SitePlan" && (value as File)?.name) {
          formData.append("SitePlan", value as File);
        } else if (value) {
          formData.append(key, value as string);
        }
      });

      formData.append("City",projectData.City?.name);
      formData.append("Location",projectData.Location?.name);

      const result = await addCompanyProjects(formData);
      if (result) {
        toast.success("Company project added successfully!");
        router.push("/company_project");
      } else {
        toast.error("Failed to add company project");
      }
    } catch (error) {
      toast.error("Error adding company project");
      console.error("Add Error:", error);
    }
  };

  const objectFields = [
    { key: "City", fetchFn: getCity }
  ];

  // Simple array fields (for normal Select)
  const arrayFields = [
    { key: "ProjectType", staticData: ["Villa", "Apartment", "Township"] },
    { key: "ProjectStatus", staticData: ["Ready to Move", "Under Construction"] },
    { key: "Amenities", fetchFn: getAmenities}
  ];

  useEffect(() => {
    const loadFieldOptions = async () => {
      await handleFieldOptionsObject(objectFields, setFieldOptions);
      await handleFieldOptions(arrayFields, setFieldOptions);
    };
    loadFieldOptions();
  }, []);

  useEffect(() => {

    if (projectData.City.id) {
      fetchLocation(projectData.City.id);
    } else {
      setFieldOptions((prev) => ({ ...prev, Location: [] }));
    }
    console.log("nicename",fieldOptions.Amenities)

  }, [projectData.City.id]);

  const fetchLocation = async (cityId: string) => {
    try {

      const res = await getLocationByCity(cityId);
      setFieldOptions((prev) => ({ ...prev, Location: res || [] }));
    } catch (error) {
      console.error("Error fetching location:", error);
      setFieldOptions((prev) => ({ ...prev, Location: [] }));
    }
  };

  const dropdownOptions = ["Residential", "Commercial", "Industrial"];

  return (
    <div className=" min-h-screen flex justify-center">
      <Toaster position="top-right" />
      <div className="w-full">
        <div className="flex justify-end mb-4">

          <BackButton
            url="/company_project"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
        </div>

        <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl h-auto">
          <form onSubmit={e => e.preventDefault()} className="w-full">
            <div className="mb-8 text-left border-b pb-4 border-gray-200">
              <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)]">
                Add <span className="text-[var(--color-primary)]">Company Project</span>
              </h1>
            </div>

            <div className="grid grid-cols-3 gap-6 max-lg:grid-cols-1">
              <InputField label="Project Name" name="ProjectName" value={projectData.ProjectName} onChange={handleInputChange} error={errors.ProjectName} />
              <SingleSelect options={Array.isArray(fieldOptions?.ProjectType) ? fieldOptions.ProjectType : []} label="Project Type" value={projectData.ProjectType} onChange={v => handleSelectChange("ProjectType", v)} error={errors.ProjectType} />
              <SingleSelect options={Array.isArray(fieldOptions?.ProjectStatus) ? fieldOptions.ProjectStatus : []} label="Project Status" value={projectData.ProjectStatus} onChange={v => handleSelectChange("ProjectStatus", v)} error={errors.ProjectStatus} />

              <ObjectSelect
                options={Array.isArray(fieldOptions?.City) ? fieldOptions.City : []}
                label="City"
                value={projectData.City.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.City.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setProjectData((prev) => ({
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
                value={projectData.Location.id}
                getLabel={(item) => item?.Name || ""}
                getId={(item) => item?._id || ""}
                onChange={(selectedId) => {
                  const selectedObj = fieldOptions.Location.find((i) => i._id === selectedId);
                  if (selectedObj) {
                    setProjectData((prev) => ({
                      ...prev,
                      Location: { id: selectedObj._id, name: selectedObj.Name },
                    }));
                  }
                }}
                error={errors.Location}
              />
              <InputField label="Area" name="Area" value={projectData.Area} onChange={handleInputChange} />

              <InputField label="Range" name="Range" value={projectData.Range} onChange={handleInputChange} />
              <InputField label="Address" name="Adderess" value={projectData.Adderess} onChange={handleInputChange} />
              <InputField label="Facilities" name="Facillities" value={projectData.Facillities} onChange={handleInputChange} />
              <SingleSelect options={Array.isArray(fieldOptions?.Amenities) ? fieldOptions.Amenities : []} label="Amenities" value={projectData.Amenities} onChange={v => handleSelectChange("Amenities", v)} error={errors.Amenities} />

             
              <TextareaField label="Description" name="Description" value={projectData.Description} onChange={handleInputChange} />
              <InputField label="Video URL" name="Video" value={projectData.Video} onChange={handleInputChange} />
              <InputField label="Google Map URL" name="GoogleMap" value={projectData.GoogleMap} onChange={handleInputChange} />

              <FileUpload label="Project Images" multiple previews={imagePreviews} onChange={e => handleFileChange(e, "CustomerImage")} onRemove={handleRemoveImage} />
              <FileUpload label="Site Plan" previews={sitePlanPreview ? [sitePlanPreview] : []} onChange={e => handleFileChange(e, "SitePlan")} onRemove={handleRemoveSitePlan} />
            </div>

            <div className="flex justify-end mt-4">

              <SaveButton text="Save" onClick={handleSubmit} />

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


