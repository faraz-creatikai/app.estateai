'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, X } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { getBuilderslidersById, updateBuildersliders } from "@/store/masters/buildersliders/buildersliders";
import { builderslidersGetDataInterface } from "@/store/masters/buildersliders/buildersliders.interface";
import SingleSelect from "@/app/component/SingleSelect";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

interface ErrorInterface {
  [key: string]: string;
}

export default function BuilderSliderEdit() {
  const { id } = useParams();
  const router = useRouter();

  const [sliderData, setSliderData] = useState<builderslidersGetDataInterface>({
    _id: "",
    Image: "",
    Status: "",
  });

  const [newImage, setNewImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  // 🆕 Track removed old image
  const [removedOldImage, setRemovedOldImage] = useState<string[]>([]);

  const [errors, setErrors] = useState<ErrorInterface>({});
  const [loading, setLoading] = useState(true);
   const fileInputRef = useRef<HTMLInputElement | null>(null);
  

  // 🟩 Fetch builder slider by ID
  useEffect(() => {
    const fetchSlider = async () => {
      try {
        const data = await getBuilderslidersById(id as string);
        if (data) {
          setSliderData(data);
          setImagePreview(data.Image[0]); // existing image
        } else {
          toast.error("Builder Slider not found");
        }
      } catch (error) {
        toast.error("Error fetching slider details");
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchSlider();
  }, [id]);

  // 🟩 Dropdown handler
  const handleSelectChange = useCallback((label: string, selected: string) => {
    setSliderData((prev) => ({ ...prev, [label]: selected }));
    setErrors((prev) => ({ ...prev, [label]: "" }));
  }, []);

  // 🟩 Handle file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setNewImage(file);
    setImagePreview(URL.createObjectURL(file));

    // If user uploads a new image → old image becomes removed
    if (typeof sliderData.Image === "string" && sliderData.Image.startsWith("http")) {

      setRemovedOldImage([sliderData.Image]); // ✔️ Wrap inside array
    }

  };

  // 🟩 Remove current image
  const handleRemoveImage = () => {
    if (imagePreview?.startsWith("http")) {
      setRemovedOldImage((prev) => [...prev, imagePreview]);
    }


    setNewImage(null);
    setImagePreview("");
          if (fileInputRef.current) {
    fileInputRef.current.value = "";
  }

  };

  // 🟩 Validations
  const validateForm = () => {
    const newErrors: ErrorInterface = {};
    if (!sliderData.Status.trim()) newErrors.Status = "Status is required";
    // IMAGE REQUIRED VALIDATION
    const noImage =
      (!imagePreview || imagePreview.trim() === "") && !newImage;

    if (noImage) {
      newErrors.Image = "Slider Image is required";
    }
    return newErrors;
  };

  // 🟩 Submit
  const handleSubmit = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("Status", sliderData.Status);

      // Upload new image (if user selected)
      if (newImage) {
        formData.append("Image", newImage);
      }

      // 🆕 Send removed old image
      if (removedOldImage) {
        formData.append("removedImages", JSON.stringify(removedOldImage));
      }

      const result = await updateBuildersliders(id as string, formData);

      if (result) {
        toast.success("Builder Slider updated successfully!");
        router.push("/masters/builder-sliders");
      } else {
        toast.error("Failed to update slider");
      }
    } catch (error) {
      toast.error("Error updating slider");
    }
  };

  const statusOptions = ["Active", "Inactive"];

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-600">
        Loading slider details...
      </div>
    );

  return (
    <MasterProtectedRoute>
      <div className="min-h-screen flex justify-center">
        <Toaster position="top-right" />

        <div className="w-full max-w-2xl">
          {/* Back Button */}
          <div className="flex justify-end mb-4">
            <BackButton
              url="/masters/builder-sliders"
              text="Back"
              icon={<ArrowLeft size={18} />}
            />
          </div>

          {/* Card */}
          <div className="bg-white/90 backdrop-blur-lg p-10 w-full rounded-3xl shadow-2xl">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-8 border-b pb-4">
                <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)]">
                  Edit <span className="text-[var(--color-primary)]">Builder Slider</span>
                </h1>
              </div>

              {/* Fields */}
              <div className="flex flex-col space-y-6">
                <SingleSelect
                  options={statusOptions}
                  label="Status"
                  value={sliderData.Status}
                  onChange={(v) => handleSelectChange("Status", v)}
                />

                {/* Image Upload */}
                <div className="flex flex-col">
                  <label className="font-semibold text-gray-700 mb-2">Slider Image</label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="border border-gray-300 rounded-md p-2"
                  />
                  {errors.Image && (
                    <p className="text-red-600 text-sm mt-1">{errors.Image}</p>
                  )}


                  {imagePreview && (
                    <div className="relative mt-3 w-48 h-48">
                      <img
                        src={imagePreview}
                        alt="preview"
                        className="w-full h-full object-cover rounded-md border"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}

                </div>

                {/* Submit */}
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
