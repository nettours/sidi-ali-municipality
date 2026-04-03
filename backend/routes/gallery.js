const express = require('express');
const router  = express.Router();
const Gallery = require('../models/Gallery');
const { protect, authorize } = require('../middleware/auth');
const { uploadImage, deleteFile } = require('../middleware/cloudinary');

// ── GET /api/gallery (public) ───────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 12);
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    const [total, data] = await Promise.all([
      Gallery.countDocuments(filter),
      Gallery.find(filter)
        .populate('uploadedBy', 'name')
        .sort({ isFeatured: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ]);
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/gallery (admin) ───────────────────────────────
router.post('/', protect, authorize('admin'), uploadImage.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'يرجى رفع صورة' });

    const { title, description, category, isFeatured } = req.body;
    const photo = await Gallery.create({
      title,
      description,
      imageUrl:   req.file.path,   // Cloudinary secure URL
      category:   category || 'أخرى',
      isFeatured: isFeatured === 'true',
      uploadedBy: req.user._id,
    });
    res.status(201).json({ success: true, message: 'تم رفع الصورة بنجاح', data: photo });
  } catch (e) {
    console.error('POST /gallery error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── PUT /api/gallery/:id (admin) ────────────────────────────
router.put('/:id', protect, authorize('admin'), uploadImage.single('image'), async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'الصورة غير موجودة' });

    const update = { ...req.body };
    if (req.file) {
      await deleteFile(photo.imageUrl);
      update.imageUrl = req.file.path;
    }
    const updated = await Gallery.findByIdAndUpdate(req.params.id, update, { new: true });
    res.json({ success: true, message: 'تم التحديث', data: updated });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── DELETE /api/gallery/:id (admin) ─────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const photo = await Gallery.findById(req.params.id);
    if (!photo) return res.status(404).json({ success: false, message: 'غير موجودة' });
    await deleteFile(photo.imageUrl);
    await photo.deleteOne();
    res.json({ success: true, message: 'تم الحذف' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
