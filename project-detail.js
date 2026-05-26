(function () {
  const projects = window.PORTFOLIO_PROJECTS || [];
  const slug = document.body.dataset.project || new URLSearchParams(window.location.search).get("project");
  const project = projects.find((item) => item.slug === slug) || projects[0];
  const root = document.getElementById("project-detail-root");

  if (!root || !project) return;

  const esc = (value) => String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  const list = (items) => (items || []).map((item) => `<li>${esc(item)}</li>`).join("");
  const tech = (items) => (items || []).map((item) => `<span>${esc(item)}</span>`).join("");
  const facts = (items) => (items || []).map(([label, value]) => `
    <div class="detail-fact">
      <span>${esc(label)}</span>
      <strong>${esc(value)}</strong>
    </div>
  `).join("");
  const sections = (items) => (items || []).map((section) => `
    <section class="detail-section-block">
      <h2>${esc(section.title)}</h2>
      <p>${esc(section.body)}</p>
    </section>
  `).join("");
  const links = (items) => (items || []).map((link) => `
    <a class="hud-btn secondary" href="${esc(link.url)}" target="_blank" rel="noopener">
      ${esc(link.label)} <i class="fa-solid fa-up-right-from-square"></i>
    </a>
  `).join("");

  const currentIndex = projects.findIndex((item) => item.slug === project.slug);
  const prev = projects[(currentIndex - 1 + projects.length) % projects.length];
  const next = projects[(currentIndex + 1) % projects.length];

  document.title = `${project.title} | 여니 프로젝트`;

  root.innerHTML = `
    <header class="detail-topbar">
      <a href="../index.html#projects" class="detail-logo">여니 포트폴리오</a>
      <nav>
        <a href="../index.html#projects">프로젝트</a>
        <a href="../index.html#about">소개</a>
        <a href="../index.html#contact">연락</a>
      </nav>
    </header>

    <main class="project-detail-shell">
      <section class="detail-hero">
        <div class="detail-hero-copy">
          <span class="section-tag">[ ${esc(project.category)} · ${esc(project.status)} ]</span>
          <h1>${esc(project.title)}</h1>
          <p class="detail-subtitle">${esc(project.subtitle)}</p>
          <p class="detail-summary">${esc(project.summary)}</p>
          <div class="detail-actions">
            <a href="../index.html#projects" class="hud-btn primary"><i class="fa-solid fa-arrow-left"></i> 프로젝트 목록</a>
            ${links(project.links)}
          </div>
        </div>
        <aside class="detail-hero-card">
          ${project.coverImage ? `<div class="detail-cover" style="background-image: linear-gradient(rgba(0,0,0,0.08), rgba(0,0,0,0.62)), url('${esc(project.coverImage)}');"></div>` : `<div class="detail-icon-cover"><i class="${esc(project.icon)}"></i></div>`}
          <div class="detail-meta-grid">
            <div><span>상태</span><strong>${esc(project.status)}</strong></div>
            <div><span>기간</span><strong>${esc(project.period)}</strong></div>
            <div><span>역할</span><strong>${esc(project.role)}</strong></div>
          </div>
        </aside>
      </section>

      <section class="detail-grid">
        <div class="detail-main">
          ${sections(project.sections)}
        </div>
        <aside class="detail-side">
          <div class="hud-card detail-card">
            <h2>핵심 정보</h2>
            <div class="detail-facts">${facts(project.facts)}</div>
          </div>
          <div class="hud-card detail-card">
            <h2>기술/키워드</h2>
            <div class="project-tech detail-tech">${tech(project.tech)}</div>
          </div>
          <div class="hud-card detail-card">
            <h2>진행 기록</h2>
            <ul class="detail-list">${list(project.milestones)}</ul>
          </div>
          <div class="hud-card detail-card">
            <h2>다음 보강</h2>
            <ul class="detail-list">${list(project.nextSteps)}</ul>
          </div>
        </aside>
      </section>

      <section class="detail-impact-band">
        <span>프로젝트에서 보여줄 핵심</span>
        <strong>${esc(project.impact)}</strong>
      </section>

      <nav class="detail-pager">
        <a href="${esc(prev.slug)}.html"><i class="fa-solid fa-arrow-left"></i> ${esc(prev.title)}</a>
        <a href="${esc(next.slug)}.html">${esc(next.title)} <i class="fa-solid fa-arrow-right"></i></a>
      </nav>
    </main>
  `;
}());
