/** Dữ liệu người dùng theo đề thi; không chứa Firestore Document ID. */
export interface User {
  email: string;
  /** Chỉ chứa bcrypt hash có salt; tuyệt đối không chứa mật khẩu thô. */
  matkhau: string;
  hoten: string;
  hinhanh: string;
}

/** ID là metadata, tách riêng khỏi dữ liệu được lưu trong document. */
export interface UserDocument {
  id: string;
  data: User;
}

/** Dữ liệu an toàn trả về component; không có mật khẩu hoặc hash. */
export type UserProfile = Omit<User, 'matkhau'>;

export interface UserProfileDocument {
  id: string;
  data: UserProfile;
}

/** Chỉ tồn tại trong form/service, không ghi trực tiếp đối tượng này vào Firestore. */
export interface UserInput extends UserProfile {
  password: string;
}

export type UserFormErrors = Partial<Record<keyof UserInput, string>>;
