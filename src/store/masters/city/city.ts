import { API_ROUTES } from "@/constants/ApiRoute";
import { cityAllDataInterface } from "./city.interface";

//  Get all cities
export const getCity = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CITY.GET_ALL,{
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
    console.log("SERVER ERROR:", error);
    return null;
  }
};

//  Get city by ID
export const getCityById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CITY.GET_BY_ID(id),{
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
    console.log("SERVER ERROR:", error);
    return null;
  }
};

//  Get city by filter params
export const getFilteredCity = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CITY.GET_BY_PARAMS(params),{
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
    console.log("SERVER ERROR:", error);
    return null;
  }
};

// Add a new city
export const addCity = async (data: cityAllDataInterface) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.CITY.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return null;
  }
};

// Update an existing city
export const updateCity = async (id: string, data: cityAllDataInterface) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.CITY.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return null;
  }
};

// Delete a city
export const deleteCity = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.CITY.DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include"
    });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR:", error);
    return null;
  }
};
