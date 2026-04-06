'use client';

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import SingleSelect from "@/app/component/SingleSelect";
import ObjectSelect from "@/app/component/ObjectSelect";

import {
  subLocationAllDataInterface,
  subLocationGetDataInterface,
} from "@/store/masters/sublocation/sublocation.interface";
import { getsubLocationById, updatesubLocation } from "@/store/masters/sublocation/sublocation";
import { getCity } from "@/store/masters/city/city";
import { getLocationByCity } from "@/store/masters/location/location";
import { handleFieldOptionsObject } from "@/app/utils/handleFieldOptionsObject";

interface ErrorInterface {
  [key: string]: string;
}

export default function SubLocationEdit() {
  const { id } = useParams();
  const router = useRouter();

  const [subLocationData, setSubLocationData] = useState<subLocationAllDataInterface>({
    Name: "",
    Status: "",
    City: "",
    Location: "",
  });

  const [fieldOptions, setFieldOptions] = useState<{ City?: any[]; Location?: any[]; Status?: string[] }>({});
  const [errors, setErrors] = useState<ErrorInterface>({});
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch initial SubLocation and fields
  useEffect(() => {
    if (!id) return;

    const fetchSubLocation = async () => {
      try {
        const data: subLocationGetDataInterface | null = await getsubLocationById(id as string);
        if (data) {
          setSubLocationData({
            Name: data.Name,
            Status: data.Status,
            City: data.City?._id || "",
            Location: data.Location?._id || "",
          });
        } else {
          toast.error("SubLocation not found");
        }
      } catch (error) {
        toast.error("Error fetching SubLocation details");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubLocation();
    fetchInitialFields();
  }, [id]);

  // 🔹 Fetch City & Status options
  const fetchInitialFields = async () => {
    await handleFieldOptionsObject(
      [
        { key: "Status", staticData: ["Active", "Inactive"] },
        { key: "City", fetchFn: getCity },
      ],
      setFieldOptions
    );
  };

  // 🔹 Fetch Locations when City changes
  useEffect(() => {
    if (!subLocationData.City) return;

    const fetchLocations = async () => {
      const locations = await getLocationByCity(subLocationData.City);
      setFieldOptions((prev) => ({ ...prev, Location: locations || [] }));
    };

    fetchLocations();
  }, [subLocationData.City]);

  // 🔹 Handle Input change
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setSubLocationData((prev) => ({ ...prev, [name]: value }));
      setErrors((prev) => ({ ...prev, [name]: "" }));
    },
    []
  );

  // 🔹 Validate form
  const validateForm = (): ErrorInterface => {
    const newErrors: ErrorInterface = {};
    if (!subLocationData.Name.trim()) newErrors.Name = "SubLocation Name is required";
    if (!subLocationData.City) newErrors.City = "City is required";
    if (!subLocationData.Location) newErrors.Location = "Location is required";
    if (!subLocationData.Status) newErrors.Status = "Status is required";
    return newErrors;
  };

  // 🔹 Submit update
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors);
      return;
    }

    try {
      const result = await updatesubLocation(id as string, subLocationData);
      if (result) {
        toast.success("SubLocation updated successfully!");
        router.push("/masters/sublocation");
      } else {
        toast.error("Failed to update SubLocation");
      }
    } catch (error) {
      toast.error("Failed to update SubLocation");
      console.error(error);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading SubLocation details...
      </div>
    );

  return (
    <MasterProtectedRoute>
      <div className="min-h-screen flex justify-center">
        <Toaster position="top-right" />
        <div className="w-full">
          {/* Back */}
          <div className="flex justify-end mb-4">
            <BackButton
              url="/masters/sublocations"
              text="Back"
              icon={<ArrowLeft size={18} />}
            />
          </div>

          {/* Form */}
          <div className="bg-white/90 backdrop-blur-lg p-10 rounded-3xl shadow-2xl">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold">
                  Edit <span className="text-[var(--color-primary)]">SubLocation</span>
                </h1>
              </div>

              <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                {/* Name */}
                <InputField
                  label="SubLocation Name"
                  name="Name"
                  value={subLocationData.Name}
                  onChange={handleInputChange}
                  error={errors.Name}
                />

                {/* City */}
                <ObjectSelect
                  label="City"
                  options={fieldOptions.City || []}
                  value={subLocationData.City}
                  getLabel={(item) => item?.Name}
                  getId={(item) => item?._id}
                  onChange={(v) => {
                    setSubLocationData({ ...subLocationData, City: v, Location: "" });
                    setErrors({ ...errors, City: "" });
                  }}
                  error={errors.City}
                />

                {/* Location */}
                <ObjectSelect
                  label="Location"
                  options={fieldOptions.Location || []}
                  value={subLocationData.Location}
                  getLabel={(item) => item?.Name}
                  getId={(item) => item?._id}
                  onChange={(v) => {
                    setSubLocationData({ ...subLocationData, Location: v });
                    setErrors({ ...errors, Location: "" });
                  }}
                  error={errors.Location}
                />

                {/* Status */}
                <SingleSelect
                  label="Status"
                  options={["Active", "Inactive"]}
                  value={subLocationData.Status}
                  onChange={(v) => setSubLocationData({ ...subLocationData, Status: v })}
                />
              </div>

              {/* Update */}
              <div className="flex justify-end mt-6">
                <SaveButton text="Update" onClick={handleSubmit} />
              </div>
            </form>
          </div>
        </div>
      </div>
    </MasterProtectedRoute>
  );
}

// 🔹 Reusable Input Field
const InputField: React.FC<{
  label: string;
  name: string;
  value: string;
  error?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
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
    <p
      className={`absolute left-2 bg-white px-1 text-gray-500 text-sm transition-all duration-300
      ${value || error ? "-top-2 text-xs text-blue-500" : "peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-focus:-top-2 peer-focus:text-xs peer-focus:text-blue-500"}`}
    >
      {label}
    </p>
    {error && <span className="text-red-500 text-sm mt-1 block">{error}</span>}
  </label>
);
