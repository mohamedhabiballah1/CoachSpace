const connectDB = require('./utils/db');
const express = require('express');
const dotenv = require('dotenv').config(); 
const cors = require('cors');
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';


const app = express();
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());

const routesDirectory = path.join(__dirname, "routes");

fs.readdirSync(routesDirectory).forEach(file => {
    if (!file.endsWith(".js")) return;
  
    const routePath = path.join(routesDirectory, file);
    const route = require(routePath);
  
    const routeName = file.replace(".routes.js", "");
    app.use(`/api/${routeName}`, route);
});

connectDB();

app.use(express.json());

app.get('/', (req, res) => {
  res.send('API running');
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});