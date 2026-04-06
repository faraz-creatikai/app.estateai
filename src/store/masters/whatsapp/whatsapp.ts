import { API_ROUTES } from "@/constants/ApiRoute";
import { whatsappAllContactInterface, whatsappAllCustomerInterface, whatsappAllDataInterface } from "./whatsapp.interface";

export const getWhatsapp = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.WHATSAPP.GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const getWhatsappById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.WHATSAPP.GET_BY_ID(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const getFilteredWhatsapp = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.WHATSAPP.GET_BY_PARAMS(params), {
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
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const addWhatsapp = async (payload:FormData) => {
  try {
   /*  const payload = { ...data, type: 'whatsapp' } */
    let response = await fetch(API_ROUTES.MASTERS.WHATSAPP.ADD, {
      method: "POST",
      body: payload,
      credentials: "include"
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);

      const message =
        errorData?.message ||
        errorData?.error ||
        `HTTP error! status: ${response.status}`;

      throw new Error(message);
    }
    response = await response.json();
    return response;
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const updateWhatsapp = async (id: string, payload:FormData) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.WHATSAPP.UPDATE(id), {
      method: "PUT",
      body: payload,
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
   
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const deleteWhatsapp = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.WHATSAPP.DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const whatsappAllCustomer = async (data: whatsappAllCustomerInterface) => {
  try {

    console.log("whatsappall contact data ", data)
    const response = await fetch(API_ROUTES.MASTERS.WHATSAPP.WHATSAPPALL, {
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

export const whatsappAllContact = async (data: whatsappAllContactInterface) => {
  try {

    console.log("whatsappall contact data ", data)
    const response = await fetch(API_ROUTES.MASTERS.WHATSAPP.WHATSAPPALL, {
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


