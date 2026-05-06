import { API_ROUTES } from "@/constants/ApiRoute";
import { AutoSocialAgentData } from "./socialMedia.interface";

export const getInstagramLivePosts = async () => {
  try {
    const response = await fetch(API_ROUTES.SOCIALMEDIA.INSTAGRAM.GET_LIVE_POST, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}
export const getInstagramAnalytics = async () => {
  try {
    const response = await fetch(API_ROUTES.SOCIALMEDIA.INSTAGRAM.GET_ANALYTICS, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const disconnectAccount = async () => {
    try {
        const response = await fetch(API_ROUTES.SOCIALMEDIA.INSTAGRAM.DISCONNECT_ACCOUNT,
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

export const scheduleInstagramPost = async (formData: FormData) => {
  try {

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(API_ROUTES.SOCIALMEDIA.INSTAGRAM.SCHEDULE_POST, {
      method: "POST",
      body: formData,
      credentials: "include"
    });


    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message ?? "Something went wrong")
    }
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};


export const getInstagramScheduledPosts = async (params:string) => {
  try {
    const response = await fetch(API_ROUTES.SOCIALMEDIA.INSTAGRAM.GET_SCHEDULED_POST(params), { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}


//facebook

export const getFacebookLivePosts = async () => {
  try {
    const response = await fetch(API_ROUTES.SOCIALMEDIA.FACEBOOK.GET_LIVE_POST, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const getFacebookAnalytics = async () => {
  try {
    const response = await fetch(API_ROUTES.SOCIALMEDIA.FACEBOOK.GET_ANALYTICS, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const disconnectFacebookAccount = async () => {
    try {
        const response = await fetch(API_ROUTES.SOCIALMEDIA.FACEBOOK.DISCONNECT_ACCOUNT,
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

export const scheduleFacebookPost = async (formData: FormData) => {
  try {

    for (let [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    const response = await fetch(API_ROUTES.SOCIALMEDIA.FACEBOOK.SCHEDULE_POST, {
      method: "POST",
      body: formData,
      credentials: "include"
    });


    const result = await response.json();
    if (!result.success) {
      throw new Error(result.message ?? "Something went wrong")
    }
    return result;
  } catch (error) {
    console.error("SERVER ERROR: ", error);
    return null;
  }
};

export const getFacebookScheduledPosts = async (params:string) => {
  try {
    const response = await fetch(API_ROUTES.SOCIALMEDIA.FACEBOOK.GET_SCHEDULED_POST(params), { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}



export const runAutoSocialAgent = async (formData: FormData) => {
    try {
        const response = await fetch(API_ROUTES.SOCIALMEDIA.AUTOSOCIALAGENT.RUN,
            {
                method: "POST",
  /*               headers: { "Content-Type": "application/json" }, */
                body: formData,
                credentials: "include"
            }
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        return result;

    }
    catch (error) {
        console.log("SERVER ERROR: ", error)
        return null;
    }
}