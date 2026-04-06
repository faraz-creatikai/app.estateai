import { API_ROUTES } from "@/constants/ApiRoute"
import { customerFieldsAllDataInterface } from "./customerfields.interface";


export const getCustomerFieldLabel = async () => {
    try {
        const response = await fetch(API_ROUTES.SETTINGS.CUSTOMERFIELDLABEL.GET_ALL, {
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
        console.log("SERVER ERROR: ", error)
        return null;
    }
}


export const updateCustomerFieldLabel = async (data: customerFieldsAllDataInterface[]) => {
    try {
        let response = await fetch(API_ROUTES.SETTINGS.CUSTOMERFIELDLABEL.UPDATE,
            {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        response = await response.json();
        return data;
    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}
