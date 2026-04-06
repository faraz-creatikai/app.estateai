// note: do not use any

import { API_ROUTES } from "@/constants/ApiRoute";
import { contactcampaignAllDataInterface } from "./contactcampaign.interface";

export const getContactCampaign = async () => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.CONTACTCAMPAIGN.GET_ALL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
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

export const getContactCampaignById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.CONTACTCAMPAIGN.GET_BY_ID(id), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
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

export const getFilteredContactCampaign = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.CONTACTCAMPAIGN.GET_BY_PARAMS(params), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
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

export const addContactCampaign = async (data: contactcampaignAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.CONTACTCAMPAIGN.ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
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

export const updateContactCampaign = async (id: string, data: contactcampaignAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.CONTACTCAMPAIGN.UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"

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

export const deleteContactCampaign = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.CONTACTCAMPAIGN.DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
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
