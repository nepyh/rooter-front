import api from './axios';

// ================================
// Types
// ================================

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileInput {
  username?: string;
  bio?: string;
}

export interface UpdateProfileResult {
  id: number;
  username: string;
  bio?: string | null;
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

/**
 * 이름/소개 수정 API 함수
 * @param userId 유저 ID
 * @param input 수정할 필드(전달된 것만 반영)
 * @returns 수정된 유저 정보
 */
export const updateUserProfile = async (userId: number, input: UpdateProfileInput): Promise<UpdateProfileResult> => {
  const response = await api.patch(`/users/${userId}`, input);
  return response.data;
};
