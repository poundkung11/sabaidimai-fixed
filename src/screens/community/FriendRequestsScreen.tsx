/**
 * FriendRequestsScreen.tsx — คำขอเพื่อนที่รอรับ + รายชื่อเพื่อน
 * screens/community/FriendRequestsScreen.tsx
 */
import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, SectionList, TouchableOpacity,
  ActivityIndicator, RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, UserSearch } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { UserListItem } from '../../components/UserListItem';
import {
  getFriends, respondFriendRequest, openDirectConversation,
  type FriendsResponse, type AppUser, type FriendRequest,
} from '../../services/chatApi';

export function FriendRequestsScreen() {
  const navigation = useNavigation<any>();
  const [data, setData] = useState<FriendsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await getFriends();
      setData(res);
    } catch (e) {
      console.warn('Failed to load friends', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const handleAccept = async (f: FriendRequest) => {
    setLoadingId(f.id);
    try {
      await respondFriendRequest(f.friendshipId, 'accept');
      await load();
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (f: FriendRequest) => {
    setLoadingId(f.id);
    try {
      await respondFriendRequest(f.friendshipId, 'reject');
      await load();
    } finally {
      setLoadingId(null);
    }
  };

  const handleMessage = async (user: AppUser & { friendshipId: number }) => {
    setLoadingId(user.id);
    try {
      const { conversationId } = await openDirectConversation(user.id);
      navigation.navigate('DirectChat', { conversationId, otherUser: user });
    } finally {
      setLoadingId(null);
    }
  };

  const handleUnfriend = async (user: AppUser & { friendshipId: number }) => {
    setLoadingId(user.id);
    try {
      await respondFriendRequest(user.friendshipId, 'unfriend');
      await load();
    } finally {
      setLoadingId(null);
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  const incoming = data?.incoming || [];
  const friends  = data?.friends  || [];
  const outgoing = data?.outgoing || [];

  const sections = [
    ...(incoming.length > 0 ? [{ title: `คำขอที่รอรับ (${incoming.length})`, key: 'incoming', data: incoming }] : []),
    ...(friends.length  > 0 ? [{ title: `เพื่อนทั้งหมด (${friends.length})`,   key: 'friends',  data: friends  }] : []),
    ...(outgoing.length > 0 ? [{ title: `คำขอที่ส่งออก (${outgoing.length})`,   key: 'outgoing', data: outgoing }] : []),
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>เพื่อนและคำขอ</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('SearchUser')}>
          <UserSearch size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {sections.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>👥</Text>
          <Text style={styles.emptyTitle}>ยังไม่มีเพื่อน</Text>
          <Text style={styles.emptyHint}>ค้นหาผู้ใช้และเพิ่มเป็นเพื่อน</Text>
          <TouchableOpacity style={styles.searchBtn} onPress={() => navigation.navigate('SearchUser')}>
            <UserSearch size={16} color={colors.white} />
            <Text style={styles.searchBtnText}>ค้นหาผู้ใช้</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <SectionList
          sections={sections as any}
          keyExtractor={(item: any) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); void load(); }} tintColor={colors.primary} />}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>{(section as any).title}</Text>
            </View>
          )}
          renderItem={({ item, section }: any) => {
            const key = section.key;
            if (key === 'incoming') return (
              <UserListItem
                user={item}
                actionType="pending_received"
                loading={loadingId === item.id}
                onAccept={() => handleAccept(item)}
                onReject={() => handleReject(item)}
              />
            );
            if (key === 'friends') return (
              <UserListItem
                user={item}
                actionType="friends"
                loading={loadingId === item.id}
                onMessage={() => handleMessage(item)}
                onUnfriend={() => handleUnfriend(item)}
              />
            );
            // outgoing
            return (
              <UserListItem
                user={item}
                actionType="pending_sent"
                loading={loadingId === item.id}
              />
            );
          }}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: { fontSize: 17, color: colors.foreground, fontFamily: fonts.medium },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, paddingBottom: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 17, color: colors.foreground, fontFamily: fonts.medium },
  emptyHint: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  searchBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 8,
  },
  searchBtnText: { color: colors.white, fontSize: 14, fontFamily: fonts.medium },
  sectionHeader: {
    backgroundColor: colors.background,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionTitle: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.medium },
});
