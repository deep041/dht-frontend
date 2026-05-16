import API from '../../../services/api';

export const getPurchaseIndents = async () => {
    const response = await API.get('/purchase-indent');
    return response.data;
};

export const getPurchaseIndentById = async (id: string | number) => {
    const response = await API.get(`/purchase-indent/${id}`);
    return response.data;
};

export const createPurchaseIndent = async (data: any) => {
    const response = await API.post('/purchase-indent', data);
    return response.data;
};

export const updatePurchaseIndent = async (id: string | number, data: any) => {
    const response = await API.put(`/purchase-indent/${id}`, data);
    return response.data;
};

export const deletePurchaseIndent = async (id: string | number) => {
    const response = await API.delete(`/purchase-indent/${id}`);
    return response.data;
};
