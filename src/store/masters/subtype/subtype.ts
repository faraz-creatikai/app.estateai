// note do not use any

import { API_ROUTES } from "@/constants/ApiRoute"
import { subtypeAllDataInterface, subtypeDeleteAllPayloadInterface } from "./subtype.interface";




export const getSubtype = async () => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBTYPE.GET_ALL, {
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
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getSubtypeById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBTYPE.GET_BY_ID(id), {
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
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getSubtypeByCampaignAndType = async (campaignId: string,subtypeId:string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBTYPE.GET_ALL_BY_CAMPAIGN_AND_TYPE(campaignId,subtypeId), {
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
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getFilteredSubtype = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBTYPE.GET_BY_PARAMS(params), {
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
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const addSubtype = async (data:subtypeAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.SUBTYPE.ADD,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"

            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const updateSubtype = async (id: string, data: subtypeAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.SUBTYPE.UPDATE(id),
            {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const deleteSubtype = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBTYPE.DELETE(id),
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;

    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const deleteAllSubtype = async (payload: subtypeDeleteAllPayloadInterface) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBTYPE.DELETEALL,
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;

    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}