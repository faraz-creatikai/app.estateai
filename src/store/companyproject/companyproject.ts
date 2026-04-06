// note do not use any

import { API_ROUTES } from "@/constants/ApiRoute"

export const getCompanyProjects = async () => {
    try {
        const response = await fetch(API_ROUTES.COMPANYPROJECTS.GET_ALL,{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log(data)
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getCompanyProjectsById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.COMPANYPROJECTS.GET_BY_ID(id),{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const getFilteredCompanyProjects = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.COMPANYPROJECTS.GET_BY_PARAMS(params),{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const addCompanyProjects = async (formData:FormData) => {
  try {

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(API_ROUTES.COMPANYPROJECTS.ADD, {
      method: "POST",
      body: formData,
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


export const updateCompanyProjects = async (id: string, formData: FormData) => {
  try {
   
    

    //Don't manually set "Content-Type" — fetch will handle it for FormData
    const response = await fetch(API_ROUTES.COMPANYPROJECTS.UPDATE(id), {
      method: "PUT",
      body: formData,
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

export const deleteCompanyProjects = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.COMPANYPROJECTS.DELETE(id),
            {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;

    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}