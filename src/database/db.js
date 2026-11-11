import * as SQLite from 'expo-sqlite';

let dbPromise = null;

// Opens the database once and creates the tables on first run
export function getDb() {
  if (!dbPromise) {
    dbPromise = (async () => {
      const db = await SQLite.openDatabaseAsync('lunacycle.db');
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS periods (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          start_date TEXT NOT NULL,
          end_date TEXT
        );
        CREATE TABLE IF NOT EXISTS logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL UNIQUE,
          flow TEXT,
          mood TEXT,
          symptoms TEXT,
          note TEXT
        );
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY NOT NULL,
          value TEXT
        );
      `);
      return db;
    })();
  }
  return dbPromise;
}

/* ---------- Periods ---------- */

export async function getPeriods() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM periods ORDER BY start_date DESC');
}

export async function addPeriod(startDate, endDate = null) {
  const db = await getDb();
  const existing = await db.getFirstAsync('SELECT id FROM periods WHERE start_date = ?', [startDate]);
  if (existing) return false;
  await db.runAsync('INSERT INTO periods (start_date, end_date) VALUES (?, ?)', [startDate, endDate]);
  return true;
}

export async function endPeriod(id, endDate) {
  const db = await getDb();
  await db.runAsync('UPDATE periods SET end_date = ? WHERE id = ?', [endDate, id]);
}

export async function deletePeriod(id) {
  const db = await getDb();
  await db.runAsync('DELETE FROM periods WHERE id = ?', [id]);
}

/* ---------- Daily logs ---------- */

export async function getLog(date) {
  const db = await getDb();
  return db.getFirstAsync('SELECT * FROM logs WHERE date = ?', [date]);
}

export async function getAllLogs() {
  const db = await getDb();
  return db.getAllAsync('SELECT * FROM logs ORDER BY date DESC');
}

export async function saveLog({ date, flow, mood, symptoms, note }) {
  const db = await getDb();
  await db.runAsync(
    `INSERT INTO logs (date, flow, mood, symptoms, note) VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       flow = excluded.flow,
       mood = excluded.mood,
       symptoms = excluded.symptoms,
       note = excluded.note`,
    [date, flow, mood, symptoms, note]
  );
}

/* ---------- Settings ---------- */

export async function getSettings() {
  const db = await getDb();
  const rows = await db.getAllAsync('SELECT key, value FROM settings');
  const map = {};
  rows.forEach((r) => (map[r.key] = r.value));
  return {
    cycleLength: parseInt(map.cycleLength, 10) || 28,
    periodLength: parseInt(map.periodLength, 10) || 5,
  };
}

export async function saveSettings({ cycleLength, periodLength }) {
  const db = await getDb();
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['cycleLength', String(cycleLength)]);
  await db.runAsync('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', ['periodLength', String(periodLength)]);
}

export async function clearAllData() {
  const db = await getDb();
  await db.execAsync('DELETE FROM periods; DELETE FROM logs; DELETE FROM settings;');
}
