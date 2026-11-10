export function getErrorMessage(error: unknown): string {
  const code = typeof error === 'object' && error !== null && 'code' in error
    ? String(error.code).replace(/^firestore\//, '')
    : '';
  switch (code) {
    case 'auth/invalid-email':
      return 'Email đăng nhập không đúng định dạng.';
    case 'auth/missing-password':
      return 'Vui lòng nhập mật khẩu đăng nhập.';
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Email hoặc mật khẩu không đúng.';
    case 'auth/user-disabled':
      return 'Tài khoản này đã bị vô hiệu hóa. Vui lòng liên hệ người quản lý Firebase.';
    case 'auth/too-many-requests':
      return 'Đăng nhập quá nhiều lần. Vui lòng chờ rồi thử lại.';
    case 'auth/network-request-failed':
      return 'Không kết nối được Firebase Authentication. Kiểm tra mạng rồi thử lại.';
    case 'auth/operation-not-allowed':
    case 'auth/configuration-not-found':
      return 'Chưa bật đăng nhập Email/Password. Kiểm tra Firebase Console → Authentication → Sign-in method.';
    case 'auth/invalid-api-key':
      return 'Firebase API key không hợp lệ. Kiểm tra EXPO_PUBLIC_FIREBASE_API_KEY.';
    case 'auth/unauthorized-domain':
      return 'Tên miền web chưa được cho phép trong Firebase Authentication. Kiểm tra Authorized domains.';
    case 'auth/user-token-expired':
    case 'auth/invalid-user-token':
      return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
    case 'permission-denied':
      return 'Không có quyền truy cập Firestore. Kiểm tra đăng nhập và Security Rules của collection users.';
    case 'unauthenticated':
      return 'Firestore yêu cầu đăng nhập. Vui lòng kiểm tra cấu hình xác thực và Security Rules.';
    case 'unavailable':
    case 'deadline-exceeded':
      return 'Không kết nối được Firestore. Kiểm tra mạng và thử lại.';
    case 'not-found':
      return 'Không tìm thấy dữ liệu hoặc cơ sở dữ liệu Firestore. Kiểm tra dự án Firebase.';
    case 'resource-exhausted':
      return 'Firestore đã vượt hạn mức. Vui lòng thử lại sau.';
    case 'invalid-argument':
    case 'app/invalid-api-key':
    case 'app/invalid-app-argument':
      return 'Cấu hình Firebase hoặc dữ liệu gửi lên không hợp lệ. Kiểm tra các biến EXPO_PUBLIC_FIREBASE_*.';
  }
  // Chỉ hiển thị thông báo do ứng dụng tạo; không đưa lỗi SDK thô lên UI.
  if (error instanceof Error && !code) return error.message;
  return 'Thao tác chưa thành công. Kiểm tra cấu hình Firebase và kết nối mạng rồi thử lại.';
}
