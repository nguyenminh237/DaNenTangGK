import { router, useFocusEffect, useLocalSearchParams, useRoute } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator } from 'react-native';

import { AppButton } from '@/components/app-button';
import { ConfirmDeleteDialog } from '@/components/confirm-delete-dialog';
import { FormScreen } from '@/components/form-screen';
import { StatusMessage } from '@/components/status-message';
import { UserForm } from '@/components/user-form';
import { userService } from '@/services/user.service';
import type { UserInput, UserProfileDocument } from '@/types/user';
import { getRouteParam } from '@/utils/route-params';
import { getErrorMessage } from '@/utils/service-error';

export default function UserDetailScreen() {
  const params = useLocalSearchParams<{ notice?: string }>();
  const route = useRoute<{ key: string; name: string; params?: { id?: string | string[] } }>();
  // Router đã decode URL khi tạo route.params. useLocalSearchParams trong SDK 58
  // decode thêm lần nữa, làm mất ký tự % trong ID Firestore như email%40domain.com.
  // Dùng ID gốc của route cho cả đọc, cập nhật và xóa; không sửa ID trong database.
  const id = getRouteParam(route.params?.id);
  const notice = params.notice;
  const [user, setUser] = useState<UserProfileDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [revision, setRevision] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [saving, setSaving] = useState(false);
  const deleteLock = useRef(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError('');
    setUser(null);
    setConfirmDelete(false);
    setSuccess(notice === 'updated' ? 'Cập nhật người dùng thành công.' : '');
    if (!id) {
      setError('Document ID không hợp lệ.');
      setLoading(false);
      return;
    }
    userService.getById(id).then((data) => {
      if (active) {
        setUser(data);
        if (!data) setError('Không tìm thấy người dùng.');
      }
    }).catch((cause: unknown) => {
      if (active) setError(getErrorMessage(cause));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id, revision, notice]));

  async function updateUser(input: UserInput) {
    if (!id) throw new Error('Document ID không hợp lệ.');
    setSuccess('');
    setError('');
    const nextId = await userService.update(id, input);
    if (nextId !== id) {
      router.replace({ pathname: '/users/[id]', params: { id: nextId, notice: 'updated' } });
    } else {
      setUser({ id, data: { email: input.email, hoten: input.hoten, hinhanh: input.hinhanh } });
      setSuccess('Cập nhật người dùng thành công.');
    }
  }

  function onFormBusyChange(busy: boolean) {
    setSaving(busy);
    if (busy) { setSuccess(''); setError(''); }
  }

  async function deleteUser() {
    if (!id || saving || deleteLock.current) return;
    deleteLock.current = true;
    setDeleting(true);
    setError('');
    setSuccess('');
    try {
      await userService.delete(id);
      router.replace({ pathname: '/users', params: { notice: 'deleted' } });
    } catch (cause) {
      setConfirmDelete(false);
      setError(getErrorMessage(cause));
    } finally {
      deleteLock.current = false;
      setDeleting(false);
    }
  }

  return (
    <FormScreen title="Hồ sơ người dùng" eyebrow="DANH BẠ / CHI TIẾT" back bottomInset={false}
      subtitle="Xem lại thông tin và cập nhật những điều mới.">
      {loading && <ActivityIndicator accessibilityLabel="Đang tải người dùng" />}
      <StatusMessage message={error} error />
      {!loading && !user && <AppButton title="Thử tải lại" onPress={() => setRevision((current) => current + 1)} />}
      {user && !loading && <>
        <StatusMessage message={success} />
        <UserForm key={user.id} initialValue={user.data} onSubmit={updateUser} onBusyChange={onFormBusyChange}
          disabled={deleting || confirmDelete} />
        <AppButton title="Xóa người dùng" danger icon="trash" disabled={saving || deleting} onPress={() => setConfirmDelete(true)} />
        <ConfirmDeleteDialog visible={confirmDelete} name={user.data.hoten} loading={deleting}
          onConfirm={() => void deleteUser()} onCancel={() => setConfirmDelete(false)} />
      </>}
      <AppButton title="Về danh sách" variant="ghost" icon="back" disabled={saving || deleting} onPress={() => router.replace('/users')} />
    </FormScreen>
  );
}
