import axios from 'axios';

const NEIS_SCHOOL_INFO_URL = 'https://open.neis.go.kr/hub/schoolInfo';

// NEIS LCTN_SC_NM(지역명) -> 표시용 축약명
const REGION_SHORT_NAMES: Record<string, string> = {
  서울특별시: '서울',
  부산광역시: '부산',
  대구광역시: '대구',
  인천광역시: '인천',
  광주광역시: '광주',
  대전광역시: '대전',
  울산광역시: '울산',
  세종특별자치시: '세종',
  경기도: '경기',
  강원특별자치도: '강원',
  충청북도: '충북',
  충청남도: '충남',
  전북특별자치도: '전북',
  전라남도: '전남',
  경상북도: '경북',
  경상남도: '경남',
  제주특별자치도: '제주',
};

interface NeisSchoolRow {
  SD_SCHUL_CODE: string;
  SCHUL_NM: string;
  LCTN_SC_NM: string;
}

export interface School {
  /** 학교 고유 코드 (NEIS SD_SCHUL_CODE) */
  code: string;
  name: string;
  /** 지역 축약명 (예: 경기, 부산) */
  region: string;
}

/**
 * 중학교 이름 검색 API 함수 (NEIS 학교기본정보)
 * @param keyword 검색할 학교명 키워드
 * @returns 학교 정보 배열 (같은 이름의 학교가 지역별로 중복될 수 있어 코드로 구분)
 */
export const searchMiddleSchools = async (keyword: string): Promise<School[]> => {
  if (!keyword) return [];

  const response = await axios.get(NEIS_SCHOOL_INFO_URL, {
    params: {
      KEY: process.env.EXPO_PUBLIC_NEIS_API_KEY,
      Type: 'json',
      pIndex: 1,
      pSize: 3,
      SCHUL_KND_SC_NM: '중학교',
      SCHUL_NM: keyword,
    },
  });

  const rows: NeisSchoolRow[] = response.data?.schoolInfo?.[1]?.row ?? [];
  return rows.map((row) => ({
    code: row.SD_SCHUL_CODE,
    name: row.SCHUL_NM,
    region: REGION_SHORT_NAMES[row.LCTN_SC_NM] ?? row.LCTN_SC_NM,
  }));
};
