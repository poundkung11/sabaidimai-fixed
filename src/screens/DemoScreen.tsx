import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart, Shield, Users, Clock, Lock, Zap } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getMobileUsers, type MobileUser } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const features = [
  {
    Icon: Heart,
    title: 'การเช็กอินที่อบอุ่น',
    desc: 'แจ้งเตือนแบบเป็นห่วง ไม่ใช่การเฝ้าระวัง',
    color: colors.primary,
    bg: colors.primary10,
  },
  {
    Icon: Shield,
    title: 'เน้นความเป็นส่วนตัว',
    desc: 'ทำงานเมื่อจำเป็นเท่านั้น ไม่มีการติดตามตลอดเวลา',
    color: colors.safe,
    bg: colors.safe10,
  },
  {
    Icon: Users,
    title: 'แจ้งเตือนเป็นขั้น',
    desc: 'ค่อย ๆ แจ้งเตือนอย่างสงบเมื่อเกิดเหตุผิดปกติ',
    color: colors.warning,
    bg: colors.warning10,
  },
  {
    Icon: Clock,
    title: 'ยืดหยุ่นตามชีวิตจริง',
    desc: 'ตั้งเวลาและช่วงผ่อนผันให้เหมาะกับแต่ละคนได้',
    color: colors.primary,
    bg: colors.primary10,
  },
  {
    Icon: Lock,
    title: 'ดีไซน์เป็นมิตร',
    desc: 'เน้นความอุ่นใจ ใช้ง่าย และไม่ทำให้กังวลเกินจำเป็น',
    color: colors.safe,
    bg: colors.safe10,
  },
  {
    Icon: Zap,
    title: 'พร้อมต่อยอดออฟไลน์',
    desc: 'รองรับการต่อกับระบบแจ้งเตือนหรือช่องทางสำรองได้',
    color: colors.warning,
    bg: colors.warning10,
  },
];

const demos = [
  {
    title: 'ขั้นตอนการตั้งค่าเริ่มต้น',
    desc: 'ลอง flow onboarding และการตั้งค่าหลักของระบบ',
    screen: 'OnboardingWelcome',
  },
  {
    title: 'หน้าหลักและการเช็กอิน',
    desc: 'ดูสถานะปัจจุบันและปุ่มเช็กอินหลักของผู้ใช้',
    screen: 'MainTabs',
  },
  {
    title: 'ระบบ SOS',
    desc: 'ทดสอบการขอความช่วยเหลือฉุกเฉินจากในแอป',
    screen: 'SOS',
  },
  {
    title: 'การตั้งค่าและการปรับแต่ง',
    desc: 'ดูหน้าการตั้งค่าและตัวเลือกปรับใช้งานต่าง ๆ',
    screen: 'Settings',
  },
  {
    title: 'วงการปลอดภัย',
    desc: 'จัดการผู้ติดต่อฉุกเฉินและข้อมูลสำคัญ',
    screen: 'Circle',
  },
];

export function DemoScreen() {
  const navigation = useNavigation<any>();
  const { login, currentUserId } = useApp();
  const [selectedUserId, setSelectedUserId] = useState(currentUserId ?? 1);
  const [accounts, setAccounts] = useState<MobileUser[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.id === selectedUserId) ?? accounts[0] ?? null,
    [accounts, selectedUserId]
  );

  const loadAccounts = async () => {
    setAccountsLoading(true);

    try {
      const data = await getMobileUsers();
      setAccounts(data);
      setAccountsError(null);
      setSelectedUserId((previous) =>
        data.some((account) => account.id === previous) ? previous : (data[0]?.id ?? previous)
      );
    } catch (error: any) {
      setAccounts([]);
      setAccountsError(error?.message || 'โหลดรายชื่อผู้ใช้จาก backend ไม่สำเร็จ');
    } finally {
      setAccountsLoading(false);
    }
  };

  useEffect(() => {
    void loadAccounts();
  }, []);

  const handleEnterApp = async (screen?: string) => {
    if (!selectedAccount) {
      return;
    }

    await login(selectedAccount.id);

    if (screen) {
      navigation.navigate(screen);
      return;
    }

    navigation.navigate('MainTabs');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Heart size={40} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Sabaai-Dii-Mai</Text>
        <Text style={styles.heroSubtitle}>สบายดีไหม</Text>
        <Text style={styles.heroDesc}>
          แอปเช็กอินเพื่อความอุ่นใจที่ออกแบบให้ดูแลกันอย่างนุ่มนวล ช่วยให้คนในครอบครัวหรือทีม
          รู้ว่าอีกฝ่ายยังปลอดภัย โดยไม่เปลี่ยนมันให้เป็นระบบติดตามแบบกดดัน
        </Text>

        <View style={styles.accountPicker}>
          <Text style={styles.accountPickerTitle}>เลือกผู้ใช้สำหรับเครื่องนี้</Text>
          <Text style={styles.accountPickerHint}>
            รายชื่อและเบอร์โทรด้านล่างดึงจาก backend จริงทั้งหมด หากจะทดสอบหลายเครื่อง
            ให้แต่ละเครื่องเลือกคนละบัญชี
          </Text>

          <View style={styles.accountList}>
            {accountsLoading ? (
              <View style={styles.accountState}>
                <ActivityIndicator color={colors.primary} />
                <Text style={styles.accountStateText}>กำลังโหลดรายชื่อจาก backend...</Text>
              </View>
            ) : accountsError ? (
              <View style={styles.accountErrorCard}>
                <Text style={styles.accountErrorText}>{accountsError}</Text>
                <TouchableOpacity style={styles.accountRetryBtn} onPress={() => void loadAccounts()}>
                  <Text style={styles.accountRetryText}>ลองใหม่</Text>
                </TouchableOpacity>
              </View>
            ) : accounts.length === 0 ? (
              <View style={styles.accountState}>
                <Text style={styles.accountStateText}>ยังไม่มีผู้ใช้ใน backend</Text>
              </View>
            ) : (
              accounts.map((account) => {
                const active = account.id === selectedUserId;
                return (
                  <TouchableOpacity
                    key={account.id}
                    style={[styles.accountCard, active && styles.accountCardActive]}
                    onPress={() => setSelectedUserId(account.id)}
                  >
                    <Text style={[styles.accountName, active && styles.accountNameActive]}>
                      {account.display_name}
                    </Text>
                    {account.phone ? (
                      <Text style={[styles.accountPhone, active && styles.accountPhoneActive]}>
                        {account.phone}
                      </Text>
                    ) : null}
                  </TouchableOpacity>
                );
              })
            )}
          </View>

          <Text style={styles.accountSelected}>
            {selectedAccount
              ? `เครื่องนี้จะเข้าเป็น: ${selectedAccount.display_name}${
                  selectedAccount.phone ? ` (${selectedAccount.phone})` : ''
                }`
              : 'ยังไม่มีรายชื่อผู้ใช้ให้เลือก'}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.enterBtn, (!selectedAccount || accountsLoading) && styles.enterBtnDisabled]}
          onPress={() => void handleEnterApp()}
          disabled={!selectedAccount || accountsLoading}
        >
          <Text style={styles.enterBtnText}>เข้าสู่แอป</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>เป้าหมายหลัก</Text>
        <View style={styles.grid}>
          {features.map(({ Icon, title, desc, color, bg }, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: bg }]}>
                <Icon size={24} color={color} />
              </View>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>สำรวจแอป</Text>
        <View style={styles.demoList}>
          {demos.map(({ title, desc, screen }, index) => (
            <TouchableOpacity
              key={index}
              style={styles.demoCard}
              onPress={() => void handleEnterApp(screen)}
              disabled={!selectedAccount || accountsLoading}
            >
              <Text style={styles.demoTitle}>{title}</Text>
              <Text style={styles.demoDesc}>{desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.principlesSection}>
        <Text style={styles.sectionTitle}>หลักการออกแบบ</Text>
        <View style={styles.principlesGrid}>
          <View style={styles.principlesCol}>
            <Text style={styles.principlesColTitle}>สิ่งที่เราเป็น:</Text>
            {[
              'ตาข่ายความปลอดภัยที่อ่อนโยน',
              'ปกป้องเมื่อมีเหตุ ไม่รบกวนเกินจำเป็น',
              'ออกแบบเพื่อเคารพความเป็นส่วนตัว',
              'เรียบง่ายและโปร่งใส',
            ].map((item, index) => (
              <View key={index} style={styles.principlesItem}>
                <View style={[styles.bullet, { backgroundColor: colors.safe }]} />
                <Text style={styles.principlesText}>{item}</Text>
              </View>
            ))}
          </View>

          <View style={styles.principlesCol}>
            <Text style={styles.principlesColTitle}>สิ่งที่เราไม่ใช่:</Text>
            {[
              'แอปติดตามตำแหน่งตลอดเวลา',
              'ระบบเฝ้าระวังแบบกดดันผู้ใช้',
              'เครื่องมือสร้างความกลัว',
              'ระบบที่ทำให้ผู้ใช้รู้สึกถูกจับตา',
            ].map((item, index) => (
              <View key={index} style={styles.principlesItem}>
                <View style={[styles.bullet, { backgroundColor: colors.destructive }]} />
                <Text style={styles.principlesText}>{item}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>พร้อมจะลองใช้งานแล้วหรือยัง?</Text>
        <Text style={styles.ctaDesc}>
          เริ่มจากขั้นตอนการตั้งค่าเพื่อดู flow หลักของแอป จากนั้นค่อยทดสอบเช็กอิน SOS และแชตกับเพื่อน
        </Text>
        <TouchableOpacity
          style={[styles.ctaBtn, (!selectedAccount || accountsLoading) && styles.enterBtnDisabled]}
          onPress={() => void handleEnterApp('OnboardingWelcome')}
          disabled={!selectedAccount || accountsLoading}
        >
          <Text style={styles.ctaBtnText}>เริ่มการตั้งค่า</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },

  hero: {
    backgroundColor: colors.primary5,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    padding: 40,
    alignItems: 'center',
  },

  heroIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },

  heroTitle: {
    fontSize: 32,
    color: colors.foreground,
    marginBottom: 8,
    fontFamily: fonts.regular,
  },

  heroSubtitle: {
    fontSize: 18,
    color: colors.mutedForeground,
    marginBottom: 12,
    fontFamily: fonts.regular,
  },

  heroDesc: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: fonts.regular,
    marginBottom: 24,
  },

  accountPicker: {
    width: '100%',
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 16,
    gap: 12,
    marginBottom: 24,
  },

  accountPickerTitle: {
    fontSize: 16,
    color: colors.foreground,
    textAlign: 'center',
    fontFamily: fonts.medium,
  },

  accountPickerHint: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: fonts.regular,
  },

  accountList: {
    width: '100%',
    gap: 10,
  },

  accountState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 20,
  },

  accountStateText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },

  accountErrorCard: {
    borderWidth: 1,
    borderColor: colors.destructive20,
    backgroundColor: colors.destructive10,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    alignItems: 'center',
  },

  accountErrorText: {
    fontSize: 13,
    color: colors.foreground,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },

  accountRetryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.white,
  },

  accountRetryText: {
    fontSize: 13,
    color: colors.destructive,
    fontFamily: fonts.medium,
  },

  accountCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },

  accountCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary5,
  },

  accountName: {
    fontSize: 15,
    color: colors.foreground,
    fontFamily: fonts.medium,
  },

  accountNameActive: {
    color: colors.primary,
  },

  accountPhone: {
    fontSize: 13,
    color: colors.mutedForeground,
    marginTop: 4,
    fontFamily: fonts.regular,
  },

  accountPhoneActive: {
    color: colors.primary,
  },

  accountSelected: {
    fontSize: 13,
    color: colors.foreground,
    textAlign: 'center',
    fontFamily: fonts.medium,
  },

  enterBtn: {
    height: 54,
    minWidth: 180,
    paddingHorizontal: 28,
    backgroundColor: colors.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
  },

  enterBtnDisabled: {
    opacity: 0.5,
  },

  enterBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.medium,
  },

  section: { padding: 24 },

  sectionTitle: {
    fontSize: 22,
    color: colors.foreground,
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },

  grid: { gap: 16 },

  featureCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 24,
  },

  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },

  featureTitle: {
    fontSize: 15,
    color: colors.foreground,
    marginBottom: 8,
    fontFamily: fonts.regular,
  },

  featureDesc: {
    fontSize: 13,
    color: colors.mutedForeground,
    lineHeight: 20,
    fontFamily: fonts.regular,
  },

  demoList: { gap: 16 },

  demoCard: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 24,
  },

  demoTitle: {
    fontSize: 15,
    color: colors.foreground,
    marginBottom: 8,
    fontFamily: fonts.regular,
  },

  demoDesc: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
  },

  principlesSection: {
    backgroundColor: colors.primary5,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    padding: 24,
  },

  principlesGrid: {
    flexDirection: 'row',
    gap: 16,
  },

  principlesCol: { flex: 1 },

  principlesColTitle: {
    fontSize: 14,
    color: colors.foreground,
    marginBottom: 12,
    fontFamily: fonts.regular,
  },

  principlesItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },

  bullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    flexShrink: 0,
  },

  principlesText: {
    fontSize: 12,
    color: colors.mutedForeground,
    flex: 1,
    lineHeight: 18,
    fontFamily: fonts.regular,
  },

  ctaSection: {
    padding: 40,
    alignItems: 'center',
  },

  ctaTitle: {
    fontSize: 22,
    color: colors.foreground,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },

  ctaDesc: {
    fontSize: 14,
    color: colors.mutedForeground,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
    fontFamily: fonts.regular,
  },

  ctaBtn: {
    height: 56,
    paddingHorizontal: 32,
    backgroundColor: colors.primary,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },

  ctaBtnText: {
    color: colors.white,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
});
