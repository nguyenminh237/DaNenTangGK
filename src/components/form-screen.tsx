import type { PropsWithChildren } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';

interface FormScreenProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  back?: boolean;
  bottomInset?: boolean;
}

export function FormScreen({ title, subtitle, eyebrow, back = false, bottomInset = true, children }: PropsWithChildren<FormScreenProps>) {
  const insets = useSafeAreaInsets();
  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScreenHeader backHref={back ? '/users' : undefined} />
        <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={0}>
          <ScrollView style={styles.fill} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
            contentInsetAdjustmentBehavior="never" automaticallyAdjustContentInsets={false}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={[styles.content, { paddingBottom: 32 + (bottomInset ? insets.bottom : 0) }]}>
            <View style={styles.heading}>
              {eyebrow && <ThemedText style={styles.eyebrow} themeColor="textSecondary">{eyebrow}</ThemedText>}
              <ThemedText type="subtitle" accessibilityRole="header" style={styles.title}>{title}</ThemedText>
              {subtitle && <ThemedText themeColor="textSecondary" style={styles.subtitle}>{subtitle}</ThemedText>}
            </View>
            {children}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 14, gap: 24, width: '100%', maxWidth: 640, alignSelf: 'center' },
  heading: { gap: 9 },
  title: { fontSize: 34, lineHeight: 42, fontWeight: '700', letterSpacing: -1.2 },
  subtitle: { fontSize: 14, lineHeight: 23, maxWidth: 440 },
  eyebrow: { fontSize: 10, lineHeight: 16, fontWeight: '700', letterSpacing: 2 },
});
