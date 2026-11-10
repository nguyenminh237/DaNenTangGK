import { getApp, getApps, initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

import { assertFirebaseConfig, firebaseConfig } from '@/config/env';

/** Khởi tạo khi service được gọi, để lỗi cấu hình được hiển thị trong UI thay vì crash route. */
export function getFirebaseApp() {
  assertFirebaseConfig();
  return getApps().some((item) => item.name === '[DEFAULT]')
    ? getApp()
    : initializeApp(firebaseConfig);
}

export function getDatabase() {
  return getFirestore(getFirebaseApp());
}
