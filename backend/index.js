const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { MongoMemoryServer } = require('mongodb-memory-server');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

async function connectDb() {
  if (MONGO_URI) {
    try {
      await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('Connected to MongoDB (MONGO_URI)');
      return;
    } catch (err) {
      console.error('Failed to connect using MONGO_URI:', err.message);
    }
  }

  console.log('Starting in-memory MongoDB for local development...');
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to in-memory MongoDB');
}

connectDb().catch(err => {
  console.error('Could not connect to database', err);
  process.exit(1);
});

// Models
const User = require('./models/User');
const Post = require('./models/Post');

// Auth middleware
const auth = require('./middleware/auth');

// Routes
app.get('/', (req, res) => res.json({ ok: true, message: 'Feedants API' }));

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Missing fields' });
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });
    const user = await User.create({ name, email, password });
    const token = user.generateAuthToken();
    res.json({ user: user.public(), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Missing fields' });
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });
    const token = user.generateAuthToken();
    res.json({ user: user.public(), token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Posts
app.get('/api/posts', async (req, res) => {
  const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'name email');
  res.json(posts.map(p => ({ id: p._id, title: p.title, body: p.body, author: p.author ? p.author.public ? p.author.public() : { name: p.author.name, email: p.author.email } : null, createdAt: p.createdAt })));
});

app.post('/api/posts', auth, async (req, res) => {
  try {
    const { title, body } = req.body;
    if (!title || !body) return res.status(400).json({ message: 'Missing title or body' });
    const post = await Post.create({ title, body, author: req.user._id });
    res.json(post);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
