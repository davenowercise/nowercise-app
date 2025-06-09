#!/usr/bin/env node

// Simple production server without development tools
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { registerRoutes } from './server/routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')));

// Register API routes
await registerRoutes(app);

// Serve the frontend for all other routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Production server running on port ${PORT}`);
});