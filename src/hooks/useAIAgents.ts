import { useAuth } from "@/context/AuthContext";
import { getAIAgent } from "@/store/aiagent/aiagent";
import { getAdminById } from "@/store/auth";
import toast from "react-hot-toast";

export const useAIAgents = () => {
    const { admin } = useAuth();

    const getUserAgents = async () => {

        /*  const res = await getAIAgent();
      console.log(" user agents are ",res) */

        if (admin) {
            const res = await getAdminById(admin._id as string);

            if (!res) {
                toast.error(" failed to get Ai Agents, try again later ");
                return;
            }

            const AssignedAIAgents = res.adminData?.assignedAIAgents.filter((e: any) => e.status === "Active");
            console.log(" user assigned agents naruto", AssignedAIAgents)
            return AssignedAIAgents;
        }

        return [];
    };

    const getAdminAgents = async () => {
        let res = await getAIAgent();
        res = res.map((e: any) => ({
            id: e._id,
            ...e,
        }));
        res = res.filter((e: any) => e.status === "Active")
        return res;
    }

    return { getUserAgents, getAdminAgents };
};