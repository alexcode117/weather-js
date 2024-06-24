import { config } from "./config/config.js";
import express from "express";
const app = express();

app.use(express.static('public'));

app.get('/api-key', (req, res) => {
    res.json({ apiKey: config.API_KEY });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
