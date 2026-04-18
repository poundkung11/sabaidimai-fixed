import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock, Shield, EyeOff } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const infoCards = [
  {
    Icon: Shield,
    title: 'แชร์เฉพาะตอนฉุกเฉิน',
    desc: 'ข้อมูลจะถูกส่งเฉพาะเมื่อคุณกด SOS เท่านั้น ไม่แสดงในหน้าหลักหรือวงการปลอดภัย',
  },
  {
    Icon: Lock,
    title: 'เข้ารหัสและปลอดภัย',
    desc: 'ข้อมูลถูกเข้ารหัส ไม่มีการส่งแบบข้อความธรรมดา ผู้ติดต่อจะได้รับลิงก์ปลอดภัยที่หมดอายุใน 24 ชั่วโมง',
  },
  {
    Icon: EyeOff,
    title: 'ทางเลือกของคุณ',
    desc: 'ทุกช่องข้อมูลเป็นทางเลือก ยกเว้นชื่อ คุณควบคุมว่าจะแชร์อะไรและไม่แชร์อะไร',
  },
];

export function EmergencyCardIntroScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.iconWrap}>
          <Lock size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>บัตรข้อมูลทางการแพทย์ฉุกเฉิน</Text>
        <Text style={styles.desc}>ข้อมูลทางการแพทย์ที่เข้ารหัสและปลอดภัย</Text>

        <View style={styles.cards}>
          {infoCards.map(({ Icon, title, desc }, index) => (
            <View key={index} style={styles.card}>
              <View style={styles.cardIconWrap}>
                <Icon size={20} color={colors.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{desc}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('EmergencyCardForm')}>
          <Text style={styles.btnText}>เพิ่มข้อมูล</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.ghostBtn} onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}>
          <Text style={styles.ghostBtnText}>ข้าม</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%', paddingTop: 48 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 24 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 8, textAlign: 'center', fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, marginBottom: 32, textAlign: 'center', fontFamily: fonts.regular },
  cards: { gap: 16, marginBottom: 32 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  cardDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
  ghostBtn: { height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  ghostBtnText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
});
