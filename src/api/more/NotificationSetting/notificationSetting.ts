import api from '../../axios';

// ================================
// Types
// ================================

export interface NotificationSettings {
  taskReminderEnabled: boolean;
  taskReminderLeadMinutes: number;
}

// ================================
// Constants
// ================================

export const MIN_LEAD_MINUTES = 0;
export const MAX_LEAD_MINUTES = 60;

// ================================
// Functions
// ================================

/**
 * 알림 설정 조회 API 함수. 한 번도 바꾸지 않았으면 기본값(할일 알림 켜짐, 5분 전)이 옴
 * @returns 할일 알림 여부와 몇 분 전에 받을지
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await api.get('/notifications/settings');
  return response.data;
};

/**
 * 알림 설정 수정 API 함수. 보낸 필드만 바뀜
 * @param input 바꿀 설정 (taskReminderLeadMinutes 는 0~60)
 * @returns 바뀐 전체 설정
 */
export const updateNotificationSettings = async (input: Partial<NotificationSettings>): Promise<NotificationSettings> => {
  const response = await api.patch('/notifications/settings', input);
  return response.data;
};
