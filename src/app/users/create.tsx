import { router } from 'expo-router';

import { FormScreen } from '@/components/form-screen';
import { UserForm } from '@/components/user-form';
import { userService } from '@/services/user.service';
import type { UserInput } from '@/types/user';

export default function CreateUserScreen() {
  async function createUser(input: UserInput) {
    await userService.create(input);
    router.replace({ pathname: '/users', params: { notice: 'created' } });
  }

  return (
    <FormScreen title="Thêm kết nối mới" eyebrow="DANH BẠ / THÊM MỚI" back bottomInset={false}
      subtitle="Một hồ sơ chỉn chu, bắt đầu từ những thông tin cơ bản.">
      <UserForm onSubmit={createUser} />
    </FormScreen>
  );
}
