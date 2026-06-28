export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    ME: '/api/auth/me',
  },
  PRODUCTS: {
    ALL: '/api/products',
    BY_ID: (id: string) => `/api/products/${id}`,
    CATEGORIES: '/api/products/categories',
  },
  ORDERS: {
    CART: '/api/orders/cart',
    CHECKOUT: '/api/orders/checkout',
    LIST: '/api/orders/orders',
    REMOVE_ITEM: (id: string) => `/api/orders/cart/${id}`,
  },
  USERS: {
    PROFILE: '/api/users/profile',
    ADDRESSES: '/api/users/addresses',
    DELETE_ADDRESS: (id: string) => `/api/users/addresses/${id}`,
  },
};