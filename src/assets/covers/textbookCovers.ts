// 교과서 표지 이미지 — edition_id(=현재 백엔드 textbookId와 동일하다고 가정) 기준 매핑
// 출처: covers/manifest.json (백엔드 카탈로그 시딩과 같은 편성표 기준으로 제공됨)
// 주의: 아직 실서버 catalog 데이터가 비어있어 textbookId==edition_id 가정을 실제로 검증하지 못했습니다.
import type { ImageSourcePropType } from 'react-native';

import cover1 from './1.jpg';
import cover2 from './2.jpg';
import cover3 from './3.jpg';
import cover7 from './7.jpg';
import cover9 from './9.jpg';
import cover10 from './10.jpg';
import cover11 from './11.jpg';
import cover13 from './13.png';
import cover14 from './14.png';
import cover15 from './15.jpg';
import cover17 from './17.jpg';
import cover21 from './21.png';
import cover23 from './23.jpg';
import cover25 from './25.png';
import cover27 from './27.png';
import cover28 from './28.png';
import cover29 from './29.png';
import cover31 from './31.jpg';
import cover33 from './33.jpg';
import cover34 from './34.png';
import cover35 from './35.jpg';
import cover36 from './36.png';
import cover37 from './37.jpg';
import cover38 from './38.jpg';
import cover39 from './39.jpg';
import cover41 from './41.png';
import cover42 from './42.jpg';
import cover43 from './43.jpg';
import cover44 from './44.jpg';
import cover45 from './45.jpg';
import cover46 from './46.png';
import cover47 from './47.png';
import cover48 from './48.jpg';
import cover49 from './49.jpg';
import cover50 from './50.png';
import cover51 from './51.png';

export const TEXTBOOK_COVERS: Record<number, ImageSourcePropType> = {
  1: cover1,
  2: cover2,
  3: cover3,
  7: cover7,
  9: cover9,
  10: cover10,
  11: cover11,
  13: cover13,
  14: cover14,
  15: cover15,
  17: cover17,
  21: cover21,
  23: cover23,
  25: cover25,
  27: cover27,
  28: cover28,
  29: cover29,
  31: cover31,
  33: cover33,
  34: cover34,
  35: cover35,
  36: cover36,
  37: cover37,
  38: cover38,
  39: cover39,
  41: cover41,
  42: cover42,
  43: cover43,
  44: cover44,
  45: cover45,
  46: cover46,
  47: cover47,
  48: cover48,
  49: cover49,
  50: cover50,
  51: cover51,
};

// 카드 두 번째 줄에 쓸 출판사명 — 백엔드 /catalog 응답엔 publisherId만 있고 이름이 없어서 임시로 여기서 보강
export const TEXTBOOK_PUBLISHERS: Record<number, string> = {
  1: "와이비엠",
  2: "미래엔",
  3: "미래엔",
  7: "비상교육",
  9: "미래엔",
  10: "미래엔",
  11: "천재교과서",
  13: "비상교육",
  14: "비상교육",
  15: "천재교육",
  17: "천재교과서",
  21: "비상교육",
  23: "미래엔",
  25: "동아출판",
  27: "비상교육",
  28: "동아출판",
  29: "비상교육",
  31: "비상교육",
  33: "좋은책신사고",
  34: "동아출판",
  35: "와이비엠",
  36: "동아출판",
  37: "와이비엠",
  38: "동아출판",
  39: "와이비엠",
  41: "비상교육",
  42: "천재교육",
  43: "천재교육",
  44: "천재교과서",
  45: "천재교육",
  46: "비상교육",
  47: "비상교육",
  48: "천재교과서",
  49: "와이비엠",
  50: "동아출판",
  51: "동아출판",
};
