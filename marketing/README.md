# marketing — 홍보물 (앱 코드와 별개)

루터 앱 코드(`app/`, `src/` 등)와 섞이지 않게 홍보물만 모아 둔 폴더입니다.
앱 빌드(Metro)·타입 검사(tsconfig)·ESLint·Prettier에서 모두 제외되어 있습니다.

| 폴더 | 내용 | 실행 |
|---|---|---|
| `promo-video/` | Remotion 홍보영상·포스터·배너 (`npm install` 후 사용. `node_modules`·`out`은 git 제외) | `cd promo-video && npm run dev` (Studio) |
| `digital-card/` | Team Hyphen 디지털 명함 (정적 사이트, https://hyphen-card.duckdns.org) | `cd digital-card && ./start.sh` / 배포 `./deploy.sh` |

> 팀원 전화번호는 `digital-card/phones.js`에만 있고 GitHub에 올라가지 않아요. 새로 받은 사람은 `phones.example.js`를 `phones.js`로 복사해 채우면 돼요.
