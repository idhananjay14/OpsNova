export interface Cart {
  id: string;
  userId: string;
  totalAmount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  addressId?: string;
  totalAmount: number;
  status: string;
  createdAt: Date;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
}

export interface ServiceResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}