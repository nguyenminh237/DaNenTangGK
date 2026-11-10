export const cloudinaryConfig = {
  cloudName: process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME?.trim() ?? '',
  uploadPreset: process.env.EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET?.trim() ?? '',
};

export function assertCloudinaryConfig(): void {
  const missing: string[] = [];
  if (!cloudinaryConfig.cloudName) missing.push('EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME');
  if (!cloudinaryConfig.uploadPreset) missing.push('EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET');
  if (missing.length) {
    throw new Error(`Thiếu cấu hình Cloudinary: ${missing.join(', ')}. Bổ sung vào .env và khởi động lại Expo.`);
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(cloudinaryConfig.cloudName)) {
    throw new Error('Cloud name của Cloudinary không hợp lệ. Kiểm tra EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME.');
  }
}
