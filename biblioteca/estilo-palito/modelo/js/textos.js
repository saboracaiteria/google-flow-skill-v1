// Os textos por cima da cena: a legenda (uma palavra por vez) e as etiquetas com o nome das peças.
// As etiquetas seguem a peça na tela: o ponto 3D é projetado na imagem a cada quadro.
import * as THREE from "three";
import { clamp, pop } from "./kit.js";

const CSS = `
.leg { position:absolute; left:0; top:0; font-family:"Arial Black", Arial, sans-serif; font-weight:900; font-size:74px; color:#fff;
  -webkit-text-stroke:12px #15161a; paint-order:stroke fill; white-space:nowrap; pointer-events:none }
.leg.nome { color:#ffd21f }
.etq { position:absolute; left:0; top:0; font-family:"Arial Black", Arial, sans-serif; font-weight:900; font-size:44px; color:#ffd21f;
  -webkit-text-stroke:9px #3a2208; paint-order:stroke fill; white-space:nowrap; pointer-events:none }
`;

export function criarTextos(raiz, W, H) {
  const st = document.createElement("style");
  st.textContent = CSS;
  document.head.appendChild(st);
  const camada = document.createElement("div");
  camada.style.cssText = "position:absolute;inset:0;overflow:hidden;pointer-events:none";
  raiz.appendChild(camada);
  const els = new Map(), v = new THREE.Vector3();
  const el = (id, cls) => {
    if (!els.has(id)) {
      const d = document.createElement("div");
      d.className = cls;
      camada.appendChild(d);
      els.set(id, d);
    }
    return els.get(id);
  };
  const por = (e, x, y, s = 1, giro = 0) => {
    e.style.display = "";
    e.style.transform = `translate(${x - e.offsetWidth / 2}px, ${y - e.offsetHeight / 2}px) rotate(${giro}deg) scale(${s})`;
  };
  // legenda: {texto, nome, t0}; etiquetas: [{id, texto, t0, t1, ponto: Vector3}]
  function desenhar(t, legenda, etiquetas, cam) {
    const vistos = new Set();
    if (legenda) {
      const e = el("leg", "leg" + (legenda.nome ? " nome" : ""));
      e.className = "leg" + (legenda.nome ? " nome" : "");
      e.textContent = legenda.texto;
      por(e, W / 2, H * 0.68, 1 + 0.08 * (1 - clamp((t - legenda.t0) / 0.12)));
      vistos.add("leg");
    }
    for (const q of etiquetas) {
      if (t < q.t0 || t >= q.t1) continue;
      const e = el(q.id, "etq");
      e.textContent = q.texto;
      v.copy(q.ponto).project(cam);
      // aparece em 3 quadros (0,1 s), como na referência estudada
      por(e, (v.x * 0.5 + 0.5) * W, (0.5 - v.y * 0.5) * H, pop(t, q.t0, 0.1), -4);
      vistos.add(q.id);
    }
    for (const [id, e] of els) if (!vistos.has(id)) e.style.display = "none";
  }
  return { desenhar };
}
