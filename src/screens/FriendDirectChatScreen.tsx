import React, { useEffect, useMemo, useRef, useState } from 'react';
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
import { useMqtt } from '../hooks/useMqtt';
import { MQTT_BROKER_URL, MQTT_TOPIC_PREFIX } from '../config/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';
import {
  getFriendConversation,
  getMessages,
  getUser,
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
  pending?: boolean;
  failed?: boolean;
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

export function FriendDirectChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { currentUserId } = useApp();
  const userId = currentUserId ?? 1;
  const { conversationId, friendName, friendId } = route.params ?? {};

  const [activeConversationId, setActiveConversationId] = useState<number | null>(conversationId ?? null);
  const [messages, setMessages] = useState<UiMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [text, setText] = useState('');
  const [selfName, setSelfName] = useState(`User ${userId}`);
  const flatRef = useRef<FlatList>(null);

  const mqttTopic = useMemo(() => {
    if (!activeConversationId) {
      return null;
    }

    return `${MQTT_TOPIC_PREFIX}/${activeConversationId}`;
  }, [activeConversationId]);

  const { status: mqttStatus, messages: liveMessages, sendMessage: publishMessage } = useMqtt({
    brokerUrl: MQTT_BROKER_URL,
    topic: mqttTopic,
    userId,
    username: selfName,
    avatarColor: avatarColor(userId),
  });

  useEffect(() => {
    let isMounted = true;

    getUser(userId)
      .then((user) => {
        if (isMounted) {
          setSelfName(user.display_name);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSelfName(`User ${userId}`);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    const loadConversation = async () => {
      setIsLoading(true);

      try {
        let resolvedConversationId = activeConversationId;

        if (!resolvedConversationId && friendId) {
          const conversation = await getFriendConversation(friendId, userId);
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

        const history = await getMessages(resolvedConversationId, 50, userId);
        if (isMounted) {
          setMessages(history.map(mapStoredMessage));
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
  }, [activeConversationId, friendId, userId]);

  const latestLiveMessage = liveMessages[liveMessages.length - 1];

  useEffect(() => {
    if (!latestLiveMessage) {
      return;
    }

    setMessages((previous) => {
      const existingIndex = previous.findIndex(
        (message) => message.id === latestLiveMessage.clientMessageId
      );

      if (existingIndex >= 0) {
        const next = [...previous];
        next[existingIndex] = {
          ...next[existingIndex],
          senderId: latestLiveMessage.senderId ?? next[existingIndex].senderId,
          senderName: latestLiveMessage.senderName,
          content: latestLiveMessage.content,
          sentAt: latestLiveMessage.sentAt,
          pending: false,
          failed: false,
        };
        return next;
      }

      return [
        ...previous,
        {
          id: latestLiveMessage.clientMessageId,
          senderId: latestLiveMessage.senderId ?? (latestLiveMessage.isOwn ? userId : friendId ?? 0),
          senderName: latestLiveMessage.senderName,
          content: latestLiveMessage.content,
          sentAt: latestLiveMessage.sentAt,
        },
      ];
    });
  }, [friendId, latestLiveMessage, userId]);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }

    const timer = setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 80);
    return () => clearTimeout(timer);
  }, [messages]);

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || !activeConversationId || isSending) {
      return;
    }

    const optimisticId = `${userId}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    const optimisticSentAt = new Date().toISOString();
    const optimisticMessage: UiMessage = {
      id: optimisticId,
      senderId: userId,
      senderName: selfName,
      content: trimmed,
      sentAt: optimisticSentAt,
      pending: mqttStatus === 'connected',
    };

    setMessages((previous) => [...previous, optimisticMessage]);
    setText('');

    if (mqttStatus === 'connected') {
      publishMessage(trimmed, {
        clientMessageId: optimisticId,
        senderId: userId,
        senderName: selfName,
        sentAt: optimisticSentAt,
      });
    }

    try {
      setIsSending(true);
      const created = await sendChatMessage(activeConversationId, trimmed, userId);

      setMessages((previous) =>
        previous.map((message) =>
          message.id === optimisticId
            ? {
                ...mapStoredMessage(created),
                pending: false,
                failed: false,
              }
            : message
        )
      );
    } catch (error) {
      console.warn('Failed to send chat message', error);
      setMessages((previous) =>
        previous.map((message) =>
          message.id === optimisticId
            ? {
                ...message,
                pending: false,
                failed: true,
              }
            : message
        )
      );
    } finally {
      setIsSending(false);
    }
  };

  const statusText = useMemo(() => {
    if (!activeConversationId) {
      return 'กำลังเตรียมห้องแชต';
    }

    if (mqttStatus === 'connected') {
      return 'เชื่อมต่อ MQTT แล้ว';
    }

    if (mqttStatus === 'connecting') {
      return 'กำลังเชื่อมต่อ MQTT...';
    }

    if (mqttStatus === 'error') {
      return 'MQTT มีปัญหา ใช้ backend อย่างเดียว';
    }

    return 'ออฟไลน์ ใช้ประวัติจาก backend';
  }, [activeConversationId, mqttStatus]);

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
          <Text style={styles.statusText}>{statusText}</Text>
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.msgList}
          renderItem={({ item, index }) => {
            const isOwn = item.senderId === userId;
            const previous = messages[index - 1];
            const showSender = !isOwn && (!previous || previous.senderId !== item.senderId);
            const bubbleColor = avatarColor(item.senderId || 0);

            return (
              <View style={[styles.msgWrap, isOwn ? styles.msgWrapOwn : styles.msgWrapOther]}>
                {!isOwn && (
                  <View style={[styles.msgAvatar, { backgroundColor: `${bubbleColor}22` }]}>
                    <Text style={[styles.msgAvatarText, { color: bubbleColor }]}>
                      {initials(item.senderName)}
                    </Text>
                  </View>
                )}
                <View style={styles.msgContent}>
                  {showSender ? <Text style={styles.msgSenderName}>{item.senderName}</Text> : null}
                  <View
                    style={[
                      styles.bubble,
                      isOwn ? styles.bubbleOwn : styles.bubbleOther,
                      item.failed && styles.bubbleFailed,
                    ]}
                  >
                    <Text style={[styles.bubbleText, isOwn && styles.bubbleTextOwn]}>{item.content}</Text>
                  </View>
                  <Text style={[styles.msgTime, isOwn && styles.msgTimeOwn]}>
                    {formatTime(item.sentAt)}
                    {item.pending ? ' • กำลังซิงก์' : ''}
                    {item.failed ? ' • บันทึกไม่สำเร็จ' : ''}
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
          keyboardType="default"
          multiline
          scrollEnabled
          maxLength={500}
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
  bubbleFailed: {
    borderWidth: 1,
    borderColor: colors.destructive20,
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
