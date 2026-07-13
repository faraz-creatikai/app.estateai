"use client";

import React, { useEffect, useState } from 'react';
import { useDashboardData } from '../data/useDashboardSectionOne';
// 🚨 Import your new optimized API call here!
import { getCustomerLocationStats } from '@/store/customer'; 

function TableComponent() {
  const { locationStats, setLocationStats } = useDashboardData();
  const [loading, setLoading] = useState(true);

  const fetchLocationStats = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch pre-calculated, pre-sorted data from the backend
      const response = await getCustomerLocationStats();
      
      // Defensive check for Axios vs Standard Fetch unwrapping
      const payload = response?.data?.data ? response.data.data : response?.data;
      
      if (payload && Array.isArray(payload)) {
        setLocationStats(payload);
      }
      
    } catch (error) {
      console.error("Error fetching location stats:", error);
    } finally {
      setLoading(false); 
    }
  }

  useEffect(() => {
    fetchLocationStats();
  }, [setLocationStats]);


  return (
    <div className="w-full max-w-full sm:max-w-[500px] bg-white shadow-md py-3 sm:py-5 mx-auto">
      <h2 className="text-base sm:text-lg font-semibold px-3 sm:px-5 text-gray-700 mb-4 text-center sm:text-left">
        Global Sales by Top Locations
      </h2>

      {/* Header */}
      <div className="hidden sm:flex flex-row items-center justify-between px-3 sm:px-5 text-gray-500 font-semibold text-xs border-b border-gray-200 pb-2 mb-2">
        <div>Locations</div>
        <div>Customers</div>
      </div>

      {/* Rows */}
      <div className="flex flex-col max-h-[200px] overflow-y-auto px-3 sm:px-5 gap-3">
        {loading ? (
          <div className="w-full max-w-full sm:max-w-[500px] bg-white text-xs shadow-md p-3 sm:p-5 mx-auto text-center text-gray-500">
            Fetching locations...
          </div>
        ) : locationStats.length === 0 ? (
           <div className="text-center text-sm text-gray-500 py-4">
             No location data available.
           </div>
        ) : (
          locationStats.map((data, index) => (
            <div
              key={index}
              className="grid grid-cols-2 sm:grid-cols-2 items-center bg-gray-50 sm:bg-transparent 
                p-2 sm:p-0 rounded-lg sm:rounded-none shadow-sm sm:shadow-none"
            >
              {/* Location */}
              <div className="text-center sm:text-left text-xs sm:text-sm font-medium text-gray-700 truncate">
                {data.location}
              </div>

              {/* Customers */}
              <div className="text-xs text-right sm:text-sm text-gray-600">
                {data.customers}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default TableComponent;