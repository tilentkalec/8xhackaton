import { View, Text, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { C, S, F } from '@/lib/theme';
import { gbp } from '@/lib/format';
import type { PotEvent } from '@/lib/types';

function line(ev: PotEvent): { glyph: string; text: string } {
  const a = ev.actor_name ?? 'Someone';
  const p = ev.payload ?? {};
  switch (ev.kind) {
    case 'join':
      return { glyph: '👋', text: `${a} joined the pot` };
    case 'check_in':
      return { glyph: '✅', text: `${a} checked in — ${p.streak ?? 0} day streak` };
    case 'spend':
      return { glyph: '💳', text: `${a} spent ${gbp(p.amount ?? 0)} at ${p.merchant ?? 'somewhere'}` };
    case 'broke':
      return { glyph: '💥', text: `${a} broke the bet on ${p.category ?? 'spend'}` };
    case 'redistribute':
      return { glyph: '🪙', text: `${a} collected ${gbp(p.amount ?? 0)} from the broken stake` };
    case 'won':
      return { glyph: '🏆', text: `${a} held the line and won` };
    default:
      return { glyph: '•', text: `${a}` };
  }
}

export function LiveFeed({ events }: { events: PotEvent[] }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>Live feed</Text>
      {events.slice(0, 8).map((ev) => {
        const { glyph, text } = line(ev);
        return (
          <Animated.View key={ev.id} entering={FadeInDown.duration(280)} style={styles.row}>
            <Text style={styles.glyph}>{glyph}</Text>
            <Text style={styles.text}>{text}</Text>
          </Animated.View>
        );
      })}
      {events.length === 0 && <Text style={styles.empty}>No activity yet.</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: S.xl },
  heading: { ...F.label, color: C.textMuted, textTransform: 'uppercase', letterSpacing: 1, marginBottom: S.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: S.md, paddingVertical: S.sm },
  glyph: { fontSize: 18, width: 24, textAlign: 'center' },
  text: { ...F.body, color: C.text, flex: 1 },
  empty: { ...F.body, color: C.textFaint },
});
