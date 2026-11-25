#!/bin/bash
# 명함 사이트 켜기 (끄기: Ctrl+C)
# 같은 와이파이의 휴대폰에서도 열 수 있게 켬
cd "$(dirname "$0")"
IP=$(ipconfig getifaddr en0 2>/dev/null)
echo "컴퓨터: http://localhost:5180"
[ -n "$IP" ] && echo "휴대폰(같은 와이파이): http://$IP:5180"
(sleep 1 && open "http://localhost:5180") &
python3 -m http.server 5180 --bind 0.0.0.0
