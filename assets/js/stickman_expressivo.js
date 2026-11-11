/**
 * Stickman Expressivo — Estilo YouTube Shorts Autêntico
 * Inspirado nas diretrizes de biblioteca/estilo-palito:
 * Personagem desenhado em Canvas 2D de alta definição (512x512) com traço
 * cartunesco espesso, rosto vivo (olhos grandes, sobrancelhas, boca animada),
 * camiseta colorida vibrante e poses dinâmicas por cena.
 * Projetado em billboard 3D (orientado para câmera) em mundo 3D com luzes e sombras.
 */
(function(window) {
  'use strict';

  function createExpressiveStickmanActor(options) {
    options = options || {};
    const role = options.role || 'hero'; // 'hero' ou 'rival'
    const colorBody = role === 'hero' ? '#2563eb' : '#dc2626'; // azul royal ou vermelho rubro
    const accentColor = role === 'hero' ? '#38bdf8' : '#f87171';

    // Canvas 2D dedicado para textura dinâmica do personagem
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;

    const material = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthWrite: false,
      side: THREE.DoubleSide
    });

    const geometry = new THREE.PlaneGeometry(2.4, 2.4);
    const planeMesh = new THREE.Mesh(geometry, material);
    planeMesh.position.y = 1.2;

    const group = new THREE.Group();
    group.name = 'actor_stick_' + role;
    group.add(planeMesh);

    // Sombra oval no chão 3D
    const shadowGeo = new THREE.CircleGeometry(0.55, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    group.add(shadowMesh);

    // Aura sutil luminosa de neon
    const auraGeo = new THREE.PlaneGeometry(2.6, 2.6);
    const auraMat = new THREE.MeshBasicMaterial({
      color: role === 'hero' ? 0x0284c7 : 0xe11d48,
      transparent: true,
      opacity: 0.18,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
    const auraMesh = new THREE.Mesh(auraGeo, auraMat);
    auraMesh.position.y = 1.2;
    auraMesh.position.z = -0.02;
    group.add(auraMesh);

    // Estado da animação interna
    const state = {
      pose: 'wake', // 'wake', 'shock', 'standby', 'fight', 'victory', 'dissolve'
      expression: 'neutral', // 'sleepy', 'surprised', 'angry', 'confident', 'happy'
      mouthOpen: 0,
      blinkTimer: 0,
      tGlobal: 0
    };

    /**
     * Desenha o stickman expressivo no canvas 2D
     */
    function renderCharacter2D(t, pose, expr, mouthVal) {
      ctx.clearRect(0, 0, 512, 512);

      const cx = 256;
      const cyHead = 150;
      const headR = 58;

      ctx.save();
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // 1. Efeito de Respiração / Bobbing
      const bobY = Math.sin(t * 3.5) * 4;

      // 2. CORPO (Camiseta com traço expressivo)
      const cyBodyTop = cyHead + headR + 10 + bobY;
      const cyHip = cyBodyTop + 95;

      // Poses específicas de braços e pernas
      if (pose === 'wake') {
        // Deitado / levantando-se apoiado com a mão
        const lift = Math.min(1, Math.max(0, (t % 12) / 3)); // 0 a 1 levantando
        const angleBody = -0.6 + lift * 0.6;
        ctx.save();
        ctx.translate(cx, cyHip);
        ctx.rotate(angleBody);

        // Tronco com camiseta
        ctx.fillStyle = colorBody;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.roundRect(-24, -85, 48, 85, [14, 14, 8, 8]);
        ctx.fill();
        ctx.stroke();

        // Braço de apoio no chão
        ctx.lineWidth = 12;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(-18, -60);
        ctx.lineTo(-55, -20);
        ctx.lineTo(-65, 10);
        ctx.stroke();

        // Outro braço coçando a cabeça
        ctx.beginPath();
        ctx.moveTo(18, -60);
        ctx.lineTo(45, -85);
        ctx.lineTo(25, -115);
        ctx.stroke();

        // Pernas esticadas relaxadas
        ctx.beginPath();
        ctx.moveTo(-12, 0);
        ctx.lineTo(-40, 45);
        ctx.lineTo(-70, 70);
        ctx.moveTo(12, 0);
        ctx.lineTo(20, 50);
        ctx.lineTo(40, 80);
        ctx.stroke();

        // Cabeça
        ctx.translate(0, -130);
        drawHead(0, 0, headR, expr, t, mouthVal);
        ctx.restore();
        ctx.restore();
        return;
      }

      if (pose === 'fight') {
        // Postura ágil de combate estilo anime
        const sway = Math.sin(t * 8) * 15;
        const armCycle = Math.cos(t * 10);

        // Camiseta inclinada para frente
        ctx.fillStyle = colorBody;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.roundRect(cx - 26, cyBodyTop + bobY, 52, 90, [14, 14, 8, 8]);
        ctx.fill();
        ctx.stroke();

        // Pernas em base de luta flexionada
        ctx.lineWidth = 14;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        // Perna esquerda (frente)
        ctx.moveTo(cx - 15, cyHip + bobY);
        ctx.lineTo(cx - 65, cyHip + 50 + bobY);
        ctx.lineTo(cx - 85, cyHip + 110 + bobY);
        // Perna direita (trás com impulso)
        ctx.moveTo(cx + 15, cyHip + bobY);
        ctx.lineTo(cx + 55, cyHip + 45 + bobY);
        ctx.lineTo(cx + 80, cyHip + 115 + bobY);
        ctx.stroke();

        // Braços dinâmicos (estocando / bloqueando)
        ctx.beginPath();
        // Braço dianteiro com arma de luz
        ctx.moveTo(cx - 22, cyBodyTop + 15 + bobY);
        ctx.lineTo(cx - 75 + armCycle * 25, cyBodyTop + 10 + bobY);
        ctx.lineTo(cx - 110 + armCycle * 35, cyBodyTop - 5 + bobY);
        ctx.stroke();

        // Espada / Bastão de Neon Radiante
        ctx.save();
        ctx.strokeStyle = accentColor;
        ctx.lineWidth = 12;
        ctx.shadowColor = accentColor;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        const swordX = cx - 110 + armCycle * 35;
        const swordY = cyBodyTop - 5 + bobY;
        ctx.moveTo(swordX - 10, swordY + 25);
        ctx.lineTo(swordX - 95, swordY - 80);
        ctx.stroke();
        ctx.restore();

        // Braço recuado em guarda
        ctx.beginPath();
        ctx.moveTo(cx + 22, cyBodyTop + 15 + bobY);
        ctx.lineTo(cx + 60, cyBodyTop + 5 + bobY);
        ctx.lineTo(cx + 35, cyBodyTop - 25 + bobY);
        ctx.stroke();

        // Cabeça com foco total
        drawHead(cx, cyHead + bobY, headR, expr, t, mouthVal);
        ctx.restore();
        return;
      }

      if (pose === 'dissolve') {
        // Inimigo caindo e desmanchando em partículas
        const fade = Math.max(0, 1 - (t % 12) / 6);
        ctx.globalAlpha = fade;
        const dissolveY = (1 - fade) * 70;

        ctx.fillStyle = colorBody;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 14;
        ctx.beginPath();
        ctx.roundRect(cx - 22, cyBodyTop + dissolveY, 44, 75, [10, 10, 6, 6]);
        ctx.fill();
        ctx.stroke();

        ctx.lineWidth = 12;
        ctx.beginPath();
        // Braços caídos
        ctx.moveTo(cx - 18, cyBodyTop + 15 + dissolveY);
        ctx.lineTo(cx - 45, cyBodyTop + 65 + dissolveY);
        ctx.moveTo(cx + 18, cyBodyTop + 15 + dissolveY);
        ctx.lineTo(cx + 45, cyBodyTop + 65 + dissolveY);
        // Pernas cedendo
        ctx.moveTo(cx - 12, cyHip + dissolveY);
        ctx.lineTo(cx - 35, cyHip + 45 + dissolveY);
        ctx.lineTo(cx - 65, cyHip + 55 + dissolveY);
        ctx.moveTo(cx + 12, cyHip + dissolveY);
        ctx.lineTo(cx + 35, cyHip + 45 + dissolveY);
        ctx.lineTo(cx + 65, cyHip + 55 + dissolveY);
        ctx.stroke();

        drawHead(cx, cyHead + dissolveY, headR, 'surprised', t, 0.4);

        // Faíscas de dissolução
        ctx.fillStyle = accentColor;
        for (let i = 0; i < 18; i++) {
          const spX = cx + Math.sin(i * 1.8 + t * 4) * 80;
          const spY = cyHead + (i * 15 - (t * 80) % 250);
          const rSp = 4 + (i % 4);
          ctx.beginPath();
          ctx.arc(spX, spY, rSp, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
        return;
      }

      // Pose Padrão / Andando / Vitória (Standby / Confident)
      // 1. Tronco estilizado
      ctx.fillStyle = colorBody;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.roundRect(cx - 25, cyBodyTop, 50, 92, [14, 14, 8, 8]);
      ctx.fill();
      ctx.stroke();

      // Detalhe moderno na camiseta (estampa sutil geométrica)
      ctx.fillStyle = '#ffffff';
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.arc(cx, cyBodyTop + 35, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;

      // 2. Pernas com passada ou pose firme
      const walkCycle = Math.sin(t * 5);
      const isWalking = pose === 'walk' || pose === 'victory';

      ctx.lineWidth = 14;
      ctx.strokeStyle = '#0f172a';
      ctx.beginPath();
      if (isWalking) {
        // Perna E
        ctx.moveTo(cx - 14, cyHip);
        ctx.lineTo(cx - 15 - walkCycle * 25, cyHip + 50);
        ctx.lineTo(cx - 20 - walkCycle * 38, cyHip + 110);
        // Perna D
        ctx.moveTo(cx + 14, cyHip);
        ctx.lineTo(cx + 15 + walkCycle * 25, cyHip + 50);
        ctx.lineTo(cx + 20 + walkCycle * 38, cyHip + 110);
      } else {
        // Perna firme ligeiramente aberta
        ctx.moveTo(cx - 14, cyHip);
        ctx.lineTo(cx - 30, cyHip + 55);
        ctx.lineTo(cx - 35, cyHip + 115);
        ctx.moveTo(cx + 14, cyHip);
        ctx.lineTo(cx + 30, cyHip + 55);
        ctx.lineTo(cx + 35, cyHip + 115);
      }
      ctx.stroke();

      // 3. Braços
      ctx.beginPath();
      if (pose === 'victory') {
        // Braço em sinal de V / punho erguido confiante
        ctx.moveTo(cx - 22, cyBodyTop + 15);
        ctx.lineTo(cx - 55, cyBodyTop + 35);
        ctx.lineTo(cx - 45, cyBodyTop + 80);

        ctx.moveTo(cx + 22, cyBodyTop + 15);
        ctx.lineTo(cx + 65, cyBodyTop - 25);
        ctx.lineTo(cx + 75, cyBodyTop - 85);
      } else if (isWalking) {
        // Balanço natural de caminhada
        ctx.moveTo(cx - 22, cyBodyTop + 15);
        ctx.lineTo(cx - 45 + walkCycle * 25, cyBodyTop + 60);
        ctx.lineTo(cx - 55 + walkCycle * 35, cyBodyTop + 95);

        ctx.moveTo(cx + 22, cyBodyTop + 15);
        ctx.lineTo(cx + 45 - walkCycle * 25, cyBodyTop + 60);
        ctx.lineTo(cx + 55 - walkCycle * 35, cyBodyTop + 95);
      } else {
        // Braços em repouso dinâmico ou mãos na cintura
        ctx.moveTo(cx - 22, cyBodyTop + 15);
        ctx.lineTo(cx - 50, cyBodyTop + 45);
        ctx.lineTo(cx - 25, cyBodyTop + 85);

        ctx.moveTo(cx + 22, cyBodyTop + 15);
        ctx.lineTo(cx + 50, cyBodyTop + 45);
        ctx.lineTo(cx + 25, cyBodyTop + 85);
      }
      ctx.stroke();

      // 4. Cabeça e Rosto
      drawHead(cx, cyHead + bobY, headR, expr, t, mouthVal);

      ctx.restore();
    }

    /**
     * Desenha a cabeça com feições super expressivas e animadas
     */
    function drawHead(x, y, r, expr, t, mouthVal) {
      // 1. Contorno e preenchimento da cabeça (pele estilizada clara)
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Piscar natural a cada 3.5s
      const blinkCycle = (t * 1.5) % 4;
      const isBlinking = blinkCycle > 3.82;

      // 2. Olhos expressivos
      const eyeDist = 18;
      const eyeR = isBlinking ? 2 : 7;
      const eyeH = isBlinking ? 2 : 12;

      ctx.fillStyle = '#0f172a';

      if (expr === 'angry') {
        // Olhos cerrados de determinação/combate
        ctx.beginPath();
        ctx.ellipse(x - eyeDist, y - 5, eyeR + 2, eyeH, -0.2, 0, Math.PI * 2);
        ctx.ellipse(x + eyeDist, y - 5, eyeR + 2, eyeH, 0.2, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelhas franzidas angulares
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(x - eyeDist - 12, y - 26);
        ctx.lineTo(x - 4, y - 16);
        ctx.moveTo(x + 4, y - 16);
        ctx.lineTo(x + eyeDist + 12, y - 26);
        ctx.stroke();
      } else if (expr === 'surprised') {
        // Olhos arregalados redondos com brilho
        ctx.beginPath();
        ctx.arc(x - eyeDist, y - 6, 11, 0, Math.PI * 2);
        ctx.arc(x + eyeDist, y - 6, 11, 0, Math.PI * 2);
        ctx.fill();

        // Brilho nos olhos (anime spark)
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - eyeDist - 3, y - 9, 3.5, 0, Math.PI * 2);
        ctx.arc(x + eyeDist - 3, y - 9, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelhas arqueadas no alto
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(x - eyeDist, y - 22, 10, Math.PI * 1.1, Math.PI * 1.9);
        ctx.arc(x + eyeDist, y - 22, 10, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      } else if (expr === 'confident' || expr === 'happy') {
        // Olhos expressivos com formato curvo ou piscadela
        ctx.beginPath();
        ctx.ellipse(x - eyeDist, y - 4, eyeR, eyeH, 0, 0, Math.PI * 2);
        ctx.ellipse(x + eyeDist, y - 4, eyeR, eyeH, 0, 0, Math.PI * 2);
        ctx.fill();

        // Brilho branco
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x - eyeDist - 2, y - 7, 3, 0, Math.PI * 2);
        ctx.arc(x + eyeDist - 2, y - 7, 3, 0, Math.PI * 2);
        ctx.fill();

        // Sobrancelhas confiantes
        ctx.lineWidth = 5;
        ctx.strokeStyle = '#0f172a';
        ctx.beginPath();
        ctx.moveTo(x - eyeDist - 10, y - 22);
        ctx.lineTo(x - eyeDist + 10, y - 20);
        ctx.moveTo(x + eyeDist - 10, y - 20);
        ctx.lineTo(x + eyeDist + 10, y - 24);
        ctx.stroke();
      } else {
        // Sleepy / Neutro
        ctx.beginPath();
        ctx.ellipse(x - eyeDist, y - 2, eyeR, eyeH * 0.7, 0, 0, Math.PI * 2);
        ctx.ellipse(x + eyeDist, y - 2, eyeR, eyeH * 0.7, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Boca animada com fala e expressão
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#0f172a';
      ctx.fillStyle = '#b91c1c';

      const mouthH = Math.max(2, mouthVal * 16);

      if (mouthVal > 0.15) {
        // Boca aberta falando sincronizada
        ctx.beginPath();
        ctx.ellipse(x, y + 22, 12, mouthH, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (expr === 'happy' || expr === 'confident') {
        // Sorriso largo
        ctx.beginPath();
        ctx.arc(x, y + 16, 16, 0.15 * Math.PI, 0.85 * Math.PI);
        ctx.stroke();
      } else if (expr === 'surprised') {
        // Boca pequena circular em "O"
        ctx.beginPath();
        ctx.arc(x, y + 24, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      } else if (expr === 'angry') {
        // Linha firme determinada
        ctx.beginPath();
        ctx.moveTo(x - 12, y + 24);
        ctx.lineTo(x + 12, y + 22);
        ctx.stroke();
      } else {
        // Linha neutra suave
        ctx.beginPath();
        ctx.moveTo(x - 10, y + 22);
        ctx.lineTo(x + 10, y + 22);
        ctx.stroke();
      }

      ctx.restore();
    }

    // Atualizador de animação a cada quadro
    group.userData.animate = function(t, sceneIndex, cam) {
      state.tGlobal = t;

      // Alinhar plano para olhar perfeitamente para a câmera (Billboard)
      if (cam) {
        group.quaternion.copy(cam.quaternion);
        // Travar inclinação vertical excessiva para o personagem ficar de pé
        group.rotation.x = 0;
        group.rotation.z = 0;
      }

      // Variação de fala (boca modulada por onda)
      const talking = (Math.sin(t * 14) > 0.1) ? Math.abs(Math.sin(t * 18)) : 0;

      // Poses por cena
      if (role === 'hero') {
        if (sceneIndex === 0) {
          state.pose = 'wake';
          state.expression = 'sleepy';
        } else if (sceneIndex === 1) {
          state.pose = 'standby';
          state.expression = 'surprised';
        } else if (sceneIndex === 2) {
          state.pose = 'standby';
          state.expression = 'angry';
        } else if (sceneIndex === 3) {
          state.pose = 'fight';
          state.expression = 'angry';
        } else {
          state.pose = 'victory';
          state.expression = 'confident';
        }
      } else {
        // Rival
        if (sceneIndex <= 1) {
          group.visible = false;
        } else if (sceneIndex === 2) {
          group.visible = true;
          state.pose = 'standby';
          state.expression = 'angry';
        } else if (sceneIndex === 3) {
          group.visible = true;
          state.pose = 'fight';
          state.expression = 'angry';
        } else {
          group.visible = true;
          state.pose = 'dissolve';
          state.expression = 'surprised';
        }
      }

      // Renderiza novo quadro 2D
      renderCharacter2D(t, state.pose, state.expression, talking);
      texture.needsUpdate = true;
    };

    // Render inicial
    renderCharacter2D(0, 'wake', 'sleepy', 0);
    texture.needsUpdate = true;

    return group;
  }

  // Exportar para escopo global
  window.createExpressiveStickmanActor = createExpressiveStickmanActor;

})(window);
