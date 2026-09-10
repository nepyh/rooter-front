# Expo HAS CHANGED

Read the exact versioned docs at https://docs.expo.dev/versions/v56.0.0/ before writing any code.

기억에 있는 Expo 지식을 그대로 쓰지 마세요. 이 프로젝트는 **Expo 56 / React 19 / React Native 0.85** 입니다.
버전이 최근에 크게 올라갔으므로, API 를 쓸 때마다 위 버전 문서에서 확인하고 쓰세요.

---

# rooter-front

중학생용 AI 시험공부 계획 앱 **루터(rooter)** 의 모바일 앱입니다.
백엔드는 `nepyh/rooter-back`, 스키마 정본은 `nepyh/rooter-ddl` 에 있습니다.

## 먼저 읽을 것

- `.github/CONTRIBUTING.md` — 이슈/PR/브랜치/커밋 컨벤션. **이 문서의 규칙이 우선합니다.**

## 실행

```bash
npm install
npm start          # expo start
npm run ios        # expo run:ios
npm run android    # expo run:android
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
app/                 화면 = 라우트. 파일 이름이 곧 경로가 됩니다
  _layout.tsx        루트 레이아웃 (SafeArea + NavBar 표시 여부)
  (auth)/            로그인·회원가입 플로우 (괄호 폴더는 경로에 안 들어감)
src/                 화면이 아닌 모든 것. `@/` 로 import 합니다
  components/ui/     Button, Text, Input, Toast — 재사용 UI
  components/layout/ NavBar, Stack, Row — 레이아웃
  api/               axios 인스턴스와 API 함수
  store/             zustand 스토어
  hooks/ utils/ constants/ assets/
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
(`app/_layout.tsx` 에 아직 하드코딩된 헥스가 남아 있습니다. 그 파일을 건드리게 되면 함께 정리해 주세요.)

## API 연동

- axios 인스턴스는 `src/api/axios.ts` 하나뿐입니다. **새로 `axios.create` 하지 말고 이것을 import** 하세요.
- API 함수는 도메인별 파일(`src/api/auth.ts` 처럼)에 모으고, JSDoc 으로 파라미터를 설명합니다.
- 백엔드 에러는 `{ code, message }` 형태로 옵니다. 사용자에게 보여줄 분기는 **`code` 문자열**로 하세요
  (`INVALID_TITLE`, `INVALID_DATE_RANGE`, `UNAUTHORIZED` 등). `message` 는 문구가 바뀔 수 있습니다.
- 어떤 `code` 가 오는지는 백엔드의 Swagger 문서(개발 모드)와 `rooter-back` 의 `~Exception.kt` 에 적혀 있습니다.

### 알려진 빈틈 (main 기준)

작업하다 마주치면 임시로 우회하지 말고, 이슈를 만들어 논의하세요.

1. **`baseURL` 이 코드에 하드코딩되어 있습니다.** (`src/api/axios.ts`)
   개발 서버와 프로덕션을 바꿔 붙일 방법이 없습니다. `app.json` 의 `extra` + `expo-constants` 로 빼야 합니다.
2. **JWT 토큰을 저장하지도, 요청에 붙이지도 않습니다.**
   `useUserStore` 는 `username` 과 `email` 만 담고, axios 에 Authorization 헤더를 붙이는 코드가 없습니다.
   백엔드의 보호된 API 는 전부 `Bearer` 토큰을 요구하므로, 로그인 이후 기능은 이것 없이는 동작하지 않습니다.
   토큰 저장은 zustand 메모리가 아니라 `expo-secure-store` 같은 안전한 저장소를 검토하세요.

## 협업 규칙

`.github/CONTRIBUTING.md` 가 정본이고, 요약하면 이렇습니다.

- 이슈: `feature:` / `problem:`
- PR: `add:` / `edit:` / `fix:` — 본문 끝에 `Closes #이슈번호`
- 브랜치: `feature/` / `fix/` / `rm/` / `refactor/`
- 커밋: `add:` `rm:` `edit:` `fix:` `refactor:` `format:`
  커밋 메시지만 보고 **어느 파일의 어디가 어떻게 바뀌었는지** 알 수 있게 씁니다.
  `format:` 커밋에서는 코드 내용을 절대 바꾸지 않습니다.

### 브랜치는 반드시 `main` 에서 자릅니다 — 가장 중요합니다

리뷰를 기다리는 브랜치 위에서 다음 작업을 이어가면, PR 들이 서로를 품게 됩니다.
그러면 뒤에 올린 PR 의 diff 가 계속 커지고, 앞의 PR 을 머지하는 순간 나머지가 전부 흔들립니다.
결국 **아무 PR 도 리뷰할 수 없고 아무것도 머지되지 않는 상태**가 됩니다.

```bash
git switch main && git pull        # 항상 여기서 시작
git switch -c feature/#42
```

- 리뷰가 늦으면 브랜치를 쌓지 말고 **리뷰를 재촉하세요.** 그게 훨씬 빠릅니다.
- 한 PR 은 하나의 이슈만 담습니다. 화면 3개를 한 PR 에 넣지 마세요.
- 리뷰를 기다리는 동안 정말 다른 작업을 해야 한다면, `main` 에서 **별도 브랜치**를 새로 자릅니다.

## 시크릿

API 키·토큰을 커밋하지 않습니다. 커밋 전에 `git diff` 로 확인하세요.
**push 하면 히스토리에 영구히 남습니다.**
