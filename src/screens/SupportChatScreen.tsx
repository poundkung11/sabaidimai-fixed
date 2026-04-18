import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { useApp } from '../context/AppContext';
import { getSupportMessages, sendSupportMessage, SupportMessage } from '../services/api';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

export function SupportChatScreen() {
  const navigation = useNavigation<any>();
  const { currentUserId } = useApp();
  const userId = currentUserId ?? 1;

  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const scrollToBottom = () => {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const loadMessages = async ({ silent = false }: { silent?: boolean } = {}) => {
    if (!silent) setIsLoading(true);
    try {
      const data = await getSupportMessages(userId);
      setMessages(data);
      setError(null);
      scrollToBottom();
    } catch (e: any) {
      setError(e.message || 'โหลดข้อความไม่สำเร็จ');
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadMessages();

    const interval = setInterval(() => {
      void loadMessages({ silent: true });
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages.length]);

  const handleSend = async () => {
    const content = newMessage.trim();
    if (!content || isSending) return;

    try {
      setIsSending(true);
      setNewMessage('');
      const data = await sendSupportMessage(content, userId);
      setMessages(data);
      setError(null);
      scrollToBottom();
    } catch (e: any) {
      setError(e.message || 'ส่งข้อความไม่สำเร็จ');
      setNewMessage(content);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ContactSupport')}>
          <ArrowLeft size={20} color={colors.mutedForeground} />
        </TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
          <Text style={styles.avatarText}>S</Text>
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>ทีมช่วยเหลือ</Text>
          <Text style={styles.headerStatus}>เชื่อมต่อกับ backend support thread</Text>
        </View>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => void loadMessages()} style={styles.retryBtn}>
            <Text style={styles.retryText}>ลองใหม่</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {isLoading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>กำลังโหลดข้อความ...</Text>
        </View>
      ) : (
        <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesInner}>
          {messages.map((msg) => (
            <View key={msg.id} style={[styles.msgRow, msg.isOwn && styles.msgRowOwn]}>
              {!msg.isOwn && (
                <View style={[styles.avatar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.avatarText}>S</Text>
                </View>
              )}
              <View style={[styles.bubble, msg.isOwn && styles.bubbleOwn]}>
                <Text style={[styles.bubbleText, msg.isOwn && styles.bubbleTextOwn]}>{msg.content}</Text>
                <Text style={[styles.bubbleTime, msg.isOwn && styles.bubbleTimeOwn]}>{msg.timestamp}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      <View style={styles.inputBar}>
        <TextInput
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="พิมพ์ข้อความ..."
          placeholderTextColor={colors.mutedForeground}
          style={styles.input}
          multiline
          editable={!isSending}
        />
        <TouchableOpacity
          style={[styles.sendBtn, (!newMessage.trim() || isSending) && styles.sendBtnDisabled]}
          onPress={() => void handleSend()}
          disabled={!newMessage.trim() || isSending}
        >
          {isSending ? <ActivityIndicator size="small" color={colors.white} /> : <Send size={20} color={colors.white} />}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: colors.white, fontSize: 14, fontFamily: fonts.medium },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.medium },
  headerStatus: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: colors.mutedForeground, fontFamily: fonts.regular },
  errorBox: {
    marginHorizontal: 24,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    backgroundColor: colors.destructive10,
    borderWidth: 1,
    borderColor: colors.destructive20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  errorText: { flex: 1, color: colors.foreground, fontSize: 13, fontFamily: fonts.regular },
  retryBtn: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: colors.white },
  retryText: { color: colors.destructive, fontSize: 13, fontFamily: fonts.medium },
  messages: { flex: 1 },
  messagesInner: { padding: 24, gap: 16, flexGrow: 1 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  msgRowOwn: { flexDirection: 'row-reverse' },
  bubble: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '80%' },
  bubbleOwn: { backgroundColor: colors.primary, borderWidth: 0 },
  bubbleText: { fontSize: 15, color: colors.foreground, lineHeight: 22, fontFamily: fonts.regular },
  bubbleTextOwn: { color: colors.white },
  bubbleTime: { fontSize: 11, color: colors.mutedForeground, marginTop: 4, fontFamily: fonts.regular },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.7)' },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  input: { flex: 1, minHeight: 48, maxHeight: 120, backgroundColor: colors.inputBackground, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: colors.foreground, fontFamily: fonts.regular },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sendBtnDisabled: { opacity: 0.5 },
});
