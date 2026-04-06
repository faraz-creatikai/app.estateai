import { API_ROUTES } from "@/constants/ApiRoute";
import { subLocationAllDataInterface, subLocationDeleteAllPayloadInterface } from "./sublocation.interface";

export const getsubLocation = async () => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBLOCATION.GET_ALL, {
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

export const getsubLocationById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBLOCATION.GET_BY_ID(id), {
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

export const getsubLocationByCityLoc = async (cityId: string, locationId: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBLOCATION.GET_ALL_BY_CITY_LOCATION(cityId, locationId), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getFilteredsubLocation = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBLOCATION.GET_BY_PARAMS(params), {
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

export const addsubLocation = async (data: subLocationAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.SUBLOCATION.ADD, {
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

export const updatesubLocation = async (id: string, data: subLocationAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.SUBLOCATION.UPDATE(id), {
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

export const deletesubLocation = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBLOCATION.DELETE(id), {
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

export const deleteallsubLocation = async (payload: subLocationDeleteAllPayloadInterface) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.SUBLOCATION.DELETEALL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
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
