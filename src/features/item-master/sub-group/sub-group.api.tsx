import API from "../../../services/api";

export const getSubGroups = async () => {
    try {
        const response = await API.get("/sub-group");
        return response.data;
    } catch (error) {
        console.error("Error fetching sub group:", error);
        throw error;
    }
}

export const createSubGroup = async (payload: any) => {
    try {
        const response = await API.post("/sub-group", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching sub group:", error);
        throw error;
    }
}