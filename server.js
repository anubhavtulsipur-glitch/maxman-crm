const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

// Main URL par Landing Page khulega
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing.html'));
});

// /crm URL par CRM (index.html) khulega
app.get('/crm', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Leads save karne ki API
const DATA_FILE = path.join(__dirname, 'leads.json');
app.post('/api/leads', (req, res) => {
    let leads = [];
    if (fs.existsSync(DATA_FILE)) {
        try {
            leads = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        } catch (e) {
            leads = [];
        }
    }
    leads.push(req.body);
    fs.writeFileSync(DATA_FILE, JSON.stringify(leads, null, 2));
    res.json({ success: true, message: 'Saved successfully!' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
