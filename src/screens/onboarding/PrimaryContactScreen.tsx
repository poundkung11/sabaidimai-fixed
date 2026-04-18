import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserPlus, Phone } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

export function PrimaryContactScreen() {
  const navigation = useNavigation<any>();
  const { updateSettings } = useApp();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const isValid = name.trim() && phone.trim();

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>เพิ่มผู้ติดต่อหลัก</Text>
        <Text style={styles.desc}>บุคคลนี้จะได้รับการแจ้งเตือนเฉพาะเมื่อดูเหมือนจะมีอะไรผิดปกติ</Text>

        <View style={styles.field}>
          <View style={styles.fieldLabel}>
            <UserPlus size={16} color={colors.mutedForeground} />
            <Text style={styles.fieldLabelText}>ชื่อ</Text>
          </View>
          <TextInput value={name} onChangeText={setName} placeholder="ใส่ชื่อ" placeholderTextColor={colors.mutedForeground} style={styles.input} />
        </View>

        <View style={styles.field}>
          <View style={styles.fieldLabel}>
            <Phone size={16} color={colors.mutedForeground} />
            <Text style={styles.fieldLabelText}>เบอร์โทรศัพท์</Text>
          </View>
          <TextInput value={phone} onChangeText={setPhone} placeholder="ใส่เบอร์โทรศัพท์" placeholderTextColor={colors.mutedForeground} keyboardType="phone-pad" style={styles.input} />
        </View>

        <View style={styles.privacyBox}>
          <Text style={styles.privacyTitle}>สัญญาความเป็นส่วนตัว:</Text>
          <Text style={styles.privacyDesc}>ผู้ติดต่อของคุณจะได้รับการแจ้งเตือนเฉพาะเมื่อคุณไม่เช็คอินภายในช่วงผ่อนผัน ไม่มีการติดตาม ไม่มีประวัติ เพียงแค่ตาข่ายความปลอดภัยที่นุ่มนวล</Text>
        </View>

        <TouchableOpacity style={[styles.btn, !isValid && styles.btnDisabled]} disabled={!isValid} onPress={() => { updateSettings({ primaryContact: { name, phone, emergencyRef: '191' } }); navigation.navigate('OnboardingPermissions'); }}>
          <Text style={styles.btnText}>ดำเนินการต่อ</Text>
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
  field: { marginBottom: 20 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  fieldLabelText: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  input: { height: 48, backgroundColor: colors.inputBackground, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  privacyBox: { backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 12, padding: 16, marginBottom: 32 },
  privacyTitle: { fontSize: 14, color: colors.foreground, marginBottom: 6, fontFamily: fonts.regular },
  privacyDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontFamily: fonts.regular },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnDisabled: { opacity: 0.5 },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
