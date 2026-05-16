import API from "../../../services/api";

export const getUsers = async () => {
    try {
        const response = await API.get("/users");
        return response.data;
    } catch (error) {
        console.error("Error fetching company details:", error);
        throw error;
    }
}

export const getAuthUsers = async () => {
    try {
        const response = await API.get("/users/auth-users");
        return response.data;
    } catch (error) {
        console.error("Error fetching company details:", error);
        throw error;
    }
}

export const saveUsers = async (payload: any) => {
    try {
        const response = await API.post("/users", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching company details:", error);
        throw error;
    }
}