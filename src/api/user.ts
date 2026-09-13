import api from './axios';

// ================================
// Types
// ================================

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

/**
 * 비밀번호 변경 API 함수
 * @param userId 유저 ID
 * @param input 현재 비밀번호와 새 비밀번호
 * @returns response.data
 */
export const changePassword = async (userId: number, input: ChangePasswordInput) => {
  const response = await api.put(`/users/${userId}/password`, input);
  return response.data;
};
