import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { Colors } from '@/constants/theme';
import { AuthProvider } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const dark = colorScheme === 'dark';
  const colors = Colors[dark ? 'dark' : 'light'];
  const baseTheme = dark ? DarkTheme : DefaultTheme;

  return (
    <ThemeProvider value={{ ...baseTheme, colors: { ...baseTheme.colors, background: colors.background,
      card: colors.backgroundElement, text: colors.text, primary: colors.primary, border: colors.backgroundSelected } }}>
      <StatusBar style={dark ? 'light' : 'dark'} />
      <AuthProvider>
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" options={{ title: 'Quản lý người dùng' }} />
          <Stack.Screen name="login" options={{ title: 'Đăng nhập' }} />
          <Stack.Screen name="users" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
