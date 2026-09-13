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

export interface UserInfo {
  id: number;
  username: string;
  email: string;
  schoolId: string;
  grade: number;
  classNumber: number;
  createdAt: string;
  avatarImageKey?: string | null;
  bio?: string | null;
}

export interface StreakDay {
  date: string; // yyyy-MM-dd
  completionRate: number; // 0~100
}

export interface Streak {
  days: StreakDay[];
}

export interface AvatarUploadInput {
  uri: string;
  fileName?: string | null;
  mimeType?: string;
}

export interface AvatarUploadResult {
  userId: number;
  avatarImageKey: string;
}

// avatarImageKey는 저장 경로일 뿐이라, 파일 서빙 엔드포인트(/files) 기준으로 표시용 URL을 만들어 씀
export const getAvatarUrl = (avatarImageKey: string) =>
  `${process.env.EXPO_PUBLIC_API_BASE_URL}/files/${avatarImageKey}`;

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
 * 유저 정보 조회 API 함수
 * @param userId 유저 ID
 * @returns 유저 상세 정보
 */
export const getUserInfo = async (userId: number): Promise<UserInfo> => {
  const response = await api.get(`/users/${userId}`);
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

/**
 * 잔디(기간별 완료율) 조회 API 함수
 * @param userId 유저 ID
 * @param start 조회 시작일 (yyyy-MM-dd)
 * @param end 조회 종료일 (yyyy-MM-dd)
 * @returns 날짜별 완료율
 */
export const getStreak = async (userId: number, start: string, end: string): Promise<Streak> => {
  const response = await api.get(`/users/${userId}/streak`, { params: { start, end } });
  return response.data;
};

/**
 * 아바타 이미지 업로드 API 함수
 * @param userId 유저 ID
 * @param input 업로드할 이미지 정보
 * @returns 갱신된 avatarImageKey
 */
export const uploadAvatar = async (userId: number, input: AvatarUploadInput): Promise<AvatarUploadResult> => {
  const formData = new FormData();
  formData.append('file', {
    uri: input.uri,
    name: input.fileName ?? 'avatar.jpg',
    type: input.mimeType ?? 'image/jpeg',
  } as unknown as Blob);

  const response = await api.put(`/users/${userId}/avatar`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};
