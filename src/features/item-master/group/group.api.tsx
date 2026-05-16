import API from "../../../services/api";

export const getGroups = async () => {
    try {
        const response = await API.get("/group");
        return response.data;
    } catch (error) {
        console.error("Error fetching group:", error);
        throw error;
    }
}

export const createGroup = async (payload: any) => {
    try {
        const response = await API.post("/group", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching group:", error);
        throw error;
    }
}