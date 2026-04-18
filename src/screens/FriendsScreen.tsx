import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  TextInput, ActivityIndicator, Alert, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserPlus, Search, MessageCircle, Check, X, Users } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import {
  getFriends, getPendingRequests, acceptFriendRequest, rejectFriendRequest,
  getFriendConversation,
} from '../services/api';

// ─── Types ────────────────────────────────────────────────────────
interface Friend {
  id: number;
  display_name: string;
  phone?: string;
  status?: string;
  friendship_id: number;
}
interface PendingRequest {
  id: number;
  requester_id: number;
  requester_name: string;
  created_at: string;
  friendship_id?: number;
  friendshipId?: number;
}

// ─── Avatar helper ────────────────────────────────────────────────
const AVATAR_COLORS = ['#7FA882','#D9A95F','#6B9AB1','#B47C9E','#C47B6A','#22C55E'];
function avatarColor(id: number) { return AVATAR_COLORS[id % AVATAR_COLORS.length]; }
function initials(name: string) {
  const w = name.trim().split(' ');
  return w.length >= 2 ? (w[0][0] + w[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function getPendingFriendshipId(request: PendingRequest) {
  return request.friendship_id ?? request.friendshipId ?? request.id;
}

export function FriendsScreen() {
  const navigation = useNavigation<any>();
  const [activeTab, setActiveTab] = useState<'friends' | 'pending'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [f, p] = await Promise.all([getFriends(), getPendingRequests()]);
      setFriends(f);
      setPending(p);
    } catch {
      // ใช้ demo data ถ้า API ยังไม่พร้อม
      setFriends([
        { id: 2, display_name: 'คุณมานะ หมั่นเพียร', phone: '089-876-5432', friendship_id: 1 },
        { id: 5, display_name: 'คุณวิไล ร่มเย็น', phone: '080-555-6666', friendship_id: 3 },
      ]);
      setPending([
        { id: 3, requester_id: 3, requester_name: 'คุณจงใจ รักดี', created_at: '2025-06-09' },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleAccept = async (request: PendingRequest) => {
    try {
      await acceptFriendRequest(getPendingFriendshipId(request));
      await load();
    } catch { Alert.alert('ไม่สามารถยืนยันได้', 'กรุณาลองใหม่อีกครั้ง'); }
  };

  const handleReject = async (request: PendingRequest) => {
    try {
      await rejectFriendRequest(getPendingFriendshipId(request));
      await load();
    } catch { Alert.alert('ไม่สามารถปฏิเสธได้', 'กรุณาลองใหม่อีกครั้ง'); }
  };

  const openChat = async (friend: Friend) => {
    try {
      const conv = await getFriendConversation(friend.id);
      navigation.navigate('DirectChat', {
        conversationId: conv.id,
        friendName: friend.display_name,
        friendId: friend.id,
      });
    } catch {
      // สร้าง conversation ใหม่
      navigation.navigate('DirectChat', {
        conversationId: null,
        friendName: friend.display_name,
        friendId: friend.id,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>เพื่อนและผู้ติดต่อ</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => navigation.navigate('FriendSearch')}
        >
          <UserPlus size={18} color={colors.white} />
          <Text style={styles.addBtnText}>ค้นหาเพื่อน</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'friends' && styles.tabActive]}
          onPress={() => setActiveTab('friends')}
        >
          <Text style={[styles.tabText, activeTab === 'friends' && styles.tabTextActive]}>
            เพื่อน ({friends.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'pending' && styles.tabActive]}
          onPress={() => setActiveTab('pending')}
        >
          <Text style={[styles.tabText, activeTab === 'pending' && styles.tabTextActive]}>
            คำขอ {pending.length > 0 ? `(${pending.length})` : ''}
          </Text>
          {pending.length > 0 && <View style={styles.dot} />}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} tintColor={colors.primary} />}
      >
        {activeTab === 'friends' && (
          <>
            {friends.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}><Users size={32} color={colors.mutedForeground} /></View>
                <Text style={styles.emptyTitle}>ยังไม่มีเพื่อน</Text>
                <Text style={styles.emptyDesc}>กด "ค้นหาเพื่อน" เพื่อเพิ่มคนที่คุณรู้จัก</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('FriendSearch')}>
                  <Text style={styles.emptyBtnText}>ค้นหาเพื่อน</Text>
                </TouchableOpacity>
              </View>
            ) : (
              friends.map(f => (
                <View key={f.id} style={styles.friendCard}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor(f.id) + '22' }]}>
                    <Text style={[styles.avatarText, { color: avatarColor(f.id) }]}>{initials(f.display_name)}</Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{f.display_name}</Text>
                    {f.phone && <Text style={styles.friendPhone}>{f.phone}</Text>}
                  </View>
                  <TouchableOpacity style={styles.chatBtn} onPress={() => openChat(f)}>
                    <MessageCircle size={18} color={colors.primary} />
                    <Text style={styles.chatBtnText}>แชต</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </>
        )}

        {activeTab === 'pending' && (
          <>
            {pending.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>ไม่มีคำขอรอดำเนินการ</Text>
              </View>
            ) : (
              pending.map(p => (
                <View key={p.id} style={styles.pendingCard}>
                  <View style={[styles.avatar, { backgroundColor: avatarColor(p.requester_id) + '22' }]}>
                    <Text style={[styles.avatarText, { color: avatarColor(p.requester_id) }]}>{initials(p.requester_name)}</Text>
                  </View>
                  <View style={styles.pendingInfo}>
                    <Text style={styles.friendName}>{p.requester_name}</Text>
                    <Text style={styles.pendingDate}>ส่งคำขอ {p.created_at}</Text>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => handleAccept(p)}>
                      <Check size={16} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => handleReject(p)}>
                      <X size={16} color={colors.destructive} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
  },
  title: { fontSize: 22, color: colors.foreground, fontFamily: fonts.semiBold },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: { color: colors.white, fontSize: 13, fontFamily: fonts.medium },
  tabBar: {
    flexDirection: 'row', marginHorizontal: 24, marginBottom: 16,
    backgroundColor: colors.muted, borderRadius: 10, padding: 3,
  },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8, flexDirection: 'row', justifyContent: 'center', gap: 4 },
  tabActive: { backgroundColor: colors.card },
  tabText: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  tabTextActive: { color: colors.foreground, fontFamily: fonts.medium },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
  friendCard: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontFamily: fonts.semiBold },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  friendPhone: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, fontFamily: fonts.regular },
  chatBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 7, borderRadius: 8,
    borderWidth: 1, borderColor: colors.primary + '44', backgroundColor: colors.primary10,
  },
  chatBtnText: { fontSize: 12, color: colors.primary, fontFamily: fonts.medium },
  pendingCard: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1,
    borderColor: colors.border, padding: 14, flexDirection: 'row',
    alignItems: 'center', gap: 12,
  },
  pendingInfo: { flex: 1 },
  pendingDate: { fontSize: 11, color: colors.mutedForeground, marginTop: 2, fontFamily: fonts.regular },
  pendingActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    width: 34, height: 34, borderRadius: 17, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  rejectBtn: {
    width: 34, height: 34, borderRadius: 17,
    borderWidth: 1, borderColor: colors.destructive + '44',
    backgroundColor: colors.destructive10,
    alignItems: 'center', justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: {
    width: 64, height: 64, borderRadius: 32,
    backgroundColor: colors.muted, alignItems: 'center',
    justifyContent: 'center', marginBottom: 8,
  },
  emptyTitle: { fontSize: 15, color: colors.foreground, fontFamily: fonts.medium },
  emptyDesc: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
  emptyBtn: {
    marginTop: 12, backgroundColor: colors.primary,
    paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10,
  },
  emptyBtnText: { color: colors.white, fontSize: 14, fontFamily: fonts.medium },
});
