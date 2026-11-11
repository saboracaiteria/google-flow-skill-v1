// assets/js/kit_camera.js
// Interpolação esférica contínua e easing para câmeras Three.js (baseado no kit.js da biblioteca)

(function(global) {
  'use strict';

  const KitCamera = {
    // Easing suave (in-out cúbico)
    easeIO(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    },

    // Easing elástico (pop / bounce)
    pop(t, t0, dur) {
      if (t < t0) return 0;
      const x = (t - t0) / dur;
      if (x >= 1) return 1;
      const c4 = (2 * Math.PI) / 3;
      return Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },

    // Posição esférica (azimute az e elevação el em graus, distância d)
    esfera(alvo, azDeg, elDeg, dist) {
      const az = (azDeg * Math.PI) / 180;
      const el = (elDeg * Math.PI) / 180;
      return [
        alvo[0] + dist * Math.cos(el) * Math.sin(az),
        alvo[1] + dist * Math.sin(el),
        alvo[2] + dist * Math.cos(el) * Math.cos(az)
      ];
    },

    // Interpolação suave entre dois estados de câmera
    interpola(k1, k2, tNorm) {
      const f = this.easeIO(Math.max(0, Math.min(1, tNorm)));
      const alvo = [
        k1.alvo[0] + (k2.alvo[0] - k1.alvo[0]) * f,
        k1.alvo[1] + (k2.alvo[1] - k1.alvo[1]) * f,
        k1.alvo[2] + (k2.alvo[2] - k1.alvo[2]) * f
      ];
      const az = k1.az + (k2.az - k1.az) * f;
      const el = k1.el + (k2.el - k1.el) * f;
      const d = k1.d + (k2.d - k1.d) * f;
      const fov = (k1.fov || 45) + ((k2.fov || 45) - (k1.fov || 45)) * f;

      const pos = this.esfera(alvo, az, el, d);
      return { pos, alvo, fov };
    },

    // Aplica na câmera do Three.js
    aplicarNaCamera(threeCamera, params) {
      if (!threeCamera || !params) return;
      threeCamera.position.set(params.pos[0], params.pos[1], params.pos[2]);
      threeCamera.lookAt(params.alvo[0], params.alvo[1], params.alvo[2]);
      if (threeCamera.fov !== params.fov && params.fov) {
        threeCamera.fov = params.fov;
        threeCamera.updateProjectionMatrix();
      }
    }
  };

  global.KitCamera = KitCamera;
})(window);
