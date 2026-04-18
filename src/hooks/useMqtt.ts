import { useEffect, useRef, useState, useCallback } from 'react';
import mqtt, { MqttClient } from 'mqtt';

export interface ChatMessage {
  id: string;
  sender: string;
  senderInitials: string;
  avatarColor: string;
  content: string;
  timestamp: string;
  isOwn: boolean;
}

interface UseMqttOptions {
  brokerUrl?: string;
  topic: string;
  username: string;
  avatarColor?: string;
}

// สุ่มสีสำหรับผู้ใช้คนอื่น
const AVATAR_COLORS = ['#7FA882', '#D9A95F', '#6B9AB1', '#B47C9E', '#C47B6A', '#7B9EC4'];
const colorMap: Record<string, string> = {};

function getAvatarColor(sender: string): string {
  if (!colorMap[sender]) {
    colorMap[sender] = AVATAR_COLORS[Object.keys(colorMap).length % AVATAR_COLORS.length];
  }
  return colorMap[sender];
}

function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return name.slice(0, 2);
  return parts[0][0] + parts[1][0];
}

export function useMqtt({ brokerUrl = 'wss://broker.emqx.io:8084/mqtt', topic, username, avatarColor = '#22C55E' }: UseMqttOptions) {
  const clientRef = useRef<MqttClient | null>(null);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    const client = mqtt.connect(brokerUrl, {
      clientId: `sabaidimai_${Math.random().toString(16).slice(2, 8)}`,
      clean: true,
      reconnectPeriod: 3000,
    });
    clientRef.current = client;

    client.on('connect', () => {
      setStatus('connected');
      client.subscribe(topic, (err) => {
        if (err) console.warn('Subscribe error:', err);
      });
    });

    client.on('reconnect', () => setStatus('connecting'));
    client.on('error', () => setStatus('error'));
    client.on('close', () => setStatus('disconnected'));

    client.on('message', (_topic: string, payload: Buffer) => {
      try {
        const data = JSON.parse(payload.toString());
        const isOwn = data.sender === username;
        const msg: ChatMessage = {
          id: data.id || Date.now().toString(),
          sender: data.sender,
          senderInitials: getInitials(data.sender),
          avatarColor: isOwn ? avatarColor : getAvatarColor(data.sender),
          content: data.content,
          timestamp: data.timestamp || new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
          isOwn,
        };
        setMessages((prev) => [...prev, msg]);
      } catch {
        // ไม่ใช่ JSON — ข้ามไป
      }
    });

    return () => {
      client.end();
    };
  }, [brokerUrl, topic, username, avatarColor]);

  const sendMessage = useCallback((content: string) => {
    if (!clientRef.current || status !== 'connected' || !content.trim()) return;

    const msg = {
      id: `${Date.now()}_${Math.random().toString(16).slice(2, 6)}`,
      sender: username,
      content: content.trim(),
      timestamp: new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }),
    };
    clientRef.current.publish(topic, JSON.stringify(msg));
  }, [clientRef, status, username, topic]);

  return { status, messages, sendMessage };
}
