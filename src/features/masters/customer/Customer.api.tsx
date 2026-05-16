import API from "../../../services/api";

export const getCustomers = async () => {
    try {
        const response = await API.get("/customers");
        return response.data;
    } catch (error) {
        console.error("Error fetching department:", error);
        throw error;
    }
}

export const createCustomer = async (payload: any) => {
    try {
        const response = await API.post("/customers", payload);
        return response.data;
    } catch (error) {
        console.error("Error fetching regions:", error);
        throw error;
    }
};

export const getCustomerContactPersons = async (customerId: string | number) => {
    try {
        const response = await API.get(`/customers/${customerId}/contact-persons`);
        return response.data;
    } catch (error) {
        console.error("Error fetching customer contact persons:", error);
        throw error;
    }
};