// ============================================
// YH NAVIGATOR — 공통 인터랙션 + 테마 시스템
// ============================================

// -------- 테마 토글 --------
const THEME_KEY = 'yh-theme';
const root = document.documentElement;

function applyTheme(theme) {
  root.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_KEY, theme);
  // Three.js 씬에 알리기 위한 커스텀 이벤트
  window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
}

function getCurrentTheme() {
  return root.getAttribute('data-theme') || 'light';
}

// 토글 버튼 바인딩 (페이지 로드 후)
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) {
    toggle.addEventListener('click', () => {
      const next = getCurrentTheme() === 'light' ? 'dark' : 'light';
      applyTheme(next);
    });
  }
});

// -------- 스크롤 리빌 --------
const revealObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObs.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObs.observe(el));

// -------- 숫자 카운터 (data-count 속성) --------
const counterObs = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseFloat(el.dataset.count);
      const decimals = el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1400;
      const start = performance.now();
      function tick(now) {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        const value = target * eased;
        el.textContent = value.toFixed(decimals) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
      counterObs.unobserve(el);
    });
  },
  { threshold: 0.4 }
);
document.querySelectorAll('[data-count]').forEach((el) => counterObs.observe(el));
