import API from '../../../services/api';

export const getSalesOrders = async () => {
    const response = await API.get('/sales-order');
    return response.data;
};

export const getSalesOrderById = async (id: string | number) => {
    const response = await API.get(`/sales-order/${id}`);
    return response.data;
};

export const getSalesOrdersByCustomer = async (customerId: string | number) => {
    const response = await API.get(`/sales-order/customer/${customerId}`);
    return response.data;
};

export const createSalesOrder = async (data: any) => {
    const response = await API.post('/sales-order', data);
    return response.data;
};

export const updateSalesOrder = async (id: string | number, data: any) => {
    const response = await API.put(`/sales-order/${id}`, data);
    return response.data;
};

export const deleteSalesOrder = async (id: string | number) => {
    const response = await API.delete(`/sales-order/${id}`);
    return response.data;
};
