import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Check, Lock } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

export function EmergencyCardConfirmationScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.inner}>
        <View style={styles.successIcon}>
          <Check size={40} color={colors.primary} />
        </View>

        <Text style={styles.title}>บันทึกข้อมูลเรียบร้อย</Text>
        <Text style={styles.desc}>บัตรข้อมูลทางการแพทย์ฉุกเฉิน ของคุณถูกเข้ารหัสและพร้อมใช้งาน</Text>

        <View style={styles.infoCard}>
          <View style={styles.infoIconWrap}>
            <Lock size={20} color={colors.primary} />
          </View>
          <View style={styles.infoText}>
            <Text style={styles.infoTitle}>ข้อมูลของคุณปลอดภัย</Text>
            <Text style={styles.infoDesc}>
              ข้อมูลทางการแพทย์จะถูกแชร์เฉพาะเมื่อคุณกด SOS เท่านั้น ผู้ติดต่อฉุกเฉินจะได้รับลิงก์ปลอดภัยที่หมดอายุภายใน 24 ชั่วโมง
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}>
          <Text style={styles.btnText}>กลับไปหน้าการตั้งค่า</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => navigation.navigate('EmergencyCardForm')}>
          <Text style={styles.outlineBtnText}>แก้ไขข้อมูล</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { flex: 1, padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%', alignItems: 'center', justifyContent: 'center' },
  successIcon: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 24, color: colors.foreground, textAlign: 'center', marginBottom: 12, fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 32, fontFamily: fonts.regular },
  infoCard: { width: '100%', backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 32 },
  infoIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  infoText: { flex: 1 },
  infoTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  infoDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  btn: { width: '100%', height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
  outlineBtn: { width: '100%', height: 48, borderRadius: 24, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  outlineBtnText: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
});
