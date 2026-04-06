import { API_ROUTES } from "@/constants/ApiRoute";
import {
  customerFollowupAllDataInterface,
  customerFollowupGetDataInterface,
  CustomerFollowupAdvInterface,
  customerAiFollowupPayloadInterface,
} from "./customerFollowups.interface";

// Get all customer followups
export const getAllCustomerFollowups = async (): Promise<customerFollowupGetDataInterface[] | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.GET_ALL,{
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data= await response.json();
    //console.log(" follwoups ", data)
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR (getAllCustomerFollowups):", error);
    return null;
  }
};

// Get all followups of a specific customer
export const getFollowupByCustomerId = async (id: string): Promise<customerFollowupAllDataInterface[] | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.GET_CUSTOMER_FOLLOWUP(id),{
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    //console.log("naruto ",data)
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR (getFollowupByCustomerId):", error);
    return null;
  }
};

export const getFollowupByFollowupId = async (id: string): Promise<customerFollowupAllDataInterface | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.GET_FOLLOWUP_By_ID(id));
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("naruto ",data.data)
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR (getFollowupByCustomerId):", error);
    return null;
  }
};

//Get filtered followups (by params, for advanced filters)
export const getFilteredFollowups = async (params: string): Promise<customerFollowupGetDataInterface[] | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.GET_BY_PARAMS(params),{
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
    console.log("SERVER ERROR (getFilteredFollowups):", error);
    return null;
  }
};

// Add a new followup for a specific customer
export const addCustomerFollowup = async (
  id: string,
  data: customerFollowupAllDataInterface
): Promise<customerFollowupAllDataInterface | null> => {
  try {
    //console.log("customer followup data ",data)
    let response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.ADD(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result= await response.json();
    return result;
  } catch (error) {
    console.log("SERVER ERROR (addCustomerFollowup):", error);
    return null;
  }
};

// Update an existing followup
export const updateCustomerFollowup = async (
  id: string,
  data: customerFollowupAllDataInterface
): Promise<customerFollowupAllDataInterface | null> => {
  try {
    let response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("SERVER ERROR (updateCustomerFollowup):", error);
    return null;
  }
};

//Delete a specific followup of a customer
export const deleteCustomerFollowup = async (id: string): Promise<{ success: boolean; message: string } | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.CUSTOMER_FOLLOWUP_DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (deleteCustomerFollowup):", error);
    return null;
  }
};

//Delete a followup (using different endpoint)
export const deleteFollowup = async (id: string): Promise<{ success: boolean; message: string } | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.FOLLOWUP_DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("delete followup data ",data)
    return data;
  } catch (error) {
    console.log("SERVER ERROR (deleteFollowup):", error);
    return null;
  }
};

export const addAiFollowup = async (
 data: customerAiFollowupPayloadInterface
): Promise<any | null> => {
  try {
    //console.log("customer followup data ",data)
    let response = await fetch(API_ROUTES.FOLLOWUPS.CUSTOMER.ADDAIFOLLOWUP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result= await response.json();
    return result;
  } catch (error) {
    console.log("SERVER ERROR (addCustomerFollowup):", error);
    return null;
  }
};