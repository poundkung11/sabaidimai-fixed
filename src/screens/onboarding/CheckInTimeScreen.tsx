import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Clock } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

export function CheckInTimeScreen() {
  const navigation = useNavigation<any>();
  const { state, updateSettings } = useApp();
  const defaultTime = state.settings.sleepPattern === 'late' ? '11:00' : '09:00';
  const [time, setTime] = useState(defaultTime);
  const hour = parseInt(time.split(':')[0]) || 0;

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <Text style={styles.title}>เลือกเวลาเช็คอิน</Text>
        <Text style={styles.desc}>คุณต้องการเช็คอินเวลาไหนทุกวัน?</Text>

        <View style={styles.card}>
          <View style={styles.clockIcon}><Clock size={48} color={colors.primary} /></View>
          <Text style={styles.fieldLabel}>เวลาเช็คอินประจำวัน</Text>
          <TextInput value={time} onChangeText={setTime} placeholder="09:00" placeholderTextColor={colors.mutedForeground} style={styles.timeInput} keyboardType="numbers-and-punctuation" />
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>คุณจะได้รับการแจ้งเตือนอย่างนุ่มนวลในเวลานี้ทุกวัน</Text>
          </View>
        </View>

        <View style={styles.timeline}>
          <View style={styles.timelineBar}>
            <View style={[styles.timelineFill, { width: `${(hour / 24) * 100}%` }]} />
          </View>
          <View style={styles.timelineLabels}>
            <Text style={styles.timelineLabel}>00:00</Text>
            <Text style={styles.timelineLabel}>12:00</Text>
            <Text style={styles.timelineLabel}>24:00</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => { updateSettings({ checkInTime: time }); navigation.navigate('OnboardingGracePeriod'); }}>
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
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 32, alignItems: 'center', marginBottom: 32 },
  clockIcon: { marginBottom: 24 },
  fieldLabel: { fontSize: 13, color: colors.mutedForeground, marginBottom: 8, fontFamily: fonts.regular },
  timeInput: { width: '100%', height: 56, backgroundColor: colors.inputBackground, borderRadius: 12, paddingHorizontal: 16, fontSize: 22, color: colors.foreground, textAlign: 'center', fontFamily: fonts.regular, marginBottom: 16 },
  infoBox: { backgroundColor: colors.primary5, borderRadius: 10, padding: 12, width: '100%' },
  infoText: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
  timeline: { marginBottom: 32 },
  timelineBar: { height: 8, backgroundColor: colors.muted, borderRadius: 4, overflow: 'hidden', marginBottom: 8 },
  timelineFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  timelineLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  timelineLabel: { fontSize: 11, color: colors.mutedForeground, fontFamily: fonts.regular },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
