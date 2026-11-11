// A cena do vídeo. Este é o EXEMPLO que vem com o skill (um guarda-chuva em três partes): o Claude
// troca o cenário, as peças e as falas pelas do seu vídeo, mantendo o jeito de montar:
//   1. cada peça entra na palavra que fala dela (W("palavra"));
//   2. a câmera fica parada e dá uma aproximação rápida na peça que está sendo falada;
//   3. a etiqueta com o nome aparece um pouco antes do nome ser falado (no começo da frase);
//   4. a legenda é uma palavra por vez, e a frase que dá nome a uma peça fica amarela.
import * as THREE from "three";
import { clamp, lerp, ramp, pop, voar, K, camera, material, malha } from "./kit.js";
import { criarTextos } from "./textos.js";
import T from "./tempos.js";

const W = 1080, H = 1920;
const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9-]/g, "");
const PALAVRAS = T.frases.flatMap((f, i) => f.palavras.map((p) => ({ ...p, frase: i })));
// quando começa a n-ésima palavra que começa com `palavra` (sem acento, sem maiúscula)
export function Wd(palavra, n = 0) {
  const alvo = norm(palavra);
  const achadas = PALAVRAS.filter((p) => norm(p.w).startsWith(alvo));
  if (!achadas[n]) throw new Error(`a palavra "${palavra}" não está nas falas`);
  return achadas[n].s;
}
const Sf = (i) => T.frases[i].s;                   // quando a frase i começa
const fraseDe = (palavra) => PALAVRAS.find((p) => norm(p.w).startsWith(norm(palavra))).frase;

// ---------------- o exemplo: o que entra, em qual palavra ----------------
const PECAS = [
  // ponto: onde a etiqueta fica e para onde a câmera olha; foco: quão perto a câmera chega; de: de onde a peça vem voando
  { id: "cabo", nome: "CABO", palavra: "cabo", ponto: [0.7, 1.0, 0], alvo: [0, 1.9, 0], foco: 9, de: [3, -1, 1] },
  { id: "varetas", nome: "VARETAS", palavra: "varetas", ponto: [0.8, 4.9, 0], alvo: [0, 3.6, 0], foco: 10, de: [-3, 3, 0] },
  { id: "tecido", nome: "TECIDO", palavra: "tecido", ponto: [0, 4.9, 0], alvo: [0, 3.4, 0], foco: 11.5, de: [0, 5, 0] },
];
const FRASES_DE_NOME = new Set(PECAS.map((p) => fraseDe(p.palavra)));

export function criarCena(canvas, raiz) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
  r.setPixelRatio(1);
  r.setSize(W, H, false);
  r.outputColorSpace = THREE.SRGBColorSpace;
  r.toneMapping = THREE.NeutralToneMapping;
  r.shadowMap.enabled = true;
  r.shadowMap.type = THREE.PCFSoftShadowMap;
  const cena = new THREE.Scene();
  cena.background = new THREE.Color(0xe6edf4);
  cena.add(new THREE.HemisphereLight(0xffffff, 0x9a8f80, 1.2));
  const sol = new THREE.DirectionalLight(0xfff0dc, 2.2);
  sol.position.set(-6, 12, 8);
  sol.castShadow = true;
  sol.shadow.mapSize.set(2048, 2048);
  Object.assign(sol.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 });
  cena.add(sol);
  const chao = malha(new THREE.CircleGeometry(4.5, 48), material(0xd3dbe3, { roughness: 0.9 }));
  chao.rotation.x = -Math.PI / 2;
  cena.add(chao);
  const base = malha(new THREE.CylinderGeometry(0.7, 0.8, 0.18, 32), material(0x6b7580));      // um pedestal, para a abertura não ficar vazia
  base.position.y = 0.09;
  cena.add(base);

  // as peças do exemplo
  const grupos = {};
  const TOPO = 4.4, BORDA = 3.5, RAIO = 2.2;          // o alto do guarda-chuva, a altura da borda e o raio aberto
  const cabo = new THREE.Group();
  const haste = malha(new THREE.CylinderGeometry(0.07, 0.07, TOPO - 0.18, 16), material(0x3b3f47, { metalness: 0.4, roughness: 0.3 }));
  haste.position.y = 0.18 + (TOPO - 0.18) / 2;
  const pega = malha(new THREE.CylinderGeometry(0.13, 0.13, 0.9, 16), material(0x7a4a2a));      // onde você segura
  pega.position.y = 0.75;
  cabo.add(haste, pega);
  const varetas = new THREE.Group();
  const cima = new THREE.Vector3(0, 1, 0);
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    // cada vareta vai do alto até a borda, descendo um pouco: o desenho de um guarda-chuva aberto
    const de = new THREE.Vector3(0, TOPO, 0), ate = new THREE.Vector3(Math.cos(a) * RAIO, BORDA, Math.sin(a) * RAIO);
    const dir = ate.clone().sub(de);
    const v = malha(new THREE.CylinderGeometry(0.025, 0.025, dir.length(), 8), material(0x8e949c, { metalness: 0.6, roughness: 0.3 }));
    v.position.copy(de).add(ate).multiplyScalar(0.5);
    v.quaternion.setFromUnitVectors(cima, dir.normalize());
    varetas.add(v);
  }
  const tecido = new THREE.Group();
  const lona = malha(new THREE.ConeGeometry(RAIO + 0.05, TOPO - BORDA, 8, 1, true), material(0xd8342b, { side: THREE.DoubleSide, roughness: 0.6 }));
  lona.position.y = (TOPO + BORDA) / 2 + 0.03;
  lona.rotation.y = Math.PI / 8;          // as pontas do tecido em cima das varetas
  tecido.add(lona);
  Object.assign(grupos, { cabo, varetas, tecido });
  Object.values(grupos).forEach((g) => cena.add(g));

  // a câmera: aberta no começo; em cada peça, uma aproximação rápida (0,6 s) na palavra dela; aberta no fim
  const chaves = [K(0, [0, 2.4, 0], 25, 14, 15), K(Wd("cabo") - 0.3, [0, 2.4, 0], 22, 14, 14.5)];
  PECAS.forEach((p, i) => {
    const t = Wd(p.palavra), ate = (PECAS[i + 1] ? Wd(PECAS[i + 1].palavra) : T.frases[T.frases.length - 1].s) - 0.4;
    // a aproximação rápida (0,6 s) na palavra, depois parada com um leve deslize até a próxima peça
    chaves.push(K(t + 0.15, p.alvo, 25 - i * 12, 12, p.foco), K(ate, p.alvo, 22 - i * 12, 12, p.foco * 0.95));
  });
  chaves.push(K(T.frases[T.frases.length - 1].s + 0.4, [0, 2.6, 0], 0, 16, 14.5), K(T.duracao, [0, 2.6, 0], -12, 16, 13));
  chaves.sort((a, b) => a.t - b.t);

  const cam = new THREE.PerspectiveCamera(40, W / H, 0.1, 200);
  const textos = criarTextos(raiz, W, H);
  const etiquetas = PECAS.map((p) => ({ id: p.id, texto: p.nome, t0: Sf(fraseDe(p.palavra)), t1: Sf(fraseDe(p.palavra)) + 2.6, ponto: new THREE.Vector3(...p.ponto) }));

  function legendaEm(t) {
    for (let i = 0; i < PALAVRAS.length; i++) {
      const p = PALAVRAS[i], fim = Math.min(PALAVRAS[i + 1]?.s ?? p.e + 0.6, p.e + 0.6);
      if (t >= p.s && t < fim) return { texto: p.w.replace(/[.,!?:;]+$/, ""), nome: FRASES_DE_NOME.has(p.frase), t0: p.s };
    }
    return null;
  }

  function quadro(t) {
    for (const p of PECAS) {
      const g = grupos[p.id], m = voar(t, Wd(p.palavra), 0.45, p.de);
      g.visible = m.visivel;
      g.position.set(...m.pos);
      g.rotation.y = m.giro * 1.2;
      g.scale.setScalar(m.visivel ? pop(t, Wd(p.palavra), 0.45) || 1 : 1);
    }
    const c = camera(chaves, t);
    cam.fov = c.fov;
    cam.position.set(...c.p);
    cam.lookAt(...c.l);
    cam.updateProjectionMatrix();
    r.render(cena, cam);
    textos.desenhar(t, legendaEm(t), etiquetas, cam);
  }
  return { quadro };
}
