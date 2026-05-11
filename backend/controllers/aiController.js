import { analyzeJournalText } from '../services/aiService.js';

// POST /api/ai/analyze — sadece analiz yap, kaydetme
export async function analyze(req, res) {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Metin en az 20 karakter olmalıdır.' });
    }

    const distortions = await analyzeJournalText(text.trim());
    res.json({ distortions });
  } catch (err) {
    res.status(500).json({ error: 'Analiz yapılamadı.', detail: err.message });
  }
}
