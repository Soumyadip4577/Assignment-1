const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const morgan = require('morgan');
const { connectDB } = require('./config/db');
const Competition = require('./models/Competition');
const Registration = require('./models/Registration');
const competitionRoutes = require('./routes/competitionRoutes');
const { ensureDefaultCompetitionData } = require('./data/defaultCompetitionData');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const seedDemoCompetitions = async () => {
  await ensureDefaultCompetitionData(Competition);
  console.log('Seeded demo competitions into the active database.');
};

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.json({ ok: true, message: 'Feedants API is running' });
});

app.use('/api/competitions', competitionRoutes);

connectDB()
  .then(async () => {
    await Registration.deleteMany({});
    await seedDemoCompetitions();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database', error);
    process.exit(1);
  });

module.exports = app;
