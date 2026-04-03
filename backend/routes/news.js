const express = require('express');
const router  = express.Router();
const News    = require('../models/News');
const { protect, authorize } = require('../middleware/auth');
const { uploadNewsFiles, deleteFile } = require('../middleware/cloudinary');

// ── GET /api/news (public, paginated) ──────────────────────
router.get('/', async (req, res) => {
  try {
    const page   = Math.max(1, parseInt(req.query.page)  || 1);
    const limit  = Math.min(50, parseInt(req.query.limit) || 9);
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;

    const [total, data] = await Promise.all([
      News.countDocuments(filter),
      News.find(filter)
        .populate('author', 'name')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
    ]);
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/news/all (admin) ───────────────────────────────
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await News.find().populate('author', 'name').sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/news/:id (public) ──────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author', 'name');
    if (!news) return res.status(404).json({ success: false, message: 'الخبر غير موجود' });
    news.views += 1;
    await news.save();
    res.json({ success: true, data: news });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/news (admin) ──────────────────────────────────
router.post('/', protect, authorize('admin'), uploadNewsFiles, async (req, res) => {
  try {
    const { title, content, summary, category, isPublished, videoUrl } = req.body;
    const newsData = {
      title, content, summary, category,
      isPublished: isPublished !== 'false',
      author: req.user._id,
    };

    // Cloudinary returns secure_url directly in file.path
    if (req.files?.image?.[0])
      newsData.image = req.files.image[0].path; // Cloudinary URL

    if (req.files?.images?.length)
      newsData.images = req.files.images.map(f => f.path);

    if (videoUrl?.trim())
      newsData.videoUrl = videoUrl.trim();

    const news = await News.create(newsData);
    await news.populate('author', 'name');
    res.status(201).json({ success: true, message: 'تم نشر الخبر بنجاح', data: news });
  } catch (e) {
    console.error('POST /news error:', e);
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── PUT /api/news/:id (admin) ───────────────────────────────
router.put('/:id', protect, authorize('admin'), uploadNewsFiles, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'الخبر غير موجود' });

    const update = { ...req.body, isPublished: req.body.isPublished !== 'false' };

    if (req.files?.image?.[0]) {
      await deleteFile(news.image);
      update.image = req.files.image[0].path;
    }
    if (req.files?.images?.length) {
      await Promise.all((news.images || []).map(deleteFile));
      update.images = req.files.images.map(f => f.path);
    }
    if (req.body.videoUrl !== undefined) update.videoUrl = req.body.videoUrl;

    const updated = await News.findByIdAndUpdate(req.params.id, update, { new: true })
      .populate('author', 'name');
    res.json({ success: true, message: 'تم التحديث', data: updated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// ── DELETE /api/news/:id (admin) ────────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'غير موجود' });
    await deleteFile(news.image);
    await Promise.all((news.images || []).map(deleteFile));
    await news.deleteOne();
    res.json({ success: true, message: 'تم الحذف' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
