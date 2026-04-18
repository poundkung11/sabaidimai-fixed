import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Sparkles, Briefcase, Heart } from 'lucide-react-native';
import { useApp, AgeGroup } from '../../context/AppContext';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';

const options = [
  { value: 'young-adult' as AgeGroup, Icon: Sparkles, title: 'วัยรุ่น - วัยทำงาน', desc: 'อายุ 18-35 ปี มีกิจกรรมและตารางที่หลากหลาย' },
  { value: 'adult' as AgeGroup, Icon: Briefcase, title: 'วัยกลางคน', desc: 'อายุ 36-60 ปี ชีวิตที่มั่นคงและกิจวัตรประจำ' },
  { value: 'senior' as AgeGroup, Icon: Heart, title: 'ผู้สูงอายุ', desc: 'อายุ 60+ ปี ต้องการความดูแลเป็นพิเศษ' },
];

export function SetupForScreen() {
  const navigation = useNavigation<any>();
  const { updateSettings } = useApp();
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.inner}>
        <Text style={styles.title}>คุณอายุเท่าไหร่?</Text>
        <Text style={styles.desc}>เพื่อให้เราปรับแต่งการเช็คอินให้เหมาะกับวัยของคุณ</Text>
        <View style={styles.options}>
          {options.map(({ value, Icon, title, desc }) => (
            <TouchableOpacity key={value} style={styles.card} onPress={() => { updateSettings({ setupFor: value }); navigation.navigate('OnboardingSleepPattern'); }}>
              <View style={styles.cardIcon}><Icon size={24} color={colors.primary} /></View>
              <View style={styles.cardText}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Text style={styles.cardDesc}>{desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%', paddingTop: 48 },
  title: { fontSize: 24, color: colors.foreground, marginBottom: 8, fontFamily: fonts.regular },
  desc: { fontSize: 14, color: colors.mutedForeground, marginBottom: 32, fontFamily: fonts.regular },
  options: { gap: 16 },
  card: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 24, flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  cardIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary10, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  cardText: { flex: 1, paddingTop: 4 },
  cardTitle: { fontSize: 15, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  cardDesc: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
});
