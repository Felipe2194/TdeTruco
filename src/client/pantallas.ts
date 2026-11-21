/* Pantallas fuera de la mesa: inicio, lobby y fin de partido. */
import type { Config } from '../engine/juego';
import type { Vista } from '../server/vista';
import { COLOR_EQUIPO, NOMBRE_EQUIPO } from './arte/personajes';
import { escapar } from './mesa';

export interface OpcionesInicio {
  codigo?: string;
  error?: string;
  alCrear: (nombre: string, config: Config, conBots: boolean) => void;
  alUnirse: (nombre: string, codigo: string) => void;
}

const MODOS: [Config['jugadores'], string][] = [[2, '1 vs 1'], [4, '2 vs 2'], [6, '3 vs 3'], [8, '4 vs 4']];

export function pantallaInicio(el: HTMLElement, o: OpcionesInicio) {
  const config: Config = { jugadores: 4, objetivo: 30, picaPica: true };
  el.innerHTML = `
    <div class="tarjeta">
      <div class="logo">TdeTruco<small>Truco argentino · 1v1 a 4v4</small></div>
      <div class="campo">
        <label for="nombre">Tu nombre</label>
        <input type="text" id="nombre" maxlength="18" placeholder="¿Cómo te dicen?" value="${escapar(localStorage.getItem('truco-nombre') ?? '')}">
      </div>
      <div class="campo">
        <label>Mesa</label>
        <div class="opciones" data-modos>${MODOS.map(([n, t]) => `<button class="opcion${n === 4 ? ' activa' : ''}" data-n="${n}">${t}</button>`).join('')}</div>
      </div>
      <div class="campo">
        <label>Partido</label>
        <div class="opciones" data-puntos>
          <button class="opcion" data-p="15">A 15</button><button class="opcion activa" data-p="30">A 30</button>
        </div>
        <label class="check" data-pica><input type="checkbox" id="pica" checked> Pica-pica (punta y hacha) en la zona media</label>
      </div>
      <div class="fila">
        <button class="btn grande" data-crear>Crear sala</button>
        <button class="btn grande secundario" data-bots>Jugar contra bots</button>
      </div>
      <div class="separador">o entrá a una sala</div>
      <div class="fila" style="margin-top:6px">
        <input type="text" id="codigo" maxlength="4" placeholder="CÓDIGO" value="${escapar(o.codigo ?? '')}">
        <button class="btn grande" data-unirse>Unirme</button>
      </div>
      <div class="error" data-error>${escapar(o.error ?? '')}</div>
    </div>`;
  const $ = <T extends HTMLElement>(s: string) => el.querySelector(s) as T;
  const actualizarPica = () => ($('[data-pica]').style.display = config.jugadores >= 6 ? '' : 'none');
  actualizarPica();
  el.querySelectorAll<HTMLButtonElement>('[data-n]').forEach((b) => (b.onclick = () => {
    config.jugadores = Number(b.dataset.n) as Config['jugadores'];
    el.querySelectorAll('[data-n]').forEach((x) => x.classList.toggle('activa', x === b));
    actualizarPica();
  }));
  el.querySelectorAll<HTMLButtonElement>('[data-p]').forEach((b) => (b.onclick = () => {
    config.objetivo = Number(b.dataset.p) as Config['objetivo'];
    el.querySelectorAll('[data-p]').forEach((x) => x.classList.toggle('activa', x === b));
  }));
  const nombre = () => {
    const n = $<HTMLInputElement>('#nombre').value.trim();
    if (!n) {
      $('[data-error]').textContent = 'Poné tu nombre para sentarte a la mesa';
      $<HTMLInputElement>('#nombre').focus();
      return null;
    }
    localStorage.setItem('truco-nombre', n);
    return n;
  };
  const crear = (bots: boolean) => {
    const n = nombre();
    if (!n) return;
    config.picaPica = $<HTMLInputElement>('#pica').checked;
    o.alCrear(n, { ...config }, bots);
  };
  $('[data-crear]').onclick = () => crear(false);
  $('[data-bots]').onclick = () => crear(true);
  $('[data-unirse]').onclick = () => {
    const n = nombre();
    const c = $<HTMLInputElement>('#codigo').value.trim().toUpperCase();
    if (!n) return;
    if (c.length !== 4) { $('[data-error]').textContent = 'El código tiene 4 letras'; return; }
    o.alUnirse(n, c);
  };
}

export interface OpcionesLobby {
  alSentarse: (asiento: number) => void;
  alBot: (asiento: number, bot: boolean) => void;
  alIniciar: () => void;
  alSalir: () => void;
}

export function pantallaLobby(el: HTMLElement, v: Vista, o: OpcionesLobby) {
  const enlace = `${location.origin}${location.pathname}?sala=${v.codigo}`;
  const modo = MODOS.find(([n]) => n === v.config.jugadores)?.[1] ?? '';
  const columna = (eq: 0 | 1) => v.jugadores.map((j, a) => ({ j, a })).filter(({ a }) => a % 2 === eq).map(({ j, a }) => {
    const yo = a === v.yo;
    let acciones = '';
    if (!j) {
      acciones = `<button class="btn secundario" data-sentar="${a}">Sentarme</button>${v.esHost ? `<button class="btn secundario" data-bot="${a}">+ Bot</button>` : ''}`;
    } else if (j.bot) {
      acciones = `<button class="btn secundario" data-sentar="${a}">Sentarme</button>${v.esHost ? `<button class="btn secundario" data-sacar="${a}">Quitar</button>` : ''}`;
    }
    return `<div class="asiento${yo ? ' yo' : ''}">
      ${j ? `<span class="nombre">${escapar(j.nombre)}${j.bot ? ' 🤖' : ''}${yo ? ' (vos)' : ''}</span>` : '<span class="libre">Libre</span>'}
      ${acciones}
    </div>`;
  }).join('');
  el.innerHTML = `
    <div class="tarjeta">
      <div class="logo" style="font-size:28px">Sala<small>${modo} · a ${v.config.objetivo}${v.config.jugadores >= 6 && v.config.picaPica ? ' · con pica-pica' : ''}</small></div>
      <div class="codigo">${v.codigo}</div>
      <div class="campo">
        <label>Invitá con este enlace</label>
        <div class="enlace"><input type="text" readonly value="${enlace}"><button class="btn" data-copiar>Copiar</button></div>
      </div>
      <div class="equipos">
        ${([0, 1] as const).map((eq) => `<div class="equipo e${eq}"><h3><span style="color:${COLOR_EQUIPO[eq]}">●</span> Equipo ${NOMBRE_EQUIPO[eq]}</h3>${columna(eq)}</div>`).join('')}
      </div>
      <div class="fila">
        ${v.esHost ? '<button class="btn grande" data-iniciar>¡A jugar!</button>' : ''}
        <button class="btn grande secundario" data-salir>Salir</button>
      </div>
      <div class="nota">${v.esHost ? 'Los asientos libres se completan con bots al empezar.' : 'Esperando a que quien creó la sala empiece la partida…'}</div>
    </div>`;
  el.querySelector<HTMLButtonElement>('[data-copiar]')!.onclick = (ev) => {
    navigator.clipboard?.writeText(enlace);
    (ev.target as HTMLButtonElement).textContent = '¡Copiado!';
  };
  el.querySelectorAll<HTMLButtonElement>('[data-sentar]').forEach((b) => (b.onclick = () => o.alSentarse(Number(b.dataset.sentar))));
  el.querySelectorAll<HTMLButtonElement>('[data-bot]').forEach((b) => (b.onclick = () => o.alBot(Number(b.dataset.bot), true)));
  el.querySelectorAll<HTMLButtonElement>('[data-sacar]').forEach((b) => (b.onclick = () => o.alBot(Number(b.dataset.sacar), false)));
  el.querySelector<HTMLButtonElement>('[data-iniciar]')?.addEventListener('click', o.alIniciar);
  el.querySelector<HTMLButtonElement>('[data-salir]')!.onclick = o.alSalir;
}

export function pantallaFin(el: HTMLElement, v: Vista, o: { alRevancha: () => void; alSalir: () => void }) {
  const g = v.ganador ?? 0;
  const nos = v.yo % 2 === g;
  el.innerHTML = `
    <div class="tarjeta" style="text-align:center">
      <div class="logo" style="font-size:26px">${nos ? '¡Ganamos!' : 'Perdimos…'}</div>
      <div class="ganador e${g}">Equipo ${NOMBRE_EQUIPO[g]}</div>
      <div style="font-size:22px;font-weight:800;margin:8px 0 4px">${v.puntos[0]} a ${v.puntos[1]}</div>
      <div class="nota">${nos ? 'Se sirven unos mates para festejar.' : 'La revancha se juega ya mismo.'}</div>
      <div class="fila">
        ${v.esHost ? '<button class="btn grande" data-revancha>Revancha</button>' : ''}
        <button class="btn grande secundario" data-salir>Salir</button>
      </div>
      ${v.esHost ? '' : '<div class="nota">Quien creó la sala puede pedir la revancha.</div>'}
    </div>`;
  el.querySelector<HTMLButtonElement>('[data-revancha]')?.addEventListener('click', o.alRevancha);
  el.querySelector<HTMLButtonElement>('[data-salir]')!.onclick = o.alSalir;
}
