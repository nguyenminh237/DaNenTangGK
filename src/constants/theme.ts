/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://unistyl.es/), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#1B3028',
    background: '#F7F8F4',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E1E8DF',
    textSecondary: '#697A70',
    primary: '#276B55',
    onPrimary: '#FFFFFF',
    primarySoft: '#E7EFE4',
    accent: '#D6EDBF',
    danger: '#B34840',
    dangerSoft: '#FBECE8',
  },
  dark: {
    text: '#F0F4EB',
    background: '#101B16',
    backgroundElement: '#192A21',
    backgroundSelected: '#2E4335',
    textSecondary: '#A5B5A8',
    primary: '#B6E3C5',
    onPrimary: '#153424',
    primarySoft: '#233C2C',
    accent: '#324B2C',
    danger: '#FFB4A8',
    dangerSoft: '#412A28',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
