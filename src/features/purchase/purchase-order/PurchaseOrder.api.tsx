import API from '../../../services/api';

export const getPurchaseOrders = async () => {
  const response = await API.get('/purchase-order');
  return response.data;
};

export const getPurchaseOrderById = async (id: string | number) => {
  const response = await API.get(`/purchase-order/${id}`);
  return response.data;
};

export const createPurchaseOrder = async (data: any) => {
  const response = await API.post('/purchase-order', data);
  return response.data;
};

export const updatePurchaseOrder = async (id: string | number, data: any) => {
  const response = await API.put(`/purchase-order/${id}`, data);
  return response.data;
};

export const deletePurchaseOrder = async (id: string | number) => {
  const response = await API.delete(`/purchase-order/${id}`);
  return response.data;
};
