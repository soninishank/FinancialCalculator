const express = require("express");
const cors = require("cors");
const ipoRoutes = require('./routes/ipoRoutes');

const app = express();
app.use(cors());
app.use(express.json()); // Good practice to have, though maybe not strictly used yet

app.use("/api/ipos", ipoRoutes);

const PORT = process.env.SCRAPER_PORT || 8081;
app.listen(PORT, () => console.log(`IPO API service running on http://localhost:${PORT}`));

