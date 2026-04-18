import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, Users, MapPin, Clock, Lock } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function HelpOnTheWayScreen() {
  const navigation = useNavigation<any>();
  const { state } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('SOSActive'), 10000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.iconCircle}>
          <CheckCircle2 size={48} color={colors.safe} />
        </View>
        <Text style={styles.title}>ความช่วยเหลือกำลังมา</Text>
        <Text style={styles.desc}>ข้อความได้ถูกส่งไปยังผู้ติดต่อฉุกเฉินของคุณแล้ว</Text>

        <View style={styles.cards}>
          {[
            { Icon: Users, bg: colors.safe10, color: colors.safe, title: 'ผู้ติดต่อได้รับการแจ้งเตือน', desc: 'ข้อความส่งถึง 3 คน' },
            { Icon: MapPin, bg: colors.primary10, color: colors.primary, title: 'ตำแหน่งที่ตั้งถูกแชร์', desc: 'กำลังอัปเดตทุก 30 วินาที' },
            { Icon: Clock, bg: colors.warning10, color: colors.warning, title: 'โหมดฉุกเฉินเปิดใช้งาน', desc: 'ระบบกำลังตรวจสอบอย่างต่อเนื่อง' },
          ].map(({ Icon, bg, color, title, desc }, i) => (
            <View key={i} style={styles.statusCard}>
              <View style={[styles.cardIcon, { backgroundColor: bg }]}>
                <Icon size={24} color={color} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{desc}</Text>
              </View>
            </View>
          ))}

          {state.settings.emergencyCard && (
            <View style={[styles.statusCard, { backgroundColor: colors.primary5, borderColor: colors.primary20 }]}>
              <View style={[styles.cardIcon, { backgroundColor: colors.primary10 }]}>
                <Lock size={24} color={colors.primary} />
              </View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>ข้อมูลทางการแพทย์ถูกแชร์</Text>
                <Text style={styles.cardDesc}>ลิงก์ปลอดภัยส่งไปแล้ว (หมดอายุใน 24 ชม.)</Text>
              </View>
            </View>
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>กำลังเปลี่ยนไปหน้าโหมดฉุกเฉิน...</Text>
        </View>

        <TouchableOpacity style={styles.navBtn} onPress={() => navigation.replace('SOSActive')}>
          <Text style={styles.navBtnText}>ไปที่หน้าโหมดฉุกเฉิน</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 24, alignItems: 'center', maxWidth: 448, alignSelf: 'center', width: '100%' },
  iconCircle: { width: 96, height: 96, borderRadius: 48, backgroundColor: colors.safe10, alignItems: 'center', justifyContent: 'center', marginBottom: 32, marginTop: 32 },
  title: { fontSize: 28, color: colors.foreground, marginBottom: 16, textAlign: 'center', fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', marginBottom: 48, lineHeight: 22, fontFamily: fonts.regular },
  cards: { width: '100%', gap: 16, marginBottom: 32 },
  statusCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 16 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardText: { flex: 1 },
  cardTitle: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium, marginBottom: 4 },
  cardDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  infoBox: { width: '100%', backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 12, padding: 16, marginBottom: 24 },
  infoText: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
  navBtn: { width: '100%', height: 56, borderRadius: 28, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 16, color: colors.foreground, fontFamily: fonts.regular },
});
