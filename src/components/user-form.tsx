import { useRef, useState } from 'react';
import { Pressable, StyleSheet, View, type TextInputProps } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { InputField } from '@/components/input-field';
import { AppButton } from '@/components/app-button';
import { StatusMessage } from '@/components/status-message';
import { ThemedText } from '@/components/themed-text';
import { UserAvatar } from '@/components/user-avatar';
import { useTheme } from '@/hooks/use-theme';
import { imageService } from '@/services/image.service';
import type { SelectedImage } from '@/types/image';
import type { UserFormErrors, UserInput, UserProfile } from '@/types/user';
import { getErrorMessage } from '@/utils/service-error';
import { normalizeUserInput, validateUserInput } from '@/utils/user-validation';

interface UserFormProps {
  initialValue?: UserProfile;
  disabled?: boolean;
  onSubmit: (input: UserInput) => Promise<void>;
  onBusyChange?: (busy: boolean) => void;
}

export function UserForm({ initialValue, disabled, onSubmit, onBusyChange }: UserFormProps) {
  const editing = Boolean(initialValue);
  const [value, setValue] = useState<UserInput>({
    email: initialValue?.email ?? '', hoten: initialValue?.hoten ?? '',
    hinhanh: initialValue?.hinhanh ?? '', password: '',
  });
  const [errors, setErrors] = useState<UserFormErrors>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [picking, setPicking] = useState(false);
  const [showUrl, setShowUrl] = useState(false);
  const [selectedImage, setSelectedImage] = useState<SelectedImage | null>(null);
  const [stage, setStage] = useState<'uploading' | 'saving'>('saving');
  const submitting = useRef(false);
  const selecting = useRef(false);
  const theme = useTheme();

  async function submit() {
    if (disabled || submitting.current || selecting.current) return;
    const nextErrors = validateUserInput(value, editing, Boolean(selectedImage));
    setErrors(nextErrors);
    setError('');
    if (Object.keys(nextErrors).length) return;
    submitting.current = true;
    setSaving(true);
    onBusyChange?.(true);
    let uploaded = false;
    try {
      let input = normalizeUserInput(value);
      if (selectedImage) {
        setStage('uploading');
        const url = await imageService.upload(selectedImage);
        input = { ...input, hinhanh: url };
        // Nếu Firestore lỗi, giữ URL trong bộ nhớ để retry không upload lặp.
        setValue((current) => ({ ...current, hinhanh: url }));
        setSelectedImage(null);
        uploaded = true;
      }
      setStage('saving');
      await onSubmit(input);
      setValue((current) => ({ ...current, password: '' }));
    } catch (cause) {
      setError((uploaded ? 'Ảnh đã upload nhưng chưa lưu được người dùng. ' : '') + getErrorMessage(cause));
    } finally {
      submitting.current = false;
      setSaving(false);
      onBusyChange?.(false);
    }
  }

  async function pickImage() {
    if (disabled || submitting.current || selecting.current) return;
    selecting.current = true;
    setPicking(true);
    setError('');
    onBusyChange?.(true);
    try {
      const image = await imageService.pick();
      if (image) {
        setSelectedImage(image);
        setErrors((current) => ({ ...current, hinhanh: undefined }));
      }
    } catch (cause) { setError(getErrorMessage(cause)); }
    finally { selecting.current = false; setPicking(false); onBusyChange?.(false); }
  }

  function field(key: keyof UserInput, label: string, icon: AppIconName, props: TextInputProps = {}) {
    return (
      <InputField label={label} icon={icon} value={value[key]} error={errors[key]}
        onChangeText={(text) => {
          setValue((current) => ({ ...current, [key]: text }));
          setErrors((current) => ({ ...current, [key]: undefined }));
          setError('');
        }}
        editable={!disabled && !saving && !picking && !(key === 'hinhanh' && Boolean(selectedImage))}
        {...props} />
    );
  }

  return (
    <View style={styles.form}>
      <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
        <View style={styles.photoRow}>
          <View style={[styles.avatarFrame, { backgroundColor: theme.primarySoft }]}>
            <UserAvatar uri={selectedImage?.uri ?? value.hinhanh.trim()} name={value.hoten} size={82} />
          </View>
          <View style={styles.photoInfo}>
            <ThemedText style={styles.sectionTitle}>Ảnh đại diện</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Thêm một ảnh để hồ sơ dễ nhận ra hơn.</ThemedText>
          </View>
        </View>
        <AppButton title={picking ? 'Đang chọn ảnh…' : 'Chọn ảnh từ thư viện'} icon="photo" variant="secondary"
          loading={picking} disabled={disabled || saving} onPress={() => void pickImage()} />
        <ThemedText style={styles.hint} themeColor="textSecondary">JPG, PNG, WebP hoặc GIF · Tối đa 5 MB</ThemedText>
        {selectedImage && <>
          <View style={[styles.selected, { backgroundColor: theme.primarySoft }]}>
            <AppIcon name="check" size={17} />
            <ThemedText style={[styles.selectedText, { color: theme.primary }]}>Ảnh mới · {(selectedImage.size / 1024 / 1024).toFixed(2)} MB</ThemedText>
            <Pressable accessibilityRole="button" accessibilityLabel="Bỏ ảnh mới chọn" hitSlop={10}
              disabled={disabled || saving || picking} onPress={() => setSelectedImage(null)} style={styles.remove}>
              <AppIcon name="close" size={17} />
            </Pressable>
          </View>
        </>}
        <Pressable accessibilityRole="button" accessibilityState={{ expanded: showUrl }}
          disabled={disabled || saving || picking} onPress={() => setShowUrl((current) => !current)} style={styles.urlToggle}>
          <AppIcon name="link" size={15} color={theme.textSecondary} />
          <ThemedText style={styles.hint} themeColor="textSecondary">{showUrl ? 'Ẩn đường dẫn ảnh' : 'Hoặc dùng đường dẫn ảnh'}</ThemedText>
        </Pressable>
        {showUrl && field('hinhanh', 'Đường dẫn ảnh HTTPS', 'link', { autoCapitalize: 'none', autoCorrect: false,
          keyboardType: 'url', placeholder: 'https://...', maxLength: 2048 })}
        {!showUrl && errors.hinhanh && <ThemedText style={[styles.hint, { color: theme.danger }]} accessibilityRole="alert">{errors.hinhanh}</ThemedText>}
      </View>
      <View style={[styles.section, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
        <View style={styles.sectionHeading}>
          <AppIcon name="user" size={19} />
          <ThemedText style={styles.sectionTitle}>Thông tin cá nhân</ThemedText>
        </View>
        {field('hoten', 'Họ và tên', 'user', { autoCapitalize: 'words', maxLength: 100, placeholder: 'Nhập họ tên đầy đủ' })}
        {field('email', 'Địa chỉ email', 'mail', { keyboardType: 'email-address', autoCapitalize: 'none', autoCorrect: false,
          autoComplete: 'email', maxLength: 254, placeholder: 'ten@vidu.com' })}
        {field('password', editing ? 'Mật khẩu mới' : 'Mật khẩu', 'lock', {
          secureTextEntry: true, autoCapitalize: 'none', autoCorrect: false,
          autoComplete: 'new-password', placeholder: editing ? 'Để trống để giữ mật khẩu cũ' : 'Tối thiểu 8 ký tự' })}
        {editing && <ThemedText style={styles.hint} themeColor="textSecondary">Không cần nhập lại nếu bạn chỉ thay đổi thông tin hồ sơ.</ThemedText>}
      </View>
      <StatusMessage message={error} error />
      <AppButton title={saving ? (stage === 'uploading' ? 'Đang tải ảnh…' : 'Đang lưu hồ sơ…')
        : editing ? 'Lưu thay đổi' : 'Tạo hồ sơ người dùng'} icon="check"
        loading={saving} disabled={disabled || picking} onPress={() => void submit()} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 20 },
  section: { padding: 20, gap: 18, borderWidth: 1, borderRadius: 24 },
  sectionTitle: { fontSize: 17, lineHeight: 25, fontWeight: '700', letterSpacing: -0.3 },
  sectionHeading: { flexDirection: 'row', alignItems: 'center', gap: 9, marginBottom: 3 },
  photoRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatarFrame: { padding: 5, borderRadius: 48 },
  photoInfo: { flex: 1, gap: 5 },
  hint: { fontSize: 11, lineHeight: 18 },
  selected: { flexDirection: 'row', alignItems: 'center', gap: 7, paddingLeft: 12, borderRadius: 12 },
  selectedText: { fontSize: 12, flex: 1 },
  remove: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  urlToggle: { minHeight: 34, flexDirection: 'row', gap: 6, alignItems: 'center', alignSelf: 'center' },
});
