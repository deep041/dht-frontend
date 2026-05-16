import API from '../../../services/api';

export const getLeads = async () => {
  try {
    const response = await API.get('/lead');
    return response.data;
  } catch (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }
};

export const createLead = async (payload: any) => {
  try {
    const response = await API.post('/lead', payload);
    return response.data;
  } catch (error) {
    console.error('Error creating lead:', error);
    throw error;
  }
};
