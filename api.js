/**
 * GitHub 관련 데이터(프로젝트, 기여도 잔디밭 등) 비동기 통신 전담 모듈
 */

const GitHubAPI = {
  /**
   * 사용자의 공개 레포지토리 목록 조회
   * @param {string} username - GitHub 사용자명
   * @returns {Promise<Array>} 레포지토리 데이터 목록
   */
  async fetchProjects(username) {
    try {
      const response = await fetch(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=6`,
      );
      if (!response.ok) {
        throw new Error(`GitHub API HTTP ${response.status}`);
      }

      const repos = await response.json();
      // 포크 레포 및 개인 프로필 레포(.github.io) 제외 후 최근 업데이트순 정렬
      return repos.filter(
        (repo) => !repo.fork && repo.name !== `${username}.github.io`,
      );
    } catch (error) {
      console.warn("[GitHubAPI] 레포지토리 조회 실패:", error);
      throw error;
    }
  },

  /**
   * 사용자의 최근 1년간 기여 활동(Contributions) 통계 조회
   * @param {string} username - GitHub 사용자명
   * @returns {Promise<{ total: number | null }>} 총 기여 횟수 객체
   */
  async fetchActivity(username) {
    try {
      const response = await fetch(
        `https://github-contributions-api.jogruber.de/v4/${username}?y=last`,
      );
      if (!response.ok) {
        throw new Error(`Contributions API HTTP ${response.status}`);
      }

      const data = await response.json();
      let totalCount = null;

      if (data && data.total) {
        totalCount =
          data.total.lastYear ?? Object.values(data.total)[0] ?? null;
      }

      return { total: totalCount };
    } catch (error) {
      console.warn("[GitHubAPI] 기여도 통계 조회 실패 (Fallback 사용):", error);
      return { total: null };
    }
  },

  /**
   * GitHub 잔디밭 차트 SVG URL 생성
   * @param {string} username - GitHub 사용자명
   * @param {string} hexColor - 6자리 HEX 색상 코드 (# 포함/미포함 무관)
   * @returns {string} 차트 이미지 URL
   */
  getChartUrl(username, hexColor = "24292f") {
    // '#' 기호가 포함된 경우 제거
    const cleanHex = hexColor.replace("#", "").trim();
    return `https://ghchart.rshah.org/${cleanHex}/${username}`;
  },
};

// 전역 스코프에 등록
window.GitHubAPI = GitHubAPI;
