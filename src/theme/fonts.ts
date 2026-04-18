import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';

export function useInterFonts() {
  return useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });
}

export const fonts = {
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semiBold: 'Inter_600SemiBold',
};
