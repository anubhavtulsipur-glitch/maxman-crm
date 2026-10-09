const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

// Serve main HTML file from root directory
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Database helper functions
const getUsers = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'database', 'users.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const getLeads = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'database', 'leads.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Simple Login API endpoint for multi-tier verification
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        res.json({ success: true, role: user.role, name: user.name });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Get Leads API
app.get('/api/leads', (req, res) => {
    const leads = getLeads();
    res.json(leads);
});

// Start server
app.listen(PORT, () => {
    console.log(`Maxman Care CRM Server is running on port ${PORT}`);
});
