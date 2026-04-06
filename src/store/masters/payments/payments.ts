import { API_ROUTES } from "@/constants/ApiRoute";
import { paymentsAllDataInterface } from "./payments.interface";

export const getPayments = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.PAYMENTS.GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const getPaymentsById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.PAYMENTS.GET_BY_ID(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const getFilteredPayments = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.PAYMENTS.GET_BY_PARAMS(params), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const addPayments = async (data: paymentsAllDataInterface) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.PAYMENTS.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const updatePayments = async (id: string, data: paymentsAllDataInterface) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.PAYMENTS.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const deletePayments = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.PAYMENTS.DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};
