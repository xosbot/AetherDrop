const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3005;

app.use(cors());
app.use(express.json());

const logs = [];

app.post('/api/verify', (req, res) => {
    const { address, txHash, token, amount, status } = req.body;
    const logEntry = {
        address,
        txHash,
        token,
        amount,
        status,
        timestamp: new Date().toISOString()
    };
    logs.push(logEntry);
    console.log(`[AetherDrop] New Verification: ${address} - ${status}`);
    res.json({ success: true, message: "Verification logged" });
});

app.get('/api/logs', (req, res) => {
    res.json(logs);
});

app.listen(PORT, () => {
    console.log(`AetherDrop Backend running on http://localhost:${PORT}`);
});
