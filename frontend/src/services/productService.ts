import api from './api';

export const productService = {
  getAll: async (params?: { category?: string; search?: string; page?: number }) => {
    const response = await api.get('/api/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await api.get(`/api/products/${id}`);
    return response.data;
  },

  getCategories: async () => {
    const response = await api.get('/api/products/categories');
    return response.data;
  },
};