import API from "../../../../services/api";

export const getPlantUnits = async () => {
    try {
        const response = await API.get("/plant-unit");
        return response.data;
    } catch (error) {
        console.error("Error fetching Plant Units:", error);
        throw error;
    }
}

export const getWarehouses = async () => {
    try {
        const response = await API.get("/warehouses");
        return response.data;
    } catch (error) {
        console.error("Error fetching warehouses:", error);
        throw error;
    }
}

export const saveWarehouses = async (payload: any) => {
    try {
        const response = await API.post("/warehouses", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching warehouses:", error);
        throw error;
    }
}