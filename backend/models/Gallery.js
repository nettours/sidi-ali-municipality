const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [150, 'Title cannot exceed 150 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  imagePublicId: {
    type: String,
    default: null
  },
  category: {
    type: String,
    enum: ['فعاليات', 'مشاريع', 'بنية تحتية', 'طبيعة', 'أخرى'],
    default: 'أخرى'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

GallerySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Gallery', GallerySchema);
