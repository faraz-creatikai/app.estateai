import { API_ROUTES } from "@/constants/ApiRoute";
import { requestUserAllDataInterface } from "./requestusers.interface";


export const getRequestUsers = async () => {
    try {
        const response = await fetch(API_ROUTES.REQUESTUSER.GET_ALL,{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        
        return data.data;
        
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const registerRequestUser = async (data: requestUserAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.REQUESTUSER.SIGNUP,
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

export const acceptRequest = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.REQUESTUSER.ACCEPTREQUEST(id),
            {
                method: "POST",
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

export const denyRequest = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.REQUESTUSER.DENYREQUEST(id),
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








