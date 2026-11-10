import { ActivityIndicator, StyleSheet } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

export function SessionLoading() {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator accessibilityLabel="Đang kiểm tra phiên đăng nhập" />
      <ThemedText>Đang kiểm tra phiên đăng nhập…</ThemedText>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, gap: 16, alignItems: 'center', justifyContent: 'center' },
});
