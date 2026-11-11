/**
 * DisjuntorRenderer - Motor de Renderização 2D Canvas Profissional
 * Tema: "A Importância do Disjuntor" / "Paulista Materiais para Construção"
 * Estilo: Motion graphics moderno, vetorial de alta definição, dinâmico e educativo.
 */

(function(global) {
  'use strict';

  function drawElectricSparks(ctx, cx, cy, count, t, color1, color2) {
    ctx.save();
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + Math.sin(t * 12 + i) * 0.4;
      const dist = 25 + Math.abs(Math.sin(t * 15 + i * 3)) * 65;
      const ex = cx + Math.cos(angle) * dist;
      const ey = cy + Math.sin(angle) * dist;
      const mx = cx + Math.cos(angle + 0.3) * (dist * 0.5);
      const my = cy + Math.sin(angle - 0.3) * (dist * 0.5);

      ctx.strokeStyle = i % 2 === 0 ? (color1 || '#38bdf8') : (color2 || '#facc15');
      ctx.lineWidth = 2.5 + Math.sin(t * 20 + i) * 1.5;
      ctx.shadowColor = ctx.strokeStyle;
      ctx.shadowBlur = 12;

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(mx, my);
      ctx.lineTo(ex, ey);
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(ex, ey, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawCircuitGrid(ctx, w, h, t, alpha) {
    ctx.save();
    ctx.strokeStyle = `rgba(56, 189, 248, ${alpha || 0.15})`;
    ctx.lineWidth = 1.5;
    const step = 60;
    const shift = (t * 20) % step;

    for (let x = shift; x < w; x += step) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = shift; y < h; y += step) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // ── DESENHO DE DISJUNTOR DIN REALISTA INDUSTRIAL BIPOLAR/MONOPOLAR ──
  function drawRealisticBreaker(ctx, cx, cy, scale, tripped, options) {
    options = options || {};
    const isBipolar = options.bipolar !== false;
    const glowColor = options.glowColor || null;
    const amps = options.amps || 'C32';
    const brand = options.brand || 'ELGIN';

    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);

    // Sombra projetada traseira realista
    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
    ctx.shadowBlur = 28;
    ctx.shadowOffsetY = 12;
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-90, -160, 180, 320, 10);
    ctx.fill();
    ctx.restore();

    // Trilho DIN metálico ao fundo (trilho ômega 35mm zincado perfurado)
    const railGrad = ctx.createLinearGradient(-130, 0, 130, 0);
    railGrad.addColorStop(0, '#475569');
    railGrad.addColorStop(0.2, '#94a3b8');
    railGrad.addColorStop(0.5, '#cbd5e1');
    railGrad.addColorStop(0.8, '#64748b');
    railGrad.addColorStop(1, '#334155');
    ctx.fillStyle = railGrad;
    ctx.fillRect(-120, -35, 240, 70);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-120, -35, 240, 6);
    ctx.fillRect(-120, 29, 240, 6);
    ctx.fillStyle = 'rgba(255,255,255,0.4)';
    ctx.fillRect(-120, -29, 240, 2);

    for (let hx = -105; hx <= 105; hx += 35) {
      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.roundRect(hx - 8, -6, 16, 12, 4);
      ctx.fill();
    }

    function drawPole(offsetX) {
      ctx.save();
      ctx.translate(offsetX, 0);

      const poleW = 82;
      const poleH = 290;
      const halfW = poleW / 2;
      const halfH = poleH / 2;

      // Corpo moldado termoplástico texturizado (cinza técnico industrial)
      const bodyGrad = ctx.createLinearGradient(-halfW, -halfH, halfW, halfH);
      bodyGrad.addColorStop(0, '#f8fafc');
      bodyGrad.addColorStop(0.15, '#e2e8f0');
      bodyGrad.addColorStop(0.55, '#cbd5e1');
      bodyGrad.addColorStop(0.85, '#94a3b8');
      bodyGrad.addColorStop(1, '#64748b');

      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      ctx.moveTo(-halfW + 6, -halfH);
      ctx.lineTo(halfW - 6, -halfH);
      ctx.arcTo(halfW, -halfH, halfW, -halfH + 6, 6);
      ctx.lineTo(halfW, -halfH + 45);
      ctx.lineTo(halfW - 4, -halfH + 50);
      ctx.lineTo(halfW - 4, halfH - 50);
      ctx.lineTo(halfW, halfH - 45);
      ctx.lineTo(halfW, halfH - 6);
      ctx.arcTo(halfW, halfH, halfW - 6, halfH, 6);
      ctx.lineTo(-halfW + 6, halfH);
      ctx.arcTo(-halfW, halfH, -halfW, halfH - 6, 6);
      ctx.lineTo(-halfW, halfH - 45);
      ctx.lineTo(-halfW + 4, halfH - 50);
      ctx.lineTo(-halfW + 4, -halfH + 50);
      ctx.lineTo(-halfW, -halfH + 45);
      ctx.lineTo(-halfW, -halfH + 6);
      ctx.arcTo(-halfW, -halfH, -halfW + 6, -halfH, 6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Frisos laterais de dissipação térmica
      ctx.fillStyle = 'rgba(0,0,0,0.18)';
      for (let fy = -90; fy <= -40; fy += 12) {
        ctx.fillRect(-halfW + 8, fy, poleW - 16, 3);
      }
      for (let fy = 40; fy <= 90; fy += 12) {
        ctx.fillRect(-halfW + 8, fy, poleW - 16, 3);
      }

      // Borne Superior (Entrada Fase)
      const topBorneGrad = ctx.createLinearGradient(0, -halfH, 0, -halfH + 42);
      topBorneGrad.addColorStop(0, '#1e293b');
      topBorneGrad.addColorStop(1, '#334155');
      ctx.fillStyle = topBorneGrad;
      ctx.beginPath();
      ctx.roundRect(-24, -halfH + 6, 48, 36, 4);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.arc(0, -halfH + 24, 12, 0, Math.PI * 2);
      ctx.fill();

      const screwGrad = ctx.createLinearGradient(-8, -halfH + 16, 8, -halfH + 32);
      screwGrad.addColorStop(0, '#f8fafc');
      screwGrad.addColorStop(0.5, '#94a3b8');
      screwGrad.addColorStop(1, '#475569');
      ctx.fillStyle = screwGrad;
      ctx.beginPath();
      ctx.arc(0, -halfH + 24, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-6, -halfH + 24);
      ctx.lineTo(6, -halfH + 24);
      ctx.moveTo(0, -halfH + 18);
      ctx.lineTo(0, -halfH + 30);
      ctx.stroke();

      // Borne Inferior (Saída Carga)
      ctx.fillStyle = topBorneGrad;
      ctx.beginPath();
      ctx.roundRect(-24, halfH - 42, 48, 36, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#0b0f19';
      ctx.beginPath();
      ctx.arc(0, halfH - 24, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = screwGrad;
      ctx.beginPath();
      ctx.arc(0, halfH - 24, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(-6, halfH - 24);
      ctx.lineTo(6, halfH - 24);
      ctx.moveTo(0, halfH - 30);
      ctx.lineTo(0, halfH - 18);
      ctx.stroke();

      // Inscrições e Marcação Técnica
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(brand, 0, -82);

      ctx.font = 'bold 13px sans-serif';
      ctx.fillStyle = '#1e293b';
      ctx.fillText(amps, 0, -66);

      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(-16, -58, 32, 11);
      ctx.font = 'bold 7px monospace';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('6000', 0, -50);

      // Símbolo do disparador térmico e magnético
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(-10, -42);
      ctx.lineTo(10, -42);
      ctx.lineTo(6, -34);
      ctx.moveTo(10, -42);
      ctx.lineTo(14, -38);
      ctx.stroke();

      // Visor de Status Internacional (I = Ligado / 0 = Desarmado)
      const flagY = -22;
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(-16, flagY - 8, 32, 16, 3);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const statusColor = tripped ? '#10b981' : '#ef4444';
      ctx.fillStyle = statusColor;
      ctx.shadowColor = statusColor;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.roundRect(-13, flagY - 6, 26, 12, 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tripped ? '0' : 'I', 0, flagY);

      // Cavidade da chave
      const wellGrad = ctx.createLinearGradient(0, -6, 0, 48);
      wellGrad.addColorStop(0, '#0f172a');
      wellGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = wellGrad;
      ctx.beginPath();
      ctx.roundRect(-22, -6, 44, 52, 6);
      ctx.fill();
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Especificações gravadas
      ctx.fillStyle = '#334155';
      ctx.font = '7px sans-serif';
      ctx.fillText('400V~ 50/60Hz', 0, 68);
      ctx.fillText('NBR NM 60898', 0, 78);
      ctx.fillText('IEC 60947-2', 0, 88);

      // Trava DIN retrátil
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(-14, halfH - 8, 28, 8, 2);
      ctx.fill();

      ctx.restore();
    }

    if (isBipolar) {
      drawPole(-43);
      drawPole(43);

      // Manopla Mecânica Bipolar com Barra de Interligação
      ctx.save();
      const toggleY = tripped ? 26 : 4;
      const toggleAngle = tripped ? 0.38 : -0.38;

      ctx.translate(0, toggleY);
      ctx.rotate(toggleAngle);

      const leverGrad = ctx.createLinearGradient(-75, -16, 75, 16);
      leverGrad.addColorStop(0, '#ea580c');
      leverGrad.addColorStop(0.3, '#f97316');
      leverGrad.addColorStop(0.7, '#fb923c');
      leverGrad.addColorStop(1, '#c2410c');

      ctx.fillStyle = leverGrad;
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-68, -16, 136, 32, 8);
      ctx.fill();
      ctx.stroke();

      // Barra de interligação central
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-12, -14, 24, 28);
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;
      ctx.strokeRect(-12, -14, 24, 28);

      // Ranhuras ergonômicas
      ctx.fillStyle = '#7c2d12';
      for (let rx of [-52, -44, -36, 36, 44, 52]) {
        ctx.fillRect(rx - 2, -10, 4, 20);
      }

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(tripped ? 'OFF' : 'ON', 0, 0);

      ctx.restore();
    } else {
      drawPole(0);

      ctx.save();
      const toggleY = tripped ? 26 : 4;
      const toggleAngle = tripped ? 0.38 : -0.38;
      ctx.translate(0, toggleY);
      ctx.rotate(toggleAngle);

      const leverGrad = ctx.createLinearGradient(-22, -14, 22, 14);
      leverGrad.addColorStop(0, '#ea580c');
      leverGrad.addColorStop(0.5, '#f97316');
      leverGrad.addColorStop(1, '#9a3412');
      ctx.fillStyle = leverGrad;
      ctx.strokeStyle = '#7c2d12';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-20, -14, 40, 28, 6);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    if (glowColor) {
      ctx.save();
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 3.5;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 24;
      ctx.beginPath();
      ctx.roundRect(-90, -150, 180, 300, 12);
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }

  function drawBreaker(ctx, cx, cy, scale, tripped, glowColor) {
    drawRealisticBreaker(ctx, cx, cy, scale, tripped, { glowColor: glowColor, bipolar: true });
  }
  const DisjuntorRenderer = {
    render(ctx, w, h, sceneIndex, progress) {
      ctx.save();
      ctx.clearRect(0, 0, w, h);
      const t = progress * 10;

      switch(sceneIndex) {
        // ==========================================
        // CENA 1: GANCHO DE IMPACTO (O Estalo Misterioso)
        // ==========================================
        case 0: {
          const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
          bgGrad.addColorStop(0, '#090d16');
          bgGrad.addColorStop(0.5, '#0f172a');
          bgGrad.addColorStop(1, '#1e1b4b');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          drawCircuitGrid(ctx, w, h, t, 0.12);

          // Parede com moldura de quadro elétrico central
          const pulse = Math.abs(Math.sin(t * 3));
          ctx.save();
          ctx.strokeStyle = `rgba(56, 189, 248, ${0.4 + pulse * 0.4})`;
          ctx.lineWidth = 4;
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 25 * pulse;
          ctx.strokeRect(w * 0.5 - 130, h * 0.42 - 190, 260, 380);
          ctx.restore();

          // Disjuntor central realista com energia pulsando (Bipolar Elgin C32)
          drawRealisticBreaker(ctx, w * 0.5, h * 0.42, 1.28, false, {
            glowColor: '#38bdf8',
            bipolar: true,
            amps: 'C32',
            brand: 'ELGIN'
          });

          // Faíscas elétricas de alta voltagem anunciando o "estalo"
          if (progress > 0.25) {
            drawElectricSparks(ctx, w * 0.5, h * 0.42, 14, t, '#38bdf8', '#facc15');
          }

          // Ícones flutuantes de eletrodomésticos protegidos (TV, Geladeira, Lâmpada)
          const items = [
            { icon: '⚡', label: 'Sobrecargas', x: w * 0.22, y: h * 0.23 },
            { icon: '📺', label: 'Aparelhos', x: w * 0.78, y: h * 0.23 },
            { icon: '🛡️', label: 'Proteção', x: w * 0.22, y: h * 0.65 },
            { icon: '💡', label: 'Rede Segura', x: w * 0.78, y: h * 0.65 }
          ];

          items.forEach((item, i) => {
            const floatY = item.y + Math.sin(t * 2 + i * 1.5) * 8;
            ctx.save();
            ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
            ctx.strokeStyle = '#0284c7';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.roundRect(item.x - 55, floatY - 26, 110, 52, 12);
            ctx.fill();
            ctx.stroke();

            ctx.font = '22px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(item.icon, item.x, floatY - 6);

            ctx.fillStyle = '#f8fafc';
            ctx.font = 'bold 11px sans-serif';
            ctx.fillText(item.label, item.x, floatY + 16);
            ctx.restore();
          });

          // Alerta no topo
          ctx.save();
          ctx.fillStyle = '#f59e0b';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 15;
          ctx.fillText('VOCÊ SABIA DISSO?', w * 0.5, h * 0.12);
          ctx.restore();
          break;
        }

        // ==========================================
        // CENA 2: O PERIGO (Fiação aquecendo, curto e risco de incêndio)
        // ==========================================
        case 1: {
          // Fundo arquitetônico noturno com luz de emergência
          const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
          bgGrad.addColorStop(0, '#090d16');
          bgGrad.addColorStop(0.35, '#151b28');
          bgGrad.addColorStop(0.7, '#1f1315');
          bgGrad.addColorStop(1, '#0a0507');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          const alarmIntensity = (Math.sin(t * 9) + 1) * 0.5;
          ctx.fillStyle = `rgba(239, 68, 68, ${0.14 * alarmIntensity})`;
          ctx.fillRect(0, 0, w, h);

          // ── CORTE TRANSVERSAL DA RESIDÊNCIA (ESTRUTURA REALISTA) ──
          const houseLeft = w * 0.08;
          const houseTop = h * 0.15;
          const houseW = w * 0.84;
          const houseH = h * 0.54;

          // Paredes cortadas de alvenaria e laje de concreto
          ctx.save();
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(houseLeft - 10, houseTop - 10, houseW + 20, houseH + 20);

          const slabGrad = ctx.createLinearGradient(0, houseTop, 0, houseTop + 24);
          slabGrad.addColorStop(0, '#475569');
          slabGrad.addColorStop(1, '#334155');
          ctx.fillStyle = slabGrad;
          ctx.fillRect(houseLeft, houseTop, houseW, 22);

          const wallGrad = ctx.createLinearGradient(0, houseTop + 22, 0, houseTop + houseH - 28);
          wallGrad.addColorStop(0, '#334155');
          wallGrad.addColorStop(0.6, '#1e293b');
          wallGrad.addColorStop(1, '#0f172a');
          ctx.fillStyle = wallGrad;
          ctx.fillRect(houseLeft, houseTop + 22, houseW, houseH - 50);

          const floorGrad = ctx.createLinearGradient(0, houseTop + houseH - 28, 0, houseTop + houseH);
          floorGrad.addColorStop(0, '#78350f');
          floorGrad.addColorStop(0.5, '#451a03');
          floorGrad.addColorStop(1, '#1c1917');
          ctx.fillStyle = floorGrad;
          ctx.fillRect(houseLeft, houseTop + houseH - 28, houseW, 28);
          ctx.restore();

          // Conduíte amarelo em brasa no teto com derretimento
          const conduitY = houseTop + 45;
          ctx.save();
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 14;
          ctx.beginPath();
          ctx.moveTo(houseLeft + 20, conduitY);
          ctx.lineTo(houseLeft + houseW - 20, conduitY);
          ctx.stroke();

          ctx.strokeStyle = '#a16207';
          ctx.lineWidth = 3;
          for (let cx = houseLeft + 25; cx < houseLeft + houseW - 20; cx += 8) {
            ctx.beginPath();
            ctx.moveTo(cx, conduitY - 7);
            ctx.lineTo(cx, conduitY + 7);
            ctx.stroke();
          }

          const meltCenterX = houseLeft + houseW * 0.48;
          ctx.fillStyle = '#1c1917';
          ctx.beginPath();
          ctx.ellipse(meltCenterX, conduitY, 55, 12, 0, 0, Math.PI * 2);
          ctx.fill();

          // Fios de cobre em brasa incandescente
          ctx.lineWidth = 4.5;
          ctx.strokeStyle = '#ef4444';
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 24 + alarmIntensity * 16;
          ctx.beginPath();
          ctx.moveTo(meltCenterX - 60, conduitY - 2);
          ctx.bezierCurveTo(meltCenterX - 20, conduitY + 10, meltCenterX + 20, conduitY - 10, meltCenterX + 60, conduitY - 2);
          ctx.stroke();

          ctx.strokeStyle = '#fef08a';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#ffffff';
          ctx.shadowBlur = 14;
          ctx.beginPath();
          ctx.moveTo(meltCenterX - 50, conduitY - 1);
          ctx.bezierCurveTo(meltCenterX - 15, conduitY + 7, meltCenterX + 15, conduitY - 7, meltCenterX + 50, conduitY - 1);
          ctx.stroke();
          ctx.restore();

          // Fumaça volumétrica do conduíte
          ctx.save();
          for (let sm = 0; sm < 12; sm++) {
            const smokeT = (t * 1.8 + sm * 0.4) % 3;
            const smokeX = meltCenterX - 30 + (sm * 9) + Math.sin(t * 3 + sm) * 12;
            const smokeY = conduitY - 8 - smokeT * 38;
            const smokeR = 7 + smokeT * 12;
            const smokeAlpha = Math.max(0, 0.55 - smokeT * 0.18);
            ctx.fillStyle = `rgba(30, 41, 59, ${smokeAlpha})`;
            ctx.beginPath();
            ctx.arc(smokeX, smokeY, smokeR, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();

          // 1. SMART TV COM ESTÁTICA E FUMAÇA
          const tvX = houseLeft + houseW * 0.68;
          const tvY = houseTop + houseH * 0.58;
          ctx.save();
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(tvX - 60, tvY + 50, 120, 22);

          ctx.fillStyle = '#020617';
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(tvX - 55, tvY - 40, 110, 80, 5);
          ctx.fill();
          ctx.stroke();

          ctx.save();
          ctx.beginPath();
          ctx.roundRect(tvX - 51, tvY - 36, 102, 72, 3);
          ctx.clip();
          for (let ny = tvY - 36; ny < tvY + 36; ny += 6) {
            ctx.fillStyle = Math.random() > 0.4 ? 'rgba(56, 189, 248, 0.7)' : 'rgba(239, 68, 68, 0.6)';
            ctx.fillRect(tvX - 51, ny + Math.sin(t * 40 + ny) * 2, 102, 3.5);
          }
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 8;
          ctx.fillText('NO SIGNAL ⚡', tvX, tvY + 4);
          ctx.restore();

          for (let tvs = 0; tvs < 6; tvs++) {
            const tt = (t * 2 + tvs * 0.5) % 2.5;
            const sx = tvX + 30 + Math.sin(t * 4 + tvs) * 8;
            const sy = tvY - 42 - tt * 25;
            ctx.fillStyle = `rgba(71, 85, 105, ${Math.max(0, 0.45 - tt * 0.18)})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 5 + tt * 7, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(tvX + 25, tvY + 54, 14, 18);
          drawElectricSparks(ctx, tvX + 31, tvY + 63, 6, t, '#ef4444', '#facc15');
          ctx.restore();

          // 2. GELADEIRA EM CURTO NA BASE
          const refX = houseLeft + houseW * 0.22;
          const refY = houseTop + houseH * 0.54;
          ctx.save();
          const refGrad = ctx.createLinearGradient(refX - 42, 0, refX + 42, 0);
          refGrad.addColorStop(0, '#94a3b8');
          refGrad.addColorStop(0.3, '#cbd5e1');
          refGrad.addColorStop(0.7, '#64748b');
          refGrad.addColorStop(1, '#475569');
          ctx.fillStyle = refGrad;
          ctx.strokeStyle = '#334155';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(refX - 42, refY - 70, 84, 140, 8);
          ctx.fill();
          ctx.stroke();

          ctx.strokeStyle = '#1e293b';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.moveTo(refX - 42, refY - 22);
          ctx.lineTo(refX + 42, refY - 22);
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(refX + 28, refY - 55, 6, 26);
          ctx.fillRect(refX + 28, refY - 14, 6, 44);

          ctx.fillStyle = '#0f172a';
          ctx.fillRect(refX - 35, refY + 56, 32, 14);
          drawElectricSparks(ctx, refX - 20, refY + 62, 10, t, '#ef4444', '#fbbf24');
          ctx.restore();

          drawElectricSparks(ctx, meltCenterX, conduitY, 18, t, '#ef4444', '#fbbf24');

          // PAINEL DE ALERTA HUD
          ctx.save();
          const hudY = h * 0.73;
          ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 18;
          ctx.beginPath();
          ctx.roundRect(w * 0.5 - 170, hudY - 32, 340, 95, 14);
          ctx.fill();
          ctx.stroke();
          ctx.shadowBlur = 0;

          ctx.fillStyle = alarmIntensity > 0.5 ? '#ef4444' : '#f97316';
          ctx.font = 'bold 16px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('⚠️ ALERTA: SOBRECARGA ELÉTRICA', w * 0.5, hudY - 10);

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('• Fiação interna superaquece a mais de 250°C', w * 0.5, hudY + 13);
          ctx.fillText('• Queima motores de geladeiras e circuitos de Smart TV', w * 0.5, hudY + 31);
          ctx.fillStyle = '#fca5a5';
          ctx.fillText('• Sem o disjuntor correto, o fogo se alastra no imóvel', w * 0.5, hudY + 49);
          ctx.restore();
          break;
        }
        // ==========================================
        // CENA 3: O HERÓI (Disjuntor desarmando em milissegundos)
        // ==========================================
        case 2: {
          const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
          bgGrad.addColorStop(0, '#064e3b');
          bgGrad.addColorStop(0.5, '#022c22');
          bgGrad.addColorStop(1, '#021310');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          drawCircuitGrid(ctx, w, h, t, 0.1);

          // Momento do corte: transição de ligado para desligado/seguro
          const hasTripped = progress > 0.25;

          // Disjuntor em destaque heroico com desarme mecânico em milissegundos
          drawRealisticBreaker(ctx, w * 0.5, h * 0.42, 1.35, hasTripped, {
            glowColor: hasTripped ? '#10b981' : '#f59e0b',
            bipolar: true,
            amps: 'C32',
            brand: 'ELGIN'
          });

          // Anel de choque seguro expansivo quando desarma
          if (hasTripped) {
            const ringR = ((progress - 0.25) * 450) % 200;
            ctx.save();
            ctx.strokeStyle = 'rgba(52, 211, 153, 0.5)';
            ctx.lineWidth = 4;
            ctx.shadowColor = '#10b981';
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(w * 0.5, h * 0.42, ringR + 80, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
          }

          // Card explicativo de tecnologia de proteção
          ctx.save();
          ctx.fillStyle = 'rgba(6, 78, 59, 0.85)';
          ctx.strokeStyle = '#34d399';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.roundRect(w * 0.5 - 150, h * 0.68, 300, 95, 14);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#6ee7b7';
          ctx.font = 'bold 17px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('DISPARO EM MILISSEGUNDOS', w * 0.5, h * 0.72);

          ctx.fillStyle = '#ffffff';
          ctx.font = '13px sans-serif';
          ctx.fillText('Corta a energia antes de qualquer estrago.', w * 0.5, h * 0.76);
          ctx.fillText('A segurança total que seu imóvel precisa!', w * 0.5, h * 0.79);
          ctx.restore();
          break;
        }

        // ==========================================
        // CENA 4: PAULISTA MATERIAIS PARA CONSTRUÇÃO
        // ==========================================
        case 3: {
          const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
          bgGrad.addColorStop(0, '#0f172a');
          bgGrad.addColorStop(0.4, '#1e293b');
          bgGrad.addColorStop(1, '#090d16');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          // Fachada comercial moderna estilizada da Paulista Materiais
          ctx.save();
          ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(w * 0.5 - 170, h * 0.18, 340, 480, 20);
          ctx.fill();
          ctx.stroke();

          // Banner Superior da Loja
          const bannerGrad = ctx.createLinearGradient(w * 0.5 - 170, 0, w * 0.5 + 170, 0);
          bannerGrad.addColorStop(0, '#0284c7');
          bannerGrad.addColorStop(0.5, '#0369a1');
          bannerGrad.addColorStop(1, '#075985');
          ctx.fillStyle = bannerGrad;
          ctx.beginPath();
          ctx.roundRect(w * 0.5 - 165, h * 0.19, 330, 85, 14);
          ctx.fill();

          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 22px sans-serif';
          ctx.textAlign = 'center';
          ctx.shadowColor = '#000000';
          ctx.shadowBlur = 8;
          ctx.fillText('PAULISTA', w * 0.5, h * 0.23);
          ctx.font = 'bold 13px sans-serif';
          ctx.fillStyle = '#fde047';
          ctx.fillText('MATERIAIS PARA CONSTRUÇÃO', w * 0.5, h * 0.265);
          ctx.shadowBlur = 0;

          // Vitrine de disjuntores certificados com selo
          // Vitrine de disjuntores certificados Elgin (Monopolar C20 + Bipolar C32)
          drawRealisticBreaker(ctx, w * 0.33, h * 0.43, 0.75, false, {
            bipolar: false,
            amps: 'C20',
            brand: 'ELGIN'
          });
          drawRealisticBreaker(ctx, w * 0.67, h * 0.43, 0.75, false, {
            bipolar: true,
            amps: 'C40',
            brand: 'ELGIN'
          });

          // Selo central de garantia e melhores preços
          ctx.fillStyle = '#f59e0b';
          ctx.beginPath();
          ctx.arc(w * 0.5, h * 0.43, 34, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 3;
          ctx.stroke();

          ctx.fillStyle = '#0f172a';
          ctx.font = 'bold 11px sans-serif';
          ctx.fillText('100%', w * 0.5, h * 0.42);
          ctx.fillText('ORIGINAL', w * 0.5, h * 0.445);

          // Destaque de Preço e Variedade
          ctx.fillStyle = '#38bdf8';
          ctx.font = 'bold 16px sans-serif';
          ctx.fillText('AS MELHORES MARCAS DO BRASIL', w * 0.5, h * 0.56);

          ctx.fillStyle = '#4ade80';
          ctx.font = 'bold 19px sans-serif';
          ctx.shadowColor = '#22c55e';
          ctx.shadowBlur = 12;
          ctx.fillText('SÓ AQUI: MELHORES PREÇOS!', w * 0.5, h * 0.60);
          ctx.shadowBlur = 0;

          // Selos adicionais
          ctx.fillStyle = '#cbd5e1';
          ctx.font = '12px sans-serif';
          ctx.fillText('✔ DIN Monopolar, Bipolar e Tripolar', w * 0.5, h * 0.64);
          ctx.fillText('✔ Cabos antichamas e barramentos', w * 0.5, h * 0.67);
          ctx.restore();
          break;
        }

        // ==========================================
        // CENA 5: CHAMADA FINAL & INTERATIVIDADE (CTA)
        // ==========================================
        case 4: {
          const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
          bgGrad.addColorStop(0, '#1e1b4b');
          bgGrad.addColorStop(0.5, '#0f172a');
          bgGrad.addColorStop(1, '#020617');
          ctx.fillStyle = bgGrad;
          ctx.fillRect(0, 0, w, h);

          drawCircuitGrid(ctx, w, h, t, 0.08);

          // Caixa principal de convite interativo
          ctx.save();
          ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.roundRect(w * 0.5 - 165, h * 0.16, 330, 480, 22);
          ctx.fill();
          ctx.stroke();

          ctx.fillStyle = '#f8fafc';
          ctx.font = 'bold 20px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('SUA CASA ESTÁ SEGURA?', w * 0.5, h * 0.22);

          // Três botões de ação vertical
          const actions = [
            { icon: '❤️', title: 'CURTA', sub: 'Apoie essa dica de segurança', color: '#ef4444', y: h * 0.32 },
            { icon: '🔄', title: 'COMPARTILHE', sub: 'Envie para sua família e amigos', color: '#38bdf8', y: h * 0.42 },
            { icon: '💬', title: 'COMENTE', sub: 'Quando foi sua última revisão?', color: '#22c55e', y: h * 0.52 }
          ];

          // Cartões Interativos com pulso dinâmico e glow
          actions.forEach((act, idx) => {
            ctx.save();
            const pulse = Math.sin(t * 6 + idx * 1.5) * 4;
            const cardW = 310 + (idx === 0 ? Math.sin(t * 8) * 6 : 0);
            const cardH = 58;

            ctx.shadowColor = act.color;
            ctx.shadowBlur = 12 + Math.abs(pulse) * 2;
            ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
            ctx.strokeStyle = act.color;
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.roundRect(w * 0.5 - cardW * 0.5, act.y - cardH * 0.5, cardW, cardH, 14);
            ctx.fill();
            ctx.stroke();

            // Ícone animado
            ctx.shadowBlur = 0;
            ctx.font = '28px sans-serif';
            ctx.textBaseline = 'middle';
            ctx.textAlign = 'center';
            ctx.fillText(act.icon, w * 0.5 - cardW * 0.5 + 38, act.y);

            // Título em destaque
            ctx.fillStyle = act.color;
            ctx.font = 'bold 16px sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(act.title, w * 0.5 - cardW * 0.5 + 72, act.y - 8);

            // Subtítulo descritivo
            ctx.fillStyle = '#cbd5e1';
            ctx.font = '12px sans-serif';
            ctx.fillText(act.sub, w * 0.5 - cardW * 0.5 + 72, act.y + 12);
            ctx.restore();
          });

          // Rodapé com o endereço da loja
          ctx.fillStyle = '#fde047';
          ctx.font = 'bold 15px sans-serif';
          ctx.fillText('PAULISTA MATERIAIS PARA CONSTRUÇÃO', w * 0.5, h * 0.61);
          ctx.fillStyle = '#94a3b8';
          ctx.font = '12px sans-serif';
          ctx.fillText('A parceira ideal da sua reforma e da sua família!', w * 0.5, h * 0.64);

          ctx.restore();
          break;
        }
      }

      ctx.restore();
    }
  };

  global.DisjuntorRenderer = DisjuntorRenderer;
})(typeof window !== 'undefined' ? window : this);
