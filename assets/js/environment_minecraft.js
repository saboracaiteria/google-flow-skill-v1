
(function(global) {
  'use strict';

  function setupMinecraftEnvironment(scene, envKey) {
    if (!scene) return;

    const toRemove = [];
    scene.children.forEach(c => {
      if (c.userData && c.userData.isMinecraftEnv) {
        toRemove.push(c);
      }
    });
    toRemove.forEach(c => scene.remove(c));

    const envGroup = new THREE.Group();
    envGroup.name = 'minecraft_env_' + envKey;
    envGroup.userData.isMinecraftEnv = true;
    envGroup.userData.isEnvironment = true;

    const boxGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);

    const grassMat = new THREE.MeshLambertMaterial({
      color: 0x5b8c32,
      map: (window.MinecraftTextures && window.MinecraftTextures.grass) ? window.MinecraftTextures.grass() : null
    });
    const dirtMat = new THREE.MeshLambertMaterial({
      color: 0x866043,
      map: (window.MinecraftTextures && window.MinecraftTextures.dirt) ? window.MinecraftTextures.dirt() : null
    });
    const stoneMat = new THREE.MeshLambertMaterial({
      color: 0x757575,
      map: (window.MinecraftTextures && window.MinecraftTextures.stone) ? window.MinecraftTextures.stone() : null
    });
    const woodMat = new THREE.MeshLambertMaterial({
      color: 0x6b4f2c,
      map: (window.MinecraftTextures && window.MinecraftTextures.wood) ? window.MinecraftTextures.wood() : null
    });
    const leavesMat = new THREE.MeshLambertMaterial({
      color: 0x3a5f1b,
      map: (window.MinecraftTextures && window.MinecraftTextures.leaves) ? window.MinecraftTextures.leaves() : null
    });
    const woodPlanksMat = new THREE.MeshLambertMaterial({
      color: 0x9c7a4b,
      map: (window.MinecraftTextures && window.MinecraftTextures.wood) ? window.MinecraftTextures.wood() : null
    });
    const diamondOreMat = new THREE.MeshLambertMaterial({
      color: 0x4dd0e1,
      emissive: 0x00bcd4,
      emissiveIntensity: 0.6
    });

    function createTree(bx, bz, height) {
      const h = height || 4;
      const trunkBlocks = [];
      for (let y = 0; y < h; y++) {
        const trunk = new THREE.Mesh(boxGeo, woodMat);
        trunk.position.set(bx * 0.5, y * 0.5 + 0.25, bz * 0.5);
        trunk.castShadow = true;
        envGroup.add(trunk);
        trunkBlocks.push(trunk);
      }
      for (let lx = -1; lx <= 1; lx++) {
        for (let lz = -1; lz <= 1; lz++) {
          for (let ly = h - 1; ly <= h + 1; ly++) {
            if (lx === 0 && lz === 0 && ly < h + 1) continue;
            const leaf = new THREE.Mesh(boxGeo, leavesMat);
            leaf.position.set((bx + lx) * 0.5, ly * 0.5 + 0.25, (bz + lz) * 0.5);
            leaf.castShadow = true;
            envGroup.add(leaf);
          }
        }
      }
      return trunkBlocks;
    }

    if (envKey !== 'minecraft_caverna') {
      for (let x = -8; x <= 8; x++) {
        for (let z = -8; z <= 8; z++) {
          const top = new THREE.Mesh(boxGeo, grassMat);
          top.position.set(x * 0.5, -0.25, z * 0.5);
          top.receiveShadow = true;
          envGroup.add(top);

          const sub = new THREE.Mesh(boxGeo, dirtMat);
          sub.position.set(x * 0.5, -0.75, z * 0.5);
          envGroup.add(sub);
        }
      }
    }

    if (envKey === 'minecraft_dia') {
      scene.background = new THREE.Color(0x7ec0ee);
      scene.fog = new THREE.FogExp2(0x7ec0ee, 0.015);

      const sunLight = new THREE.DirectionalLight(0xfff5e6, 1.35);
      sunLight.position.set(6, 12, 8);
      envGroup.add(sunLight);

      const skyHemisphere = new THREE.HemisphereLight(0x7ec0ee, 0x5b8c32, 0.75);
      envGroup.add(skyHemisphere);

      const ambLight = new THREE.AmbientLight(0xffffff, 0.45);
      envGroup.add(ambLight);

      createTree(-5, -3, 4);
      createTree(5, -4, 5);
      createTree(-4, 4, 4);
      createTree(6, 3, 4);

      for (let cx = -6; cx <= -3; cx++) {
        for (let cz = -7; cz <= -4; cz++) {
          const hill = new THREE.Mesh(boxGeo, grassMat);
          hill.position.set(cx * 0.5, 0.25, cz * 0.5);
          envGroup.add(hill);
        }
      }
    }

    else if (envKey === 'minecraft_madeira') {
      scene.background = new THREE.Color(0x9fd4f5);
      scene.fog = new THREE.FogExp2(0x9fd4f5, 0.012);

      const sunLight = new THREE.DirectionalLight(0xfff3cc, 1.7);
      sunLight.position.set(4, 10, 6);
      envGroup.add(sunLight);

      const skyHemisphere = new THREE.HemisphereLight(0x9fd4f5, 0x6b4f2c, 1.0);
      envGroup.add(skyHemisphere);

      const ambLight = new THREE.AmbientLight(0xffffff, 0.75);
      envGroup.add(ambLight);

      // Árvore grande exatamente à frente do Steve (ele olha para -X)
      const targetTrunk = createTree(-2, 1, 6);
      envGroup.userData.choppedTrunk = targetTrunk;

      createTree(-5, -4, 4);
      createTree(4, -3, 5);
      createTree(3, 3, 4);
      createTree(-4, 3, 4);

      // Partículas de lascas de madeira emitidas a cada impacto do machado
      const woodChips = [];
      const chipGeo = new THREE.BoxGeometry(0.06, 0.06, 0.06);
      for (let i = 0; i < 10; i++) {
        const chip = new THREE.Mesh(chipGeo, woodMat);
        chip.visible = false;
        envGroup.add(chip);
        woodChips.push({
          mesh: chip,
          seedX: (Math.random() - 0.5) * 0.9,
          seedY: Math.random() * 0.7 + 0.3,
          seedZ: (Math.random() - 0.5) * 0.9
        });
      }
      envGroup.userData.woodChips = woodChips;

      const woodLog = new THREE.Mesh(boxGeo, woodMat);
      woodLog.position.set(0.8, 0.25, -0.5);
      woodLog.rotation.z = Math.PI / 2;
      envGroup.add(woodLog);
    }

    else if (envKey === 'minecraft_noite') {
      scene.background = new THREE.Color(0x1e2c4a);
      scene.fog = new THREE.FogExp2(0x1e2c4a, 0.014);

      const moonLight = new THREE.DirectionalLight(0xa8c0ff, 1.75);
      moonLight.position.set(-6, 10, -8);
      envGroup.add(moonLight);

      const ambNight = new THREE.AmbientLight(0x8fa2cc, 1.35);
      envGroup.add(ambNight);

      const nightHemi = new THREE.HemisphereLight(0x9fb6e8, 0x3a4a66, 1.0);
      envGroup.add(nightHemi);

      for (let hx = -3; hx <= 1; hx++) {
        for (let hz = -5; hz <= -2; hz++) {

          if (hx === -3 || hx === 1 || hz === -5) {
            for (let hy = 0; hy <= 3; hy++) {
              const wall = new THREE.Mesh(boxGeo, woodPlanksMat);
              wall.position.set(hx * 0.5, hy * 0.5 + 0.25, hz * 0.5);
              wall.castShadow = true;
              envGroup.add(wall);
            }
          }

          const roof = new THREE.Mesh(boxGeo, woodMat);
          roof.position.set(hx * 0.5, 4 * 0.5 + 0.25, hz * 0.5);
          envGroup.add(roof);
        }
      }

      const torchStick = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.35, 0.08),
        new THREE.MeshLambertMaterial({ color: 0x5a3d1e })
      );
      torchStick.position.set(0.6, 1.2, -1.9);
      envGroup.add(torchStick);

      const torchFlame = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.12, 0.12),
        new THREE.MeshBasicMaterial({ color: 0xffaa00 })
      );
      torchFlame.position.set(0.6, 1.4, -1.9);
      envGroup.add(torchFlame);

      const torchLight = new THREE.PointLight(0xffaa22, 3.2, 10);
      torchLight.position.set(0.6, 1.45, -1.7);
      envGroup.add(torchLight);

      const moon = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 1.8, 0.2),
        new THREE.MeshBasicMaterial({ color: 0xeeeeff })
      );
      moon.position.set(6, 8, -12);
      envGroup.add(moon);
    }

    else if (envKey === 'minecraft_caverna') {
      scene.background = new THREE.Color(0x2f4258);
      scene.fog = new THREE.FogExp2(0x2f4258, 0.010);

      // Iluminação reforçada: caverna clara e legível
      const caveAmb = new THREE.AmbientLight(0xc8d8f0, 1.75);
      envGroup.add(caveAmb);

      const caveHemi = new THREE.HemisphereLight(0xd6e6ff, 0x54637a, 1.35);
      envGroup.add(caveHemi);

      const caveFill = new THREE.DirectionalLight(0xe8f2ff, 1.55);
      caveFill.position.set(3, 9, 7);
      envGroup.add(caveFill);

      const caveFill2 = new THREE.DirectionalLight(0xbfd8ff, 0.85);
      caveFill2.position.set(-6, 5, 3);
      envGroup.add(caveFill2);

      // Lanterna de mineração: mantém o Steve sempre iluminado
      const minerLamp = new THREE.PointLight(0xffe9c4, 4.5, 18);
      minerLamp.position.set(0.6, 2.6, 2.2);
      envGroup.add(minerLamp);

      for (let cx = -7; cx <= 7; cx++) {
        for (let cz = -7; cz <= 7; cz++) {

          const floor = new THREE.Mesh(boxGeo, stoneMat);
          floor.position.set(cx * 0.5, -0.25, cz * 0.5);
          floor.receiveShadow = true;
          envGroup.add(floor);

          if (Math.abs(cx) >= 5 || Math.abs(cz) >= 5) {
            for (let cy = 0; cy <= 5; cy++) {
              const wall = new THREE.Mesh(boxGeo, stoneMat);
              wall.position.set(cx * 0.5, cy * 0.5 + 0.25, cz * 0.5);
              envGroup.add(wall);
            }
          }
        }
      }

      // Parede de pedra à frente do Steve (lado -X) onde a veia está embutida
      for (let wz = -2; wz <= 4; wz++) {
        for (let wy = 0; wy <= 5; wy++) {
          const wb = new THREE.Mesh(boxGeo, stoneMat);
          wb.position.set(-1.25, wy * 0.5 + 0.25, wz * 0.5);
          envGroup.add(wb);
        }
      }

      // Veia de diamantes em frente ao Steve (ele olha para -X)
      const diamondOres = [];
      const diamondPositions = [
        [-1.0, 0.25, 0.6],
        [-1.0, 0.75, 0.6],
        [-1.0, 1.25, 0.6],
        [-1.0, 0.25, 1.1],
        [-1.0, 0.75, 1.1],
        [-1.0, 0.25, 0.1],
        [-1.0, 1.75, 0.6]
      ];

      diamondPositions.forEach(pos => {
        const dOre = new THREE.Mesh(boxGeo, diamondOreMat);
        dOre.position.set(pos[0], pos[1], pos[2]);
        dOre.castShadow = true;
        dOre.userData.isDiamondOre = true;
        envGroup.add(dOre);
        diamondOres.push(dOre);
      });

      // Brilho azul forte na veia
      const diamondLight = new THREE.PointLight(0x00e5ff, 4.0, 9.0);
      diamondLight.position.set(-0.8, 1.0, 0.6);
      envGroup.add(diamondLight);

      const diamondLight2 = new THREE.PointLight(0x66f2ff, 2.4, 6.0);
      diamondLight2.position.set(-0.9, 1.8, 0.2);
      envGroup.add(diamondLight2);

      envGroup.userData.diamondOres = diamondOres;
    }

    else if (envKey === 'minecraft_legado') {
      scene.background = new THREE.Color(0xffaf7a);
      scene.fog = new THREE.FogExp2(0xffaf7a, 0.012);

      const sunsetLight = new THREE.DirectionalLight(0xff7733, 1.3);
      sunsetLight.position.set(-8, 6, 8);
      envGroup.add(sunsetLight);

      const ambSunset = new THREE.AmbientLight(0xffd5b3, 0.45);
      envGroup.add(ambSunset);

      for (let wx = -6; wx <= 6; wx++) {
        for (let wy = 0; wy <= 4; wy++) {
          const wallBlock = new THREE.Mesh(boxGeo, stoneMat);
          wallBlock.position.set(wx * 0.5, wy * 0.5 + 0.25, -5 * 0.5);
          envGroup.add(wallBlock);
        }

        if (wx % 2 === 0) {
          const battlement = new THREE.Mesh(boxGeo, stoneMat);
          battlement.position.set(wx * 0.5, 5 * 0.5 + 0.25, -5 * 0.5);
          envGroup.add(battlement);
        }
      }

      [-6, 6].forEach(tx => {
        for (let ty = 0; ty <= 7; ty++) {
          for (let ox = -1; ox <= 1; ox++) {
            for (let oz = -1; oz <= 1; oz++) {
              if (ox === 0 && oz === 0 && ty < 6) continue;
              const towerBlock = new THREE.Mesh(boxGeo, stoneMat);
              towerBlock.position.set((tx + ox) * 0.5, ty * 0.5 + 0.25, (-5 + oz) * 0.5);
              envGroup.add(towerBlock);
            }
          }
        }
      });

      createTree(-6, -1, 5);
      createTree(6, -1, 5);
    }

    scene.add(envGroup);
    return envGroup;
  }

  // Efeito de mineração: a picareta quebra a veia de diamante progressivamente
  function updateMinecraftEnvironment(scene, envKey, clipTime, clipIdx) {
    if (!scene) return;
    let env = null;
    scene.children.forEach(c => {
      if (c.userData && c.userData.isMinecraftEnv) env = c;
    });
    if (!env) return;

    const t = Math.max(0, clipTime || 0);

    // EFEITO DE CORTE DE MADEIRA: Lascas saltam e o bloco cortado tomba e cai no chão
    const trunk = env.userData.choppedTrunk;
    if (envKey === 'minecraft_madeira' && trunk && trunk.length >= 4) {
      // Período do golpe (swing = sin(t * 7.0) -> período de ~0.897s)
      const period = Math.PI * 2 / 7.0;
      const phase = (t % period) / period;
      const isImpact = phase > 0.90 || phase < 0.20;

      // Lascas de madeira espirram a cada batida do machado
      const chips = env.userData.woodChips;
      if (chips && chips.length) {
        if (isImpact) {
          const impactP = phase > 0.90 ? (phase - 0.90) / 0.30 : (phase + 0.10) / 0.30;
          chips.forEach((c, i) => {
            c.mesh.visible = true;
            c.mesh.position.set(
              -0.75 + c.seedX * impactP * 0.45 + impactP * 0.15,
              1.10 + c.seedY * impactP * 0.40 - 3.8 * impactP * impactP,
              0.50 + c.seedZ * impactP * 0.45
            );
            c.mesh.rotation.set(impactP * 5.0 + i, impactP * 3.0, impactP * 4.0);
          });
        } else {
          chips.forEach(c => { c.mesh.visible = false; });
        }
      }

      // BLOCO 2 (y = 1.25): Tomba e cai com gravidade realista após 2.25s
      const block2 = trunk[2];
      if (t < 2.25) {
        block2.position.set(-1.0, 1.25, 0.5);
        block2.rotation.set(0, 0, 0);
        if (isImpact) {
          block2.position.x = -1.0 + Math.sin(t * 35.0) * 0.02;
        }
      } else {
        const fallT = t - 2.25;
        let fallY = 1.25 - 0.5 * 9.8 * (fallT * fallT);
        if (fallY <= 0.18) {
          const bounceT = fallT - 0.46;
          if (bounceT > 0 && bounceT < 0.28) {
            fallY = 0.18 + Math.sin(bounceT / 0.28 * Math.PI) * 0.10;
          } else {
            fallY = 0.18;
          }
        }
        const fallX = -1.0 + Math.min(0.52, fallT * 0.7);
        const fallZ = 0.50 + Math.min(0.22, fallT * 0.32);
        const rotZ = Math.min(Math.PI / 2, fallT * 3.8);
        const rotX = Math.min(0.35, fallT * 1.5);
        block2.position.set(fallX, fallY, fallZ);
        block2.rotation.set(rotX, 0, rotZ);
      }

      // BLOCO 1 (y = 0.75): O segundo tronco também cai após 5.85s de golpes
      const block1 = trunk[1];
      if (t < 5.85) {
        block1.position.set(-1.0, 0.75, 0.5);
        block1.rotation.set(0, 0, 0);
        if (t >= 2.25 && isImpact) {
          block1.position.x = -1.0 + Math.sin(t * 35.0) * 0.02;
        }
      } else {
        const fallT2 = t - 5.85;
        let fallY2 = 0.75 - 0.5 * 9.8 * (fallT2 * fallT2);
        if (fallY2 <= 0.18) {
          const bounceT2 = fallT2 - 0.34;
          if (bounceT2 > 0 && bounceT2 < 0.24) {
            fallY2 = 0.18 + Math.sin(bounceT2 / 0.24 * Math.PI) * 0.08;
          } else {
            fallY2 = 0.18;
          }
        }
        const fallX2 = -1.0 + Math.min(0.38, fallT2 * 0.55);
        const fallZ2 = 0.50 - Math.min(0.20, fallT2 * 0.3);
        const rotZ2 = Math.min(Math.PI / 2, fallT2 * 3.9);
        const rotY2 = Math.min(0.40, fallT2 * 1.8);
        block1.position.set(fallX2, fallY2, fallZ2);
        block1.rotation.set(0, rotY2, rotZ2);
      }
    }

    const ores = env.userData.diamondOres;
    if (envKey === 'minecraft_caverna' && ores && ores.length) {
      const mined = Math.floor(t / 1.7);
      ores.forEach((ore, i) => {
        ore.visible = i >= mined;
        if (ore.visible) {
          const s = 1.0 + Math.sin(t * 8.0 + i) * 0.05;
          ore.scale.set(s, s, s);
        }
      });
    }
  }

  global.setupMinecraftEnvironment = setupMinecraftEnvironment;
  global.updateMinecraftEnvironment = updateMinecraftEnvironment;
  global.buildMinecraftEnvironment = function(scene) {
    return setupMinecraftEnvironment(scene, 'minecraft_dia');
  };
})(window);
