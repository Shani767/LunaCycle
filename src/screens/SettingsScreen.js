import { useCallback, useState } from 'react';
import { Text, ScrollView, TextInput, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { Card, Button, SectionTitle } from '../components/UI';
import { getSettings, saveSettings, clearAllData } from '../database/db';

export default function SettingsScreen() {
  const [cycleLength, setCycleLength] = useState('28');
  const [periodLength, setPeriodLength] = useState('5');

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const st = await getSettings();
        setCycleLength(String(st.cycleLength));
        setPeriodLength(String(st.periodLength));
      })();
    }, [])
  );

  const handleSave = async () => {
    const c = parseInt(cycleLength, 10);
    const p = parseInt(periodLength, 10);
    if (isNaN(c) || c < 21 || c > 45) return Alert.alert('Check cycle length', 'Enter a number between 21 and 45.');
    if (isNaN(p) || p < 2 || p > 10) return Alert.alert('Check period length', 'Enter a number between 2 and 10.');
    await saveSettings({ cycleLength: c, periodLength: p });
    Alert.alert('Saved', 'Your preferences are updated.');
  };

  const handleClear = () => {
    Alert.alert('Delete all data?', 'This removes all periods, logs and settings from this phone. It cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete everything',
        style: 'destructive',
        onPress: async () => {
          await clearAllData();
          setCycleLength('28');
          setPeriodLength('5');
          Alert.alert('Done', 'All data was deleted.');
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
      <Card>
        <SectionTitle>Cycle preferences</SectionTitle>
        <Text style={s.label}>Typical cycle length (days)</Text>
        <TextInput style={s.input} value={cycleLength} onChangeText={setCycleLength} keyboardType="number-pad" />
        <Text style={s.label}>Typical period length (days)</Text>
        <TextInput style={s.input} value={periodLength} onChangeText={setPeriodLength} keyboardType="number-pad" />
        <Text style={s.hint}>These values are used for predictions until you have logged at least 2 periods.</Text>
        <Button title="Save preferences" onPress={handleSave} />
      </Card>

      <Card>
        <SectionTitle>Your data</SectionTitle>
        <Text style={s.hint}>Everything is stored only on this phone. LunaCycle does not need an internet connection.</Text>
        <Button title="Delete all data" variant="danger" onPress={handleClear} />
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  label: { color: colors.text, fontSize: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    color: colors.text,
  },
  hint: { color: colors.muted, fontSize: 13, marginBottom: 10 },
});
