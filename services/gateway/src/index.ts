import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'gateway is healthy',
    timestamp: new Date().toISOString(),
  });
});

// Service URLs
const services = {
  auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3002',
  products: process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003',
  orders: process.env.ORDERS_SERVICE_URL || 'http://localhost:3004',
  users: process.env.USERS_SERVICE_URL || 'http://localhost:3005',
};

// Routes
app.use('/api/auth', createProxyMiddleware({
  target: services.auth,
  changeOrigin: true,
  pathRewrite: { '^/api/auth': '' },
}));

app.use('/api/products', createProxyMiddleware({
  target: services.products,
  changeOrigin: true,
  pathRewrite: { '^/api/products': '' },
}));

app.use('/api/orders', createProxyMiddleware({
  target: services.orders,
  changeOrigin: true,
  pathRewrite: { '^/api/orders': '' },
}));

app.use('/api/users', createProxyMiddleware({
  target: services.users,
  changeOrigin: true,
  pathRewrite: { '^/api/users': '' },
}));

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
  console.log('Proxying to:', services);
});