import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRydZAoCfUqHXjVi450CmXS8z8Do3ekaIuqOEexvYeLiCzODc_8Gy_ntF0Ke4DI21LizSpb_yMWfxhu/pub?gid=1977200672&single=true&output=csv';

let cachedCsvData = '';
let lastUpdated = '';

// Function to download and update the CSV file
async function updateCsvData() {
  try {
    console.log(`[${new Date().toISOString()}] Fetching updated CSV data...`);
    const response = await fetch(CSV_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch CSV: ${response.statusText}`);
    }
    cachedCsvData = await response.text();
    lastUpdated = new Date().toISOString();
    console.log(`[${new Date().toISOString()}] Successfully updated CSV data in memory`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error updating CSV data:`, error);
  }
}

async function startServer() {
  // Initial fetch on startup
  await updateCsvData();

  // Schedule to run every hour (3600000 ms)
  setInterval(updateCsvData, 60 * 60 * 1000);

  // Serve the CSV data dynamically
  app.get('/data.csv', (req, res) => {
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('X-Last-Updated', lastUpdated);
    res.send(cachedCsvData);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
