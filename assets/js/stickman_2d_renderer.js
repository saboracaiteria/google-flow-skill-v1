/**
 * stickman_2d_renderer.js
 * Motor de Animação 2D Puro estilo YouTube Shorts / TikTok virais
 * Inspirado nas regras da biblioteca/estilo-palito:
 * - Traço preto orgânico espesso (ink style, contorno cartoon)
 * - Cabeça circular expressiva com olhos grandes piscando e boca animada de fala
 * - Camiseta colorida viva (vermelho vivo / ciano)
 * - Poses dinâmicas desenhadas em tempo real: respiração, pulo, esquiva, corte de katana, vitória
 * - Efeitos visuais 2D: linhas de impacto estilo mangá, flashes de ação, poeira de chão, corte de luz
 * - Câmera 2D cinematográfica com zooms, tremores de impacto (shake) e pan suave
 */
(function(global) {
  'use strict';

  // Utilitários de curva e tempo
  const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  const lerp = (a, b, x) => a + (b - a) * x;
  const easeOut = (u) => 1 - Math.pow(1 - clamp(u), 3);
  const easeIO = (u) => (u = clamp(u), u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);

  // Desenhar boneco palito estilizado em Canvas 2D
  function drawStickFigure(ctx, opt) {
    const {
      x, y, scale = 1,
      pose = 'idle',
      shirtColor = '#e11d48',
      facing = 1,
      time = 0,
      speaking = false,
      alpha = 1
    } = opt;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(x, y);
    ctx.scale(facing * scale, scale);

    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    const strokeW = 6;
    ctx.lineWidth = strokeW;
    ctx.strokeStyle = '#0f172a';

    // Parâmetros de oscilação natural
    const breath = Math.sin(time * 3.5) * 4;
    const legSwing = Math.sin(time * 7) * 22;

    let headX = 0, headY = -120 + breath;
    let chestX = 0, chestY = -70 + breath * 0.7;
    let pelvisX = 0, pelvisY = -25;
    let handLX = -22, handLY = -60;
    let handRX = 22, handRY = -60;
    let footLX = -18, footLY = 0;
    let footRX = 18, footRY = 0;
    let expression = 'determined';

    if (pose === 'idle') {
      headY = -120 + breath;
      chestY = -70 + breath * 0.7;
      pelvisY = -25;
      handLX = -26; handLY = -55 + breath;
      handRX = 24;  handRY = -58 + breath;
      footLX = -16; footLY = 0;
      footRX = 16;  footRY = 0;
      expression = 'neutral';
    } else if (pose === 'curious' || pose === 'wake') {
      // Olhando em volta, mão no queixo
      const u = clamp(time / 2.5);
      headY = lerp(-100, -120, easeOut(u));
      headX = Math.sin(time * 1.5) * 6;
      chestY = -70;
      handLX = lerp(-40, -18, easeOut(u));
      handLY = lerp(-30, -95, easeOut(u)); // mão no queixo
      handRX = 28; handRY = -50;
      expression = 'curious';
    } else if (pose === 'alert') {
      // Posição de guarda, fletindo joelhos
      headY = -105 + Math.sin(time * 5) * 2;
      chestY = -60;
      pelvisY = -18;
      handLX = -20; handLY = -78; // guarda alta
      handRX = 26;  handRY = -74;
      footLX = -30; footLY = 0;
      footRX = 25;  footRY = 0;
      expression = 'shock';
    } else if (pose === 'combat_stance') {
      // Empunhando espada de neon
      headY = -110;
      chestY = -65;
      pelvisY = -20;
      handLX = -15; handLY = -80;
      handRX = 45;  handRY = -90; // segurando katana
      footLX = -28; footLY = 0;
      footRX = 30;  footRY = 0;
      expression = 'focused';
    } else if (pose === 'slash') {
      // Corte aéreo dinâmico
      const cycle = (time * 2.8) % 1;
      const s = easeIO(cycle);
      headX = lerp(-20, 30, s);
      headY = lerp(-140, -110, s);
      chestX = lerp(-15, 20, s);
      chestY = lerp(-85, -60, s);
      pelvisX = lerp(-10, 10, s);
      pelvisY = lerp(-40, -20, s);
      handRX = lerp(-40, 75, s);
      handRY = lerp(-130, -50, s);
      handLX = lerp(-60, -10, s);
      handLY = lerp(-60, -70, s);
      footLX = -35; footLY = lerp(-20, 0, s);
      footRX = 40;  footRY = lerp(-30, 0, s);
      expression = 'attack';
    } else if (pose === 'jump_dodge') {
      // Esquiva acrobática no ar
      const arc = Math.sin(clamp((time % 2) / 2) * Math.PI) * 70;
      headY = -150 - arc;
      chestY = -100 - arc;
      pelvisY = -55 - arc;
      handLX = -45; handLY = -120 - arc;
      handRX = 45;  handRY = -120 - arc;
      footLX = -25; footLY = -30 - arc;
      footRX = 25;  footRY = -30 - arc;
      expression = 'focused';
    } else if (pose === 'victory') {
      // Braços erguidos comemorando ou guardando a arma
      headY = -125 + Math.sin(time * 2) * 3;
      chestY = -75;
      pelvisY = -25;
      handLX = -40; handLY = -140; // braço ao alto
      handRX = 40;  handRY = -140; // braço ao alto
      footLX = -20; footLY = 0;
      footRX = 20;  footRY = 0;
      expression = 'happy';
    }

    // 1. Pernas
    ctx.beginPath();
    ctx.moveTo(pelvisX - 6, pelvisY);
    ctx.quadraticCurveTo(pelvisX - 14, (pelvisY + footLY) / 2, footLX, footLY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(pelvisX + 6, pelvisY);
    ctx.quadraticCurveTo(pelvisX + 14, (pelvisY + footRY) / 2, footRX, footRY);
    ctx.stroke();

    // Sapatos / Pés cartoon
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(footLX + 2, footLY, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(footRX + 2, footRY, 10, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // 2. Tronco / Camiseta colorida estilo viral
    ctx.fillStyle = shirtColor;
    ctx.beginPath();
    ctx.moveTo(chestX - 16, chestY - 10);
    ctx.lineTo(chestX + 16, chestY - 10);
    ctx.lineTo(pelvisX + 14, pelvisY);
    ctx.lineTo(pelvisX - 14, pelvisY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Gola da blusa
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(chestX, chestY - 10, 8, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Braços
    ctx.beginPath();
    ctx.moveTo(chestX - 14, chestY - 6);
    ctx.quadraticCurveTo((chestX - 14 + handLX) / 2 - 8, (chestY + handLY) / 2, handLX, handLY);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(chestX + 14, chestY - 6);
    ctx.quadraticCurveTo((chestX + 14 + handRX) / 2 + 8, (chestY + handRY) / 2, handRX, handRY);
    ctx.stroke();

    // Mãos circulares cartoon
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(handLX, handLY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(handRX, handRY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Arma / Katana se estiver em combate
    if (pose === 'combat_stance' || pose === 'slash') {
      ctx.save();
      ctx.strokeStyle = '#38bdf8'; // lâmina de neon ciano
      ctx.lineWidth = 5;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.moveTo(handRX, handRY);
      ctx.lineTo(handRX + 55, handRY - 45);
      ctx.stroke();
      // Cabo
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.shadowBlur = 0;
      ctx.beginPath();
      ctx.moveTo(handRX - 8, handRY + 8);
      ctx.lineTo(handRX, handRY);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Cabeça circular cartoon HD
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX, headY, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 5. Expressões faciais expressivas
    drawFace(ctx, headX, headY, expression, time, speaking);

    ctx.restore();
  }

  // Rosto animado 2D expressivo (olhos, sobrancelhas e boca)
  function drawFace(ctx, hx, hy, exp, time, speaking) {
    const blink = (time % 3.8 < 0.15); // piscar natural
    const eyeDist = 9;
    const eyeY = hy - 3;

    ctx.fillStyle = '#0f172a';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;

    // Olhos
    if (blink && exp !== 'attack') {
      // Olho fechado
      ctx.beginPath();
      ctx.moveTo(hx - eyeDist - 5, eyeY);
      ctx.lineTo(hx - eyeDist + 5, eyeY);
      ctx.moveTo(hx + eyeDist - 5, eyeY);
      ctx.lineTo(hx + eyeDist + 5, eyeY);
      ctx.stroke();
    } else if (exp === 'shock' || exp === 'curious') {
      // Olhos grandes arregalados
      ctx.beginPath();
      ctx.arc(hx - eyeDist, eyeY, 6, 0, Math.PI * 2);
      ctx.arc(hx + eyeDist, eyeY, 6, 0, Math.PI * 2);
      ctx.fill();
      // Brilho na pupila
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx - eyeDist - 2, eyeY - 2, 2, 0, Math.PI * 2);
      ctx.arc(hx + eyeDist - 2, eyeY - 2, 2, 0, Math.PI * 2);
      ctx.fill();
    } else if (exp === 'focused' || exp === 'attack') {
      // Olhar determinado inclinado
      ctx.beginPath();
      ctx.ellipse(hx - eyeDist, eyeY, 4.5, 3.5, -0.2, 0, Math.PI * 2);
      ctx.ellipse(hx + eyeDist, eyeY, 4.5, 3.5, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // Sobrancelhas franzidas de anime
      ctx.beginPath();
      ctx.moveTo(hx - eyeDist - 6, eyeY - 8);
      ctx.lineTo(hx - eyeDist + 5, eyeY - 5);
      ctx.moveTo(hx + eyeDist + 6, eyeY - 8);
      ctx.lineTo(hx + eyeDist - 5, eyeY - 5);
      ctx.stroke();
    } else {
      // Olhos normais vivos com brilho
      ctx.beginPath();
      ctx.arc(hx - eyeDist, eyeY, 4.5, 0, Math.PI * 2);
      ctx.arc(hx + eyeDist, eyeY, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx - eyeDist - 1.5, eyeY - 1.5, 1.5, 0, Math.PI * 2);
      ctx.arc(hx + eyeDist - 1.5, eyeY - 1.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Boca animada (sincronizada com fala ou expressão)
    ctx.fillStyle = '#0f172a';
    ctx.lineWidth = 3;
    const mouthY = hy + 11;

    if (speaking) {
      // Falando: abre e fecha ciclicamente
      const mouthOpen = 2 + Math.abs(Math.sin(time * 14)) * 7;
      ctx.beginPath();
      ctx.ellipse(hx, mouthY, 6, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (exp === 'happy') {
      // Sorriso largo
      ctx.beginPath();
      ctx.arc(hx, mouthY - 3, 9, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    } else if (exp === 'shock') {
      // Boca em 'O' surpreso
      ctx.beginPath();
      ctx.arc(hx, mouthY + 1, 5, 0, Math.PI * 2);
      ctx.stroke();
    } else if (exp === 'attack') {
      // Dentes cerrados ou grito
      ctx.beginPath();
      ctx.moveTo(hx - 7, mouthY);
      ctx.lineTo(hx + 7, mouthY);
      ctx.stroke();
    } else {
      // Boca fechada sutil
      ctx.beginPath();
      ctx.moveTo(hx - 5, mouthY);
      ctx.lineTo(hx + 4, mouthY);
      ctx.stroke();
    }
  }

  // Desenhar linhas de impacto / Speed lines de ação
  function drawSpeedLines(ctx, w, h, intensity) {
    if (intensity <= 0) return;
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${Math.min(0.65, intensity * 0.7)})`;
    ctx.lineWidth = 3;
    const cx = w / 2, cy = h / 2;
    const numLines = Math.floor(intensity * 36);
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2 + Math.random() * 0.05;
      const rInner = 200 + Math.random() * 80;
      const rOuter = Math.max(w, h);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * rInner, cy + Math.sin(angle) * rInner);
      ctx.lineTo(cx + Math.cos(angle) * rOuter, cy + Math.sin(angle) * rOuter);
      ctx.stroke();
    }
    ctx.restore();
  }

  // Render principal da Cena 2D
  function renderStickmanScene2D(ctx, w, h, sceneIndex, sceneTime, totalTime, isSpeaking) {
    ctx.save();

    // Sincronização estrita da boca: só mexe se isSpeaking for verdadeiro
    const speakingAnim = isSpeaking === true;

    // 1. Fundo Gradiente Estilizado por Cena (estilo animação moderna)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (sceneIndex === 0) {
      // O Despertar: Vazio místico azul noite profundo
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.6, '#1e293b');
      bgGrad.addColorStop(1, '#334155');
    } else if (sceneIndex === 1) {
      // A Linha Vermelha: Tensão crescente com horizonte rubro
      bgGrad.addColorStop(0, '#18070b');
      bgGrad.addColorStop(0.5, '#450a0a');
      bgGrad.addColorStop(1, '#7f1d1d');
    } else if (sceneIndex === 2) {
      // O Guardião: Contraste escuro de duelo
      bgGrad.addColorStop(0, '#020617');
      bgGrad.addColorStop(0.6, '#111827');
      bgGrad.addColorStop(1, '#312e81');
    } else if (sceneIndex === 3) {
      // O Combate: Fundo dinâmico com faíscas de energia
      const pulse = Math.sin(sceneTime * 8) * 0.15;
      bgGrad.addColorStop(0, '#090d16');
      bgGrad.addColorStop(0.5, `rgba(88, 28, 135, ${0.8 + pulse})`);
      bgGrad.addColorStop(1, '#1e1b4b');
    } else {
      // A Vitória: Aurora dourada e céu aberto triunfante
      bgGrad.addColorStop(0, '#0284c7');
      bgGrad.addColorStop(0.4, '#38bdf8');
      bgGrad.addColorStop(0.8, '#fde047');
      bgGrad.addColorStop(1, '#fef08a');
    }

    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. Chão com perspectiva e grade estilizada
    // Linha do chão / horizonte (subida para 60% da altura, dando mais profundidade e visibilidade)
    const groundY = h * 0.60;
    ctx.strokeStyle = sceneIndex === 1 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 2;

    // Grade de chão em perspectiva
    for (let x = -w; x <= w * 2; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, h);
      ctx.lineTo(w / 2 + (x - w / 2) * 0.15, groundY);
      ctx.stroke();
    }
    // Linhas horizontais do chão
    for (let y = groundY; y <= h; y += 45) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Linha de solo principal
    ctx.strokeStyle = sceneIndex === 1 ? '#ef4444' : '#ffffff';
    ctx.lineWidth = sceneIndex === 1 ? 5 : 4;
    if (sceneIndex === 1) {
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 18;
    }
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(w, groundY);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 3. Câmera com Zoom e Shake de Impacto
    let camShakeX = 0, camShakeY = 0;
    if (sceneIndex === 3) {
      // Tremor no combate
      const shakeAmp = Math.max(0, Math.sin(sceneTime * 12)) * 6;
      camShakeX = (Math.random() - 0.5) * shakeAmp;
      camShakeY = (Math.random() - 0.5) * shakeAmp;
    }

    ctx.translate(camShakeX, camShakeY);

    // 4. Ações e Personagens Específicos por Cena
    const centerX = w / 2;

    if (sceneIndex === 0) {
      // CENA 1: O Despertar
      // Câmera dá zoom suave se aproximando do Stick
      const zoom = lerp(0.85, 1.15, clamp(sceneTime / 12));
      ctx.save();
      ctx.translate(centerX, groundY);
      ctx.scale(zoom, zoom);
      ctx.translate(-centerX, -groundY);

      drawStickFigure(ctx, {
        x: centerX,
        y: groundY,
        scale: 1.4,
        pose: sceneTime < 3.5 ? 'wake' : 'curious',
        shirtColor: '#0284c7', // azul herói
        facing: sceneTime > 6 ? (Math.sin(sceneTime * 0.8) > 0 ? 1 : -1) : 1,
        time: sceneTime,
        speaking: speakingAnim
      });
      ctx.restore();

    } else if (sceneIndex === 1) {
      // CENA 2: A Linha Vermelha
      // Uma fenda rubra racha o chão com partículas de fenda
      const crackProg = clamp(sceneTime / 6);
      ctx.save();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 6;
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.moveTo(centerX - 10, groundY);
      for (let i = 0; i < 8; i++) {
        const px = centerX + (i % 2 === 0 ? 18 : -18) * Math.sin(i);
        const py = groundY + i * 22 * crackProg;
        ctx.lineTo(px, py);
      }
      ctx.stroke();
      ctx.restore();

      // Partículas vermelhas subindo da fenda
      for (let i = 0; i < 15; i++) {
        const partT = (sceneTime * 0.8 + i * 0.2) % 1;
        const partX = centerX + Math.sin(i * 1.7) * 90;
        const partY = groundY - partT * 180;
        ctx.fillStyle = `rgba(239, 68, 68, ${1 - partT})`;
        ctx.beginPath();
        ctx.arc(partX, partY, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      // Stick em pose de alerta e recuo
      drawStickFigure(ctx, {
        x: centerX - 140,
        y: groundY,
        scale: 1.35,
        pose: 'alert',
        shirtColor: '#0284c7',
        facing: 1,
        time: sceneTime,
        speaking: speakingAnim
      });

    } else if (sceneIndex === 2) {
      // CENA 3: O Guardião Escarlate
      // Stickman Herói (Esquerda) vs Rival Escarlate (Direita)
      const rivalIntro = easeOut(clamp(sceneTime / 2.0));
      const rivalX = lerp(w + 100, centerX + 150, rivalIntro);

      // Herói entra em pose de combate
      drawStickFigure(ctx, {
        x: centerX - 140,
        y: groundY,
        scale: 1.35,
        pose: 'combat_stance',
        shirtColor: '#0284c7',
        facing: 1,
        time: sceneTime,
        speaking: speakingAnim
      });

      // Rival Escarlate (Vermelho com olhos vermelhos brilhantes)
      drawStickFigure(ctx, {
        x: rivalX,
        y: groundY,
        scale: 1.35,
        pose: 'combat_stance',
        shirtColor: '#dc2626', // vermelho sombrio
        facing: -1,
        time: sceneTime,
        speaking: false
      });

      // Brilho de energia entre os dois
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(centerX - 100, groundY - 70);
      ctx.lineTo(rivalX - 40, groundY - 70);
      ctx.stroke();
      ctx.restore();

    } else if (sceneIndex === 3) {
      // CENA 4: O Combate Relâmpago
      // Ação frenética estilo anime
      const clashCycle = (sceneTime * 2.5) % 2;
      const isClashing = clashCycle < 0.6;

      drawSpeedLines(ctx, w, h, isClashing ? 0.9 : 0.3);

      // Stick Herói atacando em alta velocidade
      const heroX = isClashing ? centerX - 60 : centerX - 160;
      drawStickFigure(ctx, {
        x: heroX,
        y: groundY - (isClashing ? 20 : 0),
        scale: 1.45,
        pose: isClashing ? 'slash' : 'jump_dodge',
        shirtColor: '#0284c7',
        facing: 1,
        time: sceneTime,
        speaking: speakingAnim
      });

      // Rival esquivando ou bloqueando
      const rivalX = isClashing ? centerX + 60 : centerX + 160;
      drawStickFigure(ctx, {
        x: rivalX,
        y: groundY,
        scale: 1.45,
        pose: isClashing ? 'combat_stance' : 'slash',
        shirtColor: '#dc2626',
        facing: -1,
        time: sceneTime + 0.3,
        speaking: false
      });

      // Flash de choque na colisão das armas
      if (isClashing) {
        ctx.save();
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(centerX, groundY - 80, 45 + Math.random() * 20, 0, Math.PI * 2);
        ctx.fill();

        // Raios de faísca
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        for (let i = 0; i < 8; i++) {
          const ang = (i / 8) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(centerX, groundY - 80);
          ctx.lineTo(centerX + Math.cos(ang) * 90, groundY - 80 + Math.sin(ang) * 90);
          ctx.stroke();
        }
        ctx.restore();
      }

    } else {
      // CENA 5: A Vitória e o Novo Horizonte
      // O Herói caminha triunfante com luz dourada
      const walkProg = clamp(sceneTime / 12);
      const heroX = lerp(centerX - 80, centerX + 180, walkProg);

      // Partículas douradas de dissipação do inimigo
      for (let i = 0; i < 20; i++) {
        const pT = (sceneTime * 0.5 + i * 0.1) % 1;
        const px = centerX + 120 + Math.sin(i * 3) * 60;
        const py = groundY - pT * 220;
        ctx.fillStyle = `rgba(253, 224, 71, ${1 - pT})`;
        ctx.beginPath();
        ctx.arc(px, py, 3 + Math.sin(i), 0, Math.PI * 2);
        ctx.fill();
      }

      // Sol estilizado nascendo no horizonte
      ctx.save();
      ctx.fillStyle = 'rgba(254, 240, 138, 0.45)';
      ctx.beginPath();
      ctx.arc(centerX, groundY, 180, Math.PI, 0, false);
      ctx.fill();
      ctx.restore();

      drawStickFigure(ctx, {
        x: heroX,
        y: groundY,
        scale: 1.35,
        pose: 'victory',
        shirtColor: '#0284c7',
        facing: 1,
        time: sceneTime,
        speaking: speakingAnim
      });
    }

    // 5. Vinheta e borda cinematográfica
    const vignette = ctx.createRadialGradient(w / 2, h / 2, w * 0.4, w / 2, h / 2, w * 0.85);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.4)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, w, h);

    ctx.restore();
  }

  // Exportar API no global
  global.Stickman2DRenderer = {
    render: renderStickmanScene2D,
    drawStickFigure: drawStickFigure,
    drawSpeedLines: drawSpeedLines
  };

})(window);
