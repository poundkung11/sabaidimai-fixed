import React, { useEffect, useRef, useState } from 'react';
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
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import { DEMO_USER_ID } from '../config/api';
import {
  getFriendConversation,
  getMessages,
  sendChatMessage,
  type ChatMessage,
} from '../services/api';

const AVATAR_COLORS = ['#7FA882', '#D9A95F', '#6B9AB1', '#B47C9E', '#C47B6A', '#22C55E'];

function avatarColor(userId: number) {
  return AVATAR_COLORS[userId % AVATAR_COLORS.length];
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

export function DirectChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { conversationId, friendName, friendId } = route.params ?? {};

  const [activeConversationId, setActiveConversationId] = useState<number | null>(conversationId ?? null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [text, setText] = useState('');
  const flatRef = useRef<FlatList>(null);

  useEffect(() => {
    let isMounted = true;

    const loadConversation = async () => {
      try {
        let resolvedConversationId = activeConversationId;

        if (!resolvedConversationId && friendId) {
          const conversation = await getFriendConversation(friendId, DEMO_USER_ID);
          resolvedConversationId = conversation.id;

          if (isMounted) {
            setActiveConversationId(conversation.id);
          }
        }

        if (!resolvedConversationId) {
          if (isMounted) {
            setMessages([]);
          }
          return;
        }

        const history = await getMessages(resolvedConversationId);
        if (isMounted) {
          setMessages(history);
        }
      } catch (error) {
        console.warn('Failed to load conversation history', error);
        if (isMounted) {
          setMessages([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadConversation();

    return () => {
      isMounted = false;
    };
  }, [activeConversationId, friendId]);

  useEffect(() => {
    if (messages.length === 0) return;
    const timer = setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeConversationId || isSending) return;

    try {
      setIsSending(true);
      const created = await sendChatMessage(activeConversationId, trimmed, DEMO_USER_ID);
      setMessages(prev => [...prev, created]);
      setText('');
    } catch (error) {
      console.warn('Failed to send chat message', error);
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
        <View style={styles.headerCenter}>
          <Text style={styles.headerName}>{friendName || 'แชตส่วนตัว'}</Text>
          <Text style={styles.statusText}>
            {activeConversationId ? 'ซิงก์กับ backend แล้ว' : 'กำลังเตรียมห้องแชต'}
          </Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
          <Text style={styles.loadingText}>กำลังโหลดข้อความ...</Text>
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={item => String(item.id)}
          contentContainerStyle={styles.msgList}
          renderItem={({ item, index }) => {
            const isOwn = item.sender_id === DEMO_USER_ID;
            const prev = messages[index - 1];
            const showSender = !isOwn && (!prev || prev.sender_id !== item.sender_id);
            const bubbleColor = avatarColor(item.sender_id);

            return (
              <View style={[styles.msgWrap, isOwn ? styles.msgWrapOwn : styles.msgWrapOther]}>
                {!isOwn && (
                  <View style={[styles.msgAvatar, { backgroundColor: `${bubbleColor}22` }]}>
                    <Text style={[styles.msgAvatarText, { color: bubbleColor }]}>
                      {initials(item.sender_name)}
                    </Text>
                  </View>
                )}
                <View style={styles.msgContent}>
                  {showSender && <Text style={styles.msgSenderName}>{item.sender_name}</Text>}
                  <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
                    <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{item.content}</Text>
                  </View>
                  <Text style={[styles.msgTime, isOwn && styles.msgTimeOwn]}>
                    {formatTime(item.sent_at)}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyChat}>
              <Text style={styles.emptyChatText}>เริ่มต้นการสนทนากับ {friendName} ได้เลย</Text>
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
          multiline
          maxLength={500}
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
          editable={Boolean(activeConversationId) && !isSending}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!text.trim() || !activeConversationId || isSending) && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || !activeConversationId || isSending}
        >
          <Send size={18} color={text.trim() && activeConversationId ? colors.white : colors.mutedForeground} />
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
  headerCenter: { flex: 1 },
  headerName: { fontSize: 16, color: colors.foreground, fontFamily: fonts.semiBold },
  statusText: { fontSize: 11, color: colors.mutedForeground, fontFamily: fonts.regular, marginTop: 2 },
  loadingBox: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10 },
  loadingText: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  msgList: { padding: 16, gap: 6 },
  msgWrap: { flexDirection: 'row', gap: 8, maxWidth: '80%' },
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
    maxWidth: 260,
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
    fontFamily: fonts.regular,
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
