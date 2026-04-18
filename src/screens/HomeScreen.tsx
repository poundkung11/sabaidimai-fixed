import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, Plus, PauseCircle } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { StatusBanner } from '../components/StatusBanner';
import { CheckInButton } from '../components/CheckInButton';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const { state, updateUserStatus, pauseToday, useExtended, markCheckIn } = useApp();
  const resetTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const handleCheckIn = () => {
    if (state.userStatus === 'paused' || state.userStatus === 'sos-active') return;
    markCheckIn();
    resetTimerRef.current = setTimeout(() => updateUserStatus('normal'), 2000);
  };

  const handleExtend = () => {
    if (state.extendedUsed) return;
    useExtended();
    Alert.alert('เพิ่มเวลาแล้ว', 'ระบบเลื่อนเวลาเช็กอินให้อีก 20 นาทีเรียบร้อย');
  };

  if (!state.settings.hasCompletedOnboarding) {
    return (
      <View style={styles.welcomeContainer}>
        <View style={styles.welcomeIcon}>
          <Text style={styles.welcomeEmoji}>🏠</Text>
        </View>
        <Text style={styles.welcomeTitle}>ยินดีต้อนรับ</Text>
        <Text style={styles.welcomeDesc}>มาตั้งค่าการเช็กอินรายวันแบบใช้ง่าย ตัวหนังสือชัด และเหมาะกับผู้สูงอายุกันก่อนนะคะ</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={() => navigation.navigate('OnboardingWelcome')}>
          <Text style={styles.primaryBtnText}>เริ่มการตั้งค่า</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('Demo')}>
          <Text style={styles.outlineBtnText}>ดูตัวอย่างการใช้งาน</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.statusWrap}>
          <StatusBanner status={state.userStatus} pausedUntil={state.pausedUntil} />
        </View>

        {!state.settings.emergencyCard && (
          <TouchableOpacity style={styles.medCard} onPress={() => navigation.navigate('EmergencyCardIntro')}>
            <View style={styles.medCardIcon}>
              <Lock size={20} color={colors.primary} />
            </View>
            <View style={styles.medCardText}>
              <Text style={styles.medCardTitle}>เพิ่มข้อมูลทางการแพทย์</Text>
              <Text style={styles.medCardDesc}>ระบบจะใช้เฉพาะตอนฉุกเฉินเท่านั้น เพื่อช่วยให้ทีมช่วยเหลือทำงานได้เร็วขึ้น</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.checkInArea}>
          <CheckInButton status={state.userStatus} onClick={handleCheckIn} />

          {(state.userStatus === 'pending' || state.userStatus === 'grace' || state.userStatus === 'pre-alert') && (
            <View style={styles.options}>
              {!state.extendedUsed && (
                <TouchableOpacity style={styles.optionBtnPrimary} onPress={handleExtend}>
                  <Plus size={16} color={colors.primary} />
                  <Text style={styles.optionBtnPrimaryText}>ขอเวลาเพิ่ม 20 นาที</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.optionBtnOutline} onPress={() => pauseToday()}>
                <PauseCircle size={16} color={colors.foreground} />
                <Text style={styles.optionBtnOutlineText}>หยุดวันนี้</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.sosWrap}>
            <TouchableOpacity style={styles.sosBtn} onPress={() => navigation.navigate('SOS')}>
              <Text style={styles.sosBtnText}>ขอความช่วยเหลือฉุกเฉิน</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  welcomeContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  welcomeIcon: { width: 88, height: 88, borderRadius: 44, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  welcomeEmoji: { fontSize: 40 },
  welcomeTitle: { fontSize: 28, color: colors.foreground, marginBottom: 12, textAlign: 'center', fontFamily: fonts.semiBold },
  welcomeDesc: { fontSize: 16, color: colors.mutedForeground, textAlign: 'center', marginBottom: 32, lineHeight: 24, fontFamily: fonts.regular },
  primaryBtn: { width: '100%', height: 58, backgroundColor: colors.primary, borderRadius: 29, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  primaryBtnText: { color: colors.white, fontSize: 18, fontFamily: fonts.medium },
  outlineBtn: { width: '100%', height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  outlineBtnText: { color: colors.foreground, fontSize: 17, fontFamily: fonts.regular },
  inner: { flex: 1, padding: 24, maxWidth: 480, alignSelf: 'center', width: '100%' },
  statusWrap: { marginBottom: 24 },
  medCard: { backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 18, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 },
  medCardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  medCardText: { flex: 1 },
  medCardTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.medium, marginBottom: 4 },
  medCardDesc: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20, fontFamily: fonts.regular },
  checkInArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  options: { marginTop: 32, width: '100%', gap: 12 },
  optionBtnPrimary: { width: '100%', height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.primary20, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: colors.card },
  optionBtnPrimaryText: { color: colors.primary, fontSize: 17, fontFamily: fonts.medium },
  optionBtnOutline: { width: '100%', height: 52, borderRadius: 26, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, backgroundColor: colors.card },
  optionBtnOutlineText: { color: colors.foreground, fontSize: 17, fontFamily: fonts.regular },
  sosWrap: { marginTop: 32 },
  sosBtn: { minHeight: 52, paddingHorizontal: 24, borderRadius: 26, borderWidth: 1, borderColor: colors.destructive20, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card },
  sosBtnText: { color: colors.destructive, fontSize: 17, fontFamily: fonts.medium },
});
