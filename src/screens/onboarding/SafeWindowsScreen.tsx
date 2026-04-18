import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sunrise, Sun, Sunset, Moon } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const windows = [
  { key: 'morning', Icon: Sunrise, label: 'เช้า', time: '06:00-12:00' },
  { key: 'afternoon', Icon: Sun, label: 'บ่าย', time: '12:00-18:00' },
  { key: 'evening', Icon: Sunset, label: 'เย็น', time: '18:00-22:00' },
  { key: 'night', Icon: Moon, label: 'กลางคืน', time: '22:00-06:00' },
];

export function SafeWindowsScreen() {
  const navigation = useNavigation<any>();
  const { updateSettings } = useApp();
  const [selected, setSelected] = useState({ morning: false, afternoon: false, evening: false, night: false });
  const hasSelection = Object.values(selected).some(v => v);

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>ช่วงเวลาที่แจ้งเตือนได้</Text>
        <Text style={styles.desc}>เลือกช่วงเวลาที่สะดวกให้แอปแจ้งเตือน โดยเน้นให้อ่านง่ายและไม่รบกวนเกินไป</Text>
        <View style={styles.grid}>
          {windows.map(({ key, Icon, label, time }) => {
            const isSelected = selected[key as keyof typeof selected];
            return (
              <TouchableOpacity key={key} style={[styles.card, isSelected && styles.cardSelected]} onPress={() => setSelected(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}>
                <Icon size={32} color={isSelected ? colors.white : colors.foreground} />
                <Text style={[styles.cardLabel, isSelected && styles.cardLabelSelected]}>{label}</Text>
                <Text style={[styles.cardTime, isSelected && styles.cardTimeSelected]}>{time}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={[styles.btn, !hasSelection && styles.btnDisabled]} disabled={!hasSelection} onPress={() => { updateSettings({ safeWindows: selected }); navigation.navigate('OnboardingCheckInTime'); }}>
          <Text style={styles.btnText}>ถัดไป</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%', paddingTop: 48 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 8, fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, marginBottom: 32, fontFamily: fonts.regular },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  card: { width: '47%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20, alignItems: 'center', gap: 8 },
  cardSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  cardLabel: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  cardLabelSelected: { color: colors.white },
  cardTime: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  cardTimeSelected: { color: 'rgba(255,255,255,0.8)' },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
