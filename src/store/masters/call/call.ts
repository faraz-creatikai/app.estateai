import { API_ROUTES } from "@/constants/ApiRoute";
import { callAllCustomerInterface, callAllDataInterface } from "./call.interface";

export const callCustomer = async (data: callAllDataInterface) => {
  try {

    console.log("call customer data ", data)
    const response = await fetch(API_ROUTES.MASTERS.CALL.CALLCUSTOMER, {
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