"use client";
import React, { useEffect } from 'react'
import ProgressCircle from './ProgressCircle';
import Link from 'next/link';
import { BsArrowRightCircle } from "react-icons/bs";
import { getAllCustomerFollowups } from '@/store/customerFollowups';
import { getCustomer } from '@/store/customer';
import ProgressCircleItem from './ProgressCircleItem';




interface FollowupData {
    percentage: number;
    followups: number;
    totalCustomers: number;
    status: string;
    statusSecondary: string;
    color: string;
}

interface FollowupStatusMetric {
    percentage: number;
    value: number;
    total: number;
    status: string;
    statusSecondary: string;
    color: string;
}



const OwnerFollowups = () => {
    const [followuUpsData, setFollowupsData] = React.useState<FollowupData | null>(null);
    const [wantDemoData, setWantDemoData] = React.useState<FollowupStatusMetric | null>(null);
    const [interestedData, setInterestedData] = React.useState<FollowupStatusMetric | null>(null);
    const [unInterestedData, setUnInterestedData] = React.useState<FollowupStatusMetric | null>(null);

       const getColorByPercentage = (percentage: number, defaultColor: string) => {
    return percentage < 10 ? "#ef4444" : defaultColor;
};


    useEffect(() => {
        fetchCustomerFollowupData();
    }, []);
    const fetchCustomerFollowupData = async () => {
        // fetch customer with followups
        const FollowupResponseRaw = await getAllCustomerFollowups();
        const FollowupResponse = FollowupResponseRaw?.map((item: any) => ({
            customerid: item.customer._id,
            StatusType: item.StatusType,
            Date: item.Date,
            _id: item._id,
            Name: item.customer.customerName,
            ContactNumber: item.customer.ContactNumber,
            User: item.customer.AssignTo?.name ?? "",
        }));
        const FollowupsCustomers = FollowupResponse?.filter(
            (item, index, arr) =>
                arr.findIndex((row) => row.customerid === item.customerid) === index //keeps only first occurrence
        ).length;

        //total followups count
        const totalFollowups = FollowupResponse?.length;

        //  Interested followups count
        const interestedFollowups = FollowupResponseRaw?.filter(
            (item: any) => item.StatusType === "interested" || item.StatusType === "Interested"
        ).length;

        // UnInterested Followups count
        const unInterestedFollowups = FollowupResponseRaw?.filter(
            (item: any) => item.StatusType === "not interested" || item.StatusType === "Not Interested"
        ).length;
        // Want Demo Followups count
        const wantDemoFollowups = FollowupResponseRaw?.filter(
            (item: any) => item.StatusType === "want demo" || item.StatusType === "Want Demo"
        ).length;

        //fetch total customers
        const customers = await getCustomer();
        const totalCustomers = customers.length;


        //percentage calculation of followups/totalcustomer
        const percentage = totalCustomers? (FollowupsCustomers! / totalCustomers) * 100 : 0;
        const interestedPercentage =
            totalFollowups! > 0 ? (interestedFollowups! / totalFollowups!) * 100 : 0;
        const unInterestedPercentage =
            totalFollowups! > 0 ? (unInterestedFollowups! / totalFollowups!) * 100 : 0;
        const wantDemoPercentage =
            totalFollowups! > 0 ? (wantDemoFollowups! / totalFollowups!) * 100 : 0;

        setFollowupsData({
            percentage: Math.round(percentage),
            followups: FollowupsCustomers ?? 0,
            totalCustomers: totalCustomers,
            status: " To Followup",
            statusSecondary: " Customer",
            color: getColorByPercentage(Math.round(percentage), "#0EA5E9")
        })
        setInterestedData({
            percentage: Math.round(interestedPercentage),
            value: interestedFollowups ?? 0,
            total: totalFollowups ?? 0,
            status: " Interested ",
            statusSecondary: " Followups",
            color: getColorByPercentage(Math.round(interestedPercentage), "#0EA5E9")
        });
        setUnInterestedData({
            percentage: Math.round(unInterestedPercentage),
            value: unInterestedFollowups ?? 0,
            total: totalFollowups ?? 0,
            status: " Not Interested ",
            statusSecondary: " Followups",
            color: getColorByPercentage(Math.round(unInterestedPercentage), "#0EA5E9")
        });
         setWantDemoData({
            percentage: Math.round(wantDemoPercentage),
            value: wantDemoFollowups ?? 0,
            total: totalFollowups ?? 0,
            status: " Want Demo ",
            statusSecondary: " Followups",
            color: getColorByPercentage( Math.round(wantDemoPercentage), "#0EA5E9")
        });
    }
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
    return (
        <div>
            <section className=" mt-6 bg-white text-gray-700 p-5">
                <h2 className=" font-bold text-xl mb-10">CUSTOMER FOLLOWUP</h2>

                <div className=" grid lg:grid-cols-4 md:grid-cols-2 max-md:grid-cols-1 gap-12 px-5">

                    {/* {
                        ownerFollowUpData.map((item, index) => {
                            return <div key={index} className=" flex flex-col gap-1">


                                <div>
                                    <ProgressCircle percentage={item.percentage} size={80} strokeWidth={3} color={item.color} />

                                </div>
                                <div className=" text-center">
                                    <p>{item.visits} {item.status} / {item.followUp} FollowUp</p>
                                    <Link href={"#"} className=" flex gap-1 items-center justify-center">{item.status} <BsArrowRightCircle className=" mt-[2px] text-sm font-light" /></Link>
                                </div>
                            </div>
                        })
                    } */}
                    {followuUpsData && (
                        <ProgressCircleItem
                            percentage={followuUpsData.percentage}
                            value={followuUpsData.followups}
                            total={followuUpsData.totalCustomers}
                            status={followuUpsData.status}
                            statusSecondary={followuUpsData.statusSecondary}
                            color={followuUpsData.color}
                        />
                    )}

                    {interestedData && (
                        <ProgressCircleItem
                            percentage={interestedData.percentage}
                            value={interestedData.value}
                            total={interestedData.total}
                            status={interestedData.status}
                            statusSecondary={interestedData.statusSecondary}
                            color={interestedData.color}
                        />
                    )}

                    {unInterestedData && (
                        <ProgressCircleItem
                            percentage={unInterestedData.percentage}
                            value={unInterestedData.value}
                            total={unInterestedData.total}
                            status={unInterestedData.status}
                            statusSecondary={unInterestedData.statusSecondary}
                            color={unInterestedData.color}
                        />
                    )}
                    {wantDemoData && (
                        <ProgressCircleItem
                            percentage={wantDemoData.percentage}
                            value={wantDemoData.value}
                            total={wantDemoData.total}
                            status={wantDemoData.status}
                            statusSecondary={wantDemoData.statusSecondary}
                            color={wantDemoData.color}
                        />
                    )}



                </div>
            </section>
        </div>
    )
}

export default OwnerFollowups
