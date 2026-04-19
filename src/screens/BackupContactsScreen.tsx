import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Phone, UserPlus, X } from 'lucide-react-native';
import { Contact, useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

function createBackupContact(name: string, phone: string): Contact {
  return {
    name,
    phone,
    emergencyRef: `manual-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  };
}

function initials(name: string) {
  const words = name.trim().split(' ').filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  if (words.length === 1) {
    return words[0].slice(0, 2).toUpperCase();
  }

  return 'BC';
}

export function BackupContactsScreen() {
  const navigation = useNavigation<any>();
  const { state, updateSettings } = useApp();
  const backupContacts = state.settings.backupContacts ?? [];
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const trimmedName = name.trim();
  const trimmedPhone = phone.trim();
  const canAdd = trimmedName.length > 0 && trimmedPhone.length > 0;

  const handleAdd = () => {
    if (!canAdd) {
      return;
    }

    const isDuplicate = backupContacts.some(
      (contact) =>
        contact.name.trim().toLowerCase() === trimmedName.toLowerCase() &&
        contact.phone.trim() === trimmedPhone,
    );

    if (isDuplicate) {
      Alert.alert('มีผู้ติดต่อรายนี้แล้ว', 'ตรวจสอบชื่อหรือเบอร์โทรอีกครั้ง');
      return;
    }

    updateSettings({
      backupContacts: [...backupContacts, createBackupContact(trimmedName, trimmedPhone)],
    });

    setName('');
    setPhone('');

    Alert.alert('เพิ่มผู้ติดต่อสำรองแล้ว', `${trimmedName} จะได้รับการแจ้งเตือนเมื่อจำเป็น`);
  };

  const handleRemove = (contact: Contact) => {
    updateSettings({
      backupContacts: backupContacts.filter((item) => item.emergencyRef !== contact.emergencyRef),
    });
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          <Text style={styles.title}>ผู้ติดต่อสำรอง</Text>
          <Text style={styles.subtitle}>กรอกชื่อและเบอร์โทรได้เลย ไม่ต้องเพิ่มเพื่อนก่อน</Text>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>เพิ่มผู้ติดต่อสำรอง</Text>
          <Text style={styles.formDesc}>
            คนในรายการนี้จะถูกติดต่อเมื่อผู้ติดต่อหลักตอบกลับไม่ได้
          </Text>

          <View style={styles.field}>
            <View style={styles.fieldLabel}>
              <UserPlus size={16} color={colors.mutedForeground} />
              <Text style={styles.fieldLabelText}>ชื่อ</Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="ใส่ชื่อ"
              placeholderTextColor={colors.mutedForeground}
              style={styles.input}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <View style={styles.fieldLabel}>
              <Phone size={16} color={colors.mutedForeground} />
              <Text style={styles.fieldLabelText}>เบอร์โทรศัพท์</Text>
            </View>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="ใส่เบอร์โทรศัพท์"
              placeholderTextColor={colors.mutedForeground}
              style={styles.input}
              keyboardType="phone-pad"
            />
          </View>

          <TouchableOpacity
            style={[styles.addBtn, !canAdd && styles.addBtnDisabled]}
            disabled={!canAdd}
            onPress={handleAdd}
          >
            <Text style={styles.addBtnText}>เพิ่มรายชื่อ</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>รายการที่เพิ่มไว้แล้ว ({backupContacts.length})</Text>

          {backupContacts.length === 0 ? (
            <View style={styles.emptyCard}>
              <View style={styles.emptyIcon}>
                <UserPlus size={28} color={colors.mutedForeground} />
              </View>
              <Text style={styles.emptyTitle}>ยังไม่มีผู้ติดต่อสำรอง</Text>
              <Text style={styles.emptyDesc}>
                เพิ่มชื่อและเบอร์โทรของคนที่คุณอยากให้ระบบติดต่อไว้ได้เลย
              </Text>
            </View>
          ) : (
            backupContacts.map((contact) => (
              <View key={contact.emergencyRef} style={styles.contactCard}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{initials(contact.name)}</Text>
                </View>

                <View style={styles.contactInfo}>
                  <Text style={styles.contactName}>{contact.name}</Text>
                  <View style={styles.phoneRow}>
                    <Phone size={14} color={colors.mutedForeground} />
                    <Text style={styles.contactPhone}>
                      {contact.phone || 'ไม่มีเบอร์โทร'}
                    </Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => handleRemove(contact)}
                >
                  <X size={16} color={colors.destructive} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>ข้อมูลนี้ใช้ยังไง</Text>
          <Text style={styles.infoText}>ระบบจะติดต่อผู้ติดต่อหลักก่อนเสมอ</Text>
          <Text style={styles.infoText}>ผู้ติดต่อสำรองจะถูกใช้เมื่อจำเป็นเท่านั้น</Text>
          <Text style={styles.infoText}>ไม่มีการลิงก์ไปเพิ่มเพื่อนก่อนใช้งาน</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 18, color: colors.foreground, fontFamily: fonts.semiBold },
  subtitle: {
    fontSize: 12,
    color: colors.mutedForeground,
    marginTop: 2,
    fontFamily: fonts.regular,
  },
  scroll: { flex: 1 },
  inner: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    gap: 20,
  },
  formCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
  },
  formTitle: {
    fontSize: 16,
    color: colors.foreground,
    fontFamily: fonts.medium,
  },
  formDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 18,
    fontFamily: fonts.regular,
  },
  field: { marginBottom: 16 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  fieldLabelText: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  input: {
    height: 48,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.regular,
  },
  addBtn: {
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.45 },
  addBtnText: { fontSize: 14, color: colors.white, fontFamily: fonts.medium },
  section: { gap: 10 },
  sectionTitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.medium },
  emptyCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 18,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 15,
    color: colors.foreground,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  emptyDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  contactCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primary10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: fonts.semiBold,
  },
  contactInfo: { flex: 1, gap: 6 },
  contactName: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  phoneRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  contactPhone: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  removeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.destructive10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoBox: {
    backgroundColor: colors.primary5,
    borderWidth: 1,
    borderColor: colors.primary20,
    borderRadius: 16,
    padding: 16,
    gap: 8,
  },
  infoTitle: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  infoText: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
});
