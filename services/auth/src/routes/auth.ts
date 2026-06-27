import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/connection';

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || 'opsnova-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '30d';

// POST /register
router.post('/register', async (req, res) => {
try {
const { email, password, firstName, lastName } = req.body;

if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ success: false, error: 'All fields required' });
}

const existing = await query('SELECT id FROM users WHERE email = $1', [email]);
if (existing.rows.length > 0) {
    return res.status(400).json({ success: false, error: 'User already exists' });
}

const passwordHash = await bcrypt.hash(password, 10);

const result = await query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role)
    VALUES ($1, $2, $3, $4, 'customer')
    RETURNING id, email, first_name, last_name, role, created_at`,
    [email, passwordHash, firstName, lastName]
);

const user = result.rows[0];

const token = jwt.sign(
{ userId: user.id, email: user.email, role: user.role },
JWT_SECRET as string,
{ expiresIn: '7d' }
);

const refreshToken = jwt.sign(
{ userId: user.id },
JWT_SECRET as string,
{ expiresIn: '30d' }
);

res.status(201).json({
    success: true,
    data: {
    user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
    },
    token,
    refreshToken,
    },
});
} catch (error) {
console.error('Register error:', error);
res.status(500).json({ success: false, error: 'Registration failed' });
}
});

// POST /login
router.post('/login', async (req, res) => {
try {
const { email, password } = req.body;

if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password required' });
}

const result = await query(
    'SELECT id, email, password_hash, first_name, last_name, role FROM users WHERE email = $1',
    [email]
);

if (result.rows.length === 0) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
}

const user = result.rows[0];
const isValid = await bcrypt.compare(password, user.password_hash);

if (!isValid) {
    return res.status(401).json({ success: false, error: 'Invalid credentials' });
}
const token = jwt.sign(
{ userId: user.id, email: user.email, role: user.role },
JWT_SECRET as string,
{ expiresIn: '7d' }
);

const refreshToken = jwt.sign(
{ userId: user.id },
JWT_SECRET as string,
{ expiresIn: '30d' }
);

res.json({
    success: true,
    data: {
    user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
    },
    token,
    refreshToken,
    },
});
} catch (error) {
console.error('Login error:', error);
res.status(500).json({ success: false, error: 'Login failed' });
}
});

// GET /me
router.get('/me', async (req, res) => {
try {
const authHeader = req.headers.authorization;
const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

if (!token) {
    return res.status(401).json({ success: false, error: 'No token provided' });
}

const decoded = jwt.verify(token, JWT_SECRET) as any;

const result = await query(
    'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
    [decoded.userId]
);

if (result.rows.length === 0) {
    return res.status(401).json({ success: false, error: 'User not found' });
}

const user = result.rows[0];
res.json({
    success: true,
    data: {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: user.role,
    },
});
} catch (error) {
res.status(401).json({ success: false, error: 'Invalid token' });
}
});

export { router as authRoutes };