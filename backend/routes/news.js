const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const News    = require('../models/News');
const { protect, authorize } = require('../middleware/auth');

// ── Multer: accept up to 6 images ──────────────────────────
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename:    (req, file, cb) => {
    const u = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'news-' + u + path.extname(file.originalname));
  }
});
const fileFilter = (req, file, cb) => {
  /jpeg|jpg|png|gif|webp/.test(file.mimetype) ? cb(null, true) : cb(new Error('صور فقط'));
};
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 }, fileFilter });

// ── Helper: delete file safely ──────────────────────────────
const deleteFile = (url) => {
  if (!url) return;
  const p = path.join(__dirname, '..', url);
  if (fs.existsSync(p)) fs.unlinkSync(p);
};

// ── GET /api/news  (public, paginated) ─────────────────────
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 9);
    const skip  = (page - 1) * limit;
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;

    const [total, data] = await Promise.all([
      News.countDocuments(filter),
      News.find(filter).populate('author','name').sort({ createdAt: -1 }).skip(skip).limit(limit)
    ]);
    res.json({ success: true, total, page, pages: Math.ceil(total / limit), data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/news/all  (admin) ──────────────────────────────
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await News.find().populate('author','name').sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── GET /api/news/:id  (public) ─────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author','name');
    if (!news) return res.status(404).json({ success: false, message: 'الخبر غير موجود' });
    news.views += 1;
    await news.save();
    res.json({ success: true, data: news });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

// ── POST /api/news  (admin, up to 6 images) ─────────────────
router.post('/', protect, authorize('admin'),
  upload.fields([{ name:'image', maxCount:1 }, { name:'images', maxCount:5 }]),
  async (req, res) => {
    try {
      const { title, content, summary, category, isPublished } = req.body;
      const newsData = {
        title, content, summary, category,
        isPublished: isPublished !== 'false',
        author: req.user._id
      };
      if (req.files?.image?.[0])
        newsData.image = `/uploads/${req.files.image[0].filename}`;
      if (req.files?.images?.length)
        newsData.images = req.files.images.map(f => `/uploads/${f.filename}`);

      const news = await News.create(newsData);
      await news.populate('author', 'name');
      res.status(201).json({ success: true, message: 'تم نشر الخبر بنجاح', data: news });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
);

// ── PUT /api/news/:id  (admin) ──────────────────────────────
router.put('/:id', protect, authorize('admin'),
  upload.fields([{ name:'image', maxCount:1 }, { name:'images', maxCount:5 }]),
  async (req, res) => {
    try {
      const news = await News.findById(req.params.id);
      if (!news) return res.status(404).json({ success: false, message: 'الخبر غير موجود' });

      const update = { ...req.body, isPublished: req.body.isPublished !== 'false' };

      if (req.files?.image?.[0]) {
        deleteFile(news.image);
        update.image = `/uploads/${req.files.image[0].filename}`;
      }
      if (req.files?.images?.length) {
        // delete old extra images
        (news.images || []).forEach(deleteFile);
        update.images = req.files.images.map(f => `/uploads/${f.filename}`);
      }

      const updated = await News.findByIdAndUpdate(req.params.id, update, { new: true })
        .populate('author', 'name');
      res.json({ success: true, message: 'تم تحديث الخبر', data: updated });
    } catch (e) { res.status(500).json({ success: false, message: e.message }); }
  }
);

// ── DELETE /api/news/:id  (admin) ───────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success: false, message: 'الخبر غير موجود' });
    deleteFile(news.image);
    (news.images || []).forEach(deleteFile);
    await news.deleteOne();
    res.json({ success: true, message: 'تم حذف الخبر' });
  } catch (e) { res.status(500).json({ success: false, message: e.message }); }
});

module.exports = router;
