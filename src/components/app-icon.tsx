import { SymbolView, type SymbolViewProps } from 'expo-symbols';

import { useTheme } from '@/hooks/use-theme';

const icons = {
  people: { ios: 'person.2.fill', android: 'group', web: 'group' },
  user: { ios: 'person', android: 'person', web: 'person' },
  back: { ios: 'chevron.left', android: 'chevron_left', web: 'chevron_left' },
  arrow: { ios: 'arrow.right', android: 'arrow_forward', web: 'arrow_forward' },
  chevron: { ios: 'chevron.right', android: 'chevron_right', web: 'chevron_right' },
  plus: { ios: 'plus', android: 'add', web: 'add' },
  search: { ios: 'magnifyingglass', android: 'search', web: 'search' },
  mail: { ios: 'envelope', android: 'mail', web: 'mail' },
  lock: { ios: 'lock', android: 'lock', web: 'lock' },
  shield: { ios: 'checkmark.shield.fill', android: 'verified_user', web: 'verified_user' },
  photo: { ios: 'photo', android: 'add_photo_alternate', web: 'add_photo_alternate' },
  logout: { ios: 'rectangle.portrait.and.arrow.right', android: 'logout', web: 'logout' },
  refresh: { ios: 'arrow.clockwise', android: 'refresh', web: 'refresh' },
  trash: { ios: 'trash', android: 'delete', web: 'delete' },
  check: { ios: 'checkmark.circle.fill', android: 'check_circle', web: 'check_circle' },
  close: { ios: 'xmark', android: 'close', web: 'close' },
  eye: { ios: 'eye', android: 'visibility', web: 'visibility' },
  eyeOff: { ios: 'eye.slash', android: 'visibility_off', web: 'visibility_off' },
  link: { ios: 'link', android: 'link', web: 'link' },
  sparkles: { ios: 'sparkles', android: 'auto_awesome', web: 'auto_awesome' },
} satisfies Record<string, SymbolViewProps['name']>;

export type AppIconName = keyof typeof icons;

export function AppIcon({ name, size = 22, color }: { name: AppIconName; size?: number; color?: string }) {
  const theme = useTheme();
  return <SymbolView name={icons[name]} size={size} tintColor={color ?? theme.primary}
    style={{ width: size, height: size }} accessibilityElementsHidden importantForAccessibility="no" />;
}
