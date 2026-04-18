import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Heart, Shield, Users, Clock, Lock, Zap } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const features = [
  { Icon: Heart, title: 'การเช็คอินที่อบอุ่น', desc: 'การเตือนรายวันที่อบอุ่น - ไม่ใช่การเฝ้าระวัง', color: colors.primary, bg: colors.primary10 },
  { Icon: Shield, title: 'เน้นความเป็นส่วนตัว', desc: 'ทำงานเมื่อมีเหตุการณ์เท่านั้น ไม่มีการติดตาม ไม่มีประวัติ', color: colors.safe, bg: colors.safe10 },
  { Icon: Users, title: 'การแจ้งเตือนแบบขั้นบันได', desc: 'การแจ้งเตือนอย่างสงบเมื่อจำเป็นเท่านั้น', color: colors.warning, bg: colors.warning10 },
  { Icon: Clock, title: 'ระยะเวลาผ่อนผัน', desc: 'ความยืดหยุ่นที่เข้ากับชีวิตจริง', color: colors.primary, bg: colors.primary10 },
  { Icon: Lock, title: 'ดีไซน์เป็นมิตร', desc: 'ดูแลใส่ใจ ไม่ใช่น่าตกใจ อบอุ่น ไม่เย็นชา', color: colors.safe, bg: colors.safe10 },
  { Icon: Zap, title: 'ใช้งานออฟไลน์ได้', desc: 'ระบบ SMS สำรองเมื่ออินเทอร์เน็ตล้มเหลว', color: colors.warning, bg: colors.warning10 },
];

const demos = [
  { title: 'ขั้นตอนการตั้งค่าเริ่มต้น', desc: 'ทดลองกระบวนการตั้งค่าทั้งหมด (9 หน้าจอ)', screen: 'OnboardingWelcome' },
  { title: 'หน้าหลัก & การเช็คอิน', desc: 'หน้าจอหลักพร้อมสถานะและปุ่มเช็คอิน', screen: 'MainTabs' },
  { title: 'ระบบ SOS', desc: 'การขอความช่วยเหลือฉุกเฉินพร้อมการนับถอยหลัง', screen: 'SOS' },
  { title: 'การตั้งค่า & การปรับแต่ง', desc: 'การปรับแต่งด่วนและฟีเจอร์หยุดชั่วคราว', screen: 'Settings' },
  { title: 'วงการปลอดภัย', desc: 'จัดการผู้ติดต่อฉุกเฉิน', screen: 'Circle' },
];

export function DemoScreen() {
  const navigation = useNavigation<any>();
  const { login } = useApp();

  const handleEnterApp = async (screen?: string) => {
    await login(1);

    if (screen) {
      navigation.navigate(screen);
      return;
    }

    navigation.navigate('MainTabs');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Heart size={40} color={colors.primary} />
        </View>
        <Text style={styles.heroTitle}>Sabaai-Dii-Mai</Text>
        <Text style={styles.heroSubtitle}>สบายดีไหม</Text>
        <Text style={styles.heroDesc}>
          แอพเช็คอินที่อบอุ่นซึ่งปกป้องผู้คนอย่างเงียบๆ ไม่ใช่แอพติดตาม ไม่ใช่การเฝ้าระวัง
          แค่เสียงที่เป็นห่วงถามว่า "คุณสบายดีไหม?"
        </Text>

        <TouchableOpacity style={styles.enterBtn} onPress={() => handleEnterApp()}>
          <Text style={styles.enterBtnText}>เข้าสู่แอป</Text>
        </TouchableOpacity>
      </View>

      {/* Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>เป้าหมายหลัก</Text>
        <View style={styles.grid}>
          {features.map(({ Icon, title, desc, color, bg }, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: bg }]}>
                <Icon size={24} color={color} />
              </View>
              <Text style={styles.featureTitle}>{title}</Text>
              <Text style={styles.featureDesc}>{desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Demo navigation */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>สำรวจแอพ</Text>
        <View style={styles.demoList}>
          {demos.map(({ title, desc, screen }, i) => (
            <TouchableOpacity key={i} style={styles.demoCard} onPress={() => handleEnterApp(screen)}>
              <Text style={styles.demoTitle}>{title}</Text>
              <Text style={styles.demoDesc}>{desc}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Design Principles */}
      <View style={styles.principlesSection}>
        <Text style={styles.sectionTitle}>หลักการออกแบบ</Text>
        <View style={styles.principlesGrid}>
          <View style={styles.principlesCol}>
            <Text style={styles.principlesColTitle}>สิ่งที่เราเป็น:</Text>
            {[
              'ตาข่ายความปลอดภัยที่อ่อนโยน',
              'การปกป้องที่ทำงานตามเหตุการณ์',
              'ออกแบบเพื่อเคารพความเป็นส่วนตัว',
              'สงบและโปร่งใส',
            ].map((t, i) => (
              <View key={i} style={styles.principlesItem}>
                <View style={[styles.bullet, { backgroundColor: colors.safe }]} />
                <Text style={styles.principlesText}>{t}</Text>
              </View>
            ))}
          </View>

          <View style={styles.principlesCol}>
            <Text style={styles.principlesColTitle}>สิ่งที่เราไม่ใช่:</Text>
            {[
              'อุปกรณ์ติดตาม',
              'ซอฟต์แวร์เฝ้าระวัง',
              'สร้างความกลัวหรือความตื่นตระหนก',
              'เหมือนตำรวจหรือโรงพยาบาล',
            ].map((t, i) => (
              <View key={i} style={styles.principlesItem}>
                <View style={[styles.bullet, { backgroundColor: colors.destructive }]} />
                <Text style={styles.principlesText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>พร้อมที่จะลองใช้แล้วหรือยัง?</Text>
        <Text style={styles.ctaDesc}>
          เริ่มต้นด้วยขั้นตอนการตั้งค่าเพื่อดูว่าเราตั้งค่าความปลอดภัยด้วยความเอาใจใส่อย่างไร
        </Text>
        <TouchableOpacity style={styles.ctaBtn} onPress={() => handleEnterApp('OnboardingWelcome')}>
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

  enterBtn: {
    height: 54,
    minWidth: 180,
    paddingHorizontal: 28,
    backgroundColor: colors.primary,
    borderRadius: 27,
    alignItems: 'center',
    justifyContent: 'center',
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