import API from "../../../services/api";

export const getRawMaterials = async () => {
    try {
        const response = await API.get("/raw-material");
        return response.data;
    } catch (error) {
        console.error("Error fetching raw materials:", error);
        throw error;
    }
}

export const createRawMaterial = async (payload: any) => {
    try {
        const response = await API.post("/raw-material", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching raw material:", error);
        throw error;
    }
}