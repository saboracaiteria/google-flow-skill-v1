/* ============================================================
   STICKMAN ACTOR — "O Desafio do Stickman: A Linha Vermelha"
   Personagem procedural 3D articulado com 5 animações
   Hero (preto) + Inimigo Escarlate (vermelho)
   ============================================================ */
(function (window) {
  'use strict';

  // ── Materiais ──────────────────────────────────────────────
  function makeMat(hex, emissive, emissiveInt) {
    return new THREE.MeshStandardMaterial({
      color: hex,
      emissive: emissive || hex,
      emissiveIntensity: emissiveInt !== undefined ? emissiveInt : 0.18,
      roughness: 0.55,
      metalness: 0.0
    });
  }

  // ── Segmento de membro (cilindro fino "palito") ────────────
  function seg(len, r, mat) {
    r = r || 0.028;
    const g = new THREE.CylinderGeometry(r, r, len, 8);
    const m = new THREE.Mesh(g, mat);
    m.castShadow = true;
    return m;
  }

  // ── Esfera (articulação / cabeça) ──────────────────────────
  function ball(radius, mat) {
    const g = new THREE.SphereGeometry(radius, 12, 12);
    const m = new THREE.Mesh(g, mat);
    m.castShadow = true;
    return m;
  }

  // ── Olhos do stickman ──────────────────────────────────────
  function addEyes(headMesh, mat) {
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pupilMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const r = headMesh.geometry.parameters.radius;
    [-0.055, 0.055].forEach((x) => {
      const eye = ball(0.030, eyeMat);
      eye.position.set(x, 0.025, r * 0.88);
      headMesh.add(eye);
      const pupil = ball(0.016, pupilMat);
      pupil.position.set(x > 0 ? 0.008 : -0.008, -0.005, r * 0.88 + 0.025);
      headMesh.add(pupil);
    });
    // Mouth line
    const mouthGeo = new THREE.BoxGeometry(0.07, 0.012, 0.01);
    const mouth = new THREE.Mesh(mouthGeo, pupilMat);
    mouth.position.set(0, -0.055, r * 0.90);
    headMesh.add(mouth);
  }

  // ══════════════════════════════════════════════════════════
  // createStickman(color, isEnemy) → THREE.Group
  // ══════════════════════════════════════════════════════════
  function createStickman(color, isEnemy) {
    color = color || 0x111111;
    const mat = makeMat(color, color, isEnemy ? 0.5 : 0.2);
    const jointMat = makeMat(color, color, 0.3);
    const root = new THREE.Group();
    root.name = isEnemy ? 'stickman_enemy' : 'stickman_hero';

    // ── Cabeça ──
    const head = ball(0.115, makeMat(color, color, isEnemy ? 0.6 : 0.25));
    head.name = 'head';
    if (!isEnemy) addEyes(head, mat);
    head.position.set(0, 1.72, 0);
    root.add(head);

    // ── Pescoço ──
    const neck = seg(0.10, 0.022, mat);
    neck.position.set(0, 1.59, 0);
    root.add(neck);

    // ── Torso ──
    const torso = seg(0.52, 0.030, mat);
    torso.name = 'torso';
    torso.position.set(0, 1.27, 0);
    root.add(torso);

    // ── Ombros (joint) ──
    const shoulderL = ball(0.040, jointMat);
    shoulderL.position.set(-0.14, 1.52, 0);
    root.add(shoulderL);
    const shoulderR = ball(0.040, jointMat);
    shoulderR.position.set(0.14, 1.52, 0);
    root.add(shoulderR);

    // ── Braço Esq (upperArm + elbow + foreArm) ──
    const lArmGroup = new THREE.Group();
    lArmGroup.name = 'lArmGroup';
    lArmGroup.position.set(-0.14, 1.52, 0);

    const lUpper = seg(0.28, 0.025, mat);
    lUpper.position.set(-0.14, -0.14, 0);
    lArmGroup.add(lUpper);

    const lElbow = ball(0.032, jointMat);
    lElbow.position.set(-0.14, -0.28, 0);
    lArmGroup.add(lElbow);

    const lForeGroup = new THREE.Group();
    lForeGroup.name = 'lForeGroup';
    lForeGroup.position.set(-0.14, -0.28, 0);
    const lFore = seg(0.26, 0.022, mat);
    lFore.position.set(0, -0.13, 0);
    lForeGroup.add(lFore);
    lArmGroup.add(lForeGroup);

    root.add(lArmGroup);

    // ── Braço Dir ──
    const rArmGroup = new THREE.Group();
    rArmGroup.name = 'rArmGroup';
    rArmGroup.position.set(0.14, 1.52, 0);

    const rUpper = seg(0.28, 0.025, mat);
    rUpper.position.set(0.14, -0.14, 0);
    rArmGroup.add(rUpper);

    const rElbow = ball(0.032, jointMat);
    rElbow.position.set(0.14, -0.28, 0);
    rArmGroup.add(rElbow);

    const rForeGroup = new THREE.Group();
    rForeGroup.name = 'rForeGroup';
    rForeGroup.position.set(0.14, -0.28, 0);
    const rFore = seg(0.26, 0.022, mat);
    rFore.position.set(0, -0.13, 0);
    rForeGroup.add(rFore);
    rArmGroup.add(rForeGroup);

    root.add(rArmGroup);

    // ── Quadril ──
    const hip = ball(0.048, jointMat);
    hip.position.set(0, 1.01, 0);
    root.add(hip);

    // ── Perna Esq ──
    const lLegGroup = new THREE.Group();
    lLegGroup.name = 'lLegGroup';
    lLegGroup.position.set(-0.09, 1.01, 0);
    const lThigh = seg(0.30, 0.025, mat);
    lThigh.position.set(0, -0.15, 0);
    lLegGroup.add(lThigh);
    const lKnee = ball(0.032, jointMat);
    lKnee.position.set(0, -0.30, 0);
    lLegGroup.add(lKnee);
    const lCalfGroup = new THREE.Group();
    lCalfGroup.name = 'lCalfGroup';
    lCalfGroup.position.set(0, -0.30, 0);
    const lCalf = seg(0.28, 0.022, mat);
    lCalf.position.set(0, -0.14, 0);
    lCalfGroup.add(lCalf);
    lLegGroup.add(lCalfGroup);
    root.add(lLegGroup);

    // ── Perna Dir ──
    const rLegGroup = new THREE.Group();
    rLegGroup.name = 'rLegGroup';
    rLegGroup.position.set(0.09, 1.01, 0);
    const rThigh = seg(0.30, 0.025, mat);
    rThigh.position.set(0, -0.15, 0);
    rLegGroup.add(rThigh);
    const rKnee = ball(0.032, jointMat);
    rKnee.position.set(0, -0.30, 0);
    rLegGroup.add(rKnee);
    const rCalfGroup = new THREE.Group();
    rCalfGroup.name = 'rCalfGroup';
    rCalfGroup.position.set(0, -0.30, 0);
    const rCalf = seg(0.28, 0.022, mat);
    rCalf.position.set(0, -0.14, 0);
    rCalfGroup.add(rCalf);
    rLegGroup.add(rCalfGroup);
    root.add(rLegGroup);

    // ── Weapon: bastão/katana ──
    const weaponGroup = new THREE.Group();
    weaponGroup.name = 'weaponGroup';
    const wColor = isEnemy ? 0xff2222 : 0x00eeff;
    const bladeMat = new THREE.MeshStandardMaterial({
      color: wColor, emissive: wColor, emissiveIntensity: 1.8,
      roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.95
    });
    const blade = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.008, 0.72, 8), bladeMat);
    blade.name = 'blade';
    blade.position.set(0, -0.36, 0);
    weaponGroup.add(blade);
    // Guard
    const guardMat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.5 });
    const guard = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.025, 0.025), guardMat);
    guard.position.set(0, 0, 0);
    weaponGroup.add(guard);
    weaponGroup.visible = false;
    root.add(weaponGroup);

    // ── Partículas de impacto (sparks) ──
    const sparkGeo = new THREE.BufferGeometry();
    const sparkCount = 20;
    const sparkPos = new Float32Array(sparkCount * 3);
    for (let i = 0; i < sparkCount * 3; i++) sparkPos[i] = (Math.random() - 0.5) * 0.6;
    sparkGeo.setAttribute('position', new THREE.BufferAttribute(sparkPos, 3));
    const sparkMat = new THREE.PointsMaterial({
      color: isEnemy ? 0xff4444 : 0x00ffff,
      size: 0.055, transparent: true, opacity: 0.0
    });
    const sparks = new THREE.Points(sparkGeo, sparkMat);
    sparks.name = 'sparks';
    sparks.visible = false;
    root.add(sparks);

    // ── userData refs ──
    root.userData = {
      head, torso, neck,
      lArmGroup, rArmGroup, lForeGroup, rForeGroup,
      lLegGroup, rLegGroup, lCalfGroup, rCalfGroup,
      hip, weaponGroup, blade, sparks,
      baseY: 0.0,
      phase: Math.random() * Math.PI * 2
    };

    return root;
  }

  // ══════════════════════════════════════════════════════════
  //  ANIMAÇÕES PROCEDURAIS
  // ══════════════════════════════════════════════════════════

  // reset de rotações
  function resetPose(u) {
    [u.lArmGroup, u.rArmGroup, u.lLegGroup, u.rLegGroup,
     u.lForeGroup, u.rForeGroup, u.lCalfGroup, u.rCalfGroup,
     u.head, u.torso].forEach(n => { if (n) { n.rotation.set(0,0,0); } });
  }

  // ── IDLE: respiração suave + piscar ──
  function animIdle(root, t) {
    const u = root.userData;
    const ph = u.phase;
    root.position.y = u.baseY + Math.sin(t * 1.4 + ph) * 0.012;
    root.rotation.z = Math.sin(t * 0.7 + ph) * 0.018;
    if (u.head) {
      u.head.rotation.y = Math.sin(t * 0.6 + ph) * 0.14;
      u.head.rotation.x = Math.sin(t * 0.45 + ph) * 0.06;
    }
    if (u.lArmGroup) {
      u.lArmGroup.rotation.x = Math.sin(t * 1.1 + ph) * 0.08;
      u.lArmGroup.rotation.z = 0.12 + Math.sin(t * 0.8 + ph) * 0.06;
    }
    if (u.rArmGroup) {
      u.rArmGroup.rotation.x = Math.sin(t * 1.1 + ph + 1.0) * 0.08;
      u.rArmGroup.rotation.z = -0.12 - Math.sin(t * 0.8 + ph + 1.0) * 0.06;
    }
    if (u.lLegGroup) u.lLegGroup.rotation.x = Math.sin(t * 0.9 + ph) * 0.04;
    if (u.rLegGroup) u.rLegGroup.rotation.x = -Math.sin(t * 0.9 + ph) * 0.04;
  }

  // ── RUN: corrida dinâmica ──
  function animRun(root, t) {
    const u = root.userData;
    const freq = 5.0;
    root.position.y = u.baseY + Math.abs(Math.sin(t * freq * 2)) * 0.08 - 0.03;
    root.rotation.z = Math.sin(t * freq) * 0.04;
    if (u.head) {
      u.head.rotation.x = -0.12 + Math.sin(t * freq) * 0.06;
      u.head.rotation.y = Math.sin(t * freq * 0.5) * 0.10;
    }
    if (u.torso) u.torso.rotation.x = -0.10;
    // braços
    if (u.lArmGroup) {
      u.lArmGroup.rotation.x = Math.sin(t * freq) * 1.0;
      u.lArmGroup.rotation.z = 0.08;
    }
    if (u.rArmGroup) {
      u.rArmGroup.rotation.x = -Math.sin(t * freq) * 1.0;
      u.rArmGroup.rotation.z = -0.08;
    }
    if (u.lForeGroup) u.lForeGroup.rotation.x = -Math.abs(Math.sin(t * freq)) * 0.9;
    if (u.rForeGroup) u.rForeGroup.rotation.x = -Math.abs(Math.sin(t * freq + Math.PI)) * 0.9;
    // pernas
    if (u.lLegGroup) u.lLegGroup.rotation.x = Math.sin(t * freq) * 1.1;
    if (u.rLegGroup) u.rLegGroup.rotation.x = -Math.sin(t * freq) * 1.1;
    if (u.lCalfGroup) u.lCalfGroup.rotation.x = -Math.abs(Math.sin(t * freq)) * 1.3;
    if (u.rCalfGroup) u.rCalfGroup.rotation.x = -Math.abs(Math.sin(t * freq + Math.PI)) * 1.3;
  }

  // ── ATTACK: golpe lateral com arma ──
  function animAttack(root, t) {
    const u = root.userData;
    if (u.weaponGroup) u.weaponGroup.visible = true;
    const swing = Math.sin(t * 8.0);
    root.position.y = u.baseY + Math.abs(Math.sin(t * 4.0)) * 0.04;
    root.rotation.z = swing * 0.08;
    if (u.head) {
      u.head.rotation.y = swing * 0.20;
      u.head.rotation.x = -0.08 + Math.sin(t * 3.0) * 0.05;
    }
    if (u.torso) u.torso.rotation.z = swing * 0.15;
    // braço direito segura arma
    if (u.rArmGroup) {
      u.rArmGroup.rotation.x = -1.2 + swing * 0.6;
      u.rArmGroup.rotation.z = -0.3 + swing * 0.3;
    }
    if (u.rForeGroup) u.rForeGroup.rotation.x = -0.4 + swing * 0.5;
    // posicionar arma na mão direita
    if (u.weaponGroup) {
      u.weaponGroup.position.set(0.14 + swing * 0.08, 1.15 + swing * 0.05, 0.1);
      u.weaponGroup.rotation.z = -0.5 + swing * 0.6;
      u.weaponGroup.rotation.x = -0.3;
    }
    // braço esq em guarda
    if (u.lArmGroup) {
      u.lArmGroup.rotation.x = -0.6 + Math.sin(t * 3.0) * 0.2;
      u.lArmGroup.rotation.z = 0.5;
    }
    if (u.lForeGroup) u.lForeGroup.rotation.x = -0.8;
    // pernas em stance
    if (u.lLegGroup) u.lLegGroup.rotation.x = 0.15;
    if (u.rLegGroup) u.rLegGroup.rotation.x = -0.20;
    if (u.lCalfGroup) u.lCalfGroup.rotation.x = -0.1;
    if (u.rCalfGroup) u.rCalfGroup.rotation.x = -0.15;
    // sparks no impacto
    if (u.sparks) {
      const impactPhase = (t % (Math.PI / 4)) / (Math.PI / 4);
      u.sparks.material.opacity = impactPhase > 0.8 ? (1.0 - impactPhase) * 3 : 0;
      u.sparks.visible = impactPhase > 0.8;
      u.sparks.position.set(0.35 + swing * 0.2, 1.3, 0.1);
    }
  }

  // ── FLIP: salto acrobático / esquiva ──
  function animFlip(root, t) {
    const u = root.userData;
    // arco de salto
    const cycle = (t % 1.4) / 1.4; // 0..1
    const airPhase = Math.sin(cycle * Math.PI);
    root.position.y = u.baseY + airPhase * 0.95;
    root.rotation.z = cycle * Math.PI * 2.0;
    root.position.x = (cycle - 0.5) * 1.4;
    if (u.head) u.head.rotation.x = -cycle * Math.PI;
    // tucked pose
    if (u.lArmGroup) { u.lArmGroup.rotation.x = -1.4; u.lArmGroup.rotation.z = 0.5; }
    if (u.rArmGroup) { u.rArmGroup.rotation.x = -1.4; u.rArmGroup.rotation.z = -0.5; }
    if (u.lLegGroup) { u.lLegGroup.rotation.x = airPhase * 1.8; }
    if (u.rLegGroup) { u.rLegGroup.rotation.x = airPhase * 1.8; }
    if (u.lCalfGroup) u.lCalfGroup.rotation.x = -airPhase * 2.0;
    if (u.rCalfGroup) u.rCalfGroup.rotation.x = -airPhase * 2.0;
  }

  // ── DIE: desintegração em partículas ──
  function animDie(root, t, duration) {
    const u = root.userData;
    duration = duration || 2.5;
    const prog = Math.min(t / duration, 1.0);
    root.position.y = u.baseY - prog * prog * 0.6;
    root.rotation.z = prog * 1.4;
    root.scale.setScalar(Math.max(0.01, 1.0 - prog * 0.9));
    if (u.head) { u.head.rotation.y = prog * 3.0; }
    if (u.torso) u.torso.rotation.x = prog * 0.8;
    if (u.lArmGroup) u.lArmGroup.rotation.x = prog * 2.0;
    if (u.rArmGroup) u.rArmGroup.rotation.x = -prog * 2.0;
    if (u.lLegGroup) u.lLegGroup.rotation.x = prog * 1.5;
    if (u.rLegGroup) u.rLegGroup.rotation.x = -prog * 1.5;
    if (u.sparks) {
      u.sparks.visible = prog > 0.3;
      u.sparks.material.opacity = prog > 0.3 ? (1.0 - prog) : 0;
      u.sparks.position.set(0, 0.8, 0);
      u.sparks.rotation.y = t * 4.0;
    }
  }

  // ══════════════════════════════════════════════════════════
  //  AMBIENTE STICKMAN — fundo gradiente + chão + partículas
  // ══════════════════════════════════════════════════════════
  function setupStickmanEnvironment(scene, envKey) {
    // limpar objetos de ambiente antigos
    const toRemove = [];
    scene.traverse(c => {
      if (c.userData && c.userData.isStickEnv) toRemove.push(c);
    });
    toRemove.forEach(c => { if (c.parent) c.parent.remove(c); });

    const envConfigs = {
      stick_vazio: {
        bg: 0x101018, fog: 0x101018, fogD: 0.018,
        ambient: [0x2233aa, 0.9], key: [0x88aaff, 2.5, [3,8,5]],
        fill: [0x334499, 1.2, [-3,3,-3]], rim: [0x00eeff, 1.5, [0,5,-8]],
        groundColor: 0x0a0a1a, gridColor: 0x1a2244
      },
      stick_combate: {
        bg: 0x0d0010, fog: 0x0d0010, fogD: 0.022,
        ambient: [0x330022, 1.0], key: [0xff2244, 3.0, [2,7,4]],
        fill: [0x0033ff, 1.8, [-4,2,-3]], rim: [0xff0066, 2.0, [0,4,-8]],
        groundColor: 0x0a0005, gridColor: 0x330011
      },
      stick_aurora: {
        bg: 0x050a18, fog: 0x050a18, fogD: 0.012,
        ambient: [0x112244, 1.1], key: [0xffd166, 2.8, [5,10,5]],
        fill: [0x00ccff, 1.6, [-5,5,-4]], rim: [0xaa44ff, 1.8, [0,6,-10]],
        groundColor: 0x060d1a, gridColor: 0x1a2240
      }
    };

    const cfg = envConfigs[envKey] || envConfigs.stick_vazio;

    scene.background = new THREE.Color(cfg.bg);
    scene.fog = new THREE.FogExp2(cfg.fog, cfg.fogD);

    function mk(o) { o.userData = { isStickEnv: true }; scene.add(o); return o; }

    // Luzes
    const aL = new THREE.AmbientLight(cfg.ambient[0], cfg.ambient[1]);
    aL.userData = { isStickEnv: true }; scene.add(aL);

    const kL = new THREE.DirectionalLight(cfg.key[0], cfg.key[1]);
    kL.position.set(...cfg.key[2]); kL.castShadow = true;
    kL.userData = { isStickEnv: true }; scene.add(kL);

    const fL = new THREE.DirectionalLight(cfg.fill[0], cfg.fill[1]);
    fL.position.set(...cfg.fill[2]);
    fL.userData = { isStickEnv: true }; scene.add(fL);

    const rL = new THREE.DirectionalLight(cfg.rim[0], cfg.rim[1]);
    rL.position.set(...cfg.rim[2]);
    rL.userData = { isStickEnv: true }; scene.add(rL);

    // Chão infinito
    const floorGeo = new THREE.PlaneGeometry(40, 40);
    const floorMat = new THREE.MeshStandardMaterial({ color: cfg.groundColor, roughness: 0.9 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.02;
    floor.receiveShadow = true;
    mk(floor);

    // Grid neon
    const grid = new THREE.GridHelper(30, 60, cfg.gridColor, cfg.gridColor);
    grid.position.y = 0.0;
    mk(grid);

    // Linha Vermelha (a fenda) — plano emissivo
    const fendaMat = new THREE.MeshStandardMaterial({
      color: 0xff0033, emissive: 0xff0033, emissiveIntensity: 2.5,
      transparent: true, opacity: 0.85
    });
    const fenda = new THREE.Mesh(new THREE.PlaneGeometry(8, 0.08), fendaMat);
    fenda.rotation.x = -Math.PI / 2;
    fenda.position.y = 0.005;
    fenda.name = 'fenda_vermelha';
    mk(fenda);

    // Partículas de fundo
    const pCount = 220;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = (Math.random() - 0.5) * 24;
      pPos[i + 1] = Math.random() * 12;
      pPos[i + 2] = (Math.random() - 0.5) * 24;
    }
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x4488ff, size: 0.055, transparent: true, opacity: 0.55 });
    const pts = new THREE.Points(pGeo, pMat);
    pts.name = 'stickParticles';
    mk(pts);
  }

  // ══════════════════════════════════════════════════════════
  //  FÁBRICA PRINCIPAL
  // ══════════════════════════════════════════════════════════
  window.StickmanActor = {
    createHero: function () {
      return createStickman(0x111122, false);
    },
    createEnemy: function () {
      return createStickman(0xcc0022, true);
    },
    setupEnvironment: setupStickmanEnvironment,

    // Dispatcher de animação por nome
    animate: function (root, animName, clipTime, totalTime) {
      const u = root.userData;
      if (!u) return;
      switch (animName) {
        case 'idle':    animIdle(root, clipTime); break;
        case 'run':     animRun(root, clipTime); break;
        case 'attack':  animAttack(root, clipTime); break;
        case 'flip':    animFlip(root, clipTime); break;
        case 'die':     animDie(root, clipTime, 2.2); break;
        default:        animIdle(root, clipTime); break;
      }
    },

    // Atualizar partículas de fundo
    tickParticles: function (scene, dt) {
      scene.traverse(c => {
        if (c.name === 'stickParticles' && c.isPoints) {
          c.rotation.y += dt * 0.04;
        }
        if (c.name === 'fenda_vermelha') {
          c.material.emissiveIntensity = 2.0 + Math.sin(Date.now() * 0.003) * 0.6;
        }
      });
    }
  };

})(window);
