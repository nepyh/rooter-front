const NEIS_SCHOOL_INFO_URL = 'https://open.neis.go.kr/hub/schoolInfo';

/**
 * 학교 ID로 학교 이름 조회 함수 (내 정보 응답에 학교 이름이 없어 NEIS에서 직접 조회)
 * @param schoolId 교육청코드 3자리 + 학교코드 7자리 (예: C107211226)
 * @returns 학교 이름, 못 찾으면 null
 */
export const getSchoolName = async (schoolId: string): Promise<string | null> => {
  const params = new URLSearchParams({
    Type: 'json',
    ATPT_OFCDC_SC_CODE: schoolId.slice(0, 3),
    SD_SCHUL_CODE: schoolId.slice(3),
  });
  const response = await fetch(`${NEIS_SCHOOL_INFO_URL}?${params}`);
  const data = await response.json();
  return data?.schoolInfo?.[1]?.row?.[0]?.SCHUL_NM ?? null;
};
