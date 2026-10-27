import api from '../axios';

// ================================
// Types
// ================================

export interface AgreementDocument {
  code: string;
  required: boolean;
  title: string;
  version: string;
  url: string;
}

export interface UserAgreement {
  code: string;
  required: boolean;
  version: string;
  agreed: boolean;
  createdAt: string;
}

export interface AgreementDecision {
  code: string;
  version: string;
  agreed: boolean;
}

export interface AgreementsUpdateResult {
  pendingAgreements: string[];
}

/**
 * 현재 게시 중인 약관 목록 조회 API 함수 (인증 불필요)
 * @returns 약관 code·버전·필수 여부·문서 URL 배열
 */
export const getAgreementCatalog = async (): Promise<AgreementDocument[]> => {
  const response = await api.get('/agreements');
  return response.data.agreements;
};

/**
 * 내 약관 동의 내역 조회 API 함수. 항목별 가장 최근 1건만 오고, 한 번도 결정하지 않은 항목은 빠짐
 * @param userId 유저 ID (본인)
 * @returns 항목별 최근 동의 내역 배열
 */
export const getUserAgreements = async (userId: number): Promise<UserAgreement[]> => {
  const response = await api.get(`/users/${userId}/agreements`);
  return response.data.agreements;
};

/**
 * 약관 재동의·철회 API 함수. 철회는 agreed=false 로 보냄
 * @param userId 유저 ID (본인)
 * @param agreements 항목별 동의 결정 (version 은 현재 게시 버전과 같아야 함)
 * @returns 남은 필수 미동의 code 목록
 */
export const updateAgreements = async (userId: number, agreements: AgreementDecision[]): Promise<AgreementsUpdateResult> => {
  const response = await api.post(`/users/${userId}/agreements`, { agreements });
  return response.data;
};

/**
 * 카탈로그의 모든 항목에 같은 결정을 담은 요청 본문을 만듦
 * @param catalog 현재 약관 목록
 * @param agreed 동의 여부
 */
export const toDecisions = (catalog: AgreementDocument[], agreed: boolean): AgreementDecision[] =>
  catalog.map(({ code, version }) => ({ code, version, agreed }));

/**
 * 아직 유효한 동의가 없는 필수 약관 code 목록. 최근 결정이 철회이거나 버전이 바뀌었으면 미동의로 봄
 * @param catalog 현재 약관 목록
 * @param userAgreements 내 동의 내역
 */
export const getPendingAgreements = (catalog: AgreementDocument[], userAgreements: UserAgreement[]): string[] =>
  catalog
    .filter((doc) => doc.required)
    .filter((doc) => !userAgreements.some((item) => item.code === doc.code && item.agreed && item.version === doc.version))
    .map((doc) => doc.code);
