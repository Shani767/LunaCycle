# LunaCycle – Personal Period & Menstrual Health Tracker

LunaCycle is a mobile app that helps users track their menstrual cycle, log daily symptoms and understand their cycle patterns. All data is stored on the phone, so the app works without an internet connection.

## Features

- **Home:** current cycle day, countdown to the next period, and a button to log the start and end of a period
- **Calendar:** monthly view of past period days and predicted period days, with a dot on days that have a log
- **Daily Log:** record flow, mood, symptoms and a note for any day
- **Insights:** average cycle length, average period length, recent cycle lengths and most common symptoms
- **Period History:** list of previous periods, with options to add or delete a period
- **Health Education:** menstrual health information
- **Settings:** typical cycle and period length, and an option to delete all data

## Technology

- React Native with Expo (JavaScript)
- React Navigation (bottom tabs)
- SQLite (`expo-sqlite`) for local storage

## Project structure

```
App.js                 Navigation setup
src/screens/           The 7 app screens
src/components/        Shared UI components
src/database/db.js     SQLite database functions
src/utils/             Date and cycle calculation helpers
src/theme.js           Colours
```

## How to run

1. Install Node.js 22 (LTS).
2. Clone the repository and open the folder in a terminal.
3. Install the packages:
   ```
   npm install
   ```
4. Start the app:
   ```
   npx expo start
   ```
5. Scan the QR code with the Expo Go app on your phone.

## How predictions work

The next period is predicted by adding the average cycle length to the start date of the latest period. The average comes from the periods you log. Until you have logged two periods, the typical cycle length from Settings is used.
