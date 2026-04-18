/**
 * chatApi.ts — Friend system + Chat API service
 * ใช้คู่กับ chatRoutes.js บน backend
 */
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3001';
const WS_URL   = process.env.EXPO_PUBLIC_WS_URL  || 'ws://localhost:3001';

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────
export interface AppUser {
  id: number;
  username: string;
  displayName: string;
  avatarColor: string;
  initials: string;
  bio?: string;
  lastSeen?: string;
}

export interface SearchResult extends AppUser {
  friendshipStatus: 'pending' | 'accepted' | 'blocked' | null;
  friendshipId: number | null;
  isRequester: boolean;
}

export interface FriendRequest extends AppUser {
  friendshipId: number;
  requestedAt: string;
}

export interface FriendsResponse {
  friends:  (AppUser & { friendshipId: number; friendsSince: string })[];
  incoming: FriendRequest[];
  outgoing: FriendRequest[];
}

export interface Conversation {
  id: number;
  type: 'direct' | 'group';
  name: string;
  avatarColor: string;
  initials: string;
  otherUser: AppUser | null;
  lastMessage: string | null;
  lastMessageAt: string | null;
  unreadCount: number;
  isMuted: boolean;
}

export interface ChatMessage {
  id: number;
  conversationId: number;
  senderId: number;
  senderName: string;
  avatarColor: string;
  initials: string;
  content: string;
  type: string;
  isOwn: boolean;
  sentAt: string;
}

// ─────────────────────────────────────────────────────────
// Token storage
// ─────────────────────────────────────────────────────────
export async function saveChatToken(token: string) {
  await AsyncStorage.setItem('@chat_token', token);
}

export async function getChatToken(): Promise<string | null> {
  return AsyncStorage.getItem('@chat_token');
}

export async function clearChatToken() {
  await AsyncStorage.removeItem('@chat_token');
}

// ─────────────────────────────────────────────────────────
// HTTP helpers
// ─────────────────────────────────────────────────────────
async function authHeaders(): Promise<Record<string, string>> {
  const token = await getChatToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = await authHeaders();
  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers: { ...headers, ...(options.headers || {}) } });
  const json = await res.json();
  if (!res.ok) throw new Error(json.error || json.message || `HTTP ${res.status}`);
  return json as T;
}

// ─────────────────────────────────────────────────────────
// Auth
// ─────────────────────────────────────────────────────────
export async function registerUser(username: string, displayName: string, phone?: string) {
  const data = await apiFetch<{ token: string; user: AppUser }>('/api/app/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, displayName, phone }),
  });
  await saveChatToken(data.token);
  return data;
}

export async function loginUser(username: string) {
  const data = await apiFetch<{ token: string; user: AppUser }>('/api/app/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username }),
  });
  await saveChatToken(data.token);
  return data;
}

export async function getMe(): Promise<AppUser> {
  return apiFetch<AppUser>('/api/app/auth/me');
}

// ─────────────────────────────────────────────────────────
// Search
// ─────────────────────────────────────────────────────────
export async function searchUsers(q: string, limit = 20): Promise<SearchResult[]> {
  return apiFetch<SearchResult[]>(`/api/app/users/search?q=${encodeURIComponent(q)}&limit=${limit}`);
}

// ─────────────────────────────────────────────────────────
// Friends
// ─────────────────────────────────────────────────────────
export async function getFriends(): Promise<FriendsResponse> {
  return apiFetch<FriendsResponse>('/api/app/friends');
}

export async function sendFriendRequest(userId: number) {
  return apiFetch<{ friendshipId: number; status: string; user: AppUser }>('/api/app/friends/request', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function respondFriendRequest(friendshipId: number, action: 'accept' | 'reject' | 'unfriend' | 'block' | 'cancel') {
  return apiFetch<{ ok: boolean; status: string }>(`/api/app/friends/${friendshipId}`, {
    method: 'PATCH',
    body: JSON.stringify({ action }),
  });
}

// ─────────────────────────────────────────────────────────
// Conversations
// ─────────────────────────────────────────────────────────
export async function getConversations(): Promise<Conversation[]> {
  return apiFetch<Conversation[]>('/api/app/conversations');
}

export async function openDirectConversation(userId: number): Promise<{ conversationId: number; created: boolean }> {
  return apiFetch('/api/app/conversations/direct', {
    method: 'POST',
    body: JSON.stringify({ userId }),
  });
}

export async function getMessages(conversationId: number, options?: { before?: number; limit?: number }): Promise<ChatMessage[]> {
  const params = new URLSearchParams();
  if (options?.before) params.set('before', String(options.before));
  if (options?.limit)  params.set('limit',  String(options.limit));
  return apiFetch<ChatMessage[]>(`/api/app/conversations/${conversationId}/messages?${params}`);
}

export async function sendMessageHTTP(conversationId: number, content: string): Promise<ChatMessage> {
  return apiFetch<ChatMessage>(`/api/app/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

// ─────────────────────────────────────────────────────────
// WebSocket chat client
// ─────────────────────────────────────────────────────────
export type WSMessage =
  | { type: 'authed';   userId: number; username: string; displayName: string }
  | { type: 'joined';   conversationId: number }
  | { type: 'message';  id: number; conversationId: number; senderId: number; senderName: string; avatarColor: string; initials: string; content: string; msgType: string; isOwn: boolean; sentAt: string }
  | { type: 'typing';   conversationId: number; userId: number; senderName: string; isTyping: boolean }
  | { type: 'error';    message: string }
  | { type: 'pong' };

export class ChatWebSocket {
  private ws: WebSocket | null = null;
  private token: string;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private _onMessage: (msg: WSMessage) => void = () => {};
  private _onStatus: (status: 'connecting' | 'connected' | 'disconnected') => void = () => {};

  constructor(token: string) {
    this.token = token;
  }

  connect() {
    this._onStatus('connecting');
    this.ws = new WebSocket(WS_URL);

    this.ws.onopen = () => {
      this.ws?.send(JSON.stringify({ type: 'auth', token: this.token }));
    };

    this.ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data) as WSMessage;
        if (msg.type === 'authed') this._onStatus('connected');
        this._onMessage(msg);
      } catch {}
    };

    this.ws.onclose = () => {
      this._onStatus('disconnected');
      this.reconnectTimer = setTimeout(() => this.connect(), 4000);
    };

    this.ws.onerror = () => {
      this.ws?.close();
    };
  }

  join(conversationId: number) {
    this.send({ type: 'join', conversationId });
  }

  sendMessage(conversationId: number, content: string) {
    this.send({ type: 'message', conversationId, content });
  }

  sendTyping(conversationId: number, isTyping: boolean) {
    this.send({ type: 'typing', conversationId, isTyping });
  }

  ping() { this.send({ type: 'ping' }); }

  private send(data: object) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  onMessage(cb: (msg: WSMessage) => void)  { this._onMessage = cb; }
  onStatus(cb: (s: 'connecting' | 'connected' | 'disconnected') => void) { this._onStatus = cb; }

  disconnect() {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.ws?.close();
    this.ws = null;
  }
}
