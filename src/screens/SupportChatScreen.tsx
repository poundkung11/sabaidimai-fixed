import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { ArrowLeft, Send } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface Message { id: string; content: string; timestamp: string; isOwn: boolean; }

export function SupportChatScreen() {
  const navigation = useNavigation<any>();
  const now = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', content: 'สวัสดีค่ะ ยินดีต้อนรับสู่ทีมช่วยเหลือของ Sabaai-Dii-Mai 💚', timestamp: now, isOwn: false },
    { id: '2', content: 'มีอะไรให้เราช่วยแนะนำไหมคะ?', timestamp: now, isOwn: false },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const replyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (replyTimerRef.current) clearTimeout(replyTimerRef.current);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const handleSend = () => {
    if (!newMessage.trim()) return;
    const ts = new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });
    setMessages(prev => [...prev, { id: Date.now().toString(), content: newMessage, timestamp: ts, isOwn: true }]);
    setNewMessage('');
    setIsTyping(true);
    replyTimerRef.current = setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { id: (Date.now() + 1).toString(), content: 'ขอบคุณที่ติดต่อเรานะคะ ทีมงานจะตรวจสอบและตอบกลับโดยเร็วที่สุดค่ะ 😊', timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }), isOwn: false }]);
    }, 2000);
    scrollTimerRef.current = setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.navigate('ContactSupport')}><ArrowLeft size={20} color={colors.mutedForeground} /></TouchableOpacity>
        <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={styles.avatarText}>S</Text></View>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>ทีมช่วยเหลือ</Text>
          <Text style={styles.headerStatus}>{isTyping ? 'กำลังพิมพ์...' : 'ออนไลน์'}</Text>
        </View>
      </View>

      <ScrollView ref={scrollRef} style={styles.messages} contentContainerStyle={styles.messagesInner}>
        {messages.map(msg => (
          <View key={msg.id} style={[styles.msgRow, msg.isOwn && styles.msgRowOwn]}>
            {!msg.isOwn && <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={styles.avatarText}>S</Text></View>}
            <View style={[styles.bubble, msg.isOwn && styles.bubbleOwn]}>
              <Text style={[styles.bubbleText, msg.isOwn && styles.bubbleTextOwn]}>{msg.content}</Text>
              <Text style={[styles.bubbleTime, msg.isOwn && styles.bubbleTimeOwn]}>{msg.timestamp}</Text>
            </View>
          </View>
        ))}
        {isTyping && (
          <View style={styles.msgRow}>
            <View style={[styles.avatar, { backgroundColor: colors.primary }]}><Text style={styles.avatarText}>S</Text></View>
            <View style={styles.typingBubble}>
              <Text style={styles.typingDots}>• • •</Text>
            </View>
          </View>
        )}
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
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card, gap: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  avatarText: { color: colors.white, fontSize: 14, fontFamily: fonts.medium },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 16, color: colors.foreground, fontFamily: fonts.medium },
  headerStatus: { fontSize: 13, color: colors.mutedForeground, fontFamily: fonts.regular },
  messages: { flex: 1 },
  messagesInner: { padding: 24, gap: 16 },
  msgRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 12 },
  msgRowOwn: { flexDirection: 'row-reverse' },
  bubble: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, maxWidth: '80%' },
  bubbleOwn: { backgroundColor: colors.primary, borderWidth: 0 },
  bubbleText: { fontSize: 15, color: colors.foreground, lineHeight: 22, fontFamily: fonts.regular },
  bubbleTextOwn: { color: colors.white },
  bubbleTime: { fontSize: 11, color: colors.mutedForeground, marginTop: 4, fontFamily: fonts.regular },
  bubbleTimeOwn: { color: 'rgba(255,255,255,0.7)' },
  typingBubble: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 },
  typingDots: { fontSize: 18, color: colors.mutedForeground, letterSpacing: 4 },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, paddingHorizontal: 24, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card },
  input: { flex: 1, minHeight: 48, maxHeight: 120, backgroundColor: colors.inputBackground, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, color: colors.foreground, fontFamily: fonts.regular },
  sendBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  sendBtnDisabled: { opacity: 0.5 },
});
