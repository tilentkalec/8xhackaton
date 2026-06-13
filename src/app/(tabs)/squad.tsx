import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { C, S, F } from '@/lib/theme';
import { DEMO } from '@/lib/constants';
import { usePotRealtime } from '@/hooks/usePotRealtime';
import { emojiFor, archetypeFor } from '@/lib/avatars';
import { gbp } from '@/lib/format';

export default function SquadScreen() {
  const insets = useSafeAreaInsets();
  const { members } = usePotRealtime(DEMO.POT_ID);

  // Rank by who's holding and how much they stand to win — never by income.
  const ranked = [...members].sort((a, b) => {
    if (a.status !== b.status) {
      const order = { active: 0, won: 1, broken: 2 } as Record<string, number>;
      return order[a.status] - order[b.status];
    }
    return b.stake_pence - a.stake_pence;
  });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.lg, paddingTop: insets.top + S.md }}>
      <Text style={styles.h1}>Squad</Text>
      <Text style={styles.sub}>Ranked by who's holding the line.</Text>

      {ranked.map((m, i) => {
        const broken = m.status === 'broken';
        return (
          <Animated.View key={m.id} layout={LinearTransition.springify().damping(18)} style={[styles.row, broken && styles.rowBroken]}>
            <Text style={styles.rank}>{i + 1}</Text>
            <Text style={styles.emoji}>{emojiFor(m.user.avatar_emoji)}</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{m.user.display_name}</Text>
              <Text style={styles.archetype}>{archetypeFor(m.user.archetype).label}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={[styles.stake, broken && styles.stakeBroken]}>{gbp(m.stake_pence)}</Text>
              <Text style={styles.status}>{broken ? 'broke' : m.status === 'won' ? 'won 🏆' : `🔥 ${m.current_streak}d`}</Text>
            </View>
          </Animated.View>
        );
      })}

      {members.length === 0 && <Text style={styles.empty}>No squad yet.</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  h1: { ...F.big, color: C.text },
  sub: { ...F.body, color: C.textMuted, marginTop: S.xs, marginBottom: S.xl },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, backgroundColor: C.card, borderRadius: S.radius, padding: S.lg, marginBottom: S.sm, borderWidth: 1, borderColor: C.border },
  rowBroken: { borderColor: C.danger, backgroundColor: C.dangerDim },
  rank: { ...F.title, color: C.textFaint, width: 22 },
  emoji: { fontSize: 30 },
  name: { ...F.label, color: C.text },
  archetype: { ...F.caption, color: C.textMuted, marginTop: 2 },
  stake: { ...F.title, color: C.accent },
  stakeBroken: { color: C.danger, textDecorationLine: 'line-through' },
  status: { ...F.caption, color: C.textMuted, marginTop: 2 },
  empty: { ...F.body, color: C.textFaint },
});
