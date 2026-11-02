import api from '../axios';
import { getPushToken, type PushTokenInfo } from '@/utils/common/pushToken';

/**
 * 기기 푸시 토큰 등록 API 함수
 * @param input getPushToken 으로 받은 토큰과 플랫폼
 * @returns 등록된 토큰과 플랫폼
 */
export const registerDeviceToken = async (input: PushTokenInfo): Promise<PushTokenInfo> => {
  const response = await api.post('/notifications/device-tokens', input);
  return response.data;
};

/**
 * 이 기기의 푸시 토큰을 발급받아 서버에 등록하는 함수
 */
export const syncPushToken = async (): Promise<void> => {
  try {
    const pushToken = await getPushToken();
    if (pushToken) await registerDeviceToken(pushToken);
  } catch {
  }
};
