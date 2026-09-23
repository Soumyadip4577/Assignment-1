const express = require('express');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const { getCompetitionState, getStatusLabel } = require('../utils/competitionStatus');

const router = express.Router();

router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId = 'demo-user' } = req.query;

    const competition = await Competition.findOne({ slug }).lean();

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    const state = getCompetitionState(competition);
    const registration = await Registration.findOne({
      competitionId: competition._id,
      userId,
      status: 'registered',
    }).lean();

    const response = {
      ...competition,
      status: state,
      statusLabel: getStatusLabel(state),
      remainingSeats: Math.max(competition.maxParticipants - competition.registeredCount, 0),
      isUserRegistered: Boolean(registration),
      userRegistrationId: registration ? registration._id : null,
      startAt: competition.startAt,
      registrationDeadline: competition.registrationDeadline,
      endAt: competition.endAt,
    };

    return res.json(response);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to load competition' });
  }
});

router.post('/:slug/register', async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId = 'demo-user' } = req.body;

    const competition = await Competition.findOne({ slug });

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    const state = getCompetitionState(competition);

    if (state === 'upcoming') {
      return res.status(400).json({ message: 'Registration opens later.' });
    }

    if (state === 'ended') {
      return res.status(400).json({ message: 'This competition has ended.' });
    }

    if (state === 'closed') {
      return res.status(400).json({ message: 'Registration deadline has passed.' });
    }

    if (state === 'full') {
      return res.status(400).json({ message: 'Competition is full.' });
    }

    const existing = await Registration.findOne({
      competitionId: competition._id,
      userId,
      status: 'registered',
    });

    if (existing) {
      return res.status(400).json({ message: 'You are already registered.' });
    }

    const currentCount = await Registration.countDocuments({
      competitionId: competition._id,
      status: 'registered',
    });

    if (currentCount >= competition.maxParticipants) {
      competition.registeredCount = currentCount;
      await competition.save();
      return res.status(400).json({ message: 'Competition is full.' });
    }

    const registration = await Registration.create({
      competitionId: competition._id,
      userId,
      status: 'registered',
    });

    competition.registeredCount = currentCount + 1;
    await competition.save();

    return res.status(201).json({
      message: 'Registration successful',
      registration,
      remainingSeats: Math.max(competition.maxParticipants - competition.registeredCount, 0),
    });
  } catch (error) {
    console.error(error);

    if (error.code === 11000) {
      return res.status(400).json({ message: 'You are already registered.' });
    }

    return res.status(500).json({ message: 'Failed to register for competition' });
  }
});

router.delete('/:slug/register', async (req, res) => {
  try {
    const { slug } = req.params;
    const { userId = 'demo-user' } = req.body;

    const competition = await Competition.findOne({ slug });

    if (!competition) {
      return res.status(404).json({ message: 'Competition not found' });
    }

    const registration = await Registration.findOne({
      competitionId: competition._id,
      userId,
      status: 'registered',
    });

    if (!registration) {
      return res.status(400).json({ message: 'You are not registered.' });
    }

    registration.status = 'cancelled';
    await registration.save();

    competition.registeredCount = Math.max((competition.registeredCount || 1) - 1, 0);
    await competition.save();

    return res.json({
      message: 'Registration cancelled',
      remainingSeats: Math.max(competition.maxParticipants - competition.registeredCount, 0),
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Failed to cancel registration' });
  }
});

module.exports = router;
