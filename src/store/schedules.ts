// note do not use any

import { API_ROUTES } from "@/constants/ApiRoute"
import { contactAllDataInterface } from "./contact.interface";
import { schedulesDeletePayloadInterface, ScheduleType } from "./schedules.interface";

export const getSchedules = async () => {
    try {
        const response = await fetch(API_ROUTES.SHEDULES.GET_ALL,{ credentials: "include" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getSchedulesById = async (id:string)=>{
    try {
        const response = await fetch(API_ROUTES.SHEDULES.GET_BY_ID(id),{ credentials: "include" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getFilteredSchedules = async (params:string)=>{
    try{
        const response = await fetch(API_ROUTES.SHEDULES.GET_BY_PARAMS(params),{ credentials: "include" });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const addSchedules = async (data: ScheduleType) => {
    try {
        let response = await fetch(API_ROUTES.SHEDULES.ADD,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response =await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const updateSchedules = async (id: string, data: ScheduleType) => {
    try {
        let response = await fetch(API_ROUTES.SHEDULES.UPDATE(id),
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response =await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

/* export const deleteSchedules = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.SHEDULES.DELETE(id),
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data=await response.json();
        return data;

    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
} */
export const deleteSchedules = async (payload: schedulesDeletePayloadInterface) => {
    try {
        const response = await fetch(API_ROUTES.SHEDULES.DELETE,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data=await response.json();
        return data;

    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}