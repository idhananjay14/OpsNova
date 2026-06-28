import express from 'express';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'opsnova2024';

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

// GET /profile
router.get('/profile', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const userResult = await query(
      'SELECT id, email, first_name, last_name, role, phone, created_at, updated_at FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const user = userResult.rows[0];
    const addressesResult = await query('SELECT * FROM addresses WHERE user_id = $1', [userId]);

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone,
        addresses: addressesResult.rows,
        createdAt: user.created_at,
        updatedAt: user.updated_at,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to get profile' });
  }
});

// PUT /profile
router.put('/profile', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { firstName, lastName, phone } = req.body;

    await query(
      'UPDATE users SET first_name = $1, last_name = $2, phone = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4',
      [firstName, lastName, phone, userId]
    );

    const result = await query(
      'SELECT id, email, first_name, last_name, role, phone FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// POST /addresses
router.post('/addresses', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const { street, city, state, zipCode, country, isDefault } = req.body;

    if (!street || !city || !state || !zipCode || !country) {
      return res.status(400).json({ success: false, error: 'All address fields required' });
    }

    const result = await query(
      'INSERT INTO addresses (user_id, street, city, state, zip_code, country, is_default) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [userId, street, city, state, zipCode, country, isDefault || false]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to add address' });
  }
});

// DELETE /addresses/:id
router.delete('/addresses/:id', async (req, res) => {
  try {
    const userId = getUserId(req);
    if (!userId) return res.status(401).json({ success: false, error: 'Unauthorized' });

    await query('DELETE FROM addresses WHERE id = $1 AND user_id = $2', [req.params.id, userId]);
    res.json({ success: true, message: 'Address deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to delete address' });
  }
});

export { router as userRoutes };