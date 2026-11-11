(function(window) {
  'use strict';

  function createSteveCharacter(scene) {
    const root = new THREE.Group();
    root.name = "steve_character";

    const skinMat = new THREE.MeshLambertMaterial({ color: 0xb97750 });
    const hairMat = new THREE.MeshLambertMaterial({ color: 0x4a2a18 });
    const shirtMat = new THREE.MeshLambertMaterial({ color: 0x00a8a8 });
    const pantsMat = new THREE.MeshLambertMaterial({ color: 0x223577 });
    const shoesMat = new THREE.MeshLambertMaterial({ color: 0x555555 });
    const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const eyeBlueMat = new THREE.MeshBasicMaterial({ color: 0x2e428b });

    // ---------- CABEÇA ----------
    const headGroup = new THREE.Group();
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.4), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    const hairMesh = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.12, 0.42), hairMat);
    hairMesh.position.set(0, 0.16, 0);
    headGroup.add(hairMesh);

    const eyeL1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), eyeWhiteMat);
    eyeL1.position.set(-0.1, 0.02, 0.201);
    const eyeL2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.02), eyeBlueMat);
    eyeL2.position.set(-0.08, 0.02, 0.202);
    headGroup.add(eyeL1);
    headGroup.add(eyeL2);

    const eyeR1 = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.05, 0.02), eyeWhiteMat);
    eyeR1.position.set(0.1, 0.02, 0.201);
    const eyeR2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.05, 0.02), eyeBlueMat);
    eyeR2.position.set(0.08, 0.02, 0.202);
    headGroup.add(eyeR1);
    headGroup.add(eyeR2);

    headGroup.position.set(0, 1.3, 0);
    root.add(headGroup);

    // ---------- TORSO ----------
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.6, 0.2), shirtMat);
    torso.position.set(0, 0.8, 0);
    torso.castShadow = true;
    root.add(torso);

    // ---------- BRAÇO ESQUERDO ----------
    const leftArmGroup = new THREE.Group();
    leftArmGroup.position.set(-0.3, 1.05, 0);
    const leftArmSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), shirtMat);
    leftArmSleeve.position.set(0, -0.1, 0);
    leftArmGroup.add(leftArmSleeve);
    const leftArmSkin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.18), skinMat);
    leftArmSkin.position.set(0, -0.38, 0);
    leftArmGroup.add(leftArmSkin);
    root.add(leftArmGroup);

    // ---------- BRAÇO DIREITO ----------
    const rightArmGroup = new THREE.Group();
    rightArmGroup.position.set(0.3, 1.05, 0);
    const rightArmSleeve = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.2, 0.2), shirtMat);
    rightArmSleeve.position.set(0, -0.1, 0);
    rightArmGroup.add(rightArmSleeve);
    const rightArmSkin = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.4, 0.18), skinMat);
    rightArmSkin.position.set(0, -0.38, 0);
    rightArmGroup.add(rightArmSkin);

    // ===== MÃO DIREITA: ferramentas ancoradas na ponta do braço =====
    const woodToolMat = new THREE.MeshLambertMaterial({ color: 0x6b4f2c });
    const ironToolMat = new THREE.MeshLambertMaterial({ color: 0xb8c4d0 });
    const diamondToolMat = new THREE.MeshLambertMaterial({ color: 0x2fe6e6, emissive: 0x0aa8b8, emissiveIntensity: 0.7 });

    const rightHand = new THREE.Group();
    rightHand.position.set(0, -0.58, 0.05);
    rightArmGroup.add(rightHand);

    // MACHADO — cabo continua o eixo do braço (para baixo), lâmina na ponta
    const axeGroup = new THREE.Group();
    const axeHandle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.05), woodToolMat);
    axeHandle.position.set(0, -0.27, 0);
    axeGroup.add(axeHandle);
    const axeHead = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.18, 0.2), ironToolMat);
    axeHead.position.set(0, -0.5, 0.07);
    axeGroup.add(axeHead);
    const axeBlade = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.22, 0.09), new THREE.MeshLambertMaterial({ color: 0x93a1b0 }));
    axeBlade.position.set(0, -0.5, 0.19);
    axeGroup.add(axeBlade);
    axeGroup.visible = false;
    rightHand.add(axeGroup);

    // PICARETA DE DIAMANTE — cabo continua o eixo do braço, cabeça na ponta
    const pickaxeGroup = new THREE.Group();
    const pickHandle = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.55, 0.05), woodToolMat);
    pickHandle.position.set(0, -0.27, 0);
    pickaxeGroup.add(pickHandle);
    const pickHead = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.07, 0.07), diamondToolMat);
    pickHead.position.set(0, -0.52, 0);
    pickaxeGroup.add(pickHead);
    const pickTipL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.07), diamondToolMat);
    pickTipL.position.set(-0.21, -0.58, 0);
    pickaxeGroup.add(pickTipL);
    const pickTipR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.16, 0.07), diamondToolMat);
    pickTipR.position.set(0.21, -0.58, 0);
    pickaxeGroup.add(pickTipR);
    pickaxeGroup.visible = false;
    rightHand.add(pickaxeGroup);

    root.add(rightArmGroup);

    // ===== MÃO ESQUERDA: tocha acesa =====
    const leftHand = new THREE.Group();
    leftHand.position.set(0, -0.58, 0.05);
    leftArmGroup.add(leftHand);

    const torchGroup = new THREE.Group();
    const torchStick = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.06), new THREE.MeshLambertMaterial({ color: 0x5a3d1e }));
    torchStick.position.set(0, -0.2, 0);
    torchGroup.add(torchStick);
    const torchFlame = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 0.13), new THREE.MeshBasicMaterial({ color: 0xffb020 }));
    torchFlame.position.set(0, -0.46, 0);
    torchGroup.add(torchFlame);
    const torchGlow = new THREE.PointLight(0xffa726, 0, 9.0);
    torchGlow.position.set(0, -0.5, 0);
    torchGroup.add(torchGlow);
    torchGroup.visible = false;
    leftHand.add(torchGroup);

    // ---------- PERNAS ----------
    const leftLegGroup = new THREE.Group();
    leftLegGroup.position.set(-0.1, 0.5, 0);
    const leftPants = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.42, 0.19), pantsMat);
    leftPants.position.set(0, -0.21, 0);
    leftLegGroup.add(leftPants);
    const leftShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.22), shoesMat);
    leftShoe.position.set(0, -0.44, 0.01);
    leftLegGroup.add(leftShoe);
    root.add(leftLegGroup);

    const rightLegGroup = new THREE.Group();
    rightLegGroup.position.set(0.1, 0.5, 0);
    const rightPants = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.42, 0.19), pantsMat);
    rightPants.position.set(0, -0.21, 0);
    rightLegGroup.add(rightPants);
    const rightShoe = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.12, 0.22), shoesMat);
    rightShoe.position.set(0, -0.44, 0.01);
    rightLegGroup.add(rightShoe);
    root.add(rightLegGroup);

    // ===== MAPA DE AÇÕES (nome do roteiro -> comportamento) =====
    const ACTION_BY_NAME = {
      despertar: 'despertar',
      cortando_madeira: 'cortar',
      cortar_arvore: 'cortar',
      cortar_madeira: 'cortar',
      madeira: 'cortar',
      primeira_noite: 'tocha',
      acender_tocha: 'tocha',
      tocha: 'tocha',
      minerando_diamante: 'minerar',
      minerar_diamante: 'minerar',
      minerar: 'minerar',
      diamante: 'minerar',
      legado_infinito: 'legado',
      legado: 'legado'
    };
    const KIND_BY_INDEX = ['despertar', 'cortar', 'tocha', 'minerar', 'legado'];

    root.userData.animate = function(timeSeconds, action, clipIndex) {
      const t = timeSeconds || 0;

      let kind = '';
      if (typeof action === 'string' && action) kind = ACTION_BY_NAME[action] || '';
      if (!kind) {
        let idx = 0;
        if (typeof clipIndex === 'number') idx = clipIndex;
        else if (typeof action === 'number') idx = action;
        kind = KIND_BY_INDEX[idx] || 'legado';
      }

      // reset
      headGroup.rotation.set(0, 0, 0);
      rightArmGroup.rotation.set(0, 0, 0);
      leftArmGroup.rotation.set(0, 0, 0);
      rightLegGroup.rotation.set(0, 0, 0);
      leftLegGroup.rotation.set(0, 0, 0);
      torso.rotation.set(0, 0, 0);
      leftHand.rotation.set(0, 0, 0);
      root.position.set(0, 0, 0.55);

      axeGroup.visible = false;
      pickaxeGroup.visible = false;
      torchGroup.visible = false;
      torchGlow.intensity = 0;

      if (kind === 'despertar') {
        headGroup.rotation.y = Math.sin(t * 1.5) * 0.45;
        headGroup.rotation.x = Math.sin(t * 0.8) * 0.12;
        rightArmGroup.rotation.x = Math.sin(t * 1.2) * 0.15;
        leftArmGroup.rotation.x = -Math.sin(t * 1.2) * 0.15;
        root.position.set(0, 0, 0.6);

      } else if (kind === 'cortar') {
        // Machado na mão, golpeando a árvore à frente
        axeGroup.visible = true;
        headGroup.rotation.y = -0.25;
        const swing = Math.sin(t * 7.0);
        // Após o bloco superior cair (t >= 2.25s), inclina o golpe para colher o tronco de baixo
        const lowerAngle = t >= 2.25 ? 0.20 : 0.0;
        rightArmGroup.rotation.x = -1.35 + lowerAngle + swing * 0.95;
        rightArmGroup.rotation.z = -0.12;
        leftArmGroup.rotation.x = 0.25 - swing * 0.25;
        torso.rotation.y = swing * 0.12;
        rightLegGroup.rotation.x = -0.1;
        leftLegGroup.rotation.x = 0.12;
        // Posição calculada para o machado atingir exatamente o centro do tronco em x=-0.75 a -0.80, z=0.50
        root.position.set(0.18, 0, 0.25);

      } else if (kind === 'tocha') {
        // Tocha acesa erguida na mão esquerda, com luz real
        torchGroup.visible = true;
        torchGlow.intensity = 3.6 + Math.sin(t * 13.0) * 0.7;
        const fs = 1.0 + Math.sin(t * 17.0) * 0.18;
        torchFlame.scale.set(fs, fs, fs);
        headGroup.rotation.y = Math.sin(t * 2.2) * 0.3;
        headGroup.rotation.z = Math.sin(t * 1.4) * 0.05;
        // Braço erguido e tocha compensada para apontar SEMPRE para cima
        leftArmGroup.rotation.x = -1.15;
        leftArmGroup.rotation.z = 0.20;
        leftHand.rotation.x = Math.PI - leftArmGroup.rotation.x;
        rightArmGroup.rotation.x = -0.18;
        root.position.set(0, 0, 0.75);

      } else if (kind === 'minerar') {
        // Picareta de diamante batendo na veia azul à frente
        pickaxeGroup.visible = true;
        headGroup.rotation.x = 0.28;
        const strike = Math.abs(Math.sin(t * 6.5));
        rightArmGroup.rotation.x = -0.35 - strike * 1.35;
        rightArmGroup.rotation.z = -0.08;
        leftArmGroup.rotation.x = strike * 0.25;
        leftLegGroup.rotation.x = -0.22;
        rightLegGroup.rotation.x = 0.22;
        // Posição calculada para a ponta da picareta atingir diretamente a face do minério de diamante em x=-0.75, z=0.60
        root.position.set(-0.20, -0.03, 0.32);

      } else {
        // legado: caminhada confiante
        const walkFreq = t * 6.0;
        rightLegGroup.rotation.x = Math.sin(walkFreq) * 0.6;
        leftLegGroup.rotation.x = -Math.sin(walkFreq) * 0.6;
        rightArmGroup.rotation.x = -Math.sin(walkFreq) * 0.6;
        leftArmGroup.rotation.x = Math.sin(walkFreq) * 0.6;
        headGroup.rotation.y = Math.sin(t * 1.8) * 0.15;
        root.position.set(0, Math.abs(Math.sin(walkFreq * 2)) * 0.06, 0.55);
      }
    };

    scene.add(root);
    return root;
  }

  window.createSteveCharacter = createSteveCharacter;
})(window);
