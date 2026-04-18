import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Timer } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const options = [
  { value: 10, label: '10 นาที' },
  { value: 30, label: '30 นาที', recommended: true },
  { value: 60, label: '60 นาที' },
];

export function GracePeriodScreen() {
  const navigation = useNavigation<any>();
  const { updateSettings } = useApp();
  const [selected, setSelected] = useState(30);

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>ช่วงผ่อนผัน</Text>
        <Text style={styles.desc}>เราควรรอนานแค่ไหนก่อนแจ้งผู้อื่น?</Text>
        <View style={styles.iconWrap}><Timer size={40} color={colors.primary} /></View>
        <View style={styles.options}>
          {options.map(opt => (
            <TouchableOpacity key={opt.value} style={[styles.option, selected === opt.value && styles.optionSelected]} onPress={() => setSelected(opt.value)}>
              <Text style={[styles.optionText, selected === opt.value && styles.optionTextSelected]}>{opt.label}</Text>
              {opt.recommended && <View style={[styles.badge, selected === opt.value && styles.badgeSelected]}><Text style={[styles.badgeText, selected === opt.value && styles.badgeTextSelected]}>แนะนำ</Text></View>}
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.hint}><Text style={styles.hintText}>นี่ให้เวลาเพิ่มเติมสำหรับคุณในการเช็คอินถ้าคุณยุ่ง</Text></View>
        <TouchableOpacity style={styles.btn} onPress={() => { updateSettings({ gracePeriod: selected }); navigation.navigate('OnboardingPrimaryContact'); }}>
          <Text style={styles.btnText}>ดำเนินการต่อ</Text>
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
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 32 },
  options: { gap: 12, marginBottom: 24 },
  option: { borderRadius: 16, padding: 20, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: 15, color: colors.foreground, fontFamily: fonts.regular },
  optionTextSelected: { color: colors.white },
  badge: { backgroundColor: colors.primary10, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  badgeSelected: { backgroundColor: 'rgba(255,255,255,0.2)' },
  badgeText: { fontSize: 12, color: colors.primary, fontFamily: fonts.regular },
  badgeTextSelected: { color: colors.white },
  hint: { backgroundColor: colors.muted, borderRadius: 10, padding: 16, marginBottom: 24 },
  hintText: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
