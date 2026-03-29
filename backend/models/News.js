const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true, maxlength: 200 },
  content:     { type: String, required: true },
  summary:     { type: String, maxlength: 400 },
  image:       { type: String, default: null },       // صورة رئيسية
  images:      [{ type: String }],                    // صور إضافية
  videoUrl:    { type: String, default: null },       // رابط يوتيوب أو ملف مرفوع
  videoFile:   { type: String, default: null },       // ملف فيديو مرفوع
  category: {
    type: String,
    enum: ['عام','صحة','تعليم','بنية تحتية','ثقافة','رياضة','أخرى'],
    default: 'عام'
  },
  isPublished: { type: Boolean, default: true },
  views:       { type: Number,  default: 0 },
  author:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

NewsSchema.index({ createdAt: -1, isPublished: 1 });
module.exports = mongoose.model('News', NewsSchema);
