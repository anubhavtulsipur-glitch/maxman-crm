const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

const getUsers = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'database', 'users.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const saveUsers = (users) => {
    fs.writeFileSync(path.join(__dirname, 'database', 'users.json'), JSON.stringify(users, null, 2));
};

const getLeads = () => {
    try {
        const data = fs.readFileSync(path.join(__dirname, 'database', 'leads.json'), 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

// Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    
    if (user) {
        res.json({ success: true, role: user.role, name: user.name });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Register User API (Website se naya user banane ke liye)
app.post('/api/register', (req, res) => {
    const { username, password, role, name } = req.body;
    let users = getUsers();
    
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Username already exists!' });
    }

    users.push({ username, password, role, name });
    try {
        saveUsers(users);
        res.json({ success: true, message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to register user' });
    }
});

// Forgot / Reset Password API
app.post('/api/forgot-password', (req, res) => {
    const { username, newPassword } = req.body;
    let users = getUsers();
    const userIndex = users.findIndex(u => u.username.toLowerCase() === username.toLowerCase());

    if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        try {
            saveUsers(users);
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

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
