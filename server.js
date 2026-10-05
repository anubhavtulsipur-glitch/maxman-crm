const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// SQLite Database Connection
const dbFile = path.join(__dirname, 'crm_database.db');
const db = new sqlite3.Database(dbFile, (err) => {
    if (err) {
        console.error("Database connection error:", err.message);
    } else {
        console.log("✔ MAXMAN CARE Database Connected!");
    }
});

// Create Leads Table if not exists
db.run(`CREATE TABLE IF NOT EXISTS leads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_name TEXT,
    phone TEXT,
    age INTEGER,
    disease TEXT,
    regimen_pack TEXT,
    order_value INTEGER,
    status TEXT DEFAULT 'New Lead',
    assigned_agent TEXT DEFAULT 'Unassigned',
    payment_mode TEXT DEFAULT 'COD',
    address TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

// Route: Serve Landing Page
app.get('/landing', (req, res) => {
    res.sendFile(path.join(__dirname, 'landing.html'));
});

// Route: Serve Main CRM Dashboard (Root)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// API: Add New Lead (From Landing Page)
app.post('/api/leads/add', (req, res) => {
    console.log("Received Lead Data:", req.body);
    const { patient_name, phone, age, disease, regimen_pack, order_value, payment_mode, address } = req.body;
    
    const pName = patient_name || "Unknown Customer";
    const pPhone = phone || "";
    const pAge = age || 30;
    const pDisease = disease || "General Wellness";
    const pRegimen = regimen_pack || "1 Month Course";
    const pVal = order_value || 3000;
    const pPay = payment_mode || "COD";
    const pAddr = address || "";

    const query = `INSERT INTO leads (patient_name, phone, age, disease, regimen_pack, order_value, payment_mode, address, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'New Lead', datetime('now'))`;
    
    db.run(query, [pName, pPhone, pAge, pDisease, pRegimen, pVal, pPay, pAddr], function(err) {
        if (err) {
            console.error("Database Insert Error:", err.message);
            return res.json({ success: false, error: err.message });
        }
        res.json({ success: true, id: this.lastID });
    });
});

// API: Get All Leads for CRM Dashboard
app.get('/api/leads', (req, res) => {
    db.all(`SELECT * FROM leads ORDER BY id DESC`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 MAXMAN CARE Enterprise CRM running on http://localhost:${PORT}`);
});
