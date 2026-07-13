// app/(your-route)/masters/whatsapp-templates/page.tsx
"use client";

import React, { useEffect, useState, useMemo } from "react";
import { toast, Toaster } from "react-hot-toast";
import { MdDelete, MdEdit } from "react-icons/md";
import Button from "@mui/material/Button";
import { PlusSquare, Image as ImageIcon, Video, FileText, MapPin, ListChecks, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";
import {
  whatsappGetDataInterface,
  whatsappDialogDataInterface,
} from "@/store/masters/whatsapp/whatsapp.interface";
import { deleteWhatsapp, getWhatsapp } from "@/store/masters/whatsapp/whatsapp";
import DeleteDialog from "@/app/component/popups/DeleteDialog";
import AddButton from "@/app/component/buttons/AddButton";
import PageHeader from "@/app/component/labels/PageHeader";
import MasterProtectedRoute from "@/app/component/MasterProtectedRoutes";

const mediaTypeIcons: Record<string, React.ReactNode> = {
  image: <ImageIcon size={14} />,
  video: <Video size={14} />,
  document: <FileText size={14} />,
  location: <MapPin size={14} />,
  poll: <ListChecks size={14} />,
  text: <MessageSquare size={14} />,
};

const mediaTypeLabels: Record<string, string> = {
  image: "Image",
  video: "Video",
  document: "Document",
  location: "Location",
  poll: "Poll",
  text: "Text",
};

export default function WhatsappPage() {
  const [templates, setTemplates] = useState<whatsappGetDataInterface[]>([]);
  const [keyword, setKeyword] = useState("");
  const [limit, setLimit] = useState("10");
  const [statusFilter, setStatusFilter] = useState("all");
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleteDialogData, setDeleteDialogData] = useState<whatsappDialogDataInterface | null>(null);
  const [currentTablePage, setCurrentTablePage] = useState(1);
  const [rowsPerTablePage, setRowsPerTablePage] = useState(10);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const data = await getWhatsapp();
      if (data) {
        const formatted = data.map((t: whatsappGetDataInterface) => ({
          ...t,
          name: t.name.charAt(0).toUpperCase() + t.name.slice(1),
        }));
        setTemplates(formatted);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    setRowsPerTablePage(Number(limit));
    setCurrentTablePage(1);
  }, [limit]);

  useEffect(() => {
    setCurrentTablePage(1);
  }, [keyword, statusFilter, mediaTypeFilter, categoryFilter]);

  // Distinct categories present in the data, for the category dropdown
  const availableCategories = useMemo(() => {
    const set = new Set(
      templates
        .map((t) => (t as any).category)
        .filter((c): c is string => !!c && c.trim() !== "")
    );
    return Array.from(set).sort();
  }, [templates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((t: any) => {
      const matchesKeyword = keyword === "" || t.name.toLowerCase().includes(keyword.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesMediaType =
        mediaTypeFilter === "all" || (t.whatsappMediaType || "text") === mediaTypeFilter;
      const matchesCategory = categoryFilter === "all" || t.category === categoryFilter;
      return matchesKeyword && matchesStatus && matchesMediaType && matchesCategory;
    });
  }, [templates, keyword, statusFilter, mediaTypeFilter, categoryFilter]);

  const handleDelete = async (data: whatsappDialogDataInterface | null) => {
    if (!data) return;
    const res = await deleteWhatsapp(data.id);
    if (res) {
      toast.success("WhatsApp template deleted successfully!");
      setIsDeleteDialogOpen(false);
      setDeleteDialogData(null);
      fetchTemplates();
      return;
    }
    toast.error("Failed to delete WhatsApp template.");
  };

  const handleEdit = (id?: string) => {
    router.push(`/masters/whatsapp-templates/edit/${id}`);
  };

  const handleClear = () => {
    setKeyword("");
    setLimit("10");
    setStatusFilter("all");
    setMediaTypeFilter("all");
    setCategoryFilter("all");
  };

  const totalTablePages = Math.max(1, Math.ceil(filteredTemplates.length / rowsPerTablePage));
  const indexOfLastRow = currentTablePage * rowsPerTablePage;
  const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
  const currentRows = filteredTemplates.slice(indexOfFirstRow, indexOfLastRow);

  const nextTablePage = () => {
    if (currentTablePage !== totalTablePages) setCurrentTablePage(currentTablePage + 1);
  };
  const prevTablePage = () => {
    if (currentTablePage !== 1) setCurrentTablePage(currentTablePage - 1);
  };

  return (
    <MasterProtectedRoute>
      <Toaster position="top-right" />
      <div className="min-h-[calc(100vh-56px)] overflow-auto max-md:py-10">
        <DeleteDialog<whatsappDialogDataInterface>
          isOpen={isDeleteDialogOpen}
          title="Are you sure you want to delete this WhatsApp template?"
          data={deleteDialogData}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setDeleteDialogData(null);
          }}
          onDelete={handleDelete}
        />

        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 relative">
          <PageHeader title="Dashboard" subtitles={["Whatsapp Templates"]} />

          <AddButton
            url="/masters/whatsapp-templates/add"
            text="Add"
            icon={<PlusSquare size={18} />}
          />

          {/* Filters */}
          <form className="w-full flex flex-wrap gap-4 items-end mb-6 mt-16">
            <div className="flex flex-col flex-1 min-w-[200px]">
              <label htmlFor="keyword" className="text-sm font-medium text-gray-700 pl-1">
                Keyword
              </label>
              <input
                id="keyword"
                type="text"
                placeholder="Search by template name..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full outline-none border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              />
            </div>

            <div className="flex flex-col w-40">
              <label htmlFor="status" className="text-sm font-medium text-gray-700 pl-1">
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              >
                <option value="all">All</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div className="flex flex-col w-44">
              <label htmlFor="mediaType" className="text-sm font-medium text-gray-700 pl-1">
                Message Type
              </label>
              <select
                id="mediaType"
                value={mediaTypeFilter}
                onChange={(e) => setMediaTypeFilter(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              >
                <option value="all">All</option>
                <option value="image">Image</option>
                <option value="video">Video</option>
                <option value="document">Document</option>
                <option value="location">Location</option>
                <option value="poll">Poll</option>
                <option value="text">Text</option>
              </select>
            </div>

            {availableCategories.length > 0 && (
              <div className="flex flex-col w-44">
                <label htmlFor="category" className="text-sm font-medium text-gray-700 pl-1">
                  Category
                </label>
                <select
                  id="category"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
                >
                  <option value="all">All</option>
                  {availableCategories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col w-32">
              <label htmlFor="limit" className="text-sm font-medium text-gray-700 pl-1">
                Limit
              </label>
              <select
                id="limit"
                value={limit}
                onChange={(e) => setLimit(e.target.value)}
                className="h-10 border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-800"
              >
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
              </select>
            </div>

            <div className="flex gap-3 ml-auto">
              <button
                type="button"
                onClick={handleClear}
                className="px-4 py-2 text-sm hover:underline transition-all"
              >
                Clear Filters
              </button>
            </div>
          </form>

          {/* Result count */}
          <p className="text-sm text-gray-500 mb-3">
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? "s" : ""} found
          </p>

          {/* Table */}
          <div className="overflow-auto">
            <table className="w-full border-collapse text-sm border border-gray-200">
              <thead className="bg-[var(--color-primary)] text-white">
                <tr>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">S.No.</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Name</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Type</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Category</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Status</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Updated</th>
                  <th className="px-4 py-3 border border-[var(--color-secondary-dark)] text-left">Action</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      Loading templates...
                    </td>
                  </tr>
                ) : currentRows.length > 0 ? (
                  currentRows.map((t: any, i) => {
                    const mediaType = t.whatsappMediaType || "text";
                    return (
                      <tr key={t._id || i} className="border-t hover:bg-[#f7f6f3] transition-all duration-200">
                        <td className="px-4 py-3">{(currentTablePage - 1) * rowsPerTablePage + (i + 1)}</td>
                        <td className="px-4 py-3 font-semibold">{t.name}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                            {mediaTypeIcons[mediaType]}
                            {mediaTypeLabels[mediaType] || mediaType}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{t.category || "—"}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-3 py-1 rounded-[2px] text-xs font-semibold ${
                              t.status === "Active"
                                ? "bg-[#E8F5E9] text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {t.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {t.updatedAt ? new Date(t.updatedAt).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 items-center">
                            <Button
                              sx={{
                                backgroundColor: "#E8F5E9",
                                color: "var(--color-primary)",
                                minWidth: "32px",
                                height: "32px",
                                borderRadius: "8px",
                              }}
                              onClick={() => handleEdit(t._id || String(i))}
                            >
                              <MdEdit />
                            </Button>

                            <Button
                              sx={{
                                backgroundColor: "#FDECEA",
                                color: "#C62828",
                                minWidth: "32px",
                                height: "32px",
                                borderRadius: "8px",
                              }}
                              onClick={() => {
                                setIsDeleteDialogOpen(true);
                                setDeleteDialogData({
                                  id: t._id || String(i),
                                  name: t.name,
                                  status: t.status ?? "Active",
                                });
                              }}
                            >
                              <MdDelete />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="text-center py-6 text-gray-500">
                      No WhatsApp templates found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination */}
            <div className="flex justify-between items-center mt-3 py-3 px-5">
              <p className="text-sm">
                Page {currentTablePage} of {totalTablePages}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={prevTablePage}
                  disabled={currentTablePage === 1}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={nextTablePage}
                  disabled={currentTablePage === totalTablePages || currentRows.length <= 0}
                  className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MasterProtectedRoute>
  );
}