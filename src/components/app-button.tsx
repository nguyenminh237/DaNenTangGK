import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface AppButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  danger?: boolean;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: AppIconName;
  compact?: boolean;
}

export function AppButton({ title, onPress, disabled, loading, danger, variant = 'primary', icon, compact }: AppButtonProps) {
  const theme = useTheme();
  const color = danger ? theme.danger : variant === 'primary' ? theme.onPrimary : theme.primary;
  const backgroundColor = danger ? theme.dangerSoft : variant === 'primary' ? theme.primary
    : variant === 'secondary' ? theme.primarySoft : 'transparent';
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading} onPress={onPress}
      style={({ pressed }) => [styles.button, { backgroundColor }, compact && styles.compact,
        (disabled || loading) && { opacity: 0.5 }, pressed && { opacity: 0.8, transform: [{ scale: 0.985 }] }]}>
      {loading ? <ActivityIndicator color={color} /> : icon ? <AppIcon name={icon} size={20} color={color} /> : null}
      <ThemedText style={[styles.label, { color }, compact && { fontSize: 13 }]}>{title}</ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { minHeight: 54, paddingVertical: 14, paddingHorizontal: 20, borderRadius: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  compact: { minHeight: 44, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 13 },
  label: { fontSize: 15, lineHeight: 22, fontWeight: '700', textAlign: 'center' },
});
