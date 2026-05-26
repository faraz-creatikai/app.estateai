import { API_ROUTES } from "@/constants/ApiRoute";
import { salesScriptAllDataInterface } from "./salesscript.interface";


export const getSalesScript = async () => {
    try {
        const response = await fetch(API_ROUTES.SALESSCRIPT.GET_ALL, {
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

export const getSalesScriptById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.SALESSCRIPT.GET_BY_ID(id), {
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

export const getFilteredSalesScript = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.SALESSCRIPT.GET_BY_PARAMS(params), {
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

export const addSalesScript = async (
    data: salesScriptAllDataInterface
): Promise<salesScriptAllDataInterface | null> => {
    try {
        const response = await fetch(API_ROUTES.SALESSCRIPT.ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: salesScriptAllDataInterface =
            await response.json();

        return result;
    } catch (error) {
        console.log("SERVER ERROR:", error);
        return null;
    }
};
export const updateSalesScript = async (id: string, data: salesScriptAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.SALESSCRIPT.UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result: salesScriptAllDataInterface =
            await response.json();

        return result;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const deleteSalesScript = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.SALESSCRIPT.DELETE(id), {
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
