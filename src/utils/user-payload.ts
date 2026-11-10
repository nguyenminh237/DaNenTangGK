import { BCRYPT_HASH_PATTERN } from '@/constants/password';
import type { User, UserInput } from '@/types/user';
import { isHttpsImageUrl } from '@/utils/image-validation';

/** Whitelist duy nhất cho create/update: không bao giờ spread input/snapshot. */
export function buildUserPayload(input: UserInput, passwordHash: string): User {
  if (!isHttpsImageUrl(input.hinhanh)) throw new Error('Chỉ được lưu URL ảnh HTTPS vào field hinhanh.');
  if (!BCRYPT_HASH_PATTERN.test(passwordHash)) {
    throw new Error('Mật khẩu lưu trữ không hợp lệ. Vui lòng nhập mật khẩu mới.');
  }
  return {
    email: input.email,
    matkhau: passwordHash,
    hoten: input.hoten,
    hinhanh: input.hinhanh,
  };
}
