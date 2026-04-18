import React, { useEffect, useRef, useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, UserPlus, Check } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { searchUsers, sendFriendRequest } from '../services/api';

interface UserResult {
  id: number;
  display_name: string;
  phone?: string;
  isFriend?: boolean;
  isPending?: boolean;
}

const AVATAR_COLORS = ['#7FA882', '#D9A95F', '#6B9AB1', '#B47C9E', '#C47B6A', '#22C55E'];

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length];
}

function initials(name: string) {
  const words = name.trim().split(' ').filter(Boolean);
  return words.length >= 2 ? (words[0][0] + words[1][0]).toUpperCase() : name.slice(0, 2).toUpperCase();
}

export function FriendSearchScreen() {
  const navigation = useNavigation<any>();
  const { currentUserId } = useApp();
  const userId = currentUserId ?? 1;
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentIds, setSentIds] = useState<Set<number>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSearch = (text: string) => {
    setQuery(text);
    setError(null);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!text.trim()) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);

      try {
        const data = await searchUsers(text.trim(), userId);
        setResults(data);
        setError(null);
      } catch (searchError: any) {
        setResults([]);
        setError(searchError?.message || 'ค้นหาผู้ใช้จาก backend ไม่สำเร็จ');
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleAddFriend = async (user: UserResult) => {
    try {
      await sendFriendRequest(user.id, userId);
      setSentIds((previous) => new Set(previous).add(user.id));
    } catch (requestError: any) {
      Alert.alert(
        'ส่งคำขอไม่สำเร็จ',
        requestError?.message || 'อาจเป็นเพื่อนกันแล้ว หรือมีคำขอค้างอยู่แล้ว'
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={styles.title}>ค้นหาเพื่อน</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Search size={16} color={colors.mutedForeground} />
          <TextInput
            style={styles.searchInput}
            placeholder="พิมพ์ชื่อหรือเบอร์โทร..."
            placeholderTextColor={colors.mutedForeground}
            value={query}
            onChangeText={handleSearch}
            autoFocus
            autoCorrect={false}
          />
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        {query.trim() === '' && (
          <View style={styles.hint}>
            <Search size={28} color={colors.muted} />
            <Text style={styles.hintText}>ค้นหาจากชื่อหรือเบอร์โทรของผู้ใช้ที่มีอยู่ใน backend</Text>
          </View>
        )}

        {query.trim() !== '' && !loading && !!error && (
          <View style={styles.hint}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {query.trim() !== '' && !loading && !error && results.length === 0 && (
          <View style={styles.hint}>
            <Text style={styles.hintText}>ไม่พบผู้ใช้ที่ตรงกับ "{query}"</Text>
          </View>
        )}

        {results.map((user) => {
          const sent = sentIds.has(user.id);

          return (
            <View key={user.id} style={styles.resultCard}>
              <View style={[styles.avatar, { backgroundColor: `${avatarColor(user.id)}22` }]}>
                <Text style={[styles.avatarText, { color: avatarColor(user.id) }]}>{initials(user.display_name)}</Text>
              </View>
              <View style={styles.userInfo}>
                <Text style={styles.userName}>{user.display_name}</Text>
                {user.phone ? <Text style={styles.userPhone}>{user.phone}</Text> : null}
              </View>
              {user.isFriend ? (
                <View style={styles.alreadyFriend}>
                  <Check size={14} color={colors.primary} />
                  <Text style={styles.alreadyFriendText}>เป็นเพื่อนแล้ว</Text>
                </View>
              ) : sent || user.isPending ? (
                <View style={styles.sentBadge}>
                  <Text style={styles.sentText}>ส่งคำขอแล้ว</Text>
                </View>
              ) : (
                <TouchableOpacity style={styles.addBtn} onPress={() => void handleAddFriend(user)}>
                  <UserPlus size={14} color={colors.white} />
                  <Text style={styles.addBtnText}>เพิ่มเพื่อน</Text>
                </TouchableOpacity>
              )}
            </View>
          );
        })}
      </ScrollView>
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
    paddingTop: 20,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 18, color: colors.foreground, fontFamily: fonts.semiBold },
  searchRow: { paddingHorizontal: 20, paddingBottom: 12 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.regular,
  },
  scroll: { flex: 1 },
  inner: { paddingHorizontal: 20, paddingBottom: 32, gap: 10 },
  hint: { alignItems: 'center', paddingVertical: 48, gap: 12 },
  hintText: {
    fontSize: 13,
    color: colors.mutedForeground,
    textAlign: 'center',
    fontFamily: fonts.regular,
    maxWidth: 260,
  },
  errorText: {
    fontSize: 13,
    color: colors.destructive,
    textAlign: 'center',
    fontFamily: fonts.regular,
    maxWidth: 280,
  },
  resultCard: {
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
  userInfo: { flex: 1 },
  userName: { fontSize: 14, color: colors.foreground, fontFamily: fonts.medium },
  userPhone: { fontSize: 12, color: colors.mutedForeground, marginTop: 2, fontFamily: fonts.regular },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: { color: colors.white, fontSize: 12, fontFamily: fonts.medium },
  sentBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.muted,
  },
  sentText: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  alreadyFriend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: colors.primary10,
  },
  alreadyFriendText: { fontSize: 12, color: colors.primary, fontFamily: fonts.regular },
});
