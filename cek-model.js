require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

async function listAllModels() {
  try {
    const response = await ai.models.list();
    console.log('--- DAFTAR MODEL YANG TERSEDIA UNTUK API KEY ---');
    for await (const m of response) {
      if (m.supportedActions && m.supportedActions.includes('generateContent')) {
        console.log(`- ${m.name}`);
      }
    }
  } catch (err) {
    console.error('Gagal mengambil daftar model:', err);
  }
}

listAllModels();