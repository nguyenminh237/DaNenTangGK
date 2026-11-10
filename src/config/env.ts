/** Tham chiếu tĩnh để Expo có thể đưa biến EXPO_PUBLIC_* vào bundle. */
export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

const environmentNames: Record<keyof typeof firebaseConfig, string> = {
  apiKey: 'EXPO_PUBLIC_FIREBASE_API_KEY',
  authDomain: 'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
  projectId: 'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
  storageBucket: 'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
  messagingSenderId: 'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  appId: 'EXPO_PUBLIC_FIREBASE_APP_ID',
};

export function assertFirebaseConfig(): void {
  const missing = (Object.keys(firebaseConfig) as (keyof typeof firebaseConfig)[])
    .filter((key) => !firebaseConfig[key]?.trim())
    .map((key) => environmentNames[key]);

  if (missing.length) {
    throw new Error(`Thiếu cấu hình Firebase: ${missing.join(', ')}. Bổ sung vào .env và khởi động lại Expo.`);
  }
}
