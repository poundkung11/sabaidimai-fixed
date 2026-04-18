import { Platform } from 'react-native';

const regularFont =
  Platform.select({
    ios: 'System',
    android: 'sans-serif',
    default: 'sans-serif',
  }) ?? 'sans-serif';

const mediumFont =
  Platform.select({
    ios: 'System',
    android: 'sans-serif-medium',
    default: 'sans-serif',
  }) ?? regularFont;

export function useInterFonts() {
  return [true] as const;
}

export const fonts = {
  regular: regularFont,
  medium: mediumFont,
  semiBold: mediumFont,
  input: Platform.select({
    ios: undefined,
    android: regularFont,
    default: regularFont,
  }),
};
