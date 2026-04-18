import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { CheckCircle2, Clock, AlertCircle, PauseCircle, AlertTriangle } from 'lucide-react-native';
import { UserStatus } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface StatusBannerProps {
  status: UserStatus;
  pausedUntil?: Date | null;
}

const getStatusConfig = (status: UserStatus, pausedUntil?: Date | null) => {
  switch (status) {
    case 'normal':
      return { Icon: CheckCircle2, text: 'คุณพร้อมแล้ว', bg: colors.safe10, textColor: colors.safe, borderColor: colors.safe20 };
    case 'pending':
      return { Icon: Clock, text: 'เช็คอินเร็วๆ นี้', bg: colors.primary10, textColor: colors.primary, borderColor: colors.primary20 };
    case 'grace':
      return { Icon: Clock, text: 'อยู่ในช่วงผ่อนผัน', bg: colors.warning10, textColor: colors.warning, borderColor: colors.warning20 };
    case 'pre-alert':
      return { Icon: AlertCircle, text: 'ยังไม่ได้ยินจากคุณ', bg: colors.warning15, textColor: colors.warning, borderColor: colors.warning25 };
    case 'escalated':
      return { Icon: AlertTriangle, text: 'แจ้งผู้ติดต่อหลักแล้ว', bg: colors.destructive10, textColor: colors.destructive, borderColor: colors.destructive20 };
    case 'paused': {
      const dateStr = pausedUntil
        ? pausedUntil.toLocaleDateString('th-TH', { month: 'short', day: 'numeric' })
        : 'พรุ่งนี้';
      return { Icon: PauseCircle, text: `เช็คอินกลับมาวันที่ ${dateStr}`, bg: colors.muted, textColor: colors.mutedForeground, borderColor: colors.border };
    }
    case 'sos-active':
      return { Icon: AlertTriangle, text: 'ความช่วยเหลือกำลังมา', bg: colors.destructive15, textColor: colors.destructive, borderColor: colors.destructive25 };
    case 'resolved':
      return { Icon: CheckCircle2, text: 'ปลอดภัยแล้ว ดูแลตัวเองด้วยนะ', bg: colors.safe10, textColor: colors.safe, borderColor: colors.safe20 };
    default:
      return { Icon: CheckCircle2, text: 'คุณพร้อมแล้ว', bg: colors.safe10, textColor: colors.safe, borderColor: colors.safe20 };
  }
};

export function StatusBanner({ status, pausedUntil }: StatusBannerProps) {
  const { Icon, text, bg, textColor, borderColor } = getStatusConfig(status, pausedUntil);

  return (
    <View style={[styles.container, { backgroundColor: bg, borderColor }]}>
      <Icon size={20} color={textColor} style={styles.icon} />
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: { flexShrink: 0 },
  text: {
    fontSize: 14,
    flex: 1,
    fontFamily: fonts.regular,
  },
});
