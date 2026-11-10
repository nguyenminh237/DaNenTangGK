import { Modal, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/app-button';
import { AppIcon } from '@/components/app-icon';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useTheme } from '@/hooks/use-theme';

interface ConfirmDeleteDialogProps {
  visible: boolean;
  name: string;
  loading: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDeleteDialog({ visible, name, loading, onConfirm, onCancel }: ConfirmDeleteDialogProps) {
  const theme = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={() => { if (!loading) onCancel(); }}>
      <View style={styles.backdrop}>
        <ThemedView type="backgroundElement" style={styles.panel} accessibilityViewIsModal>
          <View style={[styles.icon, { backgroundColor: theme.dangerSoft }]}><AppIcon name="trash" color={theme.danger} size={27} /></View>
          <ThemedText type="subtitle" accessibilityRole="header">Xóa người dùng?</ThemedText>
          <ThemedText>Bạn có chắc muốn xóa {name}? Thao tác này không thể hoàn tác.</ThemedText>
          <AppButton title="Xác nhận xóa" danger icon="trash" loading={loading} onPress={onConfirm} />
          <AppButton title="Giữ lại hồ sơ" variant="secondary" disabled={loading} onPress={onCancel} />
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.55)' },
  panel: { padding: 26, borderRadius: 28, width: '100%', maxWidth: 440, gap: 20 },
  icon: { width: 62, height: 62, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
});
