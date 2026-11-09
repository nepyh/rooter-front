import api from '../axios';

// ================================
// Types
// ================================

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResult {
  message: string;
  token: string;
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
  schoolId: string | null;
  schoolName?: string | null;
  grade: number | null;
  classNumber: number | null;
  createdAt: string;
  avatarUrl: string | null;
  bio?: string | null;
}

export interface StreakDay {
  date: string;
  completionRate: number;
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
  avatarUrl: string | null;
}

export interface StudentProfileInput {
  schoolId: string;
  grade: number;
  classNumber: number;
}

export interface StudentProfileResult {
  id: number;
  userId: number;
  schoolId: string;
  grade: number;
  classNumber: number;
}

export interface SleepTimeInput {
  sleepTime: string;
  wakeTime: string;
}

export interface SleepTime extends SleepTimeInput {
  isDefault: boolean;
}

export const DAY_OF_WEEK_LABELS = ["월", "화", "수", "목", "금", "토", "일"] as const;
export const DAY_OF_WEEK_NAMES = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"] as const;

export interface AddUnavailableTimeInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface UnavailableTime {
  id: number;
  dayOfWeek: typeof DAY_OF_WEEK_NAMES[number];
  startTime: string;
  endTime: string;
}

/**
 * 비밀번호 변경 API 함수. 성공하면 기존 토큰과 등록된 푸시 토큰이 모두 무효화됨
 * @param userId 유저 ID
 * @param input 현재 비밀번호와 새 비밀번호
 * @returns 교체해서 써야 하는 새 token
 */
export const changePassword = async (userId: number, input: ChangePasswordInput): Promise<ChangePasswordResult> => {
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
 * @returns 갱신된 avatarUrl
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

/**
 * 학생 프로필 생성 API 함수
 * @param userId 유저 ID
 * @param input 학교/학년/반 정보
 * @returns 생성된 학생 프로필
 */
export const createStudentProfile = async (userId: number, input: StudentProfileInput): Promise<StudentProfileResult> => {
  const response = await api.post(`/users/${userId}/profile`, input);
  return response.data;
};

/**
 * 수면 시간 조회 API 함수
 * @param userId 유저 ID
 * @returns 취침·기상 시각 ("HH:mm"), 저장한 적 없으면 isDefault true 와 기본값
 */
export const getSleepTime = async (userId: number): Promise<SleepTime> => {
  const response = await api.get(`/users/${userId}/sleep-time`);
  return response.data;
};

/**
 * 수면 시간 저장 API 함수. 이후 만드는 계획부터 반영되고 이미 있는 일정은 옮기지 않음
 * @param userId 유저 ID
 * @param input 취침·기상 시각 ("HH:mm")
 * @returns 저장된 수면 시간
 */
export const updateSleepTime = async (userId: number, input: SleepTimeInput): Promise<SleepTime> => {
  const response = await api.put(`/users/${userId}/sleep-time`, input);
  return response.data;
};

/**
 * 불가능 시간 목록 조회 API 함수
 * @param userId 유저 ID
 * @returns 등록된 불가능 시간 배열
 */
export const getUnavailableTimes = async (userId: number): Promise<UnavailableTime[]> => {
  const response = await api.get(`/users/${userId}/unavailable-times`);
  return response.data;
};

/**
 * 불가능 시간 추가 API 함수
 * @param userId 유저 ID
 * @param input 요일과 시작/종료 시간
 * @returns 추가된 불가능 시간
 */
export const addUnavailableTime = async (userId: number, input: AddUnavailableTimeInput): Promise<UnavailableTime> => {
  const response = await api.post(`/users/${userId}/unavailable-times`, input);
  return response.data;
};
