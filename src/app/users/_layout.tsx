import { Redirect, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AdminSessionBar } from '@/components/admin-session-bar';
import { SessionLoading } from '@/components/session-loading';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';

export default function UsersLayout() {
  const { loading, isAdmin } = useAuth();
  const theme = useTheme();
  if (loading) return <SessionLoading />;
  if (!isAdmin) return <Redirect href="/login" />;

  return (
    <ThemedView style={{ flex: 1 }}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" options={{ title: 'Người dùng' }} />
        <Stack.Screen name="create" options={{ title: 'Thêm người dùng' }} />
        <Stack.Screen name="[id]" options={{ title: 'Chi tiết người dùng' }} />
      </Stack>
      <SafeAreaView edges={['left', 'right', 'bottom']} style={{ backgroundColor: theme.backgroundElement }}>
        <AdminSessionBar />
      </SafeAreaView>
    </ThemedView>
  );
}
