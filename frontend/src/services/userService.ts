import api from './api';

export const getProfile = async () => {
  const response = await api.get('/api/users/profile');
  return response.data;
};

export const updateProfile = async (firstName: string, lastName: string, phone?: string) => {
  const response = await api.put('/api/users/profile', { firstName, lastName, phone });
  return response.data;
};

export const addAddress = async (street: string, city: string, state: string, zipCode: string, country: string) => {
  const response = await api.post('/api/users/addresses', { street, city, state, zipCode, country, isDefault: true });
  return response.data;
};

export const deleteAddress = async (id: string) => {
  const response = await api.delete(`/api/users/addresses/${id}`);
  return response.data;
};