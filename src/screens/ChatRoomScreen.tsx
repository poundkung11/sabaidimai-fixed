import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import {
  getMessages,
  joinCommunityRoom,
  sendChatMessage,
  type ChatMessage,
} from '../services/api';

const AVATAR_COLORS = ['#7FA882', '#D9A95F', '#6B9AB1', '#B47C9E', '#C47B6A', '#22C55E'];

interface UiMessage {
  id: string;
  senderId: number;
  senderName: string;
  content: string;
  sentAt: string;
}

function avatarColor(userId: number) {
  return AVATAR_COLORS[Math.abs(userId) % AVATAR_COLORS.length];
}

function initials(name: string) {
  const words = name.trim().split(' ').filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0]}${words[1][0]}`.toUpperCase();
  }

  return name.slice(0, 2).toUpperCase();
}

function formatTime(isoString: string) {
  try {
    return new Date(isoString).toLocaleTimeString('th-TH', {
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '';
  }
}

function mapStoredMessage(message: ChatMessage): UiMessage {
  return {
    id: `db-${message.id}`,
    senderId: message.sender_id,
    senderName: message.sender_name,
    content: message.content,
    sentAt: message.sent_at,
  };
}

function sameMessages(left: UiMessage[], right: UiMessage[]) {
  if (left.length !== right.length) {
    return false;
  }

  for (let index = 0; index < left.length; index += 1) {
    if (
      left[index].id !== right[index].id ||
      left[index].content !== right[index].content ||
      left[index].sentAt !== right[index].sentAt
    ) {
      return false;
    }
  }

  return true;
}

export function ChatRoomScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentUserId } = useApp();
  const userId = currentUserId ?? 1;
  const {
    roomId = 'general',
    roomName = 'ห้องแชต',
    roomIcon = '💬',
  } = route.params ?? {};

  const [activeConversationId, setActiveConversationId] = useState<number | null>(
    route.params?.conversationId ?? null
  );
  const [resolvedRoomName, setResolvedRoomName] = useState(roomName);
  const [resolvedRoomIcon, setResolvedRoomIcon] = useState(roomIcon);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const flatRef = useRef<FlatList>(null);

  const loadHistory = useCallback(
    async (conversationId: number) => {
      const history = await getMessages(conversationId, 100, userId);
      const nextMessages = history.map(mapStoredMessage);

      setMessages((previous) => (sameMessages(previous, nextMessages) ? previous : nextMessages));
    },
    [userId]
  );

  const initializeRoom = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const session = await joinCommunityRoom(roomId, userId);
      setResolvedRoomName(session.room.name);
      setResolvedRoomIcon(session.room.icon);
      setActiveConversationId(session.conversation.id);
      await loadHistory(session.conversation.id);
    } catch (loadError) {
      console.warn('Failed to initialize community room', loadError);
      setMessages([]);
      setError('ยังเชื่อมห้องแชตกับ backend ไม่สำเร็จ');
    } finally {
      setIsLoading(false);
    }
  }, [loadHistory, roomId, userId]);

  useEffect(() => {
    void initializeRoom();
  }, [initializeRoom]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    const interval = setInterval(() => {
      void loadHistory(activeConversationId).catch((pollError) => {
        console.warn('Failed to refresh community room messages', pollError);
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [activeConversationId, loadHistory]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const timer = setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages]);

  const statusText = useMemo(() => {
    if (isLoading) {
      return 'กำลังเชื่อม backend...';
    }

    if (error) {
      return 'เชื่อม backend ไม่สำเร็จ';
    }

    if (!activeConversationId) {
      return 'กำลังเตรียมห้องแชต';
    }

    return 'เชื่อมกับ backend แล้ว';
  }, [activeConversationId, error, isLoading]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeConversationId || isSending) {
      return;
    }

    try {
      setIsSending(true);
      setError(null);
      const created = await sendChatMessage(activeConversationId, trimmed, userId);
      setMessages((previous) => [...previous, mapStoredMessage(created)]);
      setText('');
    } catch (sendError) {
      console.warn('Failed to send community room message', sendError);
      setError('ส่งข้อความไม่สำเร็จ ลองใหม่อีกครั้ง');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <Text style={styles.roomIcon}>{resolvedRoomIcon}</Text>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>{resolvedRoomName}</Text>
          <Text style={styles.headerSubtitle}>{statusText}</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => void initializeRoom()}>
            <Text style={styles.retryBtnText}>ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>กำลังโหลดข้อความจาก backend...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.msgList}
          renderItem={({ item, index }) => {
            const isOwn = item.senderId === userId;
            const previous = messages[index - 1];
            const showSender = !isOwn && (!previous || previous.senderId !== item.senderId);
            const bubbleColor = avatarColor(item.senderId || 0);

            return (
              <View style={[styles.msgWrap, isOwn ? styles.msgWrapOwn : styles.msgWrapOther]}>
                {!isOwn ? (
                  <View style={[styles.msgAvatar, { backgroundColor: `${bubbleColor}22` }]}>
                    <Text style={[styles.msgAvatarText, { color: bubbleColor }]}>
                      {initials(item.senderName)}
                    </Text>
                  </View>
                ) : null}
                <View style={styles.msgContent}>
                  {showSender ? <Text style={styles.msgSenderName}>{item.senderName}</Text> : null}
                  <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{item.content}</Text>
                  </View>
                  <Text style={[styles.msgTime, isOwn && styles.msgTimeOwn]}>{formatTime(item.sentAt)}</Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>ยังไม่มีข้อความในห้องนี้ เริ่มคุยได้เลย</Text>
            </View>
          }
        />
      )}

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder={activeConversationId ? 'พิมพ์ข้อความ...' : 'กำลังเตรียมห้องแชต...'}
          placeholderTextColor={colors.mutedForeground}
          keyboardType="default"
          multiline
          scrollEnabled
          maxLength={500}
          blurOnSubmit={false}
          editable={Boolean(activeConversationId) && !isSending}
        />
        <TouchableOpacity
          style={[
            styles.sendBtn,
            (!text.trim() || !activeConversationId || isSending) && styles.sendBtnDisabled,
          ]}
          onPress={handleSend}
          disabled={!text.trim() || !activeConversationId || isSending}
        >
          {isSending ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Send
              size={18}
              color={text.trim() && activeConversationId ? colors.white : colors.mutedForeground}
            />
          )}
        </TouchableOpacity>
      </View>
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
    paddingTop: 20,
    paddingBottom: 14,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.muted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomIcon: { fontSize: 22 },
  headerCenter: { flex: 1 },
  headerTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.semiBold },
  headerSubtitle: { fontSize: 11, color: colors.mutedForeground, fontFamily: fonts.regular, marginTop: 2 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.destructive10,
    borderBottomWidth: 1,
    borderBottomColor: colors.destructive20,
  },
  errorBannerText: { flex: 1, fontSize: 12, color: colors.foreground, fontFamily: fonts.regular },
  retryBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  retryBtnText: { fontSize: 12, color: colors.foreground, fontFamily: fonts.medium },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  msgList: { padding: 16, gap: 6, flexGrow: 1 },
  msgWrap: { flexDirection: 'row', gap: 8, maxWidth: '82%' },
  msgWrapOwn: { alignSelf: 'flex-end', flexDirection: 'row-reverse' },
  msgWrapOther: { alignSelf: 'flex-start' },
  msgAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
  },
  msgAvatarText: { fontSize: 11, fontFamily: fonts.semiBold },
  msgContent: { gap: 2 },
  msgSenderName: {
    fontSize: 11,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
    marginLeft: 2,
  },
  bubble: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 9,
    maxWidth: 280,
  },
  bubbleOther: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  bubbleText: {
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.regular,
    lineHeight: 20,
  },
  bubbleTextOwn: { color: colors.white },
  msgTime: { fontSize: 10, color: colors.mutedForeground, fontFamily: fonts.regular, marginLeft: 4 },
  msgTimeOwn: { textAlign: 'right', marginRight: 4 },
  emptyChat: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 80 },
  emptyChatText: {
    fontSize: 13,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
    textAlign: 'center',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: colors.foreground,
    fontFamily: fonts.input,
    textAlignVertical: 'top',
    maxHeight: 100,
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: colors.muted },
});
