// note do not use any

import { API_ROUTES } from "@/constants/ApiRoute"
import { ExpenseMarketingAllDataInterface } from "./expensemarketing.interface";

export const getExpenseMarketing = async () => {
    try {
        const response = await fetch(API_ROUTES.FINANCIAL.EXPENSEMARKETING.GET_ALL,{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log(data)
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getExpenseMarketingById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.FINANCIAL.EXPENSEMARKETING.GET_BY_ID(id),{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getFilteredExpenseMarketing = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.FINANCIAL.EXPENSEMARKETING.GET_BY_PARAMS(params),{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const addExpenseMarketing = async (data:ExpenseMarketingAllDataInterface) => {
  try {

    console.log("Adding Income Marketing with data:", data);
    const response = await fetch(API_ROUTES.FINANCIAL.EXPENSEMARKETING.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};


export const updateExpenseMarketing = async (id: string, data:ExpenseMarketingAllDataInterface) => {
  try {
   
    // Exclude Status from the data being sent
    const response = await fetch(API_ROUTES.FINANCIAL.EXPENSEMARKETING.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};

export const deleteExpenseMarketing = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.FINANCIAL.EXPENSEMARKETING.DELETE(id),
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