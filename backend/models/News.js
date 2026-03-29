const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String, required: [true, 'العنوان مطلوب'], trim: true, maxlength: 200
  },
  content: {
    type: String, required: [true, 'المحتوى مطلوب']
  },
  summary: {
    type: String, maxlength: 400
  },
  // صورة رئيسية واحدة
  image: { type: String, default: null },
  // صور إضافية متعددة
  images: [{ type: String }],
  category: {
    type: String,
    enum: ['عام', 'صحة', 'تعليم', 'بنية تحتية', 'ثقافة', 'رياضة', 'أخرى'],
    default: 'عام'
  },
  isPublished: { type: Boolean, default: true },
  views:       { type: Number,  default: 0 },
  author: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true
  }
}, { timestamps: true });

NewsSchema.index({ createdAt: -1, isPublished: 1 });

module.exports = mongoose.model('News', NewsSchema);
