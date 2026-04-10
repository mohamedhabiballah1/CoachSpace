const connectDB = require('./utils/db');
const express = require('express');
const dotenv = require('dotenv').config(); 
const cors = require('cors');
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 8000;
const HOST = process.env.HOST || 'http://localhost:8000';
// const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors({ origin: HOST, credentials: true }));
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});