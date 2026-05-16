import API from "../../../services/api";

export const getCompanyDetails = async () => {
    try {
        const response = await API.get("/company-details");
        return response.data;
    } catch (error) {
        console.error("Error fetching company details:", error);
        throw error;
    }
}

export const saveCompanyDetails = async (payload: any) => {
    try {
        const response = await API.post("/company-details", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching company details:", error);
        throw error;
    }
}