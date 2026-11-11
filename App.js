import { Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import HomeScreen from './src/screens/HomeScreen';
import CalendarScreen from './src/screens/CalendarScreen';
import DailyLogScreen from './src/screens/DailyLogScreen';
import InsightsScreen from './src/screens/InsightsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import EducationScreen from './src/screens/EducationScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { colors } from './src/theme';

const Tab = createBottomTabNavigator();

const tabIcon = (emoji) => () => <Text style={{ fontSize: 18 }}>{emoji}</Text>;

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: colors.primaryDark,
          tabBarInactiveTintColor: colors.muted,
          tabBarLabelStyle: { fontSize: 10 },
          headerStyle: { backgroundColor: colors.bg },
          headerTitleStyle: { color: colors.text, fontWeight: '700' },
          headerShadowVisible: false,
          sceneStyle: { backgroundColor: colors.bg },
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarIcon: tabIcon('🏠') }} />
        <Tab.Screen name="Calendar" component={CalendarScreen} options={{ tabBarIcon: tabIcon('📅') }} />
        <Tab.Screen
          name="Log"
          component={DailyLogScreen}
          options={{ headerTitle: 'Daily Log', tabBarIcon: tabIcon('✏️') }}
        />
        <Tab.Screen name="Insights" component={InsightsScreen} options={{ tabBarIcon: tabIcon('📊') }} />
        <Tab.Screen
          name="History"
          component={HistoryScreen}
          options={{ headerTitle: 'Period History', tabBarIcon: tabIcon('🕘') }}
        />
        <Tab.Screen
          name="Learn"
          component={EducationScreen}
          options={{ headerTitle: 'Health Education', tabBarIcon: tabIcon('📖') }}
        />
        <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarIcon: tabIcon('⚙️') }} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
