// contactFollowups.ts
import { API_ROUTES } from "@/constants/ApiRoute";
import {
  contactFollowupAllDataInterface,
  contactFollowupGetDataInterface,
  ContactFollowupAdvInterface,
} from "./contactFollowups.interface";

// Get all contact followups
export const getAllContactFollowups = async (): Promise<contactFollowupGetDataInterface[] | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CONTACT.GET_ALL,{
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log(" contact followups ", data);
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR (getAllContactFollowups):", error);
    return null;
  }
};

// Get all followups of a specific contact
export const getFollowupByContactId = async (id: string): Promise<contactFollowupAllDataInterface[] | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CONTACT.GET_CONTACT_FOLLOWUP(id),{
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    // console.log("followups for contact", data)
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR (getFollowupByContactId):", error);
    return null;
  }
};

export const getFollowupByFollowupId = async (id: string): Promise<contactFollowupAllDataInterface | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CONTACT.GET_FOLLOWUP_By_ID(id));
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("contact followup ", data.data);
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR (getFollowupByFollowupId):", error);
    return null;
  }
};

// Get filtered followups (by params, for advanced filters)
export const getFilteredContactFollowups = async (params: string): Promise<contactFollowupGetDataInterface[] | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CONTACT.GET_BY_PARAMS(params), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR (getFilteredContactFollowups):", error);
    return null;
  }
};

// Add a new followup for a specific contact
export const addContactFollowup = async (
  id: string,
  data: contactFollowupAllDataInterface
): Promise<contactFollowupAllDataInterface | null> => {
  try {
    let response = await fetch(API_ROUTES.FOLLOWUPS.CONTACT.ADD(id), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    console.log("follwoup added  ",result)
    return result;
  } catch (error) {
    console.log("SERVER ERROR (addContactFollowup):", error);
    return null;
  }
};

// Update an existing contact followup
export const updateContactFollowup = async (
  id: string,
  data: contactFollowupAllDataInterface
): Promise<contactFollowupAllDataInterface | null> => {
  try {
    let response = await fetch(API_ROUTES.FOLLOWUPS.CONTACT.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const result = await response.json();
    return result;
  } catch (error) {
    console.log("SERVER ERROR (updateContactFollowup):", error);
    return null;
  }
};

// Delete a specific followup of a contact
export const deleteContactFollowup = async (id: string): Promise<{ success: boolean; message: string } | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CONTACT.CONTACT_FOLLOWUP_DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (deleteContactFollowup):", error);
    return null;
  }
};

// Delete a followup (using different endpoint)
export const deleteContactFollowupById = async (id: string): Promise<{ success: boolean; message: string } | null> => {
  try {
    const response = await fetch(API_ROUTES.FOLLOWUPS.CONTACT.FOLLOWUP_DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log("delete contact followup data ", data);
    return data;
  } catch (error) {
    console.log("SERVER ERROR (deleteContactFollowupById):", error);
    return null;
  }
};
