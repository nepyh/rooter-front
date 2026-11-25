import axios from 'axios';

// ================================
// Types
// ================================

/**
 * 계획 생성에 실패했을 때 사용자에게 권할 다음 동작
 * - retry: 같은 입력으로 다시 시도 (AI 생성 실패·네트워크 오류 등 일시적인 실패)
 * - edit: 입력을 고쳐야 함 (다시 보내도 같은 이유로 실패)
 * - home: 홈에서 확인 (시간 초과는 서버가 계속 만들고 있을 수 있어, 다시 보내면 계획이 두 개 생길 수 있음)
 */
export type GenerateFailureAction = 'retry' | 'edit' | 'home';

/**
 * 계획 생성 실패를 화면에 보여줄 형태
 * @param message 안내 문구
 * @param action 권할 다음 동작
 */
export interface GenerateFailure {
  message: string;
  action: GenerateFailureAction;
}

// ================================
// Constants
// ================================

// 백엔드 code 기준. 여기 없는 code 는 일시적인 실패로 보고 다시 시도를 권함
const GENERATE_FAILURES: Record<string, GenerateFailure> = {
  INVALID_DATE_RANGE: { message: '시험 시작 날짜는 내일 이후로, 종료 날짜는 시작 날짜 이후로 선택해주세요.', action: 'edit' },
  MISSING_DATE_INFO: { message: '시험 날짜를 다시 선택해주세요.', action: 'edit' },
  INVALID_DATE_FORMAT: { message: '시험 날짜를 다시 선택해주세요.', action: 'edit' },
  SUBJECTS_REQUIRED: { message: '목차를 하나 이상 선택해주세요.', action: 'edit' },
  INVALID_SUBJECT_RANGE: { message: '선택한 목차 범위를 다시 확인해주세요.', action: 'edit' },
  INVALID_TITLE: { message: '계획 이름이 올바르지 않아요.', action: 'edit' },
  GENERATION_FAILED: { message: 'AI가 계획을 만들지 못했어요. 잠시 후 다시 시도해주세요.', action: 'retry' },
};

const TIMEOUT_FAILURE: GenerateFailure = {
  message: '계획을 만드는 데 시간이 오래 걸리고 있어요. 잠시 뒤 홈에서 계획이 만들어졌는지 확인해주세요.',
  action: 'home',
};

const NETWORK_FAILURE: GenerateFailure = { message: '인터넷 연결을 확인해주세요.', action: 'retry' };

const DEFAULT_FAILURE: GenerateFailure = { message: '학습 계획을 만들지 못했습니다. 잠시 후 다시 시도해주세요.', action: 'retry' };

// ================================
// Functions
// ================================

/**
 * 계획 생성 실패 에러를 안내 문구와 다음 동작으로 변환 (시간 초과·네트워크·백엔드 code 순으로 판단)
 * INVALID_DATE_RANGE 는 서버 message 를 그대로 씀
 * @param error generatePlan() 이 던진 에러
 */
export const getGenerateFailure = (error: unknown): GenerateFailure => {
  if (!axios.isAxiosError(error)) return DEFAULT_FAILURE;
  if (error.code === 'ECONNABORTED') return TIMEOUT_FAILURE;
  if (!error.response) return NETWORK_FAILURE;
  const { code, message } = error.response.data ?? {};
  // 날짜 범위는 사유(80일 초과·1년 넘음 등)가 서버 message 로만 나뉘어 그대로 보여줌
  if (code === 'INVALID_DATE_RANGE' && message) return { message, action: 'edit' };
  return GENERATE_FAILURES[code] ?? DEFAULT_FAILURE;
};
