const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const { protect, authorize } = require('../middleware/auth');

// @route   GET /api/announcements
// @access  Public
router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const announcements = await Announcement.find({
      isActive: true,
      $or: [{ expiresAt: null }, { expiresAt: { $gt: now } }]
    })
      .populate('author', 'name')
      .sort({ priority: -1, createdAt: -1 })
      .limit(20);

    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/announcements/all  (admin)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const announcements = await Announcement.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/announcements
// @access  Admin only
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const announcement = await Announcement.create({ ...req.body, author: req.user._id });
    res.status(201).json({ success: true, message: 'تم إضافة الإعلان بنجاح', data: announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/announcements/:id
// @access  Admin only
router.put('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const updated = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    res.json({ success: true, message: 'تم تحديث الإعلان بنجاح', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/announcements/:id
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const deleted = await Announcement.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'الإعلان غير موجود' });
    res.json({ success: true, message: 'تم حذف الإعلان بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
