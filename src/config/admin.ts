/** UID công khai để điều khiển UI; Security Rules mới là nơi thực thi phân quyền. */
export const ADMIN_UID = process.env.EXPO_PUBLIC_ADMIN_UID?.trim() ?? '';

export function assertAdminConfig(): void {
  if (!ADMIN_UID) {
    throw new Error('Thiếu EXPO_PUBLIC_ADMIN_UID trong .env. Điền UID admin từ Firebase Authentication và khởi động lại Expo.');
  }
}

export function isAdminUid(uid: string | undefined): boolean {
  return Boolean(ADMIN_UID && uid && uid === ADMIN_UID);
}
