import { API_ROUTES } from "@/constants/ApiRoute";


export const getMyNotifications = async () => {
    try {
        const response = await fetch(API_ROUTES.NOTIFICATIONS.GET_ALL, {
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

export const getFilteredNotifications = async (params: string) => {
    try {
        const response = await fetch(API_ROUTES.NOTIFICATIONS.GET_BY_PARAMS(params),{credentials: "include"});
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    }
    catch (error) {      
          console.log("SERVER ERROR: ", error)
        return null;
    }
}

export const markNotificationRead = async (id: string) => {
    try {
        const response = await fetch(API_ROUTES.NOTIFICATIONS.MARK_READ(id), {
            method: "POST",
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

export const markAllNotificationsRead = async () => {
    try {
        const response = await fetch(API_ROUTES.NOTIFICATIONS.MARK_ALL_READ, {
            method: "POST",
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