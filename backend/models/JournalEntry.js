import mongoose from 'mongoose';

const distortionSchema = new mongoose.Schema({
  distortion:  { type: String, required: true },
  explanation: { type: String, required: true },
  reframe:     { type: String, required: true },
}, { _id: false });

const journalEntrySchema = new mongoose.Schema(
  {
    text:        { type: String, required: true, minlength: 20 },
    mood:        {
      type: String,
      enum: ['İyi', 'Karışık', 'Yorgun', 'Kaygılı', 'Kötü', null],
      default: null,
    },
    distortions: { type: [distortionSchema], default: null }, // null = henüz analiz edilmedi
  },
  { timestamps: true }
);

export default mongoose.model('JournalEntry', journalEntrySchema);
