import * as ImagePicker from 'expo-image-picker';

import { assertCloudinaryConfig, cloudinaryConfig } from '@/config/cloudinary';
import { IMAGE_UPLOAD_TIMEOUT_MS } from '@/constants/image';
import { requireAdminSession } from '@/services/auth.service';
import type { SelectedImage } from '@/types/image';
import { getCloudinaryImageUrl, validateSelectedImage } from '@/utils/image-validation';

class ImageUploadError extends Error {}

export const imageService = {
  async pick(): Promise<SelectedImage | null> {
    let result: ImagePicker.ImagePickerResult;
    try {
      // Photos-only system picker không cần xin quyền đọc toàn bộ thư viện.
      // Không await xin quyền trước launch: web cần lời gọi trong thao tác bấm nút.
      result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'], allowsMultipleSelection: false, allowsEditing: true,
        quality: 0.85, base64: true,
        preferredAssetRepresentationMode: ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
      });
    } catch {
      throw new Error('Không mở được thư viện ảnh. Kiểm tra quyền truy cập ảnh trong Cài đặt hoặc thử lại.');
    }
    if (result.canceled) return null;
    const asset = result.assets[0];
    if (!asset) throw new Error('Không đọc được ảnh đã chọn. Vui lòng chọn lại.');
    return validateSelectedImage(asset);
  },

  async upload(image: SelectedImage): Promise<string> {
    assertCloudinaryConfig();
    await requireAdminSession();
    const verified = validateSelectedImage({ ...image, type: 'image', fileSize: image.size });
    const body = new FormData();
    // Data URI hỗ trợ cả Expo Go và web, không dùng Node Buffer hay API secret.
    body.append('file', `data:${verified.mimeType};base64,${verified.base64}`);
    body.append('upload_preset', cloudinaryConfig.uploadPreset);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), IMAGE_UPLOAD_TIMEOUT_MS);
    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`, {
        method: 'POST', body, signal: controller.signal,
      });
      if (!response.ok) {
        if (response.status === 413) throw new ImageUploadError('Cloudinary từ chối vì ảnh quá lớn. Giới hạn của ứng dụng là 5 MB.');
        if (response.status === 429) throw new ImageUploadError('Cloudinary đang giới hạn yêu cầu. Vui lòng chờ rồi thử lại.');
        if (response.status === 400 || response.status === 401 || response.status === 403) {
          throw new ImageUploadError('Cloudinary từ chối upload. Kiểm tra cloud name, preset Unsigned, định dạng và giới hạn dung lượng của preset.');
        }
        throw new ImageUploadError('Dịch vụ Cloudinary chưa sẵn sàng. Vui lòng thử lại sau.');
      }
      const data: unknown = await response.json();
      try { return getCloudinaryImageUrl(data); }
      catch { throw new ImageUploadError('Cloudinary chưa trả về ảnh hợp lệ có URL HTTPS. Chưa lưu dữ liệu người dùng.'); }
    } catch (cause) {
      if (cause instanceof ImageUploadError) throw cause;
      if (controller.signal.aborted) throw new Error('Upload ảnh quá 60 giây. Kiểm tra mạng và thử lại.');
      throw new Error('Không tải được ảnh lên Cloudinary. Kiểm tra kết nối mạng rồi thử lại.');
    } finally { clearTimeout(timer); }
  },
};
