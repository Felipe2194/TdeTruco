/* Dibujo de la baraja española en canvas (300x462). */
import type { Carta, Palo } from "../../engine/cartas";

type Ctx = CanvasRenderingContext2D;

export const COLOR_PALO: Record<Palo, string> = { espada: "#24519c", basto: "#2f6b22", oro: "#a8770a", copa: "#b3261e" };

export function dibujarPalo(x: Ctx, p: Palo, cx: number, cy: number, tam: number) {
  x.save();
  x.translate(cx, cy);
  x.scale(tam / 100, tam / 100);
  x.lineJoin = 'round';
  x.lineCap = 'round';
  if (p === 'oro') {
    const g = x.createRadialGradient(-14, -16, 4, 0, 0, 48);
    g.addColorStop(0, '#fff4b0'); g.addColorStop(0.45, '#f2c437'); g.addColorStop(1, '#b07f08');
    x.fillStyle = g; x.strokeStyle = '#6e4a04'; x.lineWidth = 4;
    x.beginPath(); x.arc(0, 0, 45, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillStyle = '#c38c0c';
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2, b = a + Math.PI / 16;
      x.beginPath();
      x.moveTo(Math.cos(a) * 28, Math.sin(a) * 28);
      x.lineTo(Math.cos(a + Math.PI / 32) * 40, Math.sin(a + Math.PI / 32) * 40);
      x.lineTo(Math.cos(b) * 28, Math.sin(b) * 28);
      x.fill();
    }
    x.lineWidth = 3;
    x.beginPath(); x.arc(0, 0, 26, 0, Math.PI * 2); x.stroke();
    const g2 = x.createRadialGradient(-6, -6, 2, 0, 0, 22);
    g2.addColorStop(0, '#fff0a0'); g2.addColorStop(1, '#d9a21a');
    x.fillStyle = g2;
    x.beginPath(); x.arc(0, 0, 22, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#8a5d06';
    x.beginPath(); x.arc(-7, -4, 2.6, 0, 7); x.arc(7, -4, 2.6, 0, 7); x.fill();
    x.lineWidth = 2.4;
    x.beginPath(); x.arc(0, 2, 9, 0.2 * Math.PI, 0.8 * Math.PI); x.stroke();
  } else if (p === 'copa') {
    const oro = x.createLinearGradient(-40, 0, 40, 0);
    oro.addColorStop(0, '#b07f08'); oro.addColorStop(0.45, '#ffe58a'); oro.addColorStop(1, '#a8770a');
    const rojo = x.createLinearGradient(-36, 0, 36, 0);
    rojo.addColorStop(0, '#8e1b1b'); rojo.addColorStop(0.45, '#e85a48'); rojo.addColorStop(1, '#7a1414');
    x.strokeStyle = '#4a1208'; x.lineWidth = 3.5;
    // cuenco
    x.fillStyle = rojo;
    x.beginPath();
    x.moveTo(-36, -40); x.lineTo(36, -40);
    x.bezierCurveTo(36, 2, 20, 14, 8, 16);
    x.lineTo(-8, 16);
    x.bezierCurveTo(-20, 14, -36, 2, -36, -40);
    x.closePath(); x.fill(); x.stroke();
    // borde
    x.fillStyle = oro;
    x.beginPath(); x.roundRect(-40, -50, 80, 12, 5); x.fill(); x.stroke();
    // joyas
    x.fillStyle = '#2d5aa8';
    x.beginPath(); x.arc(0, -20, 6.5, 0, 7); x.fill(); x.stroke();
    x.fillStyle = '#ffe58a';
    for (const dx of [-20, 20]) { x.beginPath(); x.arc(dx, -22, 3.5, 0, 7); x.fill(); }
    // pie
    x.fillStyle = oro;
    x.beginPath(); x.rect(-7, 15, 14, 20); x.fill(); x.stroke();
    x.beginPath(); x.ellipse(0, 24, 12, 5, 0, 0, 7); x.fill(); x.stroke();
    x.beginPath();
    x.moveTo(-8, 34); x.lineTo(8, 34); x.lineTo(30, 46); x.lineTo(-30, 46); x.closePath();
    x.fill(); x.stroke();
  } else if (p === 'espada') {
    const hoja = x.createLinearGradient(-12, 0, 12, 0);
    hoja.addColorStop(0, '#3d6cc0'); hoja.addColorStop(0.5, '#e6eefb'); hoja.addColorStop(1, '#3d6cc0');
    x.strokeStyle = '#142e5c'; x.lineWidth = 3.5;
    x.fillStyle = hoja;
    x.beginPath();
    x.moveTo(0, -54); x.lineTo(11, -38); x.lineTo(9, 16); x.lineTo(-9, 16); x.lineTo(-11, -38);
    x.closePath(); x.fill(); x.stroke();
    x.lineWidth = 2; x.beginPath(); x.moveTo(0, -44); x.lineTo(0, 12); x.stroke();
    // guarda curvada
    const oro = x.createLinearGradient(0, 14, 0, 26);
    oro.addColorStop(0, '#ffe58a'); oro.addColorStop(1, '#b07f08');
    x.fillStyle = oro; x.lineWidth = 3;
    x.beginPath();
    x.moveTo(-30, 12); x.quadraticCurveTo(-34, 22, -24, 24); x.lineTo(24, 24);
    x.quadraticCurveTo(34, 22, 30, 12); x.quadraticCurveTo(0, 20, -30, 12);
    x.closePath(); x.fill(); x.stroke();
    // empuñadura
    x.fillStyle = '#9b2335';
    x.beginPath(); x.roundRect(-6, 24, 12, 20, 3); x.fill(); x.stroke();
    x.strokeStyle = '#5a0f1c'; x.lineWidth = 1.5;
    for (let yy = 28; yy < 44; yy += 4) { x.beginPath(); x.moveTo(-6, yy); x.lineTo(6, yy + 2); x.stroke(); }
    x.strokeStyle = '#142e5c'; x.lineWidth = 3; x.fillStyle = oro;
    x.beginPath(); x.arc(0, 49, 7, 0, 7); x.fill(); x.stroke();
  } else {
    const mad = x.createLinearGradient(-22, 0, 22, 0);
    mad.addColorStop(0, '#6b4220'); mad.addColorStop(0.4, '#c48a4c'); mad.addColorStop(1, '#5e3a17');
    x.strokeStyle = '#3a220c'; x.lineWidth = 3.5;
    // hojas
    x.fillStyle = '#4c8a2e';
    for (const [hx, hy, a] of [[-22, -34, -0.8], [22, -18, 0.7], [-18, 6, -0.6]]) {
      x.save(); x.translate(hx, hy); x.rotate(a);
      x.beginPath(); x.ellipse(0, 0, 13, 6, 0, 0, 7); x.fill(); x.stroke();
      x.restore();
    }
    x.fillStyle = mad;
    x.beginPath();
    x.moveTo(-8, 50); x.lineTo(8, 50); x.lineTo(20, -30);
    x.quadraticCurveTo(24, -54, 0, -54);
    x.quadraticCurveTo(-24, -54, -20, -30);
    x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#4a2c10';
    for (const [a, b, r] of [[-7, -32, 5], [9, -16, 4.5], [-4, 4, 4], [5, 24, 3.5]]) {
      x.beginPath(); x.ellipse(a, b, r, r * 0.7, 0.3, 0, 7); x.fill();
    }
    x.strokeStyle = 'rgba(255,230,190,.5)'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(-8, -44); x.quadraticCurveTo(-12, -20, -4, 40); x.stroke();
  }
  x.restore();
}

// Figuras: sota (10), caballo (11), rey (12).
function dibujarFigura(x: Ctx, c: Carta) {
  const col = COLOR_PALO[c.p], piel = '#f1c9a0', L = '#2b1a10';
  x.save();
  x.translate(150, 236);
  x.lineJoin = 'round'; x.lineCap = 'round';
  x.strokeStyle = L; x.lineWidth = 3;
  const cara = (cx: number, cy: number, r: number) => {
    x.fillStyle = piel;
    x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.stroke();
    x.fillStyle = L;
    x.beginPath(); x.arc(cx - r * 0.35, cy - r * 0.1, 2.6, 0, 7); x.arc(cx + r * 0.35, cy - r * 0.1, 2.6, 0, 7); x.fill();
    x.lineWidth = 2;
    x.beginPath(); x.arc(cx, cy + r * 0.25, r * 0.3, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke();
    x.lineWidth = 3;
  };
  if (c.n === 11) {
    // Caballo
    x.fillStyle = '#8a5a2b';
    for (const lx of [-58, -30, 34, 60]) { x.beginPath(); x.roundRect(lx - 7, 110, 14, 64, 5); x.fill(); x.stroke(); }
    x.beginPath(); x.ellipse(0, 108, 84, 40, 0, 0, 7); x.fill(); x.stroke();
    x.beginPath();
    x.moveTo(-58, 90); x.lineTo(-92, 20); x.quadraticCurveTo(-104, -6, -84, -10);
    x.lineTo(-58, 0); x.lineTo(-36, 80); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#3a220c';
    x.beginPath(); x.moveTo(-84, -10); x.quadraticCurveTo(-60, 10, -40, 70); x.lineTo(-50, 74); x.quadraticCurveTo(-66, 20, -84, -10); x.fill();
    x.beginPath(); x.arc(-82, 6, 3, 0, 7); x.fill();
    x.fillStyle = '#f5e6c8';
    x.beginPath(); x.moveTo(84, 96); x.quadraticCurveTo(112, 120, 98, 160); x.quadraticCurveTo(92, 124, 76, 112); x.fill(); x.stroke();
    // jinete
    x.fillStyle = col;
    x.beginPath(); x.moveTo(-26, 92); x.lineTo(-20, 10); x.quadraticCurveTo(10, -6, 32, 10); x.lineTo(38, 92); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#e8b923'; x.fillRect(-22, 50, 58, 8); x.strokeRect(-22, 50, 58, 8);
    cara(6, -16, 22);
    x.fillStyle = '#2b1a10';
    x.beginPath(); x.ellipse(6, -36, 30, 7, 0, 0, 7); x.fill();
    x.beginPath(); x.roundRect(-10, -58, 32, 22, 6); x.fill();
    dibujarPalo(x, c.p, 58, -10, 52);
  } else {
    const rey = c.n === 12;
    if (rey) {
      x.fillStyle = '#9b2335';
      x.beginPath(); x.moveTo(-72, 172); x.lineTo(-50, -10); x.lineTo(50, -10); x.lineTo(72, 172); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#f5f0e0';
      x.beginPath(); x.roundRect(-52, -16, 104, 16, 8); x.fill(); x.stroke();
    }
    x.fillStyle = col;
    x.beginPath(); x.moveTo(-54, 172); x.lineTo(-40, -6); x.quadraticCurveTo(0, -26, 40, -6); x.lineTo(54, 172); x.closePath(); x.fill(); x.stroke();
    x.fillStyle = '#e8b923';
    x.fillRect(-46, 70, 92, 10); x.strokeRect(-46, 70, 92, 10);
    x.beginPath(); x.moveTo(0, -18); x.lineTo(0, 170); x.stroke();
    cara(0, -50, 30);
    if (rey) {
      x.fillStyle = '#8a7a6a';
      x.beginPath(); x.moveTo(-28, -46); x.quadraticCurveTo(-26, 6, 0, 10); x.quadraticCurveTo(26, 6, 28, -46);
      x.quadraticCurveTo(14, -30, 0, -34); x.quadraticCurveTo(-14, -30, -28, -46); x.fill(); x.stroke();
      x.fillStyle = L;
      x.beginPath(); x.arc(-10, -56, 2.6, 0, 7); x.arc(10, -56, 2.6, 0, 7); x.fill();
      const oro = x.createLinearGradient(0, -110, 0, -74);
      oro.addColorStop(0, '#ffe58a'); oro.addColorStop(1, '#b07f08');
      x.fillStyle = oro;
      x.beginPath();
      x.moveTo(-28, -74); x.lineTo(-32, -106); x.lineTo(-16, -90); x.lineTo(0, -114); x.lineTo(16, -90); x.lineTo(32, -106); x.lineTo(28, -74);
      x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#c0302b';
      for (const jx of [-16, 0, 16]) { x.beginPath(); x.arc(jx, -82, 4, 0, 7); x.fill(); }
    } else {
      x.fillStyle = '#6a3d1c';
      x.beginPath(); x.ellipse(0, -66, 32, 18, 0, Math.PI, 0); x.fill();
      x.fillStyle = col;
      x.beginPath(); x.ellipse(6, -80, 36, 12, -0.2, 0, 7); x.fill(); x.stroke();
      x.strokeStyle = '#c0302b'; x.lineWidth = 5;
      x.beginPath(); x.moveTo(30, -86); x.quadraticCurveTo(60, -120, 44, -132); x.stroke();
      x.strokeStyle = L; x.lineWidth = 3;
    }
    dibujarPalo(x, c.p, 64, 40, rey ? 58 : 64);
  }
  x.restore();
}

// Disposición de los palos (estilo baraja española), en coordenadas 0..1 del área central.
const PIPS: Record<number, number[][]> = {
  2: [[0.5, 0.18], [0.5, 0.82]],
  3: [[0.5, 0.15], [0.5, 0.5], [0.5, 0.85]],
  4: [[0.26, 0.18], [0.74, 0.18], [0.26, 0.82], [0.74, 0.82]],
  5: [[0.26, 0.16], [0.74, 0.16], [0.5, 0.5], [0.26, 0.84], [0.74, 0.84]],
  6: [[0.26, 0.14], [0.74, 0.14], [0.26, 0.5], [0.74, 0.5], [0.26, 0.86], [0.74, 0.86]],
  7: [[0.26, 0.12], [0.74, 0.12], [0.5, 0.31], [0.26, 0.5], [0.74, 0.5], [0.26, 0.88], [0.74, 0.88]],
};
const CORTES: Record<Palo, number> = { oro: 0, copa: 1, espada: 2, basto: 3 }; // "pintas" del marco

export const W_CARTA = 300, H_CARTA = 462;
export function canvasCarta(c: Carta): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = W_CARTA; cv.height = H_CARTA;
  const x = cv.getContext('2d')!;
  const col = COLOR_PALO[c.p];
  // papel
  const papel = x.createRadialGradient(150, 200, 40, 150, 231, 300);
  papel.addColorStop(0, '#fffdf5'); papel.addColorStop(1, '#efe4c8');
  x.fillStyle = papel;
  x.beginPath(); x.roundRect(0, 0, W_CARTA, H_CARTA, 24); x.fill();
  x.strokeStyle = 'rgba(60,40,20,.35)'; x.lineWidth = 2;
  x.beginPath(); x.roundRect(1, 1, W_CARTA - 2, H_CARTA - 2, 23); x.stroke();
  // marco con pintas
  const fx = 18, fy = 18, fw = W_CARTA - 36, fh = H_CARTA - 36;
  x.strokeStyle = col; x.lineWidth = 4; x.lineCap = 'butt';
  x.beginPath(); x.moveTo(fx, fy); x.lineTo(fx, fy + fh); x.moveTo(fx + fw, fy); x.lineTo(fx + fw, fy + fh); x.stroke();
  for (const yy of [fy, fy + fh]) {
    const n = CORTES[c.p], hueco = 16;
    let desde = fx;
    for (let i = 1; i <= n; i++) {
      const cxh = fx + (fw * i) / (n + 1);
      x.beginPath(); x.moveTo(desde, yy); x.lineTo(cxh - hueco / 2, yy); x.stroke();
      desde = cxh + hueco / 2;
    }
    x.beginPath(); x.moveTo(desde, yy); x.lineTo(fx + fw, yy); x.stroke();
  }
  // índices
  const indice = () => {
    x.fillStyle = col;
    x.font = 'bold 50px Georgia, "Times New Roman", serif';
    x.textAlign = 'center'; x.textBaseline = 'top';
    x.fillText(String(c.n), 46, 28);
    dibujarPalo(x, c.p, 46, 104, 30);
  };
  indice();
  x.save(); x.translate(W_CARTA, H_CARTA); x.rotate(Math.PI); indice(); x.restore();
  // centro
  if (c.n >= 10) {
    x.fillStyle = 'rgba(0,0,0,.035)';
    x.beginPath(); x.roundRect(74, 40, 152, 382, 14); x.fill();
    dibujarFigura(x, c);
  } else if (c.n === 1) {
    const especial = c.p === 'espada' || c.p === 'basto';
    if (especial) {
      x.save(); x.translate(150, 231);
      x.strokeStyle = 'rgba(232,185,35,.55)'; x.lineWidth = 3;
      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2;
        x.beginPath(); x.moveTo(Math.cos(a) * 60, Math.sin(a) * 60); x.lineTo(Math.cos(a) * 110, Math.sin(a) * 110); x.stroke();
      }
      x.restore();
    }
    dibujarPalo(x, c.p, 150, 231, especial ? 210 : 180);
  } else {
    const ax = 72, ay = 52, aw = 156, ah = 358;
    const tam = c.n <= 3 ? 86 : c.n <= 5 ? 76 : 66;
    for (const [nx, ny] of PIPS[c.n]) dibujarPalo(x, c.p, ax + nx * aw, ay + ny * ah, tam);
  }
  return cv;
}

export function canvasDorso(): HTMLCanvasElement {
  const cv = document.createElement('canvas');
  cv.width = W_CARTA; cv.height = H_CARTA;
  const x = cv.getContext('2d')!;
  x.fillStyle = '#f5ecd6';
  x.beginPath(); x.roundRect(0, 0, W_CARTA, H_CARTA, 24); x.fill();
  const fondo = x.createRadialGradient(150, 231, 20, 150, 231, 280);
  fondo.addColorStop(0, '#9b2335'); fondo.addColorStop(1, '#5a0f1c');
  x.fillStyle = fondo;
  x.beginPath(); x.roundRect(14, 14, W_CARTA - 28, H_CARTA - 28, 16); x.fill();
  x.save();
  x.beginPath(); x.roundRect(14, 14, W_CARTA - 28, H_CARTA - 28, 16); x.clip();
  x.strokeStyle = 'rgba(232,185,35,.35)'; x.lineWidth = 2;
  for (let i = -H_CARTA; i < W_CARTA + H_CARTA; i += 24) {
    x.beginPath(); x.moveTo(i, 0); x.lineTo(i + H_CARTA, H_CARTA); x.stroke();
    x.beginPath(); x.moveTo(i, H_CARTA); x.lineTo(i + H_CARTA, 0); x.stroke();
  }
  x.restore();
  x.strokeStyle = '#e8b923'; x.lineWidth = 3;
  x.beginPath(); x.roundRect(26, 26, W_CARTA - 52, H_CARTA - 52, 10); x.stroke();
  x.fillStyle = '#f5ecd6';
  x.beginPath(); x.arc(150, 231, 58, 0, 7); x.fill();
  x.strokeStyle = '#e8b923'; x.lineWidth = 4; x.stroke();
  x.fillStyle = '#7b1e2b';
  x.font = 'bold 54px Georgia, serif';
  x.textAlign = 'center'; x.textBaseline = 'middle';
  x.fillText('T', 150, 234);
  return cv;
}

// --------------------------------------------------- Marcador con fósforos

const cache = new Map<string, string>();
/** Imagen (data URL) de una carta, o del dorso si es null. */
export function imagenCarta(c: Carta | null): string {
  const k = c ? c.n + c.p : "dorso";
  let url = cache.get(k);
  if (!url) {
    url = (c ? canvasCarta(c) : canvasDorso()).toDataURL();
    cache.set(k, url);
  }
  return url;
}
