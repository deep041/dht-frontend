import API from "../../../services/api";

export const getClassifications = async () => {
    try {
        const response = await API.get("/classification");
        return response.data;
    } catch (error) {
        console.error("Error fetching hsn:", error);
        throw error;
    }
}

export const createClassification = async (payload: any) => {
    try {
        const response = await API.post("/classification", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching banks:", error);
        throw error;
    }
}