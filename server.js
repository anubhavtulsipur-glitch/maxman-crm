const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const USERS_FILE = path.join(__dirname, 'database', 'users.json');
const LEADS_FILE = path.join(__dirname, 'database', 'leads.json');

// Helper functions to read/write JSON securely
function readData(file) {
    if (!fs.existsSync(file)) return [];
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        return [];
    }
}

function writeData(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// 1. Root Route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 2. API: Login Authentication across Roles
app.post('/api/login', (req, res) => {
    const { username, password, role } = req.body;
    const users = readData(USERS_FILE);
    const user = users.find(u => u.username === username && u.password === password && u.role === role);
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(401).json({ success: false, message: 'Invalid credentials or role mismatch!' });
    }
});

// 3. API: Create User (Only Owner or HR can create staff IDs)
app.post('/api/create-user', (req, res) => {
    const { creatorRole, username, password, role, name, phone } = req.body;
    if (creatorRole !== 'Owner' && creatorRole !== 'HR') {
        return res.status(403).json({ success: false, message: 'Unauthorized to create users!' });
    }

    let users = readData(USERS_FILE);
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ success: false, message: 'Username already exists!' });
    }

    users.push({ username, password, role, name, phone });
    writeData(USERS_FILE, users);
    res.json({ success: true, message: 'User ID created successfully!' });
});

// 4. API: Forgot Password with Verification (Checks Username & Registered Phone)
app.post('/api/forgot-password', (req, res) => {
    const { username, phone, newPassword } = req.body;
    let users = readData(USERS_FILE);
    const userIndex = users.findIndex(u => u.username === username && u.phone === phone);

    if (userIndex === -1) {
        return res.status(400).json({ success: false, message: 'Verification failed! Username and Registered Phone do not match.' });
    }

    users[userIndex].password = newPassword;
    writeData(USERS_FILE, users);
    res.json({ success: true, message: 'Password reset successfully with verification!' });
});

// 5. API: Get Leads (Hierarchical view)
app.get('/api/leads', (req, res) => {
    const leads = readData(LEADS_FILE);
    res.json(leads);
});

// 6. API: Create Patient Lead with Remarks & Call Recording Link
app.post('/api/leads', (req, res) => {
    const { patientName, phone, ailment, remarks, recordingUrl, status, agentName } = req.body;
    let leads = readData(LEADS_FILE);
    
    const newLead = {
        id: Date.now().toString(),
        patientName,
        phone,
        ailment: ailment || 'General',
        remarks: remarks || '',
        recordingUrl: recordingUrl || '',
        status: status || 'New',
        agentName: agentName || 'System',
        date: new Date().toLocaleString()
    };

    leads.push(newLead);
    writeData(LEADS_FILE, leads);
    res.json({ success: true, message: 'Patient lead and remarks saved successfully!', lead: newLead });
});

app.listen(PORT, () => {
    console.log(`Maxman Care CRM Server is running locally on port ${PORT}`);
});
