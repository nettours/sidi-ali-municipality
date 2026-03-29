const express = require('express');
const router  = express.Router();
const path    = require('path');
const fs      = require('fs');
const multer  = require('multer');
const News    = require('../models/News');
const { protect, authorize } = require('../middleware/auth');

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, Date.now() + '-' + Math.round(Math.random()*1e9) + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const imgTypes   = /jpeg|jpg|png|gif|webp/;
  const videoTypes = /mp4|webm|ogg|mov|avi/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.','');
  if (imgTypes.test(file.mimetype) || imgTypes.test(ext)) return cb(null, true);
  if (videoTypes.test(file.mimetype) || videoTypes.test(ext)) return cb(null, true);
  cb(new Error('نوع الملف غير مدعوم'));
};

const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB للفيديو
  fileFilter
});

const newsUpload = upload.fields([
  { name: 'image',     maxCount: 1 },
  { name: 'images',    maxCount: 5 },
  { name: 'videoFile', maxCount: 1 },
]);

const deleteFile = (url) => {
  if (!url || url.startsWith('http')) return;
  const p = path.join(__dirname, '..', url);
  try { if (fs.existsSync(p)) fs.unlinkSync(p); } catch(e) {}
};

// ── GET /api/news (public) ──────────────────────────────
router.get('/', async (req, res) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.min(50, parseInt(req.query.limit) || 9);
    const filter = { isPublished: true };
    if (req.query.category) filter.category = req.query.category;
    const [total, data] = await Promise.all([
      News.countDocuments(filter),
      News.find(filter).populate('author','name').sort({ createdAt:-1 }).skip((page-1)*limit).limit(limit)
    ]);
    res.json({ success:true, total, page, pages:Math.ceil(total/limit), data });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── GET /api/news/all (admin) ───────────────────────────
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const data = await News.find().populate('author','name').sort({ createdAt:-1 });
    res.json({ success:true, data });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── GET /api/news/:id (public) ──────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('author','name');
    if (!news) return res.status(404).json({ success:false, message:'الخبر غير موجود' });
    news.views += 1;
    await news.save();
    res.json({ success:true, data:news });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── POST /api/news (admin) ──────────────────────────────
router.post('/', protect, authorize('admin'), newsUpload, async (req, res) => {
  try {
    const { title, content, summary, category, isPublished, videoUrl } = req.body;
    const newsData = {
      title, content, summary, category,
      isPublished: isPublished !== 'false',
      author: req.user._id
    };
    // رابط يوتيوب أو خارجي
    if (videoUrl && videoUrl.trim()) newsData.videoUrl = videoUrl.trim();
    // صورة رئيسية
    if (req.files?.image?.[0])
      newsData.image = `/uploads/${req.files.image[0].filename}`;
    // صور إضافية
    if (req.files?.images?.length)
      newsData.images = req.files.images.map(f => `/uploads/${f.filename}`);
    // ملف فيديو مرفوع
    if (req.files?.videoFile?.[0])
      newsData.videoUrl = `/uploads/${req.files.videoFile[0].filename}`;

    const news = await News.create(newsData);
    await news.populate('author','name');
    res.status(201).json({ success:true, message:'تم نشر الخبر', data:news });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── PUT /api/news/:id (admin) ───────────────────────────
router.put('/:id', protect, authorize('admin'), newsUpload, async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success:false, message:'الخبر غير موجود' });

    const update = {
      ...req.body,
      isPublished: req.body.isPublished !== 'false'
    };

    if (req.files?.image?.[0]) {
      deleteFile(news.image);
      update.image = `/uploads/${req.files.image[0].filename}`;
    }
    if (req.files?.images?.length) {
      (news.images || []).forEach(deleteFile);
      update.images = req.files.images.map(f => `/uploads/${f.filename}`);
    }
    if (req.files?.videoFile?.[0]) {
      if (news.videoUrl && !news.videoUrl.startsWith('http')) deleteFile(news.videoUrl);
      update.videoUrl = `/uploads/${req.files.videoFile[0].filename}`;
    }
    if (req.body.videoUrl !== undefined) update.videoUrl = req.body.videoUrl;

    const updated = await News.findByIdAndUpdate(req.params.id, update, { new:true }).populate('author','name');
    res.json({ success:true, message:'تم التحديث', data:updated });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

// ── DELETE /api/news/:id (admin) ────────────────────────
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) return res.status(404).json({ success:false, message:'غير موجود' });
    deleteFile(news.image);
    (news.images||[]).forEach(deleteFile);
    if (news.videoUrl && !news.videoUrl.startsWith('http')) deleteFile(news.videoUrl);
    await news.deleteOne();
    res.json({ success:true, message:'تم الحذف' });
  } catch(e) { res.status(500).json({ success:false, message:e.message }); }
});

module.exports = router;
