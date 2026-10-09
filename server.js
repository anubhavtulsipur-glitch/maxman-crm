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
        const filePath = path.join(__dirname, 'database', 'users.json');
        if (!fs.existsSync(filePath)) return [];
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        return [];
    }
};

const saveUsers = (users) => {
    const filePath = path.join(__dirname, 'database', 'users.json');
    fs.writeFileSync(filePath, JSON.stringify(users, null, 2));
};

const getLeads = () => {
    try {
        const filePath = path.join(__dirname, 'database', 'leads.json');
        if (!fs.existsSync(filePath)) return [];
        return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (err) {
        return [];
    }
};

// Login API
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    const users = getUsers();
    const user = users.find(u => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password.trim());
    
    if (user) {
        res.json({ success: true, role: user.role, name: user.name, username: user.username });
    } else {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
    }
});

// Get all users
app.get('/api/users', (req, res) => {
    res.json(getUsers());
});

// Create new user (Owner/Manager can use this)
app.post('/api/register', (req, res) => {
    const { username, password, role, name } = req.body;
    let users = getUsers();
    
    if (users.find(u => u.username.toLowerCase() === username.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Username pehle se maujood hai!' });
    }

    users.push({ username, password, role, name });
    saveUsers(users);
    res.json({ success: true, message: 'User successfully create ho gaya!' });
});

// Delete user
app.delete('/api/users/:username', (req, res) => {
    const target = req.params.username;
    let users = getUsers();
    users = users.filter(u => u.username.toLowerCase() !== target.toLowerCase());
    saveUsers(users);
    res.json({ success: true, message: 'User delete ho gaya!' });
});

// Leads API
app.get('/api/leads', (req, res) => {
    res.json(getLeads());
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
