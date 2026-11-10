/** Chỉ dùng trong bộ nhớ lúc chọn/upload, không phải schema Firestore. */
export interface SelectedImage {
  uri: string;
  base64: string;
  mimeType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  size: number;
  width: number;
  height: number;
}
