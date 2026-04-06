// note: do not use any

import { API_ROUTES } from "@/constants/ApiRoute";
import { roleAllDataInterface } from "./role.interface";

export const getRole = async () => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.ROLE.GET_ALL);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const getRoleById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.ROLE.GET_BY_ID(id));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const getFilteredRole = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.ROLE.GET_BY_PARAMS(params));
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const addRole = async (data: roleAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.ROLE.ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
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

export const updateRole = async (id: string, data: roleAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.ROLE.UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
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

export const deleteRole = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.ROLE.DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
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
