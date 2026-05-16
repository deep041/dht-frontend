import API from '../../../services/api';

// Get all quotations
export const getQuotations = async () => {
    try {
        const response = await API.get('/quotation');
        return response.data;
    } catch (error) {
        console.error('Error fetching quotations:', error);
        throw error;
    }
};

// Get quotation by ID
export const getQuotationById = async (id: string | number) => {
    try {
        const response = await API.get(`/quotation/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quotation:', error);
        throw error;
    }
};

// Get quotations by customer
export const getQuotationsByCustomer = async (customerId: string | number) => {
    try {
        const response = await API.get(`/quotation/customer/${customerId}`);
        return response.data;
    } catch (error) {
        console.error('Error fetching quotations by customer:', error);
        throw error;
    }
};

// Create quotation
export const createQuotation = async (data: any) => {
    try {
        const response = await API.post('/quotation', data);
        return response.data;
    } catch (error) {
        console.error('Error creating quotation:', error);
        throw error;
    }
};

// Update quotation
export const updateQuotation = async (id: string | number, data: any) => {
    try {
        const response = await API.put(`/quotation/${id}`, data);
        return response.data;
    } catch (error) {
        console.error('Error updating quotation:', error);
        throw error;
    }
};

// Delete quotation
export const deleteQuotation = async (id: string | number) => {
    try {
        const response = await API.delete(`/quotation/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error deleting quotation:', error);
        throw error;
    }
};
