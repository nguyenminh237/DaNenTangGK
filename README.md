# Quản lý người dùng — bài thi Lập trình đa nền tảng

Expo SDK 58, React Native, Expo Router, TypeScript và Cloud Firestore thật.
Các route `/users`, `/users/create`, `/users/[id]` hỗ trợ danh sách, thêm, sửa, xóa.
`/login` đăng nhập admin bằng Firebase Authentication Email/Password. Không có đăng ký admin công khai. Bản ghi CRUD không tự tạo tài khoản Authentication.

## Chạy web

```powershell
npm.cmd run web
# Khi đổi .env hoặc bổ sung module, dừng server cũ rồi chạy:
npx.cmd expo start --web --clear
```

Chỉ bổ sung `expo-crypto ~58.0.7` bằng Expo install để tạo salt an toàn trên mobile;
giữ nguyên phiên bản thư viện đã có, dùng lại bcryptjs. Expo Crypto có trong Expo Go.
Development build cũ chưa có module này cần build lại. Firebase SDK đang cài khai báo
Node >=24.12.0; máy Node 22.20.0 hiện có cảnh báo engine, không tự hạ SDK.

## Firebase

Giữ `.env` hiện có. Nếu tạo mới, sao chép `.env.example` rồi điền cấu hình Web App
trong Firebase Console > Project settings:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`
- `EXPO_PUBLIC_ADMIN_UID`: UID của tài khoản quản trị, khớp Security Rules

UI sẽ báo đúng tên biến thiếu. Không tạo cấu hình giả, không in giá trị `.env`.
EXPO_PUBLIC là cấu hình client công khai, không được chứa service account/private key.
Firebase khởi tạo singleton khi service được gọi; đọc dữ liệu chỉ từ server.
Không dùng AsyncStorage/localStorage làm database hay bật persistent cache Firestore.

## Thiết lập admin và phân quyền

1. Trong Firebase Console, mở đúng dự án của `.env`. Vào Authentication > Sign-in method,
   bật Email/Password. Không bật đăng ký admin trên giao diện ứng dụng.
2. Vào Authentication > Users, xác định tài khoản có UID
   `O2FpJ6939gPzQ0ztD15D4VdAwp23` theo Rules chủ dự án đã cung cấp.
   Nếu chưa có tài khoản phù hợp, tạo tài khoản bằng Firebase Console; khi đó dùng UID
   thực tế mới cho cả `.env` và Rules. Không tự tạo tài khoản từ app.
3. `.env` đã được bổ sung `EXPO_PUBLIC_ADMIN_UID` từ UID được cung cấp ở bước trên;
   các giá trị Firebase có sẵn được giữ nguyên. Không lưu mật khẩu admin trong `.env`.
4. Mở Firestore Database > Rules, tích hợp nội dung `firestore.rules.example`.
   Kiểm tra UID trong `isAdmin()` khớp với `.env`, rồi Publish trong Firebase Console.
   File mẫu chưa tự deploy; không dùng `allow read, write: if true`.
5. Nếu Firebase báo unauthorized-domain, kiểm tra Authentication > Settings > Authorized domains.
6. Khởi động lại Expo với `--clear` sau khi thay đổi biến môi trường.

Rules kiểm tra UID ở server và chỉ chấp nhận đúng bốn field chuỗi khi thêm/sửa.
Không có role, metadata hay collection phân quyền phụ. UID công khai phía client
chỉ điều khiển UI và chặn service; sửa biến này không vượt được Rules trên server.
Tài khoản khác dù đăng nhập hợp lệ cũng không được đọc/ghi `users`.

Root AuthProvider theo dõi `onAuthStateChanged`. Tất cả route `/users` chờ SDK
khôi phục phiên rồi mới render; chưa đăng nhập hoặc sai UID sẽ chuyển `/login`.
Mọi hàm userService đều kiểm tra phiên admin trước khi truy cập Firestore.
Web dùng Firebase browserSessionPersistence để giữ phiên trong cùng tab khi reload;
đóng tab thì cần đăng nhập lại. Native dùng inMemoryPersistence, cần đăng nhập lại
sau khi tắt và mở lại ứng dụng. Không dùng bộ nhớ trình duyệt làm database users.

## Schema bắt buộc

Collection `users` chỉ ghi đúng bốn field chuỗi:

```text
email    : email được trim và chuyển chữ thường
matkhau  : bcrypt hash có salt riêng, cost 12
hoten    : họ tên
hinhanh  : chỉ URL ảnh HTTPS, không lưu base64/URI thiết bị/metadata
```

Không thêm `id`, timestamps, role hoặc field phụ. Create/update đều dùng whitelist
`buildUserPayload`; update ghi thay thế đầy đủ trong transaction, không merge dữ liệu
input/snapshot tùy ý. Document ID nằm ngoài payload.

Service truy vấn kiểm tra email trước khi thêm/sửa. Document ID mới là
`encodeURIComponent(email chuẩn hóa)`, giúp transaction chặn hai client của service
cùng thêm một email mà không cần collection khóa phụ. Khi đổi email, document được
chuyển sang ID mới và xóa ID cũ trong cùng transaction; UI chuyển route tương ứng.
Dữ liệu cũ nhập ngoài app cần chuẩn hóa email để so sánh không phân biệt hoa thường.

Mật khẩu ít nhất 8 ký tự, tối đa 72 byte UTF-8. Salt 16 byte từ
`expo-crypto.getRandomBytesAsync`, không dùng Math.random. Chỉ băm trước khi ghi;
service chỉ trả hồ sơ không có mật khẩu/hash cho UI. Mật khẩu được che trong form.
Để trống mật khẩu khi sửa sẽ giữ hash cũ; hash cũ không hợp lệ yêu cầu mật khẩu mới.
Mọi thao tác chỉ báo thành công sau khi Firestore xác nhận commit.

## Cấu trúc

- `src/app`: routes, trạng thái tải, điều hướng.
- `src/components`: form chung, avatar, nút, thông báo, layout responsive.
- `src/config`: biến môi trường, Firebase singleton.
- `src/services`: userService CRUD, authService Email/Password, passwordService và imageService chọn/upload ảnh.
- `src/contexts`: AuthProvider và trạng thái phiên đăng nhập.
- `src/types`: User đúng 4 field; UserInput và hồ sơ UI không chứa hash.
- `src/utils`: validation, whitelist payload, lỗi tiếng Việt.
- `src/constants`: theme và cấu hình bcrypt.
- `src/hooks`: theme hỗ trợ SSR, giữ bản sửa hydration khi dark mode.

Danh sách có avatar, họ tên, email, loading, trạng thái trống, tải lại và lỗi.
Form hỗ trợ chọn ảnh từ thư viện, preview và URL ảnh HTTPS; ảnh lỗi/rỗng dùng avatar mặc định bằng chữ cái tên.
Xóa có hộp thoại Modal xác nhận trên web/mobile. Danh sách tải lại khi quay về sau sửa/xóa.
Tìm kiếm họ tên/email phía client, hỗ trợ không dấu và không phân biệt hoa thường.
Nút đăng xuất xuất hiện ở mọi màn hình quản lý. Image-picker và upload Cloudinary được mô tả bên dưới.

## Kiểm tra

```powershell
npx.cmd tsc --noEmit
node --test tests/user-data.test.cjs
npx.cmd expo lint
```

Tests kiểm tra validation, giới hạn bcrypt, payload đúng 4 field và lỗi thiếu cấu hình;
không ghi dữ liệu kiểm thử lên Firestore. Project chưa có ESLint/eslint-config-expo,
nên lint chưa chạy được; không tự cài thêm tooling.
Không sửa file typed routes trong `.expo` hoặc chạy `reset-project`.

## Quy trình kiểm thử chức năng trên web

Chuẩn bị tài khoản admin hợp lệ và publish Rules theo hướng dẫn trên. Không dùng
mật khẩu của bản ghi CRUD để đăng nhập quản trị; đây là hai loại dữ liệu khác nhau.

1. Chạy `npx.cmd expo start --web --clear`. Khi chưa đăng nhập, mở trực tiếp `/users`,
   `/users/create`, `/users/<document-id>`: đều phải chuyển về `/login`, không hiện hồ sơ.
2. Tại login, để trống/sai định dạng email hoặc bỏ mật khẩu: thấy lỗi tiếng Việt.
   Thử sai mật khẩu: thấy lỗi xác thực, không vào trang quản lý.
3. Đăng nhập bằng một tài khoản Firebase hợp lệ có UID khác admin: phải bị từ chối,
   phiên vừa đăng nhập bị kết thúc và không thấy dữ liệu users.
4. Đăng nhập bằng admin đúng UID: vào danh sách thật. Reload cùng tab: SDK khôi phục
   phiên, không nháy nội dung quản lý trước khi kiểm tra xong và không yêu cầu login lại.
5. Thêm một bản ghi kiểm thử riêng bằng email chưa tồn tại và URL ảnh hợp lệ. Chỉ báo
   thành công sau commit. Mở Firebase Console kiểm tra document chỉ có đúng
   email, matkhau, hoten, hinhanh; matkhau là bcrypt hash, không phải mật khẩu thô.
   Thử thêm trùng email: bị từ chối. Không dùng tài khoản/dữ liệu đang cần giữ để thử xóa.
6. Tìm theo một phần họ tên hoặc email; thử chữ hoa, không dấu, chuỗi không khớp
   và xóa nội dung tìm. Kết quả lọc tại client, không ghi thêm dữ liệu Firestore.
7. Mở chi tiết: tải đúng email, họ tên, URL ảnh; không có hash trên UI.
   Sửa tên/ảnh, để trống mật khẩu mới rồi lưu. Reload và kiểm tra dữ liệu giữ được;
   đối chiếu trong Firebase Console để xác nhận hash cũ không đổi.
8. Sửa email và mật khẩu mới. Sau commit, route chuyển sang ID mới vì service hiện
   dùng ID theo email chuẩn hóa. Kiểm tra document cũ đã được chuyển atomically,
   dữ liệu chỉ có 4 field và hash đã đổi. Thử email của người khác: phải báo trùng.
9. Chọn Xóa: hộp thoại hiện tên người dùng. Hủy: dữ liệu còn nguyên. Chọn lại và
   Xác nhận xóa: chờ commit, quay về danh sách đã tải lại, document không còn trên Console.
10. Nhấn Đăng xuất: về login. Nhấn Back hoặc mở lại URL quản lý: vẫn bị chặn.
    Thử mất mạng khi đăng nhập/lưu: báo lỗi tiếng Việt, không báo thành công giả.
11. Trong Rules Playground, kiểm tra đọc/ghi `users` với không auth hoặc UID khác:
    bị từ chối; admin được phép. Admin ghi thêm field id/role/createdAt/updatedAt
    hoặc thiếu một trong bốn field cũng phải bị từ chối. Rules Playground không ghi dữ liệu thật.

## Phạm vi đã xác minh

Đã chạy TypeScript không lỗi và 10 bài kiểm tra helper thành công (UID admin, tìm kiếm,
lỗi tiếng Việt, validation, whitelist payload và bcrypt). Trình duyệt ở chiều rộng 390px,
dark mode đã xác nhận cả ba route quản lý chuyển về login khi chưa đăng nhập;
form báo đúng lỗi thiếu email/mật khẩu, ô mật khẩu được che và không tràn ngang.
Không chèn phiên giả hay mock dữ liệu Firestore. Lint chưa chạy được vì thiếu cấu hình ESLint.
Không có thông tin đăng nhập admin nên chưa xác minh đăng nhập thành công, khôi phục
phiên admin, đăng xuất từ phiên thật và CRUD sau xác thực trên cloud. Cần thực hiện
quy trình thủ công trên để xác minh các nhánh này; không coi test helper là kiểm thử cloud.

## Chọn ảnh và upload Cloudinary

`expo-image-picker ~58.0.10` đã có sẵn, không thay phiên bản hay thêm SDK Cloudinary.
`src/services/image.service.ts` mở system photo picker chỉ chọn ảnh, không mở camera.
Trên web, picker được gọi trực tiếp từ thao tác bấm nút, không chờ xin quyền trước đó.
Preview dùng URI cục bộ trong bộ nhớ. Ảnh chỉ upload khi bấm Thêm/Lưu thay đổi.
Chọn Hủy hoặc Bỏ ảnh mới chọn giữ URL ảnh trước đó; khi sửa mà không chọn ảnh mới
thì không upload, URL hiện tại được giữ nguyên.

### Cấu hình Cloudinary

Trong Cloudinary Console, lấy cloud name và tạo Upload preset có Signing mode
**Unsigned**. Giới hạn preset chỉ nhận jpg/jpeg/png/webp/gif và tối đa 5 MB;
nên dùng folder riêng cho ảnh người dùng. Điền hai biến thật trong `.env`:

```dotenv
EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME=
EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET=
```

Các tên biến còn thiếu đã được thêm với giá trị rỗng, chưa tạo dữ liệu cấu hình giả.
Không nhập API secret vào mã nguồn, `.env.example` hoặc bất kỳ EXPO_PUBLIC_* nào.
Cloud name và preset sẽ có trong bundle. Unsigned preset có thể được gọi bởi người
biết tên preset; kiểm tra admin trong app không thay thế giới hạn trên Cloudinary.
Dùng đúng preset có giới hạn dung lượng/định dạng ở server, không chỉ kiểm tra client.
Sau khi điền biến môi trường, dừng server và khởi động lại với `--clear`.

### Kiểm tra tệp và trình tự lưu

- Hỗ trợ JPEG, PNG, WebP, GIF; kiểm tra kích thước ảnh, dung lượng thực tối đa 5 MB
  và magic bytes thay vì chỉ tin đuôi tệp/MIME. Không nhận video/SVG/tệp giả ảnh.
- iOS dùng representation Compatible và editor; nếu HEIC vẫn trả về nguyên định dạng,
  app báo cần xuất thành JPEG thay vì upload một kiểu không hỗ trợ.
- Base64 được yêu cầu từ picker để xác minh nội dung và kích thước nhất quán trên
  native/web, rồi gửi dưới dạng data URI trong multipart FormData tới endpoint image/upload.
  Giới hạn 5 MB cũng giới hạn bộ nhớ; không lưu base64, filename, public_id hoặc metadata vào Firestore.
- Cloudinary phải trả resource_type=image, kích thước hợp lệ và secure_url HTTPS.
  Timeout sau 60 giây; lỗi mạng/preset/quota/server đều báo tiếng Việt.
- Form chờ upload xong mới gọi userService ghi Firestore. UI phân biệt Đang tải ảnh
  lên Cloudinary và Đang lưu Firestore. Chỉ báo thành công sau cả hai bước.
- Upload lỗi: không ghi người dùng. Upload thành công nhưng Firestore lỗi: không báo
  thành công; URL vừa upload được giữ trong form để retry không upload lặp trong cùng phiên.
  Chọn ảnh mới hoặc rời màn hình sẽ kết thúc phần nhớ tạm này.
- Hai dịch vụ không có transaction chung. Ảnh đã upload có thể tồn tại trên Cloudinary
  khi Firestore lỗi hoặc người dùng rời form. Không xóa asset cũ/tệp mồ côi tự động từ client
  vì không có API secret; quản lý các asset đó qua Cloudinary Console.
- `hinhanh` chỉ nhận HTTPS tại validation và whitelist payload, Rules mẫu cũng chặn HTTP.
  Dữ liệu cũ còn URL HTTP cần đổi sang HTTPS hoặc chọn ảnh mới trước khi lưu cập nhật.

### Kiểm thử trên điện thoại thật với Expo Go

1. Cài Expo Go tương thích SDK 58 trên Android/iOS, cho máy tính và điện thoại vào
   cùng Wi-Fi, sau đó chạy `npx.cmd expo start --clear` (hoặc `npx expo start --clear`).
   Quét QR bằng Expo Go trên Android hoặc Camera trên iPhone. Nếu mạng LAN không
   kết nối được, thử `npx expo start --tunnel`; điện thoại cần truy cập được Firebase/Cloudinary.
2. Đăng nhập bằng admin đúng UID. Chọn Thêm người dùng > Chọn ảnh từ thư viện.
   Chọn ảnh nhỏ hơn 5 MB: thấy preview trước khi bấm lưu. Chọn Hủy rồi thử lại;
   ảnh cũ không được mất. Thử Bỏ ảnh mới chọn để quay về URL trước đó.
3. Thử ảnh quá 5 MB, video/tệp không phải ảnh và ảnh HEIC không chuyển được:
   phải báo lỗi và không ghi Firestore. Thử thư viện quyền hạn chế/không cho phép:
   dùng ảnh trong phạm vi cho phép hoặc kiểm tra thông báo lỗi; không ép cấp quyền toàn thư viện.
4. Điền các trường rồi Lưu: chờ upload và commit. Trong Firebase Console,
   document phải có đúng email, matkhau, hoten, hinhanh; hinhanh là URL https://,
   không có fileSize, MIME, base64 hoặc public_id. Kiểm tra asset thật trong Cloudinary Console.
5. Mở lại danh sách trên điện thoại và web: card hiển thị ảnh, họ tên, email.
   Với URL hỏng/rỗng, avatar mặc định vẫn có kích thước ổn định, card không bị vỡ.
6. Sửa tên mà không chọn ảnh: URL cũ không đổi. Chọn ảnh mới rồi Lưu: URL đổi sau
   commit, avatar hiển thị ảnh mới. Để trống mật khẩu mới vẫn giữ hash cũ.
7. Thử ngắt mạng khi upload, preset sai, timeout và Firestore từ chối ghi:
   không được hiện thành công giả. Sau khi mạng/quyền được khôi phục, thử lưu lại;
   nếu ảnh đã upload trước đó thì URL trong form được tái sử dụng.
8. Trên web, đăng nhập admin và bấm Chọn ảnh trực tiếp, chọn một tệp trên máy;
   kiểm tra preview/lưu giống điện thoại. Không mở picker từ useEffect/tự động sau reload.

Module ImagePicker có trong Expo Go. Cấu hình plugin ở app.json thêm mô tả Photos
bằng tiếng Việt và tắt quyền camera/microphone vì tính năng này chỉ chọn thư viện.
Thông báo permission của Expo Go do ứng dụng Expo Go quản lý; cấu hình plugin chỉ
áp dụng cho bản native riêng sau khi build lại bằng EAS. Không sửa thư mục ios/android bằng tay.

Chưa xác minh upload lên tài khoản Cloudinary thật hoặc thao tác trên điện thoại thật:
hiện thiếu hai giá trị cấu hình Cloudinary và chưa có phiên admin để kiểm thử toàn bộ.
Kiểm tra TypeScript/helper/bundle không thay thế kiểm thử upload + Firestore + thiết bị.

Đã export JavaScript bundle cho iOS, Android và web thành công bằng
`npx expo export --platform all --no-bytecode --max-workers 2 --output-dir .expo/image-export-check`.
Đây là kiểm tra bundling, không phải bản native đã cài/chạy trên máy thật; thư mục kết quả được gitignore.

## Giao diện mobile và safe area

Giao diện People dùng bảng màu xanh lá, card bo góc, input có icon và dark mode.
Icon từ expo-symbols đang có sẵn; không thêm UI framework hoặc thay phiên bản dependencies.
Logic Authentication, userService, Cloudinary và schema bốn field được giữ nguyên.

Header native của root/users Stack được ẩn. Mỗi màn hình tự đặt ScreenHeader bên
trong SafeAreaView có cạnh top, left, right; thanh phiên quản trị sở hữu inset bottom.
ScrollView/FlatList đặt contentInsetAdjustmentBehavior=never và tắt tự điều chỉnh
content inset để tránh iOS áp thêm offset dưới header. KeyboardAvoidingView không
còn offset cố định 100 px; khoảng cách bàn phím dùng layout đã nằm trong safe area.
Trang đăng nhập/trang chủ có bottom padding theo inset, form quản lý dùng footer của users layout.

Đã kiểm tra trang chủ/đăng nhập bằng trình duyệt ở 320px, 390px, 1024px và dark mode:
không tràn ngang, tiêu đề hiển thị trong viewport và không có cảnh báo hydration.
Kiểm tra trình duyệt không mô phỏng được chính xác Dynamic Island hay bàn phím iOS.
Chưa trực tiếp xác minh UI trên iPhone thật hoặc chụp màn hình quản lý trong phiên admin thật.

Kiểm thử iPhone sau khi cập nhật:

1. Dừng Metro cũ, chạy `npx expo start --clear` (PowerShell: `npx.cmd expo start --clear`)
   rồi mở lại app trong Expo Go tương thích SDK 58.
2. Mở đăng nhập, danh sách, thêm mới và chi tiết: header phải nằm dưới notch/Dynamic Island;
   không cần kéo xuống mới thấy tiêu đề và không có hai thanh tiêu đề chồng nhau.
3. Chạm email/mật khẩu/họ tên để mở bàn phím, cuộn tới nút lưu; đóng bàn phím và
   kiểm tra nội dung không bị giữ ở offset bất thường. Nút mắt chỉ thay cách hiển thị mật khẩu.
4. Thử card với tên/email dài, tìm kiếm, ảnh lỗi, chọn ảnh, lưu, xác nhận xóa và đăng xuất.
   Kiểm tra light/dark mode và iPhone màn hình nhỏ; Firestore vẫn chỉ có bốn field.

## Document ID trong route chi tiết

Các document tạo bởi service dùng ID từ email đã encode, ví dụ `test%40example.com`.
Expo Router encode ID một lần khi tạo URL và decode khi tạo route state. Trong SDK 58,
useLocalSearchParams còn decode giá trị thêm lần nữa, khiến `%40` bị đổi thành `@`
và màn hình đọc sai document. Chi tiết hiện dùng useRoute từ expo-router để lấy
route.params.id nguyên vẹn cho đọc/sửa/xóa, còn useLocalSearchParams chỉ đọc notice.
Không migrate hay sửa dữ liệu Firestore để xử lý lỗi điều hướng này.

Đã kiểm tra vòng đi từ ID qua resolveHref, getStateFromPath và useRoute thực tế cho
ID auto, percent escapes, dấu cộng và Unicode; TypeScript và tổng 11 tests đều qua.
Thông báo lỗi dùng dấu !/✓ thông thường để tránh ký tự private-use của font icon
xuất hiện khi font chưa hiển thị đúng hoặc khi sao chép thông báo.
Kiểm thử lại bằng cách tải lại danh sách, bấm card, reload URL chi tiết rồi thử sửa/xóa.
Chưa kiểm thử đọc document thật trong phiên admin trong lần sửa này.
