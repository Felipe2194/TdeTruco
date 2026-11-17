/*
 * TdeTruco — lógica común de los prototipos visuales.
 * Reglas simplificadas (2v2, a 30, sin flor) + interfaz (marcador con fósforos, botones, señas).
 * Cada prototipo implementa una "vista" con:
 *   repartir(manos), jugarCarta(asiento, idx, carta, baza), decir(asiento, texto, ms?),
 *   sena(asiento, clave), limpiarMesa(), resaltar(asiento|null), finBaza?(baza, ganador|null)
 * Asientos: 0 = vos, 1 = rival derecho, 2 = compañero, 3 = rival izquierdo.
 */
(function () {
  'use strict';

  // ---------------------------------------------------------------- Cartas
  const PALOS = ['espada', 'basto', 'oro', 'copa'];
  const NUMEROS = [1, 2, 3, 4, 5, 6, 7, 10, 11, 12];
  const COLOR_PALO = { espada: '#24519c', basto: '#2f6b22', oro: '#a8770a', copa: '#b3261e' };
  const NOMBRES = ['Vos', 'Rival derecho', 'Compañero', 'Rival izquierdo'];
  const CANTO_TRUCO = { 2: 'Truco', 3: 'Quiero retruco', 4: 'Quiero vale cuatro' };
  const NIVEL_TRUCO = { 2: 'Truco', 3: 'Retruco', 4: 'Vale cuatro' };

  const SENAS = [
    { k: 'anchoEspada', nombre: 'Ancho de espada', gesto: 'Levantar las cejas' },
    { k: 'anchoBasto', nombre: 'Ancho de basto', gesto: 'Guiñar un ojo' },
    { k: 'sieteEspada', nombre: '7 de espada', gesto: 'Boca torcida a la derecha' },
    { k: 'sieteOro', nombre: '7 de oro', gesto: 'Boca torcida a la izquierda' },
    { k: 'tres', nombre: 'Un 3', gesto: 'Morder el labio' },
    { k: 'dos', nombre: 'Un 2', gesto: 'Trompita' },
    { k: 'anchoFalso', nombre: 'Ancho falso', gesto: 'Abrir la boca' },
    { k: 'envido', nombre: 'Tengo envido', gesto: 'Inclinar la cabeza' },
    { k: 'nada', nombre: 'Nada', gesto: 'Cerrar los ojos' },
  ];

  function poder(c) {
    const { n, p } = c;
    if (n === 1 && p === 'espada') return 14;
    if (n === 1 && p === 'basto') return 13;
    if (n === 7 && p === 'espada') return 12;
    if (n === 7 && p === 'oro') return 11;
    if (n === 3) return 10;
    if (n === 2) return 9;
    if (n === 1) return 8;
    if (n === 12) return 7;
    if (n === 11) return 6;
    if (n === 10) return 5;
    if (n === 7) return 4;
    if (n === 6) return 3;
    if (n === 5) return 2;
    return 1;
  }

  const valorEnvido = (c) => (c.n >= 10 ? 0 : c.n);
  function tantoEnvido(cs) {
    let mejor = Math.max(...cs.map(valorEnvido));
    for (let i = 0; i < cs.length; i++)
      for (let j = i + 1; j < cs.length; j++)
        if (cs[i].p === cs[j].p) mejor = Math.max(mejor, 20 + valorEnvido(cs[i]) + valorEnvido(cs[j]));
    return mejor;
  }

  function nuevoMazo() {
    const m = [];
    for (const p of PALOS) for (const n of NUMEROS) m.push({ n, p });
    for (let i = m.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [m[i], m[j]] = [m[j], m[i]];
    }
    return m;
  }

  const equipo = (s) => (s % 2 === 0 ? 'N' : 'E');

  // r: resultados de bazas ('N' | 'E' | 'P' parda). eqMano: equipo que es mano.
  function ganadorMano(r, eqMano) {
    const n = r.filter((x) => x === 'N').length;
    const e = r.filter((x) => x === 'E').length;
    if (r.length >= 2) {
      if (n === 2) return 'N';
      if (e === 2) return 'E';
      if (r[0] === 'P' && r[1] !== 'P') return r[1];
      if (r[0] !== 'P' && r[1] === 'P') return r[0];
    }
    if (r.length === 3) {
      if (r[2] === 'P') return r[0] !== 'P' ? r[0] : eqMano;
      return r[2];
    }
    return null;
  }

  // ------------------------------------------------- Dibujo de cartas (canvas)
  // Todos los palos se dibujan en una caja de 100x100 centrada en (0,0).
  function dibujarPalo(x, p, cx, cy, tam) {
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
  function dibujarFigura(x, c) {
    const col = COLOR_PALO[c.p], piel = '#f1c9a0', L = '#2b1a10';
    x.save();
    x.translate(150, 236);
    x.lineJoin = 'round'; x.lineCap = 'round';
    x.strokeStyle = L; x.lineWidth = 3;
    const cara = (cx, cy, r) => {
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
  const PIPS = {
    2: [[0.5, 0.18], [0.5, 0.82]],
    3: [[0.5, 0.15], [0.5, 0.5], [0.5, 0.85]],
    4: [[0.26, 0.18], [0.74, 0.18], [0.26, 0.82], [0.74, 0.82]],
    5: [[0.26, 0.16], [0.74, 0.16], [0.5, 0.5], [0.26, 0.84], [0.74, 0.84]],
    6: [[0.26, 0.14], [0.74, 0.14], [0.26, 0.5], [0.74, 0.5], [0.26, 0.86], [0.74, 0.86]],
    7: [[0.26, 0.12], [0.74, 0.12], [0.5, 0.31], [0.26, 0.5], [0.74, 0.5], [0.26, 0.88], [0.74, 0.88]],
  };
  const CORTES = { oro: 0, copa: 1, espada: 2, basto: 3 }; // "pintas" del marco

  const W_CARTA = 300, H_CARTA = 462;
  function canvasCarta(c) {
    const cv = document.createElement('canvas');
    cv.width = W_CARTA; cv.height = H_CARTA;
    const x = cv.getContext('2d');
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

  function canvasDorso() {
    const cv = document.createElement('canvas');
    cv.width = W_CARTA; cv.height = H_CARTA;
    const x = cv.getContext('2d');
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
  function porotos(n) {
    let s = '<svg viewBox="0 0 40 186" width="34" height="158">';
    for (let q = 0; q < 6; q++) {
      const y = q * 30 + (q >= 3 ? 10 : 0) + 3, x0 = 10, t = 20;
      const seg = [[x0, y + t, x0, y], [x0, y, x0 + t, y], [x0 + t, y, x0 + t, y + t], [x0 + t, y + t, x0, y + t], [x0, y + t, x0 + t, y]];
      const llenos = Math.max(0, Math.min(5, n - q * 5));
      seg.forEach(([a, b, c, d], i) => {
        if (i < llenos) {
          s += `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="#f3d9a0" stroke-width="2.6" stroke-linecap="round"/>`;
          s += `<circle cx="${c}" cy="${d}" r="2.3" fill="#d8402c"/>`;
        } else {
          s += `<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="rgba(243,217,160,.14)" stroke-width="1.5" stroke-dasharray="2 3"/>`;
        }
      });
    }
    s += '<line x1="2" y1="93" x2="38" y2="93" stroke="rgba(243,217,160,.6)" stroke-width="1.2"/>';
    return s + '</svg>';
  }

  // ---------------------------------------------------------------- HUD
  const CSS = `
  #hud{position:fixed;inset:0;pointer-events:none;z-index:10;font-family:system-ui,'Segoe UI',sans-serif;color:#f6e7c8}
  #hud .panel{position:absolute;pointer-events:auto;background:rgba(30,16,10,.78);border:1px solid rgba(255,220,160,.2);
    border-radius:14px;padding:10px 12px;backdrop-filter:blur(6px);box-shadow:0 8px 24px rgba(0,0,0,.4)}
  #hud .titulo{font-weight:800;font-size:12px;letter-spacing:.06em;text-transform:uppercase;color:#e8c46a;margin-bottom:6px}
  #hud .titulo small{text-transform:none;letter-spacing:0;font-weight:500;color:#cdb896}
  #marcador{top:14px;left:14px;width:150px}
  #marcador .cols{display:flex;justify-content:space-around;text-align:center}
  #marcador .eq{font-size:12px;font-weight:700}
  #marcador .nos{color:#8ec1ff}#marcador .ellos{color:#ff9a86}
  #marcador .num{font-size:26px;font-weight:900;line-height:1.1}
  #marcador .leyenda{font-size:10px;text-align:center;color:#cdb896;margin-top:2px}
  #info{top:14px;right:14px;font-size:13px;line-height:1.7;min-width:170px}
  #info span{color:#cdb896}
  #info .baza{display:inline-block;width:20px;text-align:center;font-weight:900}
  #info .baza.N{color:#8ec1ff}#info .baza.E{color:#ff9a86}#info .baza.P{color:#e8c46a}
  #senas{bottom:14px;left:14px;width:290px}
  #senas .grilla{display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px}
  #hud #senas .grilla button{padding:5px 4px;font-size:11px;line-height:1.15;font-weight:700;background:rgba(255,235,200,.07);
    color:#f6e7c8;border:1px solid rgba(255,220,160,.22);box-shadow:none}
  #senas .grilla button small{display:block;font-weight:400;color:#cdb896;font-size:9.5px;margin-top:2px}
  #hud #senas .grilla button:hover{background:rgba(155,35,53,.45)}
  #acciones{bottom:14px;right:14px;width:262px}
  #estado{font-size:13px;min-height:18px;margin-bottom:8px;color:#e8c46a;font-weight:600}
  #acciones .botones{display:flex;gap:6px;flex-wrap:wrap}
  #acciones .respuesta{display:none}
  #hud.respondiendo #acciones .normal{display:none}
  #hud.respondiendo #acciones .respuesta{display:flex}
  #acciones .companero{margin-top:10px;padding-top:8px;border-top:1px solid rgba(255,220,160,.15)}
  #acciones .companero .titulo{margin-bottom:5px}
  #hud button.cabecera{display:flex;width:100%;align-items:center;justify-content:space-between;gap:10px;padding:0;
    background:none;box-shadow:none;border-radius:0;color:inherit;text-align:left}
  #hud button.cabecera .titulo{margin:0}
  #hud button.cabecera:hover .titulo{color:#f3d58a}
  #hud .chev{font-size:14px;color:#e8c46a;transition:transform .2s}
  #hud .cuerpo{margin-top:8px}
  #hud .panel.plegado{width:auto;padding:8px 12px}
  #hud .panel.plegado .cuerpo{display:none}
  #hud .panel.plegado .chev{transform:rotate(180deg)}
  #hud .panel.plegado .titulo small{display:none}
  #hud button{cursor:pointer;border-radius:9px;font:inherit;font-weight:800;font-size:14px;padding:8px 12px;border:0;
    background:linear-gradient(#a52a3c,#6d1424);color:#fbeedd;box-shadow:0 2px 0 #3d0a13,inset 0 1px 0 rgba(255,255,255,.18);
    transition:transform .08s,opacity .2s,filter .15s}
  #hud button:hover:not(:disabled){filter:brightness(1.15)}
  #hud button:active{transform:translateY(1px)}
  #hud button.secundario{background:linear-gradient(#6e5244,#4a3329);box-shadow:0 2px 0 #241610}
  #hud button:disabled{opacity:.32;cursor:not-allowed}
  #hud .companero button{flex:1}
  #cartel{position:absolute;top:30%;left:50%;transform:translate(-50%,-50%) scale(.8);font-size:42px;font-weight:900;
    padding:14px 30px;border-radius:18px;background:rgba(30,16,10,.86);opacity:0;transition:all .25s;white-space:nowrap;
    text-shadow:0 2px 0 #000;border:2px solid rgba(232,196,106,.4)}
  #cartel.visible{opacity:1;transform:translate(-50%,-50%) scale(1)}
  #cartel.N{color:#8ec1ff}#cartel.E{color:#ff9a86}
  .burbuja{position:fixed;left:0;top:0;transform:translate(-50%,-100%) scale(.7);background:#fffbe9;color:#2b1a10;
    padding:7px 14px;border-radius:16px;font:800 18px system-ui,sans-serif;box-shadow:0 6px 18px rgba(0,0,0,.4);
    opacity:0;transition:opacity .18s,transform .18s;pointer-events:none;z-index:9;white-space:nowrap}
  .burbuja::after{content:'';position:absolute;left:50%;bottom:-9px;margin-left:-9px;border:9px solid transparent;
    border-bottom:0;border-top-color:#fffbe9}
  .burbuja.visible{opacity:1;transform:translate(-50%,-100%) scale(1)}
  `;

  const $ = (id) => document.getElementById(id);

  function crearHUD() {
    const st = document.createElement('style');
    st.textContent = CSS;
    document.head.appendChild(st);
    const hud = document.createElement('div');
    hud.id = 'hud';
    hud.innerHTML = `
      <div id="marcador" class="panel">
        <div class="titulo">Partido a 30</div>
        <div class="cols">
          <div><div class="eq nos">Nosotros</div><div class="num" id="pN">0</div><div id="porN"></div></div>
          <div><div class="eq ellos">Ellos</div><div class="num" id="pE">0</div><div id="porE"></div></div>
        </div>
        <div class="leyenda">arriba malas · abajo buenas</div>
      </div>
      <div id="info" class="panel">
        <div><span>Mano:</span> <b id="iMano"></b></div>
        <div><span>En juego:</span> <b id="iTruco"></b></div>
        <div><span>Bazas:</span> <b id="iBazas"></b></div>
      </div>
      <div id="cartel"></div>
      <div id="senas" class="panel">
        <button class="cabecera" data-plegar="senas" title="Plegar / desplegar">
          <span class="titulo">Señas <small>· tocá una para verla en tu compañero</small></span><span class="chev">▾</span>
        </button>
        <div class="cuerpo">
          <div class="grilla">${SENAS.map((s) => `<button data-sena="${s.k}"><b>${s.nombre}</b><small>${s.gesto}</small></button>`).join('')}</div>
        </div>
      </div>
      <div id="acciones" class="panel">
        <button class="cabecera" data-plegar="acciones" title="Plegar / desplegar">
          <span class="titulo">Jugada</span><span class="chev">▾</span>
        </button>
        <div class="cuerpo">
        <div id="estado"></div>
        <div class="botones normal">
          <button id="bEnvido">Envido</button>
          <button id="bTruco">Truco</button>
          <button id="bMazo" class="secundario">Irse al mazo</button>
        </div>
        <div class="botones respuesta">
          <button id="bQuiero">Quiero</button>
          <button id="bNoQuiero" class="secundario">No quiero</button>
          <button id="bEnvidoPrimero">El envido está primero</button>
        </div>
        <div class="companero">
          <div class="titulo">Con tu compañero</div>
          <div class="botones">
            <button id="bVoy" title="Vamos a la carta de tu compañero: él juega fuerte">Voy</button>
            <button id="bVeni" title="Vos ponés la carta: tu compañero se guarda la buena">Vení</button>
          </div>
        </div>
        </div>
      </div>`;
    document.body.appendChild(hud);

    // Paneles plegables (se recuerda el estado entre partidas).
    hud.querySelectorAll('[data-plegar]').forEach((b) => {
      const id = b.dataset.plegar, panel = $(id);
      if (localStorage.getItem('truco-plegado-' + id) === '1') panel.classList.add('plegado');
      b.onclick = () => {
        panel.classList.toggle('plegado');
        localStorage.setItem('truco-plegado-' + id, panel.classList.contains('plegado') ? '1' : '0');
      };
    });

    hud.querySelectorAll('[data-sena]').forEach((b) =>
      b.addEventListener('click', () => V.sena(2, b.dataset.sena))
    );
    $('bEnvido').onclick = () => cantarEnvido();
    $('bEnvidoPrimero').onclick = () => cantarEnvido();
    $('bTruco').onclick = () => cantarTruco();
    $('bMazo').onclick = () => irseAlMazo();
    $('bQuiero').onclick = () => responderTruco(true);
    $('bNoQuiero').onclick = () => responderTruco(false);
    $('bVoy').onclick = () => indicarCompanero('voy');
    $('bVeni').onclick = () => indicarCompanero('veni');
  }

  const log = (txt) => console.debug('[truco]', txt);
  const setEstado = (t) => ($('estado').textContent = t);
  function cartel(txt, eq, ms = 1900) {
    const c = $('cartel');
    c.textContent = txt;
    c.className = 'visible ' + (eq || '');
    clearTimeout(c._t);
    c._t = setTimeout(() => (c.className = ''), ms);
  }

  function crearBurbuja() {
    const b = document.createElement('div');
    b.className = 'burbuja';
    document.body.appendChild(b);
    return b;
  }
  function mostrarBurbuja(b, txt, ms = 1700) {
    b.textContent = txt;
    b.classList.add('visible');
    clearTimeout(b._t);
    b._t = setTimeout(() => b.classList.remove('visible'), ms);
  }

  // ---------------------------------------------------------------- Motor
  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
  const E = {
    puntos: { N: 0, E: 0 }, mano: 0, manos: [[], [], [], []], originales: [],
    turno: 0, lider: 0, baza: 0, jugadas: [], resultados: [],
    truco: 1, puedeSubir: null, envidoHecho: false, esperando: null, ocupado: true,
    enJuego: false, indicacion: null,
  };
  let V = null;

  const fuerza = (cs) => (cs.length ? Math.max(...cs.map(poder)) : 0);
  const puedeEnvido = () => E.baza === 0 && !E.envidoHecho && E.manos[0].length === 3 && E.truco === 1;
  const miTurnoLibre = () => E.turno === 0 && !E.ocupado && !E.esperando;
  const puedeIndicar = () => E.enJuego && !E.indicacion && !E.jugadas.some((j) => j.s === 2) && E.manos[2].length > 0;
  function sumar(eq, p) { E.puntos[eq] = Math.min(30, E.puntos[eq] + p); }

  function actualizarHUD() {
    $('pN').textContent = E.puntos.N;
    $('pE').textContent = E.puntos.E;
    $('porN').innerHTML = porotos(E.puntos.N);
    $('porE').innerHTML = porotos(E.puntos.E);
    $('iMano').textContent = NOMBRES[E.mano];
    $('iTruco').textContent = E.truco === 1 ? '1 punto' : `${NIVEL_TRUCO[E.truco]} (${E.truco})`;
    $('iBazas').innerHTML = [0, 1, 2].map((i) => {
      const r = E.resultados[i];
      return `<span class="baza ${r || ''}">${r === 'N' ? '✔' : r === 'E' ? '✖' : r === 'P' ? '=' : '·'}</span>`;
    }).join('');
    const libre = miTurnoLibre();
    $('bEnvido').disabled = !(libre && puedeEnvido());
    const bt = $('bTruco');
    bt.textContent = E.truco <= 1 ? 'Truco' : E.truco === 2 ? 'Retruco' : 'Vale cuatro';
    bt.disabled = !(libre && E.truco < 4 && E.puedeSubir !== 'E');
    $('bMazo').disabled = !libre;
    $('bEnvidoPrimero').style.display = E.esperando && puedeEnvido() && !E.ocupado ? '' : 'none';
    $('bQuiero').disabled = $('bNoQuiero').disabled = !!E.ocupado;
    $('bVoy').disabled = $('bVeni').disabled = !puedeIndicar();
    $('hud').classList.toggle('respondiendo', !!E.esperando);
    // Si te cantan algo con el panel plegado, se abre solo para que puedas responder.
    if (E.esperando) $('acciones').classList.remove('plegado');
  }

  function senaDeMano(cs) {
    const tiene = (n, p) => cs.some((c) => c.n === n && (!p || c.p === p));
    if (tiene(1, 'espada')) return 'anchoEspada';
    if (tiene(1, 'basto')) return 'anchoBasto';
    if (tiene(7, 'espada')) return 'sieteEspada';
    if (tiene(7, 'oro')) return 'sieteOro';
    if (tiene(3)) return 'tres';
    if (tiene(2)) return 'dos';
    if (tiene(1)) return 'anchoFalso';
    if (tantoEnvido(cs) >= 27) return 'envido';
    return 'nada';
  }

  async function nuevaMano() {
    E.ocupado = true;
    E.enJuego = false;
    await V.limpiarMesa();
    const m = nuevoMazo();
    E.manos = [0, 1, 2, 3].map((i) => m.slice(i * 3, i * 3 + 3));
    E.originales = E.manos.map((h) => h.slice());
    Object.assign(E, { baza: 0, jugadas: [], resultados: [], truco: 1, puedeSubir: null, envidoHecho: false, esperando: null, indicacion: null });
    E.turno = E.lider = E.mano;
    actualizarHUD();
    log(`Nueva mano. Es mano: ${NOMBRES[E.mano]}`);
    await V.repartir(E.manos.map((h) => h.slice()));
    E.enJuego = true;
    setTimeout(() => V.sena(2, senaDeMano(E.originales[2])), 700);
    siguienteTurno();
  }

  async function siguienteTurno() {
    if (E.turno === 0) {
      E.ocupado = false;
      setEstado('Tu turno: tocá una carta para jugarla');
      actualizarHUD();
      if (puedeIndicar() && Math.random() < 0.3) setTimeout(() => V.decir(2, '¿Vas o venís?'), 500);
      return;
    }
    E.ocupado = true;
    actualizarHUD();
    setEstado(`Juega ${NOMBRES[E.turno]}…`);
    await esperar(800);
    turnoBot(E.turno, true);
  }

  async function turnoBot(s, puedeCantar) {
    if (puedeCantar && equipo(s) === 'E' && E.truco < 4 && E.puedeSubir !== 'N') {
      if (Math.random() < (fuerza(E.manos[s]) >= 9 ? 0.4 : 0.1)) {
        const nivel = E.truco + 1;
        V.decir(s, `¡${CANTO_TRUCO[nivel]}!`);
        E.esperando = { nivel, de: s };
        E.ocupado = false;
        setEstado(`${NOMBRES[s]} cantó. ¿Querés?`);
        actualizarHUD();
        return;
      }
    }
    await jugar(s, elegirCarta(s));
  }

  function elegirCarta(s) {
    const orden = E.manos[s].map((c, i) => ({ c, i })).sort((a, b) => poder(a.c) - poder(b.c));
    const mejor = E.jugadas.length ? E.jugadas.reduce((m, j) => (poder(j.carta) > poder(m.carta) ? j : m)) : null;
    // Tu compañero respeta lo que le dijiste.
    if (s === 2 && E.indicacion === 'veni') return orden[0].i;
    if (s === 2 && E.indicacion === 'voy') {
      const gana = mejor && orden.find((o) => poder(o.c) > poder(mejor.carta) && equipo(mejor.s) !== 'N');
      return (gana || orden[orden.length - 1]).i;
    }
    if (!mejor) return (E.baza === 0 ? orden[Math.floor(orden.length / 2)] : orden[orden.length - 1]).i;
    if (equipo(mejor.s) === equipo(s)) return orden[0].i;
    const gana = orden.find((o) => poder(o.c) > poder(mejor.carta));
    return (gana || orden[0]).i;
  }

  async function jugar(s, idx) {
    E.ocupado = true;
    actualizarHUD();
    const carta = E.manos[s].splice(idx, 1)[0];
    E.jugadas.push({ s, carta });
    await V.jugarCarta(s, idx, carta, E.baza);
    if (E.jugadas.length < 4) {
      E.turno = (E.turno + 1) % 4;
      return siguienteTurno();
    }
    await esperar(450);
    let mejor = E.jugadas[0], parda = false;
    for (const j of E.jugadas.slice(1)) {
      const a = poder(j.carta), b = poder(mejor.carta);
      if (a > b) { mejor = j; parda = false; }
      else if (a === b && equipo(j.s) !== equipo(mejor.s)) parda = true;
    }
    const res = parda ? 'P' : equipo(mejor.s);
    E.resultados.push(res);
    log(parda ? 'Baza parda' : `Baza para ${res} (${NOMBRES[mejor.s]})`);
    V.resaltar(parda ? null : mejor.s);
    if (parda) cartel('¡Parda!', '', 1200);
    actualizarHUD();
    const g = ganadorMano(E.resultados, equipo(E.mano));
    if (g) return finMano(g, E.truco, 'ganaron la mano');
    await esperar(1100);
    if (V.finBaza) await V.finBaza(E.baza, parda ? null : mejor.s);
    E.baza++;
    E.jugadas = [];
    E.indicacion = null;
    if (!parda) E.lider = mejor.s;
    E.turno = E.lider;
    siguienteTurno();
  }

  function jugarMiCarta(idx) {
    if (!miTurnoLibre() || idx < 0 || idx >= E.manos[0].length) return false;
    jugar(0, idx);
    return true;
  }

  async function indicarCompanero(tipo) {
    if (!puedeIndicar()) return;
    E.indicacion = tipo;
    actualizarHUD();
    V.decir(0, tipo === 'voy' ? '¡Voy!' : '¡Vení!');
    await esperar(700);
    V.decir(2, tipo === 'voy' ? '¡Dejámela a mí!' : '¡Dale, poné vos!');
  }

  async function cantarTruco() {
    if (!(miTurnoLibre() && E.truco < 4 && E.puedeSubir !== 'E')) return;
    const nivel = E.truco + 1;
    E.ocupado = true;
    actualizarHUD();
    V.decir(0, `¡${CANTO_TRUCO[nivel]}!`);
    await esperar(1100);
    const f = Math.max(fuerza(E.manos[1]), fuerza(E.manos[3]));
    const quiere = Math.random() < (f >= 10 ? 0.85 : f >= 8 ? 0.55 : 0.3) - (nivel - 2) * 0.1;
    if (!quiere) {
      V.decir(1, 'No quiero');
      return finMano('N', E.truco, 'no quisieron');
    }
    V.decir(1, '¡Quiero!');
    E.truco = nivel;
    E.puedeSubir = 'E';
    E.ocupado = false;
    setEstado('Tu turno: tocá una carta para jugarla');
    actualizarHUD();
  }

  async function responderTruco(quiere) {
    const p = E.esperando;
    if (!p || E.ocupado) return;
    E.esperando = null;
    E.ocupado = true;
    actualizarHUD();
    if (!quiere) {
      V.decir(0, 'No quiero');
      return finMano('E', E.truco, 'no quisiste');
    }
    V.decir(0, '¡Quiero!');
    E.truco = p.nivel;
    E.puedeSubir = 'N';
    actualizarHUD();
    await esperar(800);
    turnoBot(p.de, false);
  }

  async function cantarEnvido() {
    const enRespuesta = !!E.esperando;
    if (!puedeEnvido() || E.ocupado) return;
    if (!enRespuesta && E.turno !== 0) return;
    E.ocupado = true;
    E.envidoHecho = true;
    actualizarHUD();
    V.decir(0, enRespuesta ? '¡El envido está primero!' : '¡Envido!');
    await esperar(1100);
    const tN = Math.max(tantoEnvido(E.originales[0]), tantoEnvido(E.originales[2]));
    const tE = Math.max(tantoEnvido(E.originales[1]), tantoEnvido(E.originales[3]));
    const resp = enRespuesta ? E.esperando.de : 1;
    if (!(tE >= 27 || Math.random() < 0.35)) {
      V.decir(resp, 'No quiero');
      sumar('N', 1);
      cartel('Nosotros +1', 'N');
    } else {
      V.decir(resp, '¡Quiero!');
      await esperar(900);
      for (let i = 0; i < 4; i++) {
        const s = (E.mano + i) % 4;
        V.decir(s, `${tantoEnvido(E.originales[s])}`, 2600);
        await esperar(600);
      }
      const gana = tN > tE ? 'N' : tE > tN ? 'E' : equipo(E.mano);
      sumar(gana, 2);
      cartel(`${gana === 'N' ? 'Nosotros' : 'Ellos'} +2 (envido ${tN} a ${tE})`, gana, 2400);
      await esperar(1200);
    }
    actualizarHUD();
    if (E.puntos.N >= 30 || E.puntos.E >= 30) return finPartido();
    E.ocupado = false;
    setEstado(enRespuesta ? '¿Querés el truco?' : 'Tu turno: tocá una carta para jugarla');
    actualizarHUD();
  }

  function irseAlMazo() {
    if (!miTurnoLibre()) return;
    let pts = E.truco;
    if (E.baza === 0 && !E.envidoHecho) pts += 1;
    V.decir(0, 'Me voy al mazo');
    finMano('E', pts, 'te fuiste al mazo');
  }

  async function finMano(eq, pts, motivo) {
    E.ocupado = true;
    E.enJuego = false;
    E.esperando = null;
    sumar(eq, pts);
    const txt = `${eq === 'N' ? 'Nosotros' : 'Ellos'} +${pts}`;
    log(`${txt} (${motivo})`);
    cartel(txt, eq);
    setEstado('');
    actualizarHUD();
    await esperar(2300);
    if (E.puntos.N >= 30 || E.puntos.E >= 30) return finPartido();
    E.mano = (E.mano + 1) % 4;
    nuevaMano();
  }

  async function finPartido() {
    const g = E.puntos.N >= 30 ? 'N' : 'E';
    cartel(g === 'N' ? '¡Ganamos el partido!' : 'Perdimos el partido', g, 3500);
    await esperar(3800);
    E.puntos = { N: 0, E: 0 };
    E.mano = (E.mano + 1) % 4;
    nuevaMano();
  }

  // Los rivales se hacen señas entre ellos: si estás atento, las pescás.
  setInterval(() => {
    if (!V || !E.enJuego || Math.random() < 0.45) return;
    const s = Math.random() < 0.5 ? 1 : 3;
    V.sena(s, SENAS[Math.floor(Math.random() * SENAS.length)].k);
  }, 6500);

  function iniciar(vista, opciones = {}) {
    V = vista;
    if (opciones.nombres) opciones.nombres.forEach((n, i) => n && (NOMBRES[i] = n));
    crearHUD();
    actualizarHUD();
    setTimeout(nuevaMano, 500);
  }

  window.Truco = {
    iniciar, jugarMiCarta, canvasCarta, canvasDorso, crearBurbuja, mostrarBurbuja, esperar,
    SENAS, NOMBRES, equipo, poder, _estado: E,
  };
})();
