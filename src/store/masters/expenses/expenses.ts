import { API_ROUTES } from "@/constants/ApiRoute";
import { expensesAllDataInterface } from "./expenses.interface";

export const getExpenses = async () => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.EXPENSES.GET_ALL, {
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

export const getExpensesById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.EXPENSES.GET_BY_ID(id), {
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

export const getFilteredExpenses = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.EXPENSES.GET_BY_PARAMS(params), {
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

export const addExpenses = async (data: expensesAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.EXPENSES.ADD, {
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

export const updateExpenses = async (id: string, data: expensesAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.MASTERS.EXPENSES.UPDATE(id), {
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

export const deleteExpenses = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.MASTERS.EXPENSES.DELETE(id), {
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
