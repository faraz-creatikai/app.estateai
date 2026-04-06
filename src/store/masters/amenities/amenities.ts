import { API_ROUTES } from "@/constants/ApiRoute";
import { amenitiesAllDataInterface } from "./amenities.interface";

// 🟩 Get All Amenities
export const getAmenities = async () => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.AMENITIES.GET_ALL, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (getAmenities): ", error);
    return null;
  }
};

// 🟩 Get Amenity by ID
export const getAmenitiesById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.AMENITIES.GET_BY_ID(id), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (getAmenitiesById): ", error);
    return null;
  }
};

// 🟩 Get Filtered Amenities
export const getFilteredAmenities = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.AMENITIES.GET_BY_PARAMS(params), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (getFilteredAmenities): ", error);
    return null;
  }
};

// 🟩 Add Amenity
export const addAmenities = async (data: amenitiesAllDataInterface) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.AMENITIES.ADD, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    response = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (addAmenities): ", error);
    return null;
  }
};

// 🟩 Update Amenity
export const updateAmenities = async (id: string, data: amenitiesAllDataInterface) => {
  try {
    let response = await fetch(API_ROUTES.MASTERS.AMENITIES.UPDATE(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    response = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (updateAmenities): ", error);
    return null;
  }
};

// 🟩 Delete Amenity
export const deleteAmenities = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.MASTERS.AMENITIES.DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.log("SERVER ERROR (deleteAmenities): ", error);
    return null;
  }
};
