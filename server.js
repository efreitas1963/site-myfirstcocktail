import express from 'express';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: '.env.local' });

const app = express();
const port = process.env.PORT || 3000;

if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

app.use(express.json());

// Manual CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use('/uploads', express.static('uploads'));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/upload', (req, res) => {
  res.json({ message: 'Upload endpoint' });
});

app.use((err, req, res) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal error' });
});

const server = app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`❤️  Health check: GET /api/health`);
  console.log(`⏰ Server started (JS): ${new Date().toISOString()}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
