/**
 * sbychul.github.io - Main Script
 * 1. JS 자료 구조 기반 동적 렌더링 (코드 간결화 및 유지보수성 향상)
 * 2. 프로필 이미지 기반 자동 색상 테마 추출 & CSS 변수 주입
 * 3. GitHub API 연동을 통한 최신 프로젝트 자동 로드
 */

// 1. 프로필 및 콘텐츠 데이터 정의 (자료 구조화)
const PROFILE_DATA = {
  user: {
    githubUsername: "sbychul",
    name: "소병철",
    birth: "2004.04.27",
    univ: "인천대학교 컴퓨터공학부 전공",
    univEn: "Incheon National Univ. Computer Science & Engineering",
    avatar: "https://avatars.githubusercontent.com/u/131835031?v=4",
    email: "iamsbc0427@gmail.com",
  },

  theme: {
    // true로 변경하면 프로필 사진에서 색상을 추출해 테마에 반영
    // false일 경우 style.css의 무채색(흰색-회색-차콜) 테마를 유지.
    autoMatchProfileColor: true,
  },

  interests: [
    "Game Clients / Engines",
    "Backend Engineering / Development",
    "Esports / Sports Data Engineering",
  ],

  techStack: {
    available: {
      languages: [
        {
          name: "C",
          badge:
            "https://img.shields.io/badge/C-A8B9CC?style=flat-square&logo=c&logoColor=black",
        },
        {
          name: "C++",
          badge:
            "https://img.shields.io/badge/C++-00599C?style=flat-square&logo=cplusplus&logoColor=white",
        },
        {
          name: "Java",
          badge:
            "https://img.shields.io/badge/Java-ED8B00?style=flat-square&logo=openjdk&logoColor=white",
        },
        {
          name: "Python",
          badge:
            "https://img.shields.io/badge/Python-3776AB?style=flat-square&logo=python&logoColor=white",
        },
      ],

      tools: [
        {
          name: "Git",
          badge:
            "https://img.shields.io/badge/Git-F05032?style=flat-square&logo=git&logoColor=white",
        },
        {
          name: "GitHub",
          badge:
            "https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white",
        },
        {
          name: "VS Code",
          badge:
            "https://img.shields.io/badge/VS_Code-007ACC?style=flat-square&logo=visualstudiocode&logoColor=white",
        },
        {
          name: "IntelliJ IDEA",
          badge:
            "https://img.shields.io/badge/IntelliJ_IDEA-000000?style=flat-square&logo=intellijidea&logoColor=white",
        },
      ],
    },

    learning: [
      {
        name: "Kotlin",
        badge:
          "https://img.shields.io/badge/Kotlin-7F52FF?style=flat-square&logo=kotlin&logoColor=white",
      },
      {
        name: "JavaScript",
        badge:
          "https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black",
      },
      {
        name: "Android Studio",
        badge:
          "https://img.shields.io/badge/Android_Studio-3DDC84?style=flat-square&logo=androidstudio&logoColor=white",
      },
    ],
  },

  beyondCoding: [
    { text: "Gaming & Esports" },
    {
      text: "Sports",
      subItems: [
        {
          name: "Football (Manchester City)",
          icon: "https://thumb.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1280px-Manchester_City_FC_badge.svg.png?utm_source=en.wikipedia.org&utm_campaign=index&utm_content=thumbnail",
          alt: "Manchester City",
        },
        {
          name: "Formula 1 (McLaren)",
          icon: "https://static.vecteezy.com/system/resources/previews/020/500/043/non_2x/mclaren-brand-logo-symbol-orange-design-british-car-automobile-illustration-free-vector.jpg",
          alt: "McLaren",
        },
      ],
    },
  ],
};

// 2. 배지 그룹 렌더링 함수
function renderBadgeGroup(items, isSmall = false) {
  const groupClass = isSmall ? "badge-group badge-group-sm" : "badge-group";
  const badgeClass = isSmall ? "tech-badge small-badge" : "tech-badge";
  return `
    <div class="${groupClass}">
      ${items
        .map(
          (item) => `
        <img src="${item.badge}" alt="${item.name}" loading="lazy" class="${badgeClass}" />
      `,
        )
        .join("")}
    </div>
  `;
}

function renderContent() {
  // 1. 프로필 사이드바 렌더링
  const sidebar = document.getElementById("profile-sidebar");
  if (sidebar) {
    const { user } = PROFILE_DATA;
    sidebar.innerHTML = `
      <div class="avatar-container">
        <img id="avatar-img" class="profile-avatar" src="${user.avatar}" alt="${user.name}" crossorigin="anonymous" />
        <div class="avatar-glow"></div>
      </div>
      <div class="profile-info">
        <div class="name">${user.name}</div>
        <hr class="profile-divider">
        <div class="birth">${user.birth}</div>
        <div class="univ">${user.univ}</div>
        <span class="sub">${user.univEn}</span>
      </div>
      <div class="sidebar-contact">
        <a class="contact-link" href="mailto:${user.email}" target="_blank" rel="noopener noreferrer" title="Email">
          <img src="https://img.shields.io/badge/Gmail-EA4335?style=flat-square&logo=gmail&logoColor=white" alt="Gmail">
        </a>
        <a class="contact-link" href="https://github.com/${user.githubUsername}" target="_blank" rel="noopener noreferrer" title="GitHub">
          <img src="https://img.shields.io/badge/GitHub-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub">
        </a>
      </div>
    `;
  }

  // 2. Interested In 렌더링
  const interestsContainer = document.getElementById("interests-list");
  if (interestsContainer) {
    interestsContainer.innerHTML = PROFILE_DATA.interests
      .map((item) => `<li>${item}</li>`)
      .join("");
  }

  // 3. Tech Stack 렌더링
  const techStackContainer = document.getElementById("tech-stack-content");
  if (techStackContainer) {
    const { available, learning } = PROFILE_DATA.techStack;
    techStackContainer.innerHTML = `
      <h4>🟢 Available</h4>
      <h5>Languages</h5>
      ${renderBadgeGroup(available.languages)}
      <h5>Tools & IDE</h5>
      ${renderBadgeGroup(available.tools)}
      <hr class="profile-divider">
      <h5>⏳ Learning in Progress</h5>
      ${renderBadgeGroup(learning, true)}
    `;
  }

  // 4. Beyond Coding 렌더링
  const beyondCodingContainer = document.getElementById("beyond-coding-list");
  if (beyondCodingContainer) {
    beyondCodingContainer.innerHTML = PROFILE_DATA.beyondCoding
      .map((item) => {
        if (item.subItems) {
          return `
          <li>${item.text}
            <ul>
              ${item.subItems
                .map(
                  (sub) => `
                <li>${sub.name} <img src="${sub.icon}" class="inline-icon" alt="${sub.alt}"></li>
              `,
                )
                .join("")}
            </ul>
          </li>
        `;
        }
        return `<li>${item.text}</li>`;
      })
      .join("");
  }

  // 5. 프로필 이미지 로드 및 색상 자동 추출 (독립적인 Image 인스턴스로 CORS/캐시 보장)
  initAvatarThemeExtraction(PROFILE_DATA.user.avatar);

  // 6. GitHub 최신 프로젝트 로드
  loadGitHubProjects(PROFILE_DATA.user.githubUsername);

  // 7. GitHub 잔디밭(Activity) 로드
  loadGitHubActivity(PROFILE_DATA.user.githubUsername);
}

// 3. 프로필 이미지 기반 자동 색상 추출 & 테마 주입
function initAvatarThemeExtraction(avatarUrl) {
  if (!PROFILE_DATA.theme?.autoMatchProfileColor) {
    return;
  }

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    applyThemeFromImage(img);
  };
  img.onerror = (err) => {
    console.warn("[AutoTheme] 프로필 이미지 로드 실패:", err);
  };
  img.src = avatarUrl;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h,
    s,
    l = (max + min) / 2;

  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h = Math.round(h * 60);
  }

  return { h, s: Math.round(s * 100), l: Math.round(l * 100) };
}

function applyThemeFromImage(imgElement) {
  if (!PROFILE_DATA.theme?.autoMatchProfileColor) {
    return;
  }

  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // 빠른 분석을 위해 40x40 크기로 다운샘플링
    const sampleSize = 40;
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    ctx.drawImage(imgElement, 0, 0, sampleSize, sampleSize);

    const imgData = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
    let candidates = [];
    let fallbackCandidates = [];

    for (let i = 0; i < imgData.length; i += 16) {
      // 4픽셀 간격 샘플링
      const r = imgData[i];
      const g = imgData[i + 1];
      const b = imgData[i + 2];
      const a = imgData[i + 3];

      if (a < 128) continue; // 투명 픽셀 제외

      const hsl = rgbToHsl(r, g, b);

      // 1순위: 채도가 살아있는 유채색 픽셀
      if (hsl.l > 12 && hsl.l < 88 && hsl.s > 10) {
        const score = hsl.s * 2 + (50 - Math.abs(50 - hsl.l));
        candidates.push({ ...hsl, r, g, b, score });
      }

      // 2순위: 흑백/무채색 이미지 대비 백업 픽셀
      if (hsl.l > 15 && hsl.l < 85) {
        fallbackCandidates.push({
          ...hsl,
          r,
          g,
          b,
          score: 50 - Math.abs(50 - hsl.l),
        });
      }
    }

    const pool = candidates.length > 0 ? candidates : fallbackCandidates;

    if (pool.length > 0) {
      pool.sort((a, b) => b.score - a.score);
      const best = pool[0];

      const hue = best.h;
      // 채도가 있는 경우 35~75%로 보정, 무채색인 경우 원본 채도 유지
      const saturation =
        best.s > 10 ? Math.min(Math.max(best.s, 35), 75) : best.s;

      const root = document.documentElement;

      // CSS 변수 동적 주입
      root.style.setProperty(
        "--color-canvas-default",
        `hsl(${hue}, ${saturation}%, 88%)`,
      );
      root.style.setProperty(
        "--color-canvas-subtle",
        `hsl(${hue}, ${Math.max(0, saturation - 10)}%, 30%)`,
      );
      root.style.setProperty(
        "--color-border-muted",
        `hsl(${hue}, ${Math.max(0, saturation - 5)}%, 60%)`,
      );
      root.style.setProperty(
        "--color-shadow",
        `hsl(${hue}, ${Math.max(0, saturation - 15)}%, 66%)`,
      );
      root.style.setProperty(
        "--color-accent",
        `hsl(${hue}, ${saturation}%, 45%)`,
      );
      root.style.setProperty("--color-hr", `hsl(${hue}, ${saturation}%, 65%)`);

      // 인디케이터 표시
      const dot = document.querySelector(".palette-dot");
      if (dot) {
        dot.style.backgroundColor = `hsl(${hue}, ${saturation}%, 48%)`;
      }

      // 잔디밭(Activity) 차트의 색상도 추출된 대표 색상으로 동적 연동
      const extractedHex = hslToHex(hue, saturation, 45);
      currentActivityChartColor = extractedHex;
      updateActivityChartColor(extractedHex);

      console.log(
        `[AutoTheme] Extracted Dominant Color: HSL(${hue}, ${saturation}%, 50%) -> #${extractedHex}`,
      );
    }
  } catch (err) {
    console.info(
      "[AutoTheme] Canvas access was restricted or image not loaded. Default theme preserved.",
      err,
    );
  }
}

// HSL을 6자리 Hex 문자열로 변환 (예: '24292f')
function hslToHex(h, s, l) {
  l /= 100;
  const a = (s * Math.min(l, 1 - l)) / 100;
  const f = (n) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `${f(0)}${f(8)}${f(4)}`;
}

// 현재 활성화된 잔디밭 색상 상태 (기본값: 무채색 차콜)
let currentActivityChartColor = "24292f";

// 잔디밭 차트 이미지 색상 동적 갱신
function updateActivityChartColor(hexColor) {
  currentActivityChartColor = hexColor;
  const chartImg = document.querySelector(".activity-graph-img");
  if (chartImg && window.GitHubAPI) {
    chartImg.src = window.GitHubAPI.getChartUrl(
      PROFILE_DATA.user.githubUsername,
      hexColor,
    );
  }
}

// 4. GitHub API 연동 (최신 프로젝트 자동 표시)
async function loadGitHubProjects(username) {
  const container = document.getElementById("projects-content");
  if (!container) return;

  try {
    const personalRepos = await window.GitHubAPI.fetchProjects(username);
    // 최대 4개까지만 표시
    const displayedRepos = personalRepos.slice(0, 4);

    if (displayedRepos.length === 0) {
      container.innerHTML = `
        <div class="project-empty-state">
          <p>🚀 새로운 프로젝트 준비 중 (Work in progress)</p>
          <a href="https://github.com/${username}?tab=repositories" target="_blank" rel="noopener noreferrer" class="view-all-link">
            GitHub에서 모든 레포지토리 보기 →
          </a>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="projects-grid">
        ${displayedRepos
          .map(
            (repo) => `
          <a href="${repo.html_url}" target="_blank" rel="noopener noreferrer" class="project-card">
            <div class="project-card-header">
              <span class="project-name">${repo.name}</span>
              ${repo.stargazers_count > 0 ? `<span class="project-stars">★ ${repo.stargazers_count}</span>` : ""}
            </div>
            <p class="project-desc">${repo.description || "등록된 설명이 없습니다."}</p>
            <div class="project-footer">
              ${repo.language ? `<span class="project-lang"><span class="lang-dot"></span>${repo.language}</span>` : ""}
              <span class="project-link-label">View Repo ↗</span>
            </div>
          </a>
        `,
          )
          .join("")}
      </div>
      <div style="margin-top: 14px; text-align: right;">
        <a href="https://github.com/${username}?tab=repositories" target="_blank" rel="noopener noreferrer" class="view-all-link">
          GitHub 전체 프로젝트 보기 →
        </a>
      </div>
    `;
  } catch (error) {
    // API 에러 시 기본 정적 표시
    container.innerHTML = `
      <ul>
        <li>Work in progress</li>
      </ul>
    `;
  }
}

// 5. GitHub 잔디밭(Activity / Contribution Graph) 로드
async function loadGitHubActivity(username) {
  const container = document.getElementById("github-activity-content");
  if (!container) return;

  try {
    // Contributions API를 통해 최근 1년 총 기여 수 비동기 조회
    const { total } = await window.GitHubAPI.fetchActivity(username);

    // 렌더링 시점에 최신 색상(currentActivityChartColor)을 반영한 URL 생성
    const chartUrl = window.GitHubAPI
      ? window.GitHubAPI.getChartUrl(username, currentActivityChartColor)
      : `https://ghchart.rshah.org/${currentActivityChartColor}/${username}`;

    container.innerHTML = `
      <div class="activity-wrapper">
        <div class="activity-header">
          <span class="activity-summary">
            ${total !== null ? `🌱 최근 1년간 <strong>${total.toLocaleString()}</strong>개의 기여 활동` : `🌱 GitHub Contributions`}
          </span>
        </div>
        <div class="activity-graph-wrapper">
          <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" title="GitHub 프로필로 이동">
            <img src="${chartUrl}" alt="${username}'s GitHub Contributions" class="activity-graph-img" loading="lazy" />
          </a>
        </div>
      </div>
    `;
  } catch (error) {
    // API 에러 시에도 최신 색상 잔디밭 차트 SVG 이미지는 정상 표시
    const fallbackChartUrl = window.GitHubAPI
      ? window.GitHubAPI.getChartUrl(username, currentActivityChartColor)
      : `https://ghchart.rshah.org/${currentActivityChartColor}/${username}`;

    container.innerHTML = `
      <div class="activity-wrapper">
        <div class="activity-header">
          <span class="activity-summary">🌱 GitHub Contributions</span>
          <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer" class="activity-link">
            GitHub 프로필 방문 ↗
          </a>
        </div>
        <div class="activity-graph-wrapper">
          <a href="https://github.com/${username}" target="_blank" rel="noopener noreferrer">
            <img src="${fallbackChartUrl}" alt="${username}'s GitHub Contributions" class="activity-graph-img" loading="lazy" />
          </a>
        </div>
      </div>
    `;
  }
}

// DOM 준비 시 렌더링 실행
document.addEventListener("DOMContentLoaded", renderContent);
