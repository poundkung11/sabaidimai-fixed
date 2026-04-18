import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Clock, Timer, CheckCircle } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const TIME_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/;

export function QuickAdjustScreen() {
  const navigation = useNavigation<any>();
  const { state, updateSettings } = useApp();
  const [checkInTime, setCheckInTime] = useState(state.settings.checkInTime);
  const [gracePeriod, setGracePeriod] = useState(state.settings.gracePeriod);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const handleSave = () => {
    const normalizedTime = checkInTime.trim();
    if (!TIME_REGEX.test(normalizedTime)) {
      Alert.alert('รูปแบบเวลาไม่ถูกต้อง', 'กรุณากรอกเวลาเป็นรูปแบบ HH:mm เช่น 09:00 หรือ 18:30');
      return;
    }

    updateSettings({ checkInTime: normalizedTime, gracePeriod });
    setSaved(true);
    timerRef.current = setTimeout(() => navigation.navigate('MainTabs', { screen: 'Settings' }), 1500);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.title}>ปรับการเช็กอินแบบด่วน</Text>
        <Text style={styles.subtitle}>ตั้งค่าให้อ่านง่ายและเหมาะกับการใช้งานของผู้สูงอายุ</Text>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>เวลาเช็กอิน</Text>
          </View>
          <TextInput
            value={checkInTime}
            onChangeText={setCheckInTime}
            placeholder="09:00"
            placeholderTextColor={colors.mutedForeground}
            style={styles.timeInput}
            keyboardType="numbers-and-punctuation"
            maxLength={5}
          />
          <Text style={styles.helper}>ใช้รูปแบบเวลา HH:mm เช่น 08:30</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Timer size={20} color={colors.primary} />
            <Text style={styles.cardTitle}>ช่วงผ่อนผัน</Text>
          </View>
          <View style={styles.options}>
            {[10, 30, 60].map(v => (
              <TouchableOpacity key={v} style={[styles.option, gracePeriod === v && styles.optionSelected]} onPress={() => setGracePeriod(v)}>
                <Text style={[styles.optionText, gracePeriod === v && styles.optionTextSelected]}>{v} นาที</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity style={[styles.saveBtn, saved && styles.saveBtnDisabled]} onPress={handleSave} disabled={saved}>
          {saved ? (
            <View style={styles.savedRow}>
              <CheckCircle size={20} color={colors.white} />
              <Text style={styles.saveBtnText}>บันทึกแล้ว</Text>
            </View>
          ) : (
            <Text style={styles.saveBtnText}>บันทึกการเปลี่ยนแปลง</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 15, color: colors.mutedForeground, fontFamily: fonts.regular },
  content: { flex: 1, padding: 24, maxWidth: 480, alignSelf: 'center', width: '100%' },
  title: { fontSize: 28, color: colors.foreground, marginBottom: 8, fontFamily: fonts.semiBold },
  subtitle: { fontSize: 16, color: colors.mutedForeground, marginBottom: 28, lineHeight: 24, fontFamily: fonts.regular },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 18, padding: 18, marginBottom: 20 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  cardTitle: { fontSize: 17, color: colors.foreground, fontFamily: fonts.medium },
  timeInput: { height: 56, borderRadius: 16, backgroundColor: colors.inputBackground, paddingHorizontal: 16, fontSize: 24, color: colors.foreground, fontFamily: fonts.semiBold, borderWidth: 1, borderColor: colors.border },
  helper: { marginTop: 10, fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  options: { flexDirection: 'row', gap: 10, flexWrap: 'wrap' },
  option: { minWidth: 92, height: 48, borderRadius: 14, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 12 },
  optionSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionText: { fontSize: 16, color: colors.foreground, fontFamily: fonts.regular },
  optionTextSelected: { color: colors.white, fontFamily: fonts.medium },
  saveBtn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  saveBtnDisabled: { opacity: 0.7 },
  savedRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  saveBtnText: { color: colors.white, fontSize: 17, fontFamily: fonts.medium },
});
