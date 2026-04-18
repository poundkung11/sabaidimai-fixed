import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Battery, BatteryLow } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const levels = [5, 10, 15];

export function BatteryAlertScreen() {
  const navigation = useNavigation<any>();
  const { updateSettings } = useApp();
  const [enabled, setEnabled] = useState(true);
  const [level, setLevel] = useState(10);

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>การแจ้งเตือนแบตเตอรี่</Text>
        <Text style={styles.desc}>รับการแจ้งเตือนถ้าแบตเตอรี่ของคุณต่ำก่อนเวลาเช็คอิน</Text>

        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleLeft}>
              <BatteryLow size={24} color={colors.warning} />
              <Text style={styles.toggleLabel}>เปิดการแจ้งเตือนแบตเตอรี่</Text>
            </View>
            <Switch
              value={enabled}
              onValueChange={setEnabled}
              trackColor={{ false: colors.muted, true: colors.primary }}
              thumbColor={colors.white}
            />
          </View>

          {enabled && (
            <View style={styles.levelSection}>
              <Text style={styles.levelLabel}>เกณฑ์การแจ้งเตือน</Text>
              <View style={styles.levelRow}>
                {levels.map(value => (
                  <TouchableOpacity
                    key={value}
                    style={[styles.levelBtn, level === value && styles.levelBtnSelected]}
                    onPress={() => setLevel(value)}
                  >
                    <Text style={[styles.levelBtnText, level === value && styles.levelBtnTextSelected]}>
                      {value}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}
        </View>

        <View style={styles.hintBox}>
          <Text style={styles.hintText}>การแจ้งเตือนจะแสดงเฉพาะภายใน 2 ชั่วโมงก่อนเวลาเช็คอิน</Text>
        </View>

        <View style={styles.whyBox}>
          <Battery size={20} color={colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
          <View style={styles.whyText}>
            <Text style={styles.whyTitle}>ทำไมนี่ถึงสำคัญ</Text>
            <Text style={styles.whyDesc}>ถ้าโทรศัพท์ของคุณหมดแบตก่อนการเช็คอิน เราจะติดต่อคุณไม่ได้ นี่ให้เวลาคุณชาร์จ</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => { updateSettings({ batteryAlert: enabled ? level : null }); navigation.navigate('OnboardingSummary'); }}
        >
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
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 24, marginBottom: 24 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
  toggleLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  toggleLabel: { fontSize: 15, color: colors.foreground, fontFamily: fonts.regular },
  levelSection: { borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 16, gap: 12 },
  levelLabel: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  levelRow: { flexDirection: 'row', gap: 12 },
  levelBtn: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: colors.muted },
  levelBtnSelected: { backgroundColor: colors.warning },
  levelBtnText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  levelBtnTextSelected: { color: colors.white, fontFamily: fonts.medium },
  hintBox: { backgroundColor: colors.muted, borderRadius: 10, padding: 16, marginBottom: 24, alignItems: 'center' },
  hintText: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
  whyBox: { flexDirection: 'row', gap: 12, backgroundColor: colors.primary5, borderRadius: 12, padding: 16, marginBottom: 32 },
  whyText: { flex: 1 },
  whyTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  whyDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
