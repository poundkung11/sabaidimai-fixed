import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Moon, Star, Clock } from 'lucide-react-native';
import { useApp, SleepPattern } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const options = [
  { value: 'early' as SleepPattern, Icon: Moon, title: 'นอนแต่หัวค่ำ', desc: '21:00 – 06:00' },
  { value: 'late' as SleepPattern, Icon: Star, title: 'นอนดึก', desc: '23:00 – 08:00' },
  { value: 'irregular' as SleepPattern, Icon: Clock, title: 'ไม่แน่นอน / ทำงานเป็นกะ', desc: 'ปรับแต่งช่วงเวลาแจ้งเตือนเอง' },
];

export function SleepPatternScreen() {
  const navigation = useNavigation<any>();
  const { updateSettings } = useApp();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>รูปแบบการนอน</Text>
        <Text style={styles.desc}>คุณนอนเวลาไหนโดยปกติ? เราจะไม่ส่งการแจ้งเตือนในช่วงเวลานี้</Text>
        <View style={styles.options}>
          {options.map(({ value, Icon, title, desc }) => (
            <TouchableOpacity key={value} style={styles.card} onPress={() => { updateSettings({ sleepPattern: value }); navigation.navigate(value === 'irregular' ? 'OnboardingSafeWindows' : 'OnboardingCheckInTime'); }}>
              <View style={styles.cardIcon}><Icon size={24} color={colors.primary} /></View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%', paddingTop: 48 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 8, fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, marginBottom: 32, fontFamily: fonts.regular },
  options: { gap: 16 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardText: { flex: 1, paddingTop: 4 },
  cardTitle: { fontSize: 15, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  cardDesc: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
});
