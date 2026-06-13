import { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ScrollView, Share } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { C, S, F } from '@/lib/theme';
import { useSession } from '@/lib/session';
import { useCurrentPot } from '@/lib/currentPot';
import { createPot } from '@/lib/pots';
import { CATEGORY_LABEL } from '@/lib/avatars';
import type { Comparator, SpendCategory } from '@/lib/types';

const CATEGORIES: SpendCategory[] = ['cafe', 'going_out', 'grocery', 'transport', 'savings'];
const COMPARATORS: { key: Comparator; label: string }[] = [
  { key: 'under', label: 'Stay under a cap' },
  { key: 'nospend', label: 'No-spend at all' },
];

export default function Create() {
  const insets = useSafeAreaInsets();
  const { userId, name } = useSession();
  const { setPotId } = useCurrentPot();

  const [potName, setPotName] = useState('Café Cap');
  const [category, setCategory] = useState<SpendCategory>('cafe');
  const [comparator, setComparator] = useState<Comparator>('under');
  const [capPounds, setCapPounds] = useState('100');
  const [stakePounds, setStakePounds] = useState('5');
  const [created, setCreated] = useState<{ code: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const catLabel = CATEGORY_LABEL[category] ?? category;
  const goalLabel =
    comparator === 'nospend'
      ? `No spend on ${catLabel} this month`
      : `Under £${capPounds || '0'} on ${catLabel} this month`;

  async function submit() {
    if (busy) return;
    setBusy(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    try {
      const { potId, inviteCode } = await createPot(
        {
          name: potName.trim() || 'New Pot',
          goalLabel,
          category,
          comparator,
          thresholdPence: Math.max(0, Math.round(parseFloat(capPounds || '0') * 100)),
          stakePence: Math.max(100, Math.round(parseFloat(stakePounds || '0') * 100)),
        },
        { id: userId, name },
      );
      setPotId(potId);
      setCreated({ code: inviteCode });
    } catch {
      setBusy(false);
    }
  }

  function shareInvite(code: string) {
    const url = Linking.createURL(`/join/${code}`);
    Share.share({ message: `Join my Pots bet: ${code}\n${url}` }).catch(() => {});
  }

  if (created) {
    const url = Linking.createURL(`/join/${created.code}`);
    return (
      <View style={[styles.screen, { paddingTop: insets.top + S.xl }]}>
        <Animated.View entering={FadeInDown} style={styles.doneWrap}>
          <Text style={styles.doneEmoji}>🍯</Text>
          <Text style={styles.doneTitle}>Pot created</Text>
          <Text style={styles.doneSub}>Share this code so your squad can stake in.</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code}>{created.code}</Text>
          </View>
          <Text style={styles.link} numberOfLines={1}>
            {url}
          </Text>
        </Animated.View>
        <View style={{ padding: S.lg, paddingBottom: insets.bottom + S.lg, gap: S.md }}>
          <Pressable style={styles.cta} onPress={() => shareInvite(created.code)}>
            <Text style={styles.ctaText}>Share invite</Text>
          </Pressable>
          <Pressable style={styles.ghost} onPress={() => router.replace('/(tabs)')}>
            <Text style={styles.ghostText}>Go to pot →</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={{ padding: S.lg, paddingTop: insets.top + S.md, paddingBottom: insets.bottom + S.xl }}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>✕</Text>
        </Pressable>
        <Text style={styles.h1}>New pot</Text>
      </View>

      <Text style={styles.label}>Name</Text>
      <TextInput style={styles.input} value={potName} onChangeText={setPotName} placeholder="Café Cap" placeholderTextColor={C.textFaint} />

      <Text style={styles.label}>Category you're betting on</Text>
      <View style={styles.chips}>
        {CATEGORIES.map((c) => (
          <Pressable key={c} onPress={() => setCategory(c)} style={[styles.chip, category === c && styles.chipOn]}>
            <Text style={[styles.chipText, category === c && styles.chipTextOn]}>{CATEGORY_LABEL[c]}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>The rule</Text>
      <View style={styles.chips}>
        {COMPARATORS.map((c) => (
          <Pressable key={c.key} onPress={() => setComparator(c.key)} style={[styles.chip, comparator === c.key && styles.chipOn]}>
            <Text style={[styles.chipText, comparator === c.key && styles.chipTextOn]}>{c.label}</Text>
          </Pressable>
        ))}
      </View>

      {comparator === 'under' && (
        <>
          <Text style={styles.label}>Monthly cap (£)</Text>
          <TextInput style={styles.input} value={capPounds} onChangeText={setCapPounds} keyboardType="number-pad" placeholderTextColor={C.textFaint} />
        </>
      )}

      <Text style={styles.label}>Your stake (£)</Text>
      <TextInput style={styles.input} value={stakePounds} onChangeText={setStakePounds} keyboardType="number-pad" placeholderTextColor={C.textFaint} />

      <View style={styles.preview}>
        <Text style={styles.previewLabel}>YOUR BET</Text>
        <Text style={styles.previewText}>{goalLabel}</Text>
        <Text style={styles.previewStake}>£{stakePounds || '0'} on the line</Text>
      </View>

      <Pressable style={[styles.cta, busy && { opacity: 0.6 }]} onPress={submit}>
        <Text style={styles.ctaText}>{busy ? 'Creating…' : 'Create pot'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  header: { flexDirection: 'row', alignItems: 'center', gap: S.lg, marginBottom: S.xl },
  back: { fontSize: 24, color: C.textMuted },
  h1: { ...F.big, color: C.text },
  label: { ...F.label, color: C.textMuted, marginTop: S.lg, marginBottom: S.sm },
  input: { backgroundColor: C.card, borderRadius: S.radiusSm, padding: S.lg, color: C.text, ...F.title, borderWidth: 1, borderColor: C.border },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: S.sm },
  chip: { backgroundColor: C.card, borderRadius: 999, paddingVertical: S.sm, paddingHorizontal: S.lg, borderWidth: 1, borderColor: C.border },
  chipOn: { backgroundColor: C.accentDim, borderColor: C.accent },
  chipText: { ...F.label, color: C.textMuted },
  chipTextOn: { color: C.accent },
  preview: { backgroundColor: C.card, borderRadius: S.radius, padding: S.lg, marginTop: S.xl, borderWidth: 1.5, borderColor: C.accent },
  previewLabel: { ...F.caption, color: C.accent, letterSpacing: 1.5 },
  previewText: { ...F.title, color: C.text, marginTop: S.xs },
  previewStake: { ...F.body, color: C.textMuted, marginTop: S.xs },
  cta: { backgroundColor: C.accent, borderRadius: S.radius, paddingVertical: S.lg, alignItems: 'center', marginTop: S.xl },
  ctaText: { ...F.title, color: '#0B0B0F' },
  ghost: { borderRadius: S.radius, paddingVertical: S.lg, alignItems: 'center', borderWidth: 1, borderColor: C.border },
  ghostText: { ...F.title, color: C.text },
  doneWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: S.sm, paddingHorizontal: S.lg },
  doneEmoji: { fontSize: 72 },
  doneTitle: { ...F.big, color: C.text },
  doneSub: { ...F.body, color: C.textMuted, textAlign: 'center' },
  codeBox: { backgroundColor: C.card, borderRadius: S.radius, paddingVertical: S.lg, paddingHorizontal: S.xxl, marginTop: S.lg, borderWidth: 1.5, borderColor: C.accent },
  code: { ...F.hero, color: C.accent, letterSpacing: 6 },
  link: { ...F.caption, color: C.textFaint, marginTop: S.md },
});
