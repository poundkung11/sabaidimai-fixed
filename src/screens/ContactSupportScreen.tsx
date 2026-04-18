import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Phone, MessageCircle, Mail, AlertCircle } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const supportOptions = [
  { Icon: Phone, title: 'โทรหาทีมสนับสนุน', desc: 'ติดต่อโดยตรง จันทร์-ศุกร์ 9:00-18:00', onPress: () => Alert.alert('', 'กำลังโทรหา 02-XXX-XXXX') },
  { Icon: MessageCircle, title: 'แชทกับทีมสนับสนุน', desc: 'รับคำตอบทันที ตอบภายใน 5 นาที', screen: 'SupportChat' },
  { Icon: Mail, title: 'ส่งอีเมล', desc: 'ส่งคำถามหรือคำแนะนำ ตอบภายใน 24 ชม.', onPress: () => Alert.alert('', 'เปิดอีเมล') },
];

const emergencyNumbers = [
  { number: '191', name: 'ตำรวจ', desc: 'แจ้งเหตุฉุกเฉิน อาชญากรรม', icon: '🚓' },
  { number: '1669', name: 'การแพทย์ฉุกเฉิน', desc: 'รถพยาบาล บริการฉุกเฉินทางการแพทย์', icon: '🚑' },
  { number: '199', name: 'ดับเพลิง', desc: 'แจ้งเหตุเพลิงไหม้', icon: '🚒' },
];

export function ContactSupportScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })} style={styles.headerLeft}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ติดต่อเจ้าหน้าที่</Text>
          <Text style={styles.headerSubtitle}>เราพร้อมช่วยเหลือคุณ</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        <View style={styles.warningBox}>
          <AlertCircle size={20} color={colors.warning} style={{ marginTop: 2 }} />
          <View style={styles.warningText}>
            <Text style={styles.warningTitle}>หากเป็นเหตุฉุกเฉินร้ายแรง</Text>
            <Text style={styles.warningDesc}>กรุณาใช้ปุ่ม SOS ในหน้าหลัก หรือโทรหาเบอร์ฉุกเฉินด้านล่างทันที</Text>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ติดต่อทีมสนับสนุน</Text>
        <View style={styles.optionsList}>
          {supportOptions.map(({ Icon, title, desc, onPress, screen }: any, i) => (
            <TouchableOpacity key={i} style={styles.optionCard} onPress={onPress || (() => navigation.navigate(screen))}>
              <View style={styles.optionIcon}><Icon size={24} color={colors.primary} /></View>
              <View style={styles.optionText}>
                <Text style={styles.optionTitle}>{title}</Text>
                <Text style={styles.optionDesc}>{desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>เบอร์ฉุกเฉิน</Text>
        <View style={styles.optionsList}>
          {emergencyNumbers.map(({ number, name, desc, icon }, i) => (
            <TouchableOpacity key={i} style={styles.emergencyCard} onPress={() => Alert.alert(`โทรหา ${number}?`, '', [{ text: 'ยกเลิก' }, { text: 'โทร' }])}>
              <View style={styles.emergencyIcon}><Text style={styles.emergencyEmoji}>{icon}</Text></View>
              <View style={styles.optionText}>
                <View style={styles.emergencyHeader}>
                  <Text style={styles.emergencyNumber}>{number}</Text>
                  <Text style={styles.emergencyDot}>•</Text>
                  <Text style={styles.emergencyName}>{name}</Text>
                </View>
                <Text style={styles.optionDesc}>{desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.faqCard}>
          <View>
            <Text style={styles.faqTitle}>คำถามที่พบบ่อย (FAQ)</Text>
            <Text style={styles.faqDesc}>ค้นหาคำตอบสำหรับคำถามทั่วไป</Text>
          </View>
          <Text style={styles.faqEmoji}>❓</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card, gap: 12 },
  headerLeft: {},
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.regular },
  headerSubtitle: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  scroll: { flex: 1 },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%' },
  warningBox: { backgroundColor: colors.warning10, borderWidth: 1, borderColor: colors.warning20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 24 },
  warningText: { flex: 1 },
  warningTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  warningDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontFamily: fonts.regular },
  sectionLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: 12, fontFamily: fonts.regular },
  optionsList: { gap: 12, marginBottom: 24 },
  optionCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  optionIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  optionText: { flex: 1 },
  optionTitle: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium, marginBottom: 4 },
  optionDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  emergencyCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.destructive20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  emergencyIcon: { width: 48, height: 48, borderRadius: 16, backgroundColor: colors.destructive10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  emergencyEmoji: { fontSize: 22 },
  emergencyHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 },
  emergencyNumber: { fontSize: 18, color: colors.destructive, fontFamily: fonts.medium },
  emergencyDot: { fontSize: 12, color: colors.mutedForeground },
  emergencyName: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  faqCard: { backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 },
  faqTitle: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium, marginBottom: 4 },
  faqDesc: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  faqEmoji: { fontSize: 24 },
});
