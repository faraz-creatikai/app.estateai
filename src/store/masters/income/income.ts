import { API_ROUTES } from "@/constants/ApiRoute";
import { incomeAllDataInterface } from "./income.interface";

export const getIncome = async () => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.INCOME.GET_ALL, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("SERVER ERROR:", error);
        return null;
    }
};

export const getIncomeById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.INCOME.GET_BY_ID(id), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("SERVER ERROR:", error);
        return null;
    }
};

export const getFilteredIncome = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.INCOME.GET_BY_PARAMS(params), {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("SERVER ERROR:", error);
        return null;
    }
};

export const addIncome = async (data: incomeAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.INCOME.ADD, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return data;
    } catch (error) {
        console.log("SERVER ERROR:", error);
        return null;
    }
};

export const updateIncome = async (id: string, data: incomeAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.INCOME.UPDATE(id), {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return data;
    } catch (error) {
        console.log("SERVER ERROR:", error);
        return null;
    }
};

export const deleteIncome = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.INCOME.DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("SERVER ERROR:", error);
        return null;
    }
};
