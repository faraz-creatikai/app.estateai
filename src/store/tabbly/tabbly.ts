import { API_ROUTES } from "@/constants/ApiRoute";

export const getCurrentAgent = async () => {
    try {
        const response = await fetch(API_ROUTES.TABBLY.GETCURRENTAGENT,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const getAgentVoices = async () => {
    try {
        const response = await fetch(API_ROUTES.TABBLY.GETAGENTVOICES,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } 
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const updateCallingAgent = async (data:any) => {
    try {
        let response = await fetch(API_ROUTES.TABBLY.UPDATEAGENT, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return data;
    } 
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};