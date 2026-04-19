import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Phone, UserPlus } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function CircleScreen() {
  const navigation = useNavigation<any>();
  const { state } = useApp();
  const backupContacts = state.settings.backupContacts ?? [];

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        <View style={styles.header}>
          <Text style={styles.title}>เบอร์ฉุกเฉินของคุณ</Text>
          <Text style={styles.subtitle}>ผู้คนที่ห่วงใยคุณ</Text>
        </View>

        <Text style={styles.sectionLabel}>ผู้ติดต่อหลัก</Text>
        <View style={styles.contactCard}>
          <View style={styles.contactAvatar}>
            <Text style={styles.contactAvatarText}>{state.settings.primaryContact?.name.charAt(0) || 'P'}</Text>
          </View>
          <View style={styles.contactInfo}>
            <Text style={styles.contactName}>{state.settings.primaryContact?.name || 'ยังไม่ได้ตั้งค่า'}</Text>
            <View style={styles.phoneRow}>
              <Phone size={14} color={colors.mutedForeground} />
              <Text style={styles.phoneText}>{state.settings.primaryContact?.phone || 'ไม่มีเบอร์โทร'}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>ผู้ติดต่อสำรอง</Text>
        {backupContacts.map((contact) => (
          <View key={contact.emergencyRef} style={styles.backupCard}>
            <View style={styles.contactAvatar}>
              <Text style={styles.contactAvatarText}>{contact.name.charAt(0) || 'B'}</Text>
            </View>
            <View style={styles.contactInfo}>
              <Text style={styles.contactName}>{contact.name}</Text>
              <View style={styles.phoneRow}>
                <Phone size={14} color={colors.mutedForeground} />
                <Text style={styles.phoneText}>{contact.phone || 'ไม่มีเบอร์โทร'}</Text>
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.addCard} onPress={() => navigation.navigate('BackupContacts')}>
          <View style={styles.addIcon}>
            <UserPlus size={24} color={colors.mutedForeground} />
          </View>
          <Text style={styles.addTitle}>
            {backupContacts.length > 0 ? 'จัดการผู้ติดต่อสำรอง' : 'เพิ่มผู้ติดต่อสำรอง'}
          </Text>
          <Text style={styles.addDesc}>
            {backupContacts.length > 0
              ? 'เลือกเพิ่มหรือลบรายชื่อได้จากหน้าจัดการ'
              : 'พวกเขาจะได้รับการแจ้งเตือนถ้าผู้ติดต่อหลักตอบกลับไม่ได้'}
          </Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>วิธีการทำงาน:</Text>
          {[
            'ผู้ติดต่อหลักจะได้รับการแจ้งเตือนก่อนถ้าคุณไม่เช็คอิน',
            'ผู้ติดต่อสำรองจะถูกติดต่อเฉพาะเมื่อจำเป็น',
            'ไม่มีใครสามารถติดตามคุณได้ นี่เป็นการทำงานตามเหตุการณ์เท่านั้น',
          ].map((text, index) => (
            <View key={index} style={styles.infoItem}>
              <View style={styles.bullet} />
              <Text style={styles.infoItemText}>{text}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%' },
  header: { paddingTop: 16, paddingBottom: 32 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 8, fontFamily: fonts.regular },
  subtitle: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  sectionLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: 12, fontFamily: fonts.regular },
  contactCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 24,
  },
  backupCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
    marginBottom: 12,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactAvatarText: { fontSize: 18, color: colors.primary, fontFamily: fonts.regular },
  contactInfo: { flex: 1 },
  contactName: { fontSize: 16, color: colors.foreground, marginBottom: 6, fontFamily: fonts.regular },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  phoneText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  addCard: {
    backgroundColor: colors.card,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.border,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
  },
  addIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addTitle: { fontSize: 14, color: colors.foreground, marginBottom: 4, textAlign: 'center', fontFamily: fonts.regular },
  addDesc: { fontSize: 12, color: colors.mutedForeground, textAlign: 'center', lineHeight: 18, fontFamily: fonts.regular },
  infoBox: {
    backgroundColor: colors.primary5,
    borderWidth: 1,
    borderColor: colors.primary20,
    borderRadius: 12,
    padding: 16,
  },
  infoTitle: { fontSize: 14, color: colors.foreground, marginBottom: 12, fontFamily: fonts.regular },
  infoItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 8 },
  bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.primary, marginTop: 6, flexShrink: 0 },
  infoItemText: { fontSize: 12, color: colors.mutedForeground, flex: 1, lineHeight: 18, fontFamily: fonts.regular },
});
