import dotenv from 'dotenv';
import express from 'express';
import pg from 'pg';
import cors from 'cors';

dotenv.config();

const { Pool } = pg;
const app = express();
const port = 5001;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/postgres',
});

// Create Users Table
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(50) DEFAULT 'Member',
    avatar TEXT,
    "teamLeadId" VARCHAR(100),
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const seedAdminQuery = `
  INSERT INTO users (name, email, password, role, avatar)
  VALUES ('Super Admin', 'admin@office.com', 'admin123', 'Admin', 'https://ui-avatars.com/api/?name=Super+Admin&background=random')
  ON CONFLICT (email) DO NOTHING;
`;

// Create Bookings Table
const createBookingsTableQuery = `
  CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    "memberId" VARCHAR(100) NOT NULL,
    "memberName" VARCHAR(100),
    "memberAvatar" TEXT,
    role VARCHAR(50),
    "deskId" VARCHAR(50),
    zone VARCHAR(100),
    level INTEGER,
    status VARCHAR(50) DEFAULT 'Pending',
    "bookingDate" DATE NOT NULL,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize DB
pool.query(createTableQuery)
    .then(() => {
        console.log("Users table created/verified.");
        return pool.query(createBookingsTableQuery);
    })
    .then(() => {
        console.log("Bookings table created/verified.");
        return pool.query(seedAdminQuery);
    })
    .then(() => {
        console.log("Super Admin seeded if not exists.");
    })
    .catch(err => console.error("Database setup error:", err));

// Routes
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (user.password !== password) {
            return res.status(401).json({ error: 'Invalid password' });
        }

        res.json({
            id: user.id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            avatar: user.avatar,
            teamLeadId: user.teamLeadId
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY id ASC');
        const users = result.rows.map(u => ({ ...u, id: u.id.toString() }));
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/users', async (req, res) => {
    const { name, email, password, role, teamLeadId } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role, avatar, "teamLeadId") VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [name, email, password || 'password123', role || 'Member', `https://ui-avatars.com/api/?name=${name}&background=random`, teamLeadId]
        );
        const u = result.rows[0];
        res.json({ ...u, id: u.id.toString() });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role, teamLeadId, password } = req.body;
    try {
        await pool.query(
            'UPDATE users SET name = COALESCE($1, name), email = COALESCE($2, email), role = COALESCE($3, role), "teamLeadId" = COALESCE($4, "teamLeadId"), password = COALESCE($5, password) WHERE id = $6',
            [name, email, role, teamLeadId, password, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Bookings Routes
app.get('/api/bookings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM bookings ORDER BY "bookingDate" ASC, "createdAt" DESC');
        const bookings = result.rows.map(b => ({
            id: b.id.toString(),
            memberId: b.memberId,
            memberName: b.memberName,
            memberAvatar: b.memberAvatar,
            role: b.role,
            deskId: b.deskId,
            zone: b.zone,
            level: b.level,
            status: b.status,
            bookingDate: b.bookingDate,
            timestamp: new Date(b.createdAt).getTime()
        }));
        res.json(bookings);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/bookings', async (req, res) => {
    const { memberId, memberName, memberAvatar, role, deskId, zone, level, status, bookingDate } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO bookings ("memberId", "memberName", "memberAvatar", role, "deskId", zone, level, status, "bookingDate") VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *',
            [memberId, memberName, memberAvatar, role, deskId, zone, level, status || 'Pending', bookingDate]
        );
        const b = result.rows[0];
        res.json({
            id: b.id.toString(),
            memberId: b.memberId,
            memberName: b.memberName,
            memberAvatar: b.memberAvatar,
            role: b.role,
            deskId: b.deskId,
            zone: b.zone,
            level: b.level,
            status: b.status,
            bookingDate: b.bookingDate,
            timestamp: new Date(b.createdAt).getTime()
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create booking' });
    }
});

app.put('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    try {
        await pool.query(
            'UPDATE bookings SET status = $1 WHERE id = $2',
            [status, id]
        );
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update booking' });
    }
});

app.delete('/api/bookings/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM bookings WHERE id = $1', [id]);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete booking' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
