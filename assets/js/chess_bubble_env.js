/**
 * chess_bubble_env.js — Cenários Contrastantes 3D (Lado A: Biblioteca Clássica vs Lado B: Bolha Caótica)
 * Suporta:
 *  - xadrez_biblioteca_split
 *  - xadrez_bolha_fakenews
 *  - xadrez_cracked_bubble
 */
(function(global) {
  'use strict';

  function setupChessEnvironment(scene, envKey, THREE) {
    if (!THREE) {
      console.warn('Three.js não encontrado em setupChessEnvironment');
      return;
    }

    const envGroup = new THREE.Group();
    envGroup.name = 'chess_environment_' + envKey;
    envGroup.userData.isEnvironment = true;

    // Piso compartilhado em parquet de madeira
    const floorGeo = new THREE.PlaneGeometry(16, 16);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x2c1810,
      roughness: 0.6,
      metalness: 0.1
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    envGroup.add(floor);

    // MESA DE XADREZ CENTRAL EM MADEIRA DE LEI (Dividindo os dois lados)
    const tableTopGeo = new THREE.BoxGeometry(1.4, 0.08, 1.4);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x4a2c11,
      roughness: 0.35,
      metalness: 0.05
    });
    const tableTop = new THREE.Mesh(tableTopGeo, tableMat);
    tableTop.position.set(0, 0.82, 0);
    envGroup.add(tableTop);

    // Pés torneados da mesa
    const legGeo = new THREE.CylinderGeometry(0.05, 0.04, 0.82, 12);
    const leg1 = new THREE.Mesh(legGeo, tableMat);
    leg1.position.set(0.6, 0.41, 0.6);
    const leg2 = new THREE.Mesh(legGeo, tableMat);
    leg2.position.set(-0.6, 0.41, 0.6);
    const leg3 = new THREE.Mesh(legGeo, tableMat);
    leg3.position.set(0.6, 0.41, -0.6);
    const leg4 = new THREE.Mesh(legGeo, tableMat);
    leg4.position.set(-0.6, 0.41, -0.6);
    envGroup.add(leg1);
    envGroup.add(leg2);
    envGroup.add(leg3);
    envGroup.add(leg4);

    // TABULEIRO QUADRICULADO
    const boardGroup = new THREE.Group();
    const squareGeo = new THREE.BoxGeometry(0.12, 0.015, 0.12);
    const lightSquareMat = new THREE.MeshStandardMaterial({ color: 0xf5deb3, roughness: 0.3 });
    const darkSquareMat = new THREE.MeshStandardMaterial({ color: 0x5c3a21, roughness: 0.4 });

    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const isDark = (r + c) % 2 === 1;
        const square = new THREE.Mesh(squareGeo, isDark ? darkSquareMat : lightSquareMat);
        square.position.set((c - 3.5) * 0.12, 0.865, (r - 3.5) * 0.12);
        boardGroup.add(square);
      }
    }
    envGroup.add(boardGroup);

    // ==========================================
    // LADO A (DIREITA/FUNDO): BIBLIOTECA ACOLHEDORA
    // ==========================================
    const bookShelfGeo = new THREE.BoxGeometry(0.4, 2.4, 1.8);
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x3d2314, roughness: 0.7 });
    const bookShelf = new THREE.Mesh(bookShelfGeo, shelfMat);
    bookShelf.position.set(1.8, 1.2, -0.5);
    envGroup.add(bookShelf);

    // Livros coloridos estilizados na estante
    const bookColors = [0xc0392b, 0x2980b9, 0x27ae60, 0xf39c12, 0x8e44ad];
    for (let b = 0; b < 14; b++) {
      const bGeo = new THREE.BoxGeometry(0.28, 0.32, 0.08);
      const bMat = new THREE.MeshStandardMaterial({
        color: bookColors[b % bookColors.length],
        roughness: 0.6
      });
      const bookMesh = new THREE.Mesh(bGeo, bMat);
      bookMesh.position.set(1.75, 0.8 + (b % 4) * 0.45, -1.2 + Math.floor(b / 4) * 0.5 + (b % 4) * 0.09);
      envGroup.add(bookMesh);
    }

    // Abajur clássico de mesa com luz quente
    const lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.04, 16), shelfMat);
    lampBase.position.set(0.55, 0.88, -0.45);
    const lampShade = new THREE.Mesh(
      new THREE.ConeGeometry(0.12, 0.16, 16, 1, true),
      new THREE.MeshStandardMaterial({ color: 0xf1c40f, roughness: 0.3, side: THREE.DoubleSide })
    );
    lampShade.position.set(0.55, 1.08, -0.45);
    envGroup.add(lampBase);
    envGroup.add(lampShade);

    // Luz volumétrica quente (Lado A)
    const warmLight = new THREE.PointLight(0xffb142, 2.2, 4.0);
    warmLight.position.set(0.55, 1.25, -0.45);
    envGroup.add(warmLight);

    // ==========================================
    // LADO B (ESQUERDA): CÚPULA DE VIDRO / BOLHA
    // ==========================================
    const isCracked = envKey === 'xadrez_cracked_bubble';
    const isBubbleActive = envKey === 'xadrez_bolha_fakenews' || isCracked;

    if (isBubbleActive) {
      // Cúpula semitransparente rachada ou inteira
      const domeGeo = new THREE.SphereGeometry(1.15, 32, 24, 0, Math.PI * 2, 0, Math.PI / 1.7);
      const domeMat = new THREE.MeshPhysicalMaterial({
        color: isCracked ? 0xff4757 : 0xff3838,
        transparent: true,
        opacity: isCracked ? 0.35 : 0.45,
        roughness: isCracked ? 0.6 : 0.15,
        transmission: 0.7,
        ior: 1.45,
        side: THREE.DoubleSide
      });
      const dome = new THREE.Mesh(domeGeo, domeMat);
      dome.position.set(-1.1, 0.82, 0.0);
      envGroup.add(dome);

      // Luz Vermelha Estroboscópica / Fria da Bolha
      const redDomeLight = new THREE.PointLight(0xff2222, 3.5, 3.2);
      redDomeLight.position.set(-1.1, 1.4, 0.0);
      envGroup.add(redDomeLight);

      // Se estiver rachada (Cena 4), adicionar estrias brancas de trinca
      if (isCracked) {
        const crackGroup = new THREE.Group();
        const crackMat = new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2 });
        for (let k = 0; k < 12; k++) {
          const points = [];
          points.push(new THREE.Vector3(-1.1, 1.4, 0.3));
          points.push(new THREE.Vector3(-1.1 + (Math.random() - 0.5) * 0.7, 1.4 + (Math.random() - 0.5) * 0.7, 0.5 + Math.random() * 0.3));
          points.push(new THREE.Vector3(-1.1 + (Math.random() - 0.5) * 1.0, 1.4 + (Math.random() - 0.5) * 1.0, 0.8));
          const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
          const line = new THREE.Line(lineGeo, crackMat);
          crackGroup.add(line);
        }
        envGroup.add(crackGroup);
      }

      // Ícones flutuantes 3D de fake news, moedas douradas e likes vermelhos
      const floatingGroup = new THREE.Group();
      floatingGroup.name = 'floating_indignation_icons';

      // Moedas douradas (Ka-ching)
      const coinGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.015, 16);
      const coinMat = new THREE.MeshStandardMaterial({ color: 0xffd32a, metalness: 0.9, roughness: 0.2 });
      for (let m = 0; m < 8; m++) {
        const coin = new THREE.Mesh(coinGeo, coinMat);
        coin.rotation.x = Math.PI / 2 + Math.random();
        coin.rotation.z = Math.random() * Math.PI;
        coin.position.set(-1.1 + (Math.random() - 0.5) * 1.2, 1.1 + Math.random() * 0.8, (Math.random() - 0.5) * 0.9);
        floatingGroup.add(coin);
      }

      // Balões de Fake News (!)
      const notifGeo = new THREE.BoxGeometry(0.14, 0.09, 0.02);
      const notifMat = new THREE.MeshStandardMaterial({ color: 0xeb4d4b, roughness: 0.3 });
      for (let n = 0; n < 6; n++) {
        const notif = new THREE.Mesh(notifGeo, notifMat);
        notif.position.set(-1.0 + (Math.random() - 0.5) * 1.0, 1.3 + Math.random() * 0.9, (Math.random() - 0.5) * 0.8);
        notif.rotation.y = (Math.random() - 0.5) * 0.6;
        floatingGroup.add(notif);
      }

      envGroup.add(floatingGroup);
      envGroup.userData.floatingGroup = floatingGroup;
    }

    // Luz ambiente suave geral para equilibrar a cena
    const ambLight = new THREE.AmbientLight(0xfff1e8, 0.7);
    envGroup.add(ambLight);

    scene.add(envGroup);
    return envGroup;
  }

  global.setupChessEnvironment = setupChessEnvironment;
})(typeof window !== 'undefined' ? window : this);
