import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'opsnova2026';

const getUserId = (req: express.Request): string | null => {
const token = req.headers.authorization?.replace('Bearer ', '');
if (!token) return null;
try {
  const decoded = jwt.verify(token, JWT_SECRET as string) as any;
  return decoded.userId;
} catch {
  return null;
}
};

// GET /cart
router.get('/cart', async (req, res) => {
try {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const result = await query(`
    SELECT c.id AS cart_id, c.user_id, c.total_amount,
            ci.id AS cart_item_id, ci.product_id, ci.product_name,
            ci.product_image, ci.quantity, ci.price
    FROM carts c
    INNER JOIN cart_items ci ON ci.cart_id = c.id
    WHERE c.user_id = $1
    ORDER BY ci.created_at ASC
  `, [userId]);

  res.json({ success: true, data: result.rows });
} catch (error) {
  res.status(500).json({ success: false, error: 'Failed to fetch cart' });
}
});

// POST /cart
router.post('/cart', async (req, res) => {
try {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const { productId, productName, productImage, quantity, price } = req.body;

  let cartResult = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  let cart;

  if (cartResult.rows.length === 0) {
    const newCart = await query(
      'INSERT INTO carts (user_id, total_amount) VALUES ($1, 0) RETURNING *',
      [userId]
    );
    cart = newCart.rows[0];
  } else {
    cart = cartResult.rows[0];
  }

  const existingItem = await query(
    'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
    [cart.id, productId]
  );

  const totalPrice = quantity * price;

  if (existingItem.rows.length > 0) {
    await query(
      'UPDATE cart_items SET quantity = quantity + $1 WHERE id = $2',
      [quantity, existingItem.rows[0].id]
    );
  } else {
    await query(
      'INSERT INTO cart_items (cart_id, product_id, product_name, product_image, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)',
      [cart.id, productId, productName, productImage, quantity, totalPrice]
    );
  }

  await query(
    'UPDATE carts SET total_amount = total_amount + $1 WHERE id = $2',
    [totalPrice, cart.id]
  );

  res.status(201).json({ success: true, message: 'Item added to cart' });
} catch (error) {
  console.error('Add to cart error:', error);
  res.status(500).json({ success: false, error: 'Failed to add to cart', details: String(error) });
}
});

// DELETE /cart/:cartItemId
router.delete('/cart/:cartItemId', async (req, res) => {
try {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const { cartItemId } = req.params;
  const itemResult = await query('SELECT * FROM cart_items WHERE id = $1', [cartItemId]);

  if (itemResult.rows.length === 0) {
    return res.status(404).json({ success: false, error: 'Cart item not found' });
  }

  const item = itemResult.rows[0];
  await query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
  await query('UPDATE carts SET total_amount = total_amount - $1 WHERE id = $2', [item.price, item.cart_id]);

  res.json({ success: true, message: 'Item removed from cart' });
} catch (error) {
  res.status(500).json({ success: false, error: 'Failed to remove item' });
}
});

// POST /checkout
router.post('/checkout', async (req, res) => {
try {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const { addressId } = req.body;

  await query('BEGIN');

  const cartResult = await query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (cartResult.rows.length === 0) {
    await query('ROLLBACK');
    return res.status(404).json({ success: false, error: 'Cart not found' });
  }

  const cart = cartResult.rows[0];
  const cartItemsResult = await query('SELECT * FROM cart_items WHERE cart_id = $1', [cart.id]);

  const orderResult = await query(
    'INSERT INTO orders (user_id, total_amount, status, address_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [userId, cart.total_amount, 'processing', addressId]
  );

  const order = orderResult.rows[0];

  for (const item of cartItemsResult.rows) {
    await query(
      'INSERT INTO order_items (order_id, product_id, product_name, product_image, quantity, price) VALUES ($1, $2, $3, $4, $5, $6)',
      [order.id, item.product_id, item.product_name, item.product_image, item.quantity, item.price]
    );
  }

  await query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
  await query('DELETE FROM carts WHERE id = $1', [cart.id]);
  await query('COMMIT');

  res.json({ success: true, message: 'Checkout successful', data: order });
} catch (error) {
  await query('ROLLBACK');
  res.status(500).json({ success: false, error: 'Checkout failed' });
}
});

// GET /orders
router.get('/orders', async (req, res) => {
try {
  const userId = getUserId(req);
  if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

  const result = await query(`
    SELECT o.id, o.user_id, o.total_amount, o.status, o.created_at,
            oi.product_id, oi.product_name, oi.product_image, oi.quantity, oi.price
    FROM orders o
    LEFT JOIN order_items oi ON oi.order_id = o.id
    WHERE o.user_id = $1
    ORDER BY o.created_at DESC
  `, [userId]);

  res.json({ success: true, data: result.rows });
} catch (error) {
  res.status(500).json({ success: false, error: 'Failed to fetch orders' });
}
});

export { router as orderRoutes };