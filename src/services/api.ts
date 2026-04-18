import { API_BASE_URL, DEMO_USER_ID } from '../config/api';

// ─── Existing types ───────────────────────────────────────
export interface SupportMessage {
  id: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
  senderType: 'user' | 'support';
  createdAt: string;
}

export interface EmergencyCardPayload {
  fullName: string;
  chronicConditions?: string;
  allergies?: string;
  medications?: string;
  bloodType?: string;
  notes?: string;
}

// ─── New types ────────────────────────────────────────────
export interface UserSearchResult {
  id: number;
  display_name: string;
  phone?: string;
  isFriend?: boolean;
  isPending?: boolean;
}

export interface Friend {
  id: number;
  display_name: string;
  phone?: string;
  friendship_id: number;
}

export interface PendingRequest {
  id: number;
  requester_id: number;
  requester_name: string;
  created_at: string;
  friendship_id?: number;
  friendshipId?: number;
}

export interface Conversation {
  id: number;
  type: 'direct' | 'group';
  name?: string;
  created_at: string;
  last_message?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: number;
  conversation_id: number;
  sender_id: number;
  sender_name: string;
  content: string;
  sent_at: string;
}

// ─── Base request ─────────────────────────────────────────
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed: ${response.status}`);
  }
  return response.json() as Promise<T>;
}

// ─── Existing APIs ────────────────────────────────────────
export async function getSupportMessages(userId = DEMO_USER_ID) {
  return request<SupportMessage[]>(`/users/${userId}/support-messages`);
}

export async function sendSupportMessage(content: string, userId = DEMO_USER_ID) {
  return request<SupportMessage[]>(`/users/${userId}/support-messages`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  });
}

export async function saveEmergencyCard(payload: EmergencyCardPayload, userId = DEMO_USER_ID) {
  return request(`/users/${userId}/emergency-card`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function getEmergencyCard(userId = DEMO_USER_ID) {
  return request(`/users/${userId}/emergency-card`);
}

export async function createCheckIn(status: string, userId = DEMO_USER_ID) {
  return request(`/users/${userId}/checkins`, {
    method: 'POST',
    body: JSON.stringify({ status, source: 'mobile-app' }),
  });
}

export async function getCheckins(userId = DEMO_USER_ID) {
  return request(`/users/${userId}/checkins`);
}

// ─── New: User search ─────────────────────────────────────
export async function searchUsers(q: string, userId = DEMO_USER_ID) {
  return request<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(q)}&requesterId=${userId}`);
}

// ─── New: Friendships ─────────────────────────────────────
export async function getFriends(userId = DEMO_USER_ID) {
  return request<Friend[]>(`/users/${userId}/friends`);
}

export async function getPendingRequests(userId = DEMO_USER_ID) {
  return request<PendingRequest[]>(`/users/${userId}/friends/pending`);
}

export async function sendFriendRequest(addresseeId: number, userId = DEMO_USER_ID) {
  return request(`/users/${userId}/friends`, {
    method: 'POST',
    body: JSON.stringify({ addresseeId }),
  });
}

export async function acceptFriendRequest(friendshipId: number) {
  return request(`/friendships/${friendshipId}/accept`, {
    method: 'PUT',
    body: JSON.stringify({ userId: DEMO_USER_ID }),
  });
}

export async function rejectFriendRequest(friendshipId: number) {
  return request(`/friendships/${friendshipId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ userId: DEMO_USER_ID }),
  });
}

// ─── New: Conversations ───────────────────────────────────
export async function getConversations(userId = DEMO_USER_ID) {
  return request<Conversation[]>(`/users/${userId}/conversations`);
}

export async function createConversation(
  type: 'direct' | 'group',
  memberIds: number[],
  name?: string,
  userId = DEMO_USER_ID
) {
  return request<Conversation>(`/users/${userId}/conversations`, {
    method: 'POST',
    body: JSON.stringify({ type, memberIds, name }),
  });
}

// คืนค่า conversation ที่มีอยู่แล้วระหว่าง 2 user
export async function getFriendConversation(friendId: number, userId = DEMO_USER_ID) {
  return request<Conversation>(`/users/${userId}/conversations/direct/${friendId}`);
}

// ─── New: Chat messages (REST fallback / history) ─────────
export async function getMessages(conversationId: number, limit = 50) {
  return request<ChatMessage[]>(
    `/conversations/${conversationId}/messages?limit=${limit}&userId=${DEMO_USER_ID}`
  );
}

export async function sendChatMessage(conversationId: number, content: string, userId = DEMO_USER_ID) {
  return request<ChatMessage>(`/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ senderId: userId, content }),
  });
}
