import { useAuth } from "@/context/AuthContext";
import { getMyActiveAgents } from "@/store/auth";
import toast from "react-hot-toast";


export const useAIAgents = () => {
    const { admin } = useAuth();

    const fetchMyAgents = async () => {
        if (!admin) return [];

        try {
            // 1. Single optimized call for both Admins and Users
            const response = await getMyActiveAgents();
            
            // 2. Safely unwrap Axios (.data.data) or Standard Fetch (.data)
            const payload = response?.data ? response.data : response?.data;

            if (!payload || !Array.isArray(payload)) {
                return [];
            }

            // 3. Normalize the ID format for the UI component and return
            return payload.map((e: any) => ({
                ...e,
                id: e.id || e._id, 
            }));

        } catch (error) {
            console.error("Failed to fetch assigned agents:", error);
            toast.error("Failed to get AI Agents, try again later");
            return [];
        }
    };

    return { fetchMyAgents };
};