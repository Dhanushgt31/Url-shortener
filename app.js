// FULL URL SHORTENER PROJECT (INTERNSHIP READY)
// Stack: Node.js + Express + MongoDB + Mongoose
// Features: Short URL, Redirect, Click Count, Custom Alias

// ================= SETUP =================
// 1. npm init -y
// 2. npm install express mongoose nanoid cors
// 3. Create file: app.js
// 4. Run: node app.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nanoid = () => Math.random().toString(36).substring(2, 8);

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

// ================= DATABASE ==============node===
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB error:', err));

const urlSchema = new mongoose.Schema({
  longUrl: String,
  shortId: String,
  clicks: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
});

const URL = mongoose.model('URL', urlSchema);

// ================= ROUTES =================

// Home
// Serve the Frontend (index.html)
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

// Create Short URL
app.post('/shorten', async (req, res) => {
  try {
    const { longUrl, customAlias } = req.body;

    const shortId = customAlias || nanoid(6);

    const existing = await URL.findOne({ shortId });
    if (existing) {
      return res.status(400).json({ error: 'Alias already taken' });
    }

    const newUrl = new URL({ longUrl, shortId });
    await newUrl.save();

    res.json({
      shortUrl: `https://url-shortener-production-275b.up.railway.app/${shortId}`,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Redirect
app.get('/:id', async (req, res) => {
  try {
    const url = await URL.findOne({ shortId: req.params.id });

    if (!url) {
      return res.status(404).send('Not found');
    }

    url.clicks++;
    await url.save();

    res.redirect(url.longUrl);
  } catch (err) {
    res.status(500).send('Error');
  }
});

// Analytics (click count)
app.get('/analytics/:id', async (req, res) => {
  try {
    const url = await URL.findOne({ shortId: req.params.id });

    if (!url) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json({
      longUrl: url.longUrl,
      clicks: url.clicks,
      createdAt: url.createdAt,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error' });
  }
});

// ================= START SERVER =================
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// ================= BONUS (FOR INTERVIEW) =================
// You can mention:
// - Used REST API design
// - Implemented database with MongoDB
// - Added analytics tracking
// - Handled duplicate aliases
// - Scalable architecture

// ================= NEXT IMPROVEMENTS =================
// - Frontend (React)
// - Deploy on Render / Vercel
// - Add authentication
// - Add expiry for links
