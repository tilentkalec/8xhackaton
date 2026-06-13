import { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withSpring } from 'react-native-reanimated';

import { C, S, F } from '@/lib/theme';
import { DEMO } from '@/lib/constants';
import { gbp } from '@/lib/format';
import { useSession } from '@/lib/session';
import { useCurrentPot } from '@/lib/currentPot';
import { usePotRealtime } from '@/hooks/usePotRealtime';
import { recordTransaction, resolveWindowEnd, checkIn } from '@/lib/logic';
import { resetDemo } from '@/lib/demo';
import { MemberTile, Center } from '@/components/pots/MemberTile';
import { PayoutCoin } from '@/components/pots/PayoutCoin';
import { CountUp } from '@/components/pots/CountUp';
import { LiveFeed } from '@/components/pots/LiveFeed';
import type { MemberWithUser } from '@/lib/types';

interface Coin {
  key: string;
  from: Center;
  to: Center;
  delay: number;
}

export default function PotScreen() {
  const insets = useSafeAreaInsets();
  const { userId, name, emoji, toggle } = useSession();
  const { potId } = useCurrentPot();
  const { pot, members, events, loading } = usePotRealtime(potId);

  const positions = useRef<Record<string, Center>>({});
  const prevMembers = useRef<MemberWithUser[]>([]);
  const [coins, setCoins] = useState<Coin[]>([]);

  const onMeasure = useCallback((id: string, center: Center) => {
    positions.current[id] = center;
  }, []);

  // Detect a break → fly coins from the broken tile to each holder that gained.
  useEffect(() => {
    const prev = prevMembers.current;
    if (prev.length) {
      const broke = members.find(
        (m) => m.status === 'broken' && prev.find((p) => p.id === m.id)?.status === 'active',
      );
      if (broke) {
        const gainers = members.filter((m) => {
          const before = prev.find((p) => p.id === m.id);
          return before && m.stake_pence > before.stake_pence;
        });
        const fromC = positions.current[broke.user_id];
        if (fromC && gainers.length) {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
          const next: Coin[] = [];
          gainers.forEach((g, gi) => {
            const toC = positions.current[g.user_id];
            if (!toC) return;
            for (let i = 0; i < 3; i++) {
              next.push({ key: `${broke.id}-${g.id}-${i}-${Date.now()}`, from: fromC, to: toC, delay: gi * 120 + i * 90 });
            }
          });
          setCoins((c) => [...c, ...next]);
        }
      }
    }
    prevMembers.current = members;
  }, [members]);

  const removeCoin = useCallback((key: string) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    setCoins((c) => c.filter((x) => x.key !== key));
  }, []);

  // check-in button press animation
  const btnScale = useSharedValue(1);
  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: btnScale.value }] }));
  const me = members.find((m) => m.user_id === userId);

  async function onCheckIn() {
    btnScale.value = withSequence(withSpring(0.92), withSpring(1.06), withSpring(1));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    await checkIn(potId, userId, name).catch(() => {});
  }

  if (loading || !pot) {
    return (
      <View style={[styles.screen, styles.center]}>
        <Text style={styles.loading}>Loading pot…</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ padding: S.lg, paddingTop: insets.top + S.md, paddingBottom: S.xxl }}>
      {/* header */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.potName}>{pot.name}</Text>
          <Text style={styles.goal}>{pot.goal_label}</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              const url = Linking.createURL(`/join/${pot.invite_code}`);
              Share.share({ message: `Join my Pots bet: ${pot.invite_code}\n${url}` }).catch(() => {});
            }}
            style={styles.iconBtn}
            hitSlop={8}>
            <Text style={styles.iconGlyph}>🔗</Text>
          </Pressable>
          <Pressable onPress={() => router.push('/create')} style={styles.iconBtn} hitSlop={8}>
            <Text style={styles.iconGlyph}>＋</Text>
          </Pressable>
          <Pressable onPress={toggle} style={styles.youChip}>
            <Text style={styles.youEmoji}>{emoji === 'fox' ? '🦊' : '🐢'}</Text>
            <Text style={styles.youName}>{name}</Text>
          </Pressable>
        </View>
      </View>

      {/* pot total hero */}
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>POT ON THE LINE</Text>
        <CountUp value={pot.pot_total_pence} style={styles.heroNum} />
        <Text style={styles.heroSub}>
          {members.filter((m) => m.status === 'active').length} holding · {members.filter((m) => m.status === 'broken').length} broke
        </Text>
      </View>

      <Pressable style={styles.quizLink} onPress={() => router.push('/onboarding')}>
        <Text style={styles.quizLinkText}>✨ New here? Find your money archetype</Text>
      </Pressable>

      {/* member tiles + coin overlay */}
      <View style={styles.tilesArea}>
        <View style={styles.tiles}>
          {members.map((m) => (
            <MemberTile
              key={m.id}
              member={m}
              threshold={pot.threshold_pence}
              isYou={m.user_id === userId}
              onMeasure={onMeasure}
            />
          ))}
        </View>
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {coins.map((c) => (
            <PayoutCoin key={c.key} from={c.from} to={c.to} delay={c.delay} onArrive={() => removeCoin(c.key)} />
          ))}
        </View>
      </View>

      {/* check-in */}
      {me && me.status === 'active' && (
        <Animated.View style={btnStyle}>
          <Pressable style={styles.checkIn} onPress={onCheckIn}>
            <Text style={styles.checkInText}>Lock in today ✓</Text>
          </Pressable>
        </Animated.View>
      )}

      <LiveFeed events={events} />

      {/* dev row — drives the demo on stage */}
      <View style={styles.devRow}>
        <Text style={styles.devLabel}>DEV</Text>
        <View style={styles.devButtons}>
          <DevButton
            label="Add £30 cafe (Tom)"
            onPress={() => recordTransaction(DEMO.POT_ID, DEMO.USERS.TOM, 'Tom', 'Pret A Manger', 'cafe', 3000)}
          />
          <DevButton label="Force window end" onPress={() => resolveWindowEnd(DEMO.POT_ID)} />
          <DevButton label="Reset demo" onPress={() => resetDemo()} />
        </View>
      </View>
    </ScrollView>
  );
}

function DevButton({ label, onPress }: { label: string; onPress: () => Promise<any> | void }) {
  return (
    <Pressable style={styles.devBtn} onPress={() => Promise.resolve(onPress()).catch(() => {})}>
      <Text style={styles.devBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  center: { alignItems: 'center', justifyContent: 'center' },
  loading: { ...F.body, color: C.textMuted },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: S.md, marginBottom: S.xl },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: S.sm },
  iconBtn: { width: 38, height: 38, borderRadius: 999, backgroundColor: C.card, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: C.border },
  iconGlyph: { fontSize: 18, color: C.text },
  potName: { ...F.title, color: C.text },
  goal: { ...F.caption, color: C.textMuted, marginTop: 2 },
  quizLink: { alignItems: 'center', paddingVertical: S.sm, marginTop: -S.md, marginBottom: S.lg },
  quizLinkText: { ...F.caption, color: C.accent },
  youChip: {
    flexDirection: 'row', alignItems: 'center', gap: S.xs,
    backgroundColor: C.card, borderRadius: 999, paddingVertical: S.sm, paddingHorizontal: S.md,
    borderWidth: 1, borderColor: C.accent,
  },
  youEmoji: { fontSize: 18 },
  youName: { ...F.label, color: C.text },
  hero: {
    backgroundColor: C.card, borderRadius: S.radius, padding: S.xl, alignItems: 'center',
    marginBottom: S.xl, borderWidth: 1, borderColor: C.border,
  },
  heroLabel: { ...F.label, color: C.accent, letterSpacing: 1.5, marginBottom: S.sm },
  heroNum: { ...F.hero, color: C.text },
  heroSub: { ...F.caption, color: C.textMuted, marginTop: S.sm },
  tilesArea: { position: 'relative' },
  tiles: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: S.md, rowGap: S.md },
  checkIn: {
    backgroundColor: C.accent, borderRadius: S.radius, paddingVertical: S.lg, alignItems: 'center', marginTop: S.xl,
  },
  checkInText: { ...F.title, color: '#0B0B0F' },
  devRow: { marginTop: S.xxl, borderTopWidth: 1, borderTopColor: C.border, paddingTop: S.lg },
  devLabel: { ...F.caption, color: C.textFaint, letterSpacing: 2, marginBottom: S.sm },
  devButtons: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  devBtn: { backgroundColor: C.bgElevated, borderRadius: S.radiusSm, paddingVertical: S.sm, paddingHorizontal: S.md, borderWidth: 1, borderColor: C.border },
  devBtnText: { ...F.caption, color: C.textMuted },
});
