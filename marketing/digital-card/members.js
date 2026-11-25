// =============================================
// Team Hyphen 디지털 명함 — 여기만 고치면 돼요
// 고친 뒤 ./deploy.sh (연락처 파일 다시 만들고 배포)
// =============================================

window.TEAM = {
  name: "Team Hyphen",
  school: "부산소프트웨어마이스터고등학교",
  club: "전공동아리",
  intro: "AI 시험공부 계획 앱 '루터'를 개발합니다.",
  siteUrl: "https://hyphen-card.duckdns.org/",
  theme: "B4", // 명함 디자인 (card.js VARIANTS): B4 = 하이픈형 흰색, 앞면 얼굴 워터마크 / 3w/3o/3k 얼굴형(흰·주황·회검) · 4w/4o/4k 하이픈형(흰·주황·회검)
};

window.APP = {
  name: "루터",
  tagline: "AI 시험공부 계획 앱",
  download: "https://q.me-qr.com/q9ue2tgo",
  appstore: "",
  onestore: "https://m.onestore.co.kr/v2/ko-kr/app/0001012751",
};

// 명함 순서대로
// - id: 주소에 쓰는 영어 이름 (card.html?id=여기)
// - github / instagram: 아이디만 적으면 링크는 자동
// - linkedin: 전체 주소 (페이지 연락처와 연락처 파일에만, 명함 앞면엔 안 나옴)
// - linkedin / blog: 전체 주소 (선택. 개인 페이지 연락처와 연락처 파일에 들어감)
// - ruti: assets/ruti 안 캐릭터 이름 (CEO 왕 pencil-king · CTO 왕자 quill-prince · AI ai-robot · 그 외 역할에 맞춰)
// - 빈 칸("")은 화면에서 자동으로 빠져요
window.MEMBERS = [
  {
    id: "seokchan",
    name: "이석찬",
    nameEn: "Lee Sukchan",
    role: "CEO · Backend",
    bio: "팀장이자 백엔드 개발자로 AI 학습 계획의 핵심 흐름을 설계하고 서버 성능과 안정성을 개선했습니다.",
    skills: ["Kotlin", "Ktor", "PostgreSQL", "Docker"],
    email: "ydhkms0904@gmail.com",
    github: "Sukchan0403",
    instagram: "seck_chan",
    linkedin: "https://www.linkedin.com/in/%EC%84%9D%EC%B0%AC-%EC%9D%B4-5a28493b6/",
    ruti: "pencil-king",
  },
  {
    id: "mingyu",
    name: "성민규",
    nameEn: "Sung Mingyu",
    role: "CTO · AI · Backend · Frontend",
    bio: "CTO로 백엔드와 프론트엔드 개발을 함께 맡고 AWS 인프라(ECS·RDS·S3)를 구성했습니다.",
    skills: ["Kotlin", "Ktor", "React Native", "AWS"],
    email: "qlalfql123@gmail.com",
    github: "rhtnddd",
    instagram: "gosuoo.00",
    blog: "https://app.notion.com/p/8b231109c3468389a7db010dd54eac2d",
    ruti: "quill-prince",
  },
  {
    id: "suhwa",
    name: "진수화",
    nameEn: "Jin Suhwa",
    role: "Frontend",
    bio: "프론트엔드 개발자로 AI 채팅, 알림, 약관 등 주요 기능을 구현하고 앱 사용성을 개선했습니다.",
    skills: ["React Native", "NativeWind", "Zustand"],
    email: "shusbox@naver.com",
    github: "shusbox",
    instagram: "",
    ruti: "sprint",
  },
  {
    id: "taehoo",
    name: "김태후",
    nameEn: "Kim Taehoo",
    role: "Frontend",
    bio: "프론트엔드 개발자로 앱 화면 대부분의 퍼블리싱과 API 연동을 맡고 굿즈·SNS 마케팅을 전담했습니다.",
    skills: ["React Native", "Expo", "TypeScript", "NativeWind"],
    email: "taehug662@gmail.com",
    github: "bbanana502",
    instagram: "vi._bobe6ib",
    ruti: "fly-pen",
  },
  {
    id: "youngbin",
    name: "곽영빈",
    nameEn: "Gwak Yeongbin",
    role: "Backend",
    bio: "백엔드 개발자로 프로젝트 초기 구성과 전체 아키텍처 설계를 맡았습니다.",
    skills: ["Python", "Kotlin", "Rust"],
    email: "25_04@bssm.hs.kr",
    github: "nyung517",
    instagram: "",
    ruti: "detective",
  },
];

// 전화번호는 phones.js 에 따로 있어요 (GitHub 에 안 올라감). 없으면 전화 줄만 빠져요.
for (const m of window.MEMBERS) m.phone = (window.PHONES || {})[m.id] || "";
