import axios from 'axios';

const NEIS_SCHOOL_INFO_URL = 'https://open.neis.go.kr/hub/schoolInfo';

interface NeisSchoolRow {
  SCHUL_NM: string;
}

/**
 * 중학교 이름 검색 API 함수 (NEIS 학교기본정보)
 * @param keyword 검색할 학교명 키워드
 * @returns 학교명 배열
 */
export const searchMiddleSchools = async (keyword: string): Promise<string[]> => {
  if (!keyword) return [];

  const response = await axios.get(NEIS_SCHOOL_INFO_URL, {
    params: {
      KEY: process.env.EXPO_PUBLIC_NEIS_API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 20,
      SCHUL_KND_SC_NM: '중학교',
      SCHUL_NM: keyword,
    },
  });

  const rows: NeisSchoolRow[] = response.data?.schoolInfo?.[1]?.row ?? [];
  return rows.map((row) => row.SCHUL_NM);
};
