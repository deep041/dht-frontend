import API from "../../../../services/api";

export const getPlantUnit = async () => {
    try {
        const response = await API.get("/plant-unit");
        return response.data;
    } catch (error) {
        console.error("Error fetching plant unit:", error);
        throw error;
    }
}

export const getStates = async (countryCode) => {
    try {
        const response = await API.get("/common/states?country_id=" + countryCode);
        return response.data;
    } catch (error) {
        console.error("Error fetching states:", error);
        throw error;
    }
}

export const getCountries = async () => {
    try {
        const response = await API.get("/common/country");
        return response.data;
    } catch (error) {
        console.error("Error fetching country:", error);
        throw error;
    }
}

export const savePlantUnit = async (payload: any) => {
    try {
        const response = await API.post("/plant-unit", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching plant unit:", error);
        throw error;
    }
}