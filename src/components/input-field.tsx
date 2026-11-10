import { useState } from 'react';
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from 'react-native';

import { AppIcon, type AppIconName } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { useTheme } from '@/hooks/use-theme';

interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: AppIconName;
  error?: string;
}

export function InputField({ label, icon, error, secureTextEntry, style, onFocus, onBlur, ...props }: InputFieldProps) {
  const theme = useTheme();
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.box, { backgroundColor: theme.background, opacity: props.editable === false ? 0.6 : 1,
        borderColor: error ? theme.danger : focused ? theme.primary : theme.backgroundSelected }]}>
        {icon && <View style={styles.icon}><AppIcon name={icon} size={19} color={theme.textSecondary} /></View>}
        <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label}
          secureTextEntry={secureTextEntry && !visible} placeholderTextColor={theme.textSecondary}
          style={[styles.input, { color: theme.text }, style]}
          onFocus={(event) => { setFocused(true); onFocus?.(event); }}
          onBlur={(event) => { setFocused(false); onBlur?.(event); }} />
        {secureTextEntry && <Pressable accessibilityRole="button" accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
          disabled={props.editable === false} onPress={() => setVisible((value) => !value)} style={styles.toggle}>
          <AppIcon name={visible ? 'eyeOff' : 'eye'} size={20} color={theme.textSecondary} />
        </Pressable>}
      </View>
      {error && <ThemedText accessibilityRole="alert" style={[styles.error, { color: theme.danger }]}>{error}</ThemedText>}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 8 },
  label: { fontSize: 12, lineHeight: 18, fontWeight: '600' },
  box: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 14, minHeight: 56 },
  icon: { paddingLeft: 16 },
  input: { flex: 1, minWidth: 0, minHeight: 54, paddingHorizontal: 14, paddingVertical: 14, fontSize: 15 },
  toggle: { width: 48, minHeight: 48, justifyContent: 'center', alignItems: 'center' },
  error: { fontSize: 12, lineHeight: 19 },
});
