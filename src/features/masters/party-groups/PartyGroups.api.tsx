import API from "../../../services/api";

export const getPartyGroup = async () => {
    try {
        const response = await API.get("/party-group");
        return response.data;
    } catch (error) {
        console.error("Error fetching party group:", error);
        throw error;
    }
}

export const savePartyGroup = async (payload: any) => {
    try {
        const response = await API.post("/party-group", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching party group:", error);
        throw error;
    }
}