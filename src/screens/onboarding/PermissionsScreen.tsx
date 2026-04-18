import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MapPin, Bell, MessageSquare, RefreshCw } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const permissions = [
  {
    Icon: MapPin,
    title: 'ตำแหน่งที่ตั้ง',
    description: 'ใช้เฉพาะในกรณีฉุกเฉิน ไม่มีการติดตามหรือเก็บข้อมูล',
    iconColor: colors.primary,
  },
  {
    Icon: Bell,
    title: 'การแจ้งเตือน',
    description: 'การแจ้งเตือนอย่างนุ่มนวลสำหรับการเช็คอินประจำวัน',
    iconColor: colors.safe,
  },
  {
    Icon: MessageSquare,
    title: 'SMS (สำรอง)',
    description: 'ใช้เฉพาะเมื่ออินเทอร์เน็ตขัดข้องระหว่างเหตุฉุกเฉิน',
    iconColor: colors.warning,
  },
  {
    Icon: RefreshCw,
    title: 'รีเฟรชเบื้องหลัง',
    description: 'จำเป็นสำหรับการตรวจสอบความปลอดภัย',
    iconColor: colors.primary,
  },
];

export function PermissionsScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>สิทธิ์ที่จำเป็น</Text>
        <Text style={styles.desc}>เราโปร่งใสเกี่ยวกับสิ่งที่เราใช้และเหตุผล</Text>

        <View style={styles.list}>
          {permissions.map(({ Icon, title, description, iconColor }, index) => (
            <View key={index} style={styles.card}>
              <View style={[styles.iconWrap, { backgroundColor: colors.muted }]}>
                <Icon size={20} color={iconColor} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.ethicsBox}>
          <Text style={styles.ethicsTitle}>การออกแบบเชิงจริยธรรม:</Text>
          <Text style={styles.ethicsDesc}>เราขอเฉพาะสิ่งที่จำเป็นอย่างยิ่ง ความเป็นส่วนตัวและความไว้วางใจของคุณสำคัญต่อเรา</Text>
        </View>

        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('OnboardingBatteryAlert')}>
          <Text style={styles.btnText}>อนุญาตสิทธิ์</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%', paddingTop: 48 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 8, fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, marginBottom: 32, fontFamily: fonts.regular },
  list: { gap: 16, marginBottom: 24 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 20, flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  iconWrap: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardText: { flex: 1, paddingTop: 4 },
  cardTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  cardDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  ethicsBox: { backgroundColor: colors.safe5, borderWidth: 1, borderColor: colors.safe20, borderRadius: 12, padding: 16, marginBottom: 32 },
  ethicsTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  ethicsDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
