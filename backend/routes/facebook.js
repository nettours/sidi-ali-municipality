const express = require('express');
const router = express.Router();

const FB_PAGE_ID = '100063508553211';

// @route  GET /api/facebook/photos
// @desc   Fetch photos from Facebook page via Graph API
// @access Public
router.get('/photos', async (req, res) => {
  const accessToken = process.env.FB_ACCESS_TOKEN;

  // ── If Facebook token is available ──────────────────────
  if (accessToken) {
    try {
      const fetch = (...args) => import('node-fetch').then(({default: f}) => f(...args));
      const limit = req.query.limit || 20;

      const url = `https://graph.facebook.com/v18.0/${FB_PAGE_ID}/photos` +
        `?fields=id,name,images,created_time&limit=${limit}&access_token=${accessToken}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.error) {
        console.error('FB API Error:', data.error.message);
        return res.json({ success: true, source: 'fallback', data: getFallbackPhotos() });
      }

      const photos = (data.data || []).map(photo => ({
        id:          photo.id,
        title:       photo.name || 'صورة من صفحة البلدية',
        description: photo.name || '',
        imageUrl:    photo.images?.[0]?.source || '',
        thumbnail:   photo.images?.[photo.images.length - 1]?.source || '',
        createdAt:   photo.created_time,
        source:      'facebook'
      })).filter(p => p.imageUrl);

      return res.json({ success: true, source: 'facebook', data: photos });

    } catch (err) {
      console.error('Facebook fetch error:', err.message);
    }
  }

  // ── Fallback: return sample data from the page ───────────
  res.json({
    success: true,
    source: 'fallback',
    message: 'لإتاحة جلب الصور من فيسبوك تلقائياً، أضف FB_ACCESS_TOKEN في .env',
    pageUrl: `https://www.facebook.com/profile.php?id=${FB_PAGE_ID}`,
    data: getFallbackPhotos()
  });
});

// @route  GET /api/facebook/info
// @desc   Get page info
router.get('/info', (req, res) => {
  res.json({
    success: true,
    pageId: FB_PAGE_ID,
    pageUrl: `https://www.facebook.com/profile.php?id=${FB_PAGE_ID}`,
    hasToken: !!process.env.FB_ACCESS_TOKEN,
    instructions: {
      step1: 'اذهب إلى developers.facebook.com وأنشئ تطبيقاً',
      step2: 'احصل على Page Access Token',
      step3: 'أضف FB_ACCESS_TOKEN=your_token في ملف backend/.env',
      step4: 'أعد تشغيل الخادم'
    }
  });
});

// ── Fallback photos (curated sample data) ──────────────────
function getFallbackPhotos() {
  return [
    {
      id: 'fb1',
      title: 'مشروع تهيئة الساحة الرئيسية',
      description: 'أشغال تهيئة وتحديث الساحة المركزية لبلدية سيدي علي',
      imageUrl: 'https://picsum.photos/seed/sidiali1/800/600',
      thumbnail: 'https://picsum.photos/seed/sidiali1/400/300',
      source: 'placeholder'
    },
    {
      id: 'fb2',
      title: 'حملة النظافة والتشجير',
      description: 'المواطنون وعمال البلدية في حملة نظافة شاملة',
      imageUrl: 'https://picsum.photos/seed/sidiali2/800/600',
      thumbnail: 'https://picsum.photos/seed/sidiali2/400/300',
      source: 'placeholder'
    },
    {
      id: 'fb3',
      title: 'توزيع مساعدات اجتماعية',
      description: 'رئيس البلدية يشرف على توزيع المساعدات للعائلات المحتاجة',
      imageUrl: 'https://picsum.photos/seed/sidiali3/800/600',
      thumbnail: 'https://picsum.photos/seed/sidiali3/400/300',
      source: 'placeholder'
    },
    {
      id: 'fb4',
      title: 'إنجاز مشروع الطريق الجديد',
      description: 'تدشين الطريق الرابط بين أحياء البلدية',
      imageUrl: 'https://picsum.photos/seed/sidiali4/800/600',
      thumbnail: 'https://picsum.photos/seed/sidiali4/400/300',
      source: 'placeholder'
    },
    {
      id: 'fb5',
      title: 'اجتماع المجلس البلدي',
      description: 'جلسة عادية للمجلس الشعبي البلدي لسيدي علي',
      imageUrl: 'https://picsum.photos/seed/sidiali5/800/600',
      thumbnail: 'https://picsum.photos/seed/sidiali5/400/300',
      source: 'placeholder'
    },
    {
      id: 'fb6',
      title: 'مشاريع التنمية المحلية',
      description: 'متابعة أشغال المشاريع التنموية في البلدية',
      imageUrl: 'https://picsum.photos/seed/sidiali6/800/600',
      thumbnail: 'https://picsum.photos/seed/sidiali6/400/300',
      source: 'placeholder'
    }
  ];
}

module.exports = router;
