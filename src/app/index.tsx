import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppIcon } from '@/components/app-icon';
import { FormScreen } from '@/components/form-screen';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

export default function HomeScreen() {
  const theme = useTheme();
  return (
    <FormScreen title={'Mọi người.\nMột kết nối.'} eyebrow="ÍT THAO TÁC. NHIỀU KẾT NỐI."
      subtitle="Quản lý những hồ sơ quan trọng trong một không gian đơn giản và tinh tế.">
      <View style={[styles.hero, { backgroundColor: theme.primarySoft }]}>
        <View style={[styles.orbit, { borderColor: theme.primary + '30' }]}>
          <View style={[styles.orbitInner, { borderColor: theme.primary + '30' }]}>
            <View style={[styles.people, { backgroundColor: theme.primary }]}><AppIcon name="people" size={57} color={theme.onPrimary} /></View>
          </View>
          <View style={[styles.floating, { backgroundColor: theme.backgroundElement }]}><AppIcon name="shield" size={23} /></View>
        </View>
        <View style={styles.heroCaption}><AppIcon name="sparkles" size={16} /><ThemedText style={[styles.heroText, { color: theme.primary }]}>Gọn gàng hơn. Gần nhau hơn.</ThemedText></View>
      </View>
      <AppButton title="Vào không gian quản trị" icon="arrow" onPress={() => router.push('/users')} />
      <View style={styles.features}>
        <View style={styles.feature}><AppIcon name="user" size={20} /><ThemedText type="small">Hồ sơ rõ ràng</ThemedText></View>
        <View style={styles.feature}><AppIcon name="shield" size={20} /><ThemedText type="small">Truy cập an toàn</ThemedText></View>
      </View>
      <ThemedText style={styles.footnote} themeColor="textSecondary">PEOPLE. · KHÔNG GIAN KẾT NỐI CỦA BẠN</ThemedText>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 24, borderRadius: 30, alignItems: 'center', gap: 20 },
  orbit: { width: 205, height: 205, borderWidth: 1, borderRadius: 103, alignItems: 'center', justifyContent: 'center' },
  orbitInner: { width: 163, height: 163, borderWidth: 1, borderRadius: 82, alignItems: 'center', justifyContent: 'center' },
  people: { width: 118, height: 118, borderRadius: 39, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  floating: { position: 'absolute', right: 0, bottom: 22, width: 49, height: 49, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  heroCaption: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  heroText: { fontSize: 12, lineHeight: 20, fontWeight: '600' },
  features: { flexDirection: 'row', justifyContent: 'space-around', gap: 12, flexWrap: 'wrap' },
  feature: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  footnote: { fontSize: 8, lineHeight: 15, letterSpacing: 1.7, textAlign: 'center', paddingTop: 8 },
});
