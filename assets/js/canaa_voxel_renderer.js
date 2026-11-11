/**
 * CanaaVoxelRenderer - Renderizador 3D em Micro-Voxels (Pixel Art 3D com Cubos)
 * Canaã dos Carajás: O Gigante S11D & O Megatrem
 * Construído proceduralmente com Three.js (InstancedMesh, micro-voxels, ambientação densa).
 */
(function() {
  let isInit = false;
  let canvas3d = null;
  let renderer = null;
  let scene = null;
  let camera = null;

  // Cenas 3D específicas para cada ato (0 a 6)
  let scenesGroup = [];
  let trainGroup = null;
  let conveyorGroup = null;
  let oreBeltGroup = null;
  let mineTerrainGroup = null;
  let forestGroup = null;

  // Objetos animados adicionais para dinamismo e vida em todas as cenas
  let scene0ExcavatorArm = null;
  let scene0SmokePuffs = null;
  let scene1DustPuffs = null;
  let scene2SmokePuff = null;
  let scene3TrainObj = null;
  let scene3MistPuffs = null;
  let scene4CampfireFlames = null;
  let scene4Clothes = null;
  let scene5VehiclesForward = null;
  let scene5VehiclesBackward = null;
  let scene6QuestionMark = null;

  // Textura pixel art procedural para materiais de voxels
  function createPixelTexture(baseColorHex, noiseColorHex, size = 16) {
    const cv = document.createElement('canvas');
    cv.width = size;
    cv.height = size;
    const cx = cv.getContext('2d');
    cx.fillStyle = baseColorHex;
    cx.fillRect(0, 0, size, size);
    for (let x = 0; x < size; x++) {
      for (let y = 0; y < size; y++) {
        if (Math.random() > 0.65) {
          cx.fillStyle = noiseColorHex;
          cx.fillRect(x, y, 1, 1);
        }
      }
    }
    const tex = new THREE.CanvasTexture(cv);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  function init() {
    if (typeof THREE === 'undefined') return false;
    if (isInit) return true;

    canvas3d = document.createElement('canvas');
    canvas3d.width = 1080;
    canvas3d.height = 1920;

    renderer = new THREE.WebGLRenderer({ canvas: canvas3d, antialias: false, alpha: false });
    renderer.setSize(1080, 1920, false);
    renderer.setPixelRatio(1);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.BasicShadowMap;

    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8ecae6);
    scene.fog = new THREE.FogExp2(0xbfe3f2, 0.006);

    camera = new THREE.PerspectiveCamera(50, 1080 / 1920, 0.1, 500);

    // Iluminação voxel estilizada
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x9fb8a8, 1.15);
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xfff8e1, 1.55);
    dirLight.position.set(40, 60, 30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 1024;
    dirLight.shadow.mapSize.height = 1024;
    scene.add(dirLight);

    const ambient = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambient);

    const fillLight = new THREE.DirectionalLight(0xdff1ff, 0.55);
    fillLight.position.set(-35, 25, -30);
    scene.add(fillLight);

    // Constrói os mundos de voxel para as 4 cenas
    buildVoxelWorlds();

    isInit = true;
    return true;
  }

  // Construtor auxiliar de micro-voxels utilizando InstancedMesh para altíssima performance
  function createVoxelCluster(voxelPositions, color, cubeSize = 0.4) {
    const geo = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    const mat = new THREE.MeshLambertMaterial({ color: color });
    const count = voxelPositions.length;
    const mesh = new THREE.InstancedMesh(geo, mat, count);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      dummy.position.set(voxelPositions[i].x, voxelPositions[i].y, voxelPositions[i].z);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    return mesh;
  }

  function buildVoxelWorlds() {
    scenesGroup = [new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group(), new THREE.Group()];
    scenesGroup.forEach(g => scene.add(g));

    // ==========================================
    // CENA 0: A Mina S11D & O Vale de Ferro Voxel
    // ==========================================
    const g0 = scenesGroup[0];
    const s11dPositions = [];
    const redIronColors = [0x5c1a1b, 0x7c2d12, 0x451a03, 0x2e1065, 0x1f2937];
    const jungleGreen = [0x14532d, 0x166534, 0x15803d, 0x22c55e];

    // Bancadas de mineração em degraus (terraces)
    const sz = 0.5;
    for (let x = -30; x <= 30; x += sz) {
      for (let z = -30; z <= 30; z += sz) {
        const dist = Math.sqrt(x * x + z * z);
        let y = Math.floor(dist / 3) * sz * 1.5;
        // cratera no centro
        y -= 4;
        if (Math.random() > 0.1) {
          s11dPositions.push({ x, y, z });
        }
      }
    }
    const ironMesh = createVoxelCluster(s11dPositions, 0x78350f, sz);
    g0.add(ironMesh);

    // Prédios industriais e estruturas do S11D (estilo Voxel)
    function buildVoxelBuilding(gx, gy, gz, w, h, d, col, parent) {
      const bPos = [];
      const cs = 0.4;
      for (let bx = -w / 2; bx <= w / 2; bx += cs) {
        for (let by = 0; by <= h; by += cs) {
          for (let bz = -d / 2; bz <= d / 2; bz += cs) {
            // Apenas paredes ocas ou cheias
            if (bx === -w / 2 || bx >= w / 2 - cs || bz === -d / 2 || bz >= d / 2 - cs || by >= h - cs) {
              bPos.push({ x: gx + bx, y: gy + by, z: gz + bz });
            }
          }
        }
      }
      parent.add(createVoxelCluster(bPos, col, cs));
    }

    // Usinas de beneficiamento em voxel
    // Usinas substituídas por complexo de mineração realista
    function buildDetailedPlant(parent) {
      const cs = 0.35;
      const siloPositions = [];
      const siloRadius = 3.2;
      const siloHeight = 10;
      [-7, 7].forEach(siloX => {
        for (let y = 0; y <= siloHeight; y += cs) {
          for (let a = 0; a < Math.PI * 2; a += 0.3) {
            const sx = siloX + Math.cos(a) * siloRadius;
            const sz = -12 + Math.sin(a) * siloRadius;
            siloPositions.push({ x: sx, y: y, z: sz });
          }
          if (y >= siloHeight - cs) {
            for (let r = 0; r < siloRadius; r += cs) {
              for (let a = 0; a < Math.PI * 2; a += 0.45) {
                siloPositions.push({ x: siloX + Math.cos(a) * r, y: y + (siloRadius - r) * 0.35, z: -12 + Math.sin(a) * r });
              }
            }
          }
        }
      });
      parent.add(createVoxelCluster(siloPositions, 0xdfe7ec, cs));

      const stripePos = [];
      [-7, 7].forEach(siloX => {
        for (let a = 0; a < Math.PI * 2; a += 0.3) {
          stripePos.push({ x: siloX + Math.cos(a) * (siloRadius + 0.05), y: 4.5, z: -12 + Math.sin(a) * (siloRadius + 0.05) });
          stripePos.push({ x: siloX + Math.cos(a) * (siloRadius + 0.05), y: 7.5, z: -12 + Math.sin(a) * (siloRadius + 0.05) });
        }
      });
      parent.add(createVoxelCluster(stripePos, 0xf59e0b, cs));

      const plantPos = [];
      for (let bx = -4.5; bx <= 4.5; bx += cs) {
        for (let by = 0; by <= 7.5; by += cs) {
          for (let bz = -5; bz <= 5; bz += cs) {
            const isColumn = (Math.abs(bx) >= 4.0 && Math.abs(bz) >= 4.5);
            const isFloor = (Math.abs(by - 0) < 0.2 || Math.abs(by - 3.8) < 0.2 || Math.abs(by - 7.2) < 0.2);
            const isWall = (bz <= -4.6 || (bx >= 4.2 && by > 3.8));
            if (isColumn || isFloor || isWall) {
              plantPos.push({ x: bx, y: by + 0.5, z: bz - 16 });
            }
          }
        }
      }
      parent.add(createVoxelCluster(plantPos, 0x1e3a5f, cs));

      const ventPos = [];
      for (let vy = 7.5; vy <= 13; vy += cs) {
        ventPos.push({ x: -2.5, y: vy + 0.5, z: -16 });
        ventPos.push({ x: 2.5, y: vy + 0.5, z: -16 });
      }
      parent.add(createVoxelCluster(ventPos, 0x64748b, cs));

      const chutePos = [];
      for (let t = 0; t <= 1; t += 0.04) {
        chutePos.push({ x: -4.5 + t * (-2.5), y: 7.0 + t * 2.5, z: -16 + t * 4 });
        chutePos.push({ x: -4.5 + t * (-2.5) + 0.3, y: 7.0 + t * 2.5, z: -16 + t * 4 });
        chutePos.push({ x: 4.5 + t * (2.5), y: 7.0 + t * 2.5, z: -16 + t * 4 });
        chutePos.push({ x: 4.5 + t * (2.5) - 0.3, y: 7.0 + t * 2.5, z: -16 + t * 4 });
      }
      parent.add(createVoxelCluster(chutePos, 0x0284c7, cs));

      const bwePos = [];
      const wheelPos = [];
      for (let lx = 5; lx <= 10; lx += cs) {
        for (let lz = 2; lz <= 5.5; lz += cs) {
          bwePos.push({ x: lx, y: -1.0, z: lz });
          bwePos.push({ x: lx, y: -0.6, z: lz });
        }
      }
      for (let cx = 6.8; cx <= 9.2; cx += cs) {
        for (let cy = -0.4; cy <= 2.2; cy += cs) {
          for (let cz = 3.2; cz <= 4.8; cz += cs) {
            bwePos.push({ x: cx, y: cy, z: cz });
          }
        }
      }
      for (let d = 0; d <= 7; d += cs) {
        const lx = 8 - d * 0.8;
        const ly = 1.8 + d * 0.2;
        const lz = 4.0;
        bwePos.push({ x: lx, y: ly, z: lz });
        bwePos.push({ x: lx, y: ly - 0.3, z: lz });
      }
      parent.add(createVoxelCluster(bwePos, 0xeab308, cs));

    const rx0 = 8 - 7 * 0.8;
    const ry0 = 1.8 + 7 * 0.2;
    const rz0 = 4.0;
    for (let a = 0; a < Math.PI * 2; a += 0.35) {
      const wx = Math.cos(a) * 1.8;
      const wy = Math.sin(a) * 1.8;
      wheelPos.push({ x: wx, y: wy, z: -0.2 });
      wheelPos.push({ x: wx, y: wy, z: 0.2 });
      // pás/caçambas na borda da roda
      wheelPos.push({ x: wx * 1.15, y: wy * 1.15, z: 0 });
    }
    scene0ExcavatorArm = new THREE.Group();
    scene0ExcavatorArm.position.set(rx0, ry0, rz0);
    scene0ExcavatorArm.add(createVoxelCluster(wheelPos, 0x9a3412, cs));
    parent.add(scene0ExcavatorArm);
    }
    buildDetailedPlant(g0);

    // Efeito dinâmico Cena 1: fumaça e poeira industrial subindo da usina
    scene0SmokePuffs = new THREE.Group();
    const sPos = [];
    for (let p = 0; p < 45; p++) {
      sPos.push({
        x: (Math.random() - 0.5) * 3.5,
        y: Math.random() * 8,
        z: -16 + (Math.random() - 0.5) * 3.5
      });
    }
    scene0SmokePuffs.add(createVoxelCluster(sPos, 0x94a3b8, 0.45));
    g0.add(scene0SmokePuffs);

    // Guindastes e torres


    // ==========================================
    // CENA 1: As Esteiras Transportadoras (Truckless)
    // ==========================================
    const g1 = scenesGroup[1];

    // Chão de floresta densa amazônica em micro-voxels
    const forestPos = [];
    for (let x = -35; x <= 35; x += 0.6) {
      for (let z = -35; z <= 35; z += 0.6) {
        const y = Math.sin(x * 0.15) * 1.5 + Math.cos(z * 0.15) * 1.5 - 2;
        forestPos.push({ x, y, z });
      }
    }
    g1.add(createVoxelCluster(forestPos, 0x14532d, 0.6));

    // Árvores de voxel pontilhando a mata
    function buildVoxelTree(tx, tz, h, parent) {
      const tPos = [];
      const cs = 0.35;
      // Tronco
      for (let ty = 0; ty < h; ty += cs) {
        tPos.push({ x: tx, y: ty, z: tz });
      }
      parent.add(createVoxelCluster(tPos, 0x78350f, cs));

      // Copa
      const copaPos = [];
      for (let cx = -1.5; cx <= 1.5; cx += cs) {
        for (let cy = 0; cy <= 2.5; cy += cs) {
          for (let cz = -1.5; cz <= 1.5; cz += cs) {
            if (Math.abs(cx) + Math.abs(cy) + Math.abs(cz) < 3.2) {
              copaPos.push({ x: tx + cx, y: h + cy, z: tz + cz });
            }
          }
        }
      }
      parent.add(createVoxelCluster(copaPos, 0x22c55e, cs));
    }

    for (let i = 0; i < 35; i++) {
      const rx = (Math.random() - 0.5) * 60;
      const rz = (Math.random() - 0.5) * 60;
      if (Math.abs(rx) > 4) { // Deixa a passagem central livre para as esteiras
        buildVoxelTree(rx, rz, 4 + Math.random() * 4, g1);
      }
    }

    // A Esteira Transportadora Elevada (Truckless)
    // ==========================================================
    // ESTEIRA TRANSPORTADORA INDUSTRIAL (Truckless) - alta definição
    // ==========================================================
    conveyorGroup = new THREE.Group();
    const beltPos = [];
    const pylonPos = [];
    const csB = 0.25;
    const BELT_Y = 5.0;
    const BELT_HALF_W = 1.5;
    const Z_START = -52;
    const Z_END = 52;

    // --- 1) Correia (superfície de borracha escura) ---
    for (let z = Z_START; z <= Z_END; z += csB) {
      for (let x = -BELT_HALF_W; x <= BELT_HALF_W; x += csB) {
        beltPos.push({ x, y: BELT_Y, z });
      }
    }
    conveyorGroup.add(createVoxelCluster(beltPos, 0x1f2937, csB));

    // --- 2) Bordas laterais da correia (perfis de aço) ---
    const edgePos = [];
    for (let z = Z_START; z <= Z_END; z += csB) {
      for (let y = BELT_Y + csB; y <= BELT_Y + 0.5; y += csB) {
        edgePos.push({ x: -BELT_HALF_W - csB, y, z });
        edgePos.push({ x: BELT_HALF_W + csB, y, z });
      }
    }
    conveyorGroup.add(createVoxelCluster(edgePos, 0x94a3b8, csB));

    // --- 3) Treliça estrutural (vigas em X sob a correia) ---
    const trussPos = [];
    const TRUSS_TOP = BELT_Y - csB;
    const TRUSS_BOT = BELT_Y - 1.6;
    for (let z = Z_START; z <= Z_END; z += csB) {
      [-BELT_HALF_W - 0.15, BELT_HALF_W + 0.15].forEach(tx => {
        trussPos.push({ x: tx, y: TRUSS_TOP, z });
        trussPos.push({ x: tx, y: TRUSS_BOT, z });
      });
      const seg = Math.floor((z - Z_START) / 1.2);
      const t = ((z - Z_START) % 1.2) / 1.2;
      const diagY = TRUSS_BOT + (TRUSS_TOP - TRUSS_BOT) * (seg % 2 === 0 ? t : 1 - t);
      trussPos.push({ x: -BELT_HALF_W - 0.15, y: diagY, z });
      trussPos.push({ x: BELT_HALF_W + 0.15, y: diagY, z });
      if (Math.abs((z - Z_START) % 1.2) < csB * 0.6) {
        for (let x = -BELT_HALF_W - 0.15; x <= BELT_HALF_W + 0.15; x += csB) {
          trussPos.push({ x, y: TRUSS_BOT, z });
        }
      }
    }
    conveyorGroup.add(createVoxelCluster(trussPos, 0xfacc15, csB));

    // --- 4) Cobertura superior (telhado curvo de proteção) ---
    const roofPos = [];
    for (let z = Z_START; z <= Z_END; z += csB) {
      for (let x = -BELT_HALF_W - 0.6; x <= BELT_HALF_W + 0.6; x += csB) {
        const curve = Math.cos((x / (BELT_HALF_W + 0.6)) * Math.PI * 0.5);
        roofPos.push({ x, y: BELT_Y + 1.5 + curve * 0.45, z });
      }
      if (Math.abs((z - Z_START) % 2.4) < csB * 0.6) {
        for (let a = 0; a <= 1; a += 0.08) {
          const ang = Math.PI * a;
          roofPos.push({
            x: Math.cos(ang) * (BELT_HALF_W + 0.6),
            y: BELT_Y + 1.5 + Math.sin(ang) * 0.45,
            z
          });
        }
      }
    }
    conveyorGroup.add(createVoxelCluster(roofPos, 0x0284c7, csB));

    // --- 5) Cavaletes de apoio (torres treliçadas amarelas) ---
    const pylonCapPos = [];
    for (let z = Z_START + 4; z <= Z_END; z += 8) {
      const groundY = -2.2;
      const topY = TRUSS_BOT;
      for (let y = groundY; y <= topY; y += csB) {
        const spread = 1.9 - ((y - groundY) / (topY - groundY)) * 0.75;
        pylonPos.push({ x: -spread, y, z: z - spread * 0.55 });
        pylonPos.push({ x: spread, y, z: z - spread * 0.55 });
        pylonPos.push({ x: -spread, y, z: z + spread * 0.55 });
        pylonPos.push({ x: spread, y, z: z + spread * 0.55 });
      }
      for (let y = groundY; y <= topY; y += 1.2) {
        const spread = 1.9 - ((y - groundY) / (topY - groundY)) * 0.75;
        for (let x = -spread; x <= spread; x += csB) {
          pylonPos.push({ x, y, z: z - spread * 0.55 });
          pylonPos.push({ x, y, z: z + spread * 0.55 });
        }
        for (let dz = -spread * 0.55; dz <= spread * 0.55; dz += csB) {
          pylonPos.push({ x: -spread, y, z: z + dz });
          pylonPos.push({ x: spread, y, z: z + dz });
        }
      }
      for (let x = -2.4; x <= 2.4; x += csB) {
        for (let dz = -1.6; dz <= 1.6; dz += csB) {
          pylonCapPos.push({ x, y: groundY - csB, z: z + dz });
        }
      }
    }
    conveyorGroup.add(createVoxelCluster(pylonPos, 0xfacc15, csB));
    conveyorGroup.add(createVoxelCluster(pylonCapPos, 0x9ca3af, csB));

    // --- 6) Roletes de retorno visíveis sob a correia ---
    const rollerPos = [];
    for (let z = Z_START; z <= Z_END; z += 1.0) {
      for (let a = 0; a < Math.PI * 2; a += 0.5) {
        rollerPos.push({
          x: Math.cos(a) * 0.22,
          y: TRUSS_TOP - 0.35 + Math.sin(a) * 0.22,
          z
        });
      }
    }
    conveyorGroup.add(createVoxelCluster(rollerPos, 0x64748b, csB));

    // --- 7) Torre de transferência (chute de carga) ---
    const towerPos = [];
    const towerGlass = [];
    const TZ = 26;
    for (let y = -2.2; y <= 12; y += csB) {
      for (let x = -2.6; x <= 2.6; x += csB) {
        for (let z = TZ - 2.6; z <= TZ + 2.6; z += csB) {
          const isEdgeX = Math.abs(Math.abs(x) - 2.6) < csB * 0.6;
          const isEdgeZ = Math.abs(Math.abs(z - TZ) - 2.6) < csB * 0.6;
          const isFloor = Math.abs(y - 4) < csB * 0.6 || Math.abs(y - 8) < csB * 0.6 || Math.abs(y - 12) < csB * 0.6;
          if (isEdgeX || isEdgeZ || isFloor) {
            towerPos.push({ x, y, z });
          }
        }
      }
    }
    for (let y = 4.6; y <= 11.4; y += 1.4) {
      for (let x = -2.0; x <= 2.0; x += 0.7) {
        towerGlass.push({ x, y, z: TZ - 2.65 });
        towerGlass.push({ x, y, z: TZ + 2.65 });
      }
    }
    conveyorGroup.add(createVoxelCluster(towerPos, 0x1e3a5f, csB));
    conveyorGroup.add(createVoxelCluster(towerGlass, 0x7dd3fc, csB));

    // chute inclinado ligando a torre à correia
    const chutePos = [];
    for (let t = 0; t <= 1; t += 0.02) {
      const cy = 12 - t * 7;
      const cz = TZ - 2.6 - t * 3.5;
      for (let dx = -0.9; dx <= 0.9; dx += csB) {
        for (let dz = -0.9; dz <= 0.9; dz += csB) {
          chutePos.push({ x: dx, y: cy + dz, z: cz });
        }
      }
    }
    conveyorGroup.add(createVoxelCluster(chutePos, 0x475569, csB));

    // --- 8) Minério animado correndo sobre a correia ---
    oreBeltGroup = new THREE.Group();
    const orePos = [];
    for (let z = Z_START; z <= Z_END; z += 0.55) {
      for (let i = 0; i < 3; i++) {
        const ox = (Math.random() - 0.5) * (BELT_HALF_W * 1.7);
        const oz = z + (Math.random() - 0.5) * 0.4;
        const oy = BELT_Y + csB * 1.5 + Math.random() * 0.35;
        orePos.push({ x: ox, y: oy, z: oz });
      }
    }
    oreBeltGroup.add(createVoxelCluster(orePos, 0x7c2d12, csB));
    conveyorGroup.add(oreBeltGroup);

    // Nuvem de poeira avermelhada de minério de ferro em movimento rápido sobre a esteira
    scene1DustPuffs = new THREE.Group();
    const dPos = [];
    for (let i = 0; i < 50; i++) {
      dPos.push({
        x: (Math.random() - 0.5) * 2.8,
        y: BELT_Y + 0.8 + Math.random() * 1.8,
        z: Z_START + Math.random() * (Z_END - Z_START)
      });
    }
    scene1DustPuffs.add(createVoxelCluster(dPos, 0xb45309, 0.3));
    g1.add(scene1DustPuffs);

    g1.add(conveyorGroup);

    const _unusedBeltLoop = (function () { /* legacy */
      return 0;
    })();
      // Calha da esteira
      /* legado */

      // Pilares de sustentação a cada 8 metros
      /* legado */
    /* fim do bloco legado */

    // ==========================================
    // CENA 2: O Pátio Ferroviário & O Megatrem
    // ==========================================
    const g2 = scenesGroup[2];

    // Chão de brita ferroviária em micro-voxels
    const gravelPos = [];
    for (let x = -25; x <= 25; x += 0.5) {
      for (let z = -40; z <= 40; z += 0.5) {
        gravelPos.push({ x, y: -0.2, z });
      }
    }
    g2.add(createVoxelCluster(gravelPos, 0x334155, 0.5));

    // Trilhos em voxel
    const railPos = [];
    for (let z = -65; z <= 65; z += 0.3) {
      railPos.push({ x: -1.35, y: 0.2, z: z });
      railPos.push({ x: 1.35, y: 0.2, z: z });
      if (Math.abs(Math.round(z * 2)) % 3 === 0) {
        // Dormentes
        for (let rx = -2.0; rx <= 2.0; rx += 0.4) {
          railPos.push({ x: rx, y: 0.05, z: z });
        }
      }
    }
    g2.add(createVoxelCluster(railPos, 0x94a3b8, 0.3));

    // O Megatrem em Voxel (Locomotivas gigantes + vagões lotados de minério)
    trainGroup = new THREE.Group();

    // ===== LOCOMOTIVA DIESEL-ELÉTRICA DETALHADA (estilo GE/Progress Rail) =====
    function buildDetailedLocomotive(offsetZ, parent) {
      const cs = 0.22;
      const bodyPos = [];      // azul escuro da carroceria
      const stripePos = [];    // faixa amarela diagonal
      const cabinPos = [];     // cabine (azul mais claro)
      const wheelPos = [];     // rodas
      const bogiePos = [];     // truques/bogies
      const lightPos = [];     // janelas e faróis
      const grillPos = [];     // grades de ventilação
      const roofPos = [];      // teto e equipamentos
      const handrailPos = [];  // corrimãos
      const tankPos = [];      // tanque de combustível
      const exhaustPos = [];   // escapamento

      const HALF_W = 1.35;
      const DECK_Y = 0.75;
      const ROOF_Y = 3.05;
      const Z_FRONT = 6.6;
      const Z_BACK = -6.6;

      // --- Truques (bogies) com 3 eixos cada ---
      [-4.3, 3.9].forEach(bz => {
        for (let z = bz - 1.5; z <= bz + 1.5; z += cs) {
          for (let x = -1.15; x <= 1.15; x += cs) {
            bogiePos.push({ x, y: 0.42, z: offsetZ + z });
          }
        }
        [-1.5, 0, 1.5].forEach(wz => {
          [-1.42, 1.42].forEach(wx => {
            for (let a = 0; a < 6.28; a += 0.9) {
              wheelPos.push({
                x: wx + Math.cos(a) * 0.16,
                y: 0.22 + Math.sin(a) * 0.16,
                z: offsetZ + bz + wz
              });
            }
            wheelPos.push({ x: wx, y: 0.22, z: offsetZ + bz + wz });
          });
        });
      });

      // --- Tanque de combustível central sob o chassi ---
      for (let z = -2.6; z <= 2.6; z += cs) {
        for (let x = -1.0; x <= 1.0; x += cs) {
          for (let y = 0.2; y <= 0.62; y += cs) {
            tankPos.push({ x, y, z: offsetZ + z });
          }
        }
      }

      // --- Chassi / deck ---
      for (let z = Z_BACK; z <= Z_FRONT; z += cs) {
        for (let x = -HALF_W; x <= HALF_W; x += cs) {
          bodyPos.push({ x, y: DECK_Y, z: offsetZ + z });
        }
      }

      // --- Corpo do motor (longo hood) com paredes e teto ---
      for (let z = Z_BACK + 0.2; z <= 2.6; z += cs) {
        for (let y = DECK_Y + cs; y <= ROOF_Y - 0.35; y += cs) {
          for (let x = -HALF_W; x <= HALF_W; x += cs) {
            const isWall = Math.abs(x) >= HALF_W - cs * 1.2;
            const isEnd = z <= Z_BACK + 0.5;
            if (isWall || isEnd) {
              bodyPos.push({ x, y, z: offsetZ + z });
            }
          }
        }
        // teto do hood
        for (let x = -HALF_W; x <= HALF_W; x += cs) {
          bodyPos.push({ x, y: ROOF_Y - 0.35, z: offsetZ + z });
        }
      }

      // --- Faixa amarela diagonal na lateral (identidade visual) ---
      for (let z = Z_BACK + 0.4; z <= 2.4; z += cs) {
        const stripeY = DECK_Y + 0.55 + (z - Z_BACK) * 0.06;
        [-HALF_W - cs * 0.4, HALF_W + cs * 0.4].forEach(sx => {
          stripePos.push({ x: sx, y: stripeY, z: offsetZ + z });
          stripePos.push({ x: sx, y: stripeY + cs, z: offsetZ + z });
        });
      }

      // --- Grades de ventilação laterais ---
      for (let z = -5.6; z <= -1.0; z += cs * 2.2) {
        [-HALF_W - cs * 0.5, HALF_W + cs * 0.5].forEach(gx => {
          for (let y = DECK_Y + 0.9; y <= ROOF_Y - 0.7; y += cs) {
            grillPos.push({ x: gx, y, z: offsetZ + z });
          }
        });
      }

      // --- Cabine do maquinista (mais alta, na frente) ---
      const CAB_Z0 = 2.8;
      const CAB_Z1 = 5.4;
      const CAB_TOP = 3.55;
      for (let z = CAB_Z0; z <= CAB_Z1; z += cs) {
        for (let y = DECK_Y + cs; y <= CAB_TOP; y += cs) {
          for (let x = -HALF_W; x <= HALF_W; x += cs) {
            const isWall = Math.abs(x) >= HALF_W - cs * 1.2;
            const isFront = z >= CAB_Z1 - cs * 1.5;
            const isBack = z <= CAB_Z0 + cs;
            const isRoof = y >= CAB_TOP - cs;
            const isWindowSide = isWall && y >= 2.55 && y <= 3.15 && z >= CAB_Z0 + 0.5 && z <= CAB_Z1 - 0.6;
            const isWindowFront = isFront && y >= 2.55 && y <= 3.15 && Math.abs(x) <= HALF_W - 0.35;
            if (isWindowSide || isWindowFront) {
              lightPos.push({ x, y, z: offsetZ + z });
            } else if (isWall || isFront || isBack || isRoof) {
              cabinPos.push({ x, y, z: offsetZ + z });
            }
          }
        }
      }

      // --- Nariz / capô frontal inclinado ---
      for (let z = CAB_Z1 + cs; z <= Z_FRONT; z += cs) {
        const topY = 2.35 - (z - CAB_Z1) * 0.42;
        for (let y = DECK_Y + cs; y <= topY; y += cs) {
          for (let x = -HALF_W + 0.1; x <= HALF_W - 0.1; x += cs) {
            const isShell = Math.abs(x) >= HALF_W - 0.35 || z >= Z_FRONT - cs * 1.5;
            if (isShell) cabinPos.push({ x, y, z: offsetZ + z });
          }
        }
      }

      // --- Faróis frontais e lanternas traseiras ---
      [-0.85, 0.85].forEach(lx => {
        lightPos.push({ x: lx, y: 1.35, z: offsetZ + Z_FRONT + cs });
        lightPos.push({ x: lx, y: 1.6, z: offsetZ + Z_FRONT + cs });
      });
      lightPos.push({ x: 0, y: 3.35, z: offsetZ + CAB_Z1 - 0.2 });
      [-0.9, 0.9].forEach(lx => {
        lightPos.push({ x: lx, y: 1.2, z: offsetZ + Z_BACK - cs });
      });

      // --- Para-choque frontal (plow) ---
      for (let x = -HALF_W; x <= HALF_W; x += cs) {
        bodyPos.push({ x, y: 0.55, z: offsetZ + Z_FRONT + cs * 2 });
        bodyPos.push({ x, y: 0.35, z: offsetZ + Z_FRONT + cs * 3 });
      }

      // --- Corrimãos verticais nas laterais ---
      [-HALF_W - cs, HALF_W + cs].forEach(hx => {
        [CAB_Z0 + 0.3, CAB_Z1 - 0.3, Z_BACK + 0.6].forEach(hz => {
          for (let y = DECK_Y + 0.2; y <= CAB_TOP - 0.2; y += cs) {
            handrailPos.push({ x: hx, y, z: offsetZ + hz });
          }
        });
      });

      // --- Equipamentos de teto: escapamento, ventiladores, buzina ---
      for (let z = -4.5; z <= -3.5; z += cs) {
        for (let x = -0.35; x <= 0.35; x += cs) {
          exhaustPos.push({ x, y: ROOF_Y - 0.1, z: offsetZ + z });
          exhaustPos.push({ x, y: ROOF_Y + 0.1, z: offsetZ + z });
        }
      }
      [-2.2, 0.4].forEach(fz => {
        for (let x = -0.7; x <= 0.7; x += cs) {
          roofPos.push({ x, y: ROOF_Y - 0.15, z: offsetZ + fz });
        }
      });
      roofPos.push({ x: 0.6, y: CAB_TOP + 0.15, z: offsetZ + CAB_Z0 + 0.6 });
      roofPos.push({ x: 0.6, y: CAB_TOP + 0.3, z: offsetZ + CAB_Z0 + 0.6 });

      parent.add(createVoxelCluster(bodyPos, 0x1d4ed8, cs));
      parent.add(createVoxelCluster(cabinPos, 0x2563eb, cs));
      parent.add(createVoxelCluster(stripePos, 0xfacc15, cs));
      parent.add(createVoxelCluster(wheelPos, 0x111827, cs));
      parent.add(createVoxelCluster(bogiePos, 0x334155, cs));
      parent.add(createVoxelCluster(tankPos, 0x475569, cs));
      parent.add(createVoxelCluster(grillPos, 0x0f172a, cs));
      parent.add(createVoxelCluster(roofPos, 0x64748b, cs));
      parent.add(createVoxelCluster(handrailPos, 0xf8fafc, cs));
      parent.add(createVoxelCluster(exhaustPos, 0x1f2937, cs));
      parent.add(createVoxelCluster(lightPos, 0xfef9c3, cs));

      // Pluma de fumaça e vapor de exaustão da locomotiva em movimento
      if (!scene2SmokePuff) {
        scene2SmokePuff = new THREE.Group();
        const smk = [];
        for (let i = 0; i < 24; i++) {
          smk.push({
            x: (Math.random() - 0.5) * 0.8,
            y: ROOF_Y + 0.4 + Math.random() * 2.2,
            z: offsetZ - 4.0 - Math.random() * 4.0
          });
        }
        scene2SmokePuff.add(createVoxelCluster(smk, 0xd1d5db, 0.28));
        parent.add(scene2SmokePuff);
      }
    }

    function buildDetailedOreWagon(offsetZ, parent) {
      const cs = 0.28;
      const wagBody = [];
      const wagWheels = [];
      const oreGrains = [];
      const coupling = [];

      for (let ez = -5.6; ez <= -4.9; ez += cs) coupling.push({ x: 0, y: 0.45, z: offsetZ + ez });
      for (let ez = 4.9; ez <= 5.6; ez += cs) coupling.push({ x: 0, y: 0.45, z: offsetZ + ez });

      [-4.0, -3.2, 3.2, 4.0].forEach(wz => {
        [-1.3, 1.3].forEach(wx => {
          wagWheels.push({ x: wx, y: 0.15, z: offsetZ + wz });
          wagWheels.push({ x: wx, y: 0.35, z: offsetZ + wz });
        });
      });

      for (let z = -4.8; z <= 4.8; z += cs) {
        for (let x = -1.25; x <= 1.25; x += cs) {
          wagBody.push({ x, y: 0.4, z: offsetZ + z });
        }
      }

      for (let z = -4.8; z <= 4.8; z += cs) {
        for (let y = 0.65; y <= 2.4; y += cs) {
          for (let x = -1.25; x <= 1.25; x += cs) {
            const isWall = (Math.abs(x) >= 1.05 || Math.abs(z) >= 4.6);
            if (isWall) {
              wagBody.push({ x, y, z: offsetZ + z });
            }
          }
        }
      }

      for (let z = -4.2; z <= 4.2; z += cs) {
        for (let x = -0.9; x <= 0.9; x += cs) {
          const oreHeight = 2.55 - (Math.abs(x) * 0.45) - (Math.abs(Math.sin(z * 0.8)) * 0.2);
          for (let oy = 1.0; oy <= oreHeight; oy += cs) {
            oreGrains.push({ x, y: oy, z: offsetZ + z });
          }
        }
      }

      parent.add(createVoxelCluster(wagBody, 0x475569, cs));
      parent.add(createVoxelCluster(wagWheels, 0x0f172a, cs));
      parent.add(createVoxelCluster(coupling, 0x94a3b8, cs));
      parent.add(createVoxelCluster(oreGrains, 0x6c2417, cs));
    }


    // Locomotiva líder
    buildDetailedLocomotive(0.5, trainGroup);
    // Comboio de vagões de minério em sequência contínua
    for (let w = 0; w < 5; w++) {
      buildDetailedOreWagon(-12 - (w * 11), trainGroup);
    }
    g2.add(trainGroup);

    // Postes de catenária (rede elétrica) ao longo da ferrovia
    const catenaryPos = [];
    const catenaryWire = [];
    for (let pz = -50; pz <= 50; pz += 10) {
      [-3.4, 3.4].forEach(px => {
        for (let py = 0; py <= 6.5; py += 0.4) {
          catenaryPos.push({ x: px, y: py, z: pz });
        }
        for (let ax = -3.4; ax <= 3.4; ax += 0.4) {
          catenaryPos.push({ x: ax, y: 6.5, z: pz });
        }
      });
      for (let wz = pz; wz <= pz + 10; wz += 0.4) {
        catenaryWire.push({ x: 0, y: 6.1, z: wz });
      }
    }
    g2.add(createVoxelCluster(catenaryPos, 0x64748b, 0.4));
    g2.add(createVoxelCluster(catenaryWire, 0x1f2937, 0.4));

    // Vegetação e rochas ladeando a ferrovia
    const sideGround = [];
    for (let x = -25; x <= 25; x += 0.8) {
      for (let z = -50; z <= 50; z += 0.8) {
        if (Math.abs(x) > 4.5) {
          sideGround.push({ x, y: -0.35, z });
        }
      }
    }
    g2.add(createVoxelCluster(sideGround, 0x166534, 0.8));

    // Árvores voxel nas margens do pátio ferroviário
    function buildSideTree(tx, tz, h, parent) {
      const trunk = [];
      const leaf = [];
      const tcs = 0.4;
      for (let ty = 0; ty < h; ty += tcs) trunk.push({ x: tx, y: ty, z: tz });
      for (let cx = -1.2; cx <= 1.2; cx += tcs) {
        for (let cy = 0; cy <= 2.2; cy += tcs) {
          for (let cz = -1.2; cz <= 1.2; cz += tcs) {
            if (Math.abs(cx) + Math.abs(cy) + Math.abs(cz) < 2.6) {
              leaf.push({ x: tx + cx, y: h + cy, z: tz + cz });
            }
          }
        }
      }
      parent.add(createVoxelCluster(trunk, 0x78350f, tcs));
      parent.add(createVoxelCluster(leaf, 0x15803d, tcs));
    }
    for (let i = 0; i < 26; i++) {
      const tx = (Math.random() > 0.5 ? 1 : -1) * (7 + Math.random() * 14);
      const tz = (Math.random() - 0.5) * 90;
      buildSideTree(tx, tz, 3 + Math.random() * 3, g2);
    }

    // Silos de carregamento no topo


    // ==========================================
    // CENA 3: A Serpente de Ferro Cortando a Amazônia
    // ==========================================
    const g3 = scenesGroup[3];

    // Grande vale panorâmico em micro-voxels
    const landscapePos = [];
    for (let x = -50; x <= 50; x += 1.0) {
      for (let z = -50; z <= 50; z += 1.0) {
        const hill = Math.sin(x * 0.08) * 6 + Math.cos(z * 0.08) * 6;
        landscapePos.push({ x, y: hill - 8, z });
      }
    }
    g3.add(createVoxelCluster(landscapePos, 0x166534, 1.0));

    // Ponte/Viaduto ferroviário em curva voxel
    const bridgePos = [];
    for (let t = -45; t <= 45; t += 0.5) {
      const bx = Math.sin(t * 0.05) * 15;
      const by = 2;
      const bz = t;
      bridgePos.push({ x: bx, y: by, z: bz });
      // Pilares do viaduto
      if (Math.abs(Math.round(t)) % 10 === 0) {
        for (let py = -8; py <= 2; py += 0.5) {
          bridgePos.push({ x: bx, y: py, z: bz });
        }
      }
    }
    g3.add(createVoxelCluster(bridgePos, 0xe2e8f0, 0.5));

    // Miniatura do megatrem serpenteando pela ponte
    // ── Curva do traçado ferroviário (mesma função para trilho, viaduto e trem) ──
    const railX = (t) => Math.sin(t * 0.045) * 16 + Math.sin(t * 0.11) * 3.5;
    const RAIL_Y = 3.2;
    const VALLEY_Y = -9.5;

    // ── Vale amazônico em micro-voxels (relevo suave + rio) ──
    const valleyPos = [];
    const valleyDark = [];
    const riverPos = [];
    for (let x = -60; x <= 60; x += 0.8) {
      for (let z = -60; z <= 60; z += 0.8) {
        const hill = Math.sin(x * 0.07) * 5.5 + Math.cos(z * 0.06) * 5.5
                   + Math.sin((x + z) * 0.13) * 1.8;
        const y = VALLEY_Y + hill;
        const riverCenter = Math.sin(z * 0.06) * 14;
        if (Math.abs(x - riverCenter) < 3.2 && y < VALLEY_Y + 1.5) {
          riverPos.push({ x, y: VALLEY_Y + 0.4, z });
        } else if (hill > 2.5) {
          valleyDark.push({ x, y, z });
        } else {
          valleyPos.push({ x, y, z });
        }
      }
    }
    g3.add(createVoxelCluster(valleyPos, 0x15803d, 0.8));
    g3.add(createVoxelCluster(valleyDark, 0x14532d, 0.8));
    g3.add(createVoxelCluster(riverPos, 0x38bdf8, 0.8));

    // ── Floresta densa cobrindo o vale ──
    function buildValleyTree(tx, tz, h, parent) {
      const cs = 0.3;
      const hill = Math.sin(tx * 0.07) * 5.5 + Math.cos(tz * 0.06) * 5.5
                 + Math.sin((tx + tz) * 0.13) * 1.8;
      const baseY = VALLEY_Y + hill;
      const trunk = [];
      for (let ty = 0; ty < h; ty += cs) trunk.push({ x: tx, y: baseY + ty, z: tz });
      parent.add(createVoxelCluster(trunk, 0x78350f, cs));

      const copa = [];
      const r = 1.1 + h * 0.12;
      for (let cx = -r; cx <= r; cx += cs) {
        for (let cy = 0; cy <= r * 1.7; cy += cs) {
          for (let cz = -r; cz <= r; cz += cs) {
            if (Math.abs(cx) + Math.abs(cy * 0.8) + Math.abs(cz) < r * 2.1) {
              copa.push({ x: tx + cx, y: baseY + h + cy, z: tz + cz });
            }
          }
        }
      }
      parent.add(createVoxelCluster(copa, h > 5 ? 0x166534 : 0x22c55e, cs));
    }
    for (let i = 0; i < 150; i++) {
      const tx = (Math.random() - 0.5) * 110;
      const tz = (Math.random() - 0.5) * 110;
      if (Math.abs(tx - railX(tz)) < 7) continue;
      buildValleyTree(tx, tz, 3 + Math.random() * 4.5, g3);
    }

    // ── Viaduto: laje, tabuleiro, guarda-corpo e pilares em V ──
    const deckPos = [];
    const slabPos = [];
    const guardPos = [];
    const pillarPos = [];
    const pillarCapPos = [];
    const DECK_HALF = 2.6;
    for (let t = -58; t <= 58; t += 0.4) {
      const bx = railX(t);
      for (let dx = -DECK_HALF; dx <= DECK_HALF; dx += 0.4) {
        slabPos.push({ x: bx + dx, y: RAIL_Y - 0.55, z: t });
      }
      for (let dx = -DECK_HALF + 0.4; dx <= DECK_HALF - 0.4; dx += 0.4) {
        deckPos.push({ x: bx + dx, y: RAIL_Y - 0.15, z: t });
      }
      [-DECK_HALF, DECK_HALF].forEach(gx => {
        for (let gy = RAIL_Y; gy <= RAIL_Y + 0.9; gy += 0.3) {
          guardPos.push({ x: bx + gx, y: gy, z: t });
        }
      });
    }
    for (let t = -54; t <= 54; t += 12) {
      const bx = railX(t);
      const groundY = VALLEY_Y + Math.sin(bx * 0.07) * 5.5 + Math.cos(t * 0.06) * 5.5;
      for (let py = groundY; py <= RAIL_Y - 0.6; py += 0.4) {
        const spread = 2.0 - ((py - groundY) / Math.max(1, RAIL_Y - groundY)) * 1.1;
        pillarPos.push({ x: bx - spread, y: py, z: t });
        pillarPos.push({ x: bx + spread, y: py, z: t });
      }
      for (let dx = -2.0; dx <= 2.0; dx += 0.4) {
        pillarCapPos.push({ x: bx + dx, y: RAIL_Y - 0.75, z: t });
      }
    }
    g3.add(createVoxelCluster(slabPos, 0xcbd5e1, 0.4));
    g3.add(createVoxelCluster(deckPos, 0xe2e8f0, 0.4));
    g3.add(createVoxelCluster(guardPos, 0xf1f5f9, 0.3));
    g3.add(createVoxelCluster(pillarPos, 0x94a3b8, 0.4));
    g3.add(createVoxelCluster(pillarCapPos, 0x64748b, 0.4));

    // ── Trilhos de aço e dormentes sobre o tabuleiro ──
    const steelPos = [];
    const sleeperPos = [];
    for (let t = -58; t <= 58; t += 0.35) {
      const bx = railX(t);
      [-0.85, 0.85].forEach(rx => {
        steelPos.push({ x: bx + rx, y: RAIL_Y + 0.1, z: t });
      });
      if (Math.abs(t % 1.4) < 0.2) {
        for (let dx = -1.1; dx <= 1.1; dx += 0.35) {
          sleeperPos.push({ x: bx + dx, y: RAIL_Y + 0.02, z: t });
        }
      }
    }
    g3.add(createVoxelCluster(steelPos, 0x475569, 0.3));
    g3.add(createVoxelCluster(sleeperPos, 0x78350f, 0.3));

    // ── O megatrem serpenteando o viaduto (locomotiva + vagões de minério) ──
    const snakeTrain = new THREE.Group();
    const trainBodyPos = [];
    const trainStripePos = [];
    const trainWheelPos = [];
    const trainOrePos = [];
    const trainGlassPos = [];
    const TRAIN_Z0 = -46;
    const TRAIN_Z1 = 30;
    for (let t = TRAIN_Z0; t <= TRAIN_Z1; t += 0.3) {
      const bx = railX(t);
      const isLoco = t >= TRAIN_Z1 - 9;
      const isGap = ((t - TRAIN_Z0) % 9.5) > 8.6;
      if (isGap) continue;
      const halfW = isLoco ? 1.25 : 1.15;
      const topY = isLoco ? RAIL_Y + 3.0 : RAIL_Y + 2.3;
      for (let dx = -halfW; dx <= halfW; dx += 0.3) {
        for (let dy = RAIL_Y + 0.35; dy <= topY; dy += 0.3) {
          const isShell = Math.abs(dx) >= halfW - 0.35 || dy >= topY - 0.3;
          if (isShell) trainBodyPos.push({ x: bx + dx, y: dy, z: t });
        }
      }
      if (isLoco) {
        [-halfW - 0.1, halfW + 0.1].forEach(sx => {
          trainStripePos.push({ x: bx + sx, y: RAIL_Y + 1.1, z: t });
          trainStripePos.push({ x: bx + sx, y: RAIL_Y + 1.4, z: t });
        });
        if (t > TRAIN_Z1 - 4) {
          [-halfW - 0.1, halfW + 0.1].forEach(sx => {
            trainGlassPos.push({ x: bx + sx, y: RAIL_Y + 2.2, z: t });
          });
        }
      } else {
        for (let dx = -0.85; dx <= 0.85; dx += 0.3) {
          const oh = RAIL_Y + 2.0 - Math.abs(dx) * 0.35;
          for (let dy = RAIL_Y + 0.6; dy <= oh; dy += 0.3) {
            trainOrePos.push({ x: bx + dx, y: dy, z: t });
          }
        }
      }
      if (Math.abs(t % 2.2) < 0.25) {
        [-halfW, halfW].forEach(wx => {
          trainWheelPos.push({ x: bx + wx, y: RAIL_Y + 0.2, z: t });
        });
      }
    }
    snakeTrain.add(createVoxelCluster(trainBodyPos, 0x1d4ed8, 0.3));
    snakeTrain.add(createVoxelCluster(trainStripePos, 0xfacc15, 0.3));
    snakeTrain.add(createVoxelCluster(trainGlassPos, 0xfef9c3, 0.3));
    snakeTrain.add(createVoxelCluster(trainOrePos, 0x7c2d12, 0.3));
    snakeTrain.add(createVoxelCluster(trainWheelPos, 0x111827, 0.3));
    scene3TrainObj = snakeTrain;
    g3.add(snakeTrain);

    // ── Névoa de vale: nuvens baixas em voxels brancos ──
    const mistPos = [];
    for (let i = 0; i < 900; i++) {
      const mx = (Math.random() - 0.5) * 110;
      const mz = (Math.random() - 0.5) * 110;
      const my = VALLEY_Y + 2 + Math.random() * 3;
      mistPos.push({ x: mx, y: my, z: mz });
    }
    scene3MistPuffs = new THREE.Group();
    scene3MistPuffs.add(createVoxelCluster(mistPos, 0xffffff, 0.5));
    g3.add(scene3MistPuffs);


    // ══════════════════════════════════════════════════════════════
    // CENA 5 — A TERRA PROMETIDA (assentamento dos colonos, anos 80)
    // ══════════════════════════════════════════════════════════════
    const g4 = scenesGroup[4];

    // Chão de terra batida vermelha (estrada de picada na mata)
    const dirtPos = [];
    for (let x = -30; x <= 30; x += 0.6) {
      for (let z = -30; z <= 30; z += 0.6) {
        const bump = Math.sin(x * 0.4) * 0.12 + Math.cos(z * 0.35) * 0.12;
        dirtPos.push({ x, y: -0.6 + bump, z });
      }
    }
    g4.add(createVoxelCluster(dirtPos, 0x8b5a2b, 0.6));

    // Estrada de terra clara cruzando o assentamento
    const roadPos = [];
    for (let z = -30; z <= 30; z += 0.5) {
      for (let x = -2.6; x <= 2.6; x += 0.5) {
        roadPos.push({ x, y: -0.45, z });
      }
    }
    g4.add(createVoxelCluster(roadPos, 0xc9a06a, 0.5));

    // Casas rústicas dos pioneiros de Canaã (tábuas de madeira, pau-a-pique, telhas de barro/palha, portas de tábuas e janelas simples)
    function buildColonoHouse(hx, hz, rot, parent) {
      const cs = 0.25;
      const wallPlanks = [];   // Madeira rústica / pau-a-pique
      const baseStone = [];    // Alicerce de pedra rústica
      const roofTiles = [];    // Telhas rústicas de barro / palha
      const doorWood = [];     // Porta de tábuas de madeira com travessa
      const doorFrame = [];    // Batente de madeira escura
      const winShutters = [];  // Janelas com venezianas/postigo de madeira simples
      const winOpenings = [];  // Abertura interna da janela (sombra rústica)
      const porchPosts = [];   // Pilares rústicos da varandinha dos pioneiros
      const roofBeams = [];    // Caibros expostos no beiral
      const chimney = [];      // Chaminé de barro do fogão a lenha

      const W = 3.8, D = 3.6, H = 2.4;
      const halfW = W / 2, halfD = D / 2;

      // Alicerce baixo de pedra rústica (proteção contra lama amazônica)
      for (let x = -halfW; x <= halfW; x += cs) {
        for (let z = -halfD; z <= halfD; z += cs) {
          const isEdge = Math.abs(x) >= halfW - cs || Math.abs(z) >= halfD - cs;
          if (isEdge) {
            baseStone.push({ x: hx + x, y: -0.4, z: hz + z });
            baseStone.push({ x: hx + x, y: -0.2, z: hz + z });
          }
        }
      }

      // Paredes de tábuas de madeira rústica com aberturas precisas
      for (let y = 0.0; y <= H; y += cs) {
        for (let x = -halfW; x <= halfW; x += cs) {
          for (let z = -halfD; z <= halfD; z += cs) {
            const isFront = z >= halfD - cs;
            const isBack = z <= -halfD + cs;
            const isSide = Math.abs(x) >= halfW - cs;
            if (!isFront && !isBack && !isSide) continue;

            // Aberturas na frente: Porta de tábua (x entre -0.4 e 0.4, y <= 1.8)
            const isFrontDoor = isFront && Math.abs(x) <= 0.45 && y <= 1.85;
            const isFrontDoorFrame = isFront && (Math.abs(Math.abs(x) - 0.5) < 0.15 && y <= 1.95 || Math.abs(x) <= 0.5 && Math.abs(y - 1.9) < 0.15);
            // Janela frontal direita (x entre 1.0 e 1.6, y entre 0.9 e 1.7)
            const isFrontWin = isFront && x >= 0.9 && x <= 1.6 && y >= 0.9 && y <= 1.7;
            const isFrontWinFrame = isFront && (Math.abs(x - 0.8) < 0.15 || Math.abs(x - 1.7) < 0.15) && y >= 0.85 && y <= 1.75;
            // Janela lateral esquerda (z entre -0.4 e 0.4, x <= -halfW + cs, y entre 0.9 e 1.7)
            const isSideWin = isSide && x < 0 && Math.abs(z) <= 0.5 && y >= 0.9 && y <= 1.7;
            const isSideWinFrame = isSide && x < 0 && (Math.abs(Math.abs(z) - 0.6) < 0.15 && y >= 0.85 && y <= 1.75);

            if (isFrontDoor) {
              // Porta de madeira rústica com puxador simples
              doorWood.push({ x: hx + x, y: y - 0.2, z: hz + z + 0.04 });
              if (Math.abs(x - 0.25) < 0.12 && Math.abs(y - 0.9) < 0.12) {
                doorFrame.push({ x: hx + x, y: y - 0.2, z: hz + z + 0.1 });
              }
            } else if (isFrontDoorFrame) {
              doorFrame.push({ x: hx + x, y: y - 0.2, z: hz + z + 0.05 });
            } else if (isFrontWin) {
              // Postigo / veneziana de madeira semiaberta
              winShutters.push({ x: hx + x + 0.08, y: y - 0.2, z: hz + z + 0.08 });
              winOpenings.push({ x: hx + x, y: y - 0.2, z: hz + z });
            } else if (isFrontWinFrame) {
              doorFrame.push({ x: hx + x, y: y - 0.2, z: hz + z + 0.05 });
            } else if (isSideWin) {
              winShutters.push({ x: hx + x - 0.08, y: y - 0.2, z: hz + z });
              winOpenings.push({ x: hx + x, y: y - 0.2, z: hz + z });
            } else if (isSideWinFrame) {
              doorFrame.push({ x: hx + x - 0.05, y: y - 0.2, z: hz + z });
            } else {
              wallPlanks.push({ x: hx + x, y: y - 0.2, z: hz + z });
            }
          }
        }
      }

      // Caibros de sustentação do telhado (beiral)
      for (let z = -halfD - 0.4; z <= halfD + 0.6; z += 0.8) {
        roofBeams.push({ x: hx - halfW - 0.15, y: H - 0.3, z: hz + z });
        roofBeams.push({ x: hx + halfW + 0.15, y: H - 0.3, z: hz + z });
      }

      // Varandinha frontal com pilares de tronco rústico
      [-halfW + 0.2, halfW - 0.2].forEach(px => {
        for (let py = -0.2; py <= H - 0.4; py += cs) {
          porchPosts.push({ x: hx + px, y: py, z: hz + halfD + 0.8 });
        }
      });

      // Telhado rústico de duas águas cobrindo a casa e avançando sobre a varanda
      const roofOverhangX = halfW + 0.45;
      for (let x = -roofOverhangX; x <= roofOverhangX; x += cs) {
        for (let z = -halfD - 0.45; z <= halfD + 0.95; z += cs) {
          const ridgeDist = Math.abs(x) / roofOverhangX;
          const ridgeY = (H - 0.2) + (1.0 - ridgeDist) * 1.25;
          roofTiles.push({ x: hx + x, y: ridgeY, z: hz + z });
          // Camada dupla na crista do telhado
          if (Math.abs(x) < cs * 1.5) {
            roofTiles.push({ x: hx + x, y: ridgeY + 0.15, z: hz + z });
          }
        }
      }

      // Chaminé de barro/argila do fogão caipira no fundo
      for (let cy = H; cy <= H + 1.2; cy += cs) {
        chimney.push({ x: hx - halfW * 0.5, y: cy, z: hz - halfD * 0.5 });
      }

      parent.add(createVoxelCluster(baseStone, 0x64748b, cs));
      parent.add(createVoxelCluster(wallPlanks, 0x9a6538, cs));
      parent.add(createVoxelCluster(roofTiles, 0xb45309, cs));
      parent.add(createVoxelCluster(doorWood, 0x5a3014, cs));
      parent.add(createVoxelCluster(doorFrame, 0x3d200d, cs));
      parent.add(createVoxelCluster(winShutters, 0x6c3e1e, cs));
      parent.add(createVoxelCluster(winOpenings, 0x1c1917, cs));
      parent.add(createVoxelCluster(porchPosts, 0x523219, cs));
      parent.add(createVoxelCluster(roofBeams, 0x45230c, cs));
      parent.add(createVoxelCluster(chimney, 0x7c2d12, cs));
    }

    buildColonoHouse(-8, -6, 0, g4);
    buildColonoHouse(8, -8, 0, g4);
    buildColonoHouse(-9, 7, 0, g4);
    buildColonoHouse(9, 6, 0, g4);
    buildColonoHouse(-11, -16, 0, g4);
    buildColonoHouse(10, -18, 0, g4);

    // Cerca de madeira ao longo da estrada
    const fencePos = [];
    for (let z = -26; z <= 26; z += 0.4) {
      [-4.2, 4.2].forEach(fx => {
        fencePos.push({ x: fx, y: 0.1, z });
        fencePos.push({ x: fx, y: 0.7, z });
      });
    }
    for (let z = -26; z <= 26; z += 3) {
      [-4.2, 4.2].forEach(fx => {
        for (let y = -0.4; y <= 1.0; y += 0.35) fencePos.push({ x: fx, y, z });
      });
    }
    g4.add(createVoxelCluster(fencePos, 0x7a5230, 0.4));

    // Mata densa ao redor do assentamento
    function buildJungleTree(tx, tz, h, parent) {
      const trunk = [];
      const leaf = [];
      const tcs = 0.45;
      for (let ty = -0.4; ty < h; ty += tcs) trunk.push({ x: tx, y: ty, z: tz });
      for (let cx = -1.8; cx <= 1.8; cx += tcs) {
        for (let cy = 0; cy <= 3.0; cy += tcs) {
          for (let cz = -1.8; cz <= 1.8; cz += tcs) {
            if (Math.abs(cx) + Math.abs(cy) + Math.abs(cz) < 3.4) {
              leaf.push({ x: tx + cx, y: h + cy, z: tz + cz });
            }
          }
        }
      }
      parent.add(createVoxelCluster(trunk, 0x6b4423, tcs));
      parent.add(createVoxelCluster(leaf, 0x2f8f4e, tcs));
    }
    for (let i = 0; i < 30; i++) {
      const tx = (Math.random() > 0.5 ? 1 : -1) * (13 + Math.random() * 16);
      const tz = (Math.random() - 0.5) * 56;
      buildJungleTree(tx, tz, 4 + Math.random() * 4, g4);
    }

    // Carroça de boi / caminhãozinho antigo dos colonos
    const cartPos = [];
    const cartWheel = [];
    for (let x = -1.2; x <= 1.2; x += 0.3) {
      for (let z = -2.0; z <= 2.0; z += 0.3) {
        cartPos.push({ x: x + 1.5, y: 0.5, z: z + 2 });
      }
    }
    for (let z = -1.8; z <= 1.8; z += 0.3) {
      [-1.3, 1.3].forEach(wx => {
        for (let a = 0; a < 6.28; a += 0.7) {
          cartWheel.push({ x: wx + 1.5 + Math.cos(a) * 0.45, y: 0.15 + Math.sin(a) * 0.45, z: z + 2 });
        }
      });
    }
    g4.add(createVoxelCluster(cartPos, 0x8a5a2b, 0.3));
    g4.add(createVoxelCluster(cartWheel, 0x3b2a1a, 0.3));

    // Placa "TERRA PROMETIDA" (poste + placa)
    const signPost = [];
    for (let y = -0.4; y <= 2.2; y += 0.3) signPost.push({ x: -4.6, y, z: 10 });
    g4.add(createVoxelCluster(signPost, 0x6b4423, 0.3));
    const signBoard = [];
    for (let x = -5.6; x <= -3.6; x += 0.25) {
      for (let y = 1.7; y <= 2.5; y += 0.25) signBoard.push({ x, y, z: 10 });
    }
    g4.add(createVoxelCluster(signBoard, 0xf2e2b8, 0.25));

    // ── Detalhes Adicionais da Cena 5 (Assentamento Histórico CEDERE II) ──

    // 1. Postes rústicos de madeira com fiação aérea e isoladores
    const postPositions = [
      { x: -4.8, z: 18 },
      { x: -4.8, z: 0 },
      { x: -4.8, z: -18 },
      { x: 4.8, z: 12 },
      { x: 4.8, z: -8 }
    ];
    const postVoxels = [];
    const wireVoxels = [];
    postPositions.forEach(p => {
      // Poste vertical
      for (let y = -0.4; y <= 4.2; y += 0.3) {
        postVoxels.push({ x: p.x, y, z: p.z });
      }
      // Cruzeta horizontal no topo
      for (let cx = -0.6; cx <= 0.6; cx += 0.2) {
        postVoxels.push({ x: p.x + cx, y: 4.0, z: p.z });
      }
      // Isoladores de cerâmica no topo
      wireVoxels.push({ x: p.x - 0.5, y: 4.2, z: p.z });
      wireVoxels.push({ x: p.x + 0.5, y: 4.2, z: p.z });
    });
    // Fios esticados entre postes do lado esquerdo
    for (let z = -18; z <= 18; z += 0.4) {
      const sag = Math.sin((z + 18) / 36 * Math.PI * 2) * 0.3;
      wireVoxels.push({ x: -4.8, y: 3.9 - Math.abs(sag), z });
    }
    g4.add(createVoxelCluster(postVoxels, 0x5a3e26, 0.28));
    g4.add(createVoxelCluster(wireVoxels, 0x111111, 0.15));

    // 2. Poço d'água comunitário com manivela e balde
    const wellVoxels = [];
    const wellRoofVoxels = [];
    const wx = -6.5, wz = 3.5;
    // Base de pedra circular do poço
    for (let a = 0; a < 6.28; a += 0.35) {
      for (let y = -0.2; y <= 0.8; y += 0.25) {
        wellVoxels.push({ x: wx + Math.cos(a) * 0.9, y, z: wz + Math.sin(a) * 0.9 });
      }
    }
    // Pilares de madeira da cobertura do poço
    [-0.8, 0.8].forEach(px => {
      for (let y = 0.8; y <= 2.2; y += 0.25) {
        wellRoofVoxels.push({ x: wx + px, y, z: wz });
      }
    });
    // Telhado de duas águas do poço
    for (let x = -1.1; x <= 1.1; x += 0.25) {
      for (let z = -0.7; z <= 0.7; z += 0.25) {
        const h = 2.4 - Math.abs(z) * 0.5;
        wellRoofVoxels.push({ x: wx + x, y: h, z: wz + z });
      }
    }
    g4.add(createVoxelCluster(wellVoxels, 0x7c7d78, 0.25));
    g4.add(createVoxelCluster(wellRoofVoxels, 0x8e4a30, 0.25));

    // 3. Fogueira / fogão a lenha rústico dos colonos
    const fireStones = [];
    const fx0 = 6.2, fz0 = -3.0;
    for (let a = 0; a < 6.28; a += 0.6) {
      fireStones.push({ x: fx0 + Math.cos(a) * 0.6, y: -0.2, z: fz0 + Math.sin(a) * 0.6 });
    }
    g4.add(createVoxelCluster(fireStones, 0x444444, 0.25));
    // Brasas incandescentes e cinzas
    const embers = [
      { x: fx0, y: -0.15, z: fz0 },
      { x: fx0 + 0.15, y: -0.1, z: fz0 - 0.1 },
      { x: fx0 - 0.15, y: -0.1, z: fz0 + 0.1 }
    ];
    g4.add(createVoxelCluster(embers, 0xef4444, 0.22));

    // Fogueira dinâmica com labaredas oscilantes e fumaça
    scene4CampfireFlames = new THREE.Group();
    const flm = [
      { x: fx0, y: 0.1, z: fz0 },
      { x: fx0 + 0.08, y: 0.25, z: fz0 },
      { x: fx0 - 0.08, y: 0.2, z: fz0 + 0.06 },
      { x: fx0, y: 0.45, z: fz0 - 0.05 }
    ];
    scene4CampfireFlames.add(createVoxelCluster(flm, 0xf59e0b, 0.18));
    g4.add(scene4CampfireFlames);

    // 4. Pilhas de toras de madeira cortadas (desbravamento)
    const logs = [];
    const lx0 = -7.5, lz0 = -2.5;
    for (let layer = 0; layer < 3; layer++) {
      const count = 4 - layer;
      for (let i = 0; i < count; i++) {
        const lx = lx0 + i * 0.45 + layer * 0.22;
        const ly = -0.2 + layer * 0.35;
        for (let z = -1.2; z <= 1.2; z += 0.3) {
          logs.push({ x: lx, y: ly, z: lz0 + z });
        }
      }
    }
    g4.add(createVoxelCluster(logs, 0x6e4726, 0.25));

    // 5. Canteiros de horta e plantações dos pioneiros
    const crops = [];
    for (let x = 6.5; x <= 10.5; x += 0.4) {
      for (let z = 2.0; z <= 8.0; z += 0.5) {
        crops.push({ x, y: -0.1 + (Math.sin(x * 4 + z * 3) * 0.1), z });
      }
    }
    g4.add(createVoxelCluster(crops, 0x3d7a28, 0.3));

    // 6. Varal de roupas típico dos colonos com peças coloridas
    const clothesVoxels = [];
    const vlz1 = -10, vlz2 = -6, vlx = -7.0;
    for (let y = -0.4; y <= 1.8; y += 0.25) {
      clothesVoxels.push({ x: vlx, y, z: vlz1 });
      clothesVoxels.push({ x: vlx, y, z: vlz2 });
    }
    for (let z = vlz1; z <= vlz2; z += 0.25) {
      clothesVoxels.push({ x: vlx, y: 1.7, z });
    }
    g4.add(createVoxelCluster(clothesVoxels, 0xdcd6cd, 0.18));
    // Peças penduradas que balançam com o vento
    scene4Clothes = new THREE.Group();
    const shirts = [
      { x: vlx, y: 1.4, z: -9.2 }, { x: vlx, y: 1.2, z: -9.2 },
      { x: vlx, y: 1.4, z: -8.2 }, { x: vlx, y: 1.2, z: -8.2 },
      { x: vlx, y: 1.4, z: -7.0 }, { x: vlx, y: 1.2, z: -7.0 }
    ];
    scene4Clothes.add(createVoxelCluster(shirts, 0x38bdf8, 0.22));
    g4.add(scene4Clothes);

    // 7. Caminhonete Rural dos Pioneiros (estilo Toyota Bandeirante / D20 dos garimpeiros e colonos)
    const truckBody = [];
    const truckCabin = [];
    const truckGlass = [];
    const truckWheels = [];
    const truckCargo = [];
    const tkX = 4.2, tkZ = -12.5;

    // Chassi e caçamba
    for (let x = -1.1; x <= 1.1; x += 0.25) {
      for (let z = -2.4; z <= 2.4; z += 0.25) {
        truckBody.push({ x: tkX + x, y: 0.2, z: tkZ + z });
        if (z < 0.2) {
          // Laterais da caçamba de madeira
          const isSide = Math.abs(x) > 0.85 || z < -2.1;
          if (isSide) truckBody.push({ x: tkX + x, y: 0.55, z: tkZ + z });
        }
      }
    }
    // Cabine do motorista
    for (let x = -0.95; x <= 0.95; x += 0.25) {
      for (let z = 0.2; z <= 1.8; z += 0.25) {
        for (let y = 0.45; y <= 1.35; y += 0.25) {
          const isGlass = y > 0.8 && (z > 1.5 || Math.abs(x) > 0.7);
          if (isGlass) truckGlass.push({ x: tkX + x, y, z: tkZ + z });
          else truckCabin.push({ x: tkX + x, y, z: tkZ + z });
        }
      }
    }
    // Carga na caçamba (sacarias e mantimentos)
    for (let x = -0.7; x <= 0.7; x += 0.3) {
      for (let z = -1.8; z <= -0.2; z += 0.3) {
        truckCargo.push({ x: tkX + x, y: 0.48, z: tkZ + z });
        truckCargo.push({ x: tkX + x, y: 0.72, z: tkZ + z });
      }
    }
    // Rodas com lama
    [[-1.15, -1.4], [1.15, -1.4], [-1.15, 1.3], [1.15, 1.3]].forEach(w => {
      for (let a = 0; a < 6.28; a += 0.8) {
        truckWheels.push({ x: tkX + w[0], y: 0.25 + Math.sin(a) * 0.22, z: tkZ + w[1] + Math.cos(a) * 0.22 });
      }
    });

    g4.add(createVoxelCluster(truckBody, 0xb45309, 0.24));
    g4.add(createVoxelCluster(truckCabin, 0x0284c7, 0.24));
    g4.add(createVoxelCluster(truckGlass, 0xbae6fd, 0.24));
    g4.add(createVoxelCluster(truckCargo, 0xd97706, 0.26));
    g4.add(createVoxelCluster(truckWheels, 0x1e293b, 0.24));

    // 8. Colonos pioneiros em micro-voxel (habitantes da Terra Prometida)
    function buildPioneerFigure(px, pz, shirtColor, pantsColor, parent) {
      const skin = [];
      const shirt = [];
      const pants = [];
      const hat = [];
      const cs = 0.18;

      // Pernas
      for (let y = -0.3; y <= 0.35; y += cs) {
        pants.push({ x: px - 0.12, y, z: pz });
        pants.push({ x: px + 0.12, y, z: pz });
      }
      // Tronco / camisa
      for (let y = 0.35; y <= 0.9; y += cs) {
        for (let x = -0.22; x <= 0.22; x += cs) {
          shirt.push({ x: px + x, y, z: pz });
        }
      }
      // Cabeça
      for (let y = 0.9; y <= 1.15; y += cs) {
        skin.push({ x: px, y, z: pz });
      }
      // Chapéu de palha do colono
      for (let x = -0.35; x <= 0.35; x += cs) {
        for (let z = -0.35; z <= 0.35; z += cs) {
          hat.push({ x: px + x, y: 1.25, z: pz + z });
        }
      }
      hat.push({ x: px, y: 1.4, z: pz });

      parent.add(createVoxelCluster(pants, pantsColor, cs));
      parent.add(createVoxelCluster(shirt, shirtColor, cs));
      parent.add(createVoxelCluster(skin, 0xfbbf24, cs));
      parent.add(createVoxelCluster(hat, 0xfde047, cs));
    }

    buildPioneerFigure(-4.2, 8.5, 0xd97706, 0x1e3a8a, g4); // Colono perto da placa "Canaã dos Carajás"
    buildPioneerFigure(4.5, -2.2, 0xdc2626, 0x374151, g4); // Perto da fogueira
    buildPioneerFigure(-5.8, 2.0, 0x16a34a, 0x4b5563, g4); // Perto do poço d'água

    // 9. Cercas de madeira rústica delimitando lotes pioneiros
    const pioneerFencePos = [];
    for (let z = -20; z <= 12; z += 0.8) {
      if (Math.abs(z - 2) < 2) continue; // Porteira de acesso
      pioneerFencePos.push({ x: 5.2, y: -0.2, z });
      pioneerFencePos.push({ x: 5.2, y: 0.3, z });
      pioneerFencePos.push({ x: 5.2, y: 0.65, z });
      pioneerFencePos.push({ x: 5.2, y: 0.65, z: z + 0.4 });
    }
    g4.add(createVoxelCluster(pioneerFencePos, 0x78350f, 0.22));


    // ══════════════════════════════════════════════════════════════
    // CENA 6 — A CIDADE QUE CRESCEU (Canaã moderna)
    // ══════════════════════════════════════════════════════════════
    const g5 = scenesGroup[5];

    // Asfalto
    // ── CENA 6: CIDADE REALISTA ───────────────────────────────────
    const ROAD_HALF = 7.0;
    const SIDEWALK_W = 3.0;
    const Z_MIN = -46, Z_MAX = 46;

    // Terreno de base (grama urbana)
    const cityGround = [];
    for (let x = -34; x <= 34; x += 1.0) {
      for (let z = Z_MIN - 6; z <= Z_MAX + 6; z += 1.0) {
        if (Math.abs(x) <= ROAD_HALF + 0.6) continue;
        cityGround.push({ x, y: -0.75, z });
      }
    }
    g5.add(createVoxelCluster(cityGround, 0x6f8f5a, 1.0));
    // Asfalto com variação de tom
    // Asfalto: camada ÚNICA contínua (dois clusters sobrepostos causavam z-fighting/piscar)
    const asphaltPos = [];
    for (let x = -ROAD_HALF; x <= ROAD_HALF; x += 0.5) {
      for (let z = Z_MIN; z <= Z_MAX; z += 0.5) {
        asphaltPos.push({ x, y: -0.5, z });
      }
    }
    g5.add(createVoxelCluster(asphaltPos, 0x3b4149, 0.5));

    // Calçadas elevadas + guia (meio-fio)
    const sidewalkPos = [];
    const curbPos = [];
    for (let z = Z_MIN; z <= Z_MAX; z += 0.5) {
      for (let x = ROAD_HALF + 0.5; x <= ROAD_HALF + SIDEWALK_W; x += 0.5) {
        sidewalkPos.push({ x, y: -0.25, z });
        sidewalkPos.push({ x: -x, y: -0.25, z });
      }
      curbPos.push({ x: ROAD_HALF + 0.25, y: -0.2, z });
      curbPos.push({ x: -ROAD_HALF - 0.25, y: -0.2, z });
    }
    g5.add(createVoxelCluster(sidewalkPos, 0xb9bfc6, 0.5));
    g5.add(createVoxelCluster(curbPos, 0xe8ecef, 0.5));

    // Faixa amarela dupla central
    const laneYellow = [];
    for (let z = Z_MIN; z <= Z_MAX; z += 0.5) {
      laneYellow.push({ x: -0.35, y: -0.18, z });
      laneYellow.push({ x: 0.35, y: -0.18, z });
    }
    g5.add(createVoxelCluster(laneYellow, 0xf5c518, 0.35));

    // Faixas brancas tracejadas
    const laneWhite = [];
    for (let z = Z_MIN; z <= Z_MAX; z += 0.5) {
      const dash = Math.floor((z - Z_MIN) / 3.0) % 2 === 0;
      if (!dash) continue;
      laneWhite.push({ x: -3.6, y: -0.18, z });
      laneWhite.push({ x: 3.6, y: -0.18, z });
    }
    g5.add(createVoxelCluster(laneWhite, 0xf1f5f9, 0.35));

    // Faixa de pedestres (zebra)
    const zebraPos = [];
    [-26, 26].forEach(cz => {
      for (let x = -ROAD_HALF + 0.6; x <= ROAD_HALF - 0.6; x += 1.1) {
        for (let z = cz - 1.6; z <= cz + 1.6; z += 0.5) {
          zebraPos.push({ x, y: -0.18, z });
        }
      }
    });
    g5.add(createVoxelCluster(zebraPos, 0xf8fafc, 0.5));

    // Prédios modernos com janelas iluminadas
    function buildModernBuilding(bx, bz, w, h, d, col, parent, opts) {
      opts = opts || {};
      const cs = 0.5;
      const body = [];
      const glass = [];
      const trim = [];
      const roof = [];
      const halfW = w / 2, halfD = d / 2;
      const floorH = 1.6;

      for (let y = 0; y <= h; y += cs) {
        const floorIdx = Math.floor(y / floorH);
        const isFloorLine = (y % floorH) < cs * 0.6;
        for (let x = -halfW; x <= halfW; x += cs) {
          for (let z = -halfD; z <= halfD; z += cs) {
            const onX = Math.abs(Math.abs(x) - halfW) < cs * 0.6;
            const onZ = Math.abs(Math.abs(z) - halfD) < cs * 0.6;
            if (!onX && !onZ) continue;
            const px = bx + x, py = y - 0.4, pz = bz + z;
            if (isFloorLine && y > 0.5) { trim.push({ x: px, y: py, z: pz }); continue; }
            const colIdx = Math.round((onX ? z : x) / cs);
            const isWindowCol = (colIdx % 3) !== 0;
            if (isWindowCol && y > 1.0 && floorIdx >= 1) glass.push({ x: px, y: py, z: pz });
            else body.push({ x: px, y: py, z: pz });
          }
        }
      }

      // Laje de cobertura saliente
      for (let x = -halfW - 0.5; x <= halfW + 0.5; x += cs) {
        for (let z = -halfD - 0.5; z <= halfD + 0.5; z += cs) {
          roof.push({ x: bx + x, y: h + 0.1, z: bz + z });
        }
      }

      parent.add(createVoxelCluster(body, col, cs));
      parent.add(createVoxelCluster(glass, opts.glass || 0x7fb8d8, cs));
      parent.add(createVoxelCluster(trim, opts.trim || 0xeef2f6, cs));
      parent.add(createVoxelCluster(roof, opts.roof || 0x9aa5b1, cs));

      // Casa de máquinas / caixa d'água no topo
      const box = [];
      for (let x = -1.0; x <= 1.0; x += cs) {
        for (let y = h + 0.6; y <= h + 2.0; y += cs) {
          for (let z = -1.0; z <= 1.0; z += cs) {
            const shell = Math.abs(Math.abs(x) - 1.0) < cs * 0.6 || Math.abs(Math.abs(z) - 1.0) < cs * 0.6;
            if (shell) box.push({ x: bx + x, y, z: bz + z });
          }
        }
      }
      parent.add(createVoxelCluster(box, 0xcbd5e1, cs));

      // Térreo comercial: vitrine escura + toldo colorido
      const store = [];
      const awning = [];
      for (let x = -halfW + 0.5; x <= halfW - 0.5; x += cs) {
        for (let y = -0.4; y <= 1.0; y += cs) {
          store.push({ x: bx + x, y, z: bz + halfD + 0.05 });
          store.push({ x: bx + x, y, z: bz - halfD - 0.05 });
        }
        awning.push({ x: bx + x, y: 1.25, z: bz + halfD + 0.35 });
        awning.push({ x: bx + x, y: 1.25, z: bz - halfD - 0.35 });
      }
      parent.add(createVoxelCluster(store, 0x2b3440, cs));
      parent.add(createVoxelCluster(awning, opts.awning || 0x2f7fbf, cs));
    }

    // Fileira esquerda (fachadas voltadas para a avenida)
    buildModernBuilding(-15.5, -30, 8, 13, 9, 0xdde5ec, g5, { awning: 0x2f7fbf });
    buildModernBuilding(-16.5, -14, 9, 19, 10, 0xc9d6e2, g5, { awning: 0xe07a3f });
    buildModernBuilding(-15.0, 2, 8, 11, 9, 0xe9eff5, g5, { awning: 0x3f9e6a });
    buildModernBuilding(-16.0, 18, 9, 16, 10, 0xd2dde8, g5, { awning: 0xb04a8a });
    buildModernBuilding(-15.5, 34, 8, 9, 9, 0xeef3f8, g5, { awning: 0x2f7fbf });

    // Fileira direita
    buildModernBuilding(15.5, -34, 8, 10, 9, 0xe4ebf2, g5, { awning: 0x3f9e6a });
    buildModernBuilding(16.5, -18, 9, 22, 10, 0xbfcddb, g5, { awning: 0x2f7fbf });
    buildModernBuilding(15.0, -2, 8, 14, 9, 0xdde5ec, g5, { awning: 0xe07a3f });
    buildModernBuilding(16.0, 14, 9, 18, 10, 0xccd9e5, g5, { awning: 0xb04a8a });
    buildModernBuilding(15.5, 30, 8, 12, 9, 0xe9eff5, g5, { awning: 0x3f9e6a });

    // Skyline de fundo
    // Edifícios de fundo no fim da avenida recuados para abrir a avenida transversal
    buildModernBuilding(-26, -56, 10, 26, 10, 0xb8c6d4, g5, { awning: 0x2f7fbf });
    buildModernBuilding(0, -64, 14, 32, 11, 0xaebdcc, g5, { awning: 0x2f7fbf }); // Recuado para z = -64
    buildModernBuilding(26, -58, 10, 24, 10, 0xb8c6d4, g5, { awning: 0x2f7fbf });

    // Avenida Transversal em T na frente do prédio (cruzamento com curvas para os lados)
    // Cruzamento em T no fundo (Rua transversal na frente do prédio central em z = -32 a -44)
    const crossStreetPos = [];
    const crossCurbPos = [];
    for (let x = -36; x <= 36; x += 0.5) {
      for (let z = -44; z <= -32; z += 0.5) {
        crossStreetPos.push({ x, y: -0.48, z });
      }
      crossCurbPos.push({ x, y: -0.2, z: -44.2 });
      crossCurbPos.push({ x, y: -0.2, z: -31.8 });
    }
    g5.add(createVoxelCluster(crossStreetPos, 0x33383f, 0.5));
    g5.add(createVoxelCluster(crossCurbPos, 0xe8ecef, 0.5));

    // Faixas brancas horizontais de retenção na rua transversal
    const crossLines = [];
    for (let x = -35; x <= 35; x += 1.0) {
      crossLines.push({ x, y: -0.16, z: -38 });
    }
    g5.add(createVoxelCluster(crossLines, 0xf1f5f9, 0.4));

    // Postes de iluminação com braço e luminária
    const polePos = [];
    const armPos = [];
    const lampPos = [];
    for (let z = Z_MIN + 4; z <= Z_MAX - 4; z += 11) {
      [-1, 1].forEach(side => {
        const px = side * (ROAD_HALF + 1.4);
        for (let y = -0.2; y <= 5.4; y += 0.4) polePos.push({ x: px, y, z });
        for (let a = 0.4; a <= 1.6; a += 0.4) armPos.push({ x: px - side * a, y: 5.4, z });
        lampPos.push({ x: px - side * 1.8, y: 5.2, z });
        lampPos.push({ x: px - side * 1.8, y: 5.0, z });
      });
    }
    g5.add(createVoxelCluster(polePos, 0x8b95a1, 0.4));
    g5.add(createVoxelCluster(armPos, 0x8b95a1, 0.4));
    g5.add(createVoxelCluster(lampPos, 0xfff6c8, 0.4));

    // Semáforos nos cruzamentos
    const tlPole = [];
    const tlRed = [];
    const tlGreen = [];
    [-26, 26].forEach(cz => {
      [-1, 1].forEach(side => {
        const px = side * (ROAD_HALF + 1.0);
        for (let y = -0.2; y <= 4.6; y += 0.4) tlPole.push({ x: px, y, z: cz });
        for (let a = 0.4; a <= 2.0; a += 0.4) tlPole.push({ x: px - side * a, y: 4.6, z: cz });
        const hx = px - side * 2.2;
        tlRed.push({ x: hx, y: 4.4, z: cz });
        tlGreen.push({ x: hx, y: 3.8, z: cz });
      });
    });
    g5.add(createVoxelCluster(tlPole, 0x374151, 0.4));
    g5.add(createVoxelCluster(tlRed, 0xef4444, 0.4));
    g5.add(createVoxelCluster(tlGreen, 0x22c55e, 0.4));

    // Carros detalhados (carroceria, cabine, vidros, rodas, faróis)
    function buildCar(cx, cz, col, parent, dir) {
      dir = dir || 1;
      const cs = 0.25;
      const body = [];
      const cabin = [];
      const glass = [];
      const wheel = [];
      const light = [];
      const tail = [];

      for (let x = -1.0; x <= 1.0; x += cs) {
        for (let z = -2.0; z <= 2.0; z += cs) {
          body.push({ x: cx + x, y: 0.35, z: cz + z });
          body.push({ x: cx + x, y: 0.6, z: cz + z });
        }
      }
      for (let x = -0.85; x <= 0.85; x += cs) {
        for (let z = -1.1; z <= 1.1; z += cs) {
          cabin.push({ x: cx + x, y: 0.85, z: cz + z });
          const isGlass = Math.abs(Math.abs(x) - 0.85) < cs * 0.6 || Math.abs(Math.abs(z) - 1.1) < cs * 0.6;
          if (isGlass) glass.push({ x: cx + x, y: 1.1, z: cz + z });
          else cabin.push({ x: cx + x, y: 1.1, z: cz + z });
          cabin.push({ x: cx + x, y: 1.35, z: cz + z });
        }
      }
      [[-1.0, -1.3], [1.0, -1.3], [-1.0, 1.3], [1.0, 1.3]].forEach(w => {
        for (let a = 0; a < 6; a++) {
          const ang = (a / 6) * Math.PI * 2;
          wheel.push({
            x: cx + w[0] + Math.cos(ang) * 0.22,
            y: 0.3 + Math.sin(ang) * 0.22,
            z: cz + w[1]
          });
        }
      });
      for (let x = -0.7; x <= 0.7; x += cs) {
        light.push({ x: cx + x, y: 0.6, z: cz + dir * 2.05 });
        tail.push({ x: cx + x, y: 0.6, z: cz - dir * 2.05 });
      }

      parent.add(createVoxelCluster(body, col, cs));
      parent.add(createVoxelCluster(cabin, col, cs));
      parent.add(createVoxelCluster(glass, 0x8fc4e0, cs));
      parent.add(createVoxelCluster(wheel, 0x1a1f26, cs));
      parent.add(createVoxelCluster(light, 0xfff4c0, cs));
      parent.add(createVoxelCluster(tail, 0xd93a3a, cs));
    }

    // Veículos em movimento com lógica individual de curva no cruzamento
    scene5VehiclesForward = new THREE.Group();
    scene5VehiclesBackward = new THREE.Group();

    // Veículos da pista sentido fundo (z positivo para negativo em direção ao cruzamento)
    const fCars = [
      { id: 'f1', col: 0xe63946, startZ: 26, laneX: 3.5, turnDir: 1 },  // Vira à direita (+X)
      { id: 'f2', col: 0x2563eb, startZ: 10, laneX: 1.8, turnDir: -1 }, // Vira à esquerda (-X)
      { id: 'f3', col: 0xf1f5f9, startZ: -6, laneX: 3.5, turnDir: 1 },  // Vira à direita (+X)
      { id: 'f4', col: 0xd97706, startZ: 42, laneX: 1.8, turnDir: -1 }  // Vira à esquerda (-X)
    ];
    fCars.forEach(c => {
      const carGroup = new THREE.Group();
      carGroup.name = c.id;
      carGroup.userData = c;
      buildCar(0, 0, c.col, carGroup, 1);
      scene5VehiclesForward.add(carGroup);
    });

    // Veículos da pista contrária
    const bCars = [
      { id: 'b1', col: 0x22c55e, startZ: -28, laneX: -3.5 },
      { id: 'b2', col: 0xb04a8a, startZ: -12, laneX: -1.8 },
      { id: 'b3', col: 0xe2e8f0, startZ: 4, laneX: -3.5 },
      { id: 'b4', col: 0xf59e0b, startZ: 20, laneX: -1.8 }
    ];
    bCars.forEach(c => {
      const carGroup = new THREE.Group();
      carGroup.name = c.id;
      carGroup.userData = c;
      buildCar(0, 0, c.col, carGroup, -1);
      scene5VehiclesBackward.add(carGroup);
    });

    g5.add(scene5VehiclesForward);
    g5.add(scene5VehiclesBackward);

    // Ônibus urbano
    (function buildBus(bx, bz) {
      const cs = 0.3;
      const body = [];
      const win = [];
      const wheel = [];
      for (let x = -1.3; x <= 1.3; x += cs) {
        for (let z = -4.0; z <= 4.0; z += cs) {
          for (let y = 0.3; y <= 2.7; y += cs) {
            const shell = Math.abs(Math.abs(x) - 1.3) < cs * 0.6 || Math.abs(Math.abs(z) - 4.0) < cs * 0.6;
            if (!shell) continue;
            const isWin = y > 1.3 && y < 2.3 && Math.abs(Math.abs(z) - 4.0) > cs;
            if (isWin) win.push({ x: bx + x, y, z: bz + z });
            else body.push({ x: bx + x, y, z: bz + z });
          }
        }
      }
      [[-1.3, -2.6], [1.3, -2.6], [-1.3, 2.6], [1.3, 2.6]].forEach(w => {
        for (let a = 0; a < 8; a++) {
          const ang = (a / 8) * Math.PI * 2;
          wheel.push({ x: bx + w[0] + Math.cos(ang) * 0.3, y: 0.45 + Math.sin(ang) * 0.3, z: bz + w[1] });
        }
      });
      g5.add(createVoxelCluster(body, 0xf2c230, cs));
      g5.add(createVoxelCluster(win, 0x8fc4e0, cs));
      g5.add(createVoxelCluster(wheel, 0x1a1f26, cs));
    })(4.0, 14);

    // Árvores urbanas nas calçadas
    for (let i = 0; i < 16; i++) {
      const side = i % 2 === 0 ? 1 : -1;
      const tx = side * (ROAD_HALF + 2.2);
      const tz = Z_MIN + 6 + i * 5.5;
      const trunk = [];
      const leaf = [];
      for (let y = -0.2; y < 2.4; y += 0.4) trunk.push({ x: tx, y, z: tz });
      for (let cx = -1.2; cx <= 1.2; cx += 0.4) {
        for (let cy = 0; cy <= 1.8; cy += 0.4) {
          for (let cz = -1.2; cz <= 1.2; cz += 0.4) {
            if (Math.abs(cx) + Math.abs(cy) + Math.abs(cz) < 2.3) {
              leaf.push({ x: tx + cx, y: 2.4 + cy, z: tz + cz });
            }
          }
        }
      }
      g5.add(createVoxelCluster(trunk, 0x6b4423, 0.4));
      g5.add(createVoxelCluster(leaf, i % 3 === 0 ? 0x2f8f4e : 0x3aa35c, 0.4));
    }

    // ══════════════════════════════════════════════════════════════
    // CENA 7 — FECHAMENTO: A PERGUNTA (reflexão / desafio)
    // ══════════════════════════════════════════════════════════════
    const g6 = scenesGroup[6];
    const cs6 = 0.4;

    // Chão de terra batida em tons quentes de fim de tarde
    const groundPos = [];
    for (let x = -34; x <= 34; x += 0.8) {
      for (let z = -34; z <= 34; z += 0.8) {
        const d = Math.sqrt(x * x + z * z);
        if (d < 34) groundPos.push({ x, y: -0.4, z });
      }
    }
    g6.add(createVoxelCluster(groundPos, 0x8a6a3f, 0.8));

    // Horizonte de serra ao fundo (silhueta de minério)
    const ridgePos = [];
    for (let x = -34; x <= 34; x += 0.8) {
      const h = 3 + Math.sin(x * 0.18) * 2.2 + Math.sin(x * 0.07) * 1.6;
      for (let y = 0; y < h; y += 0.8) {
        ridgePos.push({ x, y, z: -30 - Math.sin(x * 0.1) * 2 });
      }
    }
    g6.add(createVoxelCluster(ridgePos, 0x6b3a1e, 0.8));

    // Árvores isoladas na paisagem (poucas, para dar escala)
    [[-16, -14], [15, -12], [-20, 6], [19, 8], [-9, -22], [11, -24]].forEach(t => {
      const trunk = [];
      const leaf = [];
      for (let y = -0.4; y < 2.4; y += cs6) trunk.push({ x: t[0], y, z: t[1] });
      for (let cx = -1.2; cx <= 1.2; cx += cs6) {
        for (let cy = 0; cy <= 1.8; cy += cs6) {
          for (let cz = -1.2; cz <= 1.2; cz += cs6) {
            if (Math.abs(cx) + Math.abs(cy) + Math.abs(cz) < 2.4) {
              leaf.push({ x: t[0] + cx, y: 2.4 + cy, z: t[1] + cz });
            }
          }
        }
      }
      g6.add(createVoxelCluster(trunk, 0x5b3a1a, cs6));
      g6.add(createVoxelCluster(leaf, 0x2f7d4f, cs6));
    });

    // ── O MONUMENTO: um grande ponto de interrogação em voxels ──
    // Construído em blocos de 1 unidade para leitura clara na tela.
    const qPos = [];
    const qCol = 0xf5c542; // dourado (ferro/ouro de Carajás)
    const qx = 0, qz = 0, qy = 0;
    const u = 1.0; // tamanho do bloco do "?"

    // Arco superior do "?" (semicírculo achatado)
    const arcPts = [
      [-2, 8], [-1, 9], [0, 9.5], [1, 9], [2, 8],
      [2.5, 7], [2.5, 6], [2, 5], [1, 4.5], [0, 4]
    ];
    arcPts.forEach(p => {
      for (let dx = 0; dx < u; dx += cs6) {
        for (let dy = 0; dy < u; dy += cs6) {
          for (let dz = 0; dz < u; dz += cs6) {
            qPos.push({ x: qx + p[0] * u + dx, y: qy + p[1] * u + dy, z: qz + dz });
          }
        }
      }
    });

    // Haste vertical do "?"
    for (let y = 2; y < 4.2; y += cs6) {
      for (let dx = 0; dx < u; dx += cs6) {
        for (let dz = 0; dz < u; dz += cs6) {
          qPos.push({ x: qx + dx, y: qy + y, z: qz + dz });
        }
      }
    }

    // Ponto final do "?"
    for (let dx = 0; dx < u; dx += cs6) {
      for (let dy = 0; dy < u; dy += cs6) {
        for (let dz = 0; dz < u; dz += cs6) {
          qPos.push({ x: qx + dx, y: qy + 0.4 + dy, z: qz + dz });
        }
      }
    }

    scene6QuestionMark = new THREE.Group();
    scene6QuestionMark.add(createVoxelCluster(qPos, qCol, cs6));
    g6.add(scene6QuestionMark);

    // Base/pedestal do monumento
    const basePos = [];
    for (let bx = -3.5; bx <= 3.5; bx += cs6) {
      for (let bz = -1.6; bz <= 1.6; bz += cs6) {
        for (let by = -0.4; by < 0.4; by += cs6) {
          basePos.push({ x: bx, y: by, z: bz });
        }
      }
    }
    g6.add(createVoxelCluster(basePos, 0x4b5563, cs6));

    // Luz de destaque sobre o monumento (esfera voxel suave)
    const haloPos = [];
    for (let a = 0; a < Math.PI * 2; a += 0.25) {
      for (let r = 4.5; r < 5.2; r += 0.35) {
        haloPos.push({ x: Math.cos(a) * r, y: 5.5 + Math.sin(a) * r * 0.55, z: -1.2 });
      }
    }
    g6.add(createVoxelCluster(haloPos, 0xfff3c4, 0.35));
  }

  // Render principal chamado frame a frame sincronizado pelo vídeo player
  function render(ctx, width, height, clipIndex, elapsed, duration) {
    if (!init()) return;

    const progress = Math.max(0, Math.min(1, elapsed / duration));
    const sceneIdx = Math.max(0, Math.min(scenesGroup.length - 1, clipIndex));

    // Ativa apenas a cena atual
    scenesGroup.forEach((g, idx) => {
      g.visible = (idx === sceneIdx);
    });

    // Animações de câmera e dinâmica para cada cena
    if (sceneIdx === 0) {
      // Cena 1: Vôo orbital sobre a cratera e complexo S11D
      const angle = progress * 1.2 + 0.3;
      const dist = 32 - progress * 8;
      camera.position.set(Math.sin(angle) * dist, 18 - progress * 4, Math.cos(angle) * dist);
      camera.lookAt(0, 2, 0);

      if (scene0ExcavatorArm) scene0ExcavatorArm.rotation.z = elapsed * 1.6;
      if (scene0SmokePuffs) {
        scene0SmokePuffs.position.y = (elapsed * 1.5) % 3.0;
        scene0SmokePuffs.rotation.y = elapsed * 0.4;
      }

    } else if (sceneIdx === 1) {
      // Cena 2: Acompanhamento veloz da esteira transportadora cortando a mata
      const camZ = -30 + progress * 52;
      // Câmera afastada para plano panorâmico amplo da esteira
      camera.position.set(22.0 + Math.sin(progress * 3.1) * 1.5, 14.5 + Math.sin(progress * 7) * 0.25, camZ + 22);
      camera.lookAt(0, 4.0, camZ - 8);

      // Minério correndo sobre a correia (a estrutura permanece fixa)
      if (oreBeltGroup) {
        oreBeltGroup.position.z = -((elapsed * 14) % 0.55);
      }
      if (scene1DustPuffs) {
        scene1DustPuffs.position.z = -((elapsed * 10) % 4.0);
        scene1DustPuffs.position.y = Math.sin(elapsed * 8) * 0.15;
      }

    } else if (sceneIdx === 2) {
      // Cena 3: O Megatrem passando imponente em velocidade e peso
      if (trainGroup) {
        trainGroup.position.z = -18 + progress * 40;
      }
      // Câmera lateral baixa acompanhando a locomotiva (hero shot)
      const camZ = -6 + progress * 14;
      // Câmera afastada para enquadrar a monumentalidade e comprimento do comboio
      camera.position.set(28.5, 10.5, camZ + 12);
      camera.lookAt(0, 2.5, camZ - 6);

      if (scene2SmokePuff) {
        scene2SmokePuff.position.z = -((elapsed * 3.5) % 2.5);
        scene2SmokePuff.position.y = Math.sin(elapsed * 5) * 0.2;
      }

    } else if (sceneIdx === 3) {
      // Cena 4: Vista aérea cinematográfica do megatrem cruzando o viaduto e a floresta
      // Drone cinematográfico: desce e acompanha o trem serpenteando o viaduto
      const h = 32 - progress * 10;
      const ang = -0.55 + progress * 0.75;
      const dist = 58 - progress * 16;
      camera.position.set(Math.sin(ang) * dist, h, Math.cos(ang) * dist);
      const lookZ = 18 - progress * 34;
      camera.lookAt(Math.sin(lookZ * 0.045) * 16, 1.5, lookZ);

      // O trem segue o traçado real curvado do viaduto, mantendo-se perfeitamente sobre os trilhos
      if (scene3MistPuffs) {
        scene3MistPuffs.position.x = Math.sin(elapsed * 0.3) * 3.0;
        scene3MistPuffs.position.z = Math.cos(elapsed * 0.25) * 3.0;
      }

    } else if (sceneIdx === 4) {
      // Cena 5: caminhada em altura humana natural (~1.72m) pela estrada de terra da vila, sem passar por cima do teto das casas
      const camZ = 20 - progress * 32;
      const headBob = Math.sin(elapsed * 7) * 0.05;
      camera.position.set(Math.sin(progress * 1.5) * 0.8, 1.72 + headBob, camZ);
      camera.lookAt(0, 1.6, camZ - 10);

      if (scene4CampfireFlames) {
        scene4CampfireFlames.scale.y = 0.8 + Math.sin(elapsed * 14) * 0.35 + Math.cos(elapsed * 9) * 0.2;
        scene4CampfireFlames.scale.x = 0.9 + Math.cos(elapsed * 12) * 0.25;
      }
      if (scene4Clothes) {
        scene4Clothes.rotation.x = Math.sin(elapsed * 4.5) * 0.22;
      }

    } else if (sceneIdx === 5) {
      // Cena 6: sobrevoo rasante pela avenida da cidade com cruzamento transversal
      const camZ = 44 - progress * 62;
      const h = 7.5 - progress * 2.2;
      camera.position.set(Math.sin(progress * 1.4) * 3.2, h, camZ);
      camera.lookAt(Math.sin(progress * 1.1) * 1.5, 3.0, camZ - 26);

      // Deslocamento dos veículos na pista e conversão no cruzamento em T na frente do prédio
      const speed = 14;
      if (scene5VehiclesForward) {
        scene5VehiclesForward.children.forEach(car => {
          const u = car.userData;
          if (!u) return;
          const travelDist = (elapsed * speed) % 80;
          let currentZ = u.startZ - travelDist;
          if (currentZ < -48) currentZ += 80;

          // Ao chegar no cruzamento em z = -34 (na frente do prédio central), faz curva de 90 graus
          const turnZ = -34;
          if (currentZ < turnZ) {
            const distPast = turnZ - currentZ;
            const turnAngle = Math.min(Math.PI / 2, distPast * 0.25);
            car.rotation.y = -u.turnDir * turnAngle;
            car.position.x = u.laneX + u.turnDir * distPast;
            car.position.z = turnZ;
          } else {
            car.rotation.y = 0;
            car.position.x = u.laneX;
            car.position.z = currentZ;
          }
        });
      }

      if (scene5VehiclesBackward) {
        scene5VehiclesBackward.children.forEach(car => {
          const u = car.userData;
          if (!u) return;
          const travelDist = (elapsed * 12) % 76;
          let currentZ = u.startZ + travelDist;
          if (currentZ > 42) currentZ -= 76;
          car.position.x = u.laneX;
          car.position.z = currentZ;
          car.rotation.y = 0;
        });
      }

    } else if (sceneIdx === 6) {

      // Aproximação lenta e solene do monumento "?"
      const dist = 30 - progress * 12;
      const ang = -0.35 + progress * 0.5;
      camera.position.set(Math.sin(ang) * dist, 7.5 - progress * 1.6, Math.cos(ang) * dist);
      camera.lookAt(0, 5.2, 0);

      if (scene6QuestionMark) {
        scene6QuestionMark.position.y = Math.sin(elapsed * 2.8) * 0.45;
        scene6QuestionMark.rotation.y = Math.sin(elapsed * 1.4) * 0.15;
      }
    }

    renderer.render(scene, camera);

    // Desenha o buffer WebGL Three.js no canvas 2D do editor
    ctx.drawImage(canvas3d, 0, 0, width, height);

    // Efeito sutil de vinheta e pós-processamento pixel art
    drawPixelScanlines(ctx, width, height);
  }

  function drawPixelScanlines(ctx, w, h) {
    // Sombra de borda cinematográfica (vinheta escura)
    const grad = ctx.createRadialGradient(w / 2, h / 2, h * 0.45, w / 2, h / 2, h * 0.85);
    grad.addColorStop(0, 'rgba(0,0,0,0)');
    grad.addColorStop(1, 'rgba(10,30,50,0.22)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  // Exporta globalmente para o player
  window.CanaaVoxelRenderer = {
    render: render,
    init: init
  };
})();
