import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { getCart, addToCart, removeCartItem } from '../services/orderService';

interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: CartItem) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  totalItems: number;
  subtotal: number;
  clearCart: () => void;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { user } = useAuth();

  const refreshCart = async () => {
    try {
      const response = await getCart();
      const backendItems = response.data.map((item: any) => ({
        id: item.cart_item_id,
        productId: item.product_id,
        name: item.product_name,
        price: Number(item.price),
        quantity: item.quantity,
        image: item.product_image,
        category: '',
      }));
      setItems(backendItems);
    } catch {
      setItems([]);
    }
  };

  useEffect(() => {
    if (user) {
      refreshCart();
    } else {
      setItems([]);
    }
  }, [user]);

  const addItem = async (item: CartItem) => {
    await addToCart(
      item.productId || item.id,
      item.name,
      item.image || '',
      item.quantity,
      item.price
    );
    await refreshCart();
  };

  const removeItem = async (id: string) => {
    await removeCartItem(id);
    await refreshCart();
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, totalItems, subtotal, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};