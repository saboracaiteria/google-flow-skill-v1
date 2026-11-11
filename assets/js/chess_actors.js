/**
 * chess_actors.js — Personagens e Atores 3D Estilizados (Pixar/Blender Aesthetic)
 * Atores:
 *  1. Pensador (Thinker): calmo, óculos redondos dourados, suéter estilizado, xícara de café, mãos expressivas.
 *  2. Fanático (Fanatic): curvado, tenso, smartphone emitindo luz neon vermelha pulsante.
 *  3. Pombo do Xadrez (Chess Pigeon): rechonchudo, cômico, peito estufado, patas alaranjadas, olhos arregalados.
 *  4. Peças de Xadrez (Chess Pieces): Rei, Bispo, Peões esculpidos em madeira nobre escura e clara.
 *  5. Livro da Constituição/Fatos e Ícones Sociais 3D para o CTA.
 */
(function(global) {
  'use strict';

  function createChessActors(THREE) {
    const actors = {};

    // Materiais compartilhados estilizados PBR
    const skinMat = new THREE.MeshStandardMaterial({
      color: 0xf5d0b5,
      roughness: 0.55,
      metalness: 0.05
    });
    const hairMat = new THREE.MeshStandardMaterial({
      color: 0x3d2817,
      roughness: 0.8
    });
    const sweaterMat = new THREE.MeshStandardMaterial({
      color: 0x2b4257, // Azul petróleo elegante
      roughness: 0.85
    });
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd152,
      roughness: 0.25,
      metalness: 0.85
    });
    const woodLight = new THREE.MeshStandardMaterial({
      color: 0xe8c39e,
      roughness: 0.4
    });
    const woodDark = new THREE.MeshStandardMaterial({
      color: 0x3d2314,
      roughness: 0.35
    });

    /**
     * 1. PENSADOR (Avatar 3D)
     */
    function createThinker() {
      const group = new THREE.Group();
      group.name = 'actor_thinker';
      group.userData.isActor = true;

      // Corpo / Tronco
      const torsoGeo = new THREE.CylinderGeometry(0.24, 0.28, 0.65, 16);
      const torso = new THREE.Mesh(torsoGeo, sweaterMat);
      torso.position.y = 1.0;
      group.add(torso);

      // Gola rolê elegante
      const collarGeo = new THREE.TorusGeometry(0.14, 0.05, 12, 24);
      const collar = new THREE.Mesh(collarGeo, sweaterMat);
      collar.rotation.x = Math.PI / 2;
      collar.position.y = 1.33;
      group.add(collar);

      // Cabeça estilizada
      const headGeo = new THREE.SphereGeometry(0.20, 24, 20);
      headGeo.scale(1, 1.15, 1);
      const head = new THREE.Mesh(headGeo, skinMat);
      head.position.y = 1.54;
      group.add(head);

      // Cabelo estilizado ondulado
      const hairGeo = new THREE.SphereGeometry(0.22, 16, 16);
      const hair = new THREE.Mesh(hairGeo, hairMat);
      hair.position.set(0, 1.62, -0.04);
      hair.scale.set(1.02, 0.85, 1.05);
      group.add(hair);

      // Óculos redondos intelectuais
      const glassFrameGeo = new THREE.TorusGeometry(0.055, 0.008, 12, 24);
      const leftGlass = new THREE.Mesh(glassFrameGeo, goldMat);
      leftGlass.position.set(-0.075, 1.56, 0.185);
      const rightGlass = new THREE.Mesh(glassFrameGeo, goldMat);
      rightGlass.position.set(0.075, 1.56, 0.185);

      const bridgeGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.05, 8);
      const bridge = new THREE.Mesh(bridgeGeo, goldMat);
      bridge.rotation.z = Math.PI / 2;
      bridge.position.set(0, 1.56, 0.19);

      const glassesGroup = new THREE.Group();
      glassesGroup.add(leftGlass);
      glassesGroup.add(rightGlass);
      glassesGroup.add(bridge);
      group.add(glassesGroup);

      // Olhos serenos
      const eyeGeo = new THREE.SphereGeometry(0.022, 12, 12);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0x1a252f });
      const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
      leftEye.position.set(-0.075, 1.56, 0.17);
      const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
      rightEye.position.set(0.075, 1.56, 0.17);
      group.add(leftEye);
      group.add(rightEye);

      // Braço Direito (com xícara de café ou segurando o Rei)
      const rArmGroup = new THREE.Group();
      rArmGroup.position.set(0.28, 1.25, 0);
      const armGeo = new THREE.CylinderGeometry(0.06, 0.05, 0.42, 12);
      const rArm = new THREE.Mesh(armGeo, sweaterMat);
      rArm.position.y = -0.18;
      rArm.rotation.z = -0.35;
      rArmGroup.add(rArm);

      // Mão direita
      const handGeo = new THREE.SphereGeometry(0.05, 12, 12);
      const rHand = new THREE.Mesh(handGeo, skinMat);
      rHand.position.set(0.12, -0.38, 0.15);
      rArmGroup.add(rHand);

      // Xícara de Café de cerâmica
      const cupGeo = new THREE.CylinderGeometry(0.045, 0.035, 0.07, 16);
      const cupMat = new THREE.MeshStandardMaterial({ color: 0xf5f6fa, roughness: 0.2 });
      const cup = new THREE.Mesh(cupGeo, cupMat);
      cup.position.set(0.12, -0.34, 0.18);
      cup.name = 'thinker_cup';
      rArmGroup.add(cup);

      group.add(rArmGroup);

      // Braço Esquerdo apoiado na mesa
      const lArmGroup = new THREE.Group();
      lArmGroup.position.set(-0.28, 1.25, 0);
      const lArm = new THREE.Mesh(armGeo, sweaterMat);
      lArm.position.set(-0.08, -0.18, 0.12);
      lArm.rotation.x = 0.5;
      lArm.rotation.z = 0.25;
      lArmGroup.add(lArm);
      group.add(lArmGroup);

      // Pernas e Cadeira de Carvalho
      const legGeo = new THREE.CylinderGeometry(0.09, 0.08, 0.55, 12);
      const pantsMat = new THREE.MeshStandardMaterial({ color: 0x1f2421, roughness: 0.8 });
      const rLeg = new THREE.Mesh(legGeo, pantsMat);
      rLeg.position.set(0.12, 0.45, 0.15);
      rLeg.rotation.x = Math.PI / 2.6;
      const lLeg = new THREE.Mesh(legGeo, pantsMat);
      lLeg.position.set(-0.12, 0.45, 0.15);
      lLeg.rotation.x = Math.PI / 2.6;
      group.add(rLeg);
      group.add(lLeg);

      group.userData.rArmGroup = rArmGroup;
      group.userData.lArmGroup = lArmGroup;
      group.userData.head = head;
      group.userData.cup = cup;
      group.userData.leftEye = leftEye;
      group.userData.rightEye = rightEye;
      return group;
    }

    /**
     * 2. FANÁTICO / BOZÓLOIDE (Avatar na bolha estressado)
     */
    function createFanatic() {
      const group = new THREE.Group();
      group.name = 'actor_fanatic';
      group.userData.isActor = true;

      const fanaticSkinMat = new THREE.MeshStandardMaterial({
        color: 0xf3bf98,
        roughness: 0.8
      });
      const shirtMat = new THREE.MeshStandardMaterial({
        color: 0xb33939, // Vermelho raivoso / neon
        roughness: 0.7
      });

      // Tronco curvado tenso
      const torsoGeo = new THREE.CylinderGeometry(0.22, 0.25, 0.60, 16);
      const torso = new THREE.Mesh(torsoGeo, shirtMat);
      torso.position.set(0, 0.95, 0);
      torso.rotation.x = 0.28; // Inclinado para frente na tela do celular
      group.add(torso);

      // Cabeça tensa
      const headGeo = new THREE.SphereGeometry(0.19, 20, 18);
      const head = new THREE.Mesh(headGeo, fanaticSkinMat);
      head.position.set(0, 1.38, 0.18);
      head.rotation.x = 0.35;
      group.add(head);

      // Olhos esbugalhados arregalados (cômico/Pixar)
      const eyeWhiteMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0xb71540 }); // Olho vermelho de tela
      const bigEyeGeo = new THREE.SphereGeometry(0.045, 14, 14);
      const pupilGeo = new THREE.SphereGeometry(0.018, 12, 12);

      const rEye = new THREE.Mesh(bigEyeGeo, eyeWhiteMat);
      rEye.position.set(0.075, 1.42, 0.34);
      const rPupil = new THREE.Mesh(pupilGeo, pupilMat);
      rPupil.position.set(0.075, 1.41, 0.38);

      const lEye = new THREE.Mesh(bigEyeGeo, eyeWhiteMat);
      lEye.position.set(-0.075, 1.42, 0.34);
      const lPupil = new THREE.Mesh(pupilGeo, pupilMat);
      lPupil.position.set(-0.075, 1.41, 0.38);

      group.add(rEye);
      group.add(rPupil);
      group.add(lEye);
      group.add(lPupil);

      // Smartphone brilhante neon
      const phoneGeo = new THREE.BoxGeometry(0.14, 0.24, 0.018);
      const phoneMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.2 });
      const phone = new THREE.Mesh(phoneGeo, phoneMat);
      phone.position.set(0, 1.15, 0.42);
      phone.rotation.x = -0.55;

      // Tela emissiva pulsante vermelha
      const screenGeo = new THREE.PlaneGeometry(0.12, 0.21);
      const screenMat = new THREE.MeshBasicMaterial({ color: 0xff3838 });
      const screen = new THREE.Mesh(screenGeo, screenMat);
      screen.position.z = 0.01;
      phone.add(screen);

      // Luz pontual emitida pela tela no rosto do fanático
      const phoneLight = new THREE.PointLight(0xff3838, 2.5, 1.2);
      phoneLight.position.set(0, 0, 0.08);
      phone.add(phoneLight);

      group.add(phone);

      // Braços digitando furiosamente
      const armGeo = new THREE.CylinderGeometry(0.05, 0.045, 0.35, 10);
      const rArmGroup = new THREE.Group();
      rArmGroup.position.set(0.20, 1.30, 0.10);
      const rArm = new THREE.Mesh(armGeo, shirtMat);
      rArm.position.set(0, -0.16, 0.10);
      rArm.rotation.set(0.9, -0.3, -0.6);
      rArmGroup.add(rArm);

      const lArmGroup = new THREE.Group();
      lArmGroup.position.set(-0.20, 1.30, 0.10);
      const lArm = new THREE.Mesh(armGeo, shirtMat);
      lArm.position.set(0, -0.16, 0.10);
      lArm.rotation.set(0.9, 0.3, 0.6);
      lArmGroup.add(lArm);

      group.add(rArmGroup);
      group.add(lArmGroup);

      group.userData.phoneLight = phoneLight;
      group.userData.phone = phone;
      group.userData.head = head;
      group.userData.rArmGroup = rArmGroup;
      group.userData.lArmGroup = lArmGroup;
      group.userData.rPupil = rPupil;
      group.userData.lPupil = lPupil;
      group.userData.torso = torso;
      return group;
    }

    /**
     * 3. POMBO DO XADREZ (Mascote 3D Rechonchudo e Cômico)
     */
    function createPigeon() {
      const group = new THREE.Group();
      group.name = 'actor_pigeon';
      group.userData.isActor = true;

      // Corpo rechonchudo oval (estilo desenho cômico)
      const bodyGeo = new THREE.SphereGeometry(0.24, 20, 18);
      bodyGeo.scale(1.0, 0.95, 1.3);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0x7f8c8d, // Cinza ardósia pombo
        roughness: 0.65
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.28;
      group.add(body);

      // Peito estufado com iridescência roxa/verde
      const chestGeo = new THREE.SphereGeometry(0.22, 16, 16);
      chestGeo.scale(0.95, 0.9, 0.8);
      const chestMat = new THREE.MeshStandardMaterial({
        color: 0x8e44ad, // Brilho roxo característico de pombo
        roughness: 0.45,
        metalness: 0.2
      });
      const chest = new THREE.Mesh(chestGeo, chestMat);
      chest.position.set(0, 0.32, 0.18);
      group.add(chest);

      // Cabeça pequena com movimentos espasmódicos
      const headGroup = new THREE.Group();
      headGroup.position.set(0, 0.45, 0.28);

      const headGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const head = new THREE.Mesh(headGeo, bodyMat);
      headGroup.add(head);

      // Bico alaranjado cômico
      const beakGeo = new THREE.ConeGeometry(0.04, 0.12, 12);
      const beakMat = new THREE.MeshStandardMaterial({ color: 0xf39c12, roughness: 0.3 });
      const beak = new THREE.Mesh(beakGeo, beakMat);
      beak.rotation.x = Math.PI / 2;
      beak.position.set(0, -0.01, 0.15);
      headGroup.add(beak);

      // Olhos esbugalhados vazios (olhar clássico de pombo sem pensar)
      const eyeGeo = new THREE.SphereGeometry(0.038, 12, 12);
      const pupilGeo = new THREE.SphereGeometry(0.016, 12, 12);
      const eyeMat = new THREE.MeshBasicMaterial({ color: 0xf1c40f }); // Laranja/amarelo
      const pupilMat = new THREE.MeshBasicMaterial({ color: 0x111111 });

      const rEye = new THREE.Mesh(eyeGeo, eyeMat);
      rEye.position.set(0.09, 0.03, 0.05);
      const rPup = new THREE.Mesh(pupilGeo, pupilMat);
      rPup.position.set(0.11, 0.03, 0.07);

      const lEye = new THREE.Mesh(eyeGeo, eyeMat);
      lEye.position.set(-0.09, 0.03, 0.05);
      const lPup = new THREE.Mesh(pupilGeo, pupilMat);
      lPup.position.set(-0.11, 0.03, 0.07);

      headGroup.add(rEye);
      headGroup.add(rPup);
      headGroup.add(lEye);
      headGroup.add(lPup);

      group.add(headGroup);

      // Asas dobradas nas laterais
      const wingGeo = new THREE.SphereGeometry(0.22, 12, 12);
      wingGeo.scale(0.3, 0.8, 1.2);
      const wingMat = new THREE.MeshStandardMaterial({ color: 0x535c68, roughness: 0.7 });
      const rWing = new THREE.Mesh(wingGeo, wingMat);
      rWing.position.set(0.22, 0.28, -0.05);
      rWing.rotation.set(0.2, 0.1, -0.15);

      const lWing = new THREE.Mesh(wingGeo, wingMat);
      lWing.position.set(-0.22, 0.28, -0.05);
      lWing.rotation.set(0.2, -0.1, 0.15);

      group.add(rWing);
      group.add(lWing);

      // Patas alaranjadas
      const legGeo = new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8);
      const legMat = new THREE.MeshStandardMaterial({ color: 0xe67e22, roughness: 0.5 });
      const rLeg = new THREE.Mesh(legGeo, legMat);
      rLeg.position.set(0.08, 0.07, 0.0);
      const lLeg = new THREE.Mesh(legGeo, legMat);
      lLeg.position.set(-0.08, 0.07, 0.0);

      group.add(rLeg);
      group.add(lLeg);

      // Cauda traseira em leque
      const tailGeo = new THREE.BoxGeometry(0.16, 0.03, 0.25);
      const tail = new THREE.Mesh(tailGeo, wingMat);
      tail.position.set(0, 0.26, -0.32);
      tail.rotation.x = -0.35;
      group.add(tail);

      group.userData.headGroup = headGroup;
      group.userData.rWing = rWing;
      group.userData.lWing = lWing;
      return group;
    }

    /**
     * 4. PEÇAS DE XADREZ ESCULPIDAS (Rei, Bispo, Peões)
     */
    function createChessPieces() {
      const setGroup = new THREE.Group();
      setGroup.name = 'actor_chess_pieces';
      setGroup.userData.isActor = true;

      function createKing(mat) {
        const king = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.04, 16), mat);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.055, 0.22, 16), mat);
        body.position.y = 0.12;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 14), mat);
        head.position.y = 0.25;
        // Cruz no topo da coroa
        const crossV = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.045, 0.015), mat);
        crossV.position.y = 0.30;
        const crossH = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.015, 0.015), mat);
        crossH.position.y = 0.305;

        king.add(base);
        king.add(body);
        king.add(head);
        king.add(crossV);
        king.add(crossH);
        return king;
      }

      function createBishop(mat) {
        const b = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.035, 16), mat);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.048, 0.18, 16), mat);
        body.position.y = 0.10;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.038, 14, 14), mat);
        head.scale.set(0.9, 1.3, 0.9);
        head.position.y = 0.21;
        b.add(base);
        b.add(body);
        b.add(head);
        return b;
      }

      function createPawn(mat) {
        const p = new THREE.Group();
        const base = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.055, 0.03, 14), mat);
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.04, 0.12, 14), mat);
        body.position.y = 0.07;
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.032, 12, 12), mat);
        head.position.y = 0.145;
        p.add(base);
        p.add(body);
        p.add(head);
        return p;
      }

      // Rei Branco (Pensador)
      const whiteKing = createKing(woodLight);
      whiteKing.name = 'white_king';
      whiteKing.position.set(0.08, 0.87, 0.12);
      setGroup.add(whiteKing);

      // Bispo Branco
      const whiteBishop = createBishop(woodLight);
      whiteBishop.name = 'white_bishop';
      whiteBishop.position.set(0.20, 0.87, -0.05);
      setGroup.add(whiteBishop);

      // Peões espalhados
      const p1 = createPawn(woodLight);
      p1.position.set(-0.15, 0.87, 0.18);
      const p2 = createPawn(woodDark);
      p2.position.set(-0.05, 0.87, -0.15);
      setGroup.add(p1);
      setGroup.add(p2);

      setGroup.userData.whiteKing = whiteKing;
      setGroup.userData.whiteBishop = whiteBishop;
      return setGroup;
    }

    /**
     * 5. LIVRO GIGANTE DA CONSTITUIÇÃO E FATOS REAIS
     */
    function createLawBook() {
      const book = new THREE.Group();
      book.name = 'actor_law_book';
      book.userData.isActor = true;

      // Capa de couro nobre azul marinho com detalhes dourados
      const coverGeo = new THREE.BoxGeometry(0.48, 0.08, 0.65);
      const coverMat = new THREE.MeshStandardMaterial({ color: 0x192a56, roughness: 0.4 });
      const cover = new THREE.Mesh(coverGeo, coverMat);

      // Páginas internas douradas
      const pagesGeo = new THREE.BoxGeometry(0.45, 0.065, 0.62);
      const pagesMat = new THREE.MeshStandardMaterial({ color: 0xfcedc2, roughness: 0.9 });
      const pages = new THREE.Mesh(pagesGeo, pagesMat);
      pages.position.set(0.015, 0, 0);

      // Título em relevo dourado
      const sealGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.01, 24);
      const seal = new THREE.Mesh(sealGeo, goldMat);
      seal.position.set(0, 0.045, 0);

      book.add(cover);
      book.add(pages);
      book.add(seal);
      book.position.set(0, 0.92, 0.15);
      return book;
    }

    /**
     * 6. ÍCONES SOCIAIS 3D (Coração, Balão e Seguir)
     */
    function createSocialCTA() {
      const group = new THREE.Group();
      group.name = 'actor_social_cta_3d';
      group.userData.isActor = true;

      // Coração vermelho 3D
      const heartShape = new THREE.Shape();
      const x = 0, y = 0;
      heartShape.moveTo(x + 0.05, y + 0.05);
      heartShape.bezierCurveTo(x + 0.05, y + 0.05, x + 0.04, y, x, y);
      heartShape.bezierCurveTo(x - 0.06, y, x - 0.06, y + 0.07, x - 0.06, y + 0.07);
      heartShape.bezierCurveTo(x - 0.06, y + 0.11, x - 0.02, y + 0.154, x + 0.05, y + 0.19);
      heartShape.bezierCurveTo(x + 0.12, y + 0.154, x + 0.16, y + 0.11, x + 0.16, y + 0.07);
      heartShape.bezierCurveTo(x + 0.16, y + 0.07, x + 0.16, y, x + 0.10, y);
      heartShape.bezierCurveTo(x + 0.07, y, x + 0.05, y + 0.05, x + 0.05, y + 0.05);

      const extrudeSettings = { depth: 0.04, bevelEnabled: true, bevelSegments: 3, steps: 1, bevelSize: 0.01, bevelThickness: 0.01 };
      const heartGeo = new THREE.ExtrudeGeometry(heartShape, extrudeSettings);
      const heartMat = new THREE.MeshStandardMaterial({ color: 0xff3838, roughness: 0.2, metalness: 0.3 });
      const heart = new THREE.Mesh(heartGeo, heartMat);
      heart.rotation.z = Math.PI;
      heart.position.set(0.35, 1.45, 0.4);
      heart.scale.set(0.9, 0.9, 0.9);
      group.add(heart);

      // Balão de comentário azul 3D
      const bubbleGeo = new THREE.SphereGeometry(0.08, 16, 16);
      bubbleGeo.scale(1.2, 0.9, 0.6);
      const bubbleMat = new THREE.MeshStandardMaterial({ color: 0x3498db, roughness: 0.3 });
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      bubble.position.set(-0.35, 1.48, 0.4);
      group.add(bubble);

      // Ícone Seguir (+) dourado
      const plusV = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.08, 0.02), goldMat);
      const plusH = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.02, 0.02), goldMat);
      const plusGroup = new THREE.Group();
      plusGroup.add(plusV);
      plusGroup.add(plusH);
      plusGroup.position.set(0.0, 1.68, 0.35);
      group.add(plusGroup);

      group.userData.heart = heart;
      group.userData.bubble = bubble;
      group.userData.plus = plusGroup;
      return group;
    }

    actors.createThinker = createThinker;
    actors.createFanatic = createFanatic;
    actors.createPigeon = createPigeon;
    actors.createChessPieces = createChessPieces;
    actors.createLawBook = createLawBook;
    actors.createSocialCTA = createSocialCTA;

    return actors;
  }

  global.ChessActors = {
    init: createChessActors
  };
})(typeof window !== 'undefined' ? window : this);
