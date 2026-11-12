import { useCallback, useState } from 'react';
import { View, Text, FlatList, TextInput, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { Card, Button, SectionTitle } from '../components/UI';
import { getPeriods, addPeriod, deletePeriod } from '../database/db';
import { periodDuration } from '../utils/cycle';
import { diffDays, formatDate, isValidISO, today } from '../utils/dates';

export default function HistoryScreen() {
  const [periods, setPeriods] = useState([]);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const load = useCallback(async () => {
    setPeriods(await getPeriods());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleAdd = async () => {
    if (!isValidISO(start)) return Alert.alert('Check the start date', 'Use the format YYYY-MM-DD, for example 2026-10-12.');
    if (start > today()) return Alert.alert('Check the start date', 'The start date cannot be in the future.');
    if (end && !isValidISO(end)) return Alert.alert('Check the end date', 'Use the format YYYY-MM-DD, or leave it empty.');
    if (end && end < start) return Alert.alert('Check the end date', 'The end date must be on or after the start date.');

    const added = await addPeriod(start, end || null);
    if (!added) return Alert.alert('Already saved', 'A period starting on this date already exists.');
    setStart('');
    setEnd('');
    load();
  };

  const confirmDelete = (p) => {
    Alert.alert('Delete this period?', `Starting ${formatDate(p.start_date)}`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePeriod(p.id);
          load();
        },
      },
    ]);
  };

  const header = (
    <Card>
      <SectionTitle>Add a past period</SectionTitle>
      <TextInput
        style={s.input}
        value={start}
        onChangeText={setStart}
        placeholder="Start date (YYYY-MM-DD)"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />
      <TextInput
        style={s.input}
        value={end}
        onChangeText={setEnd}
        placeholder="End date (optional)"
        placeholderTextColor={colors.muted}
        autoCapitalize="none"
        keyboardType="numbers-and-punctuation"
      />
      <Button title="Add period" onPress={handleAdd} />
    </Card>
  );

  return (
    <FlatList
      data={periods}
      keyExtractor={(p) => String(p.id)}
      contentContainerStyle={s.container}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={header}
      ListEmptyComponent={<Text style={s.empty}>No periods yet. Add one above or tap “Period started today” on Home.</Text>}
      renderItem={({ item, index }) => {
        const duration = periodDuration(item);
        const older = periods[index + 1];
        const cycle = older ? diffDays(older.start_date, item.start_date) : null;
        return (
          <Card>
            <Text style={s.range}>
              {formatDate(item.start_date)} – {item.end_date ? formatDate(item.end_date) : 'ongoing'}
            </Text>
            <Text style={s.meta}>
              {duration ? `${duration} days` : 'Duration not set'}
              {cycle ? `  •  Cycle length ${cycle} days` : ''}
            </Text>
            <Text style={s.delete} onPress={() => confirmDelete(item)}>
              Delete
            </Text>
          </Card>
        );
      }}
    />
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    color: colors.text,
  },
  range: { fontSize: 16, fontWeight: '700', color: colors.text },
  meta: { color: colors.muted, fontSize: 13, marginTop: 4 },
  delete: { color: colors.danger, fontWeight: '600', marginTop: 10, alignSelf: 'flex-start' },
  empty: { textAlign: 'center', color: colors.muted, marginTop: 10 },
});
