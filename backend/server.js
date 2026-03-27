const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// ── CORS — open in dev, restrict in prod ────────────────────
app.use(cors({ origin: '*', methods: ['GET','POST','PUT','DELETE','OPTIONS'], allowedHeaders: ['Content-Type','Authorization'] }));
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ── Routes ────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'));
app.use('/api/news',          require('./routes/news'));
app.use('/api/gallery',       require('./routes/gallery'));
app.use('/api/announcements', require('./routes/announcements'));
app.use('/api/facebook',      require('./routes/facebook'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'بلدية سيدي علي API تعمل ✅' }));

app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({ success: false, message: err.message || 'خطأ في الخادم' });
});

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    console.log('✅ MongoDB متصل');
    await seedAdmin();
    app.listen(PORT, () => { console.log(`🚀 Server: http://localhost:${PORT}`); });
  })
  .catch(err => { console.error('❌ MongoDB Error:', err.message); process.exit(1); });

async function seedAdmin() {
  try {
    const User = require('./models/User');
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@sidialimairie.dz';
    const adminPass  = process.env.ADMIN_PASSWORD || 'Admin@123456';
    const existing = await User.findOne({ email: adminEmail });
    if (!existing) {
      const admin = new User({ name: 'مدير البلدية', email: adminEmail, password: adminPass, role: 'admin' });
      await admin.save();
      console.log('👤 Admin created:', adminEmail, '| Pass:', adminPass);
    } else {
      console.log('👤 Admin exists:', adminEmail);
    }
  } catch(e) { console.error('Seed error:', e.message); }
}

module.exports = app;
