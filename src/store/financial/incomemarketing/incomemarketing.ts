// note do not use any

import { API_ROUTES } from "@/constants/ApiRoute"
import { IncomeMarketingAllDataInterface } from "./incomemarketing.interface";

export const getIncomeMarketing = async () => {
    try {
        const response = await fetch(API_ROUTES.FINANCIAL.INCOMEMARKETING.GET_ALL,{credentials: "include"});
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

export const getIncomeMarketingById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.FINANCIAL.INCOMEMARKETING.GET_BY_ID(id),{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getFilteredIncomeMarketing = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.FINANCIAL.INCOMEMARKETING.GET_BY_PARAMS(params),{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const addIncomeMarketing = async (data:IncomeMarketingAllDataInterface) => {
  try {

    console.log("Adding Income Marketing with data:", data);
    const response = await fetch(API_ROUTES.FINANCIAL.INCOMEMARKETING.ADD, {
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


export const updateIncomeMarketing = async (id: string, data:IncomeMarketingAllDataInterface) => {
  try {
   
    const response = await fetch(API_ROUTES.FINANCIAL.INCOMEMARKETING.UPDATE(id), {
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

export const deleteIncomeMarketing = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.FINANCIAL.INCOMEMARKETING.DELETE(id),
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