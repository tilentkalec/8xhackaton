import { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { C, S, F } from '@/lib/theme';
import { useSession } from '@/lib/session';
import { useCurrentPot } from '@/lib/currentPot';
import { usePotRealtime } from '@/hooks/usePotRealtime';
import { archetypeFor, CATEGORY_LABEL } from '@/lib/avatars';
import { gbp } from '@/lib/format';

// Demo monthly take-home, in pence.
const INCOME = 160000;

function Bar({ ratio, color }: { ratio: number; color: string }) {
  const w = useSharedValue(0);
  useEffect(() => {
    w.value = withTiming(Math.min(1, ratio), { duration: 700, easing: Easing.out(Easing.cubic) });
  }, [ratio, w]);
  const style = useAnimatedStyle(() => ({ width: `${w.value * 100}%`, backgroundColor: color }));
  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

export default function BucketsScreen() {
  const insets = useSafeAreaInsets();
  const { userId } = useSession();
  const { potId } = useCurrentPot();
  const { pot, members } = usePotRealtime(potId);
  const me = members.find((m) => m.user_id === userId);
  const arche = archetypeFor(me?.user.archetype);

  const buckets = [
    { label: 'Needs', pct: 50, color: C.textMuted, spent: 62 },
    { label: 'Wants', pct: 30, color: C.warn, spent: 74 },
    { label: 'Savings', pct: 20, color: C.good, spent: 48 },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.lg, paddingTop: insets.top + S.md }}>
      <Text style={styles.h1}>Buckets</Text>
      <Text style={styles.sub}>Based on 50/30/20, tuned for {arche.label}.</Text>

      {buckets.map((b) => (
        <View key={b.label} style={styles.bucket}>
          <View style={styles.bucketHead}>
            <Text style={styles.bucketLabel}>
              {b.label} · {b.pct}%
            </Text>
            <Text style={styles.bucketAmt}>{gbp(Math.round((INCOME * b.pct) / 100))}</Text>
          </View>
          <Bar ratio={b.spent / 100} color={b.color} />
          <Text style={styles.bucketCaption}>{b.spent}% used this month</Text>
        </View>
      ))}

      {/* staked category — live bet status */}
      {pot && me && (
        <View style={styles.staked}>
          <Text style={styles.stakedTag}>💸 STAKED CATEGORY</Text>
          <Text style={styles.stakedTitle}>
            {CATEGORY_LABEL[pot.category] ?? pot.category} cap — {me.status === 'broken' ? 'bet broken' : 'bet alive'}
          </Text>
          <Bar ratio={me.spent_pence / pot.threshold_pence} color={me.status === 'broken' ? C.danger : me.spent_pence / pot.threshold_pence > 0.85 ? C.warn : C.accent} />
          <Text style={styles.stakedCaption}>
            {gbp(me.spent_pence)} of {gbp(pot.threshold_pence)} · {gbp(me.stake_pence)} stake at risk
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  h1: { ...F.big, color: C.text },
  sub: { ...F.body, color: C.textMuted, marginTop: S.xs, marginBottom: S.xl },
  bucket: { backgroundColor: C.card, borderRadius: S.radius, padding: S.lg, marginBottom: S.md, borderWidth: 1, borderColor: C.border },
  bucketHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bucketLabel: { ...F.label, color: C.text },
  bucketAmt: { ...F.title, color: C.text },
  track: { height: 10, borderRadius: 999, backgroundColor: C.cardHi, overflow: 'hidden', marginTop: S.md },
  fill: { height: '100%', borderRadius: 999 },
  bucketCaption: { ...F.caption, color: C.textMuted, marginTop: S.sm },
  staked: { backgroundColor: C.card, borderRadius: S.radius, padding: S.lg, marginTop: S.md, borderWidth: 1.5, borderColor: C.accent },
  stakedTag: { ...F.caption, color: C.accent, letterSpacing: 1.5 },
  stakedTitle: { ...F.title, color: C.text, marginTop: S.xs },
  stakedCaption: { ...F.caption, color: C.textMuted, marginTop: S.sm },
});
