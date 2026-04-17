const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3005;

app.use(cors());
app.use(express.json());

// Reuse the same DB cluster but different collection/database
mongoose.connect(process.env.MONGODB_URI, {
    dbName: 'aetherdrop'
}).then(() => console.log('AetherDrop DB Connected'));

const LogSchema = new mongoose.Schema({
    address: String,
    txHash: String,
    token: String,
    status: String,
    timestamp: { type: Date, default: Date.now }
});

const Log = mongoose.model('Log', LogSchema);

app.post('/api/verify', async (req, res) => {
    try {
        const log = new Log(req.body);
        await log.save();
        console.log(`[AetherDrop] New Verification: ${req.body.address}`);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/logs', (req, res) => {
    res.json(logs);
});

app.listen(PORT, () => {
    console.log(`AetherDrop Backend running on http://localhost:${PORT}`);
});
