// // INI BISA KIRIM TEXT
// require('dotenv').config();
// const express = require('express');
// const { GoogleGenAI } = require('@google/genai');

// const app = express();
// const port = process.env.PORT || 3000;

// // Middleware untuk membaca JSON dan melayani file statis (HTML/CSS UI nanti)
// app.use(express.json());
// app.use(express.static('public'));

// // Inisialisasi SDK Gemini dengan API Key dari .env
// const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// // System Instruction khusus untuk Inggit (Asisten Virtual RS)
// const SYSTEM_INSTRUCTION = `
// Kamu adalah "Inggit", Asisten Virtual resmi dari Rumah Sakit.
// Tugasmu adalah membantu pasien dan pengunjung memberikan informasi mengenai:
// 1. Cara pendaftaran antrean poliklinik online/offline.
// 2. Persyaratan pendaftaran pasien BPJS Kesehatan dan Umum.
// 3. Informasi jam operasional layanan poliklinik, IGD, dan pendaftaran.
// 4. Edukasi umum mengenai langkah persiapan sebelum pemeriksaan laboratorium/radiologi.

// Aturan menjawab:
// - Gunakan bahasa Indonesia yang ramah, santun, dan empati (ramah khas pelayanan kesehatan).
// - Jangan pernah memberikan diagnosis medis atau resep obat. Jika pengguna bertanya tentang gejala penyakit berat, sarankan untuk segera berkonsultasi dengan dokter di IGD/Poli.
// - Berikan jawaban yang ringkas dan mudah dipahami dalam bentuk poin-poin.
// `;

// // Endpoint API untuk kirim & terima pesan chat
// app.post('/api/chat', async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message) {
//       return res.status(400).json({ error: 'Pesan tidak boleh kosong' });
//     }

//     // Memanggil model yang aktif di API Key kamu
//     const response = await ai.models.generateContent({
//       model: 'gemini-flash-latest', // <-- Ganti bagian ini ya!
//       contents: message,
//       config: {
//         temperature: 0.3,
//         systemInstruction: SYSTEM_INSTRUCTION,
//       },
//     });

//     res.json({ reply: response.text });
//   } catch (error) {
//     console.error('Error pada server:', error);
//     res.status(500).json({ error: 'Terjadi kesalahan pada server AI.' });
//   }
// });

// // Jalankan server Express
// app.listen(port, () => {
//   console.log(`Server SIMRS Bot running di http://localhost:${port}`);
// });







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
Kamu adalah "Inggit", Asisten Virtual resmi dari Rumah Sakit.
Tugasmu adalah membantu pasien dan pengunjung memberikan informasi mengenai:
1. Cara pendaftaran antrean poliklinik online/offline.
2. Persyaratan pendaftaran pasien BPJS Kesehatan dan Umum (termasuk membaca/memeriksa foto dokumen rujukan/KTP pasien jika dikirimkan).
3. Informasi jam operasional layanan poliklinik, IGD, dan pendaftaran.
4. Edukasi umum mengenai langkah persiapan sebelum pemeriksaan laboratorium/radiologi.

Aturan menjawab:
- Gunakan bahasa Indonesia yang ramah, santun, dan empati (ramah khas pelayanan kesehatan).
- Jangan pernah memberikan diagnosis medis atau resep obat. Jika pengguna bertanya tentang gejala penyakit berat, sarankan untuk segera berkonsultasi dengan dokter di IGD/Poli.
- Berikan jawaban yang ringkas dan mudah dipahami dalam bentuk poin-poin.
`;

app.post('/api/chat', upload.single('file'), async (req, res) => {
  try {
    const { message } = req.body;
    const file = req.file;

    const parts = [];

    // Jika pengguna mengirim Teks
    if (message) {
      parts.push({ text: message });
    }

    // Jika pengguna mengunggah File (Gambar / Audio)
    if (file) {
      const base64Data = file.buffer.toString('base64');
      parts.push({
        inlineData: {
          mimeType: file.mimetype,
          data: base64Data
        }
      });
    }

    if (parts.length === 0) {
      return res.status(400).json({ error: 'Pesan atau file tidak boleh kosong' });
    }

    // Memanggil model Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: parts, // Langsung lewatkan array parts
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