'use client';

import { useState } from "react";
import { X, Plus, ChevronDown, ChevronUp } from "lucide-react";
import SingleSelect from "@/app/component/SingleSelect";

import { File as FileIcon, FileText, FileSpreadsheet, Download } from "lucide-react";
import LocationMapPicker from "./LocationMapPicker";

export interface WhatsappRichData {
    whatsappMediaType: "image" | "video" | "document" | "location" | "poll" | "text";
    whatsappFileName: string;
    category: string;
    variables: string; // comma-separated in the UI, split into an array on submit
    linkPreviewEnabled: boolean;
    linkPreviewTitle: string;
    linkPreviewBody: string;
    linkPreviewThumbnailUrl: string;
    linkPreviewSourceUrl: string;
    locationLat: string;
    locationLng: string;
    locationName: string;
    locationAddress: string;
    pollName: string;
    pollOptions: string[];
    pollSelectableCount: number;
}

export const defaultRichData: WhatsappRichData = {
    whatsappMediaType: "image",
    whatsappFileName: "",
    category: "",
    variables: "",
    linkPreviewEnabled: false,
    linkPreviewTitle: "",
    linkPreviewBody: "",
    linkPreviewThumbnailUrl: "",
    linkPreviewSourceUrl: "",
    locationLat: "",
    locationLng: "",
    locationName: "",
    locationAddress: "",
    pollName: "",
    pollOptions: ["", ""],
    pollSelectableCount: 1,
};

// Flattens the panel's local state into the exact fields your Template
// model expects. Call this right before you post the FormData.
export const buildRichFormData = (formData: FormData, rich: WhatsappRichData) => {
    
    // 👇 NEW: Send the exact actual value directly to the backend! No more "none" squashing.
    formData.append("whatsappMediaType", rich.whatsappMediaType);
    
    formData.append("whatsappFileName", rich.whatsappFileName || "");
    formData.append("category", rich.category || "");

    const variablesArray = rich.variables
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);
    formData.append("variables", JSON.stringify(variablesArray));

    formData.append(
        "whatsappLinkPreview",
        rich.linkPreviewEnabled && rich.linkPreviewSourceUrl.trim()
            ? JSON.stringify({
                title: rich.linkPreviewTitle,
                body: rich.linkPreviewBody,
                thumbnailUrl: rich.linkPreviewThumbnailUrl,
                sourceUrl: rich.linkPreviewSourceUrl,
            })
            : JSON.stringify(null)
    );

    formData.append(
        "whatsappLocation",
        rich.whatsappMediaType === "location" && rich.locationLat !== "" && rich.locationLng !== ""
            ? JSON.stringify({
                lat: Number(rich.locationLat),
                lng: Number(rich.locationLng),
                name: rich.locationName,
                address: rich.locationAddress,
            })
            : JSON.stringify(null)
    );

    formData.append(
        "whatsappPoll",
        rich.whatsappMediaType === "poll"
            ? JSON.stringify({
                name: rich.pollName,
                options: rich.pollOptions.map((o) => o.trim()).filter(Boolean),
                selectableCount: rich.pollSelectableCount || 1,
            })
            : JSON.stringify(null)
    );
};

// Converts a fetched template row back into the panel's flat state.
export const richDataFromTemplate = (tpl: any): WhatsappRichData => {
    
    // 👇 NEW: Grab the exact value. We include a legacy fallback just in case 
    // you edit an older template that was previously saved as "none".
    let mediaType = tpl?.whatsappMediaType || "text";
    
    if (mediaType === "none") {
        if (tpl?.whatsappPoll?.name) mediaType = "poll";
        else if (tpl?.whatsappLocation && typeof tpl.whatsappLocation.lat === "number") mediaType = "location";
        else if (tpl?.whatsappImage?.length) mediaType = "image";
        else mediaType = "text";
    }

    return {
        whatsappMediaType: mediaType as WhatsappRichData["whatsappMediaType"],
        whatsappFileName: tpl?.whatsappFileName || "",
        category: tpl?.category || "",
        variables: Array.isArray(tpl?.variables) ? tpl.variables.join(", ") : "",
        linkPreviewEnabled: !!tpl?.whatsappLinkPreview?.sourceUrl,
        linkPreviewTitle: tpl?.whatsappLinkPreview?.title || "",
        linkPreviewBody: tpl?.whatsappLinkPreview?.body || "",
        linkPreviewThumbnailUrl: tpl?.whatsappLinkPreview?.thumbnailUrl || "",
        linkPreviewSourceUrl: tpl?.whatsappLinkPreview?.sourceUrl || "",
        locationLat: tpl?.whatsappLocation?.lat?.toString() || "",
        locationLng: tpl?.whatsappLocation?.lng?.toString() || "",
        locationName: tpl?.whatsappLocation?.name || "",
        locationAddress: tpl?.whatsappLocation?.address || "",
        pollName: tpl?.whatsappPoll?.name || "",
        pollOptions: tpl?.whatsappPoll?.options?.length ? tpl.whatsappPoll.options : ["", ""],
        pollSelectableCount: tpl?.whatsappPoll?.selectableCount || 1,
    };
};

const messageTypeOptions = ["text", "image", "video", "document", "location", "poll"];

interface Props {
    rich: WhatsappRichData;
    setRich: React.Dispatch<React.SetStateAction<WhatsappRichData>>;
    mediaFile: File | null;
    mediaPreview: string | null;
    onMediaChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveMedia: () => void;
}

export default function WhatsappRichFields({
    rich,
    setRich,
    mediaFile,
    mediaPreview,
    onMediaChange,
    onRemoveMedia,
}: Props) {
    const [advancedOpen, setAdvancedOpen] = useState(false);

    const set = <K extends keyof WhatsappRichData>(key: K, value: WhatsappRichData[K]) =>
        setRich((prev) => ({ ...prev, [key]: value }));

    const updatePollOption = (index: number, value: string) => {
        const next = [...rich.pollOptions];
        next[index] = value;
        set("pollOptions", next);
    };

    const addPollOption = () => set("pollOptions", [...rich.pollOptions, ""]);

    const removePollOption = (index: number) => {
        if (rich.pollOptions.length <= 2) return; 
        set("pollOptions", rich.pollOptions.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col space-y-6">
            <div className="grid grid-cols-2 gap-6 max-lg:grid-cols-1">
                <SingleSelect
                    options={messageTypeOptions}
                    label="Message Type"
                    value={rich.whatsappMediaType}
                    onChange={(v) => set("whatsappMediaType", v as WhatsappRichData["whatsappMediaType"])}
                />

                <input
                    type="text"
                    value={rich.category}
                    onChange={(e) => set("category", e.target.value)}
                    placeholder="Category (optional, e.g. marketing)"
                    className="border border-gray-300 rounded-md p-2 w-full"
                />
            </div>

            {/* Image / Video / Document upload */}
            {["image", "video", "document"].includes(rich.whatsappMediaType) && (
                <div className="flex flex-col">
                    <label className="font-semibold text-gray-700 mb-2">
                        {rich.whatsappMediaType === "image" && "WhatsApp Image"}
                        {rich.whatsappMediaType === "video" && "WhatsApp Video"}
                        {rich.whatsappMediaType === "document" && "WhatsApp Document"}
                    </label>
                    <input
                        type="file"
                        accept={
                            rich.whatsappMediaType === "image"
                                ? "image/*"
                                : rich.whatsappMediaType === "video"
                                    ? "video/*"
                                    : ".pdf,.doc,.docx,.xls,.xlsx"
                        }
                        onChange={onMediaChange}
                        className="border border-gray-300 rounded-md p-2"
                    />

                    {mediaPreview && rich.whatsappMediaType === "image" && (
                        <div className="relative w-24 h-24 mt-3">
                            <img src={mediaPreview} alt="preview" className="w-24 h-24 object-cover rounded-md border" />
                            <button type="button" onClick={onRemoveMedia} className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {mediaPreview && rich.whatsappMediaType === "video" && (
                        <div className="relative w-48 mt-3">
                            <video src={mediaPreview} controls className="w-48 rounded-md border" />
                            <button type="button" onClick={onRemoveMedia} className="absolute top-[-8px] right-[-8px] bg-red-600 text-white rounded-full p-1 hover:bg-red-700">
                                <X size={14} />
                            </button>
                        </div>
                    )}

                    {rich.whatsappMediaType === "document" && (mediaFile || mediaPreview) && (
                        <DocumentChip
                            name={mediaFile?.name || rich.whatsappFileName || mediaPreview?.split("/").pop() || "document"}
                            url={!mediaFile ? mediaPreview ?? undefined : undefined}
                            onRemove={onRemoveMedia}
                        />
                    )}

                    {rich.whatsappMediaType === "document" && (
                        <input
                            type="text"
                            value={rich.whatsappFileName}
                            onChange={(e) => set("whatsappFileName", e.target.value)}
                            placeholder="Display file name (optional, e.g. invoice.pdf)"
                            className="border border-gray-300 rounded-md p-2 mt-3"
                        />
                    )}
                </div>
            )}

            {/* Location fields */}
            {rich.whatsappMediaType === "location" && (
                <LocationMapPicker
                    value={{
                        lat: rich.locationLat,
                        lng: rich.locationLng,
                        name: rich.locationName,
                        address: rich.locationAddress,
                    }}
                    onChange={(v) =>
                        setRich((prev) => ({
                            ...prev,
                            locationLat: v.lat,
                            locationLng: v.lng,
                            locationName: v.name,
                            locationAddress: v.address,
                        }))
                    }
                />
            )}
            
            {/* Poll fields */}
            {rich.whatsappMediaType === "poll" && (
                <div className="flex flex-col gap-3 border border-gray-200 rounded-lg p-4">
                    <input type="text" placeholder="Poll question" value={rich.pollName} onChange={(e) => set("pollName", e.target.value)} className="border border-gray-300 rounded-md p-2" />
                    {rich.pollOptions.map((opt, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <input
                                type="text"
                                placeholder={`Option ${i + 1}`}
                                value={opt}
                                onChange={(e) => updatePollOption(i, e.target.value)}
                                className="border border-gray-300 rounded-md p-2 flex-1"
                            />
                            {rich.pollOptions.length > 2 && (
                                <button type="button" onClick={() => removePollOption(i)} className="text-red-600 hover:text-red-700">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                    <button type="button" onClick={addPollOption} className="flex items-center gap-1 text-sm text-[var(--color-primary)] w-fit">
                        <Plus size={14} /> Add option
                    </button>
                    <label className="text-sm text-gray-600 mt-1">
                        Max selectable options:
                        <input
                            type="number"
                            min={1}
                            max={rich.pollOptions.length}
                            value={rich.pollSelectableCount}
                            onChange={(e) => set("pollSelectableCount", Number(e.target.value) || 1)}
                            className="border border-gray-300 rounded-md p-1 ml-2 w-16"
                        />
                    </label>
                </div>
            )}

            {/* Advanced: merge tags + optional link preview card */}
            <div className="border border-gray-200 rounded-lg">
                <button
                    type="button"
                    onClick={() => setAdvancedOpen((v) => !v)}
                    className="w-full flex items-center justify-between px-4 py-3 font-semibold text-gray-700"
                >
                    Advanced (link preview & merge tags)
                </button>

                <div className="px-4 pb-4 flex flex-col gap-4">
                    <input
                        type="text"
                        placeholder="Merge tags, comma separated (e.g. customerName, amount)"
                        value={rich.variables}
                        onChange={(e) => set("variables", e.target.value)}
                        className="border border-gray-300 rounded-md p-2"
                    />

                    {rich.whatsappMediaType === "text" && (
                        <>
                            <label className="flex items-center gap-2 text-sm text-gray-700">
                                <input
                                    type="checkbox"
                                    checked={rich.linkPreviewEnabled}
                                    onChange={(e) => set("linkPreviewEnabled", e.target.checked)}
                                />
                                Attach a rich link preview card
                            </label>

                            {rich.linkPreviewEnabled && (
                                <div className="grid grid-cols-2 gap-3 max-lg:grid-cols-1">
                                    <input type="text" placeholder="Card title" value={rich.linkPreviewTitle} onChange={(e) => set("linkPreviewTitle", e.target.value)} className="border border-gray-300 rounded-md p-2" />
                                    <input type="text" placeholder="Card body" value={rich.linkPreviewBody} onChange={(e) => set("linkPreviewBody", e.target.value)} className="border border-gray-300 rounded-md p-2" />
                                    <input type="text" placeholder="Thumbnail image URL" value={rich.linkPreviewThumbnailUrl} onChange={(e) => set("linkPreviewThumbnailUrl", e.target.value)} className="border border-gray-300 rounded-md p-2" />
                                    <input type="text" placeholder="Link URL (required)" value={rich.linkPreviewSourceUrl} onChange={(e) => set("linkPreviewSourceUrl", e.target.value)} className="border border-gray-300 rounded-md p-2" />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

const getDocIcon = (name: string) => {
    const ext = name.split(".").pop()?.toLowerCase();
    if (ext === "pdf") return FileText;
    if (["xls", "xlsx"].includes(ext || "")) return FileSpreadsheet;
    return FileIcon;
};

const DocumentChip = ({
    name,
    url,
    onRemove,
}: {
    name: string;
    url?: string;
    onRemove: () => void;
}) => {
    const Icon = getDocIcon(name);
    return (
        <div className="flex items-center gap-3 mt-3 border border-gray-300 rounded-md p-3 w-fit max-w-full">
            <Icon size={28} className="text-[var(--color-primary)] shrink-0" />
            <div className="flex flex-col min-w-0">
                <span className="text-sm text-gray-800 truncate max-w-[220px]">{name}</span>
                {url && (
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1 w-fit"
                    >
                        <Download size={12} /> View file
                    </a>
                )}
            </div>
            <button
                type="button"
                onClick={onRemove}
                className="text-red-600 hover:text-red-700 ml-2 shrink-0"
            >
                <X size={16} />
            </button>
        </div>
    );
};