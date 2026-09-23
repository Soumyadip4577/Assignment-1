const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    venue: {
      type: String,
      required: true,
      trim: true,
    },
    mode: {
      type: String,
      enum: ['Online', 'Offline', 'Hybrid'],
      default: 'Online',
    },
    prizePool: {
      type: String,
      default: 'TBD',
    },
    seats: {
      type: Number,
      required: true,
      min: 1,
    },
    maxParticipants: {
      type: Number,
      required: true,
      min: 1,
    },
    registeredCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    startAt: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
      required: true,
    },
    endAt: {
      type: Date,
      required: true,
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/...',
    },
    statusNote: {
      type: String,
      default: 'Open for registration',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Competition', competitionSchema);
