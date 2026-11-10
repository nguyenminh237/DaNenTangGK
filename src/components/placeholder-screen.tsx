import { Link, type Href } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { MaxContentWidth, Spacing } from '@/constants/theme';

interface PlaceholderScreenProps {
  title: string;
  description: string;
  links?: { label: string; href: Href }[];
}

export function PlaceholderScreen({ title, description, links = [] }: PlaceholderScreenProps) {
  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle" accessibilityRole="header">{title}</ThemedText>
          <ThemedText themeColor="textSecondary">{description}</ThemedText>
          {links.map((link) => (
            <Link key={link.label} href={link.href} style={styles.link}>
              <ThemedText type="linkPrimary">{link.label}</ThemedText>
            </Link>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    padding: Spacing.four,
    gap: Spacing.three,
  },
  link: {
    minHeight: 48,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: '#3c87f7',
    borderRadius: Spacing.two,
  },
});
