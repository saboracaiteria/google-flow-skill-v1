// assets/js/mamao_renderer.js — Motor Procedural das Cenas do Mamão (9:16)
(function(global) {
  'use strict';

  function drawSky(ctx, w, h, goldenHour) {
    const grad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    if (goldenHour) {
      grad.addColorStop(0, '#fdba74');
      grad.addColorStop(0.4, '#fb923c');
      grad.addColorStop(0.7, '#f97316');
      grad.addColorStop(1, '#c2410c');
    } else {
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(0.5, '#7dd3fc');
      grad.addColorStop(1, '#bae6fd');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h * 0.65);

    // Sol suave
    const sunGrad = ctx.createRadialGradient(w * 0.75, h * 0.22, 10, w * 0.75, h * 0.22, 120);
    sunGrad.addColorStop(0, goldenHour ? 'rgba(254, 240, 138, 0.95)' : 'rgba(255, 255, 255, 0.9)');
    sunGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w * 0.75, h * 0.22, 120, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawBarn(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    // Corpo do celeiro
    ctx.fillStyle = '#7c2d12';
    ctx.fillRect(-60, -70, 120, 70);
    // Telhado triangular
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.moveTo(-75, -70);
    ctx.lineTo(0, -115);
    ctx.lineTo(75, -70);
    ctx.closePath();
    ctx.fill();
    // Porta e traves de madeira
    ctx.fillStyle = '#292524';
    ctx.fillRect(-22, -45, 44, 45);
    ctx.strokeStyle = '#991b1b';
    ctx.lineWidth = 3;
    ctx.strokeRect(-60, -70, 120, 70);
    ctx.beginPath();
    ctx.moveTo(-20, -45); ctx.lineTo(20, -2);
    ctx.moveTo(20, -45); ctx.lineTo(-20, -2);
    ctx.stroke();
    ctx.restore();
  }

  function drawFence(ctx, w, y) {
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, y - 20); ctx.lineTo(w, y - 20);
    ctx.moveTo(0, y - 8);  ctx.lineTo(w, y - 8);
    ctx.stroke();
    for (let x = 20; x < w; x += 55) {
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x - 4, y - 32, 8, 36);
    }
  }

  function drawSoilCut(ctx, w, h, groundY) {
    // Camada superior verde/grama
    ctx.fillStyle = '#4ade80';
    ctx.fillRect(0, groundY - 6, w, 8);
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, groundY + 2, w, 10);

    // Corte transversal do subsolo (terra marrom escura e fértil)
    const soilGrad = ctx.createLinearGradient(0, groundY, 0, h);
    soilGrad.addColorStop(0, '#543310');
    soilGrad.addColorStop(0.3, '#3b2309');
    soilGrad.addColorStop(1, '#1e1104');
    ctx.fillStyle = soilGrad;
    ctx.fillRect(0, groundY + 12, w, h - groundY);

    // Partículas minerais e pedregulhos no solo
    ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
    for (let i = 0; i < 40; i++) {
      const px = ((i * 37) % w);
      const py = groundY + 20 + ((i * 53) % (h - groundY - 30));
      ctx.beginPath();
      ctx.arc(px, py, 2 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawMeasuringStake(ctx, x, groundY, heightPx) {
    ctx.fillStyle = '#d97706';
    ctx.fillRect(x - 5, groundY - heightPx, 10, heightPx + 40);
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x - 5, groundY - heightPx, 10, heightPx + 40);

    // Marcação métrica 1m e 2m
    ctx.fillStyle = '#fff';
    ctx.fillRect(x - 9, groundY - heightPx * 0.5, 18, 4);
    ctx.fillRect(x - 9, groundY - heightPx * 0.95, 18, 4);
    ctx.font = 'bold 11px sans-serif';
    ctx.fillStyle = '#fef08a';
    ctx.fillText('1m', x + 12, groundY - heightPx * 0.5 + 4);
    ctx.fillText('2m', x + 12, groundY - heightPx * 0.95 + 4);
  }

  function drawPapayaSeed(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Rugosidades
    ctx.fillStyle = '#57534e';
    ctx.beginPath();
    ctx.arc(-2, -2, 2, 0, Math.PI * 2);
    ctx.arc(2, 2, 1.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawPapayaLeaves(ctx, x, y, scale) {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(scale, scale);
    for (let a = 0; a < 7; a++) {
      const angle = (a - 3) * 0.45;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(-18, -40, -10, -70);
      ctx.lineTo(0, -90);
      ctx.lineTo(10, -70);
      ctx.quadraticCurveTo(18, -40, 0, 0);
      ctx.fill();
      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();
  }

  const MamaoRenderer = {
    render: function(ctx, w, h, clipIndex, progress) {
      ctx.save();
      ctx.clearRect(0, 0, w, h);

      const groundY = h * 0.62;

      if (clipIndex === 0) {
        // Cena 1: Corte lateral do solo com 3 sementes caindo na cova
        drawSky(ctx, w, h, false);
        drawFence(ctx, w, groundY - 10);
        drawSoilCut(ctx, w, h, groundY);
        drawMeasuringStake(ctx, w * 0.82, groundY, 180);

        // Cova úmida
        ctx.fillStyle = '#1c1917';
        ctx.beginPath();
        ctx.ellipse(w * 0.42, groundY + 50, 48, 22, 0, 0, Math.PI * 2);
        ctx.fill();

        // 3 sementes caindo
        const p = Math.min(1, progress * 1.3);
        const yStart = groundY - 120;
        const yTarget = groundY + 45;
        const curY = yStart + (yTarget - yStart) * p;

        drawPapayaSeed(ctx, w * 0.36, Math.min(yTarget, curY - 10), 1.2);
        drawPapayaSeed(ctx, w * 0.42, Math.min(yTarget + 5, curY), 1.3);
        drawPapayaSeed(ctx, w * 0.48, Math.min(yTarget, curY - 15), 1.2);

        // Label informativo
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 15px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('Corte Transversal da Cova', w * 0.5, groundY + 110);
      }
      else if (clipIndex === 1) {
        // Cena 2: Time-lapse germinando, raízes e 3 caules passando de 1 metro
        drawSky(ctx, w, h, false);
        drawFence(ctx, w, groundY - 10);
        drawSoilCut(ctx, w, h, groundY);
        drawMeasuringStake(ctx, w * 0.85, groundY, 210);

        const growP = Math.min(1, progress * 1.15);
        const stemHeight = growP * 140;

        // Raízes se aprofundando
        ctx.strokeStyle = '#fef3c7';
        ctx.lineWidth = 2.5;
        for (let i = 0; i < 3; i++) {
          const rx = w * 0.35 + i * 45;
          ctx.beginPath();
          ctx.moveTo(rx, groundY);
          ctx.lineTo(rx - 15, groundY + growP * 65);
          ctx.moveTo(rx, groundY);
          ctx.lineTo(rx + 15, groundY + growP * 75);
          ctx.stroke();
        }

        // 3 caules crescendo juntos
        for (let i = 0; i < 3; i++) {
          const cx = w * 0.33 + i * 55;
          ctx.fillStyle = '#84cc16';
          ctx.fillRect(cx - 5, groundY - stemHeight, 10, stemHeight);
          if (growP > 0.3) {
            drawPapayaLeaves(ctx, cx, groundY - stemHeight, growP * 0.6);
          }
        }
      }
      else if (clipIndex === 2) {
        // Cena 3: Três plantas jovens idênticas em frente ao celeiro
        drawSky(ctx, w, h, false);
        drawBarn(ctx, w * 0.5, groundY - 15, 1.1);
        drawFence(ctx, w, groundY - 8);

        // Chão plano
        ctx.fillStyle = '#65a30d';
        ctx.fillRect(0, groundY, w, h - groundY);

        for (let i = 0; i < 3; i++) {
          const px = w * 0.24 + i * (w * 0.26);
          // Tronco
          ctx.fillStyle = '#65a30d';
          ctx.fillRect(px - 7, groundY - 160, 14, 160);
          drawPapayaLeaves(ctx, px, groundY - 160, 0.95);
        }

        // Tag: Nenhuma diferença
        ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';
        ctx.fillRect(w * 0.2, groundY + 40, w * 0.6, 32);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('100% IDÊNTICAS POR FORA', w * 0.5, groundY + 61);
      }
      else if (clipIndex === 3) {
        // Cena 4: Árvore Fêmea - flor grande colada ao tronco e mamão redondo
        drawSky(ctx, w, h, true);
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(0, groundY, w, h - groundY);

        const treeX = w * 0.5;
        // Tronco em close
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(treeX - 22, groundY - 260, 44, 260);
        drawPapayaLeaves(ctx, treeX, groundY - 260, 1.4);

        // Flor feminina (branca grande colada ao caule)
        ctx.fillStyle = '#fef08a';
        ctx.beginPath();
        ctx.arc(treeX - 24, groundY - 180, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(treeX - 24, groundY - 180, 9, 0, Math.PI * 2);
        ctx.fill();

        // Mamão redondo verde (Fêmea)
        ctx.fillStyle = '#15803d';
        ctx.beginPath();
        ctx.arc(treeX - 35, groundY - 130, 36, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#166534';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Badge FÊMEA
        ctx.fillStyle = '#ec4899';
        ctx.fillRect(treeX + 15, groundY - 145, 95, 28);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♀ FÊMEA', treeX + 62, groundY - 126);
      }
      else if (clipIndex === 4) {
        // Cena 5: Árvore Macho - hastes longas pendentes de florzinhas e fruto defeituoso
        drawSky(ctx, w, h, true);
        ctx.fillStyle = '#4d7c0f';
        ctx.fillRect(0, groundY, w, h - groundY);

        const treeX = w * 0.42;
        ctx.fillStyle = '#4ade80';
        ctx.fillRect(treeX - 20, groundY - 260, 40, 260);
        drawPapayaLeaves(ctx, treeX, groundY - 260, 1.3);

        // Hastes pendentes longas
        ctx.strokeStyle = '#84cc16';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(treeX + 15, groundY - 190);
        ctx.quadraticCurveTo(treeX + 80, groundY - 150, treeX + 100, groundY - 90);
        ctx.stroke();

        // Florzinhas machos pendentes
        ctx.fillStyle = '#fef08a';
        for (let f = 0; f < 8; f++) {
          const fx = treeX + 30 + f * 9;
          const fy = groundY - 180 + f * 12;
          ctx.beginPath();
          ctx.arc(fx, fy, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        // Frutinho pequeno e deformado
        ctx.fillStyle = '#65a30d';
        ctx.beginPath();
        ctx.ellipse(treeX + 100, groundY - 80, 12, 18, 0.4, 0, Math.PI * 2);
        ctx.fill();

        // Badge MACHO
        ctx.fillStyle = '#3b82f6';
        ctx.fillRect(treeX - 110, groundY - 145, 95, 28);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('♂ MACHO', treeX - 62, groundY - 126);
      }
      else if (clipIndex === 5) {
        // Cena 6: Terceira árvore Hermafrodita (frutos alongados e agricultor cortando as outras)
        drawSky(ctx, w, h, true);
        ctx.fillStyle = '#3f6212';
        ctx.fillRect(0, groundY, w, h - groundY);

        // Caules cortados das outras duas (tocos rente ao solo)
        ctx.fillStyle = '#78350f';
        ctx.fillRect(w * 0.18 - 8, groundY - 25, 16, 25);
        ctx.fillRect(w * 0.38 - 8, groundY - 25, 16, 25);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('✂ CORTADO', w * 0.18, groundY - 32);
        ctx.fillText('✂ CORTADO', w * 0.38, groundY - 32);

        // Hermafrodita em destaque
        const treeX = w * 0.68;
        ctx.fillStyle = '#84cc16';
        ctx.fillRect(treeX - 18, groundY - 260, 36, 260);
        drawPapayaLeaves(ctx, treeX, groundY - 260, 1.3);

        // Mamões alongados alaranjados
        for (let m = 0; m < 4; m++) {
          const my = groundY - 190 + m * 28;
          const mx = (m % 2 === 0) ? treeX - 22 : treeX + 22;
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.ellipse(mx, my, 14, 28, (m % 2 === 0 ? -0.2 : 0.2), 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#c2410c';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        // Agricultor simples com podão cortando
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(w * 0.08, groundY - 100, 24, 75); // corpo
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(w * 0.08 + 12, groundY - 115, 10, 0, Math.PI * 2); // chapéu de palha
        ctx.fill();
        ctx.fillStyle = '#94a3b8'; // facão
        ctx.fillRect(w * 0.08 + 24, groundY - 45, 20, 5);

        // Badge HERMAFRODITA
        ctx.fillStyle = '#eab308';
        ctx.fillRect(w * 0.52, groundY - 250, 145, 28);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 13px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('⚥ HERMAFRODITA', w * 0.60, groundY - 231);
      }
      else {
        // Cena 7: Hermafrodita isolada brilhando, mais vendida
        drawSky(ctx, w, h, true);
        drawBarn(ctx, w * 0.22, groundY - 10, 0.85);

        ctx.fillStyle = '#365314';
        ctx.fillRect(0, groundY, w, h - groundY);

        const treeX = w * 0.52;
        ctx.fillStyle = '#a3e635';
        ctx.fillRect(treeX - 22, groundY - 280, 44, 280);
        drawPapayaLeaves(ctx, treeX, groundY - 280, 1.5);

        // Brilho dourado
        const glow = ctx.createRadialGradient(treeX, groundY - 150, 20, treeX, groundY - 150, 160);
        glow.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
        glow.addColorStop(1, 'rgba(250, 204, 21, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(treeX, groundY - 150, 160, 0, Math.PI * 2);
        ctx.fill();

        // Mamões perfeitos alongados maduros
        for (let m = 0; m < 5; m++) {
          const my = groundY - 200 + m * 26;
          const mx = (m % 2 === 0) ? treeX - 26 : treeX + 26;
          ctx.fillStyle = '#f97316';
          ctx.beginPath();
          ctx.ellipse(mx, my, 16, 32, (m % 2 === 0 ? -0.25 : 0.25), 0, Math.PI * 2);
          ctx.fill();
        }

        // Box de Sucesso Comercial
        ctx.fillStyle = 'rgba(15, 23, 42, 0.88)';
        ctx.fillRect(w * 0.15, groundY + 25, w * 0.7, 45);
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.strokeRect(w * 0.15, groundY + 25, w * 0.7, 45);
        ctx.fillStyle = '#facc15';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('A QUE MAIS VENDE NO MERCADO', w * 0.5, groundY + 53);
      }

      ctx.restore();
    }
  };

  global.MamaoRenderer = MamaoRenderer;
})(typeof window !== 'undefined' ? window : this);
