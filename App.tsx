import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { AppProvider } from './src/context/AppContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { useInterFonts } from './src/theme/fonts';
import { colors } from './src/theme/colors';

export default function App() {
  const [fontsLoaded] = useInterFonts();

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <AppProvider>
      <StatusBar style="dark" />
      <AppNavigator />
    </AppProvider>
  );
}
