import { View, Text, StyleSheet, LayoutChangeEvent } from 'react-native';
import Animated, { LinearTransition } from 'react-native-reanimated';
import { C, S, F } from '@/lib/theme';
import { emojiFor } from '@/lib/avatars';
import type { MemberWithUser } from '@/lib/types';
import { CountUp } from './CountUp';
import { BetHealthBar } from './BetHealthBar';

export interface Center {
  x: number;
  y: number;
}

export function MemberTile({
  member,
  threshold,
  isYou,
  onMeasure,
}: {
  member: MemberWithUser;
  threshold: number;
  isYou: boolean;
  onMeasure: (id: string, center: Center) => void;
}) {
  const broken = member.status === 'broken';
  const won = member.status === 'won';

  function handleLayout(e: LayoutChangeEvent) {
    const { x, y, width, height } = e.nativeEvent.layout;
    onMeasure(member.user_id, { x: x + width / 2, y: y + height / 2 });
  }

  return (
    <Animated.View
      layout={LinearTransition.springify().damping(18)}
      onLayout={handleLayout}
      style={[
        styles.tile,
        isYou && styles.tileYou,
        broken && styles.tileBroken,
        won && styles.tileWon,
      ]}>
      <View style={styles.head}>
        <Text style={styles.emoji}>{emojiFor(member.user.avatar_emoji)}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.name} numberOfLines={1}>
            {member.user.display_name}
            {isYou ? '  (you)' : ''}
          </Text>
          <Text style={styles.streak}>
            {broken ? 'broke the bet' : won ? 'won 🎉' : `🔥 ${member.current_streak} day streak`}
          </Text>
        </View>
      </View>

      <CountUp value={member.stake_pence} style={[styles.stake, broken && styles.stakeBroken]} />
      <Text style={styles.stakeLabel}>{broken ? 'lost' : 'stake'}</Text>

      <BetHealthBar spent={member.spent_pence} threshold={threshold} broken={broken} />
      <Text style={styles.capText}>
        £{(member.spent_pence / 100).toFixed(0)} of £{(threshold / 100).toFixed(0)} cap
      </Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '48%',
    backgroundColor: C.card,
    borderRadius: S.radius,
    padding: S.lg,
    borderWidth: 1.5,
    borderColor: C.border,
  },
  tileYou: { borderColor: C.accent },
  tileBroken: { borderColor: C.danger, backgroundColor: C.dangerDim },
  tileWon: { borderColor: C.good },
  head: { flexDirection: 'row', alignItems: 'center', gap: S.sm, marginBottom: S.md },
  emoji: { fontSize: 30 },
  name: { ...F.label, color: C.text },
  streak: { ...F.caption, color: C.textMuted, marginTop: 2 },
  stake: { ...F.big, color: C.text },
  stakeBroken: { color: C.danger, textDecorationLine: 'line-through' },
  stakeLabel: { ...F.caption, color: C.textFaint, textTransform: 'uppercase', letterSpacing: 1 },
  capText: { ...F.caption, color: C.textMuted, marginTop: S.xs },
});
