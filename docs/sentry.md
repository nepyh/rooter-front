# 웹 오류 모니터링 설정

관련 이슈: [#213](https://github.com/nepyh/rooter-front/issues/213)

이 프로젝트는 `@sentry/react-native`로 웹 JavaScript 오류, Expo Router 렌더 오류, Axios의 5xx·네트워크 오류를 수집합니다. `EXPO_PUBLIC_SENTRY_DSN`이 없으면 SDK를 초기화하지 않습니다. 로그인 실패 등 4xx와 사용자가 취소한 요청은 수집하지 않습니다.

성능 추적, 리플레이, 로그, 자동 세션 수집은 사용하지 않습니다. 네이티브 SDK도 `enableNative: false`로 꺼 두었습니다. 따라서 iOS·Android 네이티브 크래시, EAS 소스맵 자동 업로드는 이번 범위에 포함되지 않습니다. Sentry Expo 플러그인과 네이티브 빌드 업로드 훅도 추가하지 않았습니다.

## 학생이 준비할 설정

Sentry 조직에서 프런트엔드 전용 프로젝트를 생성하고 아래 값을 확인합니다. 계정 권한에 따라 메뉴가 보이지 않으면 조직 관리자에게 프로젝트 접근 권한이나 토큰 생성을 요청합니다.

| 값                               | 확인할 위치                                                         | 저장할 위치                                 |
| -------------------------------- | ------------------------------------------------------------------- | ------------------------------------------- |
| `EXPO_PUBLIC_SENTRY_DSN`         | Project Settings → Client Keys (DSN)                                | 웹 빌드 환경 변수 또는 로컬 `.env.local`    |
| `EXPO_PUBLIC_SENTRY_ENVIRONMENT` | 직접 지정합니다. 예: `staging`, `production`                        | 웹 빌드 환경 변수                           |
| `EXPO_PUBLIC_SENTRY_RELEASE`     | 배포할 Git 커밋 SHA로 직접 지정합니다. 예: `rooter-front@<SHA>`     | 웹 빌드 환경 변수                           |
| `SENTRY_ORG`                     | Organization Settings에 있는 조직 slug 또는 Sentry 주소의 조직 부분 | 업로드 작업 환경 변수                       |
| `SENTRY_PROJECT`                 | Project Settings → General Settings의 project slug                  | 업로드 작업 환경 변수                       |
| `SENTRY_AUTH_TOKEN`              | Organization Settings → Auth Tokens에서 CI용 조직 토큰 생성         | 배포 서비스의 비밀 환경 변수 또는 CI secret |

Sentry 조직 토큰의 CI용 `org:ci` 권한은 소스맵 업로드에 사용합니다. 개인 인증 토큰을 사용해야 한다면 공식 Expo 안내에 따라 `project:releases`와 `org:read` 권한을 지정합니다. 토큰을 소스 코드, `app.json`, 공개 환경 변수, 화면, 로그에 넣지 않습니다. `EXPO_PUBLIC_*`는 번들에 포함되므로 **`EXPO_PUBLIC_SENTRY_AUTH_TOKEN`을 만들면 안 됩니다.** DSN은 공개 수집 주소이며 업로드 권한을 주는 인증 토큰과 다릅니다.

토큰이 없는 개발자는 `npm start`, `npm run export:web`, `npm run sentry:check`를 사용할 수 있습니다. Sentry 수집도 확인하려면 공개 DSN을 설정합니다. `npm run sentry:upload`는 명시적인 업로드 요청이므로 필수 설정이나 소스맵이 없으면 실패합니다.

## GitHub에서 웹 빌드와 소스맵 업로드 검증

수동 workflow는 [`.github/workflows/sentry-web.yml`](../.github/workflows/sentry-web.yml)에 있습니다. **이 파일이 기본 브랜치에 머지된 뒤에** GitHub Actions에서 실행할 수 있습니다. PR 브랜치에만 있는 동안에는 `Run workflow`로 실행할 수 없습니다. 이는 [GitHub의 수동 실행 조건](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow)에 따른 제약입니다.

1. 저장소의 **Settings → Secrets and variables → Actions**에서 다음 값을 등록합니다. `Variables`에는 `EXPO_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`(`personal-g2d`), `SENTRY_PROJECT`(`rooter-front`)를 넣고, `Secrets`에는 `SENTRY_AUTH_TOKEN`을 넣습니다. 서버 API도 사용하려면 공개 서버 주소를 `EXPO_PUBLIC_API_BASE_URL` variable에 등록합니다.
2. **Actions → Sentry 웹 검증 → Run workflow**에서 검증할 브랜치를 선택합니다. `environment`의 기본값은 `monitoring-validation`입니다. release는 선택한 커밋의 `rooter-front@<SHA>`로 자동 설정합니다.
3. Node.js 24에서 의존성 설치 → 모니터링 테스트 → 타입 검사 → 웹 export → Debug ID 검사 → 실제 Sentry 소스맵 업로드를 차례로 실행합니다. 필수 variable이나 환경 이름이 공백이면 처음에 실패합니다. 인증 토큰은 업로드 단계에만 전달하며, 토큰 누락이나 업로드 실패도 workflow 실패로 처리합니다.
4. 성공한 실행의 **Artifacts**에서 `sentry-web-<SHA>`를 내려받습니다. 업로드에 사용한 동일한 웹 번들을 7일 동안 보관하며 `.map` 파일은 포함하지 않습니다. 이 번들로 브라우저 오류를 발생시킨 뒤 Sentry의 `monitoring-validation` 환경과 해당 release에서 수신·원본 스택을 확인합니다. 다른 환경 이름을 입력했다면 그 이름을 선택합니다.

이 workflow는 웹 파일을 호스팅하거나 테스트 오류를 발생시키지 않습니다. 소스맵 업로드 성공과 실제 오류 수신은 별도로 확인해야 합니다. TestFlight 앱의 빌드·배포나 네이티브 설정도 변경하지 않습니다.

## 웹 배포에 연결하는 방법

저장소에는 웹 호스팅 배포 workflow가 없습니다. 아래 명령을 실제 호스팅 서비스의 빌드·배포 작업에 연결해야 합니다. 현재 구현만으로 외부 배포에 자동 연결되지는 않습니다.

1. 빌드 작업에 위 환경 변수를 등록합니다. 공개 값은 빌드에 필요하고, 인증 토큰은 업로드에만 필요합니다. 환경과 release는 매 배포마다 확인합니다.
2. 배포할 커밋을 checkout하고 `npm ci`를 실행합니다. Expo 57이 지원하는 Node 22.13 이상 또는 Node 24.3 이상을 사용합니다. 테스트의 타입 제거 기능 때문에 Node 22에서는 22.18 이상을 권장합니다.
3. 아래 세 명령을 순서대로 실행하고, 한 명령이라도 실패하면 배포를 중단합니다. 검사는 번들마다 `.map`이 있는지와 번들·소스맵의 Debug ID가 일치하는지 확인합니다.

```sh
npm run export:web && npm run sentry:check && npm run sentry:upload
```

4. 업로드한 **동일한 `dist`**를 호스팅 서비스에 배포합니다. 업로드 뒤 다시 빌드하면 Debug ID가 달라질 수 있습니다. `.map` 파일은 업로드가 성공한 뒤 호스팅 서비스의 배포 제외 설정으로 공개 대상에서 제외할 수 있습니다.

위 명령은 환경 변수가 셸이나 CI에 주입된 경우에 사용합니다. Expo만 `.env.local`을 자동으로 읽으며 Node 업로드 스크립트는 자동으로 읽지 않습니다. 로컬에서 모든 설정을 무시되는 `.env.local`에 넣었다면 다음과 같이 업로드에도 명시적으로 전달합니다.

```sh
npm run export:web && npm run sentry:check && node --env-file=.env.local scripts/upload-sourcemaps.mjs
```

`SENTRY_AUTH_TOKEN`은 `--env-file`의 파일 안에만 두고 명령행에 직접 쓰지 않습니다. 환경과 release를 수정했다면 업로드 전에 다시 export합니다. `export:web`은 `--clear`로 Metro 변환 캐시를 비워 이전 빌드의 공개 환경 변수가 남지 않게 합니다. 소스맵은 앱 코드를 포함하므로 별도 공개 저장소나 로그에 올리지 않습니다.

## 전송하는 데이터

오류 이벤트는 허용한 필드만 남깁니다. 이벤트 식별자, 시간, 환경, release, 플랫폼, 표준 오류 종류, 스택의 함수·파일·행·열, 소스맵 Debug ID를 보존합니다. 스택 파일 URL의 인증 정보·쿼리·fragment는 제거합니다. 오류 메시지는 고정 문구로 바꾸므로 원래 예외 메시지에 들어 있는 사용자 입력도 전송하지 않습니다.

요청 URL·헤더·본문, 응답 본문, 사용자 정보, breadcrumb, 추가 context, stack 변수·소스 문맥, 첨부파일은 보내지 않습니다. Axios 오류는 원본 객체를 Sentry에 전달하지 않고 HTTP 상태, 정해진 메서드와 네트워크 오류 코드만 기록합니다. 같은 Axios 원본이 나중에 unhandled 오류가 되어도 중복 전송하지 않습니다. `setUser`를 호출하거나 학습 내용·이메일·토큰을 태그에 추가하지 않습니다.

Sentry 수집 서버가 네트워크 통신 중 보는 IP까지 브라우저 코드가 제거할 수는 없습니다. 프로젝트의 Security & Privacy에서 IP 저장 차단과 기본 데이터 정제 설정도 확인합니다.

## 배포 후 확인

2026-10-23에 `monitoring-validation` 환경에서 실제 소스맵 업로드와 오류 수신을 검증했습니다. 로컬 브라우저의 로그인 요청에 모의 500 응답을 반환했고, [검증 이벤트](https://personal-g2d.sentry.io/issues/7807740825/events/8822e8d5790c483ebabb2868dd6a5d3a/)에서 `app/Auth/Login.tsx:19`, `src/api/axios.ts:36`, `src/lib/monitoring.ts:36`으로 원본 코드가 표시되었습니다. 테스트 이메일·비밀번호·응답 본문은 전송되지 않았습니다. 운영 API에는 요청하지 않았으며, 호스팅 배포와 TestFlight 빌드는 검증하지 않았습니다.

소스맵은 이 저장소의 `npm run sentry:upload`로 업로드합니다. 업로드가 성공해도 서버 처리가 끝나기 전 발생한 이벤트에는 원본 코드가 표시되지 않을 수 있습니다. 잠시 뒤 새 테스트 오류를 발생시켜 확인합니다. 다른 배포 환경에서도 다음 절차로 검증합니다.

1. Sentry 프로젝트와 배포 환경을 선택합니다. 공개 DSN을 넣어 빌드한 배포인지 확인합니다.
2. 개발 브랜치의 임시 화면 버튼에서 `throw new Error('Sentry staging smoke test')`를 발생시킵니다. 렌더 오류도 확인하려면 임시 컴포넌트의 렌더 중 같은 오류를 발생시킵니다. 개인정보를 테스트 메시지에 넣지 않습니다.
3. Issues에서 `Application error`가 나타나는지, environment·release가 맞는지 확인합니다. 스택이 압축된 번들 대신 원본 `.tsx` 파일·행으로 표시되어야 합니다. 표시되지 않으면 같은 `dist`를 업로드·배포했는지와 Debug ID를 확인합니다.
4. 테스트용 API에서 500과 네트워크 단절을 확인합니다. `API request failed`와 상태·메서드가 남아야 하며 401·403·404·429와 요청 취소는 수집되지 않아야 합니다. 운영 API에 오류를 유발하지 않습니다.
5. 이벤트 JSON에 Authorization, Cookie, 이메일, 요청·응답 본문, 토큰이 없는지 확인합니다. 임시 화면과 테스트 코드는 제거합니다.

로컬 검증은 `npm run test:monitoring`, `npx tsc --noEmit`, `npm run lint`, `npm run export:web`, `npm run sentry:check`로 실행합니다. 전체 lint에 기존 오류가 남아 있다면 변경한 파일의 lint 결과와 구분합니다.

## TestFlight에서 확인할 사항

기존 TestFlight 앱으로 기능 테스트는 진행할 수 있습니다. 다만 이번 PR의 검증 범위는 웹이며, 기존 설치 앱에는 이 PR의 코드가 자동으로 반영되지 않습니다. TestFlight에서 Sentry를 검증하려면 먼저 앱을 빌드한 저장소와 커밋을 확인하고, iOS 빌드에 SDK 설정과 소스맵 업로드를 연결한 새 빌드를 받아야 합니다. GitHub Actions의 변수와 secret은 EAS에 자동으로 전달되지 않습니다.

1. TestFlight에서 앱 버전과 빌드 번호를 기록합니다. 테스트할 계정으로 로그인 → 학습 계획 생성 → 저장 후 재실행 → 완료 표시를 순서대로 확인합니다.
2. 로그인 실패, 빈 입력, 네트워크 끊김 후 복구를 확인합니다. 정상적인 입력 오류와 4xx는 Sentry 오류가 없어야 합니다.
3. Sentry가 연결된 새 테스트 빌드에서는 개발자가 준비한 테스트용 오류를 한 번 발생시킵니다. 같은 시간·환경·release의 이벤트와 원본 코드 위치를 확인합니다. 현재 설정은 네이티브 크래시 수집을 끄므로 앱 강제 종료만으로 수집 성공을 판정하지 않습니다.
4. 문제를 발견하면 `빌드 번호 / 기기와 OS / 재현 순서 / 기대 결과 / 실제 결과 / 발생 시각`을 남깁니다. 화면 캡처와 함께 [TestFlight 피드백](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)으로 전달할 수 있습니다.

참고: [Expo의 Sentry 연동 안내](https://docs.expo.dev/guides/using-sentry/), [Sentry 인증 토큰 안내](https://docs.sentry.io/api/guides/create-auth-token/), [조직 토큰의 CI 권한](https://www.sentry.help/en/articles/13964301-how-can-i-change-the-scope-for-an-organization-auth-token)
