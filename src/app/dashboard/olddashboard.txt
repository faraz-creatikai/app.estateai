import { SiConvertio } from "react-icons/si";
import { IoStatsChart } from "react-icons/io5";
import { MdBlock } from "react-icons/md";
import { FaGlobeAmericas } from "react-icons/fa";
import Link from "next/link";
import ProgressCircle from "./components/ProgressCircle";
import ProtectedRoute from "../component/ProtectedRoutes";
import { BsArrowRightCircle } from "react-icons/bs";

export default function Dashboard() {

    const dashboardSectionOneCardData = [
        {
            name: "Converted Tenant",
            bg: "bg-linear-to-r from-sky-500 to-sky-800",
            icon: <SiConvertio />,
            iconColor: "text-sky-200"

        },
        {
            name: "Converted Tenant",
            bg: "bg-linear-to-r from-red-500 to-red-800",
            icon: <IoStatsChart />,
            iconColor: "text-red-200"
        },
        {
            name: "Converted Tenant",
            bg: "bg-linear-to-r from-teal-500 to-teal-800",
            icon: <MdBlock />,
            iconColor: "text-teal-200"
        },
        {
            name: "Converted Tenant",
            bg: "bg-linear-to-r from-indigo-500 to-indigo-800",
            icon: <FaGlobeAmericas />,
            iconColor: "text-indigo-200"
        },

    ]

    const ownerFollowUpData = [
        {
            percentage: 48,
            color: "#10b981",
            visits: 10,
            followUp: 21,
            status: "To Visit"
        },
        {
            percentage: 0,
            color: "#10b981",
            visits: 0,
            followUp: 21,
            status: "Visited"
        },
        {
            percentage: 24,
            color: "#10b981",
            visits: 5,
            followUp: 21,
            status: "Interested"
        },
        {
            percentage: 0,
            color: "#10b981",
            visits: 0,
            followUp: 21,
            status: "Not Interested"
        },
        {
            percentage: 0,
            color: "#10b981",
            visits: 5,
            followUp: 21,
            status: "Want Demo"
        },
        {
            percentage: 29,
            color: "#ef4444",
            visits: 6,
            followUp: 21,
            status: "Need Followup"
        }

    ]

    const TenantFollowUpData = [
        {
            percentage: 48,
            color: "#10b981",
            visits: 10,
            followUp: 21,
            status: "To Visit"
        },
        {
            percentage: 0,
            color: "#10b981",
            visits: 0,
            followUp: 21,
            status: "Visited"
        },
        {
            percentage: 24,
            color: "#10b981",
            visits: 5,
            followUp: 21,
            status: "Interested"
        },
        {
            percentage: 0,
            color: "#10b981",
            visits: 0,
            followUp: 21,
            status: "Not Interested"
        },
        {
            percentage: 0,
            color: "#10b981",
            visits: 5,
            followUp: 21,
            status: "Want Demo"
        },
        {
            percentage: 29,
            color: "#ef4444",
            visits: 6,
            followUp: 21,
            status: "Need Followup"
        }

    ]
    return <ProtectedRoute>
    <div className=" flex min-h-[calc(100vh-56px)] max-md:py-5 overflow-auto bg-gray-200">
        {/* Sidebar */}

        <div>


        </div>

        {/* Dashboard */}
        <div className=" p-4 w-full">
            <h2 className=" text-3xl font-extralight mt-10">Dashboard <span className=" text-sm">reports & statistics</span></h2>
            <section className=" grid lg:grid-cols-4 max-md:grid-cols-1 md:grid-cols-2 gap-2 my-5 w-full">
                {
                    dashboardSectionOneCardData.map((item, index) => {
                        return <div key={index} className={` relative flex flex-col items-end gap-4 ${item.bg} py-5 px-4 text-white rounded-md`}>
                            <div className={` absolute bottom-[-5px] left-1 text-8xl opacity-30 ${item.iconColor}`}>{item.icon}</div>
                            <h2 className=" text-5xl">0</h2>
                            <h3 className=" text-xl ">{item.name}</h3>
                        </div>
                    })
                }

            </section>

            <section className=" mt-6 bg-white p-5">
                <h2 className=" font-bold text-xl mb-10">OWNER FOLLOWUP</h2>

                <div className=" grid grid-cols-4 max-lg:grid-cols-1 gap-12 px-5">

                    {
                        ownerFollowUpData.map((item, index) => {
                            return <div key={index} className=" flex flex-col gap-1">


                                <div>
                                    <ProgressCircle percentage={item.percentage} size={80} strokeWidth={3} color={item.color} />

                                </div>
                                <div className=" text-center">
                                    <p>{item.visits} {item.status} / {item.followUp} FollowUp</p>
                                    <Link href={"#"} className=" flex gap-1 items-center justify-center">{item.status} <BsArrowRightCircle className=" mt-[2px] text-sm font-light"/></Link>
                                </div>
                            </div>
                        })
                    }



                </div>
            </section>

            <section className=" mt-6 bg-white p-5">
                <h2 className=" font-bold text-xl mb-10">TENANT FOLLOWUP</h2>

                <div className=" grid grid-cols-4 max-lg:grid-cols-1 gap-12 px-5">

                    {
                        TenantFollowUpData.map((item, index) => {
                            return <div key={index} className=" flex flex-col gap-1">


                                <div>
                                    <ProgressCircle percentage={item.percentage} size={80} strokeWidth={3} color={item.color} />

                                </div>
                                <div className=" text-center">
                                    <p>{item.visits} {item.status} / {item.followUp} FollowUp</p>
                                    <Link href={"#"} className=" flex gap-1 items-center justify-center">{item.status} <BsArrowRightCircle className=" mt-[2px] text-sm font-light"/></Link>
                                </div>
                            </div>
                        })
                    }



                </div>
            </section>

            <section className=" mt-6 bg-white p-5">
                <h2 className=" flex gap-2 items-center mb-10"><span className=" text-teal-500 text-xl font-normal flex items-center gap-1"><IoStatsChart />Converted</span><span className=" text-gray-600 text-sm flex items-center">Monthly stats..</span></h2>

            </section>



        </div>
    </div>
    </ProtectedRoute>
}