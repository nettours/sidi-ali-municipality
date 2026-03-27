const express = require('express');
const router = express.Router();
const News = require('../models/News');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const path = require('path');
const fs = require('fs');

// @route   GET /api/news
// @desc    Get all published news
// @access  Public
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;

    const total = await News.countDocuments(filter);
    const news = await News.find(filter)
      .populate('author', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: news
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/news/all  (admin - all including unpublished)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/news/:id
router.get('/:id', async (req, res) => {
  try {
    const newsItem = await News.findById(req.params.id).populate('author', 'name');
    if (!newsItem) return res.status(404).json({ success: false, message: 'الخبر غير موجود' });

    // Increment views
    newsItem.views += 1;
    await newsItem.save();

    res.json({ success: true, data: newsItem });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/news
// @access  Admin only
router.post('/', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const { title, content, summary, category, isPublished } = req.body;

    const newsData = {
      title,
      content,
      summary,
      category,
      isPublished: isPublished !== undefined ? isPublished : true,
      author: req.user._id
    };

    if (req.file) {
      newsData.image = `/uploads/${req.file.filename}`;
    }

    const news = await News.create(newsData);
    res.status(201).json({ success: true, message: 'تم نشر الخبر بنجاح', data: news });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   PUT /api/news/:id
// @access  Admin only
router.put('/:id', protect, authorize('admin'), upload.single('image'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'الخبر غير موجود' });

    const updateData = { ...req.body };

    if (req.file) {
      // Remove old image if exists
      if (news.image) {
        const oldPath = path.join(__dirname, '..', news.image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
      updateData.image = `/uploads/${req.file.filename}`;
    }

    const updated = await News.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.json({ success: true, message: 'تم تحديث الخبر بنجاح', data: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   DELETE /api/news/:id
// @access  Admin only
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'الخبر غير موجود' });

    if (news.image) {
      const imgPath = path.join(__dirname, '..', news.image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    await news.deleteOne();
    res.json({ success: true, message: 'تم حذف الخبر بنجاح' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
