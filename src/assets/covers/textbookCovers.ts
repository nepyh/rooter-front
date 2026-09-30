// 교과서 표지 이미지 — 파일 이름과 키 모두 백엔드 textbookId 기준
// 표지 인쇄 내용(과목·학년·학기·출판사)을 실서버 catalog 제목과 대조해 매핑
// 천재 국어·영어 표지는 출판사 표기가 없어 저자 시리즈와 catalog 구성으로 추정
import type { ImageSourcePropType } from 'react-native';

import cover1 from './1.jpg';
import cover2 from './2.jpg';
import cover3 from './3.jpg';
import cover7 from './7.jpg';
import cover8 from './8.jpg';
import cover9 from './9.jpg';
import cover10 from './10.jpg';
import cover11 from './11.png';
import cover12 from './12.png';
import cover13 from './13.jpg';
import cover14 from './14.jpg';
import cover18 from './18.png';
import cover20 from './20.jpg';
import cover22 from './22.png';
import cover24 from './24.png';
import cover25 from './25.png';
import cover26 from './26.png';
import cover28 from './28.jpg';
import cover30 from './30.jpg';
import cover31 from './31.png';
import cover32 from './32.jpg';
import cover33 from './33.png';
import cover34 from './34.jpg';
import cover36 from './36.jpg';
import cover38 from './38.jpg';
import cover39 from './39.jpg';
import cover40 from './40.jpg';
import cover41 from './41.jpg';
import cover42 from './42.png';
import cover43 from './43.png';
import cover44 from './44.jpg';
import cover45 from './45.jpg';
import cover46 from './46.png';
import cover47 from './47.png';

export const TEXTBOOK_COVERS: Record<number, ImageSourcePropType> = {
  1: cover1,
  2: cover2,
  3: cover3,
  7: cover7,
  8: cover8,
  9: cover9,
  10: cover10,
  11: cover11,
  12: cover12,
  13: cover13,
  14: cover14,
  18: cover18,
  20: cover20,
  22: cover22,
  24: cover24,
  25: cover25,
  26: cover26,
  28: cover28,
  30: cover30,
  31: cover31,
  32: cover32,
  33: cover33,
  34: cover34,
  36: cover36,
  38: cover38,
  39: cover39,
  40: cover40,
  41: cover41,
  42: cover42,
  43: cover43,
  44: cover44,
  45: cover45,
  46: cover46,
  47: cover47,
};
