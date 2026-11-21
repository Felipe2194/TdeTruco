/*
 * Escena de la mesa en primera persona: fondo CRT, personajes alrededor, cartas y globos de diálogo.
 * Se dibuja a partir de una Vista (lo que el servidor le muestra a este jugador).
 */
import { claveCarta, type Carta } from '../engine/cartas';
import type { Vista, VistaDuelo } from '../server/vista';
import { imagenCarta } from './arte/cartas';
import { CRT_HTML, FONDO_SVG, GRIETA_SVG, HACHA_SVG, MESA_DECO } from './arte/escena';
import { avatarSVG, COLOR_EQUIPO } from './arte/personajes';

const CW = 130, CH = 195; // proporción 2:3, igual que la grilla de las cartas (64x96)

interface Lugar {
  avatar: HTMLDivElement;
  placa: HTMLDivElement;
  burbuja: HTMLDivElement;
  x: number; // centro del avatar (px)
  borde: number; // borde de la mesa bajo el avatar (vh)
  ancho: number; // ancho del avatar (px)
  xoff: number; // desplazamiento horizontal relativo (-1..1)
}

interface Transformacion { x: number; y: number; rx?: number; ry?: number; rz?: number; s?: number }

const PARAMS: Record<number, { sx: number; sy: number; escala: number; cy: number; avatar: number }> = {
  2: { sx: 0, sy: 90, escala: 1, cy: 0.56, avatar: 1 },
  4: { sx: 235, sy: 90, escala: 1, cy: 0.56, avatar: 1 },
  6: { sx: 290, sy: 115, escala: 0.85, cy: 0.57, avatar: 0.88 },
  8: { sx: 320, sy: 128, escala: 0.74, cy: 0.575, avatar: 0.78 },
};

const dormir = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
const esperarFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

function tf(el: HTMLElement, { x, y, rx = 0, ry = 0, rz = 0, s = 1 }: Transformacion) {
  el.style.transform = `translate(${x - CW / 2}px, ${y - CH / 2}px) perspective(800px) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg) scale(${s})`;
}

export class Mesa {
  private capa: HTMLElement;
  private lugares: (Lugar | null)[] = [];
  private firma = '';
  private n = 4;
  private yo = 0;
  private numeroMano = -1;
  private vista: Vista | null = null;

  private miMano: HTMLDivElement[] = [];
  private abanicos: HTMLDivElement[][] = [];
  private jugadas = new Map<string, HTMLDivElement>();
  private giros = new Map<string, number>();
  private hover = -1;
  private ultimoSeq = -1;
  private timersSena: Record<number, number> = {};
  private burbujaYo: HTMLDivElement;
  private repartiendo: Promise<void> | null = null;
  /** Carta propia que ya salió para la mesa y espera la confirmación del servidor. */
  private enviando: string | null = null;
  private mazo: HTMLDivElement | null = null;
  private placaYo: HTMLDivElement;
  private grieta: HTMLDivElement;

  /** Se llama cuando el jugador toca una carta de su mano. Devuelve si el servidor la aceptó. */
  alJugar: (c: Carta) => Promise<boolean> = async () => false;
  /** Se llama con los puntos ganados (para el cartel). */
  alCartel: (texto: string, equipo?: number, detalle?: string) => void = () => {};

  constructor(raiz: HTMLElement) {
    raiz.insertAdjacentHTML('beforeend', `
      ${FONDO_SVG}
      <div id="mesa"></div>
      <div id="grieta">${GRIETA_SVG}</div>
      ${MESA_DECO}
      <div id="capa-mesa"></div>
      ${CRT_HTML}`);
    this.capa = raiz.querySelector('#capa-mesa')!;
    this.grieta = raiz.querySelector('#grieta')!;
    document.body.insertAdjacentHTML('beforeend', '<div id="girar"><div class="tarjeta"><div class="telefono"></div>Girá el celular para jugar</div></div>');
    this.placaYo = document.createElement('div');
    this.placaYo.className = 'placa placa-yo';
    this.capa.appendChild(this.placaYo);
    this.burbujaYo = this.crearBurbuja();
    addEventListener('resize', () => this.reubicar());
  }

  private crearBurbuja() {
    const b = document.createElement('div');
    b.className = 'burbuja';
    document.body.appendChild(b);
    return b;
  }

  // ---------------------------------------------------------------- Distribución
  private u = () => Math.min(innerHeight / 900, innerWidth / 1600);
  private rel = (asiento: number) => (asiento - this.yo + this.n) % this.n;

  private configurar(v: Vista) {
    const firma = `${v.config.jugadores}|${v.yo}|${v.jugadores.map((j) => j?.nombre ?? '').join(',')}`;
    if (firma === this.firma) return;
    this.firma = firma;
    this.n = v.config.jugadores;
    document.body.dataset.jugadores = String(this.n);
    this.yo = v.yo >= 0 ? v.yo : 0;
    this.lugares.forEach((l) => { l?.avatar.remove(); l?.placa.remove(); l?.burbuja.remove(); });
    this.lugares = Array(this.n).fill(null);
    for (let a = 0; a < this.n; a++) {
      if (a === this.yo) continue;
      const j = v.jugadores[a];
      const avatar = document.createElement('div');
      avatar.className = 'avatar';
      avatar.innerHTML = avatarSVG(a, COLOR_EQUIPO[a % 2]);
      avatar.style.setProperty('--desfase', `${-a * 0.7}s`);
      avatar.style.setProperty('--parpadeo', `${a * 1.1}s`);
      const placa = document.createElement('div');
      placa.className = 'placa';
      const companero = a % 2 === this.yo % 2;
      placa.innerHTML = `<i style="background:${COLOR_EQUIPO[a % 2]}"></i>${escapar(j?.nombre ?? '—')}<small class="rol" data-rol="${companero ? 'compañero' : 'rival'}">${companero ? 'compañero' : 'rival'}</small>${FICHAS}`;
      this.capa.append(avatar, placa);
      this.lugares[a] = { avatar, placa, burbuja: this.crearBurbuja(), x: 0, borde: 0, ancho: 0, xoff: 0 };
    }
    this.placaYo.innerHTML = `<i style="background:${COLOR_EQUIPO[this.yo % 2]}"></i>Vos${FICHAS}`;
    this.ubicarAvatares();
  }

  /** Quien reparte se sienta justo antes de la mano (se juega en sentido antihorario). */
  private repartidor = (v: Vista) => (v.mano - 1 + this.n) % this.n;

  private marcarManoYReparte(v: Vista) {
    const reparte = this.repartidor(v);
    const pica = v.tipoRonda === 'picapica';
    for (let a = 0; a < this.n; a++) {
      const placa = a === this.yo ? this.placaYo : this.lugares[a]?.placa;
      if (!placa) continue;
      placa.classList.toggle('es-mano', a === v.mano);
      placa.classList.toggle('reparte', a === reparte);
      // En pica-pica cada uno juega su propio duelo: la placa dice contra quién y cómo viene.
      const d = v.duelos.find((x) => x.asientos.includes(a));
      const rival = d?.asientos.find((b) => b % 2 !== a % 2);
      const rol = placa.querySelector<HTMLElement>('.rol');
      if (rol) rol.textContent = pica && rival !== undefined ? `vs ${rival === this.yo ? 'vos' : v.jugadores[rival]?.nombre ?? ''}` : rol.dataset.rol ?? '';
      const ficha = placa.querySelector<HTMLElement>('.f-duelo')!;
      let texto = '', clase = '';
      if (pica && d) {
        if (d.fin) { texto = d.fin.ganador === a % 2 ? `Ganó +${d.fin.puntos}` : 'Perdió'; clase = d.fin.ganador === a % 2 ? 'gano' : 'perdio'; }
        else if (d.envido?.pendiente) { texto = '¿' + NOMBRE_ENVIDO[d.envido.cadena[d.envido.cadena.length - 1]] + '?'; clase = 'canto'; }
        else if (d.truco.pendiente) { texto = '¿' + NOMBRE_TRUCO[d.truco.pendiente.nivel] + '?'; clase = 'canto'; }
        else if (d.truco.nivel > 1) { texto = NOMBRE_TRUCO[d.truco.nivel]; clase = 'truco'; }
      }
      ficha.textContent = texto;
      ficha.className = `ficha f-duelo ${clase}`;
    }
  }

  private ubicarAvatares() {
    const W = innerWidth, H = innerHeight;
    const otros = this.n - 1;
    const factor = PARAMS[this.n].avatar;
    const A = 0.36;
    // Alto de los personajes: el de la pantalla, sin que se encimen con el vecino si la pantalla es angosta.
    const separacion = otros > 1 ? (2 * A * W) / (otros - 1) : Infinity;
    const uAvatar = Math.min(H / 900, (separacion * 1.25) / (0.76 * 33 * factor * 9));
    for (let a = 0; a < this.n; a++) {
      const l = this.lugares[a];
      if (!l) continue;
      const r = this.rel(a);
      const f = otros === 1 ? 0.5 : (r - 1) / (otros - 1);
      const xoff = (0.5 - f) * 2 * A; // a tu derecha el siguiente en jugar
      const cercania = Math.abs(xoff) / A;
      const altoPx = (33 + 5 * cercania) * factor * 9 * uAvatar;
      const anchoPx = altoPx * 0.76;
      const ratio = (xoff * W) / (0.75 * W);
      const borde = 93 - 55 * Math.sqrt(Math.max(0, 1 - ratio * ratio));
      const x = W / 2 + xoff * W;
      Object.assign(l, { x, borde, ancho: anchoPx, xoff: xoff / A });
      const st = l.avatar.style;
      st.width = `${anchoPx}px`;
      st.height = `${altoPx}px`;
      st.left = `${x - anchoPx / 2}px`;
      st.top = `${((borde + 5) * H) / 100 - altoPx}px`;
      // Siempre detrás de la mesa (z 3); los de los costados, delante de los del fondo.
      st.zIndex = cercania > 0.5 ? '2' : '1';
      st.transform = xoff === 0 ? '' : `perspective(900px) rotateY(${-Math.sign(xoff) * 22 * cercania}deg)`;
      // La placa va sobre el pecho, por encima del borde de la mesa (así no la tapan las cartas jugadas).
      l.placa.style.left = `${x}px`;
      l.placa.style.top = `${borde - 3.4}vh`;
      l.burbuja.style.left = `${x}px`;
      l.burbuja.style.top = `${((borde + 5) * H) / 100 - altoPx + 6}px`;
    }
    this.placaYo.style.left = `${W / 2 - 300 * this.u()}px`;
    this.placaYo.style.top = `${H - 64 * this.u()}px`;
    this.burbujaYo.style.left = `${W / 2 - 300 * this.u()}px`;
    this.burbujaYo.style.top = `${H - 150 * this.u()}px`;
  }

  private posManoAjena(a: number, i: number, total: number): Transformacion {
    const l = this.lugares[a]!;
    const u = this.u();
    const factor = PARAMS[this.n].avatar;
    // Las cartas tapadas se sostienen a la altura del pecho, del lado que mira al centro de la mesa.
    const lado = l.xoff > 0.4 ? -1 : 1;
    const x = l.x + lado * l.ancho * 0.4;
    const y = (l.borde - 8) * innerHeight / 100;
    const off = i - (total - 1) / 2;
    return { x: x + off * 20 * u * factor, y: y + Math.abs(off) * 4 * u, ry: 180, rz: off * 13 + lado * 8, s: 0.36 * u * factor };
  }

  private posJugada(a: number, baza: number, giro: number): Transformacion {
    const P = PARAMS[this.n];
    const u = this.u();
    const s = ((153 * u) / (CH * 0.95)) * P.escala;
    const l = this.lugares[a];
    if (this.n >= 6 && l) {
      return {
        x: innerWidth / 2 + (l.x - innerWidth / 2) * 0.88 + (baza - 1) * 16 * u,
        y: (l.borde * innerHeight) / 100 + 92 * u * P.escala + baza * 7 * u,
        rx: 16, rz: giro, s,
      };
    }
    const psi = (this.rel(a) / this.n) * Math.PI * 2;
    return {
      x: innerWidth / 2 + Math.sin(psi) * P.sx * u + (baza - 1) * 30 * u * P.escala,
      y: innerHeight * P.cy + Math.cos(psi) * P.sy * u,
      rx: 16, rz: giro, s,
    };
  }

  private posEnMano(i: number, total: number): Transformacion {
    const off = i - (total - 1) / 2, u = this.u(), arriba = i === this.hover;
    return {
      x: innerWidth / 2 + off * 122 * u,
      y: innerHeight - 88 * u + Math.abs(off) * 12 * u - (arriba ? 42 * u : 0),
      rz: off * 8, s: (arriba ? 1.16 : 1.1) * u,
    };
  }

  /**
   * El mazo queda sobre la mesa, a la derecha de quien reparte (mirando al centro).
   * Como la mano es el siguiente en sentido antihorario, el mazo queda del lado de la mano.
   */
  private posMazo(): Transformacion {
    const v = this.vista;
    if (!v || !v.duelos.length) return { x: innerWidth / 2, y: innerHeight * 0.56, rx: 40, ry: 180, s: 0.5 * this.u() };
    const P = PARAMS[this.n], u = this.u();
    const psi = (this.rel(this.repartidor(v)) / this.n) * Math.PI * 2;
    const ax = innerWidth / 2 + Math.sin(psi) * Math.max(P.sx + 100, 300) * u;
    const ay = innerHeight * P.cy + Math.cos(psi) * (P.sy + 25) * u;
    const k = 160 * u * Math.max(P.escala, 0.85);
    return { x: ax + Math.cos(psi) * k, y: ay - Math.sin(psi) * k * 0.45, rx: 38, ry: 180, rz: (-psi * 180) / Math.PI + 90, s: 0.42 * u * P.escala };
  }

  private ubicarMazo() {
    if (!this.mazo) {
      this.mazo = this.crearCarta(null);
      this.mazo.classList.add('mazo');
    }
    this.mazo.style.display = this.vista?.duelos.length ? '' : 'none';
    tf(this.mazo, this.posMazo());
  }

  private reubicar() {
    this.ubicarAvatares();
    if (this.mazo) this.ubicarMazo();
    if (this.vista) this.dibujarCartas(this.vista, false);
  }

  // ---------------------------------------------------------------- Cartas
  private crearCarta(c: Carta | null): HTMLDivElement {
    const el = document.createElement('div');
    el.className = 'carta';
    el.innerHTML = `<img class="frente" src="${imagenCarta(c)}" alt="" draggable="false"><img class="dorso" src="${imagenCarta(null)}" alt="" draggable="false">`;
    this.capa.appendChild(el);
    return el;
  }

  private async limpiar() {
    const todas = [...this.miMano, ...this.abanicos.flat(), ...this.jugadas.values()];
    this.miMano = [];
    this.abanicos = [];
    this.jugadas.clear();
    this.giros.clear();
    if (!todas.length) return;
    todas.forEach((el) => { el.classList.remove('rapida', 'ganadora'); tf(el, this.posMazo()); });
    await new Promise((r) => setTimeout(r, 520));
    todas.forEach((el) => el.remove());
  }

  private async repartir(v: Vista) {
    await this.limpiar();
    const todos: HTMLDivElement[] = [];
    this.miMano = v.miMano.map((c) => {
      const el = this.crearCarta(c);
      el.classList.add('mia');
      el.dataset.clave = claveCarta(c);
      this.prepararCartaPropia(el);
      todos.push(el);
      return el;
    });
    this.abanicos = Array.from({ length: this.n }, (_, a) =>
      a === this.yo ? [] : Array.from({ length: 3 }, () => { const el = this.crearCarta(null); todos.push(el); return el; }));
    this.ubicarMazo();
    todos.forEach((el) => { el.classList.add('rapida'); tf(el, this.posMazo()); });
    await esperarFrame();
    todos.forEach((el) => el.classList.remove('rapida'));
    // Se reparte de a una carta, empezando por la mano y siguiendo en sentido antihorario.
    const orden = Array.from({ length: this.n }, (_, k) => (v.mano + k) % this.n);
    const pausa = this.n <= 2 ? 170 : this.n <= 4 ? 120 : 80;
    for (let i = 0; i < 3; i++) {
      for (const a of orden) {
        if (a === this.yo) {
          if (this.miMano[i]) tf(this.miMano[i], this.posEnMano(i, this.miMano.length));
        } else {
          const el = this.abanicos[a]?.[i];
          if (el) tf(el, this.posManoAjena(a, i, 3));
        }
        await dormir(pausa);
      }
    }
    await dormir(450);
    this.miMano.forEach((el) => el.classList.add('rapida'));
  }

  private prepararCartaPropia(el: HTMLDivElement) {
    el.onmouseenter = () => { this.hover = this.miMano.indexOf(el); this.acomodarMano(); };
    el.onmouseleave = () => { this.hover = -1; this.acomodarMano(); };
    el.onclick = () => {
      const v = this.vista;
      if (!v?.acciones.includes('jugar') || this.enviando || this.repartiendo) return;
      const c = v.miMano.find((x) => claveCarta(x) === el.dataset.clave);
      if (!c) return;
      // La carta sale para la mesa sin esperar al servidor; si la rechaza, vuelve a la mano.
      const clave = claveCarta(c);
      const d = v.duelos.find((x) => x.asientos.includes(this.yo));
      this.enviando = clave;
      this.hover = -1;
      this.miMano.forEach((x) => x.classList.add('bloqueada'));
      el.classList.remove('rapida');
      el.style.zIndex = String(5 + (d?.baza ?? 0));
      tf(el, this.posJugada(this.yo, d?.baza ?? 0, 0));
      this.alJugar(c).then((ok) => {
        if (this.enviando !== clave) return;
        this.enviando = null;
        if (!ok) {
          el.classList.add('rapida');
          el.style.zIndex = '';
          if (this.vista) this.dibujarCartas(this.vista);
        }
      });
    };
  }

  private acomodarMano() {
    const enMano = this.miMano.filter((el) => el.dataset.clave !== this.enviando);
    enMano.forEach((el, i) => tf(el, this.posEnMano(i, enMano.length)));
  }

  /** Reconciliación de las cartas con la vista. */
  private dibujarCartas(v: Vista, animar = true) {
    // Mi mano: quitar las que ya no tengo (pasan a la mesa).
    const claves = new Set(v.miMano.map(claveCarta));
    this.miMano = this.miMano.filter((el) => claves.has(el.dataset.clave!));
    const puedoJugar = v.acciones.includes('jugar') && !this.enviando;
    this.miMano.forEach((el) => el.classList.toggle('bloqueada', !puedoJugar));
    if (this.hover >= this.miMano.length) this.hover = -1;
    this.acomodarMano();

    // Cartas jugadas.
    for (const d of v.duelos) this.dibujarDuelo(d, animar);

    // Cartas tapadas de los demás.
    for (let a = 0; a < this.n; a++) {
      if (a === this.yo) continue;
      const fan = (this.abanicos[a] ??= []);
      const quedan = v.cartasEnMano[a] ?? 0;
      while (fan.length > quedan) fan.pop()!.remove();
      fan.forEach((el, i) => tf(el, this.posManoAjena(a, i, fan.length)));
    }
  }

  private dibujarDuelo(d: VistaDuelo, animar: boolean) {
    const actual = d.jugadas.reduce((m, j) => Math.max(m, j.baza), 0);
    const completa = d.ganadores.length > actual;
    for (const j of d.jugadas) {
      const clave = claveCarta(j.carta);
      let el = this.jugadas.get(clave);
      if (!el) {
        const mia = document.querySelector<HTMLDivElement>(`.carta.mia[data-clave="${clave}"]`);
        if (mia) {
          el = mia;
          if (this.enviando === clave) this.enviando = null;
          el.style.zIndex = '';
          el.classList.remove('mia', 'rapida', 'bloqueada');
          el.onclick = el.onmouseenter = el.onmouseleave = null;
          this.miMano = this.miMano.filter((x) => x !== mia);
          this.hover = -1;
        } else {
          const fan = this.abanicos[j.asiento] ?? [];
          el = fan.shift() ?? this.crearCarta(null);
          (el.querySelector('.frente') as HTMLImageElement).src = imagenCarta(j.carta);
          if (!animar) el.classList.add('rapida');
        }
        this.jugadas.set(clave, el);
        this.giros.set(clave, (Math.random() - 0.5) * 6);
      }
      el.style.zIndex = String(5 + j.baza);
      el.classList.toggle('vieja', j.baza < actual);
      el.classList.toggle('ganadora', completa && j.baza === actual && d.ganadores[actual] === j.asiento);
      tf(el, this.posJugada(j.asiento, j.baza, this.giros.get(clave) ?? 0));
    }
  }

  // ---------------------------------------------------------------- Actualización
  async actualizar(v: Vista) {
    this.vista = v;
    this.configurar(v);
    // Turno: resaltar placas de quienes tienen que actuar.
    this.lugares.forEach((l, a) => l?.placa.classList.toggle('turno', v.actuan.includes(a)));

    this.marcarManoYReparte(v);

    if (v.numeroMano !== this.numeroMano && v.duelos.length) {
      const primera = this.numeroMano === -1;
      this.numeroMano = v.numeroMano;
      this.enviando = null;
      const pica = v.tipoRonda === 'picapica';
      if (pica && !primera) {
        this.repartiendo = this.limpiar().then(() => this.hachazo()).then(() => this.repartir(v));
      } else {
        this.grieta.classList.toggle('visible', pica);
        this.repartiendo = this.repartir(v);
      }
    }
    if (this.repartiendo) {
      await this.repartiendo;
      this.repartiendo = null;
    }
    if (this.vista === v) this.dibujarCartas(v);
  }

  /** Muestra los eventos nuevos (cantos, señas, puntos). */
  procesarEventos(v: Vista, primeraVez: boolean) {
    for (const e of v.eventos) {
      if (e.seq <= this.ultimoSeq) continue;
      this.ultimoSeq = e.seq;
      if (primeraVez) continue;
      const retraso = e.retraso ?? 0;
      setTimeout(() => {
        switch (e.tipo) {
          case 'canto': this.decir(e.asiento!, e.texto!); break;
          case 'sena': if (e.asiento !== this.yo) this.sena(e.asiento!, e.texto!); break;
          case 'puntos': {
            const eq = Number(e.datos!.equipo);
            this.alCartel(`${eq === this.yo % 2 ? 'Nosotros' : 'Ellos'} +${e.datos!.puntos}`, eq, String(e.datos!.motivo ?? ''));
            break;
          }
          case 'baza': if (Number(e.datos!.ganador) === -1) this.alCartel('¡Parda!'); break;
          case 'carta': {
            const a = e.asiento!;
            const l = this.lugares[a];
            if (l) { l.avatar.classList.add('asiente'); setTimeout(() => l.avatar.classList.remove('asiente'), 500); }
            break;
          }
        }
      }, retraso);
    }
  }

  /** Punta y hacha: un hachazo parte la mesa al medio antes de repartir la pica-pica. */
  async hachazo() {
    const P = PARAMS[this.n];
    const capa = document.createElement('div');
    capa.id = 'hachazo';
    capa.style.setProperty('--cx', `${innerWidth / 2}px`);
    capa.style.setProperty('--cy', `${innerHeight * P.cy}px`);
    const colores = ['#4fae78', '#2a6a47', '#c97a3a', '#7a4420', '#f4f1e8'];
    let astillas = '';
    for (let i = 0; i < 18; i++) {
      const ang = Math.PI + (i / 17) * Math.PI + (Math.random() - 0.5) * 0.3;
      const dist = 90 + Math.random() * 170;
      astillas += `<i class="astilla" style="--dx:${Math.cos(ang) * dist * 1.6}px;--dy:${Math.sin(ang) * dist}px;background:${colores[i % colores.length]};--t:${(6 + Math.random() * 8) | 0}px"></i>`;
    }
    capa.innerHTML = `<div class="destello"></div><div class="hacha">${HACHA_SVG}</div>${astillas}<div class="titulo-hacha">¡Punta<br>y hacha!</div>`;
    document.body.appendChild(capa);
    await dormir(330); // el golpe
    this.grieta.classList.add('visible');
    document.body.classList.add('temblor');
    setTimeout(() => document.body.classList.remove('temblor'), 500);
    await dormir(1950);
    capa.classList.add('fuera');
    await dormir(350);
    capa.remove();
  }

  decir(asiento: number, texto: string, ms = 1800) {
    const b = asiento === this.yo ? this.burbujaYo : this.lugares[asiento]?.burbuja;
    if (!b) return;
    b.textContent = texto;
    b.classList.add('visible');
    clearTimeout(Number(b.dataset.t));
    b.dataset.t = String(setTimeout(() => b.classList.remove('visible'), ms));
    const av = this.lugares[asiento]?.avatar;
    if (av) {
      av.classList.add('hablando');
      setTimeout(() => av.classList.remove('hablando'), 700);
    }
  }

  sena(asiento: number, clave: string, ms = 1500) {
    const av = this.lugares[asiento]?.avatar;
    if (!av) return;
    [...av.classList].filter((c) => c.startsWith('s-')).forEach((c) => av.classList.remove(c));
    av.classList.add('s-' + clave);
    clearTimeout(this.timersSena[asiento]);
    this.timersSena[asiento] = window.setTimeout(() => av.classList.remove('s-' + clave), ms);
  }

  /** Para la galería: deja una seña fija en un asiento. */
  fijarSena(asiento: number, clave: string | null) {
    const av = this.lugares[asiento]?.avatar;
    if (!av) return;
    [...av.classList].filter((c) => c.startsWith('s-')).forEach((c) => av.classList.remove(c));
    if (clave) av.classList.add('s-' + clave);
  }
}

const NOMBRE_TRUCO = ['', '', 'Truco', 'Retruco', 'Vale 4'];
const NOMBRE_ENVIDO: Record<string, string> = { envido: 'Envido', real: 'Real envido', falta: 'Falta envido' };
const FICHAS = '<b class="ficha f-duelo"></b><b class="ficha f-mano" title="Es mano: gana los empates">MANO</b><b class="ficha f-reparte" title="Reparte: el mazo está a su derecha">REPARTE</b>';

export function escapar(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
}
