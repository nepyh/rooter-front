// members.js → vcf/<id>.vcf (한 명씩)
// 연락처 사진은 루티 캐릭터(또는 photo)를 크림색 정사각형으로 만들어 넣음 (macOS swift 필요, 없으면 사진 없이)
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { execFileSync } from "node:child_process";

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const ctx = { window: {} };
// 전화번호(phones.js, GitHub 에 안 올라감)를 먼저 읽고 members.js 를 읽음
const phonesFile = path.join(root, "phones.js");
if (fs.existsSync(phonesFile)) vm.runInNewContext(fs.readFileSync(phonesFile, "utf8"), ctx);
else console.warn("phones.js 없음 — 연락처 파일에 전화번호가 빠져요 (phones.example.js 참고)");
vm.runInNewContext(fs.readFileSync(path.join(root, "members.js"), "utf8"), ctx);
const { TEAM, APP, MEMBERS } = ctx.window;

const base = (TEAM.siteUrl || "").replace(/\/?$/, "/");
const escV = (s = "") => String(s).replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/([,;])/g, "\\$1");
const fold = (line) => {
  // 75바이트마다 줄바꿈 + 공백 (vCard 규칙, 한글 안 깨지게 글자 단위)
  const out = []; let cur = ""; let bytes = 0;
  for (const ch of line) {
    const b = Buffer.byteLength(ch);
    if (bytes + b > (out.length ? 74 : 75)) { out.push(cur); cur = ""; bytes = 0; }
    cur += ch; bytes += b;
  }
  out.push(cur);
  return out.join("\r\n ");
};

fs.mkdirSync(path.join(root, "vcf"), { recursive: true });
fs.mkdirSync(path.join(root, "assets/contact"), { recursive: true });

function photoB64(m) {
  const src = path.join(root, `assets/ruti/${m.ruti || "model-student"}.png`);
  const out = path.join(root, `assets/contact/${m.id}.jpg`);
  try {
    execFileSync("swift", [path.join(root, "tools/avatar.swift"), src, out], { stdio: "ignore" });
    return fs.readFileSync(out).toString("base64");
  } catch { return ""; }
}

function vcard(m) {
  const name = m.name || "";
  // 한국 이름: 첫 글자 성, 나머지 이름 (연락처 정렬용)
  const [family, given] = /^[가-힣]{2,4}$/.test(name) ? [name[0], name.slice(1)] : ["", name];
  const tel = (m.phone || "").replace(/[^0-9+]/g, "");
  const photo = photoB64(m);
  const L = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escV(family)};${escV(given)};;;`,
    `FN:${escV(name)}`,
    m.nameEn && `NICKNAME:${escV(m.nameEn)}`,
    `ORG:${escV(TEAM.name)};${escV(APP.name)}`,
    m.role && `TITLE:${escV(m.role)}`,
    tel && `TEL;TYPE=CELL:${tel}`,
    m.email && `EMAIL;TYPE=INTERNET:${m.email}`,
    base !== "/" && `URL:${base}card.html?id=${encodeURIComponent(m.id)}`,
    m.github && `X-SOCIALPROFILE;TYPE=github:https://github.com/${m.github}`,
    m.instagram && `X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/${m.instagram}`,
    m.linkedin && `X-SOCIALPROFILE;TYPE=linkedin:${encodeURI(decodeURI(m.linkedin))}`,
    m.blog && `URL;TYPE=blog:${m.blog}`,
    `NOTE:${escV([m.bio, `${TEAM.school} ${TEAM.club} ${TEAM.name} · ${APP.name} (${APP.tagline})`].filter(Boolean).join("\n"))}`,
    photo && `PHOTO;ENCODING=b;TYPE=JPEG:${photo}`,
    "END:VCARD",
  ].filter(Boolean);
  return L.map(fold).join("\r\n") + "\r\n";
}

const all = [];
for (const m of MEMBERS) {
  const v = vcard(m);
  all.push(v);
  fs.writeFileSync(path.join(root, `vcf/${m.id}.vcf`), v);
}
console.log(`vcf ${MEMBERS.length}명 만들었어요`);
