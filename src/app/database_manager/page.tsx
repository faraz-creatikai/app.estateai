'use client'
import { useState } from "react";
import ProtectedRoute from "../component/ProtectedRoutes";
import toast, { Toaster } from "react-hot-toast";

export default function DatabaseManager() {
  const [filters, setFilters] = useState({
    keyword: "",
    limit: "",
  });

  const [tableData, setTableData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const totalPages = Math.ceil(tableData.length / rowsPerPage);
  const indexOfLast = currentPage * rowsPerPage;
  const indexOfFirst = indexOfLast - rowsPerPage;
  const currentRows = tableData.slice(indexOfFirst, indexOfLast);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleClearSearch = () => {
    setFilters({ keyword: "", limit: "" });
    toast.success("Filters cleared!");
  };

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-56px)] overflow-auto bg-gray-200 max-md:py-10">
        <Toaster position="top-right" />
        <div className="p-4 max-md:p-3 w-full">
          
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="flex gap-2 items-center font-light">
              <span className="text-gray-900 text-2xl">Dashboard</span> /
              <span> Database Manager</span>
            </h2>
          </div>

          {/* MAIN SECTION (Filters + Table in one) */}
          <section className="flex flex-col mt-6 p-4 bg-white rounded-md border border-gray-300">
            
            {/* FILTER ROW */}
            <div className="flex flex-wrap gap-4 items-end mb-4">
              {/* Keyword */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Keyword</label>
                <input
                  type="text"
                  name="keyword"
                  value={filters.keyword}
                  onChange={handleFilterChange}
                  placeholder="Enter keyword..."
                  className="border border-gray-300 rounded-md px-3 py-2 w-56 max-sm:w-full"
                />
              </div>

              {/* Limit */}
              <div className="flex flex-col">
                <label className="text-sm font-medium mb-1">Limit</label>
                <select
                  name="limit"
                  value={filters.limit}
                  onChange={handleFilterChange}
                  className="border border-gray-300 rounded-md px-3 py-2 w-40 max-sm:w-full"
                >
                  <option value="">Select limit</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 max-sm:w-full max-sm:justify-start">
                <button
                  type="button"
                  className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 cursor-pointer px-5 py-2 rounded-md"
                >
                  Search
                </button>
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-red-500 text-sm px-5 py-2 rounded-md border border-red-400 hover:bg-red-50 transition-all"
                >
                  Clear Search
                </button>
              </div>
            </div>

            {/* TABLE */}
            <div className="border border-gray-300 rounded-md overflow-auto">
              <table className="table-auto w-full border-collapse text-sm">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">S.No.</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Date Type</th>
                    <th className="px-4 py-3 text-left">Assign User</th>
                    <th className="px-4 py-3 text-left">Data</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((item, index) => (
                      <tr
                        key={index}
                        className="border-t hover:bg-[#f7f6f3] transition-all duration-200"
                      >
                        <td className="px-4 py-3">{indexOfFirst + index + 1}</td>
                        <td className="px-4 py-3">{item.name}</td>
                        <td className="px-4 py-3">{item.dateType}</td>
                        <td className="px-4 py-3">{item.assignUser}</td>
                        <td className="px-4 py-3">{item.data}</td>
                        <td className="px-4 py-3 flex gap-2">
                          <button className="text-blue-600 hover:underline">Export</button>
                          <button className="text-green-600 hover:underline">Assign User</button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-gray-500">
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PAGINATION */}
              <div className="flex justify-between items-center mt-3 py-3 px-5">
                <p className="text-sm">
                  Page {currentPage} of {totalPages || 1}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </ProtectedRoute>
  );
}
