import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppIcon } from '@/components/app-icon';
import { ScreenHeader } from '@/components/screen-header';
import { AppButton } from '@/components/app-button';
import { StatusMessage } from '@/components/status-message';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { UserAvatar } from '@/components/user-avatar';
import { useTheme } from '@/hooks/use-theme';
import { userService } from '@/services/user.service';
import type { UserProfileDocument } from '@/types/user';
import { getErrorMessage } from '@/utils/service-error';
import { filterUsers } from '@/utils/search-users';

export default function UsersScreen() {
  const [users, setUsers] = useState<UserProfileDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [search, setSearch] = useState('');
  const filteredUsers = useMemo(() => filterUsers(users, search), [users, search]);
  const { notice } = useLocalSearchParams<{ notice?: string }>();
  const theme = useTheme();
  const message = notice === 'created' ? 'Thêm người dùng thành công.'
    : notice === 'deleted' ? 'Xóa người dùng thành công.' : '';

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    userService.getAll().then((data) => {
      if (active) setUsers(data);
    }).catch((cause: unknown) => {
      if (active) { setUsers([]); setError(getErrorMessage(cause)); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [revision]));

  return (
    <ThemedView style={styles.fill}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <ScreenHeader label="DANH BẠ CỦA BẠN" />
        <FlatList
          style={styles.fill}
          data={loading ? [] : filteredUsers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.content}
          contentInsetAdjustmentBehavior="never" automaticallyAdjustContentInsets={false}
          showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag"
          refreshing={loading} onRefresh={() => setRevision((current) => current + 1)}
          ListHeaderComponent={
            <View style={styles.header}>
              <View style={styles.headingRow}>
                <View style={{ flex: 1, gap: 5 }}>
                  <ThemedText style={styles.eyebrow} themeColor="textSecondary">MỖI HỒ SƠ, MỘT KẾT NỐI</ThemedText>
                  <ThemedText style={styles.title} accessibilityRole="header">Người dùng</ThemedText>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Tải lại danh sách" disabled={loading}
                  onPress={() => setRevision((current) => current + 1)}
                  style={[styles.refresh, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                  {loading ? <ActivityIndicator color={theme.primary} size="small" /> : <AppIcon name="refresh" size={21} />}
                </Pressable>
              </View>
              <View style={[styles.summary, { backgroundColor: theme.primarySoft }]}>
                <View style={{ flex: 1 }}>
                  <ThemedText style={[styles.count, { color: theme.primary }]}>{loading ? '—' : users.length}</ThemedText>
                  <ThemedText style={styles.summaryLabel} themeColor="textSecondary">kết nối trong danh bạ</ThemedText>
                </View>
                <View style={[styles.summaryIcon, { backgroundColor: theme.backgroundElement }]}><AppIcon name="people" size={34} /></View>
              </View>
              <AppButton title="Thêm người dùng" icon="plus" onPress={() => router.push('/users/create')} />
              <StatusMessage message={message} />
              <StatusMessage message={error} error />
              <View style={[styles.searchBox, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
                <AppIcon name="search" size={21} color={theme.textSecondary} />
                <TextInput accessibilityLabel="Tìm theo họ tên hoặc email" placeholder="Tìm tên hoặc email…"
                  value={search} onChangeText={setSearch} autoCapitalize="none" autoCorrect={false}
                  placeholderTextColor={theme.textSecondary} style={[styles.search, { color: theme.text }]} />
                {Boolean(search) && <Pressable accessibilityRole="button" accessibilityLabel="Xóa tìm kiếm"
                  onPress={() => setSearch('')} style={styles.clear}><AppIcon name="close" size={17} color={theme.textSecondary} /></Pressable>}
              </View>
              <View style={styles.sectionRow}>
                <ThemedText style={styles.sectionTitle}>Tất cả hồ sơ</ThemedText>
                {!loading && !error && <ThemedText type="small" themeColor="textSecondary">{filteredUsers.length} / {users.length}</ThemedText>}
              </View>
            </View>
          }
          ListEmptyComponent={loading ? (
            <View style={styles.empty}><ActivityIndicator color={theme.primary} /><ThemedText type="small" themeColor="textSecondary">Đang tải danh bạ…</ThemedText></View>
          ) : !error ? (
            <View style={[styles.empty, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected, borderWidth: 1 }]}>
              <View style={[styles.emptyIcon, { backgroundColor: theme.primarySoft }]}><AppIcon name={search.trim() ? 'search' : 'people'} size={30} /></View>
              <ThemedText style={styles.sectionTitle}>{users.length && search.trim() ? 'Chưa có kết quả' : 'Danh bạ đang chờ bạn'}</ThemedText>
              <ThemedText style={styles.emptyText} themeColor="textSecondary">{users.length && search.trim()
                ? 'Thử tìm bằng một tên hoặc email khác nhé.' : 'Thêm người dùng đầu tiên để bắt đầu xây dựng những kết nối.'}</ThemedText>
              {Boolean(search.trim()) && <AppButton title="Xóa tìm kiếm" variant="ghost" compact onPress={() => setSearch('')} />}
            </View>
          ) : undefined}
          renderItem={({ item }) => (
            <Pressable accessibilityRole="button" accessibilityLabel={`Xem thông tin chi tiết ${item.data.hoten}`}
              onPress={() => router.push({ pathname: '/users/[id]', params: { id: item.id } })}
              style={({ pressed }) => [styles.card, { backgroundColor: theme.backgroundElement,
                borderColor: theme.backgroundSelected, opacity: pressed ? 0.75 : 1 }]}>
              <View style={styles.cardRow}>
                <View style={styles.avatar}><UserAvatar uri={item.data.hinhanh} name={item.data.hoten} size={56} /></View>
                <View style={styles.info}>
                  <ThemedText style={styles.name} numberOfLines={1}>{item.data.hoten}</ThemedText>
                  <ThemedText themeColor="textSecondary" style={styles.email} numberOfLines={1}>{item.data.email}</ThemedText>
                </View>
                <View style={[styles.cardArrow, { backgroundColor: theme.primarySoft }]}><AppIcon name="chevron" size={20} /></View>
              </View>
            </Pressable>
          )}
        />
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 28, width: '100%', maxWidth: 900, alignSelf: 'center', gap: 12 },
  header: { gap: 20, marginBottom: 4 },
  headingRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  title: { fontSize: 35, lineHeight: 44, fontWeight: '700', letterSpacing: -1.4 },
  eyebrow: { fontSize: 9, lineHeight: 16, letterSpacing: 1.6, fontWeight: '600' },
  refresh: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  summary: { padding: 24, borderRadius: 24, flexDirection: 'row', alignItems: 'center' },
  count: { fontSize: 42, lineHeight: 49, fontWeight: '700', letterSpacing: -1.5 },
  summaryLabel: { fontSize: 12, lineHeight: 20 },
  summaryIcon: { width: 70, height: 70, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  searchBox: { flexDirection: 'row', alignItems: 'center', paddingLeft: 16, borderRadius: 16, borderWidth: 1 },
  search: { flex: 1, minWidth: 0, minHeight: 56, paddingVertical: 14, paddingHorizontal: 12, fontSize: 14 },
  clear: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 5 },
  sectionTitle: { fontSize: 16, lineHeight: 24, fontWeight: '700', letterSpacing: -0.3 },
  empty: { padding: 28, gap: 14, alignItems: 'center', borderRadius: 24 },
  emptyIcon: { width: 70, height: 70, borderRadius: 25, justifyContent: 'center', alignItems: 'center' },
  emptyText: { fontSize: 13, lineHeight: 22, textAlign: 'center', maxWidth: 260 },
  card: { width: '100%', padding: 14, borderRadius: 22, minHeight: 88, borderWidth: 1, justifyContent: 'center' },
  cardRow: { width: '100%', flexDirection: 'row', flexWrap: 'nowrap', alignItems: 'center', gap: 12 },
  avatar: { width: 56, height: 56, flexShrink: 0 },
  info: { flex: 1, gap: 5, minWidth: 0 },
  name: { fontSize: 16, lineHeight: 23, fontWeight: '700', letterSpacing: -0.3 },
  email: { fontSize: 12, lineHeight: 18 },
  cardArrow: { width: 44, height: 44, flexShrink: 0, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
