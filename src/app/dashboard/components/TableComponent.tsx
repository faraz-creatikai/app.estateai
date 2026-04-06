import React, { useEffect, useState } from 'react'
import { useDashboardData } from '../data/useDashboardSectionOne';
import { getLocation } from '@/store/masters/location/location';
import { getCustomer } from '@/store/customer';




function TableComponent() {
  const { locationStats, setLocationStats } = useDashboardData();
  const [loading, setLoading] = useState(true);

  const fetchLocationStats = async () => {
    try {
      setLoading(true);
      // Step 1: Get all locations from API
      const locations = await getLocation();
      console.log("location data", locations);

      // Step 2: Get all customers
      const customers = await getCustomer();
      console.log("customer data", customers);

      // Step 3: Count customers per location
      const locationMap: Record<string, number> = {};
      locations.forEach((loc: any) => {
        locationMap[loc.Name] = 0; // initialize with 0
      });

      customers.forEach((customer: any) => {
        const loc = customer.Location || "Unknown";
        if (locationMap[loc] !== undefined) {
          locationMap[loc] += 1;
        }
      });

      // Step 4: Convert map to array
      const locationArray = Object.entries(locationMap).map(([location, count]) => ({
        location,
        customers: count
      }));
      locationArray.sort((a, b) => b.customers - a.customers);

      // Step 5: Update state
      setLocationStats(locationArray);

    } catch (error) {
      console.error("Error fetching location stats:", error);
    }
    finally {
      setLoading(false); // stop loading
    }
  }

  useEffect(() => {
    fetchLocationStats();
  }, []);


  return (
    <div className="w-full max-w-full sm:max-w-[500px] bg-white  shadow-md py-3 sm:py-5 mx-auto">
      <h2 className="text-base sm:text-lg font-semibold px-3 sm:px-5 text-gray-700 mb-4 text-center sm:text-left">
        Global Sales by Top Locations
      </h2>

      {/* Header */}
      <div className="hidden sm:flex flex-row items-center justify-between px-3 sm:px-5 text-gray-500 font-semibold text-xs  border-b border-gray-200 pb-2 mb-2">
        {/*  <div className="">Flag</div> */}
        <div>Locations</div>
        <div>Customers</div>
        {/* <div>Average</div> */}
      </div>

      {/* Rows */}
      <div className="flex flex-col max-h-[200px] overflow-y-auto px-3 sm:px-5 gap-3">
        {loading ? <div className="w-full max-w-full sm:max-w-[500px] bg-white text-xs shadow-md p-3 sm:p-5 mx-auto text-center text-gray-500">
          Fetching locations...
        </div> : locationStats.map((data, index) => (
          <div
            key={index}
            className="grid grid-cols-2 sm:grid-cols-2 items-center bg-gray-50 sm:bg-transparent 
              p-2 sm:p-0 rounded-lg  sm:rounded-none shadow-sm sm:shadow-none"
          >
            {/* Flag */}
            {/*  <div className="flex justify-center sm:justify-start">
              <img
                src={data.img}
                alt={`${data.countryName} flag`}
                className="w-6 h-4 sm:w-8 sm:h-5 object-cover rounded-sm"
              />
            </div> */}

            {/* Country */}
            <div className="text-center sm:text-left text-xs sm:text-sm font-medium text-gray-700 truncate">
              {data.location}
            </div>

            {/* Sales */}
            <div className=" text-xs text-right sm:text-sm text-gray-600">
              {data.customers}
            </div>

            {/* Avg (hidden on mobile) */}
            {/*   <div className="hidden sm:block text-center sm:text-right text-xs sm:text-sm text-gray-600">
              {data.avgValue}
            </div> */}
          </div>
        ))}
      </div>
    </div>
  )
}

export default TableComponent
