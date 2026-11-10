import { truncates } from 'bcryptjs';

import type { UserFormErrors, UserInput } from '@/types/user';
import { isHttpsImageUrl } from '@/utils/image-validation';

export function normalizeUserInput(input: UserInput): UserInput {
  return {
    email: input.email.trim().toLowerCase(),
    password: input.password,
    hoten: input.hoten.trim(),
    hinhanh: input.hinhanh.trim(),
  };
}

export function validateUserInput(input: UserInput, editing = false, hasNewImage = false): UserFormErrors {
  const value = normalizeUserInput(input);
  const errors: UserFormErrors = {};
  if (!value.email) errors.email = 'Vui lòng nhập email.';
  else if (value.email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) {
    errors.email = 'Email không đúng định dạng.';
  }
  if (!editing || value.password !== '') {
    if (!value.password.trim()) errors.password = 'Vui lòng nhập mật khẩu.';
    else if (value.password.length < 8) errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    else if (truncates(value.password)) errors.password = 'Mật khẩu không được vượt quá 72 byte UTF-8.';
  }
  if (!value.hoten) errors.hoten = 'Vui lòng nhập họ tên.';
  else if (value.hoten.length > 100) errors.hoten = 'Họ tên không được vượt quá 100 ký tự.';
  if (!hasNewImage && !isHttpsImageUrl(value.hinhanh)) {
    errors.hinhanh = 'Vui lòng chọn ảnh hoặc nhập URL hình ảnh HTTPS hợp lệ (tối đa 2048 ký tự).';
  }
  return errors;
}

export function assertUserInput(input: UserInput, editing = false): UserInput {
  const errors = validateUserInput(input, editing);
  const firstError = Object.values(errors)[0];
  if (firstError) throw new Error(firstError);
  return normalizeUserInput(input);
}
