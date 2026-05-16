import API from "../../../services/api";

export const getPaymentTerms = async () => {
    try {
        const response = await API.get("/payment-terms");
        return response.data;
    } catch (error) {
        console.error("Error fetching payment terms:", error);
        throw error;
    }
}

export const savePaymentTerms = async (payload: any) => {
    try {
        const response = await API.post("/payment-terms", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching payment terms:", error);
        throw error;
    }
}