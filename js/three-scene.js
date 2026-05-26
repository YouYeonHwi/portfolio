// ============================================
// YH NAVIGATOR — 히어로 3D 씬 (테마 반응형)
// ============================================

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';

const mount = document.getElementById('hero-canvas');
if (mount) {
  // ----- Scene / Camera / Renderer -----
  const scene = new THREE.Scene();

  const camera = new THREE.PerspectiveCamera(
    45,
    mount.clientWidth / mount.clientHeight,
    0.1,
    100
  );
  camera.position.set(0, 0, 7);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(mount.clientWidth, mount.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);

  // ----- 테마별 컬러 팔레트 -----
  const palettes = {
    light: {
      knotColor: 0xE8EBF2,
      knotMetalness: 0.55,
      knotRoughness: 0.25,
      ambient: 0xC8D2E4,
      ambientI: 0.7,
      keyLight: 0x2D5BD9,
      keyLightI: 1.3,
      rimLight: 0x7C3AED,
      rimLightI: 1.4,
      accentLight: 0x0891B2,
      accentLightI: 1.0,
      wireColor: 0x2D5BD9,
      wireOpacity: 0.10,
      particleColor: 0x2D5BD9,
      particleOpacity: 0.35,
      cubeA: 0x2D5BD9,
      cubeB: 0x7C3AED,
      cubeEmissiveI: 0.15,
      cubeMetalness: 0.6,
    },
    dark: {
      knotColor: 0x1a2438,
      knotMetalness: 0.95,
      knotRoughness: 0.15,
      ambient: 0x4a4f5e,
      ambientI: 0.6,
      keyLight: 0x6f94db,
      keyLightI: 1.2,
      rimLight: 0xb388ff,
      rimLightI: 2.0,
      accentLight: 0x00d9c0,
      accentLightI: 1.5,
      wireColor: 0x5C8FF0,
      wireOpacity: 0.18,
      particleColor: 0xffffff,
      particleOpacity: 0.6,
      cubeA: 0x5C8FF0,
      cubeB: 0xB388FF,
      cubeEmissiveI: 0.4,
      cubeMetalness: 0.8,
    },
  };

  function currentPalette() {
    const theme = document.documentElement.getAttribute('data-theme') || 'light';
    return palettes[theme] || palettes.light;
  }

  // ----- 라이트 -----
  const ambient = new THREE.AmbientLight();
  scene.add(ambient);
  const keyLight = new THREE.DirectionalLight();
  keyLight.position.set(5, 5, 5);
  scene.add(keyLight);
  const rimLight = new THREE.PointLight();
  rimLight.position.set(-4, 2, -2);
  scene.add(rimLight);
  const accentLight = new THREE.PointLight();
  accentLight.position.set(3, -3, 2);
  scene.add(accentLight);

  // ----- 메인 오브 (TorusKnot) -----
  const knotGeo = new THREE.TorusKnotGeometry(1.4, 0.42, 256, 32, 2, 3);
  const knotMat = new THREE.MeshPhysicalMaterial({
    metalness: 0.95,
    roughness: 0.15,
    clearcoat: 1.0,
    clearcoatRoughness: 0.1,
    iridescence: 1.0,
    iridescenceIOR: 1.3,
    iridescenceThicknessRange: [100, 800],
  });
  const knot = new THREE.Mesh(knotGeo, knotMat);
  scene.add(knot);

  // ----- 와이어프레임 외곽 구체 -----
  const wireGeo = new THREE.IcosahedronGeometry(2.6, 1);
  const wireMat = new THREE.MeshBasicMaterial({
    wireframe: true,
    transparent: true,
  });
  const wireMesh = new THREE.Mesh(wireGeo, wireMat);
  scene.add(wireMesh);

  // ----- 파티클 (별) -----
  const particleCount = 600;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const r = 4 + Math.random() * 5;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.025,
    transparent: true,
    sizeAttenuation: true,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // ----- 작은 떠다니는 큐브들 -----
  const cubes = [];
  const cubeMaterials = [];
  for (let i = 0; i < 5; i++) {
    const size = 0.12 + Math.random() * 0.18;
    const geo = new THREE.BoxGeometry(size, size, size);
    const mat = new THREE.MeshPhysicalMaterial({
      metalness: 0.8,
      roughness: 0.3,
    });
    cubeMaterials.push({ mat, type: i % 2 === 0 ? 'A' : 'B' });
    const cube = new THREE.Mesh(geo, mat);
    cube.position.set(
      (Math.random() - 0.5) * 6,
      (Math.random() - 0.5) * 4,
      (Math.random() - 0.5) * 3
    );
    cube.userData.offset = Math.random() * Math.PI * 2;
    cube.userData.speed = 0.3 + Math.random() * 0.4;
    scene.add(cube);
    cubes.push(cube);
  }

  // ----- 팔레트 적용 함수 -----
  function applyPalette() {
    const p = currentPalette();
    ambient.color.setHex(p.ambient);
    ambient.intensity = p.ambientI;
    keyLight.color.setHex(p.keyLight);
    keyLight.intensity = p.keyLightI;
    rimLight.color.setHex(p.rimLight);
    rimLight.intensity = p.rimLightI;
    accentLight.color.setHex(p.accentLight);
    accentLight.intensity = p.accentLightI;

    knotMat.color.setHex(p.knotColor);
    knotMat.metalness = p.knotMetalness;
    knotMat.roughness = p.knotRoughness;
    knotMat.needsUpdate = true;

    wireMat.color.setHex(p.wireColor);
    wireMat.opacity = p.wireOpacity;

    particleMat.color.setHex(p.particleColor);
    particleMat.opacity = p.particleOpacity;

    cubeMaterials.forEach(({ mat, type }) => {
      const color = type === 'A' ? p.cubeA : p.cubeB;
      mat.color.setHex(color);
      mat.emissive.setHex(color);
      mat.emissiveIntensity = p.cubeEmissiveI;
      mat.metalness = p.cubeMetalness;
      mat.needsUpdate = true;
    });
  }

  applyPalette();

  // 테마 변경 시 즉시 반영
  window.addEventListener('themechange', applyPalette);

  // ----- 마우스 패럴랙스 -----
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 0.6;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 0.4;
  });

  // ----- 애니메이션 루프 -----
  const clock = new THREE.Clock();

  function animate() {
    const t = clock.getElapsedTime();

    knot.rotation.x = t * 0.25;
    knot.rotation.y = t * 0.35;

    wireMesh.rotation.x = -t * 0.08;
    wireMesh.rotation.y = t * 0.12;

    particles.rotation.y = t * 0.04;

    cubes.forEach((cube) => {
      cube.rotation.x = t * cube.userData.speed;
      cube.rotation.y = t * cube.userData.speed * 0.8;
      cube.position.y += Math.sin(t * cube.userData.speed + cube.userData.offset) * 0.0025;
    });

    mouse.x += (mouse.tx - mouse.x) * 0.05;
    mouse.y += (mouse.ty - mouse.y) * 0.05;
    camera.position.x = mouse.x * 1.5;
    camera.position.y = -mouse.y * 1.0;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
  }
  animate();

  // ----- 리사이즈 -----
  window.addEventListener('resize', () => {
    const w = mount.clientWidth;
    const h = mount.clientHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
  });
}
