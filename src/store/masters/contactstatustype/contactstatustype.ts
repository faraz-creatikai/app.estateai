import { API_ROUTES } from "@/constants/ApiRoute";
import { contactstatustypeAllDataInterface } from "./contactstatustype.interface";


export const getContactStatusType = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CONTACTSTATUSTYPE.GET_ALL, {
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

export const getContactStatusTypeById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CONTACTSTATUSTYPE.GET_BY_ID(id), {
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

export const getFilteredContactStatusType = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CONTACTSTATUSTYPE.GET_BY_PARAMS(params), {
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

export const addContactStatusType = async (data: contactstatustypeAllDataInterface) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CONTACTSTATUSTYPE.ADD, {
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

export const updateContactStatusType = async (id: string, data: contactstatustypeAllDataInterface) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CONTACTSTATUSTYPE.UPDATE(id), {
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

export const deleteContactStatusType = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CONTACTSTATUSTYPE.DELETE(id), {
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
