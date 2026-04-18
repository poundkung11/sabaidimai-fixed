import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { UserPlus, MessageCircle, Check, X, Users } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import {
  getFriends,
  getPendingRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendConversation,
} from '../services/api';

interface Friend {
  id: number;
  display_name: string;
  phone?: string;
  friendship_id: number;
}

interface PendingRequest {
  id: number;
  requester_id: number;
  requester_name: string;
  requester_phone?: string;
  created_at: string;
  friendship_id?: number;
  friendshipId?: number;
}

const AVATAR_COLORS = ['#7FA882', '#D9A95F', '#6B9AB1', '#B47C9E', '#C47B6A', '#22C55E'];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(name: string) {
  const words = name.trim().split(' ').filter(Boolean);
  return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

function getPendingFriendshipId(request: PendingRequest) {
  return request.friendship_id ?? request.friendshipId ?? request.id;
}

export function FriendsScreen() {
  const navigation = useNavigation<any>();
  const { currentUserId } = useApp();
  const userId = currentUserId ?? 1;
  const [activeTab, setActiveTab] = useState<'friends' | 'pending'>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pending, setPending] = useState<PendingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const [friendRows, pendingRows] = await Promise.all([getFriends(userId), getPendingRequests(userId)]);
      setFriends(friendRows);
      setPending(pendingRows);
      setError(null);
    } catch (loadError: any) {
      setFriends([]);
      setPending([]);
      setError(loadError?.message || 'โหลดข้อมูลเพื่อนจาก backend ไม่สำเร็จ');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleAccept = async (request: PendingRequest) => {
    try {
      await acceptFriendRequest(getPendingFriendshipId(request), userId);
      await load();
    } catch (acceptError: any) {
      Alert.alert('ยืนยันคำขอไม่สำเร็จ', acceptError?.message || 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  const handleReject = async (request: PendingRequest) => {
    try {
      await rejectFriendRequest(getPendingFriendshipId(request), userId);
      await load();
    } catch (rejectError: any) {
      Alert.alert('ปฏิเสธคำขอไม่สำเร็จ', rejectError?.message || 'กรุณาลองใหม่อีกครั้ง');
    }
  };

  const openChat = async (friend: Friend) => {
    try {
      const conversation = await getFriendConversation(friend.id, userId);
      navigation.navigate('DirectChat', {
        conversationId: conversation.id,
        friendName: friend.display_name,
        friendId: friend.id,
      });
    } catch {
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
      <View style={styles.header}>
        <Text style={styles.title}>เพื่อนและผู้ติดต่อ</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('FriendSearch')}>
          <UserPlus size={18} color={colors.white} />
          <Text style={styles.addBtnText}>ค้นหาเพื่อน</Text>
        </TouchableOpacity>
      </View>

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

      {error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.errorRetryBtn} onPress={() => void load()}>
            <Text style={styles.errorRetryText}>ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.inner}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={colors.primary}
          />
        }
      >
        {activeTab === 'friends' && (
          <>
            {friends.length === 0 ? (
              <View style={styles.empty}>
                <View style={styles.emptyIcon}>
                  <Users size={32} color={colors.mutedForeground} />
                </View>
                <Text style={styles.emptyTitle}>ยังไม่มีเพื่อน</Text>
                <Text style={styles.emptyDesc}>เมื่อ backend มีข้อมูลเพื่อนแล้ว รายการจะขึ้นที่หน้านี้ทันที</Text>
                <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('FriendSearch')}>
                  <Text style={styles.emptyBtnText}>ค้นหาเพื่อน</Text>
                </TouchableOpacity>
              </View>
            ) : (
              friends.map((friend) => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={[styles.avatar, { backgroundColor: `${avatarColor(friend.id)}22` }]}>
                    <Text style={[styles.avatarText, { color: avatarColor(friend.id) }]}>
                      {initials(friend.display_name)}
                    </Text>
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.display_name}</Text>
                    {friend.phone ? <Text style={styles.friendPhone}>{friend.phone}</Text> : null}
                  </View>
                  <TouchableOpacity style={styles.chatBtn} onPress={() => void openChat(friend)}>
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
              pending.map((request) => (
                <View key={request.id} style={styles.pendingCard}>
                  <View style={[styles.avatar, { backgroundColor: `${avatarColor(request.requester_id)}22` }]}>
                    <Text style={[styles.avatarText, { color: avatarColor(request.requester_id) }]}>
                      {initials(request.requester_name)}
                    </Text>
                  </View>
                  <View style={styles.pendingInfo}>
                    <Text style={styles.friendName}>{request.requester_name}</Text>
                    {request.requester_phone ? (
                      <Text style={styles.friendPhone}>{request.requester_phone}</Text>
                    ) : null}
                    <Text style={styles.pendingDate}>ส่งคำขอเมื่อ {request.created_at}</Text>
                  </View>
                  <View style={styles.pendingActions}>
                    <TouchableOpacity style={styles.acceptBtn} onPress={() => void handleAccept(request)}>
                      <Check size={16} color={colors.white} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.rejectBtn} onPress={() => void handleReject(request)}>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: { fontSize: 22, color: colors.foreground, fontFamily: fonts.semiBold },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addBtnText: { color: colors.white, fontSize: 13, fontFamily: fonts.medium },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 24,
    marginBottom: 16,
    backgroundColor: colors.muted,
    borderRadius: 10,
    padding: 3,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 4,
  },
  tabActive: { backgroundColor: colors.card },
  tabText: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  tabTextActive: { color: colors.foreground, fontFamily: fonts.medium },
  dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary },
  errorCard: {
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.destructive20,
    backgroundColor: colors.destructive10,
    gap: 10,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 13,
    color: colors.foreground,
    textAlign: 'center',
    fontFamily: fonts.regular,
  },
  errorRetryBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  errorRetryText: {
    fontSize: 13,
    color: colors.destructive,
    fontFamily: fonts.medium,
  },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 24, paddingBottom: 32, gap: 10 },
  friendCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 15, fontFamily: fonts.semiBold },
  friendInfo: { flex: 1 },
  friendName: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  friendPhone: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, fontFamily: fonts.regular },
  chatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: `${colors.primary}44`,
    backgroundColor: colors.primary10,
  },
  chatBtnText: { fontSize: 12, color: colors.primary, fontFamily: fonts.medium },
  pendingCard: {
    backgroundColor: colors.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pendingInfo: { flex: 1 },
  pendingDate: { fontSize: 11, color: colors.mutedForeground, marginTop: 2, fontFamily: fonts.regular },
  pendingActions: { flexDirection: 'row', gap: 8 },
  acceptBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rejectBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: `${colors.destructive}44`,
    backgroundColor: colors.destructive10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: 40, gap: 8 },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 15, color: colors.foreground, fontFamily: fonts.medium },
  emptyDesc: { fontSize: 13, color: colors.mutedForeground, textAlign: 'center', fontFamily: fonts.regular },
  emptyBtn: {
    marginTop: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  emptyBtnText: { color: colors.white, fontSize: 14, fontFamily: fonts.medium },
});
