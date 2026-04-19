import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Modal, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import {
  Clock,
  Timer,
  User,
  Battery,
  PauseCircle,
  Shield,
  Info,
  Play,
  Lock,
  HelpCircle,
  LogOut,
} from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function SettingsScreen() {
  const navigation = useNavigation<any>();
  const { state, extendedPause, resumeFromPause, logout } = useApp();
  const [pauseModalVisible, setPauseModalVisible] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const settingsItems = [
    {
      Icon: Clock,
      label: 'เวลาเช็คอิน',
      value: state.settings.checkInTime,
      action: () => navigation.navigate('QuickAdjust'),
    },
    {
      Icon: Timer,
      label: 'ช่วงผ่อนผัน',
      value: `${state.settings.gracePeriod} นาที`,
      action: () => navigation.navigate('QuickAdjust'),
    },
    {
      Icon: User,
      label: 'ผู้ติดต่อหลัก',
      value: state.settings.primaryContact?.name || 'ยังไม่ได้ตั้งค่า',
      action: () => {},
    },
    {
      Icon: Battery,
      label: 'การแจ้งเตือนแบตเตอรี่',
      value: state.settings.batteryAlert ? `${state.settings.batteryAlert}%` : 'ปิด',
      action: () => {},
    },
  ];

  const handleLogout = () => {
    Alert.alert(
      'ออกจากระบบ',
      'คุณต้องการออกจากระบบใช่หรือไม่',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'ออกจากระบบ',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoggingOut(true);
              await logout();
            } catch (e: any) {
              Alert.alert('ออกจากระบบไม่สำเร็จ', e?.message || 'กรุณาลองใหม่อีกครั้ง');
            } finally {
              setIsLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        <Text style={styles.title}>การตั้งค่า</Text>

        <Text style={styles.sectionLabel}>การตั้งค่าด่วน</Text>
        <View style={styles.card}>
          {settingsItems.map(({ Icon, label, value, action }, i) => (
            <TouchableOpacity
              key={i}
              onPress={action}
              style={[styles.row, i !== settingsItems.length - 1 && styles.rowBorder]}
            >
              <View style={styles.rowLeft}>
                <Icon size={20} color={colors.mutedForeground} />
                <Text style={styles.rowLabel}>{label}</Text>
              </View>
              <Text style={styles.rowValue}>{value}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>ข้อมูลฉุกเฉิน</Text>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('EmergencyCardIntro')}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Lock size={20} color={colors.primary} />
              <View>
                <Text style={styles.rowLabel}>บัตรข้อมูลทางการแพทย์ฉุกเฉิน</Text>
                <Text style={styles.rowSubLabel}>
                  {state.settings.emergencyCard ? 'มีข้อมูลแล้ว' : 'เพิ่มข้อมูลทางการแพทย์'}
                </Text>
              </View>
            </View>
            {state.settings.emergencyCard && <View style={styles.dot} />}
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>หยุดชั่วคราวนานขึ้น</Text>
        {state.userStatus === 'paused' && state.pausedUntil && (
          <TouchableOpacity
            style={styles.resumeCard}
            onPress={() => {
              resumeFromPause();
              navigation.navigate('MainTabs');
            }}
          >
            <View style={styles.row}>
              <View style={styles.rowLeft}>
                <Play size={20} color={colors.white} />
                <View>
                  <Text style={styles.resumeTitle}>เลิกหยุดชั่วคราว</Text>
                  <Text style={styles.resumeDesc}>กลับมาใช้งานตามปกติ</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.card} onPress={() => setPauseModalVisible(true)}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <PauseCircle size={20} color={colors.warning} />
              <View>
                <Text style={styles.rowLabel}>หยุดหลายวัน</Text>
                <Text style={styles.rowSubLabel}>ไปพักผ่อนหรือเดินทาง</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <Text style={styles.sectionLabel}>ความช่วยเหลือ</Text>
        <View style={styles.card}>
          <TouchableOpacity
            style={[styles.row, styles.rowBorder]}
            onPress={() => navigation.navigate('ContactSupport')}
          >
            <View style={styles.rowLeft}>
              <HelpCircle size={20} color={colors.primary} />
              <View>
                <Text style={styles.rowLabel}>ติดต่อเจ้าหน้าที่</Text>
                <Text style={styles.rowSubLabel}>ขอความช่วยเหลือและสนับสนุน</Text>
              </View>
            </View>
          </TouchableOpacity>

          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <Info size={20} color={colors.primary} />
              <View>
                <Text style={styles.rowLabel}>เกี่ยวกับ Sabaai-Dii-Mai</Text>
                <Text style={styles.rowSubLabel}>เวอร์ชั่น 1.0.0</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionLabel}>บัญชี</Text>
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('AccountProfile', { mode: 'edit' })}>
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <User size={20} color={colors.primary} />
              <View>
                <Text style={styles.rowLabel}>ข้อมูลผู้ใช้</Text>
                <Text style={styles.rowSubLabel}>แก้ไขชื่อและเบอร์โทรที่ใช้ให้เพื่อนค้นหาคุณ</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.logoutCard}
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          <View style={styles.row}>
            <View style={styles.rowLeft}>
              <LogOut size={20} color={colors.destructive || '#DC2626'} />
              <View>
                <Text style={styles.logoutLabel}>
                  {isLoggingOut ? 'กำลังออกจากระบบ...' : 'ออกจากระบบ'}
                </Text>
                <Text style={styles.rowSubLabel}>กลับไปหน้าเริ่มต้นของแอป</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        <View style={styles.privacyBox}>
          <Shield size={20} color={colors.primary} style={styles.privacyIcon} />
          <View style={styles.privacyText}>
            <Text style={styles.privacyTitle}>ความเป็นส่วนตัวเป็นอันดับแรก</Text>
            <Text style={styles.privacyDesc}>
              ไม่มีการติดตาม ไม่มีประวัติตำแหน่งที่ตั้ง ข้อมูลของคุณเป็นของคุณ
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={pauseModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPauseModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setPauseModalVisible(false)}
        >
          <View style={styles.modalBox} onStartShouldSetResponder={() => true}>
            <Text style={styles.modalTitle}>หยุดชั่วคราวนานขึ้น</Text>
            <Text style={styles.modalDesc}>ตั้งค่าการหยุดชั่วคราวนานขึ้นเพื่อไปพักผ่อนหรือเดินทาง</Text>
            <View style={styles.modalOptions}>
              {[2, 3, 5, 7].map(days => (
                <TouchableOpacity
                  key={days}
                  style={styles.modalOption}
                  onPress={() => {
                    extendedPause(days);
                    setPauseModalVisible(false);
                    navigation.navigate('MainTabs');
                  }}
                >
                  <Text style={styles.modalOptionText}>{days} วัน</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%' },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 24, fontFamily: fonts.regular },
  sectionLabel: { fontSize: 12, color: colors.mutedForeground, marginBottom: 12, fontFamily: fonts.regular },

  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },

  logoutCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },

  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },

  rowLabel: {
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.regular,
  },

  logoutLabel: {
    fontSize: 14,
    color: colors.destructive || '#DC2626',
    fontFamily: fonts.regular,
  },

  rowSubLabel: {
    fontSize: 12,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
  },

  rowValue: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
  },

  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },

  resumeCard: {
    backgroundColor: colors.safe,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
  },

  resumeTitle: {
    fontSize: 14,
    color: colors.white,
    fontFamily: fonts.medium,
  },

  resumeDesc: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    fontFamily: fonts.regular,
  },

  privacyBox: {
    backgroundColor: colors.primary5,
    borderWidth: 1,
    borderColor: colors.primary20,
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 32,
  },

  privacyIcon: {
    marginTop: 2,
  },

  privacyText: {
    flex: 1,
  },

  privacyTitle: {
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 4,
    fontFamily: fonts.regular,
  },

  privacyDesc: {
    fontSize: 12,
    color: colors.mutedForeground,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  modalBox: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 360,
  },

  modalTitle: {
    fontSize: 18,
    color: colors.foreground,
    marginBottom: 8,
    fontFamily: fonts.regular,
  },

  modalDesc: {
    fontSize: 14,
    color: colors.mutedForeground,
    marginBottom: 20,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },

  modalOptions: {
    gap: 12,
  },

  modalOption: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },

  modalOptionText: {
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.regular,
  },
});
