import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Home, Users, Circle, Settings, UserCheck } from 'lucide-react-native';

import { HomeScreen } from '../screens/HomeScreen';
import { CommunityScreen } from '../screens/CommunityScreen';
import { CircleScreen } from '../screens/CircleScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { FriendsScreen } from '../screens/FriendsScreen';
import { FriendSearchScreen } from '../screens/FriendSearchScreen';
import { DirectChatScreen } from '../screens/DirectChatScreen';

import { SOSScreen } from '../screens/SOSScreen';
import { HelpOnTheWayScreen } from '../screens/HelpOnTheWayScreen';
import { SOSActiveScreen } from '../screens/SOSActiveScreen';
import { SOSCancelScreen } from '../screens/SOSCancelScreen';
import { DemoScreen } from '../screens/DemoScreen';
import { QuickAdjustScreen } from '../screens/QuickAdjustScreen';
import { ContactSupportScreen } from '../screens/ContactSupportScreen';
import { ChatRoomsScreen } from '../screens/ChatRoomsScreen';
import { ChatRoomScreen } from '../screens/ChatRoomScreen';
import { SupportChatScreen } from '../screens/SupportChatScreen';

import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { SetupForScreen } from '../screens/onboarding/SetupForScreen';
import { SleepPatternScreen } from '../screens/onboarding/SleepPatternScreen';
import { SafeWindowsScreen } from '../screens/onboarding/SafeWindowsScreen';
import { CheckInTimeScreen } from '../screens/onboarding/CheckInTimeScreen';
import { GracePeriodScreen } from '../screens/onboarding/GracePeriodScreen';
import { PrimaryContactScreen } from '../screens/onboarding/PrimaryContactScreen';
import { PermissionsScreen } from '../screens/onboarding/PermissionsScreen';
import { BatteryAlertScreen } from '../screens/onboarding/BatteryAlertScreen';
import { SummaryScreen } from '../screens/onboarding/SummaryScreen';

import { EmergencyCardIntroScreen } from '../screens/emergency-card/EmergencyCardIntroScreen';
import { EmergencyCardFormScreen } from '../screens/emergency-card/EmergencyCardFormScreen';
import { EmergencyCardConfirmationScreen } from '../screens/emergency-card/EmergencyCardConfirmationScreen';

import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { useApp } from '../context/AppContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 16,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Home size={22} color={focused ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.mutedForeground }]}>
                ความปลอดภัย
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Community"
        component={CommunityScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Users size={22} color={focused ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.mutedForeground }]}>
                ชุมชน
              </Text>
            </View>
          ),
          headerShown: true,
          header: () => (
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Users size={20} color={colors.primary} />
                <Text style={styles.headerTitle}>ชุมชน</Text>
              </View>
              <Text style={styles.headerSubtitle}>แบ่งปันและรับกำลังใจ</Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Friends"
        component={FriendsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <UserCheck size={22} color={focused ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.mutedForeground }]}>
                เพื่อน
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Circle"
        component={CircleScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Circle size={22} color={focused ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.mutedForeground }]}>
                เบอร์ฉุกเฉิน
              </Text>
            </View>
          ),
        }}
      />

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.tabItem}>
              <Settings size={22} color={focused ? colors.primary : colors.mutedForeground} />
              <Text style={[styles.tabLabel, { color: focused ? colors.primary : colors.mutedForeground }]}>
                การตั้งค่า
              </Text>
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
}

function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MainTabs" component={MainTabs} />

      <Stack.Screen name="FriendSearch" component={FriendSearchScreen} />
      <Stack.Screen name="DirectChat" component={DirectChatScreen} />

      <Stack.Screen name="SOS" component={SOSScreen} />
      <Stack.Screen name="HelpOnTheWay" component={HelpOnTheWayScreen} />
      <Stack.Screen name="SOSActive" component={SOSActiveScreen} />
      <Stack.Screen name="SOSCancel" component={SOSCancelScreen} />

      <Stack.Screen name="Demo" component={DemoScreen} />
      <Stack.Screen name="QuickAdjust" component={QuickAdjustScreen} />
      <Stack.Screen name="ContactSupport" component={ContactSupportScreen} />
      <Stack.Screen name="ChatRooms" component={ChatRoomsScreen} />
      <Stack.Screen name="ChatRoom" component={ChatRoomScreen} />
      <Stack.Screen name="SupportChat" component={SupportChatScreen} />

      <Stack.Screen name="EmergencyCardIntro" component={EmergencyCardIntroScreen} />
      <Stack.Screen name="EmergencyCardForm" component={EmergencyCardFormScreen} />
      <Stack.Screen name="EmergencyCardConfirmation" component={EmergencyCardConfirmationScreen} />

      <Stack.Screen name="OnboardingWelcome" component={WelcomeScreen} />
      <Stack.Screen name="OnboardingSetupFor" component={SetupForScreen} />
      <Stack.Screen name="OnboardingSleepPattern" component={SleepPatternScreen} />
      <Stack.Screen name="OnboardingSafeWindows" component={SafeWindowsScreen} />
      <Stack.Screen name="OnboardingCheckInTime" component={CheckInTimeScreen} />
      <Stack.Screen name="OnboardingGracePeriod" component={GracePeriodScreen} />
      <Stack.Screen name="OnboardingPrimaryContact" component={PrimaryContactScreen} />
      <Stack.Screen name="OnboardingPermissions" component={PermissionsScreen} />
      <Stack.Screen name="OnboardingBatteryAlert" component={BatteryAlertScreen} />
      <Stack.Screen name="OnboardingSummary" component={SummaryScreen} />
    </Stack.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Demo" component={DemoScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { isHydrated, isLoggedIn } = useApp();

  if (!isHydrated) {
    return (
      <SafeAreaProvider>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        {isLoggedIn ? <AppStack /> : <AuthStack />}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    width: 64,
  },
  tabLabel: {
    fontSize: 9,
    textAlign: 'center',
    fontFamily: fonts.regular,
    flexShrink: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingTop: 56,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 18,
    color: colors.foreground,
    fontFamily: fonts.regular,
  },
  headerSubtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
  },
});