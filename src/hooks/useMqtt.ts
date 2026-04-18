import { useCallback, useEffect, useRef, useState } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface LiveChatMessage {
  id: string;
  clientMessageId: string;
  senderId: number | null;
  senderName: string;
  senderInitials: string;
  avatarColor: string;
  content: string;
  sentAt: string;
  isOwn: boolean;
}

interface SendMessageOptions {
  clientMessageId?: string;
  senderId?: number | null;
  senderName?: string;
  sentAt?: string;
}

interface UseMqttOptions {
  brokerUrl?: string;
  topic?: string | null;
  userId?: number | null;
  username: string;
  avatarColor?: string;
}

const DEFAULT_BROKER_URL = 'wss://broker.emqx.io:8084/mqtt';
const AVATAR_COLORS = ['#7FA882', '#D9A95F', '#6B9AB1', '#B47C9E', '#C47B6A', '#22C55E'];
const colorMap: Record<string, string> = {};

function getAvatarColor(senderName: string): string {
  if (!colorMap[senderName]) {
    colorMap[senderName] = AVATAR_COLORS[Object.keys(colorMap).length % AVATAR_COLORS.length];
  }
  return colorMap[senderName];
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return '??';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function decodePayload(payload: Uint8Array): string {
  if (typeof TextDecoder !== 'undefined') {
    return new TextDecoder().decode(payload);
  }

  return Array.from(payload)
    .map((byte) => String.fromCharCode(byte))
    .join('');
}

export function useMqtt({
  brokerUrl = DEFAULT_BROKER_URL,
  topic,
  userId = null,
  username,
  avatarColor = '#22C55E',
}: UseMqttOptions) {
  const clientRef = useRef<MqttClient | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [messages, setMessages] = useState<LiveChatMessage[]>([]);

  useEffect(() => {
    setMessages([]);

    if (!topic) {
      setStatus('disconnected');
      clientRef.current = null;
      return;
    }

    setStatus('connecting');

    const client = mqtt.connect(brokerUrl, {
      clientId: `sabaidimai_${Math.random().toString(16).slice(2, 10)}`,
      clean: true,
      reconnectPeriod: 3000,
    });

    clientRef.current = client;

    client.on('connect', () => {
      setStatus('connected');
      client.subscribe(topic, (error) => {
        if (error) {
          console.warn('Subscribe error:', error);
        }
      });
    });

    client.on('reconnect', () => setStatus('connecting'));
    client.on('error', (error) => {
      console.warn('MQTT error:', error);
      setStatus('error');
    });
    client.on('close', () => setStatus('disconnected'));

    client.on('message', (_topic, payload) => {
      try {
        const data = JSON.parse(decodePayload(payload));
        const senderName = String(data.senderName || data.sender || 'Unknown');
        const senderId =
          data.senderId === null || data.senderId === undefined
            ? null
            : Number(data.senderId);
        const clientMessageId = String(
          data.clientMessageId || data.id || `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`
        );
        const isOwn =
          senderId !== null && userId !== null
            ? senderId === userId
            : senderName === username;

        const message: LiveChatMessage = {
          id: clientMessageId,
          clientMessageId,
          senderId: Number.isFinite(senderId) ? senderId : null,
          senderName,
          senderInitials: getInitials(senderName),
          avatarColor: isOwn ? avatarColor : getAvatarColor(senderName),
          content: String(data.content || ''),
          sentAt: String(data.sentAt || data.timestamp || new Date().toISOString()),
          isOwn,
        };

        setMessages((previous) => {
          if (previous.some((item) => item.clientMessageId === message.clientMessageId)) {
            return previous;
          }

          return [...previous, message];
        });
      } catch (error) {
        console.warn('MQTT payload parse error:', error);
      }
    });

    return () => {
      client.removeAllListeners();
      client.end(true);
      clientRef.current = null;
      setStatus('disconnected');
    };
  }, [avatarColor, brokerUrl, topic, userId, username]);

  const sendMessage = useCallback(
    (content: string, options: SendMessageOptions = {}) => {
      if (!topic || !content.trim()) {
        return null;
      }

      if (!clientRef.current || status !== 'connected') {
        return null;
      }

      const clientMessageId =
        options.clientMessageId || `${Date.now()}_${Math.random().toString(16).slice(2, 8)}`;

      const payload = {
        id: clientMessageId,
        clientMessageId,
        senderId: options.senderId ?? userId,
        senderName: options.senderName || username,
        content: content.trim(),
        sentAt: options.sentAt || new Date().toISOString(),
      };

      clientRef.current.publish(topic, JSON.stringify(payload));
      return clientMessageId;
    },
    [status, topic, userId, username]
  );

  return { status, messages, sendMessage };
}
