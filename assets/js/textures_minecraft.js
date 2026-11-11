// textures_minecraft.js - Geração procedural de texturas pixel-art para Minecraft
(function(window) {
  'use strict';

  function createNoiseCanvas(w, h, baseColor, noiseAmount) {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = baseColor;
    ctx.fillRect(0, 0, w, h);

    const imgData = ctx.getImageData(0, 0, w, h);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const n = (Math.random() - 0.5) * noiseAmount;
      data[i] = Math.min(255, Math.max(0, data[i] + n));
      data[i+1] = Math.min(255, Math.max(0, data[i+1] + n));
      data[i+2] = Math.min(255, Math.max(0, data[i+2] + n));
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas;
  }

  function createGrassTexture() {
    const c = createNoiseCanvas(16, 16, '#567d2e', 35);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  function createDirtTexture() {
    const c = createNoiseCanvas(16, 16, '#866043', 45);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  function createStoneTexture() {
    const c = createNoiseCanvas(16, 16, '#757575', 40);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  function createWoodTexture() {
    const c = createNoiseCanvas(16, 16, '#6b4f2c', 30);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  function createLeavesTexture() {
    const c = createNoiseCanvas(16, 16, '#3a5f1b', 40);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    return tex;
  }

  window.MinecraftTextures = {
    grass: createGrassTexture,
    dirt: createDirtTexture,
    stone: createStoneTexture,
    wood: createWoodTexture,
    leaves: createLeavesTexture
  };
})(window);
