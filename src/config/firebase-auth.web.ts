import { browserSessionPersistence, getAuth, initializeAuth } from 'firebase/auth';

import { getFirebaseApp } from '@/config/firebase';

/** Firebase chỉ lưu phiên xác thực của tab; dữ liệu users vẫn nằm trên Firestore. */
export function getFirebaseAuth() {
  const app = getFirebaseApp();
  try {
    return initializeAuth(app, { persistence: browserSessionPersistence });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}
