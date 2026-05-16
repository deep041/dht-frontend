import API from "../../../services/api";

export const getCategories = async () => {
    try {
        const response = await API.get("/category");
        return response.data;
    } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
    }
}

export const createCategory = async (payload: any) => {
    try {
        const response = await API.post("/category", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching category:", error);
        throw error;
    }
}