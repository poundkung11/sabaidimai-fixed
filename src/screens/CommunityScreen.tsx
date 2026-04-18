import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Send, Heart, MessageCircle, MoreVertical, MessageSquare } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface Post {
  id: string; username: string; avatarColor: string; initials: string;
  content: string; timeAgo: string; proximity: string; likes: number; comments: number; isLiked?: boolean;
}

const mockPosts: Post[] = [
  { id: '1', username: 'ผู้ใช้ใกล้คุณ', avatarColor: '#7FA882', initials: 'ผท', content: 'วันนี้รู้สึกไม่ค่อยโอเค มีใครคุยด้วยได้ไหม', timeAgo: '15 นาทีที่แล้ว', proximity: 'ใกล้คุณ', likes: 3, comments: 5 },
  { id: '2', username: 'ผู้ใช้ใกล้คุณ', avatarColor: '#D9A95F', initials: 'ผท', content: 'มีใครใช้แอพนี้มานานแล้วบ้าง? รู้สึกดีมากที่มีระบบดูแลแบบนี้', timeAgo: '2 ชั่วโมงที่แล้ว', proximity: 'ในพื้นที่เดียวกัน', likes: 12, comments: 8 },
  { id: '3', username: 'ผู้ใช้ใกล้คุณ', avatarColor: '#6B9AB1', initials: 'ผท', content: 'ขอบคุณทุกคนที่ให้กำลังใจเมื่อวาน ☺️', timeAgo: '5 ชั่วโมงที่แล้ว', proximity: 'ใกล้คุณ', likes: 18, comments: 12 },
  { id: '4', username: 'ผู้ใช้ใกล้คุณ', avatarColor: '#B47C9E', initials: 'ผท', content: 'เพิ่งเจอฟีเจอร์การ์ดข้อมูลทางการแพทย์ รู้สึกปลอดภัยขึ้นเยอะเลย', timeAgo: '1 วันที่แล้ว', proximity: 'ในพื้นที่เดียวกัน', likes: 7, comments: 3 },
];

export function CommunityScreen() {
  const navigation = useNavigation<any>();
  const [posts, setPosts] = useState<Post[]>(mockPosts);
  const [newPostContent, setNewPostContent] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);

  const handleLike = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 } : p));
  };

  const handleSubmit = () => {
    if (!newPostContent.trim()) return;
    setPosts([{ id: Date.now().toString(), username: 'คุณ', avatarColor: '#22C55E', initials: 'คณ', content: newPostContent, timeAgo: 'เมื่อสักครู่', proximity: 'คุณ', likes: 0, comments: 0 }, ...posts]);
    setNewPostContent(''); setShowNewPost(false);
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.privacyBox}>
          <Text style={styles.privacyText}>💚 ชุมชนนี้คือพื้นที่ปลอดภัยสำหรับแบ่งปันความรู้สึก เราไม่แสดงตำแหน่ง GPS ที่แน่นอน เพียงแสดงว่าอยู่ในพื้นที่ใกล้เคียงกันเท่านั้น</Text>
        </View>

        <TouchableOpacity style={styles.chatRoomsBtn} onPress={() => navigation.navigate('ChatRooms')}>
          <View style={styles.chatRoomsLeft}>
            <MessageSquare size={20} color={colors.white} />
            <View>
              <Text style={styles.chatRoomsTitle}>ห้องแชท</Text>
              <Text style={styles.chatRoomsDesc}>เข้าร่วมการสนทนาในห้องต่าง ๆ</Text>
            </View>
          </View>
          <Text style={styles.chatEmoji}>💬</Text>
        </TouchableOpacity>

        {!showNewPost ? (
          <TouchableOpacity style={styles.newPostBtn} onPress={() => setShowNewPost(true)}>
            <View style={[styles.avatar, { backgroundColor: '#22C55E' }]}><Text style={styles.avatarText}>คณ</Text></View>
            <Text style={styles.newPostPlaceholder}>แบ่งปันความรู้สึกของคุณ...</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.newPostForm}>
            <View style={styles.newPostHeader}>
              <View style={[styles.avatar, { backgroundColor: '#22C55E' }]}><Text style={styles.avatarText}>คณ</Text></View>
              <View style={styles.newPostRight}>
                <Text style={styles.newPostAuthor}>คุณ</Text>
                <TextInput value={newPostContent} onChangeText={setNewPostContent} placeholder="แบ่งปันความรู้สึกของคุณ..." placeholderTextColor={colors.mutedForeground} multiline style={styles.newPostInput} />
              </View>
            </View>
            <View style={styles.newPostFooter}>
              <Text style={styles.newPostHint}>จะแสดงว่า "ใกล้คุณ"</Text>
              <View style={styles.newPostActions}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => { setShowNewPost(false); setNewPostContent(''); }}>
                  <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.postBtn, !newPostContent.trim() && styles.postBtnDisabled]} onPress={handleSubmit} disabled={!newPostContent.trim()}>
                  <Send size={14} color={colors.white} />
                  <Text style={styles.postBtnText}>โพสต์</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <View style={styles.posts}>
          {posts.map(post => (
            <View key={post.id} style={styles.postCard}>
              <View style={styles.postHeader}>
                <View style={styles.postHeaderLeft}>
                  <View style={[styles.avatar, { backgroundColor: post.avatarColor }]}><Text style={styles.avatarText}>{post.initials}</Text></View>
                  <View>
                    <Text style={styles.postUsername}>{post.username}</Text>
                    <View style={styles.postMeta}>
                      <Text style={styles.postMetaText}>{post.proximity}</Text>
                      <Text style={styles.postMetaDot}>•</Text>
                      <Text style={styles.postMetaText}>{post.timeAgo}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity><MoreVertical size={16} color={colors.mutedForeground} /></TouchableOpacity>
              </View>
              <Text style={styles.postContent}>{post.content}</Text>
              <View style={styles.postActions}>
                <TouchableOpacity style={styles.actionBtn} onPress={() => handleLike(post.id)}>
                  <Heart size={16} color={post.isLiked ? colors.primary : colors.mutedForeground} fill={post.isLiked ? colors.primary : 'transparent'} />
                  <Text style={[styles.actionCount, post.isLiked && styles.actionCountLiked]}>{post.likes}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionBtn}>
                  <MessageCircle size={16} color={colors.mutedForeground} />
                  <Text style={styles.actionCount}>{post.comments}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.endText}>คุณเห็นโพสต์ทั้งหมดแล้ว</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  privacyBox: { marginHorizontal: 24, marginTop: 16, marginBottom: 16, backgroundColor: colors.primary5, borderWidth: 1, borderColor: colors.primary20, borderRadius: 16, padding: 16 },
  privacyText: { fontSize: 12, color: colors.mutedForeground, lineHeight: 18, fontFamily: fonts.regular },
  chatRoomsBtn: { marginHorizontal: 24, marginBottom: 16, backgroundColor: colors.primary, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chatRoomsLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chatRoomsTitle: { fontSize: 14, color: colors.white, fontFamily: fonts.medium },
  chatRoomsDesc: { fontSize: 12, color: 'rgba(255,255,255,0.8)', fontFamily: fonts.regular },
  chatEmoji: { fontSize: 20 },
  newPostBtn: { marginHorizontal: 24, marginBottom: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 },
  newPostForm: { marginHorizontal: 24, marginBottom: 16, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16 },
  newPostHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 12 },
  newPostRight: { flex: 1 },
  newPostAuthor: { fontSize: 14, color: colors.foreground, marginBottom: 4, fontFamily: fonts.regular },
  newPostInput: { fontSize: 14, color: colors.foreground, minHeight: 80, textAlignVertical: 'top', fontFamily: fonts.regular },
  newPostFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  newPostHint: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  newPostActions: { flexDirection: 'row', gap: 8 },
  newPostPlaceholder: { fontSize: 14, color: colors.mutedForeground, flex: 1, fontFamily: fonts.regular },
  cancelBtn: { height: 36, paddingHorizontal: 16, borderRadius: 18, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { fontSize: 13, color: colors.foreground, fontFamily: fonts.regular },
  postBtn: { height: 36, paddingHorizontal: 16, borderRadius: 18, backgroundColor: colors.primary, flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center' },
  postBtnDisabled: { opacity: 0.5 },
  postBtnText: { fontSize: 13, color: colors.white, fontFamily: fonts.regular },
  avatar: { width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: colors.white, fontSize: 13, fontFamily: fonts.medium },
  posts: { paddingHorizontal: 24 },
  postCard: { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 16, padding: 16, marginBottom: 12 },
  postHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 },
  postHeaderLeft: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  postUsername: { fontSize: 14, color: colors.foreground, fontFamily: fonts.regular },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  postMetaText: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  postMetaDot: { fontSize: 12, color: colors.mutedForeground },
  postContent: { fontSize: 14, color: colors.foreground, lineHeight: 22, marginBottom: 16, fontFamily: fonts.regular },
  postActions: { flexDirection: 'row', alignItems: 'center', gap: 24, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  actionCount: { fontSize: 12, color: colors.mutedForeground, fontFamily: fonts.regular },
  actionCountLiked: { color: colors.primary },
  endText: { textAlign: 'center', fontSize: 12, color: colors.mutedForeground, padding: 24, fontFamily: fonts.regular },
});
