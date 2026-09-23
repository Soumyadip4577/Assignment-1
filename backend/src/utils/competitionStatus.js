function getCompetitionState(competition) {
  const now = new Date();

  if (now < new Date(competition.startAt)) {
    return 'upcoming';
  }

  if (now >= new Date(competition.endAt)) {
    return 'ended';
  }

  if (competition.registeredCount >= competition.maxParticipants) {
    return 'full';
  }

  if (now >= new Date(competition.registrationDeadline)) {
    return 'closed';
  }

  return 'open';
}

function getStatusLabel(state) {
  const labels = {
    upcoming: 'Upcoming',
    open: 'Open',
    full: 'Full',
    closed: 'Closed',
    ended: 'Ended',
  };

  return labels[state] || 'Open';
}

module.exports = { getCompetitionState, getStatusLabel };
