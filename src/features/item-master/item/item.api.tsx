import API from "../../../services/api";

export const getItems = async () => {
    try {
        const response = await API.get("/item");
        return response.data;
    } catch (error) {
        console.error("Error fetching items:", error);
        throw error;
    }
}

export const createItem = async (payload: any) => {
    try {
        const response = await API.post("/item", payload);
        return response.data;
    } catch (error) {
        console.error("Error creating item:", error);
        throw error;
    }
}