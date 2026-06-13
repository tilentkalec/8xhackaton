import { Tabs } from 'expo-router';
import { Text, ColorValue } from 'react-native';
import { C } from '@/lib/theme';

function Icon({ glyph, color }: { glyph: string; color: ColorValue }) {
  return <Text style={{ fontSize: 22, opacity: color === C.accent ? 1 : 0.55 }}>{glyph}</Text>;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: C.accent,
        tabBarInactiveTintColor: C.textFaint,
        tabBarStyle: {
          backgroundColor: C.bgElevated,
          borderTopColor: C.border,
          borderTopWidth: 1,
          height: 88,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}>
      <Tabs.Screen
        name="index"
        options={{ title: 'Pot', tabBarIcon: ({ color }) => <Icon glyph="🍯" color={color} /> }}
      />
      <Tabs.Screen
        name="buckets"
        options={{ title: 'Buckets', tabBarIcon: ({ color }) => <Icon glyph="🪣" color={color} /> }}
      />
      <Tabs.Screen
        name="coach"
        options={{ title: 'Coach', tabBarIcon: ({ color }) => <Icon glyph="🧠" color={color} /> }}
      />
      <Tabs.Screen
        name="squad"
        options={{ title: 'Squad', tabBarIcon: ({ color }) => <Icon glyph="👯" color={color} /> }}
      />
    </Tabs>
  );
}
