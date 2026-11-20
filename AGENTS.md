# rooter

중학생용 AI 시험공부 계획 앱 **루터(rooter)** 의 모바일 앱입니다.
백엔드는 `nepyh/rooter-back`, 스키마 정본은 `nepyh/rooter-ddl` 에 있습니다.

## 실행

```bash
npm install
npx expo start
```

## 스택

| 용도 | 사용하는 것 |
| --- | --- |
| 라우팅 | `expo-router` (파일 기반) |
| 스타일 | **NativeWind v4** (`className` 으로 Tailwind 클래스) |
| 전역 상태 | `zustand` |
| HTTP | `axios` |
| 폰트 | Pretendard (`src/assets/fonts`) |

## 디렉터리 구조

```
app/
  _layout.tsx                루트 레이아웃 (SafeArea + NavBar 표시 여부)
  index.tsx                  앱 진입점
  Auth/                      로그인/회원가입 페이지
  Calendar/                  캘린더 페이지
  Home/                      홈 화면 페이지
  LearningSurvey/            공부 스타일 설문 페이지
  More/                      더보기 페이지
  Quiz/                      퀴즈 페이지
  Todo/                      할일 페이지
src/
  components/                화면을 이루는 UI 컴포넌트
    ui/                      재사용 UI
    layout/                  레이아웃 UI
  api/                       axios 인스턴스와 API 함수
  store/                     zustand 스토어
  constants/                 바뀌지 않는 상수값 모음
  hooks/                     데이터 조회, 화면 상태, 동작 로직을 묶은 커스텀 React 훅
  utils/                     React와 무관한 순수 헬퍼 함수
```

**import 는 상대경로 대신 `@/` 를 씁니다.** (`tsconfig.json` + `babel.config.js` 양쪽에 설정되어 있습니다)

```tsx
import { Button, Text } from "@/components";   // O
import { Button } from "../../src/components/ui/Button";   // X
```

새 컴포넌트를 만들면 해당 폴더의 `index.ts` 에 export 를 추가하세요. 그러지 않으면 `@/components` 로 못 불러옵니다.

## 컴포넌트 작성 규칙

기존 `src/components/ui/Button.tsx` 와 `Text.tsx` 가 기준입니다. 이 형태를 따르세요.

```tsx
// ================================
// Types
// ================================
type Variant = "primary" | "white";

// ================================
// Styles
// ================================
const variantStyles: Record<Variant, string> = {
  "primary": "bg-primary-500",
  "white": "bg-neutral-0",
};

// ================================
// Components
// ================================
interface Props extends PressableProps {
  variant?: Variant;
  className?: string;
}

/**
 * 무엇을 하는 컴포넌트인지
 * @param variant 무엇을 설정하는지
 */
export function Xxx({ variant = "primary", className = "", ...props }: Props) { }
```

- `// ====` 섹션 주석으로 Types / Styles / Components 를 나눕니다.
- 스타일 분기는 `if` 나 삼항 연산자를 늘어놓지 말고 **`Record<Variant, string>` 맵**으로 만듭니다.
- Props 는 `interface Props extends <RN 컴포넌트 Props>` 로 확장하고 `...props` 를 넘깁니다.
- `className` 을 마지막에 합쳐서, 쓰는 쪽에서 덮어쓸 수 있게 합니다.
- 공개 컴포넌트에는 JSDoc 으로 `@param` 설명을 붙입니다.

## 스타일 규칙

### 텍스트는 `@/components` 의 `Text` 를 씁니다

React Native 의 `Text` 를 직접 쓰지 마세요. 타이포그래피가 어긋납니다.

```tsx
import { Text } from "@/components";
<Text variant="header-medium" weight="semibold" color="secondary">제목</Text>
```

### 색상은 반드시 디자인 토큰으로

`tailwind.config.js` 의 `theme.extend.colors` 에 팔레트가 정의되어 있습니다
(`primary-50~900`, `secondary`, `neutral`, `text-primary/secondary/disabled`, `background-primary` 등).

```tsx
<View className="bg-background-primary" />          // O
<View style={{ backgroundColor: '#33363F' }} />     // X — 하드코딩 금지
```

색이 필요한데 토큰에 없으면, **직접 헥스를 박지 말고 `tailwind.config.js` 에 토큰을 먼저 추가**하세요.
디자인이 바뀔 때 한 곳만 고치면 되도록 만드는 것이 목적입니다.

## API 연동

- axios 인스턴스는 `src/api/axios.ts` 하나뿐입니다. **새로 `axios.create` 하지 말고 이것을 import** 하세요.
- API 함수는 도메인별 파일(`src/api/auth.ts` 처럼)에 모으고, JSDoc 으로 파라미터를 설명합니다.
- 백엔드 에러는 `{ code, message }` 형태로 옵니다. 사용자에게 보여줄 분기는 **`code` 문자열**로 하세요
  (`INVALID_TITLE`, `INVALID_DATE_RANGE`, `UNAUTHORIZED` 등). `message` 는 문구가 바뀔 수 있습니다.
- 어떤 `code` 가 오는지는 백엔드의 Swagger 문서(개발 모드)와 `rooter-back` 의 `~Exception.kt` 에 적혀 있습니다.

## 협업 규칙

- 이슈: `[Feat]: ` / `[Refactor]: ` / `[Bug]: ` / `[Setting]: `
- PR: `[Feat/#이슈번호]: ` / `[Refactor/#이슈번호]: ` / `[Bug/#이슈번호]: ` / `[Setting/#이슈번호]: ` — 본문 끝에 `Closes #이슈번호`
- 브랜치: `Feat/#이슈번호` / `Refactor/#이슈번호` / `Bug/#이슈번호` / `Setting/#이슈번호`
- 커밋: `Feat: `/ `Fix: `
  커밋 메시지만 보고 **어느 파일의 어디가 어떻게 바뀌었는지** 알 수 있게 씁니다.
  `format:` 커밋에서는 코드 내용을 절대 바꾸지 않습니다.

### 브랜치는 반드시 `main` 에서 자릅니다

```bash
git switch main && git pull        # 항상 여기서 시작
git switch -c feature/#42
```

- 한 PR 은 하나의 이슈만 담습니다. 화면 3개를 한 PR 에 넣지 마세요.

## 시크릿

API 키·토큰을 커밋하지 않습니다. 커밋 전에 `git diff` 로 확인하세요.
