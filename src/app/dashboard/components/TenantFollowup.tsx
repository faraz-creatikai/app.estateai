"use client";
import React, { useEffect } from 'react'
import ProgressCircle from './ProgressCircle';
import Link from 'next/link';
import { BsArrowRightCircle } from "react-icons/bs";
import { getAllCustomerFollowups } from '@/store/customerFollowups';
import { getCustomer } from '@/store/customer';
import { getAllContactFollowups } from '@/store/contactFollowups';
import { getContact } from '@/store/contact';
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



const TenantFollowups = () => {
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
        const FollowupResponseRaw = await getAllContactFollowups();
        console.log(" followups data is here ", FollowupResponseRaw)
        const FollowupResponse = FollowupResponseRaw?.map((item: any) => ({
            ContactId: item.ContactId,
            StatusType: item.StatusType,
            Date: item.Date,
            _id: item._id,
            Name: item.contact.Name,
            ContactNumber: item.contact.ContactNo,
            User: item.contact.AssignTo?.name ?? "",
        }));
        const FollowupsContacts = FollowupResponse?.filter(
            (item, index, arr) =>
                arr.findIndex((row) => row.ContactId === item.ContactId) === index //keeps only first occurrence
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
        const contacts = await getContact();
        const totalContacts = contacts.length;


        //percentage calculation of followups/totalcustomer
        const percentage = totalContacts ? (FollowupsContacts! / totalContacts) * 100 : 0;
        const interestedPercentage =
            totalFollowups! > 0 ? (interestedFollowups! / totalFollowups!) * 100 : 0;
        const unInterestedPercentage =
            totalFollowups! > 0 ? (unInterestedFollowups! / totalFollowups!) * 100 : 0;
        const wantDemoPercentage =
            totalFollowups! > 0 ? (wantDemoFollowups! / totalFollowups!) * 100 : 0;

        setFollowupsData({
            percentage: Math.round(percentage),
            followups: FollowupsContacts ?? 0,
            totalCustomers: totalContacts,
            status: " To Followup",
            statusSecondary: " Contact",
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
            color: getColorByPercentage(Math.round(wantDemoPercentage), "#0EA5E9")
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
                <h2 className=" font-bold text-xl mb-10">CONTACT FOLLOWUP</h2>

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

export default TenantFollowups
