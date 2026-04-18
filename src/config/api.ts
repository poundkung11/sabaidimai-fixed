import { Platform } from 'react-native';

const configuredApiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
const configuredMqttBrokerUrl = process.env.EXPO_PUBLIC_MQTT_BROKER_URL?.trim();
const configuredMqttTopicPrefix = process.env.EXPO_PUBLIC_MQTT_TOPIC_PREFIX?.trim();

const defaultApiOrigin = Platform.OS === 'android' ? 'http://10.0.2.2:3001' : 'http://localhost:3001';

export const API_BASE_URL = configuredApiBaseUrl || `${defaultApiOrigin}/api/app`;
export const MQTT_BROKER_URL = configuredMqttBrokerUrl || 'wss://broker.emqx.io:8084/mqtt';
export const MQTT_TOPIC_PREFIX = configuredMqttTopicPrefix || 'sabaidimai/dm';
export const DEMO_USER_ID = 1;
