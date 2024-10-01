const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Inisialisasi database
const dbPath = path.join(__dirname, "komentar.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error(err.message);
  } else {
    console.log("Connected to the SQLite database.");
    // Membuat tabel jika belum ada
    db.run(`CREATE TABLE IF NOT EXISTS komentar_user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nama TEXT NOT NULL,
            ucapan TEXT NOT NULL,
            konfirmasi TEXT NOT NULL,
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
  }
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
  db.run(sql, [nama, ucapan, konfirmasi], function (err) {
    if (err) {
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat menyimpan data." });
    }
    res.status(200).json({
      message: "Pesan berhasil dikirim!",
      data: { id: this.lastID, nama, ucapan, konfirmasi },
    });
  });
});

// Menjalankan server
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});

// Endpoint untuk mengambil semua komentar
app.get("/api/komentar", (req, res) => {
  const sql = "SELECT * FROM komentar_user ORDER BY timestamp DESC";
  db.all(sql, [], (err, rows) => {
    if (err) {
      return res
        .status(500)
        .json({ message: "Terjadi kesalahan saat mengambil data." });
    }
    res.status(200).json(rows);
  });
});
