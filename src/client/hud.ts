/* Paneles de la interfaz: marcador, información, acciones y señas. */
import type { Vista, VistaDuelo } from '../server/vista';
import { porotosSVG } from './arte/escena';
import { SENAS } from './arte/gauchos';

const NIVEL = ['', 'Sin truco', 'Truco', 'Retruco', 'Vale cuatro'];
const SUBIR = ['', 'Truco', 'Retruco', 'Vale cuatro', ''];
const NOMBRE_CANTO: Record<string, string> = { envido: 'Envido', real: 'Real envido', falta: 'Falta envido' };

export interface AccionesHud {
  accion: (tipo: string) => void;
  decir: (que: 'voy' | 'veni') => void;
  sena: (clave: string) => void;
}

export class Hud {
  raiz: HTMLDivElement;
  private q = <T extends HTMLElement>(sel: string) => this.raiz.querySelector(sel) as T;

  constructor(contenedor: HTMLElement, private cb: AccionesHud) {
    this.raiz = document.createElement('div');
    this.raiz.id = 'hud';
    this.raiz.innerHTML = `
      <div id="marcador" class="panel">
        <div class="titulo" data-objetivo>Partido a 30</div>
        <div class="cols">
          <div><div class="eq" data-eq="nos">Nosotros</div><div class="num" data-pts="nos">0</div><div data-por="nos"></div></div>
          <div><div class="eq" data-eq="ellos">Ellos</div><div class="num" data-pts="ellos">0</div><div data-por="ellos"></div></div>
        </div>
        <div class="leyenda" data-leyenda>arriba malas · abajo buenas</div>
      </div>
      <div id="info" class="panel">
        <div><span>Mano:</span> <b data-i="mano"></b></div>
        <div><span>Ronda:</span> <b data-i="ronda"></b></div>
        <div><span>En juego:</span> <b data-i="truco"></b></div>
        <div><span>Bazas:</span> <b data-i="bazas"></b></div>
        <div class="sala" data-i="sala"></div>
      </div>
      <div id="senas" class="panel">
        <button class="cabecera" data-plegar="senas"><span class="titulo">Señas <small>· las hace tu gaucho</small></span><span class="chev">▾</span></button>
        <div class="cuerpo"><div class="grilla">
          ${SENAS.map((s) => `<button class="sena" data-sena="${s.k}"><b>${s.nombre}</b><small>${s.gesto}</small></button>`).join('')}
        </div></div>
      </div>
      <div id="acciones" class="panel">
        <button class="cabecera" data-plegar="acciones"><span class="titulo">Jugada</span><span class="chev">▾</span></button>
        <div class="cuerpo">
          <div id="estado"></div>
          <div class="botones" data-botones></div>
          <div class="companero" data-companero>
            <div class="titulo">Con tu compañero</div>
            <div class="botones">
              <button class="btn" data-decir="voy" title="Vamos a la carta de tu compañero: él juega fuerte">Voy</button>
              <button class="btn" data-decir="veni" title="Vos ponés la carta: tu compañero se guarda la buena">Vení</button>
            </div>
          </div>
        </div>
      </div>`;
    contenedor.appendChild(this.raiz);

    this.raiz.querySelectorAll<HTMLButtonElement>('[data-plegar]').forEach((b) => {
      const id = b.dataset.plegar!;
      const panel = this.q<HTMLDivElement>('#' + id);
      if (localStorage.getItem('truco-plegado-' + id) === '1') panel.classList.add('plegado');
      b.onclick = () => {
        panel.classList.toggle('plegado');
        localStorage.setItem('truco-plegado-' + id, panel.classList.contains('plegado') ? '1' : '0');
      };
    });
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-sena]').forEach((b) => (b.onclick = () => this.cb.sena(b.dataset.sena!)));
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-decir]').forEach((b) => (b.onclick = () => this.cb.decir(b.dataset.decir as 'voy' | 'veni')));
  }

  mostrar(si: boolean) {
    this.raiz.style.display = si ? '' : 'none';
  }

  actualizar(v: Vista) {
    const nos = v.yo >= 0 ? v.yo % 2 : 0, ellos = 1 - nos;
    // Marcador
    this.q('[data-objetivo]').textContent = `Partido a ${v.config.objetivo}`;
    this.q('[data-leyenda]').style.display = v.config.objetivo === 30 ? '' : 'none';
    for (const [k, eq] of [['nos', nos], ['ellos', ellos]] as const) {
      this.q(`[data-eq="${k}"]`).className = `eq e${eq}`;
      this.q(`[data-pts="${k}"]`).textContent = String(v.puntos[eq]);
      this.q(`[data-por="${k}"]`).innerHTML = porotosSVG(v.puntos[eq], v.config.objetivo);
    }
    // Información
    const d = this.miDuelo(v);
    this.q('[data-i="mano"]').textContent = v.jugadores[v.mano]?.nombre ?? '';
    this.q('[data-i="ronda"]').textContent = v.tipoRonda === 'picapica' ? 'Pica-pica' : 'Redonda';
    this.q('[data-i="truco"]').textContent = d ? (d.truco.nivel === 1 ? '1 punto' : `${NIVEL[d.truco.nivel]} (${d.truco.nivel})`) : '—';
    this.q('[data-i="bazas"]').innerHTML = [0, 1, 2].map((i) => {
      const r = d?.resultados[i];
      if (r === undefined) return '<span class="baza">·</span>';
      if (r === -1) return '<span class="baza p">=</span>';
      return `<span class="baza e${r}">${r === nos ? '✔' : '✖'}</span>`;
    }).join('');
    this.q('[data-i="sala"]').textContent = `Sala ${v.codigo}`;

    // Acciones
    const acc = new Set(v.acciones);
    const responder = acc.has('quiero');
    const botones: [string, string, boolean, boolean?][] = [];
    if (responder && d) {
      const pendTruco = d.envido?.pendiente ? null : d.truco.pendiente;
      botones.push(['quiero', 'Quiero', true], ['noquiero', 'No quiero', true, true]);
      if (pendTruco && acc.has('truco')) botones.push(['truco', `Quiero ${SUBIR[pendTruco.nivel].toLowerCase()}`, true]);
      for (const c of ['envido', 'real', 'falta']) if (acc.has(c)) botones.push([c, NOMBRE_CANTO[c], true]);
      if (acc.has('mazo')) botones.push(['mazo', 'Irse al mazo', true, true]);
    } else {
      const nivel = d?.truco.nivel ?? 1;
      botones.push(['envido', 'Envido', acc.has('envido')], ['real', 'Real envido', acc.has('real')], ['falta', 'Falta envido', acc.has('falta')]);
      botones.push(['truco', SUBIR[Math.min(nivel, 3)] || 'Vale cuatro', acc.has('truco')]);
      botones.push(['mazo', 'Irse al mazo', acc.has('mazo'), true]);
    }
    const cont = this.q('[data-botones]');
    const firma = botones.map((b) => b.join(':')).join('|');
    if (cont.dataset.firma !== firma) {
      cont.dataset.firma = firma;
      cont.innerHTML = botones.map(([t, txt, ok, sec]) => `<button class="btn${sec ? ' secundario' : ''}" data-accion="${t}" ${ok ? '' : 'disabled'}>${txt}</button>`).join('');
      cont.querySelectorAll<HTMLButtonElement>('[data-accion]').forEach((b) => (b.onclick = () => this.cb.accion(b.dataset.accion!)));
    }
    if (responder) this.q('#acciones').classList.remove('plegado');

    const hayCompanero = v.config.jugadores > 2;
    this.q('[data-companero]').style.display = hayCompanero ? '' : 'none';
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-decir]').forEach((b) => (b.disabled = !acc.has('voy')));
    this.raiz.querySelectorAll<HTMLButtonElement>('[data-sena]').forEach((b) => (b.disabled = !acc.has('sena')));
    this.q('#estado').textContent = this.textoEstado(v, d, responder);
  }

  private miDuelo(v: Vista): VistaDuelo | null {
    return v.duelos.find((d) => d.asientos.includes(v.yo)) ?? v.duelos[0] ?? null;
  }

  private textoEstado(v: Vista, d: VistaDuelo | null, responder: boolean): string {
    if (v.fase === 'fin') return 'Terminó el partido';
    if (!d) return '';
    if (responder) {
      if (d.envido?.pendiente) return `Te cantaron ${NOMBRE_CANTO[d.envido.cadena[d.envido.cadena.length - 1]]}. ¿Querés?`;
      if (d.truco.pendiente) return `Te cantaron ${NIVEL[d.truco.pendiente.nivel]}. ¿Querés?`;
    }
    if (v.acciones.includes('jugar')) return 'Tu turno: tocá una carta para jugarla';
    if (d.fin) return v.duelos.every((x) => x.fin) ? 'Fin de la mano' : 'Esperando las otras mesas…';
    const pendiente = d.envido?.pendiente ?? d.truco.pendiente;
    if (pendiente) return 'Esperando la respuesta…';
    return `Juega ${v.jugadores[d.turno]?.nombre ?? ''}…`;
  }
}
