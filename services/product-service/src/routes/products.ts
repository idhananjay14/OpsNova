import express from 'express';
import { query } from '../database/connection';
import { ServiceResponse } from '../types';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { category, search, page = '1', limit = '10' } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];
    let paramIndex = 1;

    if (category) {
      whereClause += ` AND c.name ILIKE $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    if (search) {
      whereClause += ` AND (p.name ILIKE $${paramIndex} OR p.description ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    const productsQuery = `
      SELECT p.id, p.name, p.description, p.price,
             p.image_url, p.brand, p.inventory_quantity,
             p.is_featured, p.created_at, p.updated_at,
             c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;

    const [productsResult, countResult] = await Promise.all([
      query(productsQuery, [...params, limitNum, offset]),
      query(countQuery, params),
    ]);

    res.json({
      success: true,
      data: {
        products: productsResult.rows,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: parseInt(countResult.rows[0].total),
          totalPages: Math.ceil(parseInt(countResult.rows[0].total) / limitNum),
        },
      },
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch products' });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const result = await query(`
      SELECT c.id, c.name, c.description, COUNT(p.id) AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      GROUP BY c.id
      ORDER BY c.name
    `);
    res.json({ success: true, data: result.rows });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch categories' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const result = await query(`
      SELECT p.id, p.name, p.description, p.price,
             p.image_url, p.brand, p.inventory_quantity,
             p.is_featured, p.created_at, p.updated_at,
             c.name AS category
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    res.json({ success: true, data: result.rows[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch product' });
  }
});

export { router as productRoutes };