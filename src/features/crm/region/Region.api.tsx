import API from "../../../services/api";

export const getRegions = async () => {
    try {
        const response = await API.get("/region");
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
}

export const saveRegions = async (payload: any) => {
    try {
        const response = await API.post("/region", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
}