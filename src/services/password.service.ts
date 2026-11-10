import { encodeBase64, hash } from 'bcryptjs';
import { getRandomBytesAsync } from 'expo-crypto';

import { BCRYPT_COST } from '@/constants/password';

export async function hashPassword(password: string): Promise<string> {
  try {
    // Tạo salt trước bằng API async: không dùng fallback Math.random trong chế độ debug.
    const bytes = await getRandomBytesAsync(16);
    const salt = `$2b$${BCRYPT_COST}$${encodeBase64(bytes, bytes.length)}`;
    return await hash(password, salt);
  } catch {
    throw new Error('Không thể băm mật khẩu an toàn. Trên web hãy dùng HTTPS hoặc localhost; trên mobile hãy kiểm tra Expo Crypto trong bản build.');
  }
}
