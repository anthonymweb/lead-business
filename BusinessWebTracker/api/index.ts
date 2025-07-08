// Vercel serverless function entry point for API routes
import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import { registerRoutes } from '../server/routes';
import { serveStatic } from '../server/vite';

const app = express();

// Setup middleware
app.use(express.json());
app.use(express.static('dist/public'));

// Register API routes
registerRoutes(app);

// Export handler for Vercel
export default async (req: VercelRequest, res: VercelResponse) => {
  // Handle the request with Express
  return app(req, res);
};