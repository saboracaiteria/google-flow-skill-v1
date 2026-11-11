/**
 * Stickman Mundo 3D Cinematográfico
 * Ambiente tridimensional vibrante com piso reflexivo, grid neon estilizado,
 * fenda dimensional rubra volumétrica, partículas de faísca e iluminação solar.
 */
(function(window) {
  'use strict';

  function createStickmanWorld3D(scene) {
    const worldGroup = new THREE.Group();
    worldGroup.name = 'stickman_world_3d';

    // 1. Chão infinito com reflexo sutil
    const floorGeo = new THREE.PlaneGeometry(120, 120, 32, 32);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x070b14,
      roughness: 0.35,
      metalness: 0.6
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    worldGroup.add(floor);

    // 2. Grade Neon Futurista Estilizada (Grid)
    const grid = new THREE.GridHelper(60, 40, 0x38bdf8, 0x1e293b);
    grid.position.y = 0.01;
    worldGroup.add(grid);

    // 3. Fenda Dimensional Rubra no Centro
    const crackGroup = new THREE.Group();
    crackGroup.name = 'rift_crack';
    crackGroup.position.set(0, 0.03, 0);

    const crackCoreGeo = new THREE.PlaneGeometry(0.35, 14);
    const crackCoreMat = new THREE.MeshBasicMaterial({
      color: 0xff1e56,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending
    });
    const crackCore = new THREE.Mesh(crackCoreGeo, crackCoreMat);
    crackCore.rotation.x = -Math.PI / 2;
    crackCore.rotation.z = Math.PI / 4;
    crackGroup.add(crackCore);

    // Brilho da Fenda
    const crackGlowGeo = new THREE.PlaneGeometry(1.6, 16);
    const crackGlowMat = new THREE.MeshBasicMaterial({
      color: 0xef4444,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const crackGlow = new THREE.Mesh(crackGlowGeo, crackGlowMat);
    crackGlow.rotation.x = -Math.PI / 2;
    crackGlow.rotation.z = Math.PI / 4;
    crackGroup.add(crackGlow);

    worldGroup.add(crackGroup);

    // 4. Pilares / Monólitos Geométricos ao Fundo para Profundidade
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.5,
      metalness: 0.8
    });
    for (let i = -4; i <= 4; i++) {
      if (i === 0) continue;
      const h = 4 + Math.abs(i) * 2.2;
      const pillarGeo = new THREE.BoxGeometry(1.2, h, 1.2);
      const pillar = new THREE.Mesh(pillarGeo, pillarMat);
      pillar.position.set(i * 4.5, h / 2, -18 - Math.abs(i) * 2);
      pillar.castShadow = true;
      pillar.receiveShadow = true;
      worldGroup.add(pillar);

      // Linha de luz neon no topo de cada monólito
      const beaconGeo = new THREE.SphereGeometry(0.18, 12, 12);
      const beaconMat = new THREE.MeshBasicMaterial({
        color: i > 0 ? 0xef4444 : 0x38bdf8
      });
      const beacon = new THREE.Mesh(beaconGeo, beaconMat);
      beacon.position.set(pillar.position.x, h + 0.3, pillar.position.z);
      worldGroup.add(beacon);
    }

    // 5. Partículas de Energia no Ar
    const particleCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      pPos[i * 3 + 0] = (Math.random() - 0.5) * 25;
      pPos[i * 3 + 1] = Math.random() * 8;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 25;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.14,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });
    const particles = new THREE.Points(pGeo, pMat);
    worldGroup.add(particles);

    // 6. Luzes Dinâmicas
    const hemiLight = new THREE.HemisphereLight(0x38bdf8, 0x05070f, 0.9);
    worldGroup.add(hemiLight);

    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(6, 14, 10);
    sun.castShadow = true;
    worldGroup.add(sun);

    const redRiftLight = new THREE.PointLight(0xff0044, 2.5, 12);
    redRiftLight.position.set(0, 1.2, 0);
    worldGroup.add(redRiftLight);

    // Função de animação a cada quadro
    worldGroup.userData.animate = function(t, sceneIndex) {
      // Pulsação da fenda de acordo com a cena
      if (sceneIndex === 0) {
        crackGroup.visible = false;
        redRiftLight.intensity = 0.2;
      } else if (sceneIndex === 1) {
        crackGroup.visible = true;
        const pulse = 1 + Math.sin(t * 8) * 0.3;
        crackGroup.scale.set(pulse, 1, pulse);
        redRiftLight.intensity = 2.0 + Math.sin(t * 10) * 1.5;
      } else if (sceneIndex === 2 || sceneIndex === 3) {
        crackGroup.visible = true;
        const pulse = 1.2 + Math.sin(t * 12) * 0.4;
        crackGroup.scale.set(pulse, 1, pulse);
        redRiftLight.intensity = 3.2 + Math.sin(t * 15) * 1.8;
      } else {
        // Cena 5: Vitória e fenda se fechando
        crackGroup.visible = false;
        redRiftLight.intensity = 0;
      }

      // Voo lento de partículas
      const positions = pGeo.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += 0.015;
        if (positions[i * 3 + 1] > 9) {
          positions[i * 3 + 1] = 0.1;
        }
      }
      pGeo.attributes.position.needsUpdate = true;
    };

    scene.add(worldGroup);
    return worldGroup;
  }

  window.createStickmanWorld3D = createStickmanWorld3D;

})(window);
