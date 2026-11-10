import { useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export function UserAvatar({ uri, name, size = 60 }: { uri: string; name: string; size?: number }) {
  const [failedUri, setFailedUri] = useState<string>();
  const theme = useTheme();
  const dimensions = { width: size, height: size, borderRadius: size / 2 };
  if (!uri || failedUri === uri) {
    return (
      <View style={[styles.fallback, dimensions, { backgroundColor: theme.primarySoft }]} accessibilityLabel={`Ảnh đại diện mặc định của ${name}`}>
        <ThemedText style={[styles.initial, { color: theme.primary, fontSize: Math.max(20, size * 0.33) }]}>{name.trim().slice(0, 1).toUpperCase() || 'P'}</ThemedText>
      </View>
    );
  }
  return <Image source={{ uri }} style={[styles.avatar, dimensions]} resizeMode="cover"
    accessibilityLabel={`Ảnh đại diện của ${name}`} onError={() => setFailedUri(uri)} />;
}

const styles = StyleSheet.create({
  avatar: { width: 60, height: 60, borderRadius: 30 },
  fallback: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#D1E9FF',
    alignItems: 'center', justifyContent: 'center' },
  initial: { color: '#1849A9', fontSize: 24, fontWeight: '600' },
});
