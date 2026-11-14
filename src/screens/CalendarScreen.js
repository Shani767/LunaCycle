import { useCallback, useState } from 'react';
import { View, Text, ScrollView, Pressable, Alert, StyleSheet } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme';
import { Card, Button } from '../components/UI';
import { getPeriods, getSettings, getAllLogs, deleteLog } from '../database/db';
import { getStats, predictNextStart } from '../utils/cycle';
import { today, addDays, pad, formatDate, MONTH_NAMES } from '../utils/dates';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function CalendarScreen({ navigation }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [periods, setPeriods] = useState([]);
  const [settings, setSettings] = useState({ cycleLength: 28, periodLength: 5 });
  const [logs, setLogs] = useState({});
  const [selected, setSelected] = useState(today());

  useFocusEffect(
    useCallback(() => {
      (async () => {
        setPeriods(await getPeriods());
        setSettings(await getSettings());
        const all = await getAllLogs();
        const map = {};
        all.forEach((l) => (map[l.date] = l));
        setLogs(map);
      })();
    }, [])
  );

  const stats = getStats(periods, settings);

  // days that belong to a logged period
  const periodDays = new Set();
  periods.forEach((p) => {
    let end = p.end_date;
    if (!end) {
      // Period not ended yet: keep marking days until the user taps "Period ended"
      const expectedEnd = addDays(p.start_date, stats.avgPeriod - 1);
      end = expectedEnd > today() ? expectedEnd : today();
    }
    for (let d = p.start_date; d <= end; d = addDays(d, 1)) periodDays.add(d);
  });

  // days of the predicted next period
  const predictedDays = new Set();
  const next = predictNextStart(periods, stats.avgCycle);
  if (next) {
    for (let i = 0; i < stats.avgPeriod; i++) predictedDays.add(addDays(next, i));
  }

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else setMonth(month - 1);
  };
  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else setMonth(month + 1);
  };

  // build the grid
  const firstWeekday = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(`${year}-${pad(month + 1)}-${pad(d)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const log = logs[selected];

  const handleDeleteLog = () => {
    Alert.alert('Delete this log?', `Your log for ${formatDate(selected)} will be removed.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteLog(selected);
          // remove it from the screen straight away
          setLogs((prev) => {
            const copy = { ...prev };
            delete copy[selected];
            return copy;
          });
        },
      },
    ]);
  };
  const selectedStatus = periodDays.has(selected)
    ? 'Period day'
    : predictedDays.has(selected)
    ? 'Predicted period'
    : 'No period';

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Card>
        <View style={s.monthRow}>
          <Pressable onPress={prevMonth} hitSlop={12}>
            <Text style={s.arrow}>‹</Text>
          </Pressable>
          <Text style={s.monthTitle}>
            {MONTH_NAMES[month]} {year}
          </Text>
          <Pressable onPress={nextMonth} hitSlop={12}>
            <Text style={s.arrow}>›</Text>
          </Pressable>
        </View>

        <View style={s.weekRow}>
          {WEEKDAYS.map((w, i) => (
            <Text key={i} style={s.weekday}>
              {w}
            </Text>
          ))}
        </View>

        {rows.map((row, r) => (
          <View key={r} style={s.weekRow}>
            {row.map((iso, c) => {
              if (!iso) return <View key={c} style={s.cell} />;
              const isPeriod = periodDays.has(iso);
              const isPredicted = !isPeriod && predictedDays.has(iso);
              return (
                <Pressable key={c} style={s.cell} onPress={() => setSelected(iso)}>
                  <View
                    style={[
                      s.dayCircle,
                      isPeriod && { backgroundColor: colors.primary },
                      isPredicted && { backgroundColor: colors.peach },
                      iso === today() && s.todayRing,
                      iso === selected && s.selectedRing,
                    ]}
                  >
                    <Text style={[s.dayText, isPeriod && { color: '#fff', fontWeight: '700' }]}>
                      {Number(iso.slice(8))}
                    </Text>
                  </View>
                  {logs[iso] ? <View style={s.dot} /> : <View style={s.dotSpace} />}
                </Pressable>
              );
            })}
          </View>
        ))}

        <View style={s.legend}>
          <View style={[s.legendBox, { backgroundColor: colors.primary }]} />
          <Text style={s.legendText}>Period</Text>
          <View style={[s.legendBox, { backgroundColor: colors.peach }]} />
          <Text style={s.legendText}>Predicted</Text>
          <View style={s.dot} />
          <Text style={s.legendText}>Logged</Text>
        </View>
      </Card>

      <Card>
        <Text style={s.selTitle}>{formatDate(selected)}</Text>
        <Text style={s.muted}>{selectedStatus}</Text>
        {log ? (
          <View style={{ marginTop: 10 }}>
            <Text style={s.line}>Flow: {log.flow || 'None'}</Text>
            {!!log.mood && <Text style={s.line}>Mood: {log.mood.split(',').join(', ')}</Text>}
            {!!log.symptoms && <Text style={s.line}>Symptoms: {log.symptoms.split(',').join(', ')}</Text>}
            {!!log.note && <Text style={s.line}>Note: {log.note}</Text>}
          </View>
        ) : (
          <Text style={[s.muted, { marginTop: 10 }]}>Nothing logged for this day.</Text>
        )}
        <Button
          title={log ? 'Edit log' : 'Add log'}
          variant="outline"
          onPress={() => navigation.navigate('Log', { date: selected, ts: Date.now() })}
        />
        {log && <Button title="Delete log" variant="danger" onPress={handleDeleteLog} />}
      </Card>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 16 },
  monthRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  monthTitle: { fontSize: 18, fontWeight: '700', color: colors.text },
  arrow: { fontSize: 30, color: colors.primaryDark, paddingHorizontal: 10 },
  weekRow: { flexDirection: 'row' },
  weekday: { flex: 1, textAlign: 'center', color: colors.muted, fontWeight: '600', marginBottom: 6 },
  cell: { flex: 1, alignItems: 'center', paddingVertical: 3 },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  todayRing: { borderWidth: 1.5, borderColor: colors.primaryDark },
  selectedRing: { borderWidth: 2, borderColor: colors.lavender },
  dayText: { color: colors.text, fontSize: 14 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.lavender, marginTop: 2 },
  dotSpace: { width: 5, height: 5, marginTop: 2 },
  legend: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  legendBox: { width: 12, height: 12, borderRadius: 6, marginRight: 4 },
  legendText: { color: colors.muted, fontSize: 12, marginRight: 14, marginLeft: 4 },
  selTitle: { fontSize: 17, fontWeight: '700', color: colors.text },
  muted: { color: colors.muted, fontSize: 13 },
  line: { color: colors.text, fontSize: 14, marginBottom: 3 },
});