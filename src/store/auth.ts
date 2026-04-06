import { API_ROUTES } from "@/constants/ApiRoute";
import { Admin, LoginCredentials, AuthApiResponse, CreateAdminData } from "./auth.interface";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

// 🔓 PUBLIC ROUTES
export const signupAdmin = async (signupData: Admin): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(API_ROUTES.ADMIN.SIGNUP, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(signupData),
      credentials: "include",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: AuthApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error("SERVER ERROR (Signup): ", error);
    return { success: false, message: "Signup failed" };
  }
};

export const loginAdmin = async (loginData: LoginCredentials): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(API_ROUTES.ADMIN.LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(loginData),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: AuthApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error("SERVER ERROR (Login): ", error);
    return { success: false, message: "Login failed" };
  }
};

export const logoutAdmin = async (): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(API_ROUTES.ADMIN.LOGOUT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: AuthApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error("SERVER ERROR (Logout): ", error);
    return { success: false, message: "Logout failed" };
  }
};

// 🔐 PROTECTED ROUTES
export const checkAuthAdmin = async (): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(API_ROUTES.ADMIN.CHECK, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: AuthApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error("SERVER ERROR (Check Auth): ", error);
    return { success: false, message: "Auth check failed" };
  }
};

// 👤 ADMIN MANAGEMENT
export const createAdmin = async (adminData: CreateAdminData): Promise<AuthApiResponse> => {
  try {

    console.log("adming data is ", adminData)

    const res = await fetch(API_ROUTES.ADMIN.CREATE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adminData),
      credentials: "include",
    });

    /* */

    if (!res.ok) {
      const err: any = new Error(`HTTP error! status: ${res.status}`);
      err.status = res.status; // ✅ attach status manually
      throw err;
    }
    const data: AuthApiResponse = await res.json();
    return data;
  } catch (error:any) {
    console.error("SERVER ERROR (Create Admin):", error);
    let message="Admin creation failed";
    if(error.status===403){
      message="Access denied"
    }
    return { success: false, message: message };
  }
};


export const getAllAdmins = async (): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(API_ROUTES.ADMIN.GET_ALL, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: AuthApiResponse = await res.json();
    console.log("Admins fetched: ", data);
    return data;
  } catch (error) {
    console.error("SERVER ERROR (Get All Admins): ", error);
    return { success: false, message: "Failed to fetch admins" };
  }
};

export const getAdminById = async (id: string): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(API_ROUTES.ADMIN.GET_BY_ID(id), {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: AuthApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error("SERVER ERROR (Get Admin By ID): ", error);
    return { success: false, message: "Failed to fetch admin details" };
  }
};

export const updateAdminDetails = async (id: string, updatedData: Partial<Admin>): Promise<AuthApiResponse> => {
  try {

    const payload = {
      name: updatedData.FirstName,
      email: updatedData.Email,
      phone: updatedData.MobileNumber,
      city: updatedData.City,
      role: updatedData.Role,
      company: updatedData.Company,
      AddressLine1: updatedData.AddressLine1,
      AddressLine2: updatedData.AddressLine2,
    };
    const res = await fetch(API_ROUTES.ADMIN.UPDATE_DETAILS(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: AuthApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error("SERVER ERROR (Update Details): ", error);
    return { success: false, message: "Failed to update details" };
  }
};

export const updateAdminPassword = async (id: string, passwordData: { currentPassword: string; newPassword: string }): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(API_ROUTES.ADMIN.UPDATE_PASSWORD(id), {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(passwordData),
    });

   /*  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`); */
    const result: AuthApiResponse = await res.json();
    if (!result.success) {
      toast.error(result.message ?? "Something went wrong")
      throw new Error(result.message ?? "Something went wrong")
    }
    return result;
  } catch (error) {
    console.error("SERVER ERROR (Update Password): ", error);
    return { success: false, message: "Password update failed" };
  }
};

export const deleteAdmin = async (id: string): Promise<AuthApiResponse> => {
  try {
    const res = await fetch(API_ROUTES.ADMIN.DELETE(id), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: AuthApiResponse = await res.json();
    return data;
  } catch (error) {
    console.error("SERVER ERROR (Delete Admin): ", error);
    return { success: false, message: "Failed to delete admin" };
  }
};
