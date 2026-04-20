import { API_ROUTES } from "@/constants/ApiRoute";
import { SocialPost, SourceType, toLeadPayload } from "./socialContent.interface";


export const getRedditPosts = async (query: string) => {
  try {
    const response = await fetch(API_ROUTES.SOCIALCONTENT.REDDIT.GET_BY_QUERY(query), { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}



export const getFacebookPostsByQuery = async (query: string) => {
  try {
    const response = await fetch(API_ROUTES.SOCIALCONTENT.FACEBOOK.GET_BY_QUERY(query), { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const getFacebookPosts = async () => {
  try {
    const response = await fetch(API_ROUTES.SOCIALCONTENT.FACEBOOK.GET_ALL_POST, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}


export const scrapNewPosts = async (data: any) => {
  try {
    let response = await fetch(API_ROUTES.SOCIALCONTENT.FACEBOOK.SCRAPP_NEW_POSTS,
      {
        method: "POST",
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


export const getInstagramPosts = async () => {
  try {
    const response = await fetch(API_ROUTES.SOCIALCONTENT.INSTAGRAM.GET_ALL_POST, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const scrapNewInstaPosts = async (data: any) => {
  try {
    let response = await fetch(API_ROUTES.SOCIALCONTENT.INSTAGRAM.SCRAPP_NEW_POSTS,
      {
        method: "POST",
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




export const saveLeadsToDB = async (
  posts: SocialPost[],
  source: SourceType,
): Promise<{ saved: number; duplicates: number } | null> => {
  const leads = posts.map(p => toLeadPayload(p, source))
  try {
    let response = await fetch(API_ROUTES.SOCIALCONTENT.MINEDLEAD.SAVE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ leads }),
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    return data          // expects { saved: number, duplicates: number }
  } catch (error) {
    console.log('SERVER ERROR: ', error)
    return null
  }
}

export const getMinedLead = async () => {
  try {
    const response = await fetch(API_ROUTES.SOCIALCONTENT.MINEDLEAD.GET, { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const getFilteredMinedLead = async (query: string) => {
  try {
    const response = await fetch(API_ROUTES.SOCIALCONTENT.MINEDLEAD.GET_BY_QUERY(query), { credentials: "include" });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data;
  }
  catch (error) {
    console.log("SERVER ERROR: ", error)
    return null;
  }
}

export const convertMinedLead = async (
  leads: any
) => {

  try {
    let response = await fetch(API_ROUTES.SOCIALCONTENT.MINEDLEAD.CONVERT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leads),
      credentials: 'include',
    })
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    const data = await response.json()
    return data          // expects { saved: number, duplicates: number }
  } catch (error) {
    console.log('SERVER ERROR: ', error)
    return null
  }
}