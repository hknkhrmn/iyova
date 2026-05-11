import Medication from '../models/Medication.js';

// GET /api/meds — tüm ilaçlar
export async function getMeds(req, res) {
  try {
    const meds = await Medication.find().sort({ time: 1 });
    // Virtual alanları JSON'a dahil et
    res.json(meds.map((m) => m.toJSON()));
  } catch (err) {
    res.status(500).json({ error: 'İlaçlar alınamadı.', detail: err.message });
  }
}

// POST /api/meds — yeni ilaç ekle
export async function createMed(req, res) {
  try {
    const { name, dose, time } = req.body;
    if (!name?.trim()) {
      return res.status(400).json({ error: 'İlaç adı zorunludur.' });
    }
    const med = await Medication.create({
      name: name.trim(),
      dose: dose?.trim() || '',
      time: time || '08:00',
    });
    res.status(201).json(med.toJSON());
  } catch (err) {
    res.status(500).json({ error: 'İlaç eklenemedi.', detail: err.message });
  }
}

// PATCH /api/meds/:id/toggle — bugünkü alım durumunu değiştir
export async function toggleMed(req, res) {
  try {
    const med = await Medication.findById(req.params.id);
    if (!med) return res.status(404).json({ error: 'İlaç bulunamadı.' });

    const today = new Date().toISOString().slice(0, 10);
    const idx   = med.checks.findIndex((c) => c.date === today);

    if (idx >= 0) {
      // Var olan kaydı toggle et
      med.checks[idx].taken = !med.checks[idx].taken;
    } else {
      // Bugün için kayıt yok, alındı olarak ekle
      med.checks.push({ date: today, taken: true });
    }

    // Mongoose nested array değişikliği için markModified
    med.markModified('checks');
    await med.save();

    res.json(med.toJSON());
  } catch (err) {
    res.status(500).json({ error: 'Toggle işlemi başarısız.', detail: err.message });
  }
}

// DELETE /api/meds/:id — ilaç sil
export async function deleteMed(req, res) {
  try {
    const med = await Medication.findByIdAndDelete(req.params.id);
    if (!med) return res.status(404).json({ error: 'İlaç bulunamadı.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'İlaç silinemedi.', detail: err.message });
  }
}
