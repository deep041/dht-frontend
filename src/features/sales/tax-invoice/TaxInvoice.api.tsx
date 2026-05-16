import API from '../../../services/api';

export const getTaxInvoices = async () => {
    const response = await API.get('/tax-invoice');
    return response.data;
};

export const getTaxInvoiceById = async (id: string | number) => {
    const response = await API.get(`/tax-invoice/${id}`);
    return response.data;
};

export const createTaxInvoice = async (data: any) => {
    const response = await API.post('/tax-invoice', data);
    return response.data;
};

export const updateTaxInvoice = async (id: string | number, data: any) => {
    const response = await API.put(`/tax-invoice/${id}`, data);
    return response.data;
};

export const deleteTaxInvoice = async (id: string | number) => {
    const response = await API.delete(`/tax-invoice/${id}`);
    return response.data;
};
