import { API_ROUTES } from "@/constants/ApiRoute";
import { functionalareaAllDataInterface, functionalareaGetDataInterface } from "./functionalarea.interface";

// 🟩 Get all functional areas
export const getFunctionalAreas = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.FUNCTIONALAREA.GET_ALL, {
        method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data: functionalareaGetDataInterface[] = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (getFunctionalAreas): ", error);
    return null;
  }
};

// 🟩 Get functional area by ID
export const getFunctionalAreaById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.FUNCTIONALAREA.GET_BY_ID(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data: functionalareaGetDataInterface = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (getFunctionalAreaById): ", error);
    return null;
  }
};

// 🟩 Get filtered functional areas
export const getFilteredFunctionalAreas = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.FUNCTIONALAREA.GET_BY_PARAMS(params), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data: functionalareaGetDataInterface[] = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (getFilteredFunctionalAreas): ", error);
    return null;
  }
};

// 🟩 Add new functional area
export const addFunctionalArea = async (data: functionalareaAllDataInterface) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.FUNCTIONALAREA.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    response = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (addFunctionalArea): ", error);
    return null;
  }
};

// 🟩 Update functional area by ID
export const updateFunctionalArea = async (id: string, data: functionalareaAllDataInterface) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.FUNCTIONALAREA.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    response = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (updateFunctionalArea): ", error);
    return null;
  }
};

// 🟩 Delete functional area by ID
export const deleteFunctionalArea = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.FUNCTIONALAREA.DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (deleteFunctionalArea): ", error);
    return null;
  }
};
