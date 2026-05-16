import API from "../../../services/api";

export const getMenus = async () => {
    try {
        const response = await API.get("/menus");
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
}

export const saveMenus = async (payload: any) => {
    try {
        const response = await API.post("/menus", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
}