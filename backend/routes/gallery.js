const express = require('express');
const router = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// @route   GET /api/gallery
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const total = await Gallery.countDocuments(filter);
    const photos = await Gallery.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ isFeatured: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({ success: true, total, page, pages: Math.ceil(total / limit), data: photos });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/gallery
// @access  Admin only
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'يرجى رفع صورة' });
    }

    const { title, description, category, isFeatured } = req.body;

    const photo = await Gallery.create({
      title,
      description,
      imageUrl: `/uploads/${req.file.filename}`,
      category: category || 'أخرى',
      isFeatured: isFeatured === 'true',
      uploadedBy: req.user._id
    });

    res.status(201).json({ success: true, message: 'تم رفع الصورة بنجاح', data: photo });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/gallery/:id
// @access  Admin only
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'الصورة غير موجودة' });

    const updateData = { ...req.body };

    if (req.file) {
      // Remove old image file
      const oldPath = path.join(__dirname, '..', photo.imageUrl);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      updateData.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await Gallery.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, message: 'تم تحديث الصورة بنجاح', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/gallery/:id
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'الصورة غير موجودة' });

    const imgPath = path.join(__dirname, '..', photo.imageUrl);
    if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);

    await photo.deleteOne();
    res.json({ success: true, message: 'تم حذف الصورة بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
