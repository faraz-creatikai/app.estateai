// note: do not use any

import { API_ROUTES } from "@/constants/ApiRoute";
import { industriesAllDataInterface } from "./industries.interface";

export const getIndustries = async () => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.INDUSTRIES.GET_ALL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const getIndustriesById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.INDUSTRIES.GET_BY_ID(id), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const getFilteredIndustries = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.INDUSTRIES.GET_BY_PARAMS(params), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const addIndustries = async (data: industriesAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.INDUSTRIES.ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const updateIndustries = async (id: string, data: industriesAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.INDUSTRIES.UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const deleteIndustries = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.INDUSTRIES.DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};
