'use client'
import { useEffect, useState } from "react";
import { CiSearch } from "react-icons/ci";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import ProtectedRoute from "../../component/ProtectedRoutes";
import toast, { Toaster } from "react-hot-toast";
import SingleSelect from "@/app/component/SingleSelect";
import DateSelector from "@/app/component/DateSelector";
import { useRouter } from "next/navigation";
// import { getContactReport, getFilteredContactReport } from "@/store/contactReport"; // ❌ comment - fetch functions not yet created

export default function ContactReport() {
  const router = useRouter();
  const [toggleSearchDropdown, setToggleSearchDropdown] = useState(false);
  const [currentTablePage, setCurrentTablePage] = useState(1);

  // FILTER STATES
  const [filters, setFilters] = useState({
    DataType: [] as string[],
    ContactStatus: [] as string[],
    Campaign: [] as string[],
    ContactType: [] as string[],
    SourceType: [] as string[],
    State: [] as string[],
    City: [] as string[],
    User: [] as string[],
    FollowUpStartDate: "",
    FollowUpEndDate: "",
    DataStartDate: "",
    DataEndDate: "",
  });

  const rowsPerTablePage = 10;
  const [reportData, setReportData] = useState<any[]>([]);

  // Dummy handleSelectChange (since fetch logic is commented)
  const handleSelectChange = (field: keyof typeof filters, value: string | string[]) => {
    setFilters({
      ...filters,
      [field]: Array.isArray(value) ? value : [value],
    });
  };

  const clearFilter = () => {
    setFilters({
      DataType: [],
      ContactStatus: [],
      Campaign: [],
      ContactType: [],
      SourceType: [],
      State: [],
      City: [],
      User: [],
      FollowUpStartDate: "",
      FollowUpEndDate: "",
      DataStartDate: "",
      DataEndDate: "",
    });
    toast.success("Filters cleared!");
  };

  // Dummy options
  const dataTypes = ["Call", "Email", "Meeting"];
  const contactStatus = ["Active", "Inactive", "Pending"];
  const campaigns = ["Buyer", "Seller", "Rent Out", "Services"];
  const contactTypes = ["New", "Existing", "Lead"];
  const sourceTypes = ["Website", "Referral", "Offline"];
  const states = ["Maharashtra", "Delhi", "Karnataka"];
  const cities = ["Mumbai", "Delhi", "Bangalore"];
  const users = ["Admin", "Agent1", "Agent2"];

  const totalPages = Math.ceil(reportData.length / rowsPerTablePage);
  const indexOfLast = currentTablePage * rowsPerTablePage;
  const indexOfFirst = indexOfLast - rowsPerTablePage;
  const currentRows = reportData.slice(indexOfFirst, indexOfLast);

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-56px)] overflow-auto bg-gray-200 max-md:py-10">
        <Toaster position="top-right" />

        <div className="p-4 max-md:p-3 w-full">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <h2 className="flex gap-2 items-center font-light">
              <span className="text-gray-900 text-2xl">Dashboard</span> /
              <span> Contact Report</span>
            </h2>
          </div>

          {/* MAIN TABLE SECTION */}
          <section className="flex flex-col mt-6 p-2 bg-white">
            {/* FILTER SECTION */}
            <div className="m-5 relative">
              <div className="flex justify-between items-center py-1 px-2 border border-gray-800 rounded-md">
                <h3 className="flex items-center gap-1"><CiSearch />Filters</h3>
                <button
                  type="button"
                  onClick={() => setToggleSearchDropdown(!toggleSearchDropdown)}
                  className="p-2 hover:bg-gray-200 rounded-md cursor-pointer"
                >
                  {toggleSearchDropdown ? <IoIosArrowUp /> : <IoIosArrowDown />}
                </button>
              </div>

              <div
                className={`overflow-hidden ${toggleSearchDropdown ? "max-h-[2000px]" : "max-h-0"} transition-all duration-500 ease-in-out px-5`}
              >
                <div className="flex flex-col gap-5 my-5">
                  <div className="flex flex-wrap gap-5 max-lg:flex-col">

                    <SingleSelect options={dataTypes} label="Data Type" onChange={(val) => handleSelectChange("DataType", val)} />
                    <SingleSelect options={contactStatus} label="Contact Status" onChange={(val) => handleSelectChange("ContactStatus", val)} />
                    <SingleSelect options={campaigns} label="Campaign" onChange={(val) => handleSelectChange("Campaign", val)} />
                    <SingleSelect options={contactTypes} label="Contact Type" onChange={(val) => handleSelectChange("ContactType", val)} />
                    <SingleSelect options={sourceTypes} label="Source Type" onChange={(val) => handleSelectChange("SourceType", val)} />
                    <SingleSelect options={states} label="State" onChange={(val) => handleSelectChange("State", val)} />
                    <SingleSelect options={cities} label="City" onChange={(val) => handleSelectChange("City", val)} />
                    <SingleSelect options={users} label="User" onChange={(val) => handleSelectChange("User", val)} />

                    <DateSelector label="Follow Up Start Date" onChange={(val) => handleSelectChange("FollowUpStartDate" as any, val)} />
                    <DateSelector label="Follow Up End Date" onChange={(val) => handleSelectChange("FollowUpEndDate" as any, val)} />
                    <DateSelector label="Data Start Date" onChange={(val) => handleSelectChange("DataStartDate" as any, val)} />
                    <DateSelector label="Data End Date" onChange={(val) => handleSelectChange("DataEndDate" as any, val)} />
                  </div>
                </div>

                <div className="flex justify-end items-center mb-5 gap-4">
                  <button
                    type="button"
                    className="border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white transition-all duration-300 cursor-pointer px-4 py-2 rounded-md"
                  >
                    Explore
                  </button>
                  <button
                    type="reset"
                    onClick={clearFilter}
                    className="text-red-500 text-sm px-5 py-2 rounded-md"
                  >
                    Clear Search
                  </button>
                </div>
              </div>
            </div>

            {/* TABLE SECTION */}
            <div className="border border-gray-300 rounded-md m-2 overflow-auto">
              <table className="table-auto w-full border-collapse text-sm">
                <thead className="bg-gray-900 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">S.No.</th>
                    <th className="px-4 py-3 text-left">Category</th>
                    <th className="px-4 py-3 text-left">Contact Type</th>
                    <th className="px-4 py-3 text-left">Name</th>
                    <th className="px-4 py-3 text-left">Contact No</th>
                    <th className="px-4 py-3 text-left">Assigned To</th>
                    <th className="px-4 py-3 text-left">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentRows.length > 0 ? (
                    currentRows.map((item, index) => (
                      <tr key={index} className="border-t hover:bg-[#f7f6f3] transition-all duration-200">
                        <td className="px-4 py-3">{indexOfFirst + index + 1}</td>
                        <td className="px-4 py-3">{item.Category}</td>
                        <td className="px-4 py-3">{item.ContactType}</td>
                        <td className="px-4 py-3">{item.Name}</td>
                        <td className="px-4 py-3">{item.ContactNo}</td>
                        <td className="px-4 py-3">{item.AssignTo}</td>
                        <td className="px-4 py-3">{item.Date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-4 text-gray-500">
                        No data available.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <div className="flex justify-between items-center mt-3 py-3 px-5">
                <p className="text-sm">
                  Page {currentTablePage} of {totalPages || 1}
                </p>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrentTablePage((p) => Math.max(1, p - 1))}
                    disabled={currentTablePage === 1}
                    className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentTablePage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentTablePage === totalPages || totalPages === 0}
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
