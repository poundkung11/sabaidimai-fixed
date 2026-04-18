import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Clock, Timer, User, Battery, CheckCircle } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

export function SummaryScreen() {
  const navigation = useNavigation<any>();
  const { state, completeOnboarding } = useApp();

  const items = [
    { Icon: Clock, label: 'เวลาเช็คอิน', value: state.settings.checkInTime },
    { Icon: Timer, label: 'ช่วงผ่อนผัน', value: `${state.settings.gracePeriod} นาที` },
    { Icon: User, label: 'ผู้ติดต่อหลัก', value: state.settings.primaryContact?.name || 'ยังไม่ได้ตั้งค่า' },
    { Icon: Battery, label: 'การแจ้งเตือนแบตเตอรี่', value: state.settings.batteryAlert ? `${state.settings.batteryAlert}%` : 'ปิด' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <View style={styles.iconWrap}>
          <CheckCircle size={32} color={colors.safe} />
        </View>
        <Text style={styles.title}>คุณพร้อมแล้ว!</Text>
        <Text style={styles.desc}>นี่คือสรุปการตั้งค่าความปลอดภัยของคุณ</Text>

        <View style={styles.summaryCard}>
          {items.map(({ Icon, label, value }, index) => (
            <View key={index} style={[styles.summaryRow, index !== items.length - 1 && styles.summaryRowBorder]}>
              <View style={styles.summaryLeft}>
                <Icon size={20} color={colors.mutedForeground} />
                <Text style={styles.summaryLabel}>{label}</Text>
              </View>
              <Text style={styles.summaryValue}>{value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.nextBox}>
          <Text style={styles.nextTitle}>จะเกิดอะไรขึ้นต่อไป?</Text>
          <View style={styles.bulletList}>
            {[
              'คุณจะได้รับการแจ้งเตือนอย่างนุ่มนวลในเวลาเช็คอินของคุณ',
              'เพียงแตะ "ฉันสบายดี" เพื่อแจ้งให้เรารู้ว่าคุณปลอดภัย',
              'ถ้าคุณไม่ตอบกลับ เราจะรอช่วงผ่อนผันก่อนแจ้งใคร',
              'คุณสามารถหยุดการเช็คอินได้ทุกเมื่อถ้าจำเป็น',
            ].map((text, i) => (
              <View key={i} style={styles.bullet}>
                <View style={styles.bulletDot} />
                <Text style={styles.bulletText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={styles.btn}
          onPress={() => { completeOnboarding(); navigation.reset({ index: 0, routes: [{ name: 'MainTabs' as never }] }); }}
        >
          <Text style={styles.btnText}>เริ่มใช้ Sabaai-Dii-Mai</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%', paddingTop: 48 },
  iconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.safe10, alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginBottom: 16 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 8, textAlign: 'center', fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, marginBottom: 32, textAlign: 'center', fontFamily: fonts.regular },
  summaryCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, overflow: 'hidden', marginBottom: 24 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  summaryRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  summaryLabel: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  summaryValue: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  nextBox: { backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 16, padding: 20, marginBottom: 32 },
  nextTitle: { fontSize: 14, color: colors.foreground, marginBottom: 12, fontFamily: fonts.regular },
  bulletList: { gap: 8 },
  bullet: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  bulletDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6, flexShrink: 0 },
  bulletText: { flex: 1, fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
