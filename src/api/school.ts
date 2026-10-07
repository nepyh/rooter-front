import api from './axios';

// 백엔드가 내려주는 지역명(LCTN_SC_NM 원본, 예: "경기도") -> 표시용 축약명
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

export interface School {
  // 교육청코드+학교코드 합성 10자리 — 학생 프로필 생성 시 그대로 씀
  schoolId: string;
  name: string;
  officeName: string;
  // 지역 축약명 (예: 경기, 부산)
  region: string;
  foundation?: string | null;
}

interface SchoolSearchResponse {
  schoolId: string;
  name: string;
  officeName: string;
  region: string;
  foundation?: string | null;
}

/**
 * 중학교 이름 검색 API 함수
 * @param keyword 검색할 학교명 키워드
 * @returns 학교 정보 배열 (같은 이름의 학교가 지역별로 중복될 수 있어 schoolId로 구분)
 */
export const searchMiddleSchools = async (keyword: string): Promise<School[]> => {
  if (!keyword) return [];

  const response = await api.get<SchoolSearchResponse[]>('/school/search', { params: { name: keyword } });
  return response.data.map((school) => ({
    ...school,
    region: REGION_SHORT_NAMES[school.region] ?? school.region,
  }));
};

// 학교 코드로 이름 찾기용 NEIS 공개 API, 인증키 없이 소량 조회 가능
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
  // 우리 서버 토큰이 외부로 나가지 않도록 axios 인스턴스 대신 fetch 사용
  const response = await fetch(`${NEIS_SCHOOL_INFO_URL}?${params}`);
  const data = await response.json();
  return data?.schoolInfo?.[1]?.row?.[0]?.SCHUL_NM ?? null;
};
