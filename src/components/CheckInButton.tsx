import React, { useEffect, useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import { UserStatus } from '../context/AppContext';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface CheckInButtonProps {
  status: UserStatus;
  onClick: () => void;
}

const getButtonConfig = (status: UserStatus) => {
  switch (status) {
    case 'pending':
    case 'grace':
      return { color: colors.safe, text: 'ฉันสบายดี', animate: true };
    case 'pre-alert':
      return { color: colors.warning, text: 'ฉันอยู่นี่', animate: true };
    case 'paused':
      return { color: colors.muted, text: 'หยุดชั่วคราว', animate: false };
    case 'sos-active':
      return { color: colors.destructive, text: 'ขอความช่วยเหลือแล้ว', animate: false };
    default:
      return { color: colors.primary, text: 'ฉันสบายดี', animate: false };
  }
};

export function CheckInButton({ status, onClick }: CheckInButtonProps) {
  const config = getButtonConfig(status);
  const isDisabled = status === 'paused' || status === 'sos-active';
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (config.animate) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(scaleAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      scaleAnim.setValue(1);
    }
  }, [config.animate, status]);

  return (
    <Animated.View style={[styles.wrapper, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity
        onPress={onClick}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[styles.button, { backgroundColor: config.color }, isDisabled && styles.disabled]}
      >
        <Text style={styles.text}>{config.text}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
  },
  button: {
    width: 192,
    height: 192,
    borderRadius: 96,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.white,
    fontSize: 20,
    textAlign: 'center',
    paddingHorizontal: 16,
    fontFamily: fonts.medium,
  },
  disabled: { opacity: 0.5 },
});
