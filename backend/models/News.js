const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  summary: {
    type: String,
    maxlength: [300, 'Summary cannot exceed 300 characters']
  },
  image: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['عام', 'صحة', 'تعليم', 'بنية تحتية', 'ثقافة', 'رياضة', 'أخرى'],
    default: 'عام'
  },
  isPublished: {
    type: Boolean,
    default: true
  },
  views: {
    type: Number,
    default: 0
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

// Index for faster queries
NewsSchema.index({ createdAt: -1 });
NewsSchema.index({ isPublished: 1 });

module.exports = mongoose.model('News', NewsSchema);
