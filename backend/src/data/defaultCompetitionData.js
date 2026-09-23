const defaultCompetitionData = [
  {
    slug: 'ai-bootcamp-2026',
    title: 'AI Bootcamp 2026',
    category: 'Tech',
    description:
      'Develop real-world AI products with hands-on workshops, mentor sessions, and challenge labs designed for ambitious builders.',
    venue: 'Virtual Lab',
    mode: 'Online',
    prizePool: '$10,000',
    seats: 80,
    maxParticipants: 80,
    registeredCount: 44,
    startAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    endAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    statusNote: 'Registration closes soon',
  },
  {
    slug: 'design-sprint-elite',
    title: 'Design Sprint Elite',
    category: 'Design',
    description:
      'A focused sprint for product designers pursuing prototyping, UX strategy, and rapid research cycles.',
    venue: 'Product Studio',
    mode: 'Hybrid',
    prizePool: '$5,500',
    seats: 30,
    maxParticipants: 30,
    registeredCount: 30,
    startAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() - 2 * 60 * 60 * 1000),
    endAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    imageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',
    statusNote: 'Waitlist is active',
  },
  {
    slug: 'build-for-impact',
    title: 'Build for Impact',
    category: 'Innovation',
    description:
      'Work in a fast-paced environment to solve meaningful problems with product thinking and engineering discipline.',
    venue: 'Innovation District',
    mode: 'Offline',
    prizePool: '$8,000',
    seats: 50,
    maxParticipants: 50,
    registeredCount: 17,
    startAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    registrationDeadline: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000),
    endAt: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000),
    imageUrl:
      'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
    statusNote: 'Open for registration',
  },
];

async function ensureDefaultCompetitionData(Competition) {
  const total = await Competition.countDocuments();

  if (total > 0) {
    return;
  }

  await Competition.insertMany(defaultCompetitionData);
}

module.exports = { defaultCompetitionData, ensureDefaultCompetitionData };
