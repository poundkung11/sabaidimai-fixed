import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Phone, Save, User, Users } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { createMobileUser, getUser, updateMobileUser } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function AccountProfileScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentUserId, login } = useApp();
  const isEditing = route.params?.mode === 'edit';

  const [displayName, setDisplayName] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      if (!isEditing || !currentUserId) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        const user = await getUser(currentUserId);
        if (!isMounted) return;
        setDisplayName(user.display_name || '');
        setPhone(user.phone || '');
      } catch (error: any) {
        if (!isMounted) return;
        Alert.alert('โหลดข้อมูลไม่สำเร็จ', error?.message || 'กรุณาลองใหม่อีกครั้ง');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadProfile();

    return () => {
      isMounted = false;
    };
  }, [currentUserId, isEditing]);

  const title = useMemo(
    () => (isEditing ? 'ข้อมูลผู้ใช้' : 'เริ่มต้นด้วยข้อมูลผู้ใช้'),
    [isEditing]
  );

  const description = useMemo(
    () =>
      isEditing
        ? 'อัปเดตชื่อและเบอร์โทรของคุณได้ตลอด เพื่อให้เพื่อนค้นหาเจอได้ง่ายขึ้น'
        : 'ใส่ชื่อที่เพื่อนจะใช้ค้นหาคุณ และเพิ่มเบอร์โทรเพื่อช่วยให้ค้นหาเจอได้ง่ายขึ้น',
    [isEditing]
  );

  const trimmedName = displayName.trim();
  const trimmedPhone = phone.trim();
  const canSubmit = trimmedName.length > 0 && !loading && !saving;

  const handleSubmit = async () => {
    if (!trimmedName) {
      Alert.alert('กรอกชื่อก่อน', 'โปรดใส่ชื่อผู้ใช้ก่อนบันทึก');
      return;
    }

    setSaving(true);

    try {
      if (isEditing && !currentUserId) {
        Alert.alert('ไม่พบบัญชีผู้ใช้', 'กรุณาเข้าสู่ระบบใหม่อีกครั้ง');
        return;
      }

      if (isEditing && currentUserId) {
        await updateMobileUser(currentUserId, {
          displayName: trimmedName,
          phone: trimmedPhone || undefined,
        });
        Alert.alert('บันทึกแล้ว', 'อัปเดตข้อมูลผู้ใช้เรียบร้อย');
        navigation.goBack();
        return;
      }

      const user = await createMobileUser({
        displayName: trimmedName,
        phone: trimmedPhone || undefined,
      });

      await login(user.id);
    } catch (error: any) {
      Alert.alert(
        isEditing ? 'บันทึกข้อมูลไม่สำเร็จ' : 'สร้างผู้ใช้ไม่สำเร็จ',
        error?.message || 'กรุณาลองใหม่อีกครั้ง'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {navigation.canGoBack() ? (
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <ArrowLeft size={18} color={colors.foreground} />
            <Text style={styles.backText}>ย้อนกลับ</Text>
          </TouchableOpacity>
        ) : null}

        <View style={styles.hero}>
          <View style={styles.heroIcon}>
            <User size={28} color={colors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>

        {loading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator size="small" color={colors.primary} />
            <Text style={styles.loadingText}>กำลังโหลดข้อมูลผู้ใช้...</Text>
          </View>
        ) : (
          <>
            <View style={styles.formCard}>
              <View style={styles.field}>
                <View style={styles.fieldLabel}>
                  <User size={16} color={colors.mutedForeground} />
                  <Text style={styles.fieldLabelText}>ชื่อผู้ใช้</Text>
                </View>
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="เช่น สมหญิง ใจดี"
                  placeholderTextColor={colors.mutedForeground}
                  style={styles.input}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
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
                  placeholder="เช่น 0812345678"
                  placeholderTextColor={colors.mutedForeground}
                  keyboardType="phone-pad"
                  style={styles.input}
                />
                <Text style={styles.fieldHint}>ไม่บังคับ แต่แนะนำให้ใส่เพื่อช่วยให้เพื่อนค้นหาเจอได้ง่ายขึ้น</Text>
              </View>
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoTitle}>ข้อมูลนี้ใช้ทำอะไร</Text>
              <Text style={styles.infoText}>
                ชื่อและเบอร์โทรนี้จะใช้แสดงในระบบเพื่อน เพื่อให้ผู้อื่นค้นหาคุณจากหน้าค้นหาเพื่อนได้ตรงขึ้น
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.primaryBtn, !canSubmit && styles.primaryBtnDisabled]}
              onPress={() => void handleSubmit()}
              disabled={!canSubmit}
            >
              {saving ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <>
                  <Save size={16} color={colors.white} />
                  <Text style={styles.primaryBtnText}>
                    {isEditing ? 'บันทึกข้อมูลผู้ใช้' : 'สร้างผู้ใช้และเริ่มต้น'}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {!isEditing ? (
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.navigate('Demo')}>
                <Users size={16} color={colors.foreground} />
                <Text style={styles.secondaryBtnText}>เลือกบัญชีที่มีอยู่แล้ว</Text>
              </TouchableOpacity>
            ) : null}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 24, maxWidth: 460, alignSelf: 'center', width: '100%', paddingTop: 48, paddingBottom: 40 },
  backBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 20,
  },
  backText: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  hero: { alignItems: 'center', marginBottom: 28 },
  heroIcon: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.primary10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    color: colors.foreground,
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: fonts.semiBold,
  },
  desc: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: fonts.regular,
  },
  loadingCard: {
    backgroundColor: colors.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 24,
    alignItems: 'center',
    gap: 10,
  },
  loadingText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  formCard: {
    backgroundColor: colors.card,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 18,
  },
  field: { marginBottom: 16 },
  fieldLabel: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  fieldLabelText: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  input: {
    height: 50,
    backgroundColor: colors.inputBackground,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: colors.foreground,
    fontFamily: fonts.input,
  },
  fieldHint: {
    marginTop: 8,
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  infoBox: {
    backgroundColor: colors.primary5,
    borderWidth: 1,
    borderColor: colors.primary20,
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 6,
    fontFamily: fonts.medium,
  },
  infoText: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },
  primaryBtn: {
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  primaryBtnDisabled: { opacity: 0.5 },
  primaryBtnText: { color: colors.white, fontSize: 16, fontFamily: fonts.medium },
  secondaryBtn: {
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  secondaryBtnText: { color: colors.foreground, fontSize: 15, fontFamily: fonts.medium },
});
