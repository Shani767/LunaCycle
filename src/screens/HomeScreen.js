import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { Card, Button } from '../components/UI';
import { getPeriods, getSettings, addPeriod, endPeriod } from '../database/db';
import { getStats, predictNextStart, getCycleDay } from '../utils/cycle';
import { today, diffDays, formatDate } from '../utils/dates';

export default function HomeScreen() {
  const [periods, setPeriods] = useState([]);
  const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5 });

  const load = useCallback(async () => {
    setPeriods(await getPeriods());
    setSettings(await getSettings());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const stats = getStats(periods, settings);
  const nextStart = predictNextStart(periods, stats.avgCycle);
  const cycleDay = getCycleDay(periods);
  const openPeriod = periods.length > 0 && !periods[0].end_date ? periods[0] : null;
  const daysToNext = nextStart ? diffDays(today(), nextStart) : null;

  let nextText = 'Log your first period to see predictions';
  if (daysToNext !== null) {
    if (daysToNext > 1) nextText = `Next period in ${daysToNext} days`;
    else if (daysToNext === 1) nextText = 'Next period tomorrow';
    else if (daysToNext === 0) nextText = 'Next period expected today';
    else nextText = `Period is ${-daysToNext} day${daysToNext === -1 ? '' : 's'} late`;
  }

  let ringSub = 'Tap the button below to start';
  if (openPeriod) ringSub = 'Period in progress';
  else if (cycleDay) ringSub = `Average cycle ${stats.avgCycle} days`;

  const handleStart = async () => {
    await addPeriod(today());
    load();
  };

  const handleEnd = async () => {
    await endPeriod(openPeriod.id, today());
    load();
  };

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.ringWrap}>
        <View style={s.ring}>
          <Text style={s.drop}>🩸</Text>
          <Text style={s.day}>{cycleDay ? `Day ${cycleDay}` : 'Welcome'}</Text>
          <Text style={s.ringSub}>{ringSub}</Text>
        </View>
      </View>

      <Card>
        <Text style={s.nextText}>{nextText}</Text>
        {nextStart && <Text style={s.muted}>Expected start: {formatDate(nextStart)}</Text>}
      </Card>

      {openPeriod ? (
        <Button title="Period ended today" onPress={handleEnd} variant="outline" />
      ) : (
        <Button title="Period started today" onPress={handleStart} />
      )}

      <Card style={{ marginTop: 20 }}>
        <View style={s.row}>
          <View style={s.stat}>
            <Text style={s.statValue}>{stats.avgCycle}</Text>
            <Text style={s.muted}>Avg cycle (days)</Text>
          </View>
          <View style={s.stat}>
            <Text style={s.statValue}>{stats.avgPeriod}</Text>
            <Text style={s.muted}>Avg period (days)</Text>
          </View>
        </View>
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  ringWrap: { alignItems: 'center', marginVertical: 16 },
  ring: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 12,
    borderColor: colors.primary,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  drop: { fontSize: 28 },
  day: { fontSize: 34, fontWeight: '800', color: colors.text },
  ringSub: { fontSize: 13, color: colors.muted, marginTop: 4, textAlign: 'center', paddingHorizontal: 20 },
  nextText: { fontSize: 18, fontWeight: '700', color: colors.text, marginBottom: 4 },
  muted: { color: colors.muted, fontSize: 13 },
  row: { flexDirection: 'row' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 28, fontWeight: '800', color: colors.primaryDark },
});
