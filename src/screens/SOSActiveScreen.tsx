import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CheckCircle2, Phone, MapPin } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function SOSActiveScreen() {
  const navigation = useNavigation<any>();
  const { state, deactivateSOS } = useApp();

  const notifications = [
    { Icon: CheckCircle2, color: colors.safe, text: `${state.settings.primaryContact?.name || 'ผู้ติดต่อหลัก'} รับทราบการแจ้งเตือนของคุณแล้ว`, time: 'เดี๋ยวนี้' },
    { Icon: MapPin, color: colors.primary, text: 'ส่งตำแหน่งที่ตั้งให้ผู้ติดต่อฉุกเฉินแล้ว', time: '30 วินาทีที่แล้ว' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Phone size={40} color={colors.destructive} />
          </View>
          <Text style={styles.title}>ความช่วยเหลือกำลังมา</Text>
          <Text style={styles.desc}>แจ้งผู้ติดต่อฉุกเฉินของคุณแล้ว</Text>
        </View>

        <View style={styles.notifications}>
          {notifications.map(({ Icon, color, text, time }, i) => (
            <View key={i} style={styles.notifCard}>
              <Icon size={20} color={color} style={{ marginTop: 2 }} />
              <View style={styles.notifText}>
                <Text style={styles.notifTitle}>{text}</Text>
                <Text style={styles.notifTime}>{time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>สิ่งที่กำลังเกิดขึ้น:</Text>
          {['แจ้งเตือนผู้ติดต่อหลักของคุณแล้ว', 'พวกเขาสามารถเห็นตำแหน่งที่ตั้งปัจจุบันของคุณ', 'ความช่วยเหลือจะมาถึงเร็วๆ นี้'].map((text, i) => (
            <View key={i} style={styles.infoItem}>
              <View style={styles.bullet} />
              <Text style={styles.infoItemText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.resolveBtn} onPress={() => { deactivateSOS(); navigation.navigate('MainTabs'); }}>
          <Text style={styles.resolveBtnText}>ฉันปลอดภัยแล้ว</Text>
        </TouchableOpacity>
        <Text style={styles.resolveHint}>สิ่งนี้จะแจ้งผู้ติดต่อของคุณว่าคุณสบายดี</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%' },
  header: { paddingTop: 32, paddingBottom: 32, alignItems: 'center' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.destructive10, alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 12, textAlign: 'center', fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
  notifications: { gap: 12, marginBottom: 24 },
  notifCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  notifText: { flex: 1 },
  notifTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  notifTime: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  infoBox: { backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 12, padding: 16, marginBottom: 24 },
  infoTitle: { fontSize: 14, color: colors.foreground, marginBottom: 12, fontFamily: fonts.regular },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6 },
  infoItemText: { fontSize: 12, color: colors.mutedForeground, flex: 1, lineHeight: 18, fontFamily: fonts.regular },
  footer: { padding: 24, paddingBottom: 40, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.background },
  resolveBtn: { height: 56, backgroundColor: colors.safe, borderRadius: 28, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  resolveBtnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
  resolveHint: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
});
