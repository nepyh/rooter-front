#!/bin/bash
# members.js 고친 뒤 실행: 연락처 파일 다시 만들고 Vercel에 배포 + duckdns 주소도 새 배포로 연결
cd "$(dirname "$0")"
node tools/make-vcf.mjs || exit 1
URL=$(npx --yes vercel deploy --prod --yes 2>/dev/null | grep -o 'https://rooter-card-[a-z0-9]*-taehug662-7623.vercel.app' | head -1)
[ -z "$URL" ] && { echo "배포 실패"; exit 1; }
npx --yes vercel alias set "$URL" hyphen-card.duckdns.org >/dev/null 2>&1
echo "배포 완료: https://hyphen-card.duckdns.org"
