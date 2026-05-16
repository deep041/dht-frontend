import API from "../../../services/api";

export const getZones = async () => {
    try {
        const response = await API.get("/zone");
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
}

export const getRegions = async () => {
    try {
        const response = await API.get("/region");
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
}

export const saveZones = async (payload: any) => {
    try {
        const response = await API.post("/zone", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
}