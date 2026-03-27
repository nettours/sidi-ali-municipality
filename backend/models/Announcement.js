const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['إعلان', 'تنبيه', 'مناقصة', 'توظيف', 'عاجل'],
    default: 'إعلان'
  },
  priority: {
    type: String,
    enum: ['منخفض', 'متوسط', 'عالي', 'عاجل'],
    default: 'متوسط'
  },
  expiresAt: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  attachmentUrl: {
    type: String,
    default: null
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

AnnouncementSchema.index({ createdAt: -1, isActive: 1 });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
