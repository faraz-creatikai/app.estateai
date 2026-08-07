// note: do not use any

import { API_ROUTES } from "@/constants/ApiRoute";
import { aiagentAllDataInterface, aiagentAssignInterface } from "./aiagent.interface";


export const getAIAgent = async () => {
    try {
        const response = await fetch(API_ROUTES.AIAGENT.GET_ALL, {
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

export const getAIAgentById = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.AIAGENT.GET_BY_ID(id), {
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

export const getFilteredAIAgent = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.AIAGENT.GET_BY_PARAMS(params), {
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

export const addAIAgent = async (data: aiagentAllDataInterface) => {
    try {
        let response = await fetch(API_ROUTES.AIAGENT.ADD, {
            method: "POST",
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

export const updateAIAgent = async (id: string, data: any) => {
    try {
        let response = await fetch(API_ROUTES.AIAGENT.UPDATE(id), {
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

export const deleteAIAgent = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.AIAGENT.DELETE(id), {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
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

export const assignAIAgent = async (data: aiagentAssignInterface) => {
    try {

        console.log("assign customer data ", data)
        const response = await fetch(API_ROUTES.AIAGENT.ASSIGNAIAGENT, {
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


export const runWebhookAgent = async (data: any) => {
    try {
        let response = await fetch(API_ROUTES.AIAGENT.RUNWEBHOOKAGENT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        console.log(" response is ", response)
        return response;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const compareProductPrice = async (data: any) => {
    try {
        let response = await fetch(API_ROUTES.AIAGENT.COMPARE_PRODUCT_PRICE, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        console.log(" response is ", response)
        return response;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};



//video project api routes



export const addVideoProjectPhoto = async (formData: FormData) => {
    try {
        let response = await fetch(API_ROUTES.VIDEOPROJECT.ADDPHOTOS, {
            method: "POST",
            body: formData,
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        console.log(" response is ", response)
        return response;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const generateVideoProjectScript = async (data: any) => {
    try {
        let response = await fetch(API_ROUTES.VIDEOPROJECT.GENERATESCRIPT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        console.log(" response is ", response)
        return response;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

// CHANGED: the /render endpoint always expects multipart/form-data (it may
// carry an uploaded voiceover audio file alongside the JSON-ish fields), so
// this now takes a FormData directly instead of building a JSON body.
// Build it like:
//   const fd = new FormData()
//   fd.append("mode", mode)
//   fd.append("voiceoverMethod", voiceoverMethod)
//   fd.append("photoFileNames", JSON.stringify([...]))
//   fd.append("scriptContent", JSON.stringify([...]))
//   if (voiceoverMethod === "uploaded_voice") fd.append("uploadedVoiceover", file)
export const renderVideoProject = async (formData: FormData) => {
    try {
        let response = await fetch(API_ROUTES.VIDEOPROJECT.RENDER, {
            method: "POST",
            body: formData,
            credentials: "include"
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        console.log(" response is ", response)
        return response;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};