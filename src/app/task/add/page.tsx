"use client";

import React, { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import "react-toastify/dist/ReactToastify.css";
import { ArrowLeft } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation"; 
import {toast, Toaster } from "react-hot-toast";
import { TaskType } from "@/store/task.interface";
import { addTask } from "@/store/task";
import { handleFieldOptions } from "@/app/utils/handleFieldOptions";
import { getAllAdmins } from "@/store/auth";
import BackButton from "@/app/component/buttons/BackButton";
import SaveButton from "@/app/component/buttons/SaveButton";



const AddPage: React.FC = () => {
  const router = useRouter();

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AddPageInner router={router} />
    </Suspense>
  );
};

// Inner component uses useSearchParams
const AddPageInner: React.FC<{ router: any }> = ({ router }) => {
  const [formData, setFormData] = useState<TaskType>({
    date: "",
    Time: "",
    Description: "",
    User: "",
  });

  const searchParams = useSearchParams(); // ✅ Safe now
  const id = searchParams.get("id");
  const API_URL = "https://live-project-backend-viiy.onrender.com/api/sch";
  const [fieldOptions, setFieldOptions] = useState<Record<string, any[]>>({});

  useEffect(()=>{
    fetchFields();
  },[])

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSave = useCallback(async () => {
    if (!formData.date || !formData.Time || !formData.Description || !formData.User) {
      toast.error("Please fill all fields before saving!");
      return;
    }

    const data = await addTask(formData);
        if (data) {
          toast.success("Task Added Successfully!");
          setFormData({ date: "", Time: "", Description: "", User: "" });
          router.push("/task");
          return;
        }
        toast.error("Something went wrong. Try again.");
  }, [formData, router]);

  const fetchFields = async () => {
        await handleFieldOptions(
          [
            { key: "User", fetchFn: getAllAdmins },
          ],
          setFieldOptions
        );
      };

  return (
    <div className="min-h-screen">
      <Toaster position="top-right" />
      {/* Back Button */}
      <div className="flex justify-end mb-4">
        <BackButton
            url="/task"
            text="Back"
            icon={<ArrowLeft size={18} />}
          />
      </div>

      {/* Form Card */}
      <div className="flex justify-center">
        <div className="bg-white max-sm:dark:bg-[var(--color-childbgdark)] max-sm:dark:text-white backdrop-blur-lg p-10 max-sm:px-5 max-sm:py-7 rounded-3xl shadow-2xl h-auto w-full">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="mb-8 text-left border-b pb-4 border-gray-200 max-sm:dark:border-gray-700">
              <h1 className="text-3xl font-extrabold text-[var(--color-secondary-darker)]  max-sm:dark:text-[var(--color-primary)] leading-tight tracking-tight">
                {id ? "Edit" : "Add"} <span className="text-[var(--color-primary)]">Task</span>
              </h1>
            </div>

            <div className="flex flex-col space-y-6">
              {/* Date and Time */}
              <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
                <div className="flex flex-col flex-1">
                  <label className="mb-1 font-semibold text-gray-700 max-sm:dark:text-gray-300">Task Date</label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="mb-1 font-semibold text-gray-700 max-sm:dark:text-gray-300">Tast Time</label>
                  <input
                    type="time"
                    name="Time"
                    value={formData.Time}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              </div>

              {/* Description and User */}
              <div className="flex flex-col md:flex-row md:space-x-6 space-y-4 md:space-y-0">
                <div className="flex flex-col flex-1">
                  <label className="mb-1 font-semibold text-gray-700 max-sm:dark:text-gray-300">Description</label>
                  <textarea
                    name="Description"
                    value={formData.Description}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div className="flex flex-col flex-1">
                  <label className="mb-1 font-semibold text-gray-700 max-sm:dark:text-gray-300">User</label>
                  <select
                    name="User"
                    value={formData.User}
                    onChange={handleChange}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="">Select User</option>
                    {
                      Array.isArray(fieldOptions?.User) ?fieldOptions.User.map((e,i)=><option key={e+i} value={e}>{e}</option>):null
                    }
                  </select>
                </div>
              </div>

              {/* Save / Go to Schedule Button */}
              <div className="flex justify-end">
               
                <SaveButton text="Save" onClick={handleSave} />

              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPage;
