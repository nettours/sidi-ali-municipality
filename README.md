# 🏛️ بلدية سيدي علي — الموقع الرسمي

الموقع الرسمي لبلدية سيدي علي، ولاية مستغانم، الجزائر.

---

## 📁 هيكل المشروع

```
sidi-ali-municipality/
│
├── backend/                   # Node.js + Express API
│   ├── models/
│   │   ├── User.js            # نموذج المستخدمين
│   │   ├── News.js            # نموذج الأخبار
│   │   ├── Gallery.js         # نموذج الصور
│   │   └── Announcement.js    # نموذج الإعلانات
│   ├── routes/
│   │   ├── auth.js            # تسجيل الدخول والتسجيل
│   │   ├── news.js            # CRUD الأخبار
│   │   ├── gallery.js         # CRUD الصور + رفع الملفات
│   │   └── announcements.js   # CRUD الإعلانات
│   ├── middleware/
│   │   ├── auth.js            # JWT Authentication
│   │   └── upload.js          # Multer file upload
│   ├── uploads/               # مجلد الصور المرفوعة
│   ├── server.js              # نقطة دخول الخادم
│   ├── package.json
│   └── .env.example
│
├── frontend/                  # React Application
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── context/
│       │   └── AuthContext.js  # إدارة حالة المستخدم
│       ├── components/
│       │   ├── Navbar.js/css   # شريط التنقل
│       │   ├── Footer.js/css   # التذييل
│       │   └── Loader.js       # مؤشر التحميل
│       ├── pages/
│       │   ├── HomePage.js/css      # الصفحة الرئيسية
│       │   ├── NewsPage.js/css      # قائمة الأخبار
│       │   ├── NewsDetail.js/css    # تفاصيل الخبر
│       │   ├── GalleryPage.js/css   # معرض الصور + Lightbox
│       │   ├── LoginPage.js         # تسجيل الدخول
│       │   ├── RegisterPage.js      # إنشاء حساب
│       │   └── admin/
│       │       ├── AdminDashboard.js    # لوحة التحكم الرئيسية
│       │       ├── AdminNews.js         # إدارة الأخبار
│       │       ├── AdminGallery.js      # إدارة الصور
│       │       └── AdminAnnouncements.js # إدارة الإعلانات
│       ├── App.js
│       └── index.css
│
├── package.json               # Root scripts
├── .gitignore
└── README.md
```

---

## 🚀 التثبيت والتشغيل

### المتطلبات
- **Node.js** v16 أو أحدث → [nodejs.org](https://nodejs.org)
- **MongoDB** (محلي أو [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** v8 أو أحدث

---

### الخطوة 1 — إعداد Backend

```bash
# انتقل إلى مجلد Backend
cd sidi-ali-municipality/backend

# انسخ ملف الإعدادات
cp .env.example .env

# افتح .env وعدّل القيم:
# MONGODB_URI=mongodb://localhost:27017/sidi-ali-municipality
# JWT_SECRET=ضع_هنا_مفتاحاً_سرياً_طويلاً
# ADMIN_EMAIL=admin@sidialimairie.dz
# ADMIN_PASSWORD=Admin@123456

# ثبّت الحزم
npm install

# شغّل الخادم (وضع التطوير)
npm run dev
# الخادم يعمل على: http://localhost:5000
```

---

### الخطوة 2 — إعداد Frontend

```bash
# في نافذة طرفية جديدة، انتقل إلى مجلد Frontend
cd sidi-ali-municipality/frontend

# ثبّت الحزم
npm install

# شغّل التطبيق
npm start
# يفتح تلقائياً على: http://localhost:3000
```

---

### تشغيل الكل معاً (اختياري)

```bash
# من المجلد الرئيسي
cd sidi-ali-municipality
npm install          # يثبّت concurrently
npm run dev          # يشغّل Backend + Frontend معاً
```

---

## 🔑 بيانات الدخول الافتراضية

| الحقل    | القيمة                    |
|----------|---------------------------|
| البريد   | admin@sidialimairie.dz    |
| كلمة المرور | Admin@123456           |
| الدور    | Admin (مدير)              |

> **ملاحظة:** يتم إنشاء حساب الأدمن تلقائياً عند أول تشغيل للخادم.

---

## 🌐 الروابط المتاحة

| الصفحة                    | الرابط                           |
|--------------------------|----------------------------------|
| الصفحة الرئيسية          | http://localhost:3000            |
| الأخبار                  | http://localhost:3000/news       |
| معرض الصور              | http://localhost:3000/gallery    |
| تسجيل الدخول            | http://localhost:3000/login      |
| لوحة التحكم (Admin)     | http://localhost:3000/admin      |
| API Health Check         | http://localhost:5000/api/health |

---

## 📡 API Endpoints

### 🔐 Authentication
| Method | Endpoint              | وصف              | صلاحية  |
|--------|-----------------------|------------------|---------|
| POST   | /api/auth/login       | تسجيل الدخول     | عام     |
| POST   | /api/auth/register    | إنشاء حساب       | عام     |
| GET    | /api/auth/me          | بيانات المستخدم  | خاص     |

### 📰 News
| Method | Endpoint              | وصف                   | صلاحية  |
|--------|-----------------------|-----------------------|---------|
| GET    | /api/news             | كل الأخبار المنشورة   | عام     |
| GET    | /api/news/all         | كل الأخبار            | Admin   |
| GET    | /api/news/:id         | تفاصيل خبر           | عام     |
| POST   | /api/news             | إضافة خبر             | Admin   |
| PUT    | /api/news/:id         | تعديل خبر             | Admin   |
| DELETE | /api/news/:id         | حذف خبر               | Admin   |

### 🖼️ Gallery
| Method | Endpoint              | وصف             | صلاحية  |
|--------|-----------------------|-----------------|---------|
| GET    | /api/gallery          | كل الصور        | عام     |
| POST   | /api/gallery          | رفع صورة        | Admin   |
| PUT    | /api/gallery/:id      | تعديل صورة      | Admin   |
| DELETE | /api/gallery/:id      | حذف صورة        | Admin   |

### 📢 Announcements
| Method | Endpoint                  | وصف              | صلاحية  |
|--------|---------------------------|------------------|---------|
| GET    | /api/announcements        | الإعلانات النشطة | عام     |
| GET    | /api/announcements/all    | كل الإعلانات     | Admin   |
| POST   | /api/announcements        | إضافة إعلان      | Admin   |
| PUT    | /api/announcements/:id    | تعديل إعلان      | Admin   |
| DELETE | /api/announcements/:id    | حذف إعلان        | Admin   |

---

## 🌍 النشر على الإنترنت

### Backend على Render.com
1. أنشئ حساباً على [render.com](https://render.com)
2. أنشئ **Web Service** جديداً
3. اربطه بمستودع GitHub
4. اضبط:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
5. أضف متغيرات البيئة (Environment Variables):
   ```
   MONGODB_URI = رابط_MongoDB_Atlas
   JWT_SECRET  = مفتاح_سري_طويل
   NODE_ENV    = production
   ```

### Frontend على Vercel.com
1. أنشئ حساباً على [vercel.com](https://vercel.com)
2. استورد المشروع من GitHub
3. اضبط:
   - **Root Directory:** `frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
4. أضف متغير البيئة:
   ```
   REACT_APP_API_URL = https://your-backend.onrender.com/api
   ```

---

## 📤 رفع المشروع على GitHub

```bash
# في المجلد الرئيسي للمشروع
git init
git add .
git commit -m "🚀 Initial commit - Sidi Ali Municipality Website"

# أنشئ مستودعاً جديداً على github.com ثم:
git remote add origin https://github.com/YOUR_USERNAME/sidi-ali-municipality.git
git branch -M main
git push -u origin main
```

---

## ⚙️ متغيرات البيئة (backend/.env)

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sidi-ali-municipality
JWT_SECRET=your_super_long_secret_key_here_minimum_32_chars
JWT_EXPIRE=7d
NODE_ENV=development

ADMIN_EMAIL=admin@sidialimairie.dz
ADMIN_PASSWORD=Admin@123456
```

---

## 🎨 التقنيات المستخدمة

### Frontend
- **React 18** — إطار عمل واجهة المستخدم
- **React Router v6** — التنقل بين الصفحات
- **Axios** — طلبات HTTP
- **React Hot Toast** — إشعارات جميلة
- **Cairo / Tajawal** — خطوط عربية (Google Fonts)

### Backend
- **Node.js + Express** — خادم API
- **MongoDB + Mongoose** — قاعدة البيانات
- **JWT** — المصادقة والتوثيق
- **Multer** — رفع الملفات
- **bcryptjs** — تشفير كلمات المرور

---

## 📞 للمساعدة

في حال واجهت أي مشكلة، تحقق من:
1. أن MongoDB يعمل (`mongod --version`)
2. أن ملف `.env` موجود ومعبأ صحيحاً
3. أن المنافذ 3000 و 5000 غير مستخدمة
4. تحقق من console الـ Backend لرسائل الخطأ

---

*© 2025 بلدية سيدي علي — جميع الحقوق محفوظة*
