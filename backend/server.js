const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');

const app  = express();
const PORT = process.env.PORT || 5000;

global.JWT_SECRET = process.env.JWT_SECRET || 'lifelink_secret_2025';

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth',   require('./routes/authRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/admin',  require('./routes/adminRoutes'));

// Health
app.get('/', (req, res) => res.json({ status: 'ok', message: '🩸 LifeLink API running' }));

// MongoDB connect + seed
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/lifelink')
  .then(async () => {
    console.log('✅ MongoDB Connected');
    await require('./seedData')();
  })
  .catch(err => console.error('❌ MongoDB:', err.message));

app.listen(PORT, () => console.log(`🚀 Server → http://localhost:${PORT}`));
