/**
 * MojuRenderer - Renderizador 2D Canvas estilizado para
 * "Moju e a Estranha Vila das Pernas Cinzentas" (45s Vertical Shorts)
 */
(function(global) {
  'use strict';

  // ========================================================
  // ANATOMIA HUMANA COMPLEXA E EXPRESSIVA (CORPOS AMAZÔNICOS)
  // ========================================================

  function drawComplexHuman(ctx, opt) {
    ctx.save();
    const x = opt.x || 0;
    const y = opt.y || 0;
    const scale = opt.scale || 1.0;
    const flip = opt.flip ? -1 : 1;
    const animTime = opt.time || 0;
    const isWalking = opt.walking || false;
    const walkSpeed = opt.walkSpeed || 6;
    const isBreathing = opt.breathing !== false;
    const skinColor = opt.skinColor || '#c68352'; // Morena cabocla
    const ashSkin = opt.ashSkin || '#94a3b8';     // Tabatinga cinzenta
    const dressColor = opt.dressColor || '#e11d48';
    const hairColor = opt.hairColor || '#0f172a';
    const hairStyle = opt.hairStyle || 'long';
    const gender = opt.gender || 'female';
    const armPose = opt.armPose || 'down';
    const legsAshOnly = opt.legsAshOnly !== false;

    ctx.translate(x, y);
    ctx.scale(flip * scale, scale);

    const breath = isBreathing ? Math.sin(animTime * 2.5) * 2.5 : 0;
    const walkPhase = isWalking ? Math.sin(animTime * walkSpeed) : 0;

    // Sombra suave aos pés
    ctx.save();
    ctx.fillStyle = 'rgba(2, 6, 23, 0.45)';
    ctx.beginPath();
    ctx.ellipse(0, 4, 46, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const legSkin = legsAshOnly ? ashSkin : skinColor;

    // 1. Pernas anatômicas articuladas
    const legBackAngle = isWalking ? -walkPhase * 0.35 : 0.04;
    drawArticulatedLeg(ctx, -13, -118, legBackAngle, legSkin, true, opt);

    const legFrontAngle = isWalking ? walkPhase * 0.35 : -0.04;
    drawArticulatedLeg(ctx, 13, -118, legFrontAngle, legSkin, false, opt);

    // 2. Tronco / Vestimenta
    ctx.save();
    ctx.translate(0, -120 + breath * 0.4);

    if (gender === 'female') {
      // Saia rodada paraense com pregas
      ctx.fillStyle = dressColor;
      ctx.beginPath();
      ctx.moveTo(-18, -8);
      ctx.bezierCurveTo(-28, 22, -38, 55, -45 + (isWalking ? walkPhase * 6 : 0), 78);
      ctx.quadraticCurveTo(0, 84, 45 + (isWalking ? -walkPhase * 6 : 0), 78);
      ctx.bezierCurveTo(38, 55, 28, 22, 18, -8);
      ctx.closePath();
      ctx.fill();

      // Detalhes de babados e pregas
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(0, 78, 43, 0.15, Math.PI - 0.15);
      ctx.stroke();

      // Blusa / Tronco
      ctx.fillStyle = dressColor;
      ctx.beginPath();
      ctx.moveTo(-18, -8);
      ctx.bezierCurveTo(-22, -35, -20, -58, -16, -72);
      ctx.lineTo(16, -72);
      ctx.bezierCurveTo(20, -58, 22, -35, 18, -8);
      ctx.closePath();
      ctx.fill();

      // Colo / Decote
      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.moveTo(-11, -72);
      ctx.quadraticCurveTo(0, -54, 11, -72);
      ctx.closePath();
      ctx.fill();
    } else {
      // Masculino: Calça de pescador dobrada
      ctx.fillStyle = '#334155';
      ctx.fillRect(-16, -10, 32, 54);

      // Camisa simples
      ctx.fillStyle = dressColor;
      ctx.fillRect(-17, -72, 34, 62);

      ctx.fillStyle = skinColor;
      ctx.beginPath();
      ctx.arc(0, -70, 7, 0, Math.PI);
      ctx.fill();
    }

    // Braço traseiro
    drawComplexArm(ctx, -17, -68, 'back', armPose, animTime, skinColor, dressColor, opt);

    // 3. Pescoço e Cabeça
    ctx.save();
    ctx.translate(0, -74);

    ctx.fillStyle = skinColor;
    ctx.fillRect(-6, -10, 12, 12);

    // Cabeça
    ctx.beginPath();
    ctx.ellipse(0, -25, 15, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Olhos e feições
    drawExpressiveFace(ctx, opt.lookAt || 'forward');

    // Cabelo trabalhado
    drawExpressiveHair(ctx, hairColor, hairStyle, animTime, gender);

    ctx.restore(); // fim cabeça

    // Braço dianteiro
    drawComplexArm(ctx, 17, -68, 'front', armPose, animTime, skinColor, dressColor, opt);

    ctx.restore(); // fim tronco
    ctx.restore(); // fim corpo
  }

  function drawArticulatedLeg(ctx, attachX, attachY, angle, skinCol, isBack, opt) {
    ctx.save();
    ctx.translate(attachX, attachY);
    ctx.rotate(angle);

    // Coxa torneada
    ctx.fillStyle = skinCol;
    ctx.beginPath();
    ctx.moveTo(-9, 0);
    ctx.bezierCurveTo(-12, 22, -10, 44, -7, 56);
    ctx.lineTo(7, 56);
    ctx.bezierCurveTo(10, 44, 12, 22, 9, 0);
    ctx.closePath();
    ctx.fill();

    // Joelho
    ctx.beginPath();
    ctx.arc(0, 56, 7.5, 0, Math.PI * 2);
    ctx.fill();

    // Panturrilha com gradiente de poeira/cinza
    ctx.save();
    ctx.translate(0, 56);

    const legGrad = ctx.createLinearGradient(0, 0, 0, 60);
    legGrad.addColorStop(0, skinCol);
    legGrad.addColorStop(0.35, skinCol);
    legGrad.addColorStop(0.7, '#94a3b8');
    legGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = legGrad;

    ctx.beginPath();
    ctx.moveTo(-7, 0);
    ctx.bezierCurveTo(-11, 20, -10, 42, -5, 58);
    ctx.lineTo(5, 58);
    ctx.bezierCurveTo(10, 42, 11, 20, 7, 0);
    ctx.closePath();
    ctx.fill();

    // Grumos de poeira cinzenta na canela
    ctx.fillStyle = 'rgba(241, 245, 249, 0.65)';
    for (let py = 15; py < 55; py += 9) {
      ctx.beginPath();
      ctx.arc(-2 + Math.sin(py * 3) * 3, py, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Pé descalço ou sandália rasteira
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(-5, 58);
    ctx.bezierCurveTo(-5, 64, -2, 66, 12, 66);
    ctx.lineTo(13, 63);
    ctx.quadraticCurveTo(6, 60, 4, 58);
    ctx.closePath();
    ctx.fill();

    ctx.restore(); // panturrilha
    ctx.restore(); // perna
  }

  function drawComplexArm(ctx, attachX, attachY, side, pose, animTime, skinCol, sleeveCol, opt) {
    ctx.save();
    ctx.translate(attachX, attachY);

    let shoulder = 0;
    let elbow = 0;

    if (pose === 'write') {
      if (side === 'front') {
        shoulder = 0.85 + Math.sin(animTime * 3) * 0.08;
        elbow = 1.15 + Math.cos(animTime * 3) * 0.12;
      } else {
        shoulder = 0.15;
        elbow = 0.45;
      }
    } else if (pose === 'lamp') {
      shoulder = side === 'front' ? -0.7 : -0.2;
      elbow = side === 'front' ? 1.6 : 0.4;
    } else if (pose === 'point') {
      shoulder = side === 'front' ? 0.7 : -0.2;
      elbow = 0.25;
    } else {
      const walkArm = opt.walking ? Math.sin(animTime * (opt.walkSpeed || 6)) * 0.35 : 0;
      shoulder = (side === 'front' ? -walkArm : walkArm) + 0.05;
      elbow = 0.18;
    }

    ctx.rotate(shoulder);

    // Braço superior
    ctx.fillStyle = skinCol;
    ctx.beginPath();
    ctx.moveTo(-4, 0);
    ctx.lineTo(-3.5, 26);
    ctx.lineTo(3.5, 26);
    ctx.lineTo(4, 0);
    ctx.closePath();
    ctx.fill();

    // Antebraço
    ctx.translate(0, 26);
    ctx.rotate(elbow);

    ctx.beginPath();
    ctx.arc(0, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(-3.5, 0);
    ctx.lineTo(-2.8, 24);
    ctx.lineTo(2.8, 24);
    ctx.lineTo(3.5, 0);
    ctx.closePath();
    ctx.fill();

    // Mão detalhada com dedo estendido se for pose de escrever
    ctx.translate(0, 24);
    ctx.fillStyle = skinCol;
    ctx.beginPath();
    ctx.ellipse(0, 4, 3.5, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    if (pose === 'write' && side === 'front') {
      ctx.strokeStyle = skinCol;
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(1, 5);
      ctx.lineTo(2.5, 14);
      ctx.stroke();

      // Rastro luminoso na ponta do dedo
      ctx.fillStyle = '#f8fafc';
      ctx.beginPath();
      ctx.arc(2.5, 15, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  function drawExpressiveFace(ctx, lookDir) {
    const eyeY = -26;
    const offset = lookDir === 'down' ? 2 : 0;

    // Olhos
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-6, eyeY + offset, 3.5, 2.2, -0.1, 0, Math.PI * 2);
    ctx.ellipse(6, eyeY + offset, 3.5, 2.2, 0.1, 0, Math.PI * 2);
    ctx.fill();

    // Pupilas escuras
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(-6, eyeY + offset + (lookDir === 'down' ? 0.8 : 0), 1.5, 0, Math.PI * 2);
    ctx.arc(6, eyeY + offset + (lookDir === 'down' ? 0.8 : 0), 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Sobrancelhas finas arqueadas
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-9, eyeY - 4 + offset);
    ctx.lineTo(-3, eyeY - 4 + offset);
    ctx.moveTo(3, eyeY - 4 + offset);
    ctx.lineTo(9, eyeY - 4 + offset);
    ctx.stroke();

    // Lábios suaves
    ctx.fillStyle = '#be123c';
    ctx.beginPath();
    ctx.ellipse(0, -16, 3.5, 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawExpressiveHair(ctx, hairColor, hairStyle, animTime, gender) {
    ctx.fillStyle = hairColor;
    const wind = Math.sin(animTime * 2.5) * 4;

    if (gender === 'female') {
      // Topo do cabelo
      ctx.beginPath();
      ctx.arc(0, -28, 16, Math.PI, 0, false);
      ctx.fill();

      // Cabelo longo balançando suavemente
      ctx.beginPath();
      ctx.moveTo(-15, -28);
      ctx.bezierCurveTo(-22, -8, -24 + wind, 18, -18 + wind * 1.5, 36);
      ctx.quadraticCurveTo(-11, 24, -9, 0);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(15, -28);
      ctx.bezierCurveTo(22, -8, 24 + wind, 18, 18 + wind * 1.5, 36);
      ctx.quadraticCurveTo(11, 24, 9, 0);
      ctx.closePath();
      ctx.fill();

      // Flor amazônica vermelha
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(13, -31, 3.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(13, -31, 1.5, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Cabelo masculino curto
      ctx.beginPath();
      ctx.arc(0, -28, 16, Math.PI * 0.85, Math.PI * 0.15, false);
      ctx.fill();
    }
  }

  function drawForestBackground(ctx, w, h, twilight) {
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    if (twilight) {
      skyGrad.addColorStop(0, '#020617');
      skyGrad.addColorStop(0.35, '#0f172a');
      skyGrad.addColorStop(0.65, '#1e293b');
      skyGrad.addColorStop(1, '#064e3b');
    } else {
      skyGrad.addColorStop(0, '#090d16');
      skyGrad.addColorStop(0.4, '#042f2e');
      skyGrad.addColorStop(0.7, '#064e3b');
      skyGrad.addColorStop(1, '#115e59');
    }
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.7);

    // Lua cheia amazônica
    const moonGrad = ctx.createRadialGradient(w * 0.78, h * 0.16, 5, w * 0.78, h * 0.16, 70);
    moonGrad.addColorStop(0, '#fef9c3');
    moonGrad.addColorStop(0.4, 'rgba(254, 240, 138, 0.85)');
    moonGrad.addColorStop(0.8, 'rgba(254, 240, 138, 0.2)');
    moonGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = moonGrad;
    ctx.beginPath();
    ctx.arc(w * 0.78, h * 0.16, 70, 0, Math.PI * 2);
    ctx.fill();

    // Silhuetas de árvores gigantes da Amazônia (Castanheiras e Açaizeiros)
    ctx.fillStyle = 'rgba(2, 44, 34, 0.9)';
    for (let i = 0; i < 7; i++) {
      const tx = (w / 6) * i - 20;
      const th = h * 0.45 + (i % 3) * 35;
      ctx.fillRect(tx, h * 0.68 - th, 14, th);
      // Copa da árvore
      ctx.beginPath();
      ctx.ellipse(tx + 7, h * 0.68 - th, 45, 30, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRiverBackground(ctx, w, h, riverY, progress) {
    const rGrad = ctx.createLinearGradient(0, riverY, 0, h);
    rGrad.addColorStop(0, '#042f2e');
    rGrad.addColorStop(0.4, '#0f172a');
    rGrad.addColorStop(1, '#020617');
    ctx.fillStyle = rGrad;
    ctx.fillRect(0, riverY, w, h - riverY);

    // Reflexo da lua no rio Moju
    const rx = w * 0.78 + Math.sin(progress * Math.PI * 4) * 8;
    ctx.fillStyle = 'rgba(254, 240, 138, 0.25)';
    for (let r = 0; r < 9; r++) {
      const rw = 20 + r * 12;
      const ry = riverY + 15 + r * 22;
      ctx.fillRect(rx - rw / 2, ry, rw, 3);
    }
  }

  function drawDirtRoadAsh(ctx, w, h, roadY) {
    // Chão de cinzas e tabatinga branca de Moju
    const groundGrad = ctx.createLinearGradient(0, roadY, 0, h);
    groundGrad.addColorStop(0, '#e2e8f0'); // pó cinzento claro
    groundGrad.addColorStop(0.3, '#cbd5e1');
    groundGrad.addColorStop(0.7, '#94a3b8');
    groundGrad.addColorStop(1, '#64748b');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, roadY, w, h - roadY);

    // Marcas de pó e rachaduras de tabatinga
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.1, roadY + 40); ctx.lineTo(w * 0.4, roadY + 80);
    ctx.moveTo(w * 0.55, roadY + 110); ctx.lineTo(w * 0.85, roadY + 140);
    ctx.moveTo(w * 0.25, roadY + 170); ctx.lineTo(w * 0.6, roadY + 210);
    ctx.stroke();

    // Textura de poeira cinzenta
    ctx.fillStyle = 'rgba(241, 245, 249, 0.45)';
    for (let p = 0; p < 28; p++) {
      const px = (p * 47) % w;
      const py = roadY + 15 + (p * 31) % (h - roadY - 30);
      ctx.beginPath();
      ctx.arc(px, py, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawRusticSign(ctx, x, y, text) {
    ctx.save();
    ctx.translate(x, y);

    // Poste de madeira rústica
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-8, -120, 16, 140);

    // Placa
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-120, -170, 240, 56);
    ctx.strokeStyle = '#92400e';
    ctx.lineWidth = 3;
    ctx.strokeRect(-120, -170, 240, 56);

    // Prego
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.arc(0, -142, 4, 0, Math.PI * 2);
    ctx.fill();

    // Texto talhado
    ctx.fillStyle = '#fef08a';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(text, 0, -135);

    ctx.restore();
  }

  function drawAshTrail(ctx, w, h, groundY, progress) {
    // Trilha de terra batida (marrom) com poças de tabatinga branca
    const trailGrad = ctx.createLinearGradient(0, groundY, 0, h);
    trailGrad.addColorStop(0, '#7c4a1e');
    trailGrad.addColorStop(0.45, '#5b3413');
    trailGrad.addColorStop(1, '#3b210c');
    ctx.fillStyle = trailGrad;
    ctx.beginPath();
    ctx.moveTo(w * 0.42, groundY);
    ctx.lineTo(w * 0.58, groundY);
    ctx.lineTo(w * 0.92, h);
    ctx.lineTo(w * 0.08, h);
    ctx.closePath();
    ctx.fill();

    // Poças de cinza/tabatinga espalhadas pelo chão
    for (let a = 0; a < 7; a++) {
      const ax = w * 0.2 + ((a * 137) % Math.floor(w * 0.6));
      const ay = groundY + 30 + ((a * 53) % Math.floor(h - groundY - 60));
      const arx = 26 + (a % 3) * 16;
      const ary = 8 + (a % 2) * 5;
      const ashGrad = ctx.createRadialGradient(ax, ay, 2, ax, ay, arx);
      ashGrad.addColorStop(0, 'rgba(226, 232, 240, 0.85)');
      ashGrad.addColorStop(0.6, 'rgba(203, 213, 225, 0.45)');
      ashGrad.addColorStop(1, 'rgba(148, 163, 184, 0)');
      ctx.fillStyle = ashGrad;
      ctx.beginPath();
      ctx.ellipse(ax, ay, arx, ary, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Capim nas laterais da trilha
    for (let g = 0; g < 16; g++) {
      const gx = (g < 8) ? w * 0.02 + (g * 22) : w * 0.98 - ((g - 8) * 22);
      const gy = groundY + 20 + ((g * 37) % Math.floor(h - groundY - 40));
      const sway = Math.sin(progress * 6 + g) * 4;
      ctx.strokeStyle = g % 2 ? '#166534' : '#15803d';
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      for (let b = -2; b <= 2; b++) {
        ctx.beginPath();
        ctx.moveTo(gx + b * 3, gy);
        ctx.quadraticCurveTo(gx + b * 5 + sway, gy - 14, gx + b * 7 + sway * 1.6, gy - 26);
        ctx.stroke();
      }
    }

    // Vagalumes
    for (let f = 0; f < 14; f++) {
      const fx = (w * 0.08 + f * 61 + Math.sin(progress * 5 + f * 1.7) * 40) % w;
      const fy = h * 0.3 + Math.cos(progress * 4 + f * 2.1) * 60 + (f % 4) * 40;
      const pulse = 0.35 + Math.abs(Math.sin(progress * 7 + f)) * 0.65;
      const fg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 12);
      fg.addColorStop(0, `rgba(250, 240, 137, ${pulse})`);
      fg.addColorStop(1, 'rgba(250, 240, 137, 0)');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.arc(fx, fy, 12, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawFog(ctx, w, h, progress, alpha) {
    ctx.save();
    ctx.fillStyle = `rgba(226, 232, 240, ${alpha || 0.25})`;
    for (let f = 0; f < 6; f++) {
      const fy = h * 0.42 + f * 50;
      const fx = Math.sin((progress * 2 + f) * Math.PI) * 45;
      ctx.beginPath();
      ctx.ellipse(w * 0.5 + fx, fy, w * 0.65, 42, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  const MojuRenderer = {
    render(ctx, w, h, sceneIndex, progress) {
      ctx.save();
      ctx.clearRect(0, 0, w, h);

      const groundY = h * 0.62;

      // ==========================================
      // CENA 1: O Ramal Perdido de Moju
      // ==========================================
      if (sceneIndex === 0) {
        drawForestBackground(ctx, w, h, false);
        drawDirtRoadAsh(ctx, w, h, groundY);
        drawFog(ctx, w, h, progress, 0.22);

        // Placa indicativa misteriosa
        // Placa rústica
        drawRusticSign(ctx, w * 0.22, groundY - 10, 'RAMAL DE MOJU • PA');

        // Moças completas no ramal
        drawComplexHuman(ctx, {
          x: w * 0.72 - progress * 40,
          y: groundY + 45,
          scale: 0.95,
          time: progress * 6,
          walking: true,
          walkSpeed: 5,
          skinColor: '#c68352',
          ashSkin: '#94a3b8',
          dressColor: '#e11d48',
          hairColor: '#090d16',
          hairStyle: 'long',
          gender: 'female',
          legsAshOnly: true,
          armPose: 'walking'
        });

        drawComplexHuman(ctx, {
          x: w * 0.44,
          y: groundY + 50,
          scale: 1.05,
          time: progress * 4,
          walking: false,
          flip: true,
          skinColor: '#b45309',
          ashSkin: '#94a3b8',
          dressColor: '#0284c7',
          hairColor: '#172554',
          hairStyle: 'braids',
          gender: 'female',
          legsAshOnly: true,
          armPose: 'idle'
        });

        // Vagalumes flutuantes
        ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
        for (let i = 0; i < 8; i++) {
          const vx = (w * 0.15 + i * 55 + Math.sin(progress * Math.PI * 4 + i) * 20) % w;
          const vy = (h * 0.35 + Math.cos(progress * Math.PI * 3 + i) * 35);
          ctx.beginPath();
          ctx.arc(vx, vy, 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        // Badge estilizado
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(w * 0.1, h * 0.84, w * 0.8, 52);
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.1, h * 0.84, w * 0.8, 52);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 17px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ESTRADA QUE NENHUM MAPA REGISTRA', w * 0.5, h * 0.875);
      }

      // ==========================================
      // CENA 2: As Pernas Cinzentas das Moças
      // ==========================================
      else if (sceneIndex === 1) {
        drawForestBackground(ctx, w, h, true);
        drawDirtRoadAsh(ctx, w, h, groundY);
        drawFog(ctx, w, h, progress, 0.28);

        // Moças caminhando (silhueta/arte estilizada com pernas em cinza claro)
        // Moça misteriosa caminhando
        drawComplexHuman(ctx, {
          x: w * 0.5,
          y: groundY + 70,
          scale: 1.35,
          time: progress * 8,
          walking: true,
          walkSpeed: 4.5,
          skinColor: '#c68352',
          ashSkin: '#94a3b8',
          dressColor: '#dc2626',
          hairColor: '#0b0f19',
          hairStyle: 'long',
          gender: 'female',
          legsAshOnly: true,
          armPose: 'walking'
        });

        drawComplexHuman(ctx, {
          x: w * 0.2,
          y: groundY + 30,
          scale: 0.88,
          time: progress * 5,
          walking: false,
          skinColor: '#b45309',
          ashSkin: '#94a3b8',
          dressColor: '#059669',
          hairColor: '#0f172a',
          hairStyle: 'bun',
          gender: 'female',
          legsAshOnly: true,
          armPose: 'idle'
        });

        // Saia florida paraense (chita vermelha e amarela)
        // Substituído pelo drawComplexHuman acima

        // Estampa florida na saia
        // Detalhes antigos removidos

        // Pernas cobertas de tabatinga/cinza (cor cinza fantasmagórico)
        // Detalhes antigos removidos

        // Sandálias rústicas
        // Detalhes antigos removidos

        // Nuvens de poeira de cinza subindo dos passos
        // Detalhes antigos removidos

        // Badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(w * 0.08, h * 0.84, w * 0.84, 52);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.08, h * 0.84, w * 0.84, 52);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 17px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('PERNAS COBERTAS DE TABATINGA BRANCA', w * 0.5, h * 0.875);
      }

      // ==========================================
      // CENA 3: Close-up do Nome Escrito com o Dedo
      // ==========================================
      else if (sceneIndex === 2) {
        // Fundo com atmosfera de contraste
        // CENA 3: Cenário vivo da Amazônia com a moça e o close-up animado do dedo escrevendo
        drawForestBackground(ctx, w, h, true);
        drawAshTrail(ctx, w, h, groundY, progress);
        drawFog(ctx, w, h, progress, 0.12);

        // Raios de luar filtrando pela copa da floresta amazônica
        ctx.save();
        ctx.fillStyle = 'rgba(254, 240, 138, 0.08)';
        ctx.beginPath();
        ctx.moveTo(w * 0.2, 0);
        ctx.lineTo(w * 0.55, h);
        ctx.lineTo(w * 0.75, h);
        ctx.lineTo(w * 0.35, 0);
        ctx.closePath();
        ctx.fill();
        ctx.restore();

        // Vagalumes flutuando na cena
        ctx.fillStyle = 'rgba(250, 204, 21, 0.9)';
        for (let v = 0; v < 6; v++) {
          const vx = (w * 0.15 + v * 70 + Math.sin(progress * Math.PI * 4 + v) * 20) % w;
          const vy = (h * 0.3 + Math.cos(progress * Math.PI * 3 + v) * 30);
          ctx.beginPath();
          ctx.arc(vx, vy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Moça cabocla de corpo completo no lado esquerdo, inclinada num tronco rústico
        ctx.fillStyle = '#451a03';
        ctx.beginPath();
        ctx.ellipse(w * 0.28, groundY + 95, 75, 26, -0.15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#291004';
        ctx.lineWidth = 2;
        ctx.stroke();

        drawComplexHuman(ctx, {
          x: w * 0.28,
          y: groundY + 65,
          scale: 1.15,
          time: progress * 6,
          walking: false,
          skinColor: '#c68352',
          ashSkin: '#94a3b8',
          dressColor: '#dc2626',
          hairColor: '#0b0f19',
          hairStyle: 'long',
          gender: 'female',
          legsAshOnly: true,
          armPose: 'idle'
        });

        // Perna em primeiro plano (superfície cinzenta de pó de tabatinga)
        // Close-up dinâmico na perna (Centro-Direita)
        const focusX = w * 0.64;
        const focusY = h * 0.46;

        // Vinheta suave (translúcida) — mantém o cenário visível atrás do close-up
        const haloGrad = ctx.createRadialGradient(focusX, focusY, 60, focusX, focusY, 250);
        haloGrad.addColorStop(0, 'rgba(15, 23, 42, 0.0)');
        haloGrad.addColorStop(0.55, 'rgba(15, 23, 42, 0.18)');
        haloGrad.addColorStop(1, 'rgba(15, 23, 42, 0.55)');
        ctx.fillStyle = haloGrad;
        ctx.beginPath();
        ctx.arc(focusX, focusY, 250, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Barra do vestido drapeado
        ctx.save();
        ctx.fillStyle = '#dc2626';
        ctx.beginPath();
        ctx.moveTo(focusX - 110, focusY - 170);
        ctx.quadraticCurveTo(focusX, focusY - 150 + Math.sin(progress * 6) * 5, focusX + 110, focusY - 170);
        ctx.lineTo(focusX + 90, focusY - 210);
        ctx.lineTo(focusX - 90, focusY - 210);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(focusX - 110, focusY - 170);
        ctx.quadraticCurveTo(focusX, focusY - 150 + Math.sin(progress * 6) * 5, focusX + 110, focusY - 170);
        ctx.stroke();
        ctx.restore();

        // Perna anatômica esculpida
        ctx.save();
        const legGrad = ctx.createLinearGradient(focusX - 60, focusY - 160, focusX + 60, focusY + 160);
        legGrad.addColorStop(0, '#64748b');
        legGrad.addColorStop(0.3, '#94a3b8');
        legGrad.addColorStop(0.6, '#cbd5e1');
        legGrad.addColorStop(1, '#64748b');

        ctx.fillStyle = legGrad;
        ctx.beginPath();
        ctx.moveTo(focusX - 52, focusY - 160);
        ctx.bezierCurveTo(focusX - 78, focusY - 50, focusX - 82, focusY + 60, focusX - 44, focusY + 160);
        ctx.lineTo(focusX + 44, focusY + 160);
        ctx.bezierCurveTo(focusX + 78, focusY + 60, focusX + 72, focusY - 50, focusX + 52, focusY - 160);
        ctx.closePath();
        ctx.fill();

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        ctx.fillStyle = 'rgba(248, 250, 252, 0.18)';
        for (let t = 0; t < 30; t++) {
          const tx = focusX - 50 + (t * 17) % 100;
          const ty = focusY - 130 + (t * 29) % 270;
          ctx.fillRect(tx, ty, 3, 2);
        }
        ctx.restore();

        // TEST REPLACEMENT


        // Letras escritas revelando a pele morena natural por baixo da cinza
        // Escrita dinâmica revelando a pele morena viva por baixo da cinza
        const word = 'MOJU';
        const writeProgress = Math.min(1, Math.max(0, (progress - 0.1) / 0.78));
        const numChars = Math.floor(writeProgress * (word.length + 0.3));

        ctx.save();
        ctx.font = '900 46px "Courier New", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Sombra de sulco escavado no pó
        ctx.fillStyle = '#451a03';
        ctx.fillText(word.substring(0, numChars), focusX + 2, focusY + 2);
        // Pele viva
        ctx.fillStyle = '#b45309';
        ctx.fillText(word.substring(0, numChars), focusX, focusY);
        // Brilho dourado
        ctx.fillStyle = '#f59e0b';
        ctx.font = '900 44px "Courier New", monospace';
        ctx.fillText(word.substring(0, numChars), focusX, focusY);
        ctx.restore();

        // Dedo indicador e mão anatômica em movimento real
        const startWritingX = focusX - 85;
        const endWritingX = focusX + 85;
        const currentFingerX = startWritingX + writeProgress * (endWritingX - startWritingX);
        const currentFingerY = focusY + Math.sin(writeProgress * Math.PI * 8) * 16;

        ctx.save();
        const armGrad = ctx.createLinearGradient(currentFingerX + 110, currentFingerY - 110, currentFingerX, currentFingerY);
        armGrad.addColorStop(0, '#9a3412');
        armGrad.addColorStop(0.5, '#c68352');
        armGrad.addColorStop(1, '#d97706');

        ctx.fillStyle = armGrad;
        ctx.beginPath();
        ctx.moveTo(currentFingerX + 140, currentFingerY - 90);
        ctx.lineTo(currentFingerX + 60, currentFingerY - 20);
        ctx.lineTo(currentFingerX + 25, currentFingerY - 5);
        ctx.lineTo(currentFingerX + 70, currentFingerY + 20);
        ctx.lineTo(currentFingerX + 155, currentFingerY - 50);
        ctx.closePath();
        ctx.fill();

        // Palma da mão
        ctx.fillStyle = '#b45309';
        ctx.beginPath();
        ctx.ellipse(currentFingerX + 35, currentFingerY, 22, 16, -0.3, 0, Math.PI * 2);
        ctx.fill();

        // Dedo indicador estendido tocando a perna
        ctx.fillStyle = '#c68352';
        ctx.beginPath();
        ctx.moveTo(currentFingerX + 25, currentFingerY - 4);
        ctx.lineTo(currentFingerX, currentFingerY);
        ctx.lineTo(currentFingerX + 22, currentFingerY + 8);
        ctx.closePath();
        ctx.fill();

        // Ponta do dedo e unha
        ctx.fillStyle = '#ea580c';
        ctx.beginPath();
        ctx.arc(currentFingerX, currentFingerY, 6.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffedd5';
        ctx.beginPath();
        ctx.ellipse(currentFingerX + 2, currentFingerY - 2, 3, 2, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Partículas de poeira e cinza levantando
        if (writeProgress > 0 && writeProgress < 0.98) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
          for (let p = 0; p < 16; p++) {
            const px = currentFingerX - 6 + Math.cos(p * 0.8 + progress * 20) * (8 + (p * 3) % 22);
            const py = currentFingerY + 4 + Math.sin(p * 1.2 + progress * 15) * (6 + (p * 4) % 18) + (progress * 18) % 12;
            ctx.beginPath();
            ctx.arc(px, py, 1.2 + (p % 3) * 0.9, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();

        // Banner informativo da cena 3
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(w * 0.06, h * 0.84, w * 0.88, 52);
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2.5;
        ctx.strokeRect(w * 0.06, h * 0.84, w * 0.88, 52);

        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 17px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ESCREVENDO NA CINZA DA PERNA COM O DEDO', w * 0.5, h * 0.875);
      }
      // ==========================================
      // CENA 4: O Aviso dos Ribeirinhos e a Canoa
      // ==========================================
      else if (sceneIndex === 3) {
        drawForestBackground(ctx, w, h, true);
        drawRiverBackground(ctx, w, h, groundY - 40, progress);
        drawFog(ctx, w, h, progress, 0.32);

        // Canoa ribeirinha na beira do rio
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.moveTo(w * 0.15, groundY + 30);
        ctx.quadraticCurveTo(w * 0.5, groundY + 65, w * 0.85, groundY + 30);
        ctx.lineTo(w * 0.82, groundY + 20);
        ctx.quadraticCurveTo(w * 0.5, groundY + 45, w * 0.18, groundY + 20);
        ctx.closePath();
        ctx.fill();

        // Velho ribeirinho com lampião na proa
        const ribeirinhoX = w * 0.32;
        const lampY = groundY - 60;

        // Moça misteriosa na margem oposta observando (corpo completo)
        drawComplexHuman(ctx, {
          x: w * 0.78,
          y: groundY + 30,
          scale: 1.1,
          time: progress * 4,
          flip: true,
          walking: false,
          skinColor: '#c68352',
          ashSkin: '#94a3b8',
          dressColor: '#e11d48',
          hairColor: '#0f172a',
          hairStyle: 'long',
          gender: 'female',
          legsAshOnly: true,
          armPose: 'pointing'
        });

        // Chapéu de palha
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.ellipse(ribeirinhoX, lampY - 70, 36, 12, 0, 0, Math.PI * 2);
        ctx.fill();

        // Cabeça e corpo
        ctx.fillStyle = '#92400e';
        ctx.beginPath();
        ctx.arc(ribeirinhoX, lampY - 55, 16, 0, Math.PI * 2);
        ctx.fill();

        // Camisa do pescador
        ctx.fillStyle = '#0284c7';
        ctx.fillRect(ribeirinhoX - 22, lampY - 40, 44, 60);

        // Lampião a querosene com brilho âmbar pulsante
        const lampGlow = ctx.createRadialGradient(ribeirinhoX + 35, lampY - 15, 6, ribeirinhoX + 35, lampY - 15, 110);
        lampGlow.addColorStop(0, 'rgba(251, 191, 36, 0.95)');
        lampGlow.addColorStop(0.5, 'rgba(245, 158, 11, 0.4)');
        lampGlow.addColorStop(1, 'rgba(245, 158, 11, 0)');
        ctx.fillStyle = lampGlow;
        ctx.beginPath();
        ctx.arc(ribeirinhoX + 35, lampY - 15, 110, 0, Math.PI * 2);
        ctx.fill();

        // Lampião físico
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(ribeirinhoX + 28, lampY - 26, 14, 22);

        // Badge
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(w * 0.08, h * 0.84, w * 0.84, 52);
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.08, h * 0.84, w * 0.84, 52);

        ctx.fillStyle = '#fca5a5';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('QUEM GRAVA O NOME JAMAIS SAI DE MOJU', w * 0.5, h * 0.875);
      }

      // ==========================================
      // CENA 5: A Névoa Eterna ao Luar
      // ==========================================
      else {
        drawForestBackground(ctx, w, h, true);
        drawRiverBackground(ctx, w, h, groundY - 60, progress);

        // Névoa densa mística se movendo pelo rio
        drawFog(ctx, w, h, progress, 0.45);

        // Efeito de nomes flutuando na névoa
        // Silhuetas das moças na névoa
        drawComplexHuman(ctx, {
          x: w * 0.32,
          y: groundY + 40,
          scale: 0.95,
          time: progress * 5,
          walking: false,
          skinColor: '#94a3b8',
          ashSkin: '#94a3b8',
          dressColor: '#475569',
          hairColor: '#0f172a',
          hairStyle: 'long',
          gender: 'female',
          legsAshOnly: true,
          armPose: 'idle'
        });

        drawComplexHuman(ctx, {
          x: w * 0.68,
          y: groundY + 42,
          scale: 1.0,
          time: progress * 4.5,
          flip: true,
          walking: false,
          skinColor: '#94a3b8',
          ashSkin: '#94a3b8',
          dressColor: '#334155',
          hairColor: '#0f172a',
          hairStyle: 'braids',
          gender: 'female',
          legsAshOnly: true,
          armPose: 'idle'
        });

        ctx.fillStyle = `rgba(241, 245, 249, ${0.4 + Math.sin(progress * Math.PI) * 0.4})`;
        ctx.font = 'italic bold 28px serif';
        ctx.textAlign = 'center';
        ctx.fillText('M O J U . . .', w * 0.5, h * 0.42);

        // Partículas místicas subindo ao luar
        ctx.fillStyle = 'rgba(254, 240, 138, 0.85)';
        for (let sp = 0; sp < 18; sp++) {
          const sx = (w * 0.12 + sp * 38 + Math.sin(progress * 6 + sp) * 22) % w;
          const sy = (h * 0.75 - progress * 240 - sp * 18) % h;
          ctx.beginPath();
          ctx.arc(sx, sy, 3, 0, Math.PI * 2);
          ctx.fill();
        }

        // Badge final
        ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
        ctx.fillRect(w * 0.08, h * 0.84, w * 0.84, 52);
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.08, h * 0.84, w * 0.84, 52);

        ctx.fillStyle = '#f8fafc';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('NOMES PRESOS PARA SEMPRE NA TERRA', w * 0.5, h * 0.875);
      }

      ctx.restore();
    }
  };

  global.MojuRenderer = MojuRenderer;
})(typeof window !== 'undefined' ? window : this);
