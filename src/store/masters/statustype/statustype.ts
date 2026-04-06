import { API_ROUTES } from "@/constants/ApiRoute";
import { statustypeAllDataInterface } from "./statustype.interface";

export const getStatusType = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.STATUSTYPE.GET_ALL, {
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

export const getStatusTypeById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.STATUSTYPE.GET_BY_ID(id), {
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

export const getFilteredStatusType = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.STATUSTYPE.GET_BY_PARAMS(params), {
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

export const addStatusType = async (data: statustypeAllDataInterface) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.STATUSTYPE.ADD, {
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

export const updateStatusType = async (id: string, data: statustypeAllDataInterface) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.STATUSTYPE.UPDATE(id), {
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

export const deleteStatusType = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.STATUSTYPE.DELETE(id), {
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
