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

실제 DSN과 업로드 토큰은 저장소에 없으므로 외부 수신·업로드 성공은 아직 검증하지 않았습니다. 설정을 마친 뒤 staging에서 확인합니다.

1. Sentry 프로젝트와 배포 환경을 선택합니다. 공개 DSN을 넣어 빌드한 배포인지 확인합니다.
2. 개발 브랜치의 임시 화면 버튼에서 `throw new Error('Sentry staging smoke test')`를 발생시킵니다. 렌더 오류도 확인하려면 임시 컴포넌트의 렌더 중 같은 오류를 발생시킵니다. 개인정보를 테스트 메시지에 넣지 않습니다.
3. Issues에서 `Application error`가 나타나는지, environment·release가 맞는지 확인합니다. 스택이 압축된 번들 대신 원본 `.tsx` 파일·행으로 표시되어야 합니다. 표시되지 않으면 같은 `dist`를 업로드·배포했는지와 Debug ID를 확인합니다.
4. 테스트용 API에서 500과 네트워크 단절을 확인합니다. `API request failed`와 상태·메서드가 남아야 하며 401·403·404·429와 요청 취소는 수집되지 않아야 합니다. 운영 API에 오류를 유발하지 않습니다.
5. 이벤트 JSON에 Authorization, Cookie, 이메일, 요청·응답 본문, 토큰이 없는지 확인합니다. 임시 화면과 테스트 코드는 제거합니다.

로컬 검증은 `npm run test:monitoring`, `npx tsc --noEmit`, `npm run lint`, `npm run export:web`, `npm run sentry:check`로 실행합니다. 전체 lint에 기존 오류가 남아 있다면 변경한 파일의 lint 결과와 구분합니다.

참고: [Expo의 Sentry 연동 안내](https://docs.expo.dev/guides/using-sentry/), [Sentry 인증 토큰 안내](https://docs.sentry.io/api/guides/create-auth-token/), [조직 토큰의 CI 권한](https://www.sentry.help/en/articles/13964301-how-can-i-change-the-scope-for-an-organization-auth-token)
