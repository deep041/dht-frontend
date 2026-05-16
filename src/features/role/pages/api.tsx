import API from "../../../services/api";

export interface RolesResponse {
    success: boolean;
    responseCode: number;
    message: string;
    data: { role_name: string, id: number }[];
}

export const getRoles = async () => {
    try {
        const response = await API.get("/roles");
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
}

export const createRole = async (roleName: string) => {
    try {
        const response = await API.post("/roles", { role_name: roleName });
        return response.data;
    } catch (error) {
        console.error("Error creating role:", error);
        throw error;
    }
}