import API from "../../services/api";

export const getMenus = async () => {
    try {
        const response = await API.get("/menus");
        return response.data;
    } catch (error) {
        console.error("Error fetching roles:", error);
        throw error;
    }
}