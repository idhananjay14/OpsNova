  import dotenv from 'dotenv';
  dotenv.config();

  import express from 'express';
  import cors from 'cors';
  import helmet from 'helmet';
  import { productRoutes } from './routes/products';
  import { connectDB } from './database/connection';

  const app = express();
  const PORT = process.env.PORT || 3003;

  app.use(helmet());
  app.use(cors());
  app.use(express.json());

  app.get('/health', (req, res) => {
    res.json({
      status: 'product-service is healthy',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/', productRoutes);

  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
  });

  const startServer = async () => {
    try {
      await connectDB();
      app.listen(PORT, () => {
        console.log(`Product service running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start:', error);
    process.exit(1);
    }
  };

  startServer();