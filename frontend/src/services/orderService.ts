import api from './api';

export const addToCart = async (productId: string, productName: string, productImage: string, quantity: number, price: number) => {
  const response = await api.post('/api/orders/cart', { productId, productName, productImage, quantity, price });
  return response.data;
};

export const getCart = async () => {
  const response = await api.get('/api/orders/cart');
  return response.data;
};

export const removeCartItem = async (cartItemId: string) => {
  const response = await api.delete(`/api/orders/cart/${cartItemId}`);
  return response.data;
};

export const checkout = async (addressId?: string) => {
  const response = await api.post('/api/orders/checkout', { addressId });
  return response.data;
};

export const getOrders = async () => {
  const response = await api.get('/api/orders/orders');
  return response.data;
};