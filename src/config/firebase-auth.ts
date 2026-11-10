import { getAuth, initializeAuth, inMemoryPersistence } from 'firebase/auth';

import { getFirebaseApp } from '@/config/firebase';

/** Native không thêm AsyncStorage: giữ phiên trong vòng đời ứng dụng. */
export function getFirebaseAuth() {
  const app = getFirebaseApp();
  try {
    return initializeAuth(app, { persistence: inMemoryPersistence });
  } catch (error) {
    if (typeof error === 'object' && error !== null && 'code' in error && error.code === 'auth/already-initialized') {
      return getAuth(app);
    }
    throw error;
  }
}
