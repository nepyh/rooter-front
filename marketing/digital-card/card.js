// 명함 그리기 · 연락처(vCard) · 공유 (index.html, card.html 공용)

const esc = (s = "") => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const UA = navigator.userAgent;
const IS_IOS = /iPhone|iPad|iPod/.test(UA) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
const IS_ANDROID = /Android/.test(UA);
const IS_KAKAO = /KAKAOTALK/i.test(UA);

const siteBase = () => (TEAM.siteUrl || location.href.replace(/[^/]*([?#].*)?$/, "")).replace(/\/?$/, "/");
const memberUrl = (m) => `${siteBase()}card.html?id=${encodeURIComponent(m.id)}`;
const telOf = (p = "") => p.replace(/[^0-9+]/g, "");
const githubUrl = (id) => `https://github.com/${id}`;
const instaUrl = (id) => `https://instagram.com/${id}`;

// 채운 아이콘 (명함 위 작은 아이콘)
const SOLID = {
  phone: '<path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.61 21 3 13.39 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>',
  email: '<path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/>',
  github: '<path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.17c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.68-1.28-1.68-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.76 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.77 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z"/>',
  instagram: '<path d="M12 2.16c3.2 0 3.58.01 4.85.07 3.25.15 4.77 1.69 4.92 4.92.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.15 3.23-1.66 4.77-4.92 4.92-1.27.06-1.64.07-4.85.07s-3.58-.01-4.85-.07c-3.26-.15-4.77-1.7-4.92-4.92-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85C2.38 3.92 3.9 2.38 7.15 2.23 8.42 2.17 8.8 2.16 12 2.16zM12 0C8.74 0 8.33.01 7.05.07 2.7.27.27 2.69.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.2 4.36 2.62 6.78 6.98 6.98C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c4.35-.2 6.78-2.62 6.98-6.98.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.2-4.35-2.62-6.78-6.98-6.98C15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.41-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>',
};
SOLID.linkedin = '<path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z"/>';
SOLID.blog = '<path d="M3.9 12a3.1 3.1 0 0 1 3.1-3.1h4V7H7a5 5 0 0 0 0 10h4v-1.9H7A3.1 3.1 0 0 1 3.9 12zM8 13h8v-2H8v2zm9-6h-4v1.9h4a3.1 3.1 0 0 1 0 6.2h-4V17h4a5 5 0 0 0 0-10z"/>';
SOLID.site = '<path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.93 6h-2.95a15.6 15.6 0 0 0-1.38-3.56A8.03 8.03 0 0 1 18.93 8zM12 4.04c.83 1.2 1.48 2.53 1.91 3.96h-3.82c.43-1.43 1.08-2.76 1.91-3.96zM4.26 14a8.2 8.2 0 0 1 0-4h3.38a16.5 16.5 0 0 0 0 4H4.26zm.81 2h2.95c.32 1.25.78 2.45 1.38 3.56A7.99 7.99 0 0 1 5.07 16zm2.95-8H5.07a7.99 7.99 0 0 1 4.33-3.56A15.6 15.6 0 0 0 8.02 8zM12 19.96A14.1 14.1 0 0 1 10.09 16h3.82A14.1 14.1 0 0 1 12 19.96zM14.34 14H9.66a14.7 14.7 0 0 1 0-4h4.68a14.7 14.7 0 0 1 0 4zm.25 5.56c.6-1.11 1.06-2.31 1.38-3.56h2.95a8.03 8.03 0 0 1-4.33 3.56zM16.36 14a16.5 16.5 0 0 0 0-4h3.38a8.2 8.2 0 0 1 0 4h-3.38z"/>';
const solid = (k) => `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">${SOLID[k]}</svg>`;

// 선 아이콘 (버튼)
const LINE = {
  save: '<circle cx="10" cy="8" r="3.5"/><path d="M3.5 19a6.5 6.5 0 0 1 11-4.7"/><path d="M18 14v6M15 17h6"/>',
  share: '<path d="M12 3v12M7.5 7.5 12 3l4.5 4.5"/><path d="M5 12v7a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-7"/>',
  image: '<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>',
  chevron: '<path d="m9 6 6 6-6 6"/>',
  sms: '<path d="M4 5h16v11H9l-5 4z"/>',
  back: '<path d="M15 18l-6-6 6-6"/>',
};
const line = (k) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${LINE[k]}</svg>`;

/** 이 사람의 연락처 줄: [아이콘, 라벨, 보이는 글자, 링크] */
function contactRows(m) {
  return [
    m.phone && ["phone", "전화", m.phone, `tel:${telOf(m.phone)}`],
    m.email && ["email", "이메일", m.email, `mailto:${m.email}`],
    m.github && ["github", "GitHub", m.github, githubUrl(m.github)],
    m.instagram && ["instagram", "Instagram", `@${m.instagram}`, instaUrl(m.instagram)],
    m.linkedin && ["linkedin", "LinkedIn", m.nameEn || "프로필", m.linkedin],
    m.blog && ["blog", "포트폴리오", /notion\./.test(m.blog) ? "Notion" : m.blog.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""), m.blog],
  ].filter(Boolean);
}

const FACE_SVG = `<svg class="rface" viewBox="0 0 150 127.559" aria-hidden="true"><path d="M74.9 3.6C69.62 3.39 61.81 3.65 52.78 6.05C38.2 9.92 28.88 17.16 26.95 18.69C22.76 22.03 13.82 29.31 8.19 42.36C1.41 58.09 3.77 72.15 4.73 77.43C5.71 82.85 7.25 91.32 13.55 99.78C20.38 108.94 28.92 112.87 36.79 116.38C50.91 122.67 64.48 124.09 74.9 123.89H74.98C85.4 124.09 98.98 122.67 113.1 116.38C120.97 112.87 129.5 108.94 136.34 99.78C142.64 91.32 144.17 82.86 145.16 77.43C146.12 72.15 148.47 58.09 141.69 42.36C136.07 29.31 127.13 22.03 122.93 18.69C121.01 17.16 111.68 9.93 97.11 6.05C88.08 3.64 80.27 3.39 74.98 3.6H74.9Z" class="fh"/><ellipse class="ff" cx="60" cy="66.61" rx="3.84" ry="3.84"/><ellipse class="ff" cx="89.47" cy="66.61" rx="3.84" ry="3.84"/><path d="M74.9 99.63C76.81 99.5 78.86 99.26 81.03 98.86C87.99 97.58 93.63 95.07 97.79 92.71C97.79 92.71 104.81 88.2 105.97 83.21C106.14 82.46 106.53 80.9 105.62 79.8C105.02 79.08 104.11 78.71 103.16 78.71H74.89H46.62C45.67 78.71 44.77 79.08 44.16 79.8C43.26 80.9 43.64 82.46 43.82 83.21C44.97 88.2 52 92.71 52 92.71C56.15 95.07 61.79 97.57 68.76 98.86C70.92 99.27 72.97 99.5 74.88 99.63H74.9Z" class="ff"/></svg>`;

const isWeb = (k) => ["github", "instagram", "linkedin", "blog", "site"].includes(k);

/** 앞면: 역할 · 이름 · 연락처 / 오른쪽 세로선 + 세로 로고 */
function frontHtml(m) {
  // 명함 앞면: 전화 · 이메일 · GitHub + SNS 한 줄 (인스타 > LinkedIn > 블로그, 없으면 빈칸)
  const all = contactRows(m);
  const base = all.filter(([k]) => ["phone", "email", "github"].includes(k));
  const sns = all.find(([k]) => k === "instagram") || all.find(([k]) => k === "linkedin") || all.find(([k]) => k === "blog")
;
  const rows = [...base, sns].filter(Boolean)
    .map(([k, , text, href]) => (k === "phone"
      ? `<button type="button" class="row" data-phone>${solid(k)}<span>${esc(text)}</span></button>`
      : `<a class="row" href="${esc(href)}"${isWeb(k) ? ' target="_blank" rel="noopener"' : ""}>${solid(k)}<span>${esc(text)}</span></a>`))
    .join("");
  return `
  <div class="face front">
    <div class="deco">${FACE_SVG}</div>
    <div class="edge"></div>
    <div class="team-mark"><i></i>${esc(TEAM.name)}</div>
    <div class="content">
      ${m.role ? `<div class="role">${esc(m.role)}</div>` : ""}
      <div class="name-line"><span class="name">${esc(m.name)}</span>${m.nameEn ? `<span class="name-en">${esc(m.nameEn)}</span>` : ""}</div>
      <div class="rows">${rows}</div>
    </div>
    <div class="brand"><div class="vline"></div><div class="vlogo"><span class="w-rooter">Rooter</span><span class="w-hyphen">Hyphen</span></div><div class="flogo"><img class="f-face" src="assets/face.svg" alt="" width="150" height="128" /><img class="f-ruti" src="assets/ruti/${esc(m.ruti || "model-student")}.png" alt="" /><b>Rooter</b></div></div>
  </div>`;
}

/** 뒷면: 로고 · 팀 · 루티 */
function backHtml(m) {
  return `
  <div class="face back">
    <div class="deco">${FACE_SVG}</div>
    <div class="edge"></div>
    <div class="center">
      <div class="logo"><img src="assets/face.svg" alt="" width="150" height="128" /><b>Rooter</b></div>
      <div class="sub">${esc(TEAM.name)} · ${esc(APP.tagline)}</div>
    </div>
    <img class="ruti" src="assets/ruti/${esc(m.ruti || "model-student")}.png" alt="" />
    <div class="bigface-wrap"><img class="bigface" src="assets/face.svg" alt="" width="150" height="128" /><div class="bigface-team"><i></i>${esc(TEAM.name)}</div></div>
    <div class="hy">
      <div class="hy-mark"><i></i><b>Hyphen</b></div>
      <div class="hy-sub">${esc(TEAM.school)} ${esc(TEAM.club)}</div>
      <div class="hy-app"><img src="assets/face.svg" alt="" width="150" height="128" />${esc(APP.name)} · ${esc(APP.tagline)}</div>
    </div>
  </div>`;
}

/** 카드: 연락처 줄은 바로 연결, 나머지 부분을 누르면 뒤집힘(개인 페이지) 또는 그 사람 페이지로 이동(첫 화면) */
function makeCard(m, { link = "" } = {}) {
  const el = document.createElement("div");
  el.className = "card";
  el.setAttribute("role", link ? "link" : "button");
  el.setAttribute("aria-label", link ? `${m.name} 명함 보기` : `${m.name} 명함, 눌러서 뒤집기`);
  el.addEventListener("click", (e) => {
    const phone = e.target.closest("[data-phone]");
    if (phone) { e.preventDefault(); openPhoneSheet(m); return; }
    if (e.target.closest("a")) return; // 메일·깃허브·인스타는 링크 그대로
    if (link) location.href = withTheme(link);
    else el.classList.toggle("flipped");
  });
  el.innerHTML = `<div class="inner">${frontHtml(m)}${link ? "" : backHtml(m)}</div>`;
  el.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--rx", `${(-((e.clientY - r.top) / r.height - 0.5) * 8).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${(((e.clientX - r.left) / r.width - 0.5) * 10).toFixed(2)}deg`);
  });
  el.addEventListener("pointerleave", () => {
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
  });
  return el;
}

/** 전화번호를 누르면: 전화 걸기 · 문자 · 이름과 번호 그대로 연락처에 저장 */
function openPhoneSheet(m) {
  document.querySelector(".sheet-wrap")?.remove();
  const tel = telOf(m.phone);
  const wrap = document.createElement("div");
  wrap.className = "sheet-wrap";
  wrap.innerHTML = `
    <div class="sheet" role="dialog" aria-label="${esc(m.name)} 전화번호">
      <div class="sheet-head"><b>${esc(m.name)}</b><span>${esc(m.phone)}</span></div>
      <a class="sheet-btn primary" ${vcfAttrs(m)}>${line("save")}연락처에 저장</a>
      <a class="sheet-btn" href="tel:${tel}">${solid("phone")}전화 걸기</a>
      <a class="sheet-btn" href="sms:${tel}">${line("sms")}문자 보내기</a>
      <button class="sheet-btn cancel" type="button">취소</button>
    </div>`;
  const close = () => { wrap.classList.remove("show"); setTimeout(() => wrap.remove(), 200); };
  wrap.addEventListener("click", (e) => { if (e.target === wrap || e.target.closest(".cancel") || e.target.closest(".sheet-btn")) close(); });
  document.body.appendChild(wrap);
  requestAnimationFrame(() => wrap.classList.add("show"));
}

/** 연락처 파일 링크: 아이폰은 바로 열어야 '새로운 연락처' 화면이 뜸, 그 외엔 내려받기 */
function vcfAttrs(m) {
  const path = `vcf/${encodeURIComponent(m.id)}.vcf`;
  return IS_IOS ? `href="${path}"` : `href="${path}" download="${esc(m.name)}.vcf"`;
}

/** 카카오톡 안에서 열면 연락처 저장이 막혀서 바깥 브라우저 안내 */
function kakaoBanner() {
  if (!IS_KAKAO) return "";
  return `<a class="kakao" href="kakaotalk://web/openExternal?url=${encodeURIComponent(location.href)}">카카오톡에서는 연락처 저장이 제한됩니다. <b>다른 브라우저로 열기</b></a>`;
}

/** 페이지 아래 앱 정보 */
function appHtml() {
  const ios = `<a href="${esc(APP.appstore || APP.download)}" target="_blank" rel="noopener">App Store</a>`;
  const and = `<a href="${esc(APP.onestore)}" target="_blank" rel="noopener">ONE store</a>`;
  return `
  <section class="app">
    <div class="app-name"><img src="assets/face.svg" alt="" width="150" height="128" /><div><b>${esc(APP.name)}</b><span>${esc(APP.tagline)}</span></div></div>
    <div class="stores">${IS_ANDROID ? and + ios : ios + and}</div>
  </section>`;
}

/** 디자인 안 (1: 흰 바탕, 2: 주황 바탕, 3: 루터 얼굴, 4: 하이픈). 주소 ?v=2 로 고르고 링크 이동해도 유지 */
// 명함 후보 (A = 얼굴형: 앞면 루티·뒷면 루터 얼굴 / B = 하이픈형: 앞면 세로 Hyphen·뒷면 Hyphen 로고+루티)
// 색: w 흰 · o 주황 · k 회검 · c 크림 (bk-* = 뒷면만 다른 색) / 얼굴: df-* 앞면, db-* 뒷면 (wm 워터마크, ol 윤곽선, sm 작은 아이콘, crop 크게 잘라 넣기)
const VARIANTS = {
  A1: ["얼굴형 · 흰색", "t3 col-w bar"],
  A2: ["얼굴형 · 주황", "t3 col-o bar"],
  A3: ["얼굴형 · 회검", "t3 col-k bar"],
  A4: ["얼굴형 · 흰+주황 뒷면", "t3 col-w bk-o bar"],
  A5: ["얼굴형 · 크림+회검 뒷면, 윤곽선 얼굴", "t3 col-c bk-k bar db-ol-center"],
  A6: ["얼굴형 · 흰색, 뒷면 얼굴 크게 잘라 넣기", "t3 col-w bar db-crop"],
  B1: ["하이픈형 · 흰색", "t4 col-w bar"],
  B2: ["하이픈형 · 주황", "t4 col-o bar"],
  B3: ["하이픈형 · 회검", "t4 col-k bar"],
  B4: ["하이픈형 · 흰색, 앞면 얼굴 워터마크", "t4 col-w bk-k bar df-wm"],
  B5: ["하이픈형 · 주황, 뒷면 윤곽선 얼굴", "t4 col-o bar db-ol"],
  B6: ["하이픈형 · 흰색+주황 띠", "t4 col-w bk-k bar band"],
  B7: ["하이픈형 · 주황 띠, 뒷면 얼굴 워터마크", "t4 col-w bk-o bar band db-wm"],
  B8: ["하이픈형 · 크림, 앞면 작은 얼굴", "t4 col-c bk-k bar df-sm"],
  B9: ["하이픈형 · 회검, 앞면 윤곽선 얼굴", "t4 col-k bar df-ol"],
};
const THEMES = ["1", "2", "3", "4", "3w", "3o", "3k", "4w", "4o", "4k", ...Object.keys(VARIANTS)];
const themeClasses = (v) => (VARIANTS[v] ? VARIANTS[v][1].split(" ") : /^[34][wok]$/.test(v) ? [`t${v[0]}`, `col-${v[1]}`] : [`theme-${v}`]);
const THEME = (() => {
  const v = new URLSearchParams(location.search).get("v");
  return THEMES.includes(v) ? v : String(TEAM.theme || 1);
})();
document.documentElement.classList.add(...themeClasses(THEME));
const withTheme = (href) => (THEME === String(TEAM.theme || 1) ? href : href + (href.includes("?") ? "&" : "?") + "v=" + THEME);
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll('a[href^="card.html"], a[href="./"]').forEach((a) => a.setAttribute("href", withTheme(a.getAttribute("href"))));
});

const footerText = () => `© ${new Date().getFullYear()} ${TEAM.name} · ${TEAM.school} ${TEAM.club}`;

function toast(msg) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => t.classList.remove("show"), 1800);
}

/** 공유: 폰이면 공유 시트, 아니면 링크 복사 */
async function shareLink(url, title) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); return; } catch (e) { if (e.name === "AbortError") return; }
  }
  try { await navigator.clipboard.writeText(url); toast("링크를 복사했습니다"); }
  catch { prompt("링크를 복사하세요", url); }
}

/** 명함 앞·뒤를 한 장의 사진으로: 폰이면 공유 시트(사진에 저장), 아니면 내려받기 */
async function cardImageBlob(card) {
  const front = card.querySelector(".front"), back = card.querySelector(".back");
  const w = front.offsetWidth, h = front.offsetHeight;
  const ratio = Math.max(2, 1200 / w);
  const opt = { pixelRatio: ratio, width: w, height: h, style: { transform: "none", boxShadow: "none" } };
  const [f, b] = [await htmlToImage.toCanvas(front, opt), await htmlToImage.toCanvas(back, opt)];
  const pad = Math.round(48 * ratio / 2), gap = Math.round(28 * ratio / 2);
  const c = document.createElement("canvas");
  c.width = f.width + pad * 2;
  c.height = f.height + b.height + pad * 2 + gap;
  const x = c.getContext("2d");
  x.fillStyle = "#33363F";
  x.fillRect(0, 0, c.width, c.height);
  x.drawImage(f, pad, pad);
  x.drawImage(b, pad, pad + f.height + gap);
  return new Promise((res) => c.toBlob(res, "image/png"));
}

async function saveCardImage(card, m) {
  try {
    const blob = await cardImageBlob(card);
    const file = new File([blob], `${m.id}-card.png`, { type: "image/png" });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: `${m.name} 명함` }); return; } catch (e) { if (e.name === "AbortError") return; }
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${m.name}-명함.png`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    toast("명함 사진을 저장했습니다");
  } catch (e) {
    console.error(e);
    toast("저장에 실패했습니다");
  }
}
