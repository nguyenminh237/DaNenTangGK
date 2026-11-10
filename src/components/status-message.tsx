import { StyleSheet, Text, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function StatusMessage({ message, error = false }: { message: string; error?: boolean }) {
  const theme = useTheme();
  if (!message) return null;
  const color = error ? theme.danger : theme.primary;
  return (
    <View accessibilityRole={error ? 'alert' : undefined} accessibilityLiveRegion="polite"
      style={[styles.box, { backgroundColor: error ? theme.dangerSoft : theme.primarySoft }]}>
      <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants"
        style={[styles.marker, { borderColor: color }]}>
        <Text style={[styles.mark, { color }]}>{error ? '!' : '✓'}</Text>
      </View>
      <ThemedText style={[styles.text, { color }]}>{message}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { padding: 15, borderRadius: 15, flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  text: { flex: 1, fontSize: 13, lineHeight: 21 },
  marker: { width: 19, height: 19, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  mark: { fontSize: 12, lineHeight: 15, fontWeight: '700' },
});
