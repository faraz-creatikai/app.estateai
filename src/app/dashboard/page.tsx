"use client"

import ProtectedRoute from "../component/ProtectedRoutes";
import DashboardSectionOne from "./components/DashboardSectionOne";
import DonutChart from "./components/DonutChart";
import LeadSources from "./components/LeadSource";
import LeadTemperature from "./components/LeadTemperature";

import OwnerFollowups from "./components/OwnerFollowups";
import RadarChart from "./components/RadarChart";
import SmallGraph from "./components/SmallGraph";
import SmallScreenData from "./components/SmallScreenData";
import TableComponent from "./components/TableComponent";
import TenantFollowups from "./components/TenantFollowup";
import VisitorsChart from "./components/VisitorsChart";


export default function Dashboard() {
  return (
    <ProtectedRoute>
      <div className=" max-md:hidden">
        <div className="">
          <DashboardSectionOne />
        </div>

        <div className="">
          <LeadSources />
        </div>
        <div className=" my-4">
          <LeadTemperature />
        </div>
        <div className=" ">
          <div className="flex sm:flex-col lg:flex-row p-4  gap-4 ">
            <VisitorsChart />
            <SmallGraph />

          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 ">
          <TableComponent />
          <DonutChart />
          <RadarChart />

        </div>
        <div className=" p-4">
          <OwnerFollowups />
        </div>

        <div className=" p-4">
          <TenantFollowups />
        </div>
      </div>
      <div className=" md:hidden">
        <SmallScreenData />
      </div>


    </ProtectedRoute>
  );
}
