import { onAuthStateChanged, signInWithEmailAndPassword, signOut, type User } from 'firebase/auth';

import { assertAdminConfig, isAdminUid } from '@/config/admin';
import { getFirebaseAuth } from '@/config/firebase-auth';

export const authService = {
  subscribe(onChange: (user: User | null) => void, onError: (error: unknown) => void) {
    assertAdminConfig();
    return onAuthStateChanged(getFirebaseAuth(), onChange, onError);
  },

  async signIn(email: string, password: string): Promise<void> {
    assertAdminConfig();
    const auth = getFirebaseAuth();
    const result = await signInWithEmailAndPassword(auth, email.trim(), password);
    if (!isAdminUid(result.user.uid)) {
      await signOut(auth);
      throw new Error('Tài khoản này không có quyền quản trị. Vui lòng dùng tài khoản admin đã cấu hình.');
    }
  },

  async signOut(): Promise<void> {
    await signOut(getFirebaseAuth());
  },
};

/** Kiểm tra cả khi service được gọi ngoài các route đã bảo vệ. */
export async function requireAdminSession(): Promise<void> {
  assertAdminConfig();
  const auth = getFirebaseAuth();
  await auth.authStateReady();
  if (!isAdminUid(auth.currentUser?.uid)) {
    throw new Error('Bạn cần đăng nhập bằng tài khoản admin để quản lý người dùng.');
  }
}
