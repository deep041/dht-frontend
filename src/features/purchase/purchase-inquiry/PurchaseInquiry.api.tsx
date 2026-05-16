import API from '../../../services/api';

export const getPurchaseInquiries = async () => {
    const response = await API.get('/purchase-inquiry');
    return response.data;
};

export const getPurchaseInquiryById = async (id: string | number) => {
    const response = await API.get(`/purchase-inquiry/${id}`);
    return response.data;
};

export const createPurchaseInquiry = async (data: any) => {
    const response = await API.post('/purchase-inquiry', data);
    return response.data;
};

export const updatePurchaseInquiry = async (id: string | number, data: any) => {
    const response = await API.put(`/purchase-inquiry/${id}`, data);
    return response.data;
};

export const deletePurchaseInquiry = async (id: string | number) => {
    const response = await API.delete(`/purchase-inquiry/${id}`);
    return response.data;
};
