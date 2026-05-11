import mongoose from 'mongoose';

const checkSchema = new mongoose.Schema({
  date:  { type: String, required: true }, // "YYYY-MM-DD" formatında
  taken: { type: Boolean, default: false },
}, { _id: false });

const medicationSchema = new mongoose.Schema(
  {
    name:   { type: String, required: true, trim: true },
    dose:   { type: String, default: '' },
    time:   { type: String, required: true, default: '08:00' }, // "HH:MM"
    checks: { type: [checkSchema], default: [] }, // geçmiş check kayıtları
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// Virtual: bugün alındı mı?
medicationSchema.virtual('takenToday').get(function () {
  const today = new Date().toISOString().slice(0, 10);
  const rec   = this.checks.find((c) => c.date === today);
  return rec ? rec.taken : false;
});

// Virtual: kaç gün üst üste alındı?
medicationSchema.virtual('streak').get(function () {
  let count = 0;
  const date = new Date();
  while (true) {
    const key = date.toISOString().slice(0, 10);
    const rec = this.checks.find((c) => c.date === key);
    if (!rec || !rec.taken) break;
    count++;
    date.setDate(date.getDate() - 1);
  }
  return count;
});

export default mongoose.model('Medication', medicationSchema);
