const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
require("dotenv").config();

const app = express();

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inisialisasi database MySQL
const db = mysql.createConnection({
  host: process.env.DB_HOST, // Laragon's MySQL default host
  user: process.env.DB_USERNAME, // Default user in Laragon
  password: process.env.DB_PASSWORD, // Default password (empty in Laragon)
  database: process.env.DB_NAME, // Name of the database you created
  port: process.env.DB_PORT,
});

// Connect to the database
db.connect(async (err) => {
  if (err) {
    await console.error("Database connection failed:", err.stack);
    return;
  }
  console.log("Connected to the MySQL database.");

  // Membuat tabel jika belum ada
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS komentar_user (
      id INT AUTO_INCREMENT PRIMARY KEY,
      nama VARCHAR(255) NOT NULL,
      ucapan TEXT NOT NULL,
      konfirmasi VARCHAR(255) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`;

  db.query(createTableQuery, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    }
  });
});

// Endpoint untuk mengirim pesan
app.post("/api/kirim-pesan", (req, res) => {
  const { nama, ucapan, konfirmasi } = req.body;

  // Validasi input
  if (!nama || !ucapan || !konfirmasi) {
    return res.status(400).json({ message: "Semua field harus diisi!" });
  }

  // Menyimpan data ke database
  const sql =
    "INSERT INTO komentar_user (nama, ucapan, konfirmasi) VALUES (?, ?, ?)";
  db.query(sql, [nama, ucapan, konfirmasi], (err, results) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat menyimpan data." });
    }
    res.status(200).json({
      message: "Pesan berhasil dikirim!",
      data: { id: results.insertId, nama, ucapan, konfirmasi },
    });
  });
});

// Endpoint untuk mengambil semua komentar
app.get("/api/komentar", (req, res) => {
  const sql = "SELECT * FROM komentar_user ORDER BY timestamp DESC";
  db.query(sql, (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengambil data." });
    }
    res.status(200).json(rows);
  });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
