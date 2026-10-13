const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
// GANTI BARIS PORT LAMA (const PORT = 3000;) MENJADI INI:
const PORT = process.env.PORT || 3000;

// Middleware untuk membaca JSON dari request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inisialisasi Database SQLite (file akan otomatis dibuat bernama busgo.db)
const dbPath = path.resolve(__dirname, 'busgo.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Gagal terhubung ke database SQLite:', err.message);
    } else {
        console.log('Database SQLite berhasil terhubung.');
    }
});

// Buat tabel bookings jika belum ada
db.run(`CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    passengerName TEXT NOT NULL,
    routeKey TEXT NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    date TEXT NOT NULL,
    busName TEXT NOT NULL,
    seats TEXT NOT NULL,
    totalPrice INTEGER NOT NULL,
    timestamp INTEGER NOT NULL
)`);

// API Endpoint untuk mengambil semua data pemesanan
app.get('/api/bookings', (req, res) => {
    db.all(`SELECT * FROM bookings ORDER BY timestamp DESC`, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const bookings = rows.map(row => ({
            ...row,
            seats: JSON.parse(row.seats)
        }));
        res.json(bookings);
    });
});

// API Endpoint untuk menyimpan pemesanan baru ke SQLite
app.post('/api/bookings', (req, res) => {
    const { id, passengerName, routeKey, origin, destination, date, busName, seats, totalPrice, timestamp } = req.body;
    
    const query = `INSERT INTO bookings (id, passengerName, routeKey, origin, destination, date, busName, seats, totalPrice, timestamp) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const seatsString = JSON.stringify(seats);

    db.run(query, [id, passengerName, routeKey, origin, destination, date, busName, seatsString, totalPrice, timestamp], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ message: 'Pemesanan berhasil disimpan ke SQLite!', id });
    });
});

// Serve file HTML utama (pastikan nama file HTML Anda dayone.html)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'dayone.html'));
});

// Jalankan Server
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});