import type { UserProfileDocument } from '@/types/user';

function searchable(value: string): string {
  return value.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
}

export function filterUsers(users: UserProfileDocument[], term: string): UserProfileDocument[] {
  const needle = searchable(term);
  if (!needle) return users;
  return users.filter(({ data }) => searchable(data.hoten).includes(needle) || searchable(data.email).includes(needle));
}
