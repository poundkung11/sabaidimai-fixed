/**
 * SearchUserScreen.tsx — ค้นหาและเพิ่มเพื่อน
 * screens/community/SearchUserScreen.tsx
 */
import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, TextInput, StyleSheet, FlatList,
  TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Search, X } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { UserListItem } from '../../components/UserListItem';
import {
  searchUsers, sendFriendRequest, respondFriendRequest,
  openDirectConversation,
  type SearchResult,
} from '../../services/chatApi';

export function SearchUserScreen() {
  const navigation = useNavigation<any>();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim() || text.trim().length < 2) { setResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await searchUsers(text.trim());
        setResults(data);
      } catch (e: any) {
        setError(e.message || 'ค้นหาไม่สำเร็จ');
      } finally {
        setIsLoading(false);
      }
    }, 400);
  }, []);

  const handleAdd = async (user: SearchResult) => {
    setLoadingId(user.id);
    try {
      await sendFriendRequest(user.id);
      setResults(prev => prev.map(u => u.id === user.id
        ? { ...u, friendshipStatus: 'pending', isRequester: true }
        : u
      ));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleAccept = async (user: SearchResult) => {
    if (!user.friendshipId) return;
    setLoadingId(user.id);
    try {
      await respondFriendRequest(user.friendshipId, 'accept');
      setResults(prev => prev.map(u => u.id === user.id ? { ...u, friendshipStatus: 'accepted' } : u));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleReject = async (user: SearchResult) => {
    if (!user.friendshipId) return;
    setLoadingId(user.id);
    try {
      await respondFriendRequest(user.friendshipId, 'reject');
      setResults(prev => prev.map(u => u.id === user.id ? { ...u, friendshipStatus: null, friendshipId: null } : u));
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  const handleMessage = async (user: SearchResult) => {
    setLoadingId(user.id);
    try {
      const { conversationId } = await openDirectConversation(user.id);
      navigation.navigate('DirectChat', { conversationId, otherUser: user });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoadingId(null);
    }
  };

  function getActionType(u: SearchResult): 'add' | 'pending_sent' | 'pending_received' | 'friends' | 'none' {
    if (!u.friendshipStatus) return 'add';
    if (u.friendshipStatus === 'accepted') return 'friends';
    if (u.friendshipStatus === 'pending') return u.isRequester ? 'pending_sent' : 'pending_received';
    return 'none';
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={styles.searchBar}>
          <Search size={16} color={colors.mutedForeground} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={query}
            onChangeText={handleSearch}
            placeholder="ค้นหา username หรือชื่อ..."
            placeholderTextColor={colors.mutedForeground}
            autoFocus
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => { setQuery(''); setResults([]); }}>
              <X size={16} color={colors.mutedForeground} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Error */}
      {error && (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* Body */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.hint}>กำลังค้นหา...</Text>
        </View>
      ) : query.length < 2 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={styles.emptyTitle}>ค้นหาผู้ใช้</Text>
          <Text style={styles.hint}>พิมพ์ username หรือชื่อที่ต้องการค้นหา</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyEmoji}>😕</Text>
          <Text style={styles.emptyTitle}>ไม่พบผู้ใช้</Text>
          <Text style={styles.hint}>ลองค้นหาด้วยคำอื่น</Text>
        </View>
      ) : (
        <FlatList
          data={results}
          keyExtractor={u => String(u.id)}
          renderItem={({ item }) => (
            <UserListItem
              user={item}
              actionType={getActionType(item)}
              loading={loadingId === item.id}
              onAdd={() => handleAdd(item)}
              onAccept={() => handleAccept(item)}
              onReject={() => handleReject(item)}
              onMessage={() => handleMessage(item)}
            />
          )}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground || colors.border,
    borderRadius: 14,
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
  },
  searchIcon: {},
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: colors.foreground,
    fontFamily: fonts.regular,
  },
  errorBanner: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  errorText: { fontSize: 13, color: '#B91C1C', fontFamily: fonts.regular },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8, paddingBottom: 60 },
  emptyEmoji: { fontSize: 40, marginBottom: 8 },
  emptyTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.medium },
  hint: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
});
