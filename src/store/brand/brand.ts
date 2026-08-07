import { API_ROUTES } from "@/constants/ApiRoute";


export interface BrandSettingsData {
    id?: number;
    appName?: string;
    shortName?: string;
    primaryColor?: string;
    themeColor?: string;
    backgroundColor?: string;
    faviconUrl?: string;
    logoIconUrl?: string;
    logoTextUrl?: string;
    splashScreenUrl?: string;
    icon192Url?: string;
    icon512Url?: string;
}

export const getBrandSettings = async () => {
    try {
        const response = await fetch(API_ROUTES.BRAND.GET, {
            method: "GET",
            cache: "no-store",
            headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};

export const updateBrandSettings = async (formData: FormData) => {
    try {
        const response = await fetch(API_ROUTES.BRAND.UPDATE, {
            method: "PUT",
            credentials: "include", // Required to authenticate admin
            body: formData,
        });
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.log("SERVER ERROR: ", error);
        return null;
    }
};