// ================================
// Constants
// ================================

/** 오늘 공부 설문 말풍선을 띄우기 시작하는 시각 (서버가 설문 알림을 보내는 22시와 같음, #314) */
export const FEEDBACK_NOTICE_START_HOUR = 22;

/** 오늘 공부 설문 말풍선을 그만 띄우는 시각 (다음 날 아침) */
export const FEEDBACK_NOTICE_END_HOUR = 7;

// ================================
// Functions
// ================================

/**
 * 지금 오늘 공부 설문을 물어볼 날짜. 22시~자정은 오늘, 자정~07시는 아직 끝나지 않은 어제, 나머지 시간은 null
 * @param now 현재 시각
 */
export const getFeedbackNoticeDate = (now: Date): Date | null => {
  const hour = now.getHours();
  if (hour >= FEEDBACK_NOTICE_START_HOUR)
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (hour < FEEDBACK_NOTICE_END_HOUR)
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return null;
};
