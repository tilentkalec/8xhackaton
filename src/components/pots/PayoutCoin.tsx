import { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import type { Center } from './MemberTile';

// A single coin flying from the broken member's tile to a holder's tile.
export function PayoutCoin({
  from,
  to,
  delay = 0,
  onArrive,
}: {
  from: Center;
  to: Center;
  delay?: number;
  onArrive: () => void;
}) {
  const x = useSharedValue(from.x);
  const y = useSharedValue(from.y);
  const scale = useSharedValue(0.4);
  const opacity = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(delay, withTiming(1, { duration: 120 }));
    scale.value = withDelay(delay, withSequence(withTiming(1.2, { duration: 160 }), withTiming(1, { duration: 120 })));
    x.value = withDelay(delay, withTiming(to.x, { duration: 700, easing: Easing.out(Easing.exp) }));
    y.value = withDelay(
      delay,
      withTiming(to.y, { duration: 700, easing: Easing.out(Easing.exp) }, (finished) => {
        if (finished) runOnJS(onArrive)();
      }),
    );
    opacity.value = withDelay(delay + 720, withTiming(0, { duration: 180 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: x.value - 16 }, { translateY: y.value - 16 }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View pointerEvents="none" style={[styles.coin, style]}>
      <Text style={styles.glyph}>🪙</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  coin: { position: 'absolute', left: 0, top: 0, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  glyph: { fontSize: 26 },
});
