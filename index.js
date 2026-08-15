
// INI BISA KIRIM TEXT, GAMBAR DAN JUGA INVOIS
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const { GoogleGenAI } = require('@google/genai');

const app = express();
const upload = multer(); // Menangani file upload di memori
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
Identitas & Karakter:
Nama kamu adalah "Inggit", Asisten Virtual cerdas dan ramah dari Rumah Sakit.
Kamu memiliki kepribadian yang ramah, sopan, sabar, solutif, dan berwawasan luas.

Tugas Utama (Layanan RS):
1. Pendaftaran Antrean: Menjelaskan alur pendaftaran antrean poliklinik online maupun offline.
2. Syarat Pasien: Menginfokan persyaratan pasien BPJS dan Umum, serta membaca/mengecek kelengkapan foto rujukan/KTP jika dikirim.
3. Operasional & Jadwal: Memberikan info jam buka poli, IGD 24 Jam, dan loket pendaftaran.
4. Persiapan Tes: Menjelaskan persiapan dasar sebelum lab darah atau radiologi.

Fleksibilitas Obrolan:
- Kamu TETAP BISA dan DIIZINKAN menjawab pertanyaan umum apa saja di luar topik rumah sakit (seperti pertanyaan sains, tips harian, pengetahuan umum, atau sekadar mengobrol santai) dengan ramah dan informatif.
- Tetap gunakan panggilan "Inggit" saat berinteraksi.

Batasan Medis (Wajib):
- Jangan memberikan diagnosis penyakit berat atau resep obat keras secara mandiri.
- Jika pengguna mengeluhkan gejala medis darurat, sarankan segera ke IGD atau poliklinik dokter terdekat.
- Format jawaban rapi, ringkas, dan mudah dibaca lewat layar HP.
`;

app.post('/api/chat', upload.single('file'), async (req, res) => {
  try {
    const { message } = req.body;
    const file = req.file;

    const parts = [];

    // Jika pengguna mengunggah File (Gambar / Audio)
    if (file) {
      const base64Data = file.buffer.toString('base64');
      // Pastikan mimeType bersih dari parameter tambahan
      const cleanMime = file.mimetype.split(';')[0];
      parts.push({
        inlineData: {
          mimeType: cleanMime,
          data: base64Data
        }
      });
    }

    // Jika pengguna mengirim Teks atau jika hanya mengirim suara
    if (message) {
      parts.push({ text: message });
    } else if (file && file.mimetype.startsWith('audio/')) {
      parts.push({ text: 'Dengarkan pesan suara ini, lalu jawab pertanyaannya dengan ramah dan lengkap.' });
    }

    if (parts.length === 0) {
      return res.status(400).json({ error: 'Pesan atau file tidak boleh kosong' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash-lite',
      contents: parts,
      config: {
        temperature: 0.3,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    res.json({ reply: response.text });
  } catch (error) {
    console.error('Error pada server:', error);
    res.status(500).json({ error: 'Terjadi kesalahan pada server AI.' });
  }
});

app.listen(port, () => {
  console.log(`Server SIMRS Bot running di http://localhost:${port}`);
});

process.on('uncaughtException', (err) => {
  console.error('Ada uncaughtException:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Ada unhandledRejection di:', promise, 'alasan:', reason);
});