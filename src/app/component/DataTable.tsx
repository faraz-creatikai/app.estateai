"use client"
import { useState } from "react";
import { MdDelete, MdEdit } from "react-icons/md";

interface DataTableProps {
    data: any[]; // simplest way, can be refined later
}



export default function DataTable({ data }: DataTableProps) {
    const [currentTablePage, setCurrentTablePage] = useState(1);
    const rowsPerTablePage = 4;
    const totalTablePages = Math.ceil(data.length / rowsPerTablePage);
    const indexOfLastRow = currentTablePage * rowsPerTablePage;
    const indexOfFirstRow = indexOfLastRow - rowsPerTablePage;
    const currentRows = data.slice(indexOfFirstRow, indexOfLastRow);
    const nexttablePage = () => {
        if (currentTablePage !== totalTablePages) {
            setCurrentTablePage(currentTablePage + 1);
        }
    }
    const prevtablePage = () => {
        if (currentTablePage !== 1) {
            setCurrentTablePage(currentTablePage - 1);
        }
    }
    return <div>
        <table className="min-w-full border border-gray-300 border-collapse">
            <thead className="bg-gray-100 ">
                <tr className=" text-left">
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">S.No.</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">Campaign</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">Type</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">SubType</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">Email</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">City</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">Location</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">Contact no</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">Assign To</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">Date</th>
                    <th className="border-b border-b-gray-400 px-4 py-2 font-medium">Actions</th>
                </tr>
            </thead>
            <tbody>
                {currentRows.map((item, index) => (
                    <tr key={index}>
                        <td className="border-b border-gray-400 px-4 py-2">{indexOfFirstRow + index + 1}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.campaign}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.type}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.subType}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.email}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.city}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.location}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.contact}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.assignTo}</td>
                        <td className="border-b border-gray-400 px-4 py-2">{item.date}</td>
                        <td className="border-b border-gray-400 px-4 py-2">
                            <button className="hover:bg-gray-300 p-1 mr-2"><MdEdit /></button>
                            <button className="hover:bg-gray-300 p-1"><MdDelete /></button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        <div className="flex justify-between items-center mt-3 py-3 px-5">


            <p className="text-sm">
                Page {currentTablePage} of {totalTablePages}
            </p>

            <div className=" flex gap-3">

                <button
                    onClick={prevtablePage}
                    disabled={currentTablePage === 1}
                    className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                    Prev
                </button>

                <button
                    onClick={nexttablePage}
                    disabled={currentTablePage === totalTablePages}
                    className="px-3 py-1 bg-gray-200 border border-gray-300 rounded disabled:opacity-50"
                >
                    Next
                </button>

            </div>


        </div>
    </div>
}