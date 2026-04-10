// note do not use any

import { API_ROUTES } from "@/constants/ApiRoute"
import { contactAllDataInterface } from "./contact.interface";
import { customerAllDataInterface, customerAssignInterface, customerCheckDuplicateInterface, customerDeletePayloadInterface } from "./customer.interface";
import toast from "react-hot-toast";

export const getCustomer = async () => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.GET_ALL, { credentials: "include" });
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

export const getCustomerById = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.GET_BY_ID(id), { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const getTodayCustomer = async () => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.GET_TODAY_ALL, { credentials: "include" });
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

export const getFavoutiteCustomer = async () => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.GET_FAVOURITES_CUSTOMER, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log(data)
    return data.data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}



export const getFilteredCustomer = async (params: string) => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.GET_BY_PARAMS(params), { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    console.log(" params : ", params,"\n"," Data:", data)
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const getDuplicateContacts = async (data: any) => {
    try {
        let response = await fetch(API_ROUTES.CUSTOMER.CHECKDUPLICATES,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return response;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const addCustomer = async (formData: FormData) => {
  try {

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(API_ROUTES.CUSTOMER.ADD, {
      method: "POST",
      body: formData,
      credentials: "include"
    });


    const result = await response.json();
    if (!result.success) {
      toast.error(result.message ?? "Something went wrong")
      throw new Error(result.message ?? "Something went wrong")
    }
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};

export const importCustomer = async (formData: FormData) => {
  try {

    /* for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    } */


    const response = await fetch(API_ROUTES.CUSTOMER.CUSTOMERIMPORT, {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(" import customer result ", result)
    if (!result.success) {
      toast.error(result.message ?? "Something went wrong")
      throw new Error(result.message ?? "Something went wrong")
    }
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};

export const customerExcelHeaders = async (formData: FormData) => {
  try {

    /* for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    } */
    const response = await fetch(API_ROUTES.CUSTOMER.CUSTOMEREXCELHEADERS, {
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

export const assignCustomer = async (data: customerAssignInterface) => {
  try {

    console.log("assign customer data ", data)
    const response = await fetch(API_ROUTES.CUSTOMER.ASSIGNCUSTOMER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(" assign customer api , response ", result)
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};




export const updateCustomer = async (id: string, formData: FormData) => {
  try {



    //Don't manually set "Content-Type" — fetch will handle it for FormData
    const response = await fetch(API_ROUTES.CUSTOMER.UPDATE(id), {
      method: "PUT",
      body: formData,
      credentials: "include"
    });

    const result = await response.json();
    if (!result.success) {
      toast.error(result.message ?? "Something went wrong")
      throw new Error(result.message ?? "Something went wrong")
    }
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};

export const deleteCustomer = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.DELETE(id),
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

export const deleteAllCustomer = async (payload: customerDeletePayloadInterface) => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.DELETEALL,
      {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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


export const getQualification = async (data: any) => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.QUALIFYCUSTOMER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const json = await response.json(); // ✅ new variable
    return json;

  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const getRecommendedCustomers = async (data: any) => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.RECOMENDCUSTOMER, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const json = await response.json(); // ✅ new variable
    return json;

  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};

export const dataMining= async () => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.DATAMINING, { credentials: "include" });
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

export const startCallByAIAgent = async (data: any) => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.AGENTCALLING, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include"
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const json = await response.json(); // ✅ new variable
    return json;

  } catch (error) {
    console.log("SERVER ERROR: ", error);
    return null;
  }
};



export const getCallLogs = async () => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.GETCALLLOGS, { credentials: "include" });
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

export const getCallReport = async () => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.GETCALLREPORT, { credentials: "include" });
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

export const deleteCallLog = async (id: string) => {
  try {
    const response = await fetch(API_ROUTES.CUSTOMER.DELETECALLLOG(id),
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
