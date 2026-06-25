import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import bcrypt from 'bcrypt';
import session from 'express-session';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

const dbConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
      }
    : {
        user: process.env.PG_USER,
        host: process.env.PG_HOST,
        database: process.env.PG_DATABASE,
        password: process.env.PG_PASSWORD,
        port: parseInt(process.env.PG_PORT || '5432'),
      };
const db = new pg.Pool(dbConfig);

app.set('trust proxy', 1);

app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? true : 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: 'lax'
    }
}));

// REGISTER
app.post('/register', async (req, res) => {
    try {
        const { email, password, branch, name } = req.body;

        const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (checkResult.rows.length > 0) {
            return res.status(400).json({ error: "Email already exists." });
        }

        const saltRounds = 10;
        const hash = await bcrypt.hash(password, saltRounds);

        const result = await db.query(
            "INSERT INTO users (email, password_hash, branch, name) VALUES ($1, $2, $3, $4) RETURNING id, email, branch, name",
            [email, hash, branch, name || null]
        );

        const newUser = result.rows[0];
        req.session.user = { id: newUser.id, email: newUser.email, branch: newUser.branch, name: newUser.name };
        res.status(201).json({ message: "Registered successfully!", user: req.session.user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// LOGIN
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
        if (result.rows.length === 0) {
            return res.status(401).json({ error: "User not found." });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ error: "Incorrect password." });
        }

        req.session.user = { id: user.id, email: user.email, branch: user.branch, name: user.name || null };
        res.status(200).json({ message: "Logged in successfully!", user: req.session.user });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// LOGOUT
app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) return res.status(500).json({ error: "Logout failed." });
        res.clearCookie('connect.sid');
        res.status(200).json({ message: "Logged out successfully." });
    });
});

// CHECK AUTH
app.get('/api/check-auth', (req, res) => {
    if (req.session.user) {
        res.status(200).json({ user: req.session.user });
    } else {
        res.status(401).json({ error: "Not logged in" });
    }
});

// GET MY PROFILE
app.get('/api/me', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized." });
    try {
        const result = await db.query(
            "SELECT id, email, name, branch, created_at FROM users WHERE id = $1",
            [req.session.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "User not found." });
        res.status(200).json({ user: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// FETCH ALL EXPERIENCES (public feed)
app.get('/api/experiences', async (req, res) => {
    try {
        const queryText = `
            SELECT posts.id, posts.company, posts.role, posts.content, posts.status, posts.created_at,
                   users.branch, users.name AS author_name, posts.user_id
            FROM posts
            INNER JOIN users ON posts.user_id = users.id
            ORDER BY posts.created_at DESC
        `;
        const result = await db.query(queryText);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch experiences" });
    }
});

// FETCH MY POSTS (dashboard)
app.get('/api/my-posts', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized." });
    try {
        const result = await db.query(
            "SELECT * FROM posts WHERE user_id = $1 ORDER BY created_at DESC",
            [req.session.user.id]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch your posts" });
    }
});

// CREATE POST
app.post('/api/experiences', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "Unauthorized. Please login first." });
        }
        const { company, role, content, status } = req.body;
        const userId = req.session.user.id;

        if (!company || !role || !content || !status) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const result = await db.query(
            "INSERT INTO posts (user_id, company, role, content, status) VALUES ($1, $2, $3, $4, $5) RETURNING *",
            [userId, company, role, content, status]
        );
        res.status(201).json({ message: "Post created successfully!", post: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to save experience" });
    }
});

// EDIT POST (owner only)
app.put('/api/experiences/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized." });
    try {
        const { id } = req.params;
        const { company, role, content, status } = req.body;
        const userId = req.session.user.id;

        const check = await db.query("SELECT user_id FROM posts WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: "Post not found." });
        if (check.rows[0].user_id !== userId) return res.status(403).json({ error: "Forbidden." });

        const result = await db.query(
            "UPDATE posts SET company=$1, role=$2, content=$3, status=$4 WHERE id=$5 RETURNING *",
            [company, role, content, status, id]
        );
        res.status(200).json({ message: "Post updated!", post: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update post" });
    }
});

// DELETE POST (owner only)
app.delete('/api/experiences/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: "Unauthorized." });
    try {
        const { id } = req.params;
        const userId = req.session.user.id;

        const check = await db.query("SELECT user_id FROM posts WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ error: "Post not found." });
        if (check.rows[0].user_id !== userId) return res.status(403).json({ error: "Forbidden." });

        await db.query("DELETE FROM posts WHERE id = $1", [id]);
        res.status(200).json({ message: "Post deleted successfully." });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to delete post" });
    }
});

// Database auto-initialization helper
async function initDB() {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name VARCHAR(255),
                branch VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        await db.query(`
            CREATE TABLE IF NOT EXISTS posts (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                company VARCHAR(255) NOT NULL,
                role VARCHAR(255) NOT NULL,
                content TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'Waiting',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log("Database initialized successfully!");
    } catch (err) {
        console.error("Database initialization failed:", err.message);
    }
}

// Serve static files from frontend/dist in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'frontend/dist')));
    
    // Serve index.html for all other routes to support React Router HTML5 History API
    app.get('*', (req, res, next) => {
        // Skip API routes
        if (req.path.startsWith('/api') || req.path === '/login' || req.path === '/register' || req.path === '/logout') {
            return next();
        }
        res.sendFile(path.join(__dirname, 'frontend/dist/index.html'));
    });
}

app.listen(PORT, async () => {
    await initDB();
    console.log(`Server running on http://localhost:${PORT}`);
});