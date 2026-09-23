import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import axios from 'axios';

const API_BASE_URL =
  Platform.OS === 'android' ? 'http://10.0.2.2:5000' : 'http://localhost:5000';
const DEFAULT_USER_ID = 'demo-user-2';

const formatDate = (value) => {
  if (!value) return 'TBD';
  const date = new Date(value);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
};

const formatCountdown = (value) => {
  const target = new Date(value).getTime();
  const diff = target - Date.now();

  if (diff <= 0) return 'Ended';

  const totalMinutes = Math.max(0, Math.floor(diff / 60000));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m left`;
  if (hours > 0) return `${hours}h ${minutes}m left`;
  return `${minutes}m left`;
};

const getStatusStyle = (status) => {
  if (status === 'full') return { backgroundColor: '#fee2e2', color: '#b91c1c' };
  if (status === 'closed' || status === 'ended') return { backgroundColor: '#e5e7eb', color: '#374151' };
  if (status === 'upcoming') return { backgroundColor: '#dbeafe', color: '#1d4ed8' };
  return { backgroundColor: '#dcfce7', color: '#166534' };
};

export default function App() {
  const [competition, setCompetition] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [toast, setToast] = useState({ visible: false, title: '', message: '', type: 'success' });

  const fetchCompetition = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/competitions/ai-bootcamp-2026`, {
        params: { userId: DEFAULT_USER_ID },
      });
      setCompetition(response.data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Could not load competition details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompetition();
  }, []);

  const actionLabel = useMemo(() => {
    if (!competition) return 'Register Now';
    if (competition.isUserRegistered) return 'Registered';
    if (competition.status === 'full') return 'Waitlist Full';
    if (competition.status === 'closed') return 'Registrations Closed';
    if (competition.status === 'ended') return 'Competition Ended';
    if (competition.status === 'upcoming') return 'Opening Soon';
    return 'Register Now';
  }, [competition]);

  const isActionDisabled =
    !competition ||
    submitting ||
    competition.status === 'full' ||
    competition.status === 'closed' ||
    competition.status === 'ended' ||
    competition.status === 'upcoming';

  const handleRegister = async () => {
    if (!competition || isActionDisabled) return;

    try {
      setSubmitting(true);
      await axios.post(`${API_BASE_URL}/api/competitions/${competition.slug}/register`, {
        userId: DEFAULT_USER_ID,
      });
      await fetchCompetition();
      showToast('Success', 'You have successfully registered for this competition.', 'success');
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || 'Unable to register right now.';
      showToast('Registration failed', message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!competition || !competition.isUserRegistered) return;

    try {
      setSubmitting(true);
      await axios.delete(`${API_BASE_URL}/api/competitions/${competition.slug}/register`, {
        data: { userId: DEFAULT_USER_ID },
      });
      await fetchCompetition();
      showToast('Cancelled', 'Your registration has been removed.', 'info');
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.message || 'Unable to cancel registration.';
      showToast('Cancellation failed', message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const showToast = (title, message, type = 'success') => {
    setToast({ visible: true, title, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, visible: false }));
    }, 2200);
  };

  const handleBack = () => {
    showToast('Back', 'This would normally return to the previous screen.', 'info');
  };

  const handleToggleFavorite = () => {
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    showToast(
      nextFavorite ? 'Added to favorites' : 'Removed from favorites',
      nextFavorite ? 'This competition is now in your favorites.' : 'This competition was removed from favorites.',
      nextFavorite ? 'success' : 'info'
    );
  };

  if (loading || !competition) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading competition details...</Text>
      </View>
    );
  }

  const statusColor = getStatusStyle(competition.status);

  const previousWinners = [
    {
      name: 'Aarav Mehta',
      achievement: '1st Prize • 2025',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Priya Nair',
      achievement: '2nd Prize • 2024',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    },
    {
      name: 'Daniel Kim',
      achievement: '3rd Prize • 2023',
      image:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    },
  ];

  const importantDates = [
    { label: 'Registration deadline', value: formatDate(competition.registrationDeadline) },
    { label: 'Competition start', value: formatDate(competition.startAt) },
    { label: 'Award ceremony', value: formatDate(new Date(new Date(competition.endAt).getTime() + 2 * 24 * 60 * 60 * 1000)) },
  ];

  const rewards = [
    { label: '1st Prize', value: '$5,000' },
    { label: '2nd Prize', value: '$3,000' },
    { label: '3rd Prize', value: '$1,500' },
  ];

  const detailPoints = [
    'Hands-on AI product workshops with mentor-led sessions.',
    'Real-world challenge labs with practical evaluation criteria.',
    'Final showcase, networking, and hiring opportunities for top talent.',
  ];

  const judge = {
    name: 'Dr. Aisha Verma',
    role: 'AI Research Lead',
    experience: 'ML & Product Strategy • 10+ Years',
    image:
      'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    focus: 'Generative AI • Prompt Engineering • Responsible AI',
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      {toast.visible && (
        <View
          style={[
            styles.toastContainer,
            toast.type === 'success' && styles.toastSuccess,
            toast.type === 'error' && styles.toastError,
            toast.type === 'info' && styles.toastInfo,
          ]}
        >
          <Text style={styles.toastTitle}>{toast.title}</Text>
          <Text style={styles.toastMessage}>{toast.message}</Text>
        </View>
      )}
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Pressable style={styles.iconButton} onPress={handleBack}>
            <Text style={styles.iconText}>←</Text>
          </Pressable>
          <Pressable style={styles.iconButtonSecondary} onPress={handleToggleFavorite}>
            <Text style={[styles.iconText, isFavorite && styles.favoriteIcon]}>{isFavorite ? '♥' : '♡'}</Text>
          </Pressable>
        </View>

        <View style={styles.heroWrap}>
          <Image source={{ uri: competition.imageUrl }} style={styles.heroImage} resizeMode="cover" />
          <View style={styles.heroOverlay} />
          <View style={styles.heroMeta}>
            <Text style={styles.prizeTag}>{competition.prizePool}</Text>
            <Text style={[styles.statusBadge, { backgroundColor: statusColor.backgroundColor }]}>
              <Text style={{ color: statusColor.color }}>{competition.statusLabel}</Text>
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.badgeRow}>
            <Text style={styles.pill}>{competition.category}</Text>
            <Text style={styles.pill}>{competition.mode}</Text>
          </View>

          <Text style={styles.title}>{competition.title}</Text>
          <Text style={styles.subtitle}>{competition.description}</Text>

          <View style={styles.statsRow}>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Available</Text>
              <Text style={styles.metricValue}>{competition.remainingSeats}</Text>
              <Text style={styles.metricHint}>spots left</Text>
            </View>
            <View style={styles.metricCard}>
              <Text style={styles.metricLabel}>Deadline</Text>
              <Text style={styles.metricValueSmall}>{formatCountdown(competition.registrationDeadline)}</Text>
              <Text style={styles.metricHint}>{formatDate(competition.registrationDeadline)}</Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Event start</Text>
              <Text style={styles.infoValue}>{formatDate(competition.startAt)}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Competition venue</Text>
              <Text style={styles.infoValue}>{competition.venue}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Registered</Text>
              <Text style={styles.infoValue}>{competition.registeredCount} / {competition.maxParticipants}</Text>
            </View>
          </View>

          <View style={styles.judgeCard}>
            <View style={styles.judgeAvatarWrap}>
              <Image source={{ uri: judge.image }} style={styles.judgeImage} />
              <View style={styles.techPill}>
                <Text style={styles.techPillText}>AI</Text>
              </View>
            </View>
            <View style={styles.judgeInfo}>
              <Text style={styles.judgeLabel}>Judging panel</Text>
              <Text style={styles.judgeName}>{judge.name}</Text>
              <Text style={styles.judgeRole}>{judge.role}</Text>
              <Text style={styles.judgeExperience}>{judge.experience}</Text>
              <Text style={styles.judgeFocus}>{judge.focus}</Text>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>How prize money is received</Text>
            <View style={styles.inlineFeatureRow}>
              <View style={styles.featureIconWrapGreen}>
                <Text style={styles.featureIcon}>▶</Text>
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>How will you receive prize money?</Text>
                <Text style={styles.featureSubtitle}>Watch video to know more</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Refer & earn</Text>
            <View style={styles.inlineFeatureRow}>
              <View style={styles.featureIconWrapGreen}>
                <Text style={styles.featureIcon}>↗</Text>
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Refer code: FEEDANTS13</Text>
                <Text style={styles.featureSubtitle}>Earn ₹10 for every signup</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Support</Text>
            <View style={styles.inlineFeatureRow}>
              <View style={styles.featureIconWrapTeal}>
                <Text style={styles.featureIcon}>✉</Text>
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>Contact us</Text>
                <Text style={styles.featureSubtitle}>support@feedants.com</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Spot availability</Text>
            <View style={styles.inlineFeatureRow}>
              <View style={styles.featureIconWrapTeal}>
                <Text style={styles.featureIcon}>⌁</Text>
              </View>
              <View style={styles.featureTextWrap}>
                <Text style={styles.featureTitle}>{competition.remainingSeats} spots left</Text>
                <Text style={styles.featureSubtitle}>{competition.registeredCount} registered so far</Text>
              </View>
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Previous winners</Text>
            {previousWinners.map((winner) => (
              <View key={winner.name} style={styles.listRow}>
                <Image source={{ uri: winner.image }} style={styles.avatar} />
                <View style={styles.listTextWrap}>
                  <Text style={styles.listTitle}>{winner.name}</Text>
                  <Text style={styles.listValue}>{winner.achievement}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Important dates</Text>
            {importantDates.map((item) => (
              <View key={item.label} style={styles.dateRow}>
                <Text style={styles.listTitle}>{item.label}</Text>
                <Text style={styles.listValue}>{item.value}</Text>
              </View>
            ))}
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Rewards</Text>
            <View style={styles.rewardGrid}>
              {rewards.map((reward) => (
                <View key={reward.label} style={styles.rewardItem}>
                  <Text style={styles.rewardLabel}>{reward.label}</Text>
                  <Text style={styles.rewardValue}>{reward.value}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Details</Text>
            {detailPoints.map((point) => (
              <View key={point} style={styles.detailRow}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.detailText}>{point}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Registration</Text>
            <View style={styles.rowBetween}>
              <Text style={styles.metaText}>Status</Text>
              <Text style={styles.metaValue}>{competition.statusLabel}</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.metaText}>Seats remaining</Text>
              <Text style={styles.metaValue}>{competition.remainingSeats}</Text>
            </View>
          </View>

          {competition.isUserRegistered ? (
            <View style={styles.confirmationBox}>
              <View style={styles.checkCircle}>
                <Text style={styles.checkText}>✓</Text>
              </View>
              <Text style={styles.confirmationText}>You are registered</Text>
            </View>
          ) : (
            <Pressable
              onPress={handleRegister}
              disabled={isActionDisabled}
              style={({ pressed }) => [
                styles.primaryButton,
                pressed && styles.pressed,
                isActionDisabled && styles.disabledButton,
              ]}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.primaryButtonText}>{actionLabel}</Text>
              )}
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#edf4f4',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0f172a',
  },
  loadingText: {
    marginTop: 14,
    fontSize: 14,
    color: '#e2e8f0',
  },
  toastContainer: {
    position: 'absolute',
    top: 56,
    left: 20,
    right: 20,
    zIndex: 20,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  toastSuccess: {
    backgroundColor: 'rgba(22, 101, 52, 0.95)',
  },
  toastError: {
    backgroundColor: 'rgba(153, 27, 27, 0.95)',
  },
  toastInfo: {
    backgroundColor: 'rgba(15, 23, 42, 0.92)',
  },
  toastTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 4,
  },
  toastMessage: {
    color: '#f8fafc',
    fontSize: 12,
    lineHeight: 18,
  },
  container: {
    paddingBottom: 30,
  },
  header: {
    position: 'absolute',
    top: 14,
    left: 16,
    right: 16,
    zIndex: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconButtonSecondary: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  iconText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 22,
  },
  favoriteIcon: {
    color: '#f43f5e',
  },
  heroWrap: {
    position: 'relative',
    height: 280,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  heroMeta: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 28,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  prizeTag: {
    color: '#0f172a',
    fontWeight: '800',
    fontSize: 22,
    backgroundColor: '#f5fdfb',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 24,
    letterSpacing: 0.2,
    shadowColor: '#0f172a',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 999,
    overflow: 'hidden',
    marginBottom: 24,
  },
  content: {
    marginTop: -30,
    backgroundColor: '#f8fbfb',
    borderTopLeftRadius: 26,
    borderTopRightRadius: 26,
    paddingHorizontal: 18,
    paddingTop: 20,
    paddingBottom: 46,
    marginBottom: 18,
    shadowColor: '#0f172a',
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: -4 },
    elevation: 5,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  pill: {
    backgroundColor: '#edf4f4',
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '700',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    textAlign: 'center',
    lineHeight: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 13,
    lineHeight: 22,
    color: '#475569',
    marginBottom: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#f5faf9',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dfeceb',
    shadowColor: '#0f172a',
    shadowOpacity: 0.02,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  metricLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  metricValueSmall: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  metricHint: {
    color: '#64748b',
    fontSize: 11,
  },
  infoCard: {
    backgroundColor: '#f5faf9',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#dfeceb',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 13,
    color: '#64748b',
  },
  infoValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
    maxWidth: '60%',
    textAlign: 'right',
  },
  judgeCard: {
    backgroundColor: '#f0fdf8',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#baf3dd',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#10b981',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  judgeAvatarWrap: {
    position: 'relative',
    marginRight: 12,
  },
  judgeImage: {
    width: 58,
    height: 58,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  techPill: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    backgroundColor: '#0f172a',
    borderRadius: 999,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ecfdf5',
  },
  techPillText: {
    color: '#ecfdf5',
    fontSize: 9,
    fontWeight: '800',
  },
  judgeInfo: {
    flex: 1,
  },
  judgeLabel: {
    color: '#0f766e',
    fontSize: 10,
    fontWeight: '800',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  judgeName: {
    color: '#0f172a',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  judgeRole: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 2,
  },
  judgeExperience: {
    color: '#475569',
    fontSize: 12,
    marginBottom: 4,
  },
  judgeFocus: {
    color: '#0f766e',
    fontSize: 11,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: '#f5faf9',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#dfeceb',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: 12,
  },
  inlineFeatureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIconWrapGreen: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#d8f7ea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIconWrapTeal: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: '#dff7f5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  featureIcon: {
    color: '#0f766e',
    fontSize: 16,
    fontWeight: '800',
  },
  featureTextWrap: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 2,
  },
  featureSubtitle: {
    fontSize: 12,
    color: '#475569',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ede9fe',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#6d28d9',
    fontSize: 11,
    fontWeight: '800',
  },
  listTextWrap: {
    flex: 1,
  },
  listTitle: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
    marginBottom: 2,
  },
  listValue: {
    fontSize: 12,
    color: '#475569',
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  rewardGrid: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  rewardItem: {
    backgroundColor: '#f3e8ff',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 90,
    flex: 1,
  },
  rewardLabel: {
    color: '#6d28d9',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  rewardValue: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '800',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bullet: {
    color: '#7c3aed',
    fontSize: 18,
    marginRight: 8,
    lineHeight: 20,
  },
  detailText: {
    flex: 1,
    fontSize: 13,
    color: '#475569',
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#f8fafc',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 15,
    color: '#0f172a',
    fontWeight: '800',
    marginBottom: 10,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  metaText: {
    fontSize: 13,
    color: '#475569',
  },
  metaValue: {
    fontSize: 13,
    color: '#0f172a',
    fontWeight: '700',
  },
  confirmationBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eafaf3',
    borderColor: '#9fe4be',
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: '#22c55e',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 6 },
    elevation: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#22c55e',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  checkText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
    lineHeight: 14,
  },
  confirmationText: {
    color: '#166534',
    fontSize: 16,
    fontWeight: '800',
  },
  primaryButton: {
    backgroundColor: '#0f766e',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0f766e',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  disabledButton: {
    backgroundColor: '#c4b5fd',
    shadowOpacity: 0,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.92,
  },
});
