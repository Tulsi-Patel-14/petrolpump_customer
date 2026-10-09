import { Platform } from 'react-native';

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  h1: {
    fontFamily,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700' as const,
  },
  h2: {
    fontFamily,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700' as const,
  },
  h3: {
    fontFamily,
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600' as const,
  },
  h4: {
    fontFamily,
    fontSize: 16,
    fontWeight: '600' as const,
  },
  bodyLarge: {
    fontFamily,
    fontSize: 17,
    lineHeight: 25,
    fontWeight: '400' as const,
  },
  body: {
    fontFamily,
    fontSize: 16,
    fontWeight: '400' as const,
  },
  bodyMedium: {
    fontFamily,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500' as const,
  },
  bodySmall: {
    fontFamily,
    fontSize: 13,
    fontWeight: '400' as const,
  },
  caption: {
    fontFamily,
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '500' as const,
    letterSpacing: 0.2,
  },
  captionSmall: {
    fontFamily,
    fontSize: 11,
    fontWeight: '500' as const,
  },
  button: {
    fontFamily,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '700' as const,
  },
  amountHero: {
    fontFamily,
    fontSize: 38,
    lineHeight: 46,
    fontWeight: '800' as const,
  },
  amountLarge: {
    fontFamily,
    fontSize: 26,
    fontWeight: '800' as const,
    lineHeight: 32,
  },
  amountMedium: {
    fontFamily,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600' as const,
  },
};