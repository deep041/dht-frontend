import API from "../../../services/api";

export const getDepartments = async () => {
    try {
        const response = await API.get("/department");
        return response.data;
    } catch (error) {
        console.error("Error fetching department:", error);
        throw error;
    }
}

export const saveDepartment = async (payload: any) => {
    try {
        const response = await API.post("/department", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
}