import {
  collection, doc, getDocFromServer, getDocsFromServer, limit, query, runTransaction, where,
  type DocumentData, type QueryDocumentSnapshot,
} from 'firebase/firestore';

import { getDatabase } from '@/config/firebase';
import { requireAdminSession } from '@/services/auth.service';
import { hashPassword } from '@/services/password.service';
import type { UserInput, UserProfileDocument } from '@/types/user';
import { buildUserPayload } from '@/utils/user-payload';
import { assertUserInput } from '@/utils/user-validation';

const COLLECTION = 'users';
const duplicateError = () => new Error('Email này đã được sử dụng. Vui lòng nhập email khác.');

function userReference(id: string) {
  if (!id || id.includes('/')) throw new Error('Document ID không hợp lệ.');
  return doc(getDatabase(), COLLECTION, id);
}

function profile(snapshot: QueryDocumentSnapshot<DocumentData>): UserProfileDocument {
  const data = snapshot.data();
  if (!['email', 'hoten', 'hinhanh'].every((key) => typeof data[key] === 'string')) {
    throw new Error('Dữ liệu người dùng trên Firestore không đúng định dạng.');
  }
  return {
    id: snapshot.id,
    data: { email: data.email, hoten: data.hoten, hinhanh: data.hinhanh },
  };
}

async function assertEmailAvailable(email: string, exceptId?: string) {
  const matches = await getDocsFromServer(query(
    collection(getDatabase(), COLLECTION), where('email', '==', email), limit(2),
  ));
  if (matches.docs.some((snapshot) => snapshot.id !== exceptId)) throw duplicateError();
}

// ID từ email chuẩn hóa giúp transaction chặn hai client thêm cùng email đồng thời,
// không cần thêm field hoặc collection phụ. Khi đổi email, chuyển document atomically.
const emailDocumentId = (email: string) => encodeURIComponent(email);

export const userService = {
  async create(input: UserInput): Promise<string> {
    await requireAdminSession();
    const value = assertUserInput(input);
    await assertEmailAvailable(value.email);
    const passwordHash = await hashPassword(value.password);
    const payload = buildUserPayload(value, passwordHash);
    const target = userReference(emailDocumentId(value.email));
    await runTransaction(getDatabase(), async (transaction) => {
      if ((await transaction.get(target)).exists()) throw duplicateError();
      transaction.set(target, payload);
    });
    return target.id;
  },

  async getAll(): Promise<UserProfileDocument[]> {
    await requireAdminSession();
    const snapshot = await getDocsFromServer(collection(getDatabase(), COLLECTION));
    return snapshot.docs.map(profile).sort((a, b) => a.data.hoten.localeCompare(b.data.hoten, 'vi'));
  },

  async getById(id: string): Promise<UserProfileDocument | null> {
    await requireAdminSession();
    const snapshot = await getDocFromServer(userReference(id));
    return snapshot.exists() ? profile(snapshot) : null;
  },

  async update(id: string, input: UserInput): Promise<string> {
    await requireAdminSession();
    const value = assertUserInput(input, true);
    await assertEmailAvailable(value.email, id);
    const newHash = value.password ? await hashPassword(value.password) : undefined;
    const currentRef = userReference(id);
    const targetRef = userReference(emailDocumentId(value.email));
    await runTransaction(getDatabase(), async (transaction) => {
      const current = await transaction.get(currentRef);
      if (!current.exists()) throw new Error('Người dùng đã bị xóa hoặc không còn tồn tại.');
      if (targetRef.id !== currentRef.id && (await transaction.get(targetRef)).exists()) {
        throw duplicateError();
      }
      const payload = buildUserPayload(value, newHash ?? current.data().matkhau);
      // Full replacement removes any legacy extra fields; never merge arbitrary data.
      transaction.set(targetRef, payload);
      if (targetRef.id !== currentRef.id) transaction.delete(currentRef);
    });
    return targetRef.id;
  },

  async delete(id: string): Promise<void> {
    await requireAdminSession();
    const target = userReference(id);
    await runTransaction(getDatabase(), async (transaction) => {
      if (!(await transaction.get(target)).exists()) {
        throw new Error('Người dùng đã bị xóa hoặc không còn tồn tại.');
      }
      transaction.delete(target);
    });
  },
};
