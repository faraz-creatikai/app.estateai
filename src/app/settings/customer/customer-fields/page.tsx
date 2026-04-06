"use client";

import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import SaveButton from "@/app/component/buttons/SaveButton";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";
import { getCustomerFieldLabel, updateCustomerFieldLabel } from "@/store/settings/customer/customerfields/customerfields";
import { useCustomerFieldLabel } from "@/context/customer/CustomerFieldLabelContext";


const CUSTOMER_FIELD_KEYS = [
    "Campaign",
    "CustomerType",
    "CustomerSubType",
    "customerName",
    "LeadType",
    "ContactNumber",
    "Email",
    "City",
    "Location",
    "SubLocation",
    "Area",
    "Address",
    "Facillities",
    "ReferenceId",
    "CustomerId",
    "Price",
    "CustomerDate",
    "CustomerYear",
    "URL",
    "GoogleMap",
    "Description",
    "Video",
    "Verified",
    "CustomerImage",
    "SitePlan",
    "AssignTo",
    "Other",
];

interface FieldRow {
    fieldKey: string;
    displayLabel: string;
}

export default function CustomerFields() {
    const [fields, setFields] = useState<FieldRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [customizedFieldCount, setCustomizedFieldCount] = useState(0);
    const { updateLabel } = useCustomerFieldLabel();

    // 🔹 Load saved labels
    useEffect(() => {
        const init = async () => {
            const savedLabels = await getCustomerFieldLabel(); // { key: label }

            const merged = CUSTOMER_FIELD_KEYS.map((key) => ({
                fieldKey: key,
                displayLabel: savedLabels?.[key] ?? "",
            }));

            setFields(merged);

            console.log("Merged Fields: ", merged);
            setLoading(false);
        };

        init();
    }, []);

    const handleChange = (index: number, value: string) => {
        const updated = [...fields];
        updated[index].displayLabel = value;
        setFields(updated);
    };

    const handleSave = async () => {
        const payload = fields.map((f) => ({
            fieldKey: f.fieldKey,
            displayLabel: f.displayLabel.trim(),
        }));

        const res = await updateCustomerFieldLabel(payload);

        if (res) {
            toast.success("Customer fields updated successfully");
            setCustomizedFieldCount(fields.filter(f => f.displayLabel).length);
            fields.forEach((f) => {
                updateLabel(f.fieldKey, f.displayLabel.trim());
            });
        }
        else toast.error("Failed to update fields");
    };

    if (loading) return <div>Loading...</div>;

    return (
        <MasterProtectedRoute>
            <div className="min-h-screen w-full flex flex-col justify-center items-start">
                <Toaster position="top-right" />

                <div className="w-full  bg-white p-10 max-md:p-5 rounded-3xl shadow-2xl">
                    <div className=" mb-10">
                        <h1 className="text-4xl font-bold text-[var(--color-secondary-darker)] mb-2">
                            Customize{' '}
                            <span className="bg-gradient-to-r from-[var(--color-primary)] to-blue-600 bg-clip-text text-transparent">
                                Customer Fields
                            </span>
                        </h1>
                        <p className="text-slate-600">
                            Personalize field labels to match your business needs
                        </p>
                    </div>

                    <div className="grid grid-cols-3 gap-6 max-xl:grid-cols-1">
                        {fields.map((field, index) => (
                            <div
                                key={field.fieldKey}
                                className="group relative"
                            >
                                {/* Field Card */}
                                <div className="relative bg-gradient-to-br from-white to-slate-50 rounded-xl border border-slate-200 overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-300 hover:-translate-y-1">
                                    {/* Accent Bar */}
                                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[var(--color-primary)] to-blue-500" />

                                    {/* Content */}
                                    <div className="p-5">
                                        {/* Field Key Label */}
                                        <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[var(--color-primary)]" />
                                            {field.fieldKey}
                                        </label>

                                        {/* Input Field */}
                                        <input
                                            type="text"
                                            value={field.displayLabel}
                                            onChange={(e) => handleChange(index, e.target.value)}
                                            placeholder={`Enter label for ${field.fieldKey}`}
                                            className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg 
                               text-slate-900 placeholder:text-slate-400
                               focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent
                               transition-all duration-200"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center justify-between gap-1 pt-6 mt-8 border-t border-slate-200">
                        <div className="text-sm text-slate-500">
                            {fields.filter(f => f.displayLabel).length} of {fields.length} fields customized
                        </div>
                        <SaveButton text="Save Changes" onClick={handleSave} />
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-6 mb-10 bg-cyan-50/50 backdrop-blur-sm border border-blue-100 rounded-xl p-4">
                    <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 text-[var(--color-primary)] flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                        <div className="text-sm text-blue-900">
                            <strong className="font-semibold">Tip:</strong> Custom labels will be displayed throughout your application.
                            Leave blank to use the default field name.
                        </div>
                    </div>
                </div>

            </div>
        </MasterProtectedRoute>
    );
}
