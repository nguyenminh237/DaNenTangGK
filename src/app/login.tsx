import { Redirect } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { AppIcon } from '@/components/app-icon';
import { InputField } from '@/components/input-field';
import { AppButton } from '@/components/app-button';
import { FormScreen } from '@/components/form-screen';
import { SessionLoading } from '@/components/session-loading';
import { StatusMessage } from '@/components/status-message';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useTheme } from '@/hooks/use-theme';
import { authService } from '@/services/auth.service';
import { getErrorMessage } from '@/utils/service-error';

export default function LoginScreen() {
  const { loading, isAdmin, error: sessionError, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const busy = useRef(false);
  const theme = useTheme();

  async function login() {
    if (busy.current) return;
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Vui lòng nhập email hợp lệ.');
      return;
    }
    if (!password) { setError('Vui lòng nhập mật khẩu.'); return; }
    busy.current = true;
    setSubmitting(true);
    try { await authService.signIn(email, password); }
    catch (cause) { setError(getErrorMessage(cause)); }
    finally { busy.current = false; setSubmitting(false); setPassword(''); }
  }

  if (loading) return <SessionLoading />;
  if (isAdmin) return <Redirect href="/users" />;
  return (
    <FormScreen title={'Chào mừng\ntrở lại.'} eyebrow="DÀNH CHO QUẢN TRỊ VIÊN"
      subtitle="Một không gian gọn gàng cho mọi kết nối của bạn.">
      <View style={[styles.card, { backgroundColor: theme.backgroundElement, borderColor: theme.backgroundSelected }]}>
        <View style={styles.cardHeading}>
          <View style={[styles.iconBox, { backgroundColor: theme.primarySoft }]}><AppIcon name="shield" size={25} /></View>
          <View style={{ flex: 1 }}>
            <ThemedText style={styles.cardTitle}>Đăng nhập</ThemedText>
            <ThemedText type="small" themeColor="textSecondary">Tài khoản quản trị của bạn</ThemedText>
          </View>
        </View>
        <StatusMessage message={sessionError} error />
        {user && <StatusMessage message="Tài khoản hiện tại không có quyền quản trị. Hãy dùng tài khoản admin." error />}
        <InputField label="Email admin" icon="mail" value={email} onChangeText={setEmail}
          keyboardType="email-address" autoCapitalize="none" autoCorrect={false} autoComplete="email"
          editable={!submitting} placeholder="Email của bạn" />
        <InputField label="Mật khẩu admin" icon="lock" value={password} onChangeText={setPassword}
          secureTextEntry autoCapitalize="none" autoCorrect={false} autoComplete="current-password"
          editable={!submitting} placeholder="Nhập mật khẩu" onSubmitEditing={() => void login()} />
        <StatusMessage message={error} error />
        <AppButton title="Đăng nhập" icon="arrow" loading={submitting} disabled={Boolean(sessionError)} onPress={() => void login()} />
      </View>
      <View style={styles.note}>
        <AppIcon name="lock" size={14} color={theme.textSecondary} />
        <ThemedText style={styles.noteText} themeColor="textSecondary">Chỉ tài khoản được cấp quyền mới có thể truy cập.</ThemedText>
      </View>
    </FormScreen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 26, padding: 22, gap: 20, borderWidth: 1 },
  cardHeading: { flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 3 },
  iconBox: { width: 50, height: 50, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 21, lineHeight: 29, fontWeight: '700', letterSpacing: -0.4 },
  note: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12 },
  noteText: { fontSize: 11, lineHeight: 18, flexShrink: 1, textAlign: 'center' },
});
