import JournalEntry from '../models/JournalEntry.js';
import { analyzeJournalText } from '../services/aiService.js';

// GET /api/journal — tüm girişler (en yeni önce)
export async function getEntries(req, res) {
  try {
    const entries = await JournalEntry.find().sort({ createdAt: -1 }).lean();
    res.json(entries);
  } catch (err) {
    res.status(500).json({ error: 'Girişler alınamadı.', detail: err.message });
  }
}

// POST /api/journal — yeni giriş oluştur + AI analizi yap
export async function createEntry(req, res) {
  try {
    const { text, mood } = req.body;

    if (!text || text.trim().length < 20) {
      return res.status(400).json({ error: 'Metin en az 20 karakter olmalıdır.' });
    }

    // Önce kaydet (analiz beklerken kullanıcı bekletmeyelim, ama burada senkron yapıyoruz)
    const entry = new JournalEntry({ text: text.trim(), mood: mood || null });

    // AI Analizi
    try {
      const distortions = await analyzeJournalText(text.trim());
      entry.distortions = distortions;
    } catch (aiErr) {
      console.error('AI analiz hatası:', aiErr.message);
      // AI hatası uygulamayı durdurmasın, distortions null kalsın
    }

    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    res.status(500).json({ error: 'Giriş oluşturulamadı.', detail: err.message });
  }
}

// DELETE /api/journal/:id — giriş sil
export async function deleteEntry(req, res) {
  try {
    const entry = await JournalEntry.findByIdAndDelete(req.params.id);
    if (!entry) return res.status(404).json({ error: 'Giriş bulunamadı.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Giriş silinemedi.', detail: err.message });
  }
}
