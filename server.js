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

// Login API endpoint
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

// Forgot / Reset Password API
app.post('/api/forgot-password', (req, res) => {
    const { username, newPassword } = req.body;
    let users = getUsers();
    const userIndex = users.findIndex(u => u.username === username);

    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        try {
            fs.writeFileSync(path.join(__dirname, 'database', 'users.json'), JSON.stringify(users, null, 2));
            res.json({ success: true, message: 'Password reset successfully!' });
        } catch (err) {
            res.status(500).json({ success: false, message: 'Failed to update password' });
        }
    } else {
        res.status(404).json({ success: false, message: 'Username not found!' });
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
