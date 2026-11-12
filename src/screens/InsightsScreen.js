import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { Card, SectionTitle } from '../components/UI';
import { getPeriods, getSettings, getAllLogs } from '../database/db';
import { getStats } from '../utils/cycle';

export default function InsightsScreen() {
  const [periods, setPeriods] = useState([]);
  const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5 });
  const [logs, setLogs] = useState([]);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setPeriods(await getPeriods());
        setSettings(await getSettings());
        setLogs(await getAllLogs());
      })();
    }, [])
  );

  const stats = getStats(periods, settings);
  const recent = stats.cycleLengths.slice(-6);
  const maxLen = Math.max(...recent, 1);

  // count how often each symptom was logged
  const counts = {};
  logs.forEach((l) => {
    (l.symptoms ? l.symptoms.split(',') : []).forEach((sy) => {
      counts[sy] = (counts[sy] || 0) + 1;
    });
  });
  const topSymptoms = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.grid}>
        <Card style={s.half}>
          <Text style={s.value}>{stats.avgCycle}</Text>
          <Text style={s.label}>Average cycle (days)</Text>
        </Card>
        <Card style={s.half}>
          <Text style={s.value}>{stats.avgPeriod}</Text>
          <Text style={s.label}>Average period (days)</Text>
        </Card>
        <Card style={s.half}>
          <Text style={s.value}>{periods.length}</Text>
          <Text style={s.label}>Periods logged</Text>
        </Card>
        <Card style={s.half}>
          <Text style={s.value}>{stats.hasCycleData ? `${stats.shortest}–${stats.longest}` : '–'}</Text>
          <Text style={s.label}>Shortest–longest cycle</Text>
        </Card>
      </View>

      {!stats.hasCycleData && (
        <Text style={s.hint}>
          Log at least 2 periods to see your real average. Until then, the values from Settings are used.
        </Text>
      )}

      <Card>
        <SectionTitle>Recent cycle lengths</SectionTitle>
        {recent.length === 0 ? (
          <Text style={s.label}>No cycles to show yet.</Text>
        ) : (
          <View style={s.bars}>
            {recent.map((len, i) => (
              <View key={i} style={s.barCol}>
                <Text style={s.barLabel}>{len}</Text>
                <View style={[s.bar, { height: Math.max(8, (len / maxLen) * 90) }]} />
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <SectionTitle>Most common symptoms</SectionTitle>
        {topSymptoms.length === 0 ? (
          <Text style={s.label}>Log symptoms in the Daily Log to see them here.</Text>
        ) : (
          topSymptoms.map(([name, n]) => (
            <View key={name} style={s.symRow}>
              <Text style={s.symName}>{name}</Text>
              <Text style={s.symCount}>
                {n} {n === 1 ? 'day' : 'days'}
              </Text>
            </View>
          ))
        )}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  half: { width: '48%', alignItems: 'center' },
  value: { fontSize: 28, fontWeight: '800', color: colors.primaryDark },
  label: { color: colors.muted, fontSize: 13, textAlign: 'center' },
  hint: { color: colors.muted, fontSize: 13, marginBottom: 14 },
  bars: { height: 125, flexDirection: 'row', alignItems: 'flex-end' },
  barCol: { flex: 1, alignItems: 'center', marginHorizontal: 4 },
  barLabel: { fontSize: 12, color: colors.text, marginBottom: 4 },
  bar: { width: '100%', backgroundColor: colors.primary, borderRadius: 8 },
  symRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  symName: { color: colors.text, fontSize: 15 },
  symCount: { color: colors.muted, fontSize: 14 },
});
