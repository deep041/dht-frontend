import API from "../../../services/api";

export const getBanks = async () => {
    try {
        const response = await API.get("/bank-accounts");
        return response.data;
    } catch (error) {
        console.error("Error fetching banks:", error);
        throw error;
    }
}

export const saveBanks = async (payload: any) => {
    try {
        const response = await API.post("/bank-accounts", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching banks:", error);
        throw error;
    }
}