import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { colors } from '../theme';
import { Card, Chip, Button, SectionTitle } from '../components/UI';
import { getLog, saveLog, deleteLog } from '../database/db';
import { today, addDays, formatDate } from '../utils/dates';

const FLOWS = ['None', 'Light', 'Medium', 'Heavy'];
const MOODS = ['Calm', 'Happy', 'Anxious', 'Sad', 'Irritable', 'Sleepy'];
const SYMPTOMS = ['Cramps', 'Headache', 'Acne', 'Nausea', 'Cravings', 'Fatigue', 'Bloating', 'Back pain'];

const split = (str) => (str ? str.split(',') : []);

export default function DailyLogScreen({ route }) {
  const [date, setDate] = useState(today());
  const [flow, setFlow] = useState('None');
  const [moods, setMoods] = useState([]);
  const [symptoms, setSymptoms] = useState([]);
  const [note, setNote] = useState('');
  const [hasLog, setHasLog] = useState(false);

  // open a specific day when we arrive from the Calendar
  useEffect(() => {
    const p = route?.params?.date;
    if (p) setDate(p > today() ? today() : p);
  }, [route?.params?.date, route?.params?.ts]);

  // load the saved log whenever the date changes
  useEffect(() => {
    let active = true;
    (async () => {
      const log = await getLog(date);
      if (!active) return;
      setHasLog(!!log);
      setFlow(log?.flow || 'None');
      setMoods(split(log?.mood));
      setSymptoms(split(log?.symptoms));
      setNote(log?.note || '');
    })();
    return () => {
      active = false;
    };
  }, [date]);

  const toggle = (list, setList, item) =>
    setList(list.includes(item) ? list.filter((x) => x !== item) : [...list, item]);

  const shiftDay = (n) => {
    const next = addDays(date, n);
    if (next > today()) return;
    setDate(next);
  };

  const handleSave = async () => {
    await saveLog({
      date,
      flow,
      mood: moods.join(','),
      symptoms: symptoms.join(','),
      note: note.trim(),
    });
    setHasLog(true);
    Alert.alert('Saved', `Your log for ${formatDate(date)} is saved.`);
  };

  const handleDelete = () => {
    Alert.alert('Delete this log?', `Your log for ${formatDate(date)} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLog(date);
          setFlow('None');
          setMoods([]);
          setSymptoms([]);
          setNote('');
          setHasLog(false);
        },
      },
    ]);
  };

  const isToday = date === today();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">
        <View style={s.dateRow}>
          <Pressable onPress={() => shiftDay(-1)} hitSlop={12}>
            <Text style={s.arrow}>‹</Text>
          </Pressable>
          <Text style={s.dateText}>{isToday ? 'Today, ' : ''}{formatDate(date)}</Text>
          <Pressable onPress={() => shiftDay(1)} hitSlop={12}>
            <Text style={[s.arrow, isToday && { opacity: 0.25 }]}>›</Text>
          </Pressable>
        </View>

        <Card>
          <SectionTitle>Flow</SectionTitle>
          <View style={s.wrap}>
            {FLOWS.map((f) => (
              <Chip key={f} label={f} selected={flow === f} onPress={() => setFlow(f)} />
            ))}
          </View>
        </Card>

        <Card>
          <SectionTitle>How are you feeling?</SectionTitle>
          <View style={s.wrap}>
            {MOODS.map((m) => (
              <Chip key={m} label={m} selected={moods.includes(m)} onPress={() => toggle(moods, setMoods, m)} />
            ))}
          </View>
        </Card>

        <Card>
          <SectionTitle>Symptoms</SectionTitle>
          <View style={s.wrap}>
            {SYMPTOMS.map((sy) => (
              <Chip
                key={sy}
                label={sy}
                selected={symptoms.includes(sy)}
                onPress={() => toggle(symptoms, setSymptoms, sy)}
              />
            ))}
          </View>
        </Card>

        <Card>
          <SectionTitle>Note</SectionTitle>
          <TextInput
            style={s.input}
            value={note}
            onChangeText={setNote}
            placeholder="Anything else to remember?"
            placeholderTextColor={colors.muted}
            multiline
          />
        </Card>

        <Button title="Save log" onPress={handleSave} />
        {hasLog && <Button title="Delete log" variant="danger" onPress={handleDelete} />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  dateRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  dateText: { fontSize: 17, fontWeight: '700', color: colors.text },
  arrow: { fontSize: 30, color: colors.primaryDark, paddingHorizontal: 10 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap' },
  input: {
    minHeight: 80,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    color: colors.text,
    textAlignVertical: 'top',
  },
});