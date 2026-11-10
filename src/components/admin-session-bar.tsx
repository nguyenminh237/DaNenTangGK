import { useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { useTheme } from '@/hooks/use-theme';
import { StatusMessage } from '@/components/status-message';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/contexts/auth-context';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/service-error';

export function AdminSessionBar() {
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const busy = useRef(false);

  async function logout() {
    if (busy.current) return;
    busy.current = true;
    setLoading(true);
    setError('');
    try { await authService.signOut(); }
    catch (cause) { setError(getErrorMessage(cause)); }
    finally { busy.current = false; setLoading(false); }
  }

  return (
    <ThemedView type="backgroundElement" style={[styles.container, { borderTopColor: theme.backgroundSelected }]}>
      <View style={styles.row}>
        <View style={[styles.avatar, { backgroundColor: theme.primarySoft }]}><AppIcon name="shield" size={21} /></View>
        <View style={styles.account}>
          <ThemedText style={styles.caption} themeColor="textSecondary">PHIÊN QUẢN TRỊ</ThemedText>
          <ThemedText style={styles.email} numberOfLines={1}>{user?.email ?? 'Quản trị viên'}</ThemedText>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel="Đăng xuất" disabled={loading}
          onPress={() => void logout()} style={[styles.logout, { backgroundColor: theme.primarySoft }]}>
          {loading ? <ActivityIndicator color={theme.primary} size="small" /> : <AppIcon name="logout" size={20} />}
        </Pressable>
      </View>
      <StatusMessage message={error} error />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 22, paddingTop: 12, paddingBottom: 10, gap: 8, borderTopWidth: 1 },
  row: { flexDirection: 'row', gap: 11, alignItems: 'center', maxWidth: 900, width: '100%', alignSelf: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 14, justifyContent: 'center', alignItems: 'center' },
  account: { flex: 1, minWidth: 0, gap: 1 },
  caption: { fontSize: 8, lineHeight: 13, letterSpacing: 1.5, fontWeight: '600' },
  email: { fontSize: 12, lineHeight: 20, fontWeight: '600' },
  logout: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
});
