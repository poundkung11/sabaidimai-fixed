import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

export function WelcomeScreen() {
  const navigation = useNavigation<any>();
  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.icon}><Heart size={40} color={colors.primary} /></View>
        <Text style={styles.title}>Sabaai-Dii-Mai</Text>
        <Text style={styles.desc}>วิธีเงียบๆ ในการเช็คอินกับคนที่คุณห่วงใย</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('OnboardingSetupFor')}>
          <Text style={styles.btnText}>เริ่มต้น</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  inner: { width: '100%', maxWidth: 448, alignItems: 'center', gap: 24 },
  icon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 28, color: colors.foreground, fontFamily: fonts.regular },
  desc: { fontSize: 15, color: colors.mutedForeground, textAlign: 'center', lineHeight: 24, fontFamily: fonts.regular },
  btn: { width: '100%', height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
