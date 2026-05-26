/* ==========================================================================
   SYSTEM INITIATION & CUSTOM CURSOR
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initLoadingScreen();
  initCustomCursor();
  initThreeScene();
  initScrollAnimations();
  initGameShowcase();
  initAmbientSound();
});

// 1. 커스텀 마우스 HUD 커서 로직
function initCustomCursor() {
  const cursor = document.getElementById("custom-cursor");
  const dot = cursor.querySelector(".cursor-dot");
  const circle = cursor.querySelector(".cursor-circle");
  const coordX = document.getElementById("coord-x");
  const coordY = document.getElementById("coord-y");

  let mouseX = 0, mouseY = 0;
  let dotX = 0, dotY = 0;
  let circleX = 0, circleY = 0;

  window.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // HUD 좌표 표시 업데이트
    coordX.innerText = mouseX.toFixed(2);
    coordY.innerText = mouseY.toFixed(2);
  });

  // 부드러운 커서 트래킹 (Lerp)
  function updateCursor() {
    dotX += (mouseX - dotX) * 0.2;
    dotY += (mouseY - dotY) * 0.2;
    circleX += (mouseX - circleX) * 0.12;
    circleY += (mouseY - circleY) * 0.12;

    dot.style.left = `${dotX}px`;
    dot.style.top = `${dotY}px`;
    circle.style.left = `${circleX}px`;
    circle.style.top = `${circleY}px`;

    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  // 인터랙티브 요소 호버 이벤트 바인딩
  const interactiveElements = document.querySelectorAll("a, button, select, textarea, input, .project-card, .bullet");
  interactiveElements.forEach((el) => {
    el.addEventListener("mouseenter", () => {
      document.body.classList.add("hover-link");
    });
    el.addEventListener("mouseleave", () => {
      document.body.classList.remove("hover-link");
    });
  });
}

// 2. 시스템 부팅 로딩 스크린 로직
function initLoadingScreen() {
  const progressBar = document.getElementById("progress-bar");
  const btnEnter = document.getElementById("btn-enter");
  const loadingScreen = document.getElementById("loading-screen");
  const logsContainer = document.getElementById("status-logs");

  let progress = 0;
  const loadingLogs = [
    "> CONNECTING TO CORE DATABASE...",
    "> INITIATING 3D GRAPHICS RENDERER...",
    "> LOADING VIRTUAL ENVIRONMENT ASSETS...",
    "> RESOLVING PORTFOLIO IDENTITY MODULE...",
    "> STABILIZING SHADER GENERATORS...",
    "> SYNCHRONIZING WITH HUMAN COGNITIVE INTERFACE...",
    "> SYSTEMS OPERATIONAL. ACCESS GRANTED."
  ];

  // 로그 점진적 생성
  let logIndex = 0;
  function addLog() {
    if (logIndex < loadingLogs.length) {
      const p = document.createElement("p");
      p.className = "status-log";
      p.innerText = loadingLogs[logIndex];
      logsContainer.appendChild(p);
      logsContainer.scrollTop = logsContainer.scrollHeight;
      logIndex++;
      setTimeout(addLog, 400 + Math.random() * 300);
    }
  }
  setTimeout(addLog, 200);

  // 프로그레스 바 상승 시뮬레이션
  const interval = setInterval(() => {
    progress += Math.random() * 12;
    if (progress >= 100) {
      progress = 100;
      clearInterval(interval);
      
      // 로딩 완료 후 시스템 억세스 활성화
      btnEnter.classList.remove("disabled");
      btnEnter.disabled = false;
    }
    progressBar.style.width = `${progress}%`;
  }, 120);

  // 포트폴리오 메인 화면 진입
  btnEnter.addEventListener("click", () => {
    gsap.to(loadingScreen, {
      opacity: 0,
      duration: 1.2,
      ease: "power2.out",
      onComplete: () => {
        loadingScreen.style.display = "none";
        document.body.classList.remove("loading-state");
        
        // 메인 화면 진입 후 Hero 섹션 텍스트 애니메이션 작동
        animateHeroText();
      }
    });
  });
}

// Hero 섹션 텍스트 등장 애니메이션
function animateHeroText() {
  gsap.from(".hero-intro-box", {
    y: 50,
    opacity: 0,
    duration: 1.5,
    ease: "power3.out"
  });
  
  gsap.from(".hero-title span", {
    opacity: 0,
    y: 30,
    stagger: 0.2,
    duration: 1.2,
    ease: "power2.out",
    delay: 0.3
  });
}


/* ==========================================================================
   THREE.JS 3D PARTICLE ENGINE
   ========================================================================== */

let scene, camera, renderer, particleSystem;
let particlesCount = 4000;
let particlePositions = [];
let targetSection = 0;
let mouseX3D = 0, mouseY3D = 0;
let currentScrollProgress = 0;

// 각 섹션별 파티클 좌표 집합 저장
const morphTargets = {
  0: [], // Hero (Sphere)
  1: [], // About (Three Cores)
  2: [], // Research (Neural Net)
  3: [], // Lecture (Wave Grid)
  4: [], // Game Project (Mountain Landscape & Gate)
  5: [], // Projects (Cube Grid)
  6: []  // Contact (Hologram Core)
};

// 리서치 섹션용 네트워크 라인 연결을 위한 라인 세그먼트
let networkLines;

function initThreeScene() {
  const canvas = document.getElementById("three-canvas");
  
  // 1. 씬 & 카메라 & 렌더러 생성
  scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x030307, 0.015);

  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 120;

  renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true,
    alpha: true,
    powerPreference: "high-performance"
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // 2. 파티클 버퍼 지오메트리 빌드
  const geometry = new THREE.BufferGeometry();
  const initialPositions = new Float32Array(particlesCount * 3);
  const colors = new Float32Array(particlesCount * 3);

  // 빛나는 파티클용 커스텀 텍스처 (캔버스 기반 생성)
  const particleTexture = createCircleTexture();

  // 색조 조합: 시안(#00f0ff), 퍼플(#8a2be2), 핑크(#ff007f), 골드(#ff9900)
  const colorPalette = [
    new THREE.Color(0x00f0ff), // 시안
    new THREE.Color(0x8a2be2), // 퍼플
    new THREE.Color(0xff007f), // 핑크
    new THREE.Color(0xff7700)  // 오렌지
  ];

  for (let i = 0; i < particlesCount; i++) {
    // 최초 위치는 무작위 우주 먼지 형태
    initialPositions[i * 3] = (Math.random() - 0.5) * 300;
    initialPositions[i * 3 + 1] = (Math.random() - 0.5) * 300;
    initialPositions[i * 3 + 2] = (Math.random() - 0.5) * 300;

    // 색상을 입자 인덱스에 따라 화려하게 분포
    const col = colorPalette[i % colorPalette.length];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(initialPositions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  // 3. 파티클 매터리얼 정의 (Additive Blending으로 네온 효과 극대화)
  const material = new THREE.PointsMaterial({
    size: 1.8,
    map: particleTexture,
    vertexColors: true,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    opacity: 0.85
  });

  particleSystem = new THREE.Points(geometry, material);
  scene.add(particleSystem);

  // 4. 모핑 타겟 좌표 계산
  generateMorphTargets();

  // 5. 리서치 네트워크 라인 구성 (초기 투명도 0)
  initNetworkLines();

  // 6. 마우스 무브 감지 (패럴랙스용)
  window.addEventListener("mousemove", (e) => {
    mouseX3D = (e.clientX / window.innerWidth - 0.5) * 20;
    mouseY3D = -(e.clientY / window.innerHeight - 0.5) * 20;
  });

  // 창 크기 대응
  window.addEventListener("resize", onWindowResize);

  // 7. 렌더 루프 가동
  animate();
}

// 둥근 글로우 원형 입자 텍스처 동적 생성
function createCircleTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 16;
  canvas.height = 16;
  const ctx = canvas.getContext("2d");
  
  const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
  gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
  gradient.addColorStop(0.2, "rgba(255, 255, 255, 0.8)");
  gradient.addColorStop(0.5, "rgba(255, 255, 255, 0.2)");
  gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 16, 16);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// 리서치 섹션의 신경망 연결용 라인 구조물 세팅
function initNetworkLines() {
  const lineGeometry = new THREE.BufferGeometry();
  const lineCount = 300;
  const linePositions = new Float32Array(lineCount * 2 * 3); // 각 선은 2개 점, 각 점 3차원
  
  lineGeometry.setAttribute("position", new THREE.BufferAttribute(linePositions, 3));
  
  const lineMaterial = new THREE.LineBasicMaterial({
    color: 0x8a2be2,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  networkLines = new THREE.LineSegments(lineGeometry, lineMaterial);
  scene.add(networkLines);
}

// 각 섹션별 파티클 좌표 계산식
function generateMorphTargets() {
  for (let i = 0; i < particlesCount; i++) {
    
    // [0] HERO: 구체 (Sphere / Nebula Core)
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    const radius = 35 + Math.random() * 5;
    morphTargets[0].push(
      radius * Math.sin(phi) * Math.cos(theta),
      radius * Math.sin(phi) * Math.sin(theta),
      radius * Math.cos(phi)
    );

    // [1] ABOUT: 3개의 코어 주위에 분산되어 공전하는 구름
    const coreIndex = i % 3;
    let coreX = 0, coreY = 0, coreZ = 0;
    if (coreIndex === 0) { coreX = -35; coreY = 0; }       // Research Center
    else if (coreIndex === 1) { coreX = 35; coreY = 15; }    // Dev Center
    else { coreX = 0; coreY = -25; }                        // Edu Center
    
    const rAbout = 12 + Math.random() * 6;
    const tAbout = Math.random() * Math.PI * 2;
    const pAbout = Math.acos((Math.random() * 2) - 1);
    
    morphTargets[1].push(
      coreX + rAbout * Math.sin(pAbout) * Math.cos(tAbout),
      coreY + rAbout * Math.sin(pAbout) * Math.sin(tAbout),
      coreZ + rAbout * Math.cos(pAbout)
    );

    // [2] RESEARCH: 인공신경망 노드 배열 (Neural Network)
    // 6개의 중앙 허브 노드를 만들고, 나머지 입자는 근처 허브에 쏠리도록 계산
    const hubCount = 6;
    const hubPositions = [
      {x: -40, y: 20, z: 0},
      {x: -15, y: -20, z: -10},
      {x: 15, y: 25, z: 10},
      {x: 45, y: -10, z: 0},
      {x: 0, y: 5, z: -20},
      {x: -25, y: 15, z: 20}
    ];
    const myHub = hubPositions[i % hubCount];
    // 허브 중심에서 가지 형태로 무작위 흩어짐
    const length = 15 + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    morphTargets[2].push(
      myHub.x + Math.cos(angle) * length,
      myHub.y + Math.sin(angle) * length,
      myHub.z + (Math.random() - 0.5) * length * 0.5
    );

    // [3] LECTURE: 전파 / 파동 (3D Sine Wave Grid)
    const gridCols = 80;
    const gridRows = particlesCount / gridCols;
    const col = i % gridCols;
    const row = Math.floor(i / gridCols);
    const spacingX = 1.8;
    const spacingZ = 1.8;
    
    const wX = (col - gridCols / 2) * spacingX;
    const wZ = (row - gridRows / 2) * spacingZ;
    // Sine/Cosine 조합으로 물결 높이 결정
    const wY = Math.sin(wX * 0.1) * Math.cos(wZ * 0.1) * 8;
    
    morphTargets[3].push(wX, wY, wZ);

    // [4] GAME PROJECT: 문경새재 산맥 + 제1관문(성문) 실루엣
    // 입자의 70%는 겹겹이 솟은 조선 산맥 지형 구성, 30%는 성문(주흘관) 형상 격자 배치
    if (i < particlesCount * 0.7) {
      // 산맥 (Mountain Range)
      const mX = (Math.random() - 0.5) * 160;
      const mZ = (Math.random() - 0.5) * 80;
      // 세 겹의 산등성이 수식
      const h1 = Math.cos(mX * 0.05) * 20;
      const h2 = Math.sin(mX * 0.02 + mZ * 0.03) * 10;
      const mY = h1 + h2 - 15; // 바닥쪽으로 내림
      morphTargets[4].push(mX, mY, mZ);
    } else {
      // 성문 (Korean Traditional Gate Outline)
      const gateIdx = i - Math.floor(particlesCount * 0.7);
      const totalGatePoints = Math.floor(particlesCount * 0.3);
      
      // 직육면체 기초 및 아치 구조
      let gX = 0, gY = 0, gZ = 0;
      if (gateIdx < totalGatePoints * 0.5) {
        // 성벽 (Wall)
        gX = (Math.random() - 0.5) * 70;
        gY = Math.random() * 15 - 20;
        gZ = (Math.random() - 0.5) * 8;
        // 문루가 들어갈 가운데 아치 부분은 뚫어놓기
        if (Math.abs(gX) < 12 && gY > -14) {
          gY = -20; // 밑으로 밀어냄
        }
      } else {
        // 전통 2층 기와 누각 기둥/지붕 격자
        const roofIdx = gateIdx - Math.floor(totalGatePoints * 0.5);
        gX = (Math.random() - 0.5) * 40;
        gY = Math.random() * 12 - 5;
        gZ = (Math.random() - 0.5) * 12;
        // 기와 지붕의 들린 곡선 연출
        const roofCurve = Math.pow(gX * 0.08, 2) * 1.5;
        gY += roofCurve;
      }
      morphTargets[4].push(gX, gY, gZ);
    }

    // [5] PROJECTS: 3D 큐브 그리드 (Cube Grid)
    // 입자들을 일정한 간격의 3차원 바둑판 정렬
    const cubeDim = 16; // 16 * 16 * 16 = 4096
    const cx = i % cubeDim;
    const cy = Math.floor((i % (cubeDim * cubeDim)) / cubeDim);
    const cz = Math.floor(i / (cubeDim * cubeDim));
    const cubeSpacing = 5.0;
    
    morphTargets[5].push(
      (cx - cubeDim / 2) * cubeSpacing,
      (cy - cubeDim / 2) * cubeSpacing,
      (cz - cubeDim / 2) * cubeSpacing
    );

    // [6] CONTACT: 홀로그램 구체 코어 & 외곽 궤도 고리
    if (i < particlesCount * 0.4) {
      // 촘촘하게 뭉친 중앙 코어
      const cTheta = Math.random() * Math.PI * 2;
      const cPhi = Math.acos((Math.random() * 2) - 1);
      const cRadius = 12 + Math.random() * 3;
      morphTargets[6].push(
        cRadius * Math.sin(cPhi) * Math.cos(cTheta),
        cRadius * Math.sin(cPhi) * Math.sin(cTheta),
        cRadius * Math.cos(cPhi)
      );
    } else {
      // 바깥을 감도는 거대 고리 (Hologram Ring)
      const ringIdx = i % 3; // 3개의 다른 궤도 각도
      const rRadius = 38 + Math.random() * 8;
      const rTheta = Math.random() * Math.PI * 2;
      
      let rx = rRadius * Math.cos(rTheta);
      let ry = rRadius * Math.sin(rTheta);
      let rz = (Math.random() - 0.5) * 2;
      
      // 고리 기울기 회전 변형
      if (ringIdx === 1) {
        // Y축 회전
        const temp = rx;
        rx = temp * Math.cos(0.8) - rz * Math.sin(0.8);
        rz = temp * Math.sin(0.8) + rz * Math.cos(0.8);
      } else if (ringIdx === 2) {
        // X축 회전
        const temp = ry;
        ry = temp * Math.cos(0.8) - rz * Math.sin(0.8);
        rz = temp * Math.sin(0.8) + rz * Math.cos(0.8);
      }
      morphTargets[6].push(rx, ry, rz);
    }
  }
}

// 윈도우 리사이즈 핸들러
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
}

// Three.js 애니메이션 프레임 루프
let clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const elapsedTime = clock.getElapsedTime();
  const positions = particleSystem.geometry.attributes.position.array;
  
  // 1. 입자 보간 (Morphing Lerp)
  const currentTarget = morphTargets[targetSection];
  const lerpSpeed = 0.06; // 보간 감도

  for (let i = 0; i < particlesCount * 3; i++) {
    positions[i] += (currentTarget[i] - positions[i]) * lerpSpeed;
  }
  
  // 미세 물리 움직임 / 노이즈 가미
  if (targetSection === 0) {
    // 코어 주위를 천천히 공전
    particleSystem.rotation.y = elapsedTime * 0.05;
    particleSystem.rotation.x = elapsedTime * 0.02;
  } else if (targetSection === 1) {
    // 3개 그룹으로 자전 효과
    particleSystem.rotation.y = elapsedTime * 0.04;
    particleSystem.rotation.x = 0;
  } else if (targetSection === 2) {
    // 인공 신경망 노드 실시간 미세 파동
    particleSystem.rotation.y = elapsedTime * 0.03;
    particleSystem.rotation.x = Math.sin(elapsedTime * 0.1) * 0.1;
    
    // 리서치 네트워크 라인 실시간 연결 업데이트
    updateNetworkLines();
  } else if (targetSection === 3) {
    // 물결 그리드 일렁임 효과
    particleSystem.rotation.y = elapsedTime * 0.02;
    particleSystem.rotation.x = 0.3; // 비스듬히 눕힘
    
    // 물결 파동 적용
    for(let i=0; i<particlesCount; i++) {
      const idx = i * 3;
      const xVal = positions[idx];
      const zVal = positions[idx+2];
      positions[idx+1] = Math.sin(xVal * 0.1 + elapsedTime * 1.5) * Math.cos(zVal * 0.1 + elapsedTime * 1.0) * 8;
    }
  } else if (targetSection === 4) {
    // 안개 낀 문경새재 산악 지형 - 천천히 흘러가게 회전
    particleSystem.rotation.y = elapsedTime * 0.01;
    particleSystem.rotation.x = 0.15;
    
    // 횃불/안개 느낌으로 아래에서 위로 피어오르는 입자 시뮬레이션
    // 일부 입자(약 50개)를 랜덤으로 골라 Y축을 서서히 위로 올린 뒤 아래로 복귀
    for (let j = 0; j < 60; j++) {
      const randIdx = Math.floor(Math.random() * particlesCount) * 3;
      positions[randIdx + 1] += 0.15; // Y축 위로
      if (positions[randIdx + 1] > 20) {
        positions[randIdx + 1] = morphTargets[4][randIdx + 1]; // 원래 바닥 산 높이로 리셋
      }
    }
  } else if (targetSection === 5) {
    // 프로젝트 3D 입체 큐브 격자 회전
    particleSystem.rotation.y = elapsedTime * 0.06;
    particleSystem.rotation.x = elapsedTime * 0.03;
  } else if (targetSection === 6) {
    // 연락처 홀로그램 코어 - 중앙 코어 수축/이완 맥동
    particleSystem.rotation.y = -elapsedTime * 0.04;
    particleSystem.rotation.x = elapsedTime * 0.02;
    
    // 고리 흔들림
    const scaleFactor = 1.0 + Math.sin(elapsedTime * 2.0) * 0.05;
    particleSystem.scale.set(scaleFactor, scaleFactor, scaleFactor);
  }

  // 타겟 섹션이 리서치가 아닌 경우 라인 숨기기
  if (targetSection !== 2 && networkLines.material.opacity > 0) {
    networkLines.material.opacity -= 0.05;
  }

  // 2. 마우스 패럴랙스로 카메라 흔들기
  camera.position.x += (mouseX3D - camera.position.x) * 0.05;
  camera.position.y += (mouseY3D - camera.position.y) * 0.05;
  camera.lookAt(scene.position);

  particleSystem.geometry.attributes.position.needsUpdate = true;
  renderer.render(scene, camera);
}

// 리서치 섹션 활성화 시 입자들 중 가까운 거리를 찾아 라인을 이어주는 로직
function updateNetworkLines() {
  if (networkLines.material.opacity < 0.6) {
    networkLines.material.opacity += 0.02;
  }
  
  const positions = particleSystem.geometry.attributes.position.array;
  const linePos = networkLines.geometry.attributes.position.array;
  
  let lineIdx = 0;
  // 전체 입자 중 대표 노드 30개 위주로만 연결선 검색 (성능을 위해 제한)
  const step = Math.floor(particlesCount / 30);
  
  for (let i = 0; i < particlesCount; i += step) {
    const x1 = positions[i * 3];
    const y1 = positions[i * 3 + 1];
    const z1 = positions[i * 3 + 2];
    
    let connections = 0;
    // 다른 임의의 입자들과 거리 측정
    for (let j = i + 1; j < particlesCount && connections < 2; j += 150) {
      const x2 = positions[j * 3];
      const y2 = positions[j * 3 + 1];
      const z2 = positions[j * 3 + 2];
      
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dz = z2 - z1;
      const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
      
      // 임계값 이하 거리이면 선으로 연결
      if (dist < 22) {
        linePos[lineIdx * 6] = x1;
        linePos[lineIdx * 6 + 1] = y1;
        linePos[lineIdx * 6 + 2] = z1;
        
        linePos[lineIdx * 6 + 3] = x2;
        linePos[lineIdx * 6 + 4] = y2;
        linePos[lineIdx * 6 + 5] = z2;
        
        lineIdx++;
        connections++;
        if (lineIdx >= 300) break;
      }
    }
    if (lineIdx >= 300) break;
  }
  
  networkLines.geometry.attributes.position.needsUpdate = true;
}


/* ==========================================================================
   LENIS SMOOTH SCROLL & GSAP SCROLLTRIGGER INTEGRATION
   ========================================================================== */

function initScrollAnimations() {
  // 1. Lenis Smooth Scroll 초기화
  const lenis = new Lenis({
    duration: 1.4,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
    infinite: false,
  });

  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // Lenis 스크롤 변화에 맞춰 GSAP ScrollTrigger 자동 갱신
  lenis.on("scroll", () => {
    ScrollTrigger.update();
  });

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);

  // 2. 각 패널(섹션) 스크롤 감지 및 Three.js 모핑 트리거 연동
  const panels = gsap.utils.toArray(".panel");
  
  panels.forEach((panel, index) => {
    ScrollTrigger.create({
      trigger: panel,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) {
          targetSection = index;
          updateHUDIndicator(index);
          
          // 강연(Lecture) 대시보드 스탯 카운팅 트리거
          if (index === 3) {
            triggerStatsCounter();
          }
        }
      }
    });

    // 콘텐츠 내 요소들 페이드인 트랜지션
    const content = panel.querySelector(".hud-card, .hud-box, .about-grid, .lecture-grid, .game-showcase-container, .projects-grid, .contact-container");
    if (content) {
      gsap.from(content, {
        scrollTrigger: {
          trigger: panel,
          start: "top 70%",
          toggleActions: "play none none reverse"
        },
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "power2.out"
      });
    }
  });

  // 전체 스크롤 진행율 감시하여 스크롤 필링바 채우기
  ScrollTrigger.create({
    start: 0,
    end: "max",
    onUpdate: (self) => {
      currentScrollProgress = self.progress;
      document.getElementById("indicator-fill").style.height = `${currentScrollProgress * 100}%`;
    }
  });

  // 네비게이션 클릭 이벤트 스크롤 스무스 연결
  const navItems = document.querySelectorAll(".nav-item");
  const bullets = document.querySelectorAll(".bullet");

  navItems.forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const href = item.getAttribute("href");
      lenis.scrollTo(href);
    });
  });

  bullets.forEach((bullet) => {
    bullet.addEventListener("click", (e) => {
      e.preventDefault();
      const sections = ["#hero", "#about", "#research", "#lecture", "#game", "#projects", "#contact"];
      const targetIdx = parseInt(bullet.getAttribute("data-section"));
      lenis.scrollTo(sections[targetIdx]);
    });
  });
}

// HUD 인디케이터 업데이트
function updateHUDIndicator(sectionIndex) {
  // 상단 네비게이션 액티브
  const navItems = document.querySelectorAll(".nav-item");
  navItems.forEach((item, idx) => {
    if (idx === sectionIndex) item.classList.add("active");
    else item.classList.remove("active");
  });

  // 우측 불릿 액티브
  const bullets = document.querySelectorAll(".bullet");
  bullets.forEach((bullet, idx) => {
    if (idx === sectionIndex) bullet.classList.add("active");
    else bullet.classList.remove("active");
  });
}

// 4. LECTURE 대시보드 통계 카운팅 로직
let statsTriggered = false;
function triggerStatsCounter() {
  if (statsTriggered) return;
  statsTriggered = true;

  const statYears = document.getElementById("stat-years");
  const statHours = document.getElementById("stat-hours");
  const statStudents = document.getElementById("stat-students");

  animateCounter(statYears, 0, 5, 1500);
  animateCounter(statHours, 0, 1500, 2000);
  animateCounter(statStudents, 0, 3000, 2000);
}

function animateCounter(element, start, end, duration) {
  let startTime = null;
  const targetVal = end;
  
  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const currentVal = Math.floor(progress * (targetVal - start) + start);
    element.innerText = currentVal;
    
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      element.innerText = targetVal;
    }
  }
  
  window.requestAnimationFrame(step);
}


/* ==========================================================================
   GAME SHOWCASE (문경새재) CONTROLS
   ========================================================================== */

function initGameShowcase() {
  const slides = document.querySelectorAll(".game-art-slide");
  const indicators = document.querySelectorAll("#media-indicators .indicator");
  const btnPrev = document.getElementById("media-prev");
  const btnNext = document.getElementById("media-next");
  
  let currentSlide = 0;
  
  function changeSlide(nextIndex) {
    slides[currentSlide].classList.remove("active");
    indicators[currentSlide].classList.remove("active");
    
    currentSlide = (nextIndex + slides.length) % slides.length;
    
    slides[currentSlide].classList.add("active");
    indicators[currentSlide].classList.add("active");
  }
  
  btnPrev.addEventListener("click", () => changeSlide(currentSlide - 1));
  btnNext.addEventListener("click", () => changeSlide(currentSlide + 1));
  
  // 인디케이터 점 클릭 시 해당 슬라이드로 점프
  indicators.forEach((ind, idx) => {
    ind.addEventListener("click", () => changeSlide(idx));
  });

  // 6초마다 자동 슬라이드 전환
  setInterval(() => {
    // 문경새재 섹션을 보고 있을 때만 작동
    if (targetSection === 4) {
      changeSlide(currentSlide + 1);
    }
  }, 6000);
}


/* ==========================================================================
   WEB AUDIO API AMBIENT SOUND SYNTHESIZER
   ========================================================================== */

let audioCtx = null;
let masterGain = null;
let soundInitialized = false;

// 바람 소리 발생기용 노드
let windNode = null;
let filterNode = null;

// 방울/새소리용 타이머
let ambientBellTimer = null;

function initAmbientSound() {
  const audioToggle = document.getElementById("audio-toggle");
  const audioIcon = document.getElementById("audio-icon");
  const audioText = audioToggle.querySelector(".audio-text");

  audioToggle.addEventListener("click", () => {
    if (!soundInitialized) {
      // 1. 오디오 컨텍스트 기동 (사용자 제스처 필수)
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        audioCtx = new AudioContextClass();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(0, audioCtx.currentTime); // 초기 무음
        masterGain.connect(audioCtx.destination);
        
        // 2. 바람 소리 생성기 기동
        setupWindSynthesizer();
        
        // 3. 주기적 몽환적 동양풍 징/방울소리 루프 개시
        startAmbientBells();
        
        soundInitialized = true;
      } catch (err) {
        console.error("Web Audio API 이니셜라이즈 실패:", err);
      }
    }

    if (audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    // 토글 ON / OFF 처리
    if (audioToggle.classList.contains("active")) {
      // 음소거 (페이드아웃)
      masterGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + 1.2);
      audioToggle.classList.remove("active");
      audioIcon.className = "fa-solid fa-volume-xmark";
      audioText.innerText = "AUDIO OFF";
    } else {
      // 재생 (페이드인)
      masterGain.gain.linearRampToValueAtTime(0.2, audioCtx.currentTime + 1.5);
      audioToggle.classList.add("active");
      audioIcon.className = "fa-solid fa-volume-high";
      audioText.innerText = "AUDIO ON";
      
      // 사용자 클릭 효과음
      playClickBeep();
    }
  });
}

// 1. 실시간 백색 잡음(바람소리) 합성 노드 세팅
function setupWindSynthesizer() {
  // 2초 분량의 화이트 노이즈 버퍼 생성
  const bufferSize = audioCtx.sampleRate * 2;
  const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const output = noiseBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    output[i] = Math.random() * 2 - 1;
  }

  const whiteNoise = audioCtx.createBufferSource();
  whiteNoise.buffer = noiseBuffer;
  whiteNoise.loop = true;

  // 바람 느낌을 위한 밴드패스(Bandpass) 필터 생성
  filterNode = audioCtx.createBiquadFilter();
  filterNode.type = "bandpass";
  filterNode.Q.setValueAtTime(2.0, audioCtx.currentTime);
  filterNode.frequency.setValueAtTime(450, audioCtx.currentTime); // 낮은 고개 바람

  // 노이즈 소스 -> 필터 -> 마스터 게인
  whiteNoise.connect(filterNode);
  filterNode.connect(masterGain);
  whiteNoise.start(0);

  // 바람의 세기가 넘실거리도록 LFO 시뮬레이션 (마우스 움직임과 시간 주기로 변조)
  let windSpeed = 0;
  function swayWind() {
    if (!soundInitialized) return;
    
    // 시간 변화에 따른 느린 삼각파
    const time = audioCtx.currentTime;
    const lfo = Math.sin(time * 0.2) * Math.cos(time * 0.08); // 매우 불규칙하고 느린 바람
    
    // 문경새재 섹션(4)일 때 안개 바람 소리를 더 굵고 서정적으로 키움
    const targetBaseFreq = targetSection === 4 ? 300 : 450;
    const targetQ = targetSection === 4 ? 4.0 : 2.0;
    
    const freq = targetBaseFreq + lfo * 200 + (Math.abs(mouseX3D) * 15);
    
    filterNode.frequency.setValueAtTime(freq, audioCtx.currentTime);
    filterNode.Q.setValueAtTime(targetQ, audioCtx.currentTime);

    requestAnimationFrame(swayWind);
  }
  swayWind();
}

// 2. 동양풍 몽환적인 방울새 및 절간의 풍경 소리 합성
function startAmbientBells() {
  function triggerBell() {
    if (!soundInitialized) return;
    
    // 사운드가 활성화되어 있고, 오디오 노드가 살아있을 때만
    const audioToggle = document.getElementById("audio-toggle");
    if (audioToggle && audioToggle.classList.contains("active")) {
      
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const bellGain = audioCtx.createGain();
      const delay = audioCtx.createDelay();
      const delayGain = audioCtx.createGain();

      // Sine파와 Triangle파를 믹스해 영롱한 동양풍 주파수 매칭
      osc.type = "triangle";
      
      // 문경새재 섹션(4)일 때는 좀 더 그윽한 깊은 저음 방울소리, 그 외엔 높은 미래지향적 비프
      const freq = targetSection === 4 
        ? [329.63, 392.00, 440.00, 523.25][Math.floor(Math.random() * 4)] // E4, G4, A4, C5 (동양적 오음계 일부)
        : [880, 1046, 1318, 1760][Math.floor(Math.random() * 4)];        // 높은 네온 음
      
      osc.frequency.setValueAtTime(freq, now);

      // 음량 포락선 (Envelope) - 서서히 상승 후 아주 길게 감쇠 (풍경 소리 효과)
      bellGain.gain.setValueAtTime(0, now);
      bellGain.gain.linearRampToValueAtTime(targetSection === 4 ? 0.04 : 0.015, now + 0.08);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + (targetSection === 4 ? 5.5 : 2.5));

      // 에코 딜레이 효과 추가
      delay.delayTime.setValueAtTime(0.35, now);
      delayGain.gain.setValueAtTime(0.4, now);

      // 연결 피드백 루프
      osc.connect(bellGain);
      bellGain.connect(masterGain);
      
      bellGain.connect(delay);
      delay.connect(delayGain);
      delayGain.connect(masterGain); // 딜레이 신호를 마스터로
      delayGain.connect(delay);     // 딜레이 피드백

      osc.start(now);
      osc.stop(now + 6.0);
    }

    // 다음 사운드 랜덤 대기 시간 설정 (8초 ~ 16초 간격)
    const nextInterval = 8000 + Math.random() * 8000;
    ambientBellTimer = setTimeout(triggerBell, nextInterval);
  }
  
  // 첫 트리거 작동
  ambientBellTimer = setTimeout(triggerBell, 5000);
}

// 3. UI 버튼 클릭 피드백 멜로디 (홀로그램 접속음)
function playClickBeep() {
  if (!soundInitialized) return;
  
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const beepGain = audioCtx.createGain();
  
  osc.type = "sine";
  osc.frequency.setValueAtTime(587.33, now); // D5
  osc.frequency.setValueAtTime(880.00, now + 0.12); // A5 (상승음)
  
  beepGain.gain.setValueAtTime(0.02, now);
  beepGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
  
  osc.connect(beepGain);
  beepGain.connect(masterGain);
  
  osc.start(now);
  osc.stop(now + 0.4);
}
