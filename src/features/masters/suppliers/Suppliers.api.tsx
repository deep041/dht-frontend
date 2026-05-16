import API from "../../../services/api";

export const getSuppliers = async () => {
    try {
        const response = await API.get("/suppliers");
        return response.data;
    } catch (error) {
        console.error("Error fetching banks:", error);
        throw error;
    }
}

export const createSupplier = async (payload: any) => {
    try {
        const response = await API.post("/suppliers", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching banks:", error);
        throw error;
    }
}