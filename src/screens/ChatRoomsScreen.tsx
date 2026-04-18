import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Users, ShieldCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

const chatRooms = [
  { id: 'general', name: 'ทั่วไป', desc: 'พูดคุยทั่วไปและแบ่งปันเรื่องราวในชีวิตประจำวัน', members: 234, icon: '💬', color: '#7FA882' },
  { id: 'living-alone', name: 'อยู่คนเดียว', desc: 'สำหรับผู้ที่อาศัยอยู่คนเดียว แบ่งปันประสบการณ์และให้กำลังใจ', members: 156, icon: '🏠', color: '#6B9AB1' },
  { id: 'senior-care', name: 'ดูแลผู้สูงอายุ', desc: 'ดูแลผู้สูงอายุ แชร์เคล็ดลับและคำแนะนำ', members: 98, icon: '👵', color: '#D9A95F' },
  { id: 'mental-support', name: 'กำลังใจและสุขภาพใจ', desc: 'พื้นที่ปลอดภัยสำหรับแบ่งปันความรู้สึกและรับกำลังใจ', members: 187, icon: '💚', color: '#22C55E' },
  { id: 'nearby', name: 'พื้นที่ใกล้คุณ', desc: 'เชื่อมต่อกับผู้คนในพื้นที่เดียวกัน (ไม่แสดงตำแหน่งที่แน่นอน)', members: 67, icon: '📍', color: '#B47C9E' },
];

export function ChatRoomsScreen() {
  const navigation = useNavigation<any>();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('MainTabs', { screen: 'Community' })} style={styles.headerLeft}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>ห้องแชท</Text>
          <Text style={styles.headerSubtitle}>เลือกห้องที่คุณสนใจ</Text>
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner}>
        <View style={styles.privacyBox}>
          <ShieldCheck size={20} color={colors.primary} style={{ marginTop: 2 }} />
          <View style={styles.privacyContent}>
            <Text style={styles.privacyTitle}>🔒 กติกาความเป็นส่วนตัว</Text>
            {['ไม่มีการแชร์ตำแหน่งแบบ real-time', 'ชื่อผู้ใช้แบบไม่ระบุตัวตน', 'คุณสามารถรายงานหรือบลอกผู้ใช้ได้'].map((t, i) => (
              <View key={i} style={styles.privacyItem}>
                <View style={styles.bullet} />
                <Text style={styles.privacyItemText}>{t}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.rooms}>
          {chatRooms.map(room => (
            <TouchableOpacity key={room.id} style={styles.roomCard} onPress={() => navigation.navigate('ChatRoom', { roomId: room.id, roomName: room.name, roomIcon: room.icon })}>
              <View style={[styles.roomIcon, { backgroundColor: room.color + '33' }]}>
                <Text style={styles.roomEmoji}>{room.icon}</Text>
              </View>
              <View style={styles.roomInfo}>
                <View style={styles.roomHeader}>
                  <Text style={styles.roomName}>{room.name}</Text>
                  <View style={styles.membersRow}>
                    <Users size={14} color={colors.mutedForeground} />
                    <Text style={styles.membersText}>{room.members}</Text>
                  </View>
                </View>
                <Text style={styles.roomDesc}>{room.desc}</Text>
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card, gap: 12 },
  headerLeft: {},
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.regular },
  headerSubtitle: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  scroll: { flex: 1 },
  inner: { padding: 24, maxWidth: 448, alignSelf: 'center', width: '100%' },
  privacyBox: { backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  privacyContent: { flex: 1 },
  privacyTitle: { fontSize: 14, color: colors.foreground, marginBottom: 8, fontFamily: fonts.regular },
  privacyItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 4 },
  bullet: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.primary, marginTop: 7 },
  privacyItemText: { fontSize: 12, color: colors.mutedForeground, flex: 1, fontFamily: fonts.regular },
  rooms: { gap: 12 },
  roomCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
  roomIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  roomEmoji: { fontSize: 22 },
  roomInfo: { flex: 1 },
  roomHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 4 },
  roomName: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  membersRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  membersText: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  roomDesc: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontFamily: fonts.regular },
});
