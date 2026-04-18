import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, CheckCircle2, MessageSquare } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function SOSCancelScreen() {
  const navigation = useNavigation<any>();
  const { deactivateSOS } = useApp();
  const [reason, setReason] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const sendTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finishTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (sendTimerRef.current) clearTimeout(sendTimerRef.current);
      if (finishTimerRef.current) clearTimeout(finishTimerRef.current);
    };
  }, []);

  const handleSubmit = () => {
    setIsSending(true);
    sendTimerRef.current = setTimeout(() => {
      setIsSending(false);
      setIsSent(true);
      finishTimerRef.current = setTimeout(() => {
        deactivateSOS();
        navigation.navigate('MainTabs');
      }, 1500);
    }, 1000);
  };

  if (isSent) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successIcon}><CheckCircle2 size={40} color={colors.safe} /></View>
        <Text style={styles.successTitle}>ส่งข้อความแล้ว</Text>
        <Text style={styles.successDesc}>ระบบแจ้งผู้ติดต่อฉุกเฉินเรียบร้อยแล้วว่าคุณปลอดภัย</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('SOS')} style={styles.backBtn}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
          <Text style={styles.backText}>กลับ</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <View style={styles.iconCircle}><MessageSquare size={40} color={colors.warning} /></View>
        <Text style={styles.title}>ยกเลิกการขอความช่วยเหลือ</Text>
        <Text style={styles.desc}>คุณสามารถส่งเหตุผลเพิ่มเติมหรือปล่อยว่างไว้ก็ได้</Text>

        <Text style={styles.label}>เหตุผลในการยกเลิก (ไม่บังคับ)</Text>
        <TextInput
          value={reason}
          onChangeText={setReason}
          placeholder="เช่น ฉันปลอดภัยแล้ว, กดผิด, ตอนนี้มีคนอยู่ด้วยแล้ว"
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={200}
          style={styles.textarea}
        />
        <Text style={styles.charCount}>{reason.length}/200</Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>หากไม่กรอกเหตุผล ระบบจะส่งข้อความสั้น ๆ ว่าคุณปลอดภัยแล้วโดยอัตโนมัติ</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={[styles.sendBtn, isSending && styles.btnDisabled]} onPress={handleSubmit} disabled={isSending}>
          <Text style={styles.sendBtnText}>{isSending ? 'กำลังส่ง...' : 'ส่งข้อความ'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={() => { deactivateSOS(); navigation.navigate('MainTabs'); }}>
          <Text style={styles.skipBtnText}>ข้ามไป</Text>
        </TouchableOpacity>
        <Text style={styles.skipHint}>การข้ามจะยกเลิกการขอความช่วยเหลือโดยไม่ส่งข้อความเพิ่มเติม</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  successContainer: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', padding: 24 },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.safe10, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  successTitle: { fontSize: 24, color: colors.foreground, marginBottom: 12, fontFamily: fonts.semiBold },
  successDesc: { fontSize: 15, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
  header: { paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  backText: { fontSize: 15, color: colors.mutedForeground, fontFamily: fonts.regular },
  content: { flex: 1, padding: 24, maxWidth: 480, alignSelf: 'center', width: '100%', alignItems: 'center' },
  iconCircle: { width: 84, height: 84, borderRadius: 42, backgroundColor: colors.warning10, alignItems: 'center', justifyContent: 'center', marginBottom: 24, marginTop: 8 },
  title: { fontSize: 28, color: colors.foreground, marginBottom: 12, textAlign: 'center', fontFamily: fonts.semiBold },
  desc: { fontSize: 16, color: colors.mutedForeground, marginBottom: 32, textAlign: 'center', lineHeight: 24, fontFamily: fonts.regular },
  label: { fontSize: 16, color: colors.foreground, marginBottom: 12, alignSelf: 'flex-start', fontFamily: fonts.medium },
  textarea: { width: '100%', height: 132, padding: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, fontSize: 16, color: colors.foreground, textAlignVertical: 'top', fontFamily: fonts.regular },
  charCount: { fontSize: 13, color: colors.mutedForeground, alignSelf: 'flex-end', marginTop: 8, fontFamily: fonts.regular },
  infoBox: { width: '100%', backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 12, padding: 16, marginTop: 24 },
  infoText: { fontSize: 14, color: colors.mutedForeground, lineHeight: 20, fontFamily: fonts.regular },
  footer: { padding: 24, paddingBottom: 40, gap: 12 },
  sendBtn: { height: 56, backgroundColor: colors.safe, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  sendBtnText: { color: colors.white, fontSize: 17, fontFamily: fonts.medium },
  skipBtn: { height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  skipBtnText: { color: colors.foreground, fontSize: 17, fontFamily: fonts.regular },
  skipHint: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
});
