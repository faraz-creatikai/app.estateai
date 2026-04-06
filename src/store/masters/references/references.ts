import { API_ROUTES } from "@/constants/ApiRoute";
import { referencesAllDataInterface } from "./references.interface";

export const getReferences = async () => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.REFERENCES.GET_ALL,{
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

export const getReferencesById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.REFERENCES.GET_BY_ID(id),{
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

export const getFilteredReferences = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.REFERENCES.GET_BY_PARAMS(params),{
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

export const addReferences = async (data: referencesAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.REFERENCES.ADD, {
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

export const updateReferences = async (id: string, data: referencesAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.REFERENCES.UPDATE(id), {
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

export const deleteReferences = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.REFERENCES.DELETE(id), {
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
