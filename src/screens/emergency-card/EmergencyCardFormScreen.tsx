import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Lock } from 'lucide-react-native';
import { useApp } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const BLOOD_TYPES = ['', 'A', 'B', 'AB', 'O', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export function EmergencyCardFormScreen() {
  const navigation = useNavigation<any>();
  const { updateSettings, state } = useApp();

  const [formData, setFormData] = useState({
    fullName: state.settings.emergencyCard?.fullName || '',
    chronicConditions: state.settings.emergencyCard?.chronicConditions || '',
    allergies: state.settings.emergencyCard?.allergies || '',
    medications: state.settings.emergencyCard?.medications || '',
    bloodType: state.settings.emergencyCard?.bloodType || '',
    notes: state.settings.emergencyCard?.notes || '',
  });

  const [showBloodTypePicker, setShowBloodTypePicker] = useState(false);

  const handleSave = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('', 'กรุณากรอกชื่อ-นามสกุล');
      return;
    }
    updateSettings({
      emergencyCard: {
        fullName: formData.fullName,
        chronicConditions: formData.chronicConditions || undefined,
        allergies: formData.allergies || undefined,
        medications: formData.medications || undefined,
        bloodType: formData.bloodType || undefined,
        notes: formData.notes || undefined,
      },
    });
    navigation.navigate('EmergencyCardConfirmation');
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Settings' })}>
          <Text style={styles.cancelText}>ยกเลิก</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>บัตรข้อมูลทางการแพทย์ฉุกเฉิน</Text>
        <View style={styles.spacer} />
      </View>

      <ScrollView contentContainerStyle={styles.form}>
        <View style={styles.formInner}>
          {/* Full Name */}
          <View style={styles.field}>
            <Text style={styles.label}>ชื่อ-นามสกุล <Text style={styles.required}>*</Text></Text>
            <TextInput
              value={formData.fullName}
              onChangeText={v => setFormData(p => ({ ...p, fullName: v }))}
              placeholder="กรอกชื่อ-นามสกุลของคุณ"
              placeholderTextColor={colors.mutedForeground}
              style={styles.input}
            />
          </View>

          {/* Chronic Conditions */}
          <View style={styles.field}>
            <Text style={styles.label}>โรคประจำตัว <Text style={styles.optional}>(ไม่บังคับ)</Text></Text>
            <TextInput
              value={formData.chronicConditions}
              onChangeText={v => setFormData(p => ({ ...p, chronicConditions: v }))}
              placeholder="เช่น เบาหวาน, ความดันโลหิตสูง"
              placeholderTextColor={colors.mutedForeground}
              style={styles.textarea}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Allergies */}
          <View style={styles.field}>
            <Text style={styles.label}>อาการแพ้ <Text style={styles.optional}>(ไม่บังคับ)</Text></Text>
            <TextInput
              value={formData.allergies}
              onChangeText={v => setFormData(p => ({ ...p, allergies: v }))}
              placeholder="เช่น แพ้ยาเพนนิซิลิน, แพ้ถั่ว"
              placeholderTextColor={colors.mutedForeground}
              style={styles.textarea}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Medications */}
          <View style={styles.field}>
            <Text style={styles.label}>ยาที่รับประทานอยู่ <Text style={styles.optional}>(ไม่บังคับ)</Text></Text>
            <TextInput
              value={formData.medications}
              onChangeText={v => setFormData(p => ({ ...p, medications: v }))}
              placeholder="เช่น Metformin 500mg วันละ 2 เม็ด"
              placeholderTextColor={colors.mutedForeground}
              style={styles.textarea}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Blood Type */}
          <View style={styles.field}>
            <Text style={styles.label}>กลุ่มเลือด <Text style={styles.optional}>(ไม่บังคับ)</Text></Text>
            <TouchableOpacity
              style={styles.input}
              onPress={() => setShowBloodTypePicker(!showBloodTypePicker)}
            >
              <Text style={[styles.pickerText, !formData.bloodType && styles.placeholder]}>
                {formData.bloodType || 'เลือกกลุ่มเลือด'}
              </Text>
            </TouchableOpacity>
            {showBloodTypePicker && (
              <View style={styles.picker}>
                {BLOOD_TYPES.map(bt => (
                  <TouchableOpacity
                    key={bt}
                    style={[styles.pickerItem, formData.bloodType === bt && styles.pickerItemSelected]}
                    onPress={() => { setFormData(p => ({ ...p, bloodType: bt })); setShowBloodTypePicker(false); }}
                  >
                    <Text style={[styles.pickerItemText, formData.bloodType === bt && styles.pickerItemTextSelected]}>
                      {bt || 'ไม่ระบุ'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>หมายเหตุเพิ่มเติม <Text style={styles.optional}>(ไม่บังคับ)</Text></Text>
            <TextInput
              value={formData.notes}
              onChangeText={v => setFormData(p => ({ ...p, notes: v }))}
              placeholder="ข้อมูลอื่นๆ ที่สำคัญ"
              placeholderTextColor={colors.mutedForeground}
              style={styles.textarea}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Helper */}
          <View style={styles.helperBox}>
            <Lock size={20} color={colors.primary} style={{ flexShrink: 0, marginTop: 2 }} />
            <Text style={styles.helperText}>
              <Text style={styles.helperBold}>เข้ารหัสและแชร์เฉพาะตอนฉุกเฉิน{'\n'}</Text>
              ข้อมูลนี้จะถูกเข้ารหัสและแชร์เฉพาะเมื่อคุณกด SOS เท่านั้น
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bottom */}
      <View style={styles.footer}>
        <View style={styles.footerInner}>
          <TouchableOpacity style={styles.btn} onPress={handleSave}>
            <Text style={styles.btnText}>บันทึกอย่างปลอดภัย</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingVertical: 16, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border, paddingTop: 56 },
  cancelText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  headerTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.regular },
  spacer: { width: 48 },
  form: { padding: 24 },
  formInner: { maxWidth: 448, alignSelf: 'center', width: '100%', gap: 20 },
  field: { gap: 8 },
  label: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  required: { color: colors.destructive },
  optional: { fontSize: 12, color: colors.mutedForeground },
  input: { height: 48, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: colors.foreground, fontFamily: fonts.regular, justifyContent: 'center' },
  pickerText: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  placeholder: { color: colors.mutedForeground },
  picker: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, overflow: 'hidden' },
  pickerItem: { paddingHorizontal: 16, paddingVertical: 12 },
  pickerItemSelected: { backgroundColor: colors.primary10 },
  pickerItemText: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  pickerItemTextSelected: { color: colors.primary, fontFamily: fonts.medium },
  textarea: { minHeight: 96, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  helperBox: { flexDirection: 'row', gap: 12, backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 12, padding: 16 },
  helperText: { flex: 1, fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  helperBold: { color: colors.foreground, fontFamily: fonts.medium },
  footer: { borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card, paddingHorizontal: 24, paddingVertical: 16 },
  footerInner: { maxWidth: 448, alignSelf: 'center', width: '100%' },
  btn: { height: 56, backgroundColor: colors.primary, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  btnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
});
