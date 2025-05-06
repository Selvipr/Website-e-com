const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 4000;
const JWT_SECRET = 'your_jwt_secret_key'; // Change this to a secure key in production

app.use(cors());
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('./thiruwear.db', (err) => {
    if (err) {
        console.error('Error opening database', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

// Create tables if not exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        phone TEXT
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        orderNumber TEXT NOT NULL,
        status TEXT NOT NULL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY(userId) REFERENCES users(id)
    )`);
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Signup route
app.post('/api/signup', async (req, res) => {
    const { fullName, email, password, phone } = req.body;
    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'Missing required fields' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.run(
            `INSERT INTO users (fullName, email, password, phone) VALUES (?, ?, ?, ?)`,
            [fullName, email, hashedPassword, phone || ''],
            function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return res.status(409).json({ message: 'Email already registered' });
                    }
                    return res.status(500).json({ message: 'Database error' });
                }
                res.status(201).json({ message: 'User registered successfully' });
            }
        );
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Login route
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Missing email or password' });
    }
    db.get(`SELECT * FROM users WHERE email = ?`, [email], async (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ token, fullName: user.fullName, email: user.email, phone: user.phone });
    });
});

// Get profile route
app.get('/api/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;
    db.get(`SELECT id, fullName, email, phone FROM users WHERE id = ?`, [userId], (err, user) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    });
});

// Update profile route
app.put('/api/profile', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const { fullName, phone } = req.body;
    if (!fullName) {
        return res.status(400).json({ message: 'Full name is required' });
    }
    db.run(
        `UPDATE users SET fullName = ?, phone = ? WHERE id = ?`,
        [fullName, phone || '', userId],
        function(err) {
            if (err) return res.status(500).json({ message: 'Database error' });
            res.json({ message: 'Profile updated successfully' });
        }
    );
});

// Get order tracking by order number
app.get('/api/orders/:orderNumber', authenticateToken, (req, res) => {
    const userId = req.user.id;
    const orderNumber = req.params.orderNumber;
    db.get(
        `SELECT * FROM orders WHERE userId = ? AND orderNumber = ?`,
        [userId, orderNumber],
        (err, order) => {
            if (err) return res.status(500).json({ message: 'Database error' });
            if (!order) return res.status(404).json({ message: 'Order not found' });
            res.json(order);
        }
    );
});

// Start server
app.listen(PORT, () => {
    console.log('Thiruwear backend server running on port ' + PORT);
});
