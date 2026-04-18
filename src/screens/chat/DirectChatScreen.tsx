/**
 * DirectChatScreen.tsx — แชทส่วนตัวระหว่างผู้ใช้ (WebSocket real-time)
 * screens/chat/DirectChatScreen.tsx
 */
import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, KeyboardAvoidingView, Platform, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Send, Wifi, WifiOff, MoreVertical } from 'lucide-react-native';
import { colors } from '../../theme/colors';
import { fonts } from '../../theme/fonts';
import { ChatBubble } from '../../components/ChatBubble';
import {
  getMessages, getChatToken, ChatWebSocket,
  type ChatMessage, type AppUser, type WSMessage,
} from '../../services/chatApi';

export function DirectChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { conversationId, otherUser } = route.params as { conversationId: number; otherUser: AppUser };

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingName, setTypingName] = useState('');

  const wsRef = useRef<ChatWebSocket | null>(null);
  const flatRef = useRef<FlatList>(null);
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load history
  useEffect(() => {
    getMessages(conversationId)
      .then(setMessages)
      .catch(console.warn)
      .finally(() => setIsLoading(false));
  }, [conversationId]);

  // WebSocket
  useEffect(() => {
    let ws: ChatWebSocket;
    getChatToken().then(token => {
      if (!token) { setWsStatus('disconnected'); return; }
      ws = new ChatWebSocket(token);
      wsRef.current = ws;

      ws.onStatus(s => setWsStatus(s));

      ws.onMessage((msg: WSMessage) => {
        if (msg.type === 'authed') {
          ws.join(conversationId);
        } else if (msg.type === 'message' && msg.conversationId === conversationId) {
          setMessages(prev => {
            // deduplicate by id
            if (prev.some(m => m.id === msg.id)) return prev;
            return [...prev, {
              id: msg.id,
              conversationId: msg.conversationId,
              senderId: msg.senderId,
              senderName: msg.senderName,
              avatarColor: msg.avatarColor,
              initials: msg.initials,
              content: msg.content,
              type: msg.msgType,
              isOwn: msg.isOwn,
              sentAt: msg.sentAt,
            }];
          });
          setTimeout(() => flatRef.current?.scrollToEnd({ animated: true }), 60);
        } else if (msg.type === 'typing' && msg.conversationId === conversationId) {
          if (msg.isTyping) {
            setIsTyping(true);
            setTypingName(msg.senderName);
            if (typingTimer.current) clearTimeout(typingTimer.current);
            typingTimer.current = setTimeout(() => setIsTyping(false), 3000);
          } else {
            setIsTyping(false);
          }
        }
      });

      ws.connect();
    });

    return () => {
      ws?.disconnect();
      if (typingTimer.current) clearTimeout(typingTimer.current);
    };
  }, [conversationId]);

  const handleInputChange = (text: string) => {
    setInput(text);
    wsRef.current?.sendTyping(conversationId, text.length > 0);
  };

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed) return;
    setInput('');
    wsRef.current?.sendTyping(conversationId, false);
    if (wsRef.current && wsStatus === 'connected') {
      wsRef.current.sendMessage(conversationId, trimmed);
    }
  }, [input, wsStatus, conversationId]);

  const scrollToBottom = () => {
    if (messages.length > 0) flatRef.current?.scrollToEnd({ animated: true });
  };

  useEffect(() => { scrollToBottom(); }, [messages.length]);

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>

        <View style={[styles.headerAvatar, { backgroundColor: otherUser?.avatarColor || '#7FA882' }]}>
          <Text style={styles.headerAvatarText}>{otherUser?.initials || '??'}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerName}>{otherUser?.displayName || 'แชท'}</Text>
          <View style={styles.statusRow}>
            {wsStatus === 'connected'
              ? <><Wifi size={11} color={colors.primary} /><Text style={[styles.statusText, { color: colors.primary }]}>ออนไลน์</Text></>
              : wsStatus === 'connecting'
                ? <><ActivityIndicator size={10} color={colors.warning ?? '#f59e0b'} /><Text style={[styles.statusText, { color: colors.warning ?? '#f59e0b' }]}>กำลังเชื่อมต่อ...</Text></>
                : <><WifiOff size={11} color={colors.destructive ?? '#ef4444'} /><Text style={[styles.statusText, { color: colors.destructive ?? '#ef4444' }]}>ออฟไลน์</Text></>
            }
          </View>
        </View>

        <TouchableOpacity><MoreVertical size={20} color={colors.mutedForeground} /></TouchableOpacity>
      </View>

      {/* Messages */}
      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          ref={flatRef}
          data={messages}
          keyExtractor={m => String(m.id)}
          contentContainerStyle={styles.msgList}
          onContentSizeChange={scrollToBottom}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyEmoji}>👋</Text>
              <Text style={styles.emptyText}>เริ่มต้นการสนทนากับ {otherUser?.displayName}</Text>
            </View>
          }
          renderItem={({ item, index }) => {
            const prev = messages[index - 1];
            const showAvatar = !item.isOwn && (prev?.senderId !== item.senderId);
            return (
              <ChatBubble
                key={item.id}
                content={item.content}
                sentAt={item.sentAt}
                isOwn={item.isOwn}
                senderName={item.isOwn ? undefined : item.senderName}
                avatarColor={item.avatarColor}
                initials={item.initials}
                showAvatar={showAvatar}
              />
            );
          }}
        />
      )}

      {/* Typing indicator */}
      {isTyping && (
        <View style={styles.typingBar}>
          <Text style={styles.typingText}>{typingName} กำลังพิมพ์...</Text>
        </View>
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={handleInputChange}
          placeholder="พิมพ์ข้อความ..."
          placeholderTextColor={colors.mutedForeground}
          multiline
          maxLength={2000}
          editable={wsStatus !== 'disconnected'}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!input.trim() || wsStatus !== 'connected') && styles.sendBtnDisabled]}
          onPress={handleSend}
          disabled={!input.trim() || wsStatus !== 'connected'}
        >
          <Send size={20} color={colors.white} />
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
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerAvatarText: { color: colors.white, fontSize: 14, fontFamily: fonts.medium },
  headerName: { fontSize: 15, color: colors.foreground, fontFamily: fonts.medium },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 1 },
  statusText: { fontSize: 11, fontFamily: fonts.regular },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  msgList: { paddingHorizontal: 16, paddingVertical: 20, gap: 8, flexGrow: 1 },
  emptyBox: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80, gap: 10 },
  emptyEmoji: { fontSize: 40 },
  emptyText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular, textAlign: 'center' },
  typingBar: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    backgroundColor: colors.background,
  },
  typingText: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular, fontStyle: 'italic' },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 120,
    backgroundColor: colors.inputBackground ?? colors.border,
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: colors.foreground,
    fontFamily: fonts.regular,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
});
