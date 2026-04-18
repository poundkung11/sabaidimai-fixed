import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, PanResponder, Animated, Dimensions } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { fonts } from '../theme/fonts';

interface SOSSliderProps {
  onSlideComplete: () => void;
}

const SLIDER_WIDTH = Math.min(Dimensions.get('window').width - 48, 320);
const THUMB_SIZE = 56;
const MAX_X = SLIDER_WIDTH - THUMB_SIZE - 8;
const COMPLETE_THRESHOLD = MAX_X * 0.85;

export function SOSSlider({ onSlideComplete }: SOSSliderProps) {
  const [isComplete, setIsComplete] = useState(false);
  const translateX = useRef(new Animated.Value(0)).current;

  const bgColor = translateX.interpolate({
    inputRange: [0, MAX_X],
    outputRange: [colors.destructive, colors.safe],
    extrapolate: 'clamp',
  });

  const textOpacity = translateX.interpolate({
    inputRange: [0, MAX_X * 0.5],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isComplete,
      onMoveShouldSetPanResponder: () => !isComplete,
      onPanResponderMove: (_, gs) => {
        translateX.setValue(Math.max(0, Math.min(gs.dx, MAX_X)));
      },
      onPanResponderRelease: (_, gs) => {
        if (gs.dx > COMPLETE_THRESHOLD) {
          setIsComplete(true);
          Animated.timing(translateX, { toValue: MAX_X, duration: 100, useNativeDriver: false }).start(() => {
            onSlideComplete();
          });
        } else {
          Animated.spring(translateX, { toValue: 0, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.track, { backgroundColor: bgColor, width: SLIDER_WIDTH }]}>
        <Animated.View style={[styles.label, { opacity: textOpacity }]}>
          <Text style={styles.labelText}>เลื่อนถ้าคุณต้องการความช่วยเหลือ</Text>
        </Animated.View>
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.thumb, { transform: [{ translateX }] }]}
        >
          <ChevronRight size={24} color={colors.destructive} />
        </Animated.View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', maxWidth: 320, alignSelf: 'center' },
  track: { height: 64, borderRadius: 32, overflow: 'hidden', position: 'relative', justifyContent: 'center' },
  label: { position: 'absolute', left: 0, right: 0, alignItems: 'center', justifyContent: 'center' },
  labelText: { color: colors.white, fontSize: 13, fontFamily: fonts.regular },
  thumb: {
    position: 'absolute',
    left: 4,
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
});
