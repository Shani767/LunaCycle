import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme';

export function Card({ children, style }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function SectionTitle({ children }) {
  return <Text style={s.sectionTitle}>{children}</Text>;
}

export function Chip({ label, selected, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.chip, selected && s.chipOn]}>
      <Text style={[s.chipText, selected && s.chipTextOn]}>{label}</Text>
    </Pressable>
  );
}

export function Button({ title, onPress, variant = 'primary' }) {
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <Pressable
      onPress={onPress}
      style={[s.button, isPrimary && s.buttonPrimary, isDanger && s.buttonDanger, variant === 'outline' && s.buttonOutline]}
    >
      <Text style={[s.buttonText, !isPrimary && !isDanger && { color: colors.primaryDark }, (isPrimary || isDanger) && { color: '#fff' }]}>
        {title}
      </Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: colors.text, marginBottom: 10 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#fff',
    marginRight: 8,
    marginBottom: 8,
  },
  chipOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { color: colors.text, fontSize: 14 },
  chipTextOn: { color: '#fff', fontWeight: '600' },
  button: { paddingVertical: 14, borderRadius: 14, alignItems: 'center', marginTop: 6 },
  buttonPrimary: { backgroundColor: colors.primary },
  buttonDanger: { backgroundColor: colors.danger },
  buttonOutline: { borderWidth: 1.5, borderColor: colors.primary, backgroundColor: 'transparent' },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
