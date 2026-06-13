import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { C, S, F } from '@/lib/theme';
import { DEMO } from '@/lib/constants';
import { useSession } from '@/lib/session';
import { usePotRealtime } from '@/hooks/usePotRealtime';
import { gbp } from '@/lib/format';
import { CATEGORY_LABEL } from '@/lib/avatars';

interface Card {
  tone: 'risk' | 'win' | 'info';
  title: string;
  body: string;
}

export default function CoachScreen() {
  const insets = useSafeAreaInsets();
  const { userId, name } = useSession();
  const { pot, members } = usePotRealtime(DEMO.POT_ID);
  const me = members.find((m) => m.user_id === userId);

  const cards: Card[] = [];
  if (pot && me) {
    const cat = CATEGORY_LABEL[pot.category] ?? pot.category;
    const ratio = me.spent_pence / pot.threshold_pence;
    if (me.status === 'broken') {
      const over = me.spent_pence - pot.threshold_pence;
      cards.push({
        tone: 'risk',
        title: 'You went over',
        body: `You crossed your ${cat} cap by ${gbp(over)} — that second Pret run did it. Your ${gbp(500)} stake went to the holders.`,
      });
    } else if (ratio >= 0.8) {
      cards.push({
        tone: 'risk',
        title: 'Stake at risk',
        body: `You're at ${Math.round(ratio * 100)}% of your ${cat} cap with ${gbp(pot.threshold_pence - me.spent_pence)} of headroom. One more coffee breaks the bet.`,
      });
    } else {
      cards.push({
        tone: 'win',
        title: "You're holding",
        body: `${gbp(pot.threshold_pence - me.spent_pence)} of room left on ${cat}. Hold the line and you split the pot.`,
      });
    }
    cards.push({
      tone: 'info',
      title: 'Projection',
      body: `At your current pace you'll finish the window around ${gbp(Math.round(me.spent_pence * 1.15))} — ${me.spent_pence * 1.15 > pot.threshold_pence ? 'over the cap, ease off' : 'under the cap, nice'}.`,
    });
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.lg, paddingTop: insets.top + S.md }}>
      <Text style={styles.h1}>Coach</Text>
      <Text style={styles.sub}>Proactive nudges, {name}. We watch the data so you don't have to.</Text>
      {cards.map((c, i) => (
        <Animated.View
          key={i}
          entering={FadeInDown.delay(i * 80)}
          style={[styles.card, c.tone === 'risk' && styles.cardRisk, c.tone === 'win' && styles.cardWin]}>
          <Text style={[styles.cardTitle, c.tone === 'risk' && { color: C.danger }, c.tone === 'win' && { color: C.good }]}>
            {c.tone === 'risk' ? '⚠️ ' : c.tone === 'win' ? '✅ ' : '📊 '}
            {c.title}
          </Text>
          <Text style={styles.cardBody}>{c.body}</Text>
        </Animated.View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  h1: { ...F.big, color: C.text },
  sub: { ...F.body, color: C.textMuted, marginTop: S.xs, marginBottom: S.xl },
  card: { backgroundColor: C.card, borderRadius: S.radius, padding: S.lg, marginBottom: S.md, borderWidth: 1, borderColor: C.border },
  cardRisk: { borderColor: C.danger, backgroundColor: C.dangerDim },
  cardWin: { borderColor: C.good },
  cardTitle: { ...F.title, color: C.text },
  cardBody: { ...F.body, color: C.textMuted, marginTop: S.sm, lineHeight: 22 },
});
