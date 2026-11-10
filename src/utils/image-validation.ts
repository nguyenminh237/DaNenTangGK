import { MAX_IMAGE_BYTES } from '@/constants/image';
import type { SelectedImage } from '@/types/image';

interface ImageCandidate {
  uri: string;
  base64?: string | null;
  fileSize?: number;
  width: number;
  height: number;
  type?: string | null;
  mimeType?: string;
}

function signature(base64: string): number[] {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  const result: number[] = [];
  let bits = 0;
  let value = 0;
  for (const character of base64.slice(0, 24)) {
    if (character === '=') break;
    value = (value << 6) | alphabet.indexOf(character);
    bits += 6;
    if (bits >= 8) { bits -= 8; result.push((value >> bits) & 255); }
  }
  return result;
}

/** Kiểm tra kích thước thực và magic bytes; Cloudinary kiểm tra giải mã ảnh ở server. */
export function validateSelectedImage(asset: ImageCandidate): SelectedImage {
  if (asset.type && asset.type !== 'image') throw new Error('Vui lòng chọn tệp hình ảnh, không chọn video.');
  if (!asset.uri || !Number.isFinite(asset.width) || !Number.isFinite(asset.height) || asset.width <= 0 || asset.height <= 0) {
    throw new Error('Tệp đã chọn không phải hình ảnh hợp lệ.');
  }
  if (asset.fileSize !== undefined && (!Number.isFinite(asset.fileSize) || asset.fileSize <= 0 || asset.fileSize > MAX_IMAGE_BYTES)) {
    throw new Error('Ảnh phải có dung lượng lớn hơn 0 và không vượt quá 5 MB.');
  }
  const base64 = asset.base64;
  if (!base64 || base64.length > Math.ceil(MAX_IMAGE_BYTES / 3) * 4 || base64.length % 4 !== 0
    || !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)) {
    throw new Error('Không đọc được ảnh hợp lệ hoặc ảnh vượt quá 5 MB. Vui lòng chọn ảnh khác.');
  }
  const size = base64.length * 3 / 4 - (base64.endsWith('==') ? 2 : base64.endsWith('=') ? 1 : 0);
  if (size <= 0 || size > MAX_IMAGE_BYTES) throw new Error('Ảnh không được vượt quá 5 MB.');
  const bytes = signature(base64);
  let mimeType: SelectedImage['mimeType'] | undefined;
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) mimeType = 'image/jpeg';
  if ([137, 80, 78, 71, 13, 10, 26, 10].every((byte, index) => bytes[index] === byte)) mimeType = 'image/png';
  const text = String.fromCharCode(...bytes);
  if (text.startsWith('GIF87a') || text.startsWith('GIF89a')) mimeType = 'image/gif';
  if (text.startsWith('RIFF') && text.slice(8, 12) === 'WEBP') mimeType = 'image/webp';
  if (!mimeType || (asset.mimeType && !asset.mimeType.startsWith('image/'))) {
    throw new Error('Chỉ hỗ trợ ảnh JPEG, PNG, WebP hoặc GIF. Với ảnh HEIC, hãy xuất thành JPEG rồi chọn lại.');
  }
  return { uri: asset.uri, base64, mimeType, size, width: asset.width, height: asset.height };
}

export function isHttpsImageUrl(value: string): boolean {
  if (!/^https:\/\//.test(value) || value.length > 2048) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && Boolean(url.hostname) && !url.username && !url.password;
  } catch { return false; }
}

export function getCloudinaryImageUrl(response: unknown): string {
  if (typeof response !== 'object' || response === null) throw new Error('Cloudinary trả về dữ liệu không hợp lệ.');
  const data = response as Record<string, unknown>;
  if (data.resource_type !== 'image' || typeof data.secure_url !== 'string' || !isHttpsImageUrl(data.secure_url)
    || typeof data.bytes !== 'number' || !Number.isFinite(data.bytes) || data.bytes <= 0 || data.bytes > MAX_IMAGE_BYTES
    || typeof data.width !== 'number' || !Number.isFinite(data.width) || data.width <= 0
    || typeof data.height !== 'number' || !Number.isFinite(data.height) || data.height <= 0) {
    throw new Error('Cloudinary chưa trả về ảnh hợp lệ có URL HTTPS. Chưa lưu dữ liệu người dùng.');
  }
  return data.secure_url;
}
