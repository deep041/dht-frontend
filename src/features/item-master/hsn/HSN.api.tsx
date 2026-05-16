import API from "../../../services/api";

export const getHSNList = async () => {
    try {
        const response = await API.get("/hsn");
        return response.data;
    } catch (error) {
        console.error("Error fetching hsn:", error);
        throw error;
    }
}

export const createHSN = async (payload: any) => {
    try {
        const response = await API.post("/hsn", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching banks:", error);
        throw error;
    }
}