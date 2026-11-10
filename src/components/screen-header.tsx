import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function ScreenHeader({ backHref, label = 'KHÔNG GIAN QUẢN TRỊ' }: { backHref?: Href; label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.header}>
      {backHref ? (
        <Pressable accessibilityRole="button" accessibilityLabel="Quay lại"
          hitSlop={8} onPress={() => router.canGoBack() ? router.back() : router.replace(backHref)}
          style={[styles.mark, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, borderWidth: 1 }]}>
          <AppIcon name="back" color={theme.text} size={20} />
        </Pressable>
      ) : <View style={[styles.mark, { backgroundColor: theme.primary }]}>
        <AppIcon name="people" color={theme.onPrimary} size={24} />
      </View>}
      <View style={styles.brand}>
        <ThemedText style={styles.wordmark}>People.</ThemedText>
        <ThemedText style={styles.caption} themeColor="textSecondary">{label}</ThemedText>
      </View>
      <View style={[styles.badge, { backgroundColor: theme.primarySoft }]}>
        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
        <ThemedText style={[styles.badgeLabel, { color: theme.primary }]}>Admin</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 24, paddingTop: 12, paddingBottom: 18,
    width: '100%', maxWidth: 980, alignSelf: 'center' },
  mark: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  brand: { flex: 1, gap: 2 },
  wordmark: { fontSize: 23, lineHeight: 27, fontWeight: '800', letterSpacing: -0.8 },
  caption: { fontSize: 8, lineHeight: 13, fontWeight: '700', letterSpacing: 1.6 },
  badge: { flexDirection: 'row', gap: 5, alignItems: 'center', paddingHorizontal: 10, paddingVertical: 7, borderRadius: 20 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  badgeLabel: { fontSize: 11, lineHeight: 15, fontWeight: '600' },
});
