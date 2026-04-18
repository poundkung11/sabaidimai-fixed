import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Switch } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, MapPin, Users, Lock } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { SOSSlider } from '../components/SOSSlider';
import { CountdownTimer } from '../components/CountdownTimer';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function SOSScreen() {
  const navigation = useNavigation<any>();
  const { activateSOS, state } = useApp();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notifyAll, setNotifyAll] = useState(false);
  const hasNavigatedRef = useRef(false);

  const handleContinue = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    activateSOS();
    navigation.navigate('HelpOnTheWay');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs')} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        {!showConfirmation ? (
          <View style={styles.centerContent}>
            <View style={styles.iconCircle}>
              <Users size={40} color={colors.destructive} />
            </View>
            <Text style={styles.title}>ต้องการความช่วยเหลือ?</Text>
            <Text style={styles.desc}>สิ่งนี้จะแจ้งเตือนผู้ติดต่อฉุกเฉินของคุณ</Text>
            <View style={styles.sliderWrap}>
              <SOSSlider onSlideComplete={() => setShowConfirmation(true)} />
            </View>
            <View style={styles.locationBox}>
              <MapPin size={20} color={colors.primary} style={{ marginTop: 2 }} />
              <View style={styles.locationText}>
                <Text style={styles.locationTitle}>ตำแหน่งที่ตั้งของคุณจะถูกแชร์</Text>
                <Text style={styles.locationDesc}>เราจะส่งตำแหน่งที่ตั้งปัจจุบันของคุณให้ผู้ติดต่อฉุกเฉินทันที</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.confirmContent}>
            <Text style={styles.title}>ยืนยันการขอความช่วยเหลือ</Text>
            <Text style={styles.desc}>กำลังส่งตำแหน่งที่ตั้งของคุณ</Text>
            <View style={styles.timerWrap}>
              <CountdownTimer seconds={notifyAll ? 2 : 5} onComplete={handleContinue} />
            </View>
            <View style={styles.notifyBox}>
              <Switch value={notifyAll} onValueChange={setNotifyAll} trackColor={{ false: colors.muted, true: colors.primary }} thumbColor={colors.white} />
              <View style={styles.notifyText}>
                <Text style={styles.notifyTitle}>แจ้งเตือนทุกคนทันที</Text>
                <Text style={styles.notifyDesc}>ข้ามการนับถอยหลังและแจ้งเตือนผู้ติดต่อทั้งหมดเดี๋ยวนี้</Text>
              </View>
            </View>
            {state.settings.emergencyCard && (
              <View style={styles.medBox}>
                <Lock size={20} color={colors.primary} style={{ marginTop: 2 }} />
                <View style={styles.medText}>
                  <Text style={styles.medTitle}>🔐 Medical Info Included</Text>
                  <Text style={styles.medDesc}>ข้อมูลทางการแพทย์ของคุณจะถูกแชร์ผ่านลิงก์ปลอดภัยที่หมดอายุใน 24 ชั่วโมง</Text>
                </View>
              </View>
            )}
            <TouchableOpacity style={styles.continueBtn} onPress={handleContinue}>
              <Text style={styles.continueBtnText}>ต่อไป</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.navigate('SOSCancel')}>
              <Text style={styles.cancelBtnText}>ยกเลิก</Text>
            </TouchableOpacity>
            <View style={styles.warningBox}>
              <Text style={styles.warningText}>ตำแหน่งที่ตั้งถูกส่งไปแล้ว การยกเลิกจะไม่เรียกข้อความกลับ</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  scroll: { flex: 1 },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%', flexGrow: 1 },
  centerContent: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.destructive10, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 12, textAlign: 'center', fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 48, fontFamily: fonts.regular },
  sliderWrap: { width: '100%', marginBottom: 32 },
  locationBox: { backgroundColor: colors.primary5, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, width: '100%' },
  locationText: { flex: 1 },
  locationTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  locationDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontFamily: fonts.regular },
  confirmContent: { alignItems: 'center', width: '100%' },
  timerWrap: { marginVertical: 32 },
  notifyBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, marginBottom: 24, width: '100%' },
  notifyText: { flex: 1 },
  notifyTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  notifyDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontFamily: fonts.regular },
  medBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 12, padding: 16, marginBottom: 24, width: '100%' },
  medText: { flex: 1 },
  medTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  medDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontFamily: fonts.regular },
  continueBtn: { width: '100%', height: 56, backgroundColor: colors.destructive, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  continueBtnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
  cancelBtn: { width: '100%', height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  cancelBtnText: { color: colors.foreground, fontSize: 16, fontFamily: fonts.regular },
  warningBox: { backgroundColor: colors.warning5, borderWidth: 1, borderColor: colors.warning20, borderRadius: 12, padding: 16, width: '100%' },
  warningText: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', lineHeight: 18, fontFamily: fonts.regular },
});
