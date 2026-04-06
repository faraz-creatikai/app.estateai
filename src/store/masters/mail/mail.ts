import { API_ROUTES } from "@/constants/ApiRoute";
import { mailAllContactInterface, mailAllCustomerInterface, mailAllDataInterface } from "./mail.interface";

export const getMail = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.GET_ALL, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include"
    });
    
   
   // console.log("mail data ",data)
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
     const data = await response.json();
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const getMailById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.GET_BY_ID(id), {
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

export const getFilteredMail = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.GET_BY_PARAMS(params), {
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

export const addMail = async (data: mailAllDataInterface) => {
  try {
    const payload={...data,type:'email'}
    const response = await fetch(API_ROUTES.MASTERS.MAIL.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const updateMail = async (id: string, data: mailAllDataInterface) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.UPDATE(id), {
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

export const deleteMail = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.MAIL.DELETE(id), {
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

export const emailAllCustomer = async (data: mailAllCustomerInterface) => {
  try {

    console.log("emailall customer data ", data)
    const response = await fetch(API_ROUTES.MASTERS.MAIL.MAILALL, {
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

export const emailAllContact = async (data: mailAllContactInterface) => {
  try {

    console.log("emailall customer data ", data)
    const response = await fetch(API_ROUTES.MASTERS.MAIL.MAILALL, {
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
