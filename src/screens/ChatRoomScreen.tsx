import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft, Send, MoreVertical } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface Message {
  id: string; username: string; avatarColor: string; initials: string;
  content: string; timestamp: string; proximity?: string; isOwn?: boolean;
}

const mockMessages: Message[] = [
  { id: '1', username: 'ผู้ใช้ใกล้คุณ', avatarColor: '#7FA882', initials: 'ผท', content: 'สวัสดีครับ มีใครออนไลน์อยู่บ้าง', timestamp: '10:30', proximity: 'ใกล้คุณ' },
  { id: '2', username: 'ผู้ใช้ใกล้คุณ', avatarColor: '#D9A95F', initials: 'ผท', content: 'สวัสดีค่ะ 👋', timestamp: '10:32', proximity: 'ในพื้นที่เดียวกัน' },
  { id: '3', username: 'ผู้ใช้ใกล้คุณ', avatarColor: '#6B9AB1', initials: 'ผท', content: 'วันนี้อากาศดีจังเลย ออกไปเดินเล่นมั้ยคะ', timestamp: '10:35', proximity: 'ใกล้คุณ' },
];

export function ChatRoomScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { roomName = 'ทั่วไป', roomIcon = '💬' } = route.params || {};
  const [messages, setMessages] = useState<Message[]>(mockMessages);
  const [newMessage, setNewMessage] = useState('');
  const scrollRef = useRef<ScrollView>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const msg: Message = {
      id: Date.now().toString(), username: 'คุณ', avatarColor: '#22C55E', initials: 'คณ',
      content: newMessage, timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }), isOwn: true,
    };
    setMessages([...messages, msg]);
    setNewMessage('');
    scrollTimerRef.current = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ChatRooms')}><ArrowLeft size={20} color={colors.mutedForeground} /></TouchableOpacity>
        <Text style={styles.roomIcon}>{roomIcon}</Text>
        <Text style={styles.headerTitle}>{roomName}</Text>
      </View>

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesInner} onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.isOwn && styles.msgRowOwn]}>
            {!msg.isOwn && (
              <View style={[styles.avatar, { backgroundColor: msg.avatarColor }]}> 
                <Text style={styles.avatarText}>{msg.initials}</Text>
              </View>
            )}
            <View style={[styles.msgContent, msg.isOwn && styles.msgContentOwn]}>
              {!msg.isOwn && (
                <View style={styles.msgMeta}>
                  <Text style={styles.msgUsername}>{msg.username}</Text>
                  {msg.proximity && <><Text style={styles.msgDot}>•</Text><Text style={styles.msgUsername}>{msg.proximity}</Text></>}
                  <TouchableOpacity><MoreVertical size={12} color={colors.mutedForeground} /></TouchableOpacity>
                </View>
              )}
              <View style={[styles.bubble, msg.isOwn && styles.bubbleOwn]}>
                <Text style={[styles.bubbleText, msg.isOwn && styles.bubbleTextOwn]}>{msg.content}</Text>
                <Text style={[styles.bubbleTime, msg.isOwn && styles.bubbleTimeOwn]}>{msg.timestamp}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput value={newMessage} onChangeText={setNewMessage} placeholder="พิมพ์ข้อความ..." placeholderTextColor={colors.mutedForeground} style={styles.input} multiline />
        <TouchableOpacity style={[styles.sendBtn, !newMessage.trim() && styles.sendBtnDisabled]} onPress={handleSend} disabled={!newMessage.trim()}>
          <Send size={20} color={colors.white} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card, gap: 8 },
  roomIcon: { fontSize: 22 },
  headerTitle: { fontSize: 17, color: colors.foreground, fontFamily: fonts.medium, flex: 1 },
  messages: { flex: 1 },
  messagesInner: { padding: 24, gap: 16 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  msgRowOwn: { flexDirection: 'row-reverse' },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: colors.white, fontSize: 13, fontFamily: fonts.medium },
  msgContent: { flex: 1, alignItems: 'flex-start' },
  msgContentOwn: { alignItems: 'flex-end' },
  msgMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  msgUsername: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  msgDot: { fontSize: 12, color: colors.mutedForeground },
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
