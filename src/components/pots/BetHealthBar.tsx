import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming, Easing } from 'react-native-reanimated';
import { C, S } from '@/lib/theme';

// Live bet-health bar: how much of the cap is used. Greens when safe,
// ambers near the cap, reds when broken.
export function BetHealthBar({
  spent,
  threshold,
  broken,
}: {
  spent: number;
  threshold: number;
  broken: boolean;
}) {
  const ratio = threshold > 0 ? Math.min(1, spent / threshold) : 0;
  const w = useSharedValue(ratio);

  useEffect(() => {
    w.value = withTiming(ratio, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [ratio, w]);

  const fillColor = broken ? C.danger : ratio > 0.85 ? C.warn : C.good;

  const style = useAnimatedStyle(() => ({
    width: `${w.value * 100}%`,
    backgroundColor: fillColor,
  }));

  return (
    <View style={styles.track}>
      <Animated.View style={[styles.fill, style]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 999,
    backgroundColor: C.cardHi,
    overflow: 'hidden',
    marginTop: S.sm,
  },
  fill: { height: '100%', borderRadius: 999 },
});
