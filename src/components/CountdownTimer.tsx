import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface CountdownTimerProps {
  seconds: number;
  onComplete: () => void;
}

export function CountdownTimer({ seconds, onComplete }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(seconds);
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  const SIZE = 120;
  const RADIUS = 50;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
  const progress = remaining / Math.max(seconds, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    hasCompletedRef.current = false;
    setRemaining(seconds);
  }, [seconds]);

  useEffect(() => {
    if (remaining <= 0) {
      return;
    }

    const timeout = setTimeout(() => {
      setRemaining(prev => Math.max(prev - 1, 0));
    }, 1000);

    return () => clearTimeout(timeout);
  }, [remaining]);

  useEffect(() => {
    if (remaining !== 0 || hasCompletedRef.current) {
      return;
    }

    hasCompletedRef.current = true;
    onCompleteRef.current();
  }, [remaining]);

  return (
    <View style={styles.container}>
      <Svg width={SIZE} height={SIZE} style={styles.svg}>
        <Circle cx={SIZE / 2} cy={SIZE / 2} r={RADIUS} stroke={colors.muted} strokeWidth={6} fill="none" />
        <Circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          stroke={colors.destructive}
          strokeWidth={6}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${SIZE / 2}, ${SIZE / 2}`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={styles.number}>{remaining}</Text>
        <Text style={styles.label}>วินาที</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svg: {},
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    fontSize: 34,
    color: colors.foreground,
    fontFamily: fonts.semiBold,
  },
  label: {
    fontSize: 14,
    color: colors.mutedForeground,
    fontFamily: fonts.regular,
  },
});
