import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeIn } from 'react-native-reanimated';
import { C, S, F } from '@/lib/theme';
import { useSession } from '@/lib/session';
import { useCurrentPot } from '@/lib/currentPot';
import { joinByCode } from '@/lib/pots';

export default function Join() {
  const insets = useSafeAreaInsets();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { userId, name } = useSession();
  const { setPotId } = useCurrentPot();
  const [state, setState] = useState<'joining' | 'done' | 'notfound'>('joining');

  useEffect(() => {
    let alive = true;
    (async () => {
      const potId = await joinByCode(String(code ?? ''), { id: userId, name });
      if (!alive) return;
      if (potId) {
        setPotId(potId);
        setState('done');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      } else {
        setState('notfound');
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      <Animated.View entering={FadeIn} style={styles.wrap}>
        {state === 'joining' && (
          <>
            <Text style={styles.emoji}>🍯</Text>
            <Text style={styles.title}>Joining pot {String(code)}…</Text>
          </>
        )}
        {state === 'done' && (
          <>
            <Text style={styles.emoji}>✅</Text>
            <Text style={styles.title}>You're in</Text>
            <Text style={styles.sub}>Your stake is on the line. Hold the line, split the pot.</Text>
            <Pressable style={styles.cta} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.ctaText}>Go to pot →</Text>
            </Pressable>
          </>
        )}
        {state === 'notfound' && (
          <>
            <Text style={styles.emoji}>🤷</Text>
            <Text style={styles.title}>Code not found</Text>
            <Text style={styles.sub}>That invite code doesn't match a pot.</Text>
            <Pressable style={styles.cta} onPress={() => router.replace('/(tabs)')}>
              <Text style={styles.ctaText}>Back to app</Text>
            </Pressable>
          </>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  wrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.md, padding: S.xl },
  emoji: { fontSize: 72 },
  title: { ...F.big, color: C.text, textAlign: 'center' },
  sub: { ...F.body, color: C.textMuted, textAlign: 'center', paddingHorizontal: S.lg },
  cta: { backgroundColor: C.accent, borderRadius: S.radius, paddingVertical: S.lg, paddingHorizontal: S.xxl, alignItems: 'center', marginTop: S.lg },
  ctaText: { ...F.title, color: '#0B0B0F' },
});
