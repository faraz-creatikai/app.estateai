"use client";

import { useEffect, useState } from "react";
import {
  X,
  Star,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Link as LinkIcon,
  Video as VideoIcon,
  Image as ImageIcon,
  PencilLine,
  Maximize2,
  Minimize2,
  Copy,
  Eye,
  ChevronLeft,
  ChevronRight,
  User,
  Briefcase,
  FileText,
  ListChecks,
  Wallet,
} from "lucide-react";
import toast from "react-hot-toast";

import { getCustomerById } from "@/store/customer";
import { useCustomerFieldLabel } from "@/context/customer/CustomerFieldLabelContext";
import PopupMenu from "./PopupMenu";

/* ============================================================
   TYPES
   getCustomerById returns the raw backend document (same shape
   you shared) - not the normalized customerAllDataInterface used
   by the edit form. We type that raw shape here.
   ============================================================ */

interface RefObj {
  _id?: string;
  Name?: string;
}

interface CustomerDetailData {
  _id: string;
  Campaign?: RefObj;
  CustomerType?: RefObj;
  CustomerSubType?: RefObj;
  LeadType?: string;
  customerName?: string;
  ContactNumber?: string;
  City?: RefObj;
  Location?: RefObj;
  SubLocation?: RefObj;
  Area?: string;
  Adderess?: string; // backend spelling, kept as-is
  Email?: string;
  Facillities?: string; // backend spelling, kept as-is
  ReferenceId?: string;
  CustomerId?: string;
  ClientId?: string;
  CustomerDate?: string | null;
  CustomerYear?: string;
  Other?: string;
  Description?: string;
  Video?: string;
  Verified?: string;
  GoogleMap?: string;
  URL?: string;
  Price?: string;
  PriceNumber?: number;
  CustomerFields?: Record<string, string>;
  CustomerImage?: string[];
  SitePlan?: string[];
  isFavourite?: boolean;
  LeadTemperature?: string;
  DealClosed?: boolean;
  createdAt?: string;
  updatedAt?: string;
  AssignTo?: { Name?: string } | { Name?: string }[] | null;
  CreatedBy?: { Name?: string } | null;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customerId: string | null;
  /** optional - lets the parent open the edit dialog straight from here */
  onEdit?: (customerId: string) => void;
}

interface QuickStat {
  key: string;
  label: string;
  value: string;
  icon: React.ReactNode;
  href?: string;
  copyValue?: string;
}

interface LightboxState {
  images: string[];
  index: number;
}

/* ============================================================
   HELPERS
   ============================================================ */

// "websiteExists" -> "Website Exists", "SEO-Optimised" -> "SEO Optimised"
const humanizeKey = (key: string) =>
  key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const d = new Date(value);
  if (isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
};

const hasValue = (v: unknown) =>
  v !== undefined && v !== null && String(v).trim() !== "" && v !== "0";

const getInitials = (name?: string) => {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");
  return initials || "?";
};

// values longer than this read better on their own row than crammed into a grid column
const LONG_VALUE_THRESHOLD = 45;

/* ============================================================
   SMALL PRESENTATIONAL PIECES
   ============================================================ */

const SectionCard = ({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-xl border border-gray-100 max-sm:dark:border-white/10 p-4 sm:p-5">
    <div className="mb-4 flex items-center gap-2">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
        {icon}
      </span>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 max-sm:dark:text-gray-300">
        {title}
      </h3>
    </div>
    {children}
  </section>
);

const DetailItem = ({
  label,
  value,
  fullWidth,
  icon,
  href,
}: {
  label: string;
  value: string;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  href?: string;
}) => (
  <div className={fullWidth ? "col-span-full" : ""}>
    <p className="text-xs font-medium text-gray-400 max-sm:dark:text-gray-500 uppercase tracking-wide mb-1">
      {label}
    </p>
    {href ? (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-[15px] text-[var(--color-primary)] hover:underline break-words"
      >
        {icon}
        {value}
      </a>
    ) : (
      <p className="flex items-start gap-1.5 text-[15px] text-gray-800 max-sm:dark:text-gray-200 break-words leading-relaxed">
        {icon}
        <span>{value}</span>
      </p>
    )}
  </div>
);

const Badge = ({
  children,
  color,
}: {
  children: React.ReactNode;
  color: "green" | "gray" | "red" | "amber" | "blue";
}) => {
  const colorMap: Record<string, string> = {
    green: "bg-green-100 text-green-700 max-sm:dark:bg-green-500/15 max-sm:dark:text-green-400",
    gray: "bg-gray-100 text-gray-600 max-sm:dark:bg-white/10 max-sm:dark:text-gray-300",
    red: "bg-red-100 text-red-700 max-sm:dark:bg-red-500/15 max-sm:dark:text-red-400",
    amber: "bg-amber-100 text-amber-700 max-sm:dark:bg-amber-500/15 max-sm:dark:text-amber-400",
    blue: "bg-blue-100 text-blue-700 max-sm:dark:bg-blue-500/15 max-sm:dark:text-blue-400",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${colorMap[color]}`}>
      {children}
    </span>
  );
};

const Gallery = ({
  images,
  altPrefix,
  onOpen,
}: {
  images: string[];
  altPrefix: string;
  onOpen: (index: number) => void;
}) => (
  <div className="flex flex-wrap gap-3">
    {images.map((src, i) => (
      <button
        key={i}
        type="button"
        onClick={() => onOpen(i)}
        className="group relative h-24 w-24 sm:h-28 sm:w-28 shrink-0 overflow-hidden rounded-lg border border-gray-200 max-sm:dark:border-white/10 cursor-pointer"
      >
        <img
          src={src}
          alt={`${altPrefix}-${i}`}
          className="h-full w-full object-cover transition duration-200 group-hover:scale-105"
        />
        <span className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/30">
          <Eye size={18} className="text-white opacity-0 transition group-hover:opacity-100" />
        </span>
      </button>
    ))}
  </div>
);

/* ============================================================
   MAIN COMPONENT
   ============================================================ */

export default function CustomerViewDialog({ isOpen, onClose, customerId, onEdit }: Props) {
  const { getLabel } = useCustomerFieldLabel();
  const [data, setData] = useState<CustomerDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  useEffect(() => {
    if (!isOpen || !customerId) return;

    const fetchCustomer = async () => {
      setLoading(true);
      try {
        const res = await getCustomerById(customerId);
        if (!res) {
          toast.error("Customer not found");
          onClose();
          return;
        }
        setData(res);
      } catch (error) {
        toast.error("Error fetching customer");
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [customerId, isOpen]);

  // clear transient view state (open image, etc.) whenever a new customer is shown
  useEffect(() => {
    if (isOpen) setLightbox(null);
  }, [isOpen, customerId]);

  // close the dialog on Escape, unless the lightbox should absorb it first
  useEffect(() => {
    if (!isOpen) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !lightbox) onClose();
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [isOpen, lightbox, onClose]);

  // lightbox keyboard controls
  useEffect(() => {
    if (!lightbox) return;
    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowLeft") {
        setLightbox((lb) => lb && { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length });
      }
      if (e.key === "ArrowRight") {
        setLightbox((lb) => lb && { ...lb, index: (lb.index + 1) % lb.images.length });
      }
    };
    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [lightbox]);

  if (!isOpen) return null;

  const leadTempColor =
    data?.LeadTemperature === "hot" ? "red" : data?.LeadTemperature === "warm" ? "amber" : "blue";

  const assignedNames = Array.isArray(data?.AssignTo)
    ? data?.AssignTo.map((a) => a?.Name).filter(Boolean).join(", ")
    : data?.AssignTo?.Name;

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error("Couldn't copy to clipboard");
    }
  };

  const quickStats: QuickStat[] = data
    ? (
        [
          hasValue(data.ContactNumber) && {
            key: "contact",
            label: getLabel("ContactNumber", "Contact No"),
            value: data.ContactNumber!,
            href: `tel:${data.ContactNumber}`,
            icon: <Phone size={16} />,
            copyValue: data.ContactNumber!,
          },
          hasValue(data.Email) && {
            key: "email",
            label: getLabel("Email", "Email"),
            value: data.Email!,
            href: `mailto:${data.Email}`,
            icon: <Mail size={16} />,
            copyValue: data.Email!,
          },
          hasValue(data.Price) && {
            key: "price",
            label: getLabel("Price", "Price"),
            value: data.Price!,
            icon: <Wallet size={16} />,
          },
          assignedNames && {
            key: "assigned",
            label: "Assigned To",
            value: assignedNames,
            icon: <User size={16} />,
          },
          hasValue(data.CustomerDate) && {
            key: "date",
            label: getLabel("CustomerDate", "Customer Date"),
            value: formatDate(data.CustomerDate),
            icon: <Calendar size={16} />,
          },
        ] as Array<QuickStat | false | undefined>
      ).filter((s): s is QuickStat => Boolean(s))
    : [];

  const containerWidthClass = isFullscreen
    ? "w-[100dvw] h-[100dvh] rounded-none"
    : "w-[100dvw] max-w-[80dvw] max-h-[95dvh] rounded-2xl";

  return (
    <PopupMenu onClose={onClose} isOpen={isOpen}>
      <>
        <div
          className={`fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px] z-50 ${
            isFullscreen ? "p-0" : "p-4"
          } max-sm:p-0`}
        >
          <div
            className={`bg-white max-sm:dark:bg-[var(--color-childbgdark)] flex flex-col shadow-2xl transition-[width,height,border-radius] duration-200 max-sm:w-[100dvw] max-sm:h-[100dvh] max-sm:rounded-none ${containerWidthClass}`}
          >
            {/* HEADER (Fixed) */}
            <div className="flex shrink-0 items-start justify-between gap-4 border-b max-sm:dark:border-white/10 bg-gradient-to-r from-[var(--color-primary)]/[0.06] to-transparent p-5 sm:p-6">
              <div className="flex min-w-0 items-start gap-4">
                <div className="hidden h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-lg font-semibold text-white shadow-sm sm:flex">
                  {getInitials(data?.customerName)}
                </div>
                <div className="min-w-0">
                  <h2 className="truncate text-xl font-bold max-sm:dark:text-[var(--color-primary)] sm:text-2xl">
                    {data?.customerName || "Customer Details"}
                  </h2>
                  {!loading && (data?.CustomerType?.Name || data?.City?.Name) && (
                    <p className="mt-0.5 truncate text-sm text-gray-500 max-sm:dark:text-gray-400">
                      {[data?.CustomerType?.Name, data?.City?.Name].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {!loading && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {data?.isFavourite && (
                        <Badge color="amber">
                          <span className="flex items-center gap-1">
                            <Star size={12} className="fill-current" /> Favourite
                          </span>
                        </Badge>
                      )}
                      {hasValue(data?.LeadTemperature) && (
                        <Badge color={leadTempColor as any}>
                          {(data!.LeadTemperature as string).toUpperCase()} LEAD
                        </Badge>
                      )}
                      {data?.DealClosed && <Badge color="green">Deal Closed</Badge>}
                      {hasValue(data?.Verified) && (
                        <Badge color={data?.Verified?.toLowerCase() === "yes" ? "green" : "gray"}>
                          {data?.Verified?.toLowerCase() === "yes" ? "Verified" : "Not Verified"}
                        </Badge>
                      )}
                      {data?.CustomerType?.Name && <Badge color="gray">{data.CustomerType.Name}</Badge>}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                {onEdit && data && (
                  <button
                    className="flex cursor-pointer items-center gap-1.5 rounded-md p-2 text-sm font-medium transition hover:bg-[var(--color-primary)] hover:text-white max-sm:dark:text-white"
                    onClick={() => onEdit(data._id)}
                    title="Edit customer"
                  >
                    <PencilLine size={18} /> <span className="hidden md:inline">Edit</span>
                  </button>
                )}
                <button
                  className="cursor-pointer rounded-md p-2 transition hover:bg-[var(--color-primary)] hover:text-white max-sm:hidden max-sm:dark:text-white"
                  onClick={() => setIsFullscreen((f) => !f)}
                  title={isFullscreen ? "Exit full screen" : "Full screen"}
                >
                  {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
                <button
                  className="cursor-pointer rounded-md p-2 transition hover:bg-[var(--color-primary)] hover:text-white max-sm:dark:text-white"
                  onClick={onClose}
                  title="Close"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-8">
              <div className={isFullscreen ? "mx-auto max-w-5xl" : ""}>
                {loading ? (
                  <div className="animate-pulse space-y-8">
                    <div className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-2 lg:grid-cols-4">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-16 w-[180px] shrink-0 rounded-xl bg-gray-100 max-sm:dark:bg-white/5 sm:w-auto"
                        />
                      ))}
                    </div>
                    <div className="space-y-3">
                      <div className="h-4 w-40 rounded bg-gray-100 max-sm:dark:bg-white/5" />
                      <div className="grid grid-cols-3 gap-4 max-xl:grid-cols-2 max-sm:grid-cols-1">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="h-10 rounded bg-gray-100 max-sm:dark:bg-white/5" />
                        ))}
                      </div>
                    </div>
                  </div>
                ) : data ? (
                  <div className="space-y-6">
                    {/* QUICK GLANCE */}
                    {quickStats.length > 0 && (
                      <div className="flex snap-x gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 lg:grid-cols-4">
                        {quickStats.map((stat) => (
                          <div
                            key={stat.key}
                            className="flex w-[190px] shrink-0 snap-start items-start gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 max-sm:dark:border-white/10 max-sm:dark:bg-white/5 sm:w-auto"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                              {stat.icon}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 max-sm:dark:text-gray-500">
                                {stat.label}
                              </p>
                              {stat.href ? (
                                <a
                                  href={stat.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block truncate text-sm font-medium text-[var(--color-primary)] hover:underline"
                                >
                                  {stat.value}
                                </a>
                              ) : (
                                <p className="truncate text-sm font-medium text-gray-800 max-sm:dark:text-gray-200">
                                  {stat.value}
                                </p>
                              )}
                            </div>
                            {stat.copyValue && (
                              <button
                                type="button"
                                onClick={() => copyToClipboard(stat.copyValue!, stat.label)}
                                className="shrink-0 cursor-pointer text-gray-300 transition hover:text-[var(--color-primary)] max-sm:dark:text-gray-600"
                                title={`Copy ${stat.label}`}
                              >
                                <Copy size={14} />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CONTACT & CLASSIFICATION */}
                    <SectionCard title="Customer Information" icon={<User size={15} />}>
                      <div className="grid grid-cols-3 gap-x-6 gap-y-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
                        {hasValue(data.Campaign?.Name) && (
                          <DetailItem label={getLabel("Campaign", "Campaign")} value={data.Campaign!.Name!} />
                        )}
                        {hasValue(data.CustomerType?.Name) && (
                          <DetailItem
                            label={getLabel("CustomerType", "Customer Type")}
                            value={data.CustomerType!.Name!}
                          />
                        )}
                        {hasValue(data.CustomerSubType?.Name) && (
                          <DetailItem
                            label={getLabel("CustomerSubType", "Customer Subtype")}
                            value={data.CustomerSubType!.Name!}
                          />
                        )}
                        {hasValue(data.City?.Name) && (
                          <DetailItem label={getLabel("City", "City")} value={data.City!.Name!} />
                        )}
                        {hasValue(data.Location?.Name) && (
                          <DetailItem label={getLabel("Location", "Location")} value={data.Location!.Name!} />
                        )}
                        {hasValue(data.SubLocation?.Name) && (
                          <DetailItem
                            label={getLabel("SubLocation", "Sub Location")}
                            value={data.SubLocation!.Name!}
                          />
                        )}
                        {hasValue(data.Area) && (
                          <DetailItem label={getLabel("Area", "Area")} value={data.Area!} />
                        )}
                        {hasValue(data.Adderess) && (
                          <DetailItem
                            label={getLabel("Address", "Address")}
                            value={data.Adderess!}
                            icon={<MapPin size={14} className="mt-0.5 shrink-0" />}
                            fullWidth={data.Adderess!.length > LONG_VALUE_THRESHOLD}
                          />
                        )}
                        {hasValue(data.GoogleMap) && (
                          <DetailItem
                            label={getLabel("GoogleMap", "Google Map")}
                            value="Open location"
                            icon={<MapPin size={14} className="mt-0.5 shrink-0" />}
                            href={data.GoogleMap}
                          />
                        )}
                      </div>
                    </SectionCard>

                    {/* BUSINESS / LEAD DETAILS */}
                    {(hasValue(data.CustomerId) ||
                      hasValue(data.ClientId) ||
                      hasValue(data.ReferenceId) ||
                      hasValue(data.CustomerDate) ||
                      hasValue(data.CustomerYear) ||
                      hasValue(data.LeadType) ||
                      hasValue(data.Facillities) ||
                      hasValue(data.URL) ||
                      hasValue(data.Video) ||
                      hasValue(data.Other)) && (
                      <SectionCard title="Lead & Business Details" icon={<Briefcase size={15} />}>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
                          {hasValue(data.CustomerId) && (
                            <DetailItem label={getLabel("CustomerId", "Customer ID")} value={data.CustomerId!} />
                          )}
                          {hasValue(data.ClientId) && (
                            <DetailItem label={getLabel("ClientId", "Client ID")} value={data.ClientId!} />
                          )}
                          {hasValue(data.ReferenceId) && (
                            <DetailItem
                              label={getLabel("ReferenceId", "Reference Id")}
                              value={data.ReferenceId!}
                            />
                          )}
                          {hasValue(data.LeadType) && (
                            <DetailItem label={getLabel("LeadType", "Lead Type")} value={data.LeadType!} />
                          )}
                          {hasValue(data.Facillities) && (
                            <DetailItem
                              label={getLabel("Facillities", "Facilities")}
                              value={data.Facillities!}
                            />
                          )}
                          {hasValue(data.CustomerDate) && (
                            <DetailItem
                              label={getLabel("CustomerDate", "Customer Date")}
                              value={formatDate(data.CustomerDate)}
                              icon={<Calendar size={14} className="mt-0.5 shrink-0" />}
                            />
                          )}
                          {hasValue(data.CustomerYear) && (
                            <DetailItem
                              label={getLabel("CustomerYear", "Customer Year")}
                              value={data.CustomerYear!}
                            />
                          )}
                          {hasValue(data.URL) && (
                            <DetailItem
                              label={getLabel("URL", "URL")}
                              value={data.URL!}
                              icon={<LinkIcon size={14} className="mt-0.5 shrink-0" />}
                              href={data.URL}
                            />
                          )}
                          {hasValue(data.Video) && (
                            <DetailItem
                              label={getLabel("Video", "Video")}
                              value={data.Video!}
                              icon={<VideoIcon size={14} className="mt-0.5 shrink-0" />}
                              href={data.Video}
                            />
                          )}
                          {hasValue(data.Other) && (
                            <DetailItem
                              label={getLabel("Other", "Others")}
                              value={data.Other!}
                              fullWidth={data.Other!.length > LONG_VALUE_THRESHOLD}
                            />
                          )}
                        </div>
                      </SectionCard>
                    )}

                    {/* DESCRIPTION - long free text gets its own readable block */}
                    {hasValue(data.Description) && (
                      <SectionCard title={getLabel("Description", "Description")} icon={<FileText size={15} />}>
                        <p className="whitespace-pre-wrap rounded-lg bg-gray-50 p-4 text-[15px] leading-relaxed text-gray-700 max-sm:dark:bg-white/5 max-sm:dark:text-gray-300">
                          {data.Description}
                        </p>
                      </SectionCard>
                    )}

                    {/* MEDIA */}
                    {((data.CustomerImage && data.CustomerImage.length > 0) ||
                      (data.SitePlan && data.SitePlan.length > 0)) && (
                      <SectionCard title="Media" icon={<ImageIcon size={15} />}>
                        <div className="space-y-5">
                          {data.CustomerImage && data.CustomerImage.length > 0 && (
                            <div>
                              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400 max-sm:dark:text-gray-500">
                                {getLabel("CustomerImage", "Customer Images")}
                              </p>
                              <Gallery
                                images={data.CustomerImage}
                                altPrefix="customer"
                                onOpen={(index) => setLightbox({ images: data.CustomerImage!, index })}
                              />
                            </div>
                          )}
                          {data.SitePlan && data.SitePlan.length > 0 && (
                            <div>
                              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-gray-400 max-sm:dark:text-gray-500">
                                {getLabel("SitePlan", "Site Plan")}
                              </p>
                              <Gallery
                                images={data.SitePlan}
                                altPrefix="site-plan"
                                onOpen={(index) => setLightbox({ images: data.SitePlan!, index })}
                              />
                            </div>
                          )}
                        </div>
                      </SectionCard>
                    )}

                    {/* ADDITIONAL INFORMATION - dynamic custom fields */}
                    {data.CustomerFields && Object.keys(data.CustomerFields).length > 0 && (
                      <SectionCard title="Additional Information" icon={<ListChecks size={15} />}>
                        <div className="grid grid-cols-3 gap-x-6 gap-y-5 max-xl:grid-cols-2 max-sm:grid-cols-1">
                          {Object.entries(data.CustomerFields)
                            .filter(([, value]) => hasValue(value))
                            .map(([key, value]) => (
                              <DetailItem
                                key={key}
                                label={getLabel(key, humanizeKey(key))}
                                value={value}
                                fullWidth={value.length > LONG_VALUE_THRESHOLD}
                              />
                            ))}
                        </div>
                      </SectionCard>
                    )}

                    {/* META */}
                    <div className="flex flex-wrap gap-x-6 gap-y-1 border-t pt-4 text-xs text-gray-400 max-sm:dark:border-white/10 max-sm:dark:text-gray-500">
                      {data.createdAt && <span>Created {formatDate(data.createdAt)}</span>}
                      {data.updatedAt && <span>Last updated {formatDate(data.updatedAt)}</span>}
                      {data.CreatedBy?.Name && <span>By {data.CreatedBy.Name}</span>}
                    </div>
                  </div>
                ) : (
                  <p className="py-20 text-center text-gray-400">No data available.</p>
                )}
              </div>
            </div>

            {/* FOOTER (Fixed) */}
            <div className="flex shrink-0 flex-col-reverse gap-3 border-t p-4 max-sm:dark:border-white/10 sm:flex-row sm:justify-end sm:p-6">
              {onEdit && data && (
                <button
                  className="w-full cursor-pointer rounded-lg border border-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-[var(--color-primary)] transition hover:bg-[var(--color-primary)] hover:text-white sm:w-auto"
                  onClick={() => onEdit(data._id)}
                >
                  Edit Customer
                </button>
              )}
              <button
                className="w-full cursor-pointer rounded-lg bg-[var(--color-primary)] px-5 py-2.5 text-sm font-medium text-white transition hover:opacity-90 sm:w-auto"
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </div>
        </div>

        {/* LIGHTBOX */}
        {lightbox && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute right-4 top-4 cursor-pointer text-white/80 transition hover:text-white"
              onClick={() => setLightbox(null)}
              title="Close"
            >
              <X size={28} />
            </button>
            {lightbox.images.length > 1 && (
              <button
                className="absolute left-4 cursor-pointer text-white/80 transition hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox(
                    (lb) => lb && { ...lb, index: (lb.index - 1 + lb.images.length) % lb.images.length }
                  );
                }}
                title="Previous image"
              >
                <ChevronLeft size={32} />
              </button>
            )}
            <img
              src={lightbox.images[lightbox.index]}
              alt={`preview-${lightbox.index}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85dvh] max-w-[90dvw] rounded-lg object-contain"
            />
            {lightbox.images.length > 1 && (
              <button
                className="absolute right-4 cursor-pointer text-white/80 transition hover:text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightbox((lb) => lb && { ...lb, index: (lb.index + 1) % lb.images.length });
                }}
                title="Next image"
              >
                <ChevronRight size={32} />
              </button>
            )}
            {lightbox.images.length > 1 && (
              <div className="absolute bottom-5 text-sm text-white/70">
                {lightbox.index + 1} / {lightbox.images.length}
              </div>
            )}
          </div>
        )}
      </>
    </PopupMenu>
  );
}