import { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn, FadeOut, FadeInDown, ZoomIn } from 'react-native-reanimated';
import { C, S, F } from '@/lib/theme';
import { useSession } from '@/lib/session';
import { supabase } from '@/lib/supabase';
import { ARCHETYPES, archetypeFor } from '@/lib/avatars';

type Key = 'traveller' | 'socialiser' | 'saver' | 'planner';
interface Choice {
  text: string;
  emoji: string;
  key: Key;
}
interface Card {
  q: string;
  a: Choice;
  b: Choice;
}

const CARDS: Card[] = [
  { q: 'Friday night, money to spend?', a: { text: 'Out with the crew', emoji: '🍻', key: 'socialiser' }, b: { text: 'Saving for something big', emoji: '🎯', key: 'saver' } },
  { q: 'Surprise £50 lands. You…', a: { text: 'Book an experience', emoji: '✈️', key: 'traveller' }, b: { text: 'Straight to savings', emoji: '🏦', key: 'saver' } },
  { q: 'Your budget weakness?', a: { text: 'Coffee & cafés', emoji: '☕️', key: 'traveller' }, b: { text: 'Rounds & nights out', emoji: '🎶', key: 'socialiser' } },
  { q: 'How do you budget?', a: { text: 'Every pound has a job', emoji: '📊', key: 'planner' }, b: { text: 'Vibes, mostly', emoji: '🌀', key: 'socialiser' } },
  { q: 'A real win looks like…', a: { text: 'A booked flight', emoji: '🛫', key: 'traveller' }, b: { text: 'A fat savings balance', emoji: '💰', key: 'planner' } },
];

const EMOJI_KEY: Record<Key, string> = { traveller: 'fox', socialiser: 'turtle', saver: 'owl', planner: 'rabbit' };

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { userId, name } = useSession();
  const [index, setIndex] = useState(0);
  const [tally, setTally] = useState<Record<Key, number>>({ traveller: 0, socialiser: 0, saver: 0, planner: 0 });
  const [resultKey, setResultKey] = useState<Key | null>(null);

  function pick(key: Key) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    const next = { ...tally, [key]: tally[key] + 1 };
    setTally(next);
    if (index + 1 < CARDS.length) {
      setIndex(index + 1);
    } else {
      const winner = (Object.keys(next) as Key[]).reduce((best, k) => (next[k] > next[best] ? k : best), 'traveller');
      setResultKey(winner);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      supabase.from('users').update({ archetype: winner, avatar_emoji: EMOJI_KEY[winner] }).eq('id', userId).then(() => {});
    }
  }

  if (resultKey) {
    const a = archetypeFor(resultKey);
    return (
      <View style={[styles.screen, { paddingTop: insets.top + S.xl }]}>
        <View style={styles.revealWrap}>
          <Animated.Text entering={ZoomIn.duration(420)} style={styles.revealEmoji}>
            {a.emoji}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(150)} style={styles.revealKicker}>
            {name}, you're
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(280)} style={styles.revealName}>
            {a.label}
          </Animated.Text>
          <Animated.Text entering={FadeInDown.delay(420)} style={styles.revealBlurb}>
            {a.blurb}
          </Animated.Text>
        </View>
        <View style={{ padding: S.lg, paddingBottom: insets.bottom + S.lg }}>
          <Pressable style={styles.cta} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.ctaText}>Enter Pots →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const card = CARDS[index];
  return (
    <View style={[styles.screen, { paddingTop: insets.top + S.xl }]}>
      <View style={styles.progressRow}>
        {CARDS.map((_, i) => (
          <View key={i} style={[styles.dot, i <= index && styles.dotOn]} />
        ))}
      </View>
      <Text style={styles.kicker}>Find your money archetype</Text>

      <Animated.View key={index} entering={FadeIn.duration(260)} exiting={FadeOut.duration(120)} style={styles.qWrap}>
        <Text style={styles.q}>{card.q}</Text>
        <ChoiceButton choice={card.a} onPress={() => pick(card.a.key)} />
        <Text style={styles.or}>or</Text>
        <ChoiceButton choice={card.b} onPress={() => pick(card.b.key)} />
      </Animated.View>
    </View>
  );
}

function ChoiceButton({ choice, onPress }: { choice: Choice; onPress: () => void }) {
  return (
    <Pressable style={styles.choice} onPress={onPress}>
      <Text style={styles.choiceEmoji}>{choice.emoji}</Text>
      <Text style={styles.choiceText}>{choice.text}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, paddingHorizontal: S.lg },
  progressRow: { flexDirection: 'row', gap: S.sm, marginBottom: S.xl },
  dot: { flex: 1, height: 4, borderRadius: 999, backgroundColor: C.cardHi },
  dotOn: { backgroundColor: C.accent },
  kicker: { ...F.label, color: C.accent, letterSpacing: 1, textTransform: 'uppercase', marginBottom: S.sm },
  qWrap: { flex: 1, justifyContent: 'center', paddingBottom: S.xxl },
  q: { ...F.big, color: C.text, marginBottom: S.xl },
  choice: { backgroundColor: C.card, borderRadius: S.radius, padding: S.lg, flexDirection: 'row', alignItems: 'center', gap: S.md, borderWidth: 1.5, borderColor: C.border },
  choiceEmoji: { fontSize: 30 },
  choiceText: { ...F.title, color: C.text, flex: 1 },
  or: { ...F.label, color: C.textFaint, textAlign: 'center', marginVertical: S.md },
  revealWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.sm },
  revealEmoji: { fontSize: 96 },
  revealKicker: { ...F.body, color: C.textMuted },
  revealName: { ...F.hero, color: C.accent, textAlign: 'center' },
  revealBlurb: { ...F.body, color: C.textMuted, textAlign: 'center', marginTop: S.md, paddingHorizontal: S.xl, lineHeight: 22 },
  cta: { backgroundColor: C.accent, borderRadius: S.radius, paddingVertical: S.lg, alignItems: 'center' },
  ctaText: { ...F.title, color: '#0B0B0F' },
});
