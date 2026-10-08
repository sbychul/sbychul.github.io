/**
 * sbychul.github.io
 * 1. 상태 라인 KST 시계
 * 2. 모바일 메뉴 (popover) 링크 클릭 시 닫기
 * 3. GitHub 기여 그래프 (데이터로 직접 렌더링)
 * 4. 메시 그라데이션 (WebGL)
 * 5. 장면 전환 (스크롤 위치에 따라 고정된 섹션을 페이드 인/아웃)
 */

const GITHUB_USERNAME = "sbychul";

// 1. KST 시계
function startClock() {
  const el = document.getElementById("clock");
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  });
  const tick = () => (el.textContent = fmt.format(new Date()));
  tick();
  setInterval(tick, 15000);
}

// 2. 모바일 메뉴
function initMenu() {
  const menu = document.getElementById("menu");
  menu.addEventListener("click", (e) => {
    if (e.target.closest("a")) menu.hidePopover();
  });
}

// 3. 기여 그래프
async function loadContributions() {
  const graph = document.getElementById("contrib-graph");
  const caption = document.getElementById("contrib-caption");
  try {
    const res = await fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`,
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const { total, contributions } = await res.json();

    // 첫 날짜의 요일만큼 빈 칸을 채워 일요일 시작 7행 그리드에 맞춤
    const pad = new Date(contributions[0].date).getUTCDay();
    graph.innerHTML =
      "<i></i>".repeat(pad) +
      contributions
        .map(
          (d) =>
            `<i data-l="${d.level}" title="${d.count} contributions on ${d.date}"></i>`,
        )
        .join("");

    if (total?.lastYear != null) {
      caption.textContent = `${total.lastYear.toLocaleString("en-US")} contributions · last 12 months`;
    }

    // 모바일: 최신 주가 보이도록 오른쪽 끝으로 스크롤
    const scroller = graph.parentElement;
    scroller.scrollLeft = scroller.scrollWidth;
  } catch (err) {
    console.warn("[contributions] 로드 실패:", err);
    graph.textContent = "View contributions on GitHub ↗";
  }
}

// 4. 메시 그라데이션
const MESH_PALETTES = {
  // c0~c2: 본체 색, c3: 파도 윗부분(배경으로 녹아드는 색)
  light: ["#ff8000", "#ff6b00", "#ffa445", "#ffd3a1"],
  dark: ["#ff5e00", "#c24a00", "#ff8000", "#7a2e00"],
};

// 흐름 각속도(rad/s). 반지름 8 궤도 기준 노이즈 공간 속도 0.14. 한 바퀴 약 6분
const MESH_ANGULAR_SPEED = 0.0175;

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 r;
uniform float t; // 흐름 각도(라디안), JS에서 0~2π로 순환
uniform vec3 c0, c1, c2, c3;

// sin 없는 해시 (mediump에서 sin 해시는 사각형 아티팩트가 생김)
float h(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
float n(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(h(i), h(i + vec2(1, 0)), f.x), mix(h(i + vec2(0, 1)), h(i + vec2(1, 1)), f.x), f.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / r;               // y = 0 이 바닥
  vec2 p = vec2(uv.x * r.x / r.y * 0.35, uv.y);

  // 노이즈 공간에서 원을 그리며 흐름 (반지름 = 상대 속도). 직선으로 흐르면 시간이 지날수록
  // 좌표가 커져 float 정밀도가 부족해지고 격자 경계가 끊긴 선으로 보임. 원 궤도는 좌표가 작게 유지되고 한 바퀴마다 이음매 없이 반복됨.
  #define O(rad, ph) (rad * vec2(cos(t + ph), sin(t + ph)))

  // 파도 꼭대기 높이: 저주파 노이즈 두 겹이 서로 다른 속도로 흐름
  float crest = 0.42 + 0.30 * n(vec2(p.x * 2.2, 0.0) + O(8.0, 0.0))
                     + 0.14 * n(vec2(p.x * 4.6, 3.0) - O(10.4, 2.0));
  float a = smoothstep(crest + 0.18, crest - 0.32, uv.y);

  // 도메인 워핑으로 색을 액체처럼 섞음
  vec2 q = vec2(n(p * 3.0 + O(8.0, 4.0)), n(p * 3.0 + 5.0 - O(8.0, 1.0)));
  vec3 col = mix(c0, c1, smoothstep(0.25, 0.85, n(p * 2.4 + q * 1.6 + O(4.0, 3.0))));
  col = mix(col, c2, smoothstep(0.45, 0.95, n(p * 3.6 - q + O(8.0, 5.0))));
  col = mix(col, c3, smoothstep(0.35, 1.0, uv.y / crest) * 0.7);

  gl_FragColor = vec4(col * a, a);             // premultiplied alpha
}
`;

const hexToRgb = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);

function initMesh(canvas, dark, reducedMotion) {
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, antialias: false });
  if (!gl) return; // CSS 그라데이션 폴백 유지

  const compile = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG));
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
  gl.useProgram(prog);

  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(prog, "p");
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

  const u = (name) => gl.getUniformLocation(prog, name);
  const setPalette = (isDark) => {
    const pal = MESH_PALETTES[isDark ? "dark" : "light"];
    ["c0", "c1", "c2", "c3"].forEach((k, i) => gl.uniform3fv(u(k), hexToRgb(pal[i])));
  };
  setPalette(dark.matches);

  // 흐릿한 그라데이션이라 절반 해상도로도 충분
  const resize = () => {
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * 0.5));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * 0.5));
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u("r"), canvas.width, canvas.height);
  };

  const draw = (ms) => {
    gl.uniform1f(u("t"), ((ms / 1000) * MESH_ANGULAR_SPEED) % (2 * Math.PI));
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  let visible = false;
  let raf = 0;
  const loop = (ms) => {
    draw(ms);
    raf = visible ? requestAnimationFrame(loop) : 0;
  };
  const redrawStill = () => draw(12000);

  resize();
  canvas.classList.add("gl");

  if (reducedMotion.matches) {
    redrawStill();
  } else {
    // 화면에 보일 때만 애니메이션
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) raf = requestAnimationFrame(loop);
    }).observe(canvas);
  }

  new ResizeObserver(() => {
    resize();
    if (reducedMotion.matches) redrawStill();
  }).observe(canvas);

  dark.addEventListener("change", (e) => {
    setPalette(e.matches);
    if (reducedMotion.matches) redrawStill();
  });
}

// 5. 장면 전환
// 각 .scene은 화면 높이만큼의 스크롤 구간. 스크롤 진행도 p(0 = Hero, 1 = About, ...)를 구해
// 장면 k의 내용은 |p - k| 가 0.08 이하일 때 완전히 보이고 0.4에서 완전히 사라짐.
// 이전 장면이 먼저 사라지고 다음 장면이 나타나는 순서형 페이드.
// 스냅 스크롤 속도는 브라우저가 정하므로, 화면에 쓰는 진행도(shown)가 스크롤 진행도(target)를
// 2단 지수 필터(시간 상수 TRANSITION_TAU초)로 뒤따라가게 해서 전환 속도를 조절함.
// 2단이라 시작과 끝이 모두 부드러운 S자 곡선. 값이 클수록 느림.
const TRANSITION_TAU = 0.15;

function initScenes() {
  const scenes = [...document.querySelectorAll(".scene")];
  const inners = scenes.map((s) => s.querySelector(".scene-inner"));
  const mesh = document.querySelector(".mesh");
  const links = [...document.querySelectorAll(".nav-links a, .menu a")];
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const last = scenes.length - 1;
  let current = -1;
  let mid = null;
  let shown = null;
  let lastTime = 0;
  let raf = 0;

  const scrollProgress = () => {
    const y = scrollY;
    const tops = scenes.map((s) => s.offsetTop);
    let i = 0;
    while (i < last && y >= tops[i + 1]) i++;

    // 모바일 주소창 때문에 마지막 구간 끝까지 스크롤되지 않을 수 있어 끝에 닿으면 마지막 장면으로 고정
    const atEnd = y >= document.documentElement.scrollHeight - innerHeight - 2;
    const span = (tops[i + 1] ?? tops[i] + innerHeight) - tops[i];
    return atEnd ? last : i + Math.min(1, (y - tops[i]) / span);
  };

  const frame = (now) => {
    const target = scrollProgress();
    const dt = lastTime ? (now - lastTime) / 1000 : 0;
    lastTime = now;
    if (shown === null || reducedMotion.matches) {
      mid = shown = target;
    } else {
      const k = 1 - Math.exp(-dt / TRANSITION_TAU);
      mid += (target - mid) * k;
      shown += (mid - shown) * k;
    }
    if (Math.abs(target - shown) < 0.001 && Math.abs(target - mid) < 0.001) mid = shown = target;

    render(shown);
    raf = shown === target ? 0 : requestAnimationFrame(frame);
    if (!raf) lastTime = 0;
  };

  const render = (p) => {
    inners.forEach((el, k) => {
      const d = p - k;
      el.style.opacity = Math.max(0, Math.min(1, 1 - (Math.abs(d) - 0.08) / 0.32));
      el.style.transform = reducedMotion.matches ? "" : `translateY(${(-d * 48).toFixed(1)}px)`;
    });

    const active = Math.round(p);
    if (active === current) return;
    current = active;
    scenes.forEach((s, k) => s.classList.toggle("active", k === active));
    mesh?.classList.toggle("bright", active === 0 || active === last);
    links.forEach((a) =>
      a.hash === `#${scenes[active].id}`
        ? a.setAttribute("aria-current", "true")
        : a.removeAttribute("aria-current"),
    );
  };

  const queue = () => {
    if (!raf) raf = requestAnimationFrame(frame);
  };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);

  // 키보드로 보이지 않는 장면 안의 링크에 포커스가 가면 그 장면으로 이동
  document.addEventListener("focusin", (e) => {
    const scene = e.target.closest(".scene");
    if (scene && !scene.classList.contains("active")) {
      scene.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth" });
    }
  });

  queue();
}

document.addEventListener("DOMContentLoaded", () => {
  startClock();
  initMenu();
  loadContributions();
  initScenes();

  const dark = matchMedia("(prefers-color-scheme: dark)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  document.querySelectorAll(".mesh").forEach((c) => initMesh(c, dark, reducedMotion));
});
