# Services

- `user.service.ts`: CRUD thật trên `users`, đọc server và ghi transaction.
- `password.service.ts`: bcrypt cost 12 với salt từ Expo Crypto.

Component không gọi trực tiếp Firebase. Service chỉ trả hồ sơ không có mật khẩu/hash.
Create/update dùng `src/utils/user-payload.ts` để ghi đúng 4 field.
Document ID không phải field; khi đổi email, service chuyển document atomically và trả ID mới.
auth.service.ts dùng Firebase Authentication Email/Password, không đăng ký công khai.
Mọi hàm userService đều yêu cầu phiên đúng UID admin. image.service.ts chọn ảnh từ thư viện bằng Expo ImagePicker và upload unsigned lên Cloudinary.
Chỉ URL HTTPS được truyền vào userService; asset/base64 không phải dữ liệu Firestore.
