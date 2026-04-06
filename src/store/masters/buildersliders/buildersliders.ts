import { API_ROUTES } from "@/constants/ApiRoute";
import { builderslidersAllDataInterface } from "./buildersliders.interface";

// 🟩 Get All Buildersliders
export const getBuildersliders = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.BUILDERSLIDERS.GET_ALL, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.log("SERVER ERROR (getBuildersliders): ", error);
    return null;
  }
};

// 🟩 Get Amenity by ID
export const getBuilderslidersById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.BUILDERSLIDERS.GET_BY_ID(id), {
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
    console.log("SERVER ERROR (getBuilderslidersById): ", error);
    return null;
  }
};

// 🟩 Get Filtered Buildersliders
export const getFilteredBuildersliders = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.BUILDERSLIDERS.GET_BY_PARAMS(params), {
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
    console.log("SERVER ERROR (getFilteredBuildersliders): ", error);
    return null;
  }
};

// 🟩 Add Amenity
export const addBuildersliders = async (formData:FormData) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.BUILDERSLIDERS.ADD, {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    response = await response.json();
    return response;
  } catch (error) {
    console.log("SERVER ERROR (addBuildersliders): ", error);
    return null;
  }
};

// 🟩 Update Amenity
export const updateBuildersliders = async (id: string, formData:FormData) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.BUILDERSLIDERS.UPDATE(id), {
      method: "PUT",
      body: formData,
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    response = await response.json();
    return response;
  } catch (error) {
    console.log("SERVER ERROR (updateBuildersliders): ", error);
    return null;
  }
};

// 🟩 Delete Amenity
export const deleteBuildersliders = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.BUILDERSLIDERS.DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (deleteBuildersliders): ", error);
    return null;
  }
};
