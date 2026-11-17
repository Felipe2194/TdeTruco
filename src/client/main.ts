/* Controlador de la aplicación: inicio → lobby → mesa → fin. */
import './estilos.css';
import type { Config } from '../engine/juego';
import { Conexion, ErrorApi, guardarSesion, post, sesionGuardada, type Sesion, type Vista } from './api';
import { Hud } from './hud';
import { Mesa } from './mesa';
import { pantallaFin, pantallaInicio, pantallaLobby } from './pantallas';

const app = document.getElementById('app')!;
const mesa = new Mesa(app);
const hud = new Hud(app, {
  accion: (tipo) => enviar('accion', { tipo }),
  decir: (que) => enviar('decir', { que }),
  sena: (clave) => {
    enviar('sena', { clave });
    mesa.decir(vista?.yo ?? 0, '🤫 Seña hecha', 1000);
  },
});
const cartel = document.createElement('div');
cartel.id = 'cartel';
document.body.appendChild(cartel);
const pantalla = document.createElement('div');
pantalla.className = 'pantalla';
document.body.appendChild(pantalla);

let conexion: Conexion | null = null;
let vista: Vista | null = null;
let primeraVista = true;
let firmaPantalla = '';

mesa.alJugar = (carta) => enviar('accion', { tipo: 'jugar', carta });
mesa.alCartel = (texto, equipo) => {
  cartel.textContent = texto;
  cartel.className = `visible${equipo === undefined ? '' : ' e' + equipo}`;
  clearTimeout(Number(cartel.dataset.t));
  cartel.dataset.t = String(setTimeout(() => (cartel.className = ''), 1900));
};

async function enviar(op: string, datos: Record<string, unknown> = {}) {
  if (!conexion) return;
  try {
    await conexion.enviar(op, datos);
  } catch (e) {
    mesa.alCartel(e instanceof ErrorApi ? e.message : 'Sin conexión');
  }
}

function mostrarPantalla(si: boolean) {
  pantalla.style.display = si ? '' : 'none';
}

function inicio(error?: string) {
  conexion?.detener();
  conexion = null;
  vista = null;
  firmaPantalla = '';
  hud.mostrar(false);
  mostrarPantalla(true);
  const codigo = new URLSearchParams(location.search).get('sala') ?? undefined;
  pantallaInicio(pantalla, {
    codigo,
    error,
    alCrear: async (nombre: string, config: Config, conBots: boolean) => {
      try {
        const r = await post({ op: 'crear', nombre, config, conBots });
        conectar({ codigo: r.vista.codigo, token: r.token! });
      } catch (e) {
        inicio((e as Error).message);
      }
    },
    alUnirse: async (nombre, cod) => {
      try {
        const r = await post({ op: 'unirse', nombre, codigo: cod });
        conectar({ codigo: r.vista.codigo, token: r.token! });
      } catch (e) {
        inicio((e as Error).message);
      }
    },
  });
}

function salir() {
  guardarSesion(null);
  history.replaceState(null, '', location.pathname);
  inicio();
}

function conectar(s: Sesion) {
  guardarSesion(s);
  history.replaceState(null, '', `?sala=${s.codigo}`);
  primeraVista = true;
  conexion?.detener();
  conexion = new Conexion(s, alActualizar, (e) => {
    if (e instanceof ErrorApi && /no existe|venció|no estás/i.test(e.message)) {
      guardarSesion(null);
      inicio(e.message);
    }
  });
  conexion.iniciar();
}

function alActualizar(v: Vista) {
  if (v.yo < 0) {
    guardarSesion(null);
    inicio('No tenés lugar en esa sala');
    return;
  }
  vista = v;
  (window as unknown as { __truco: unknown }).__truco = { vista: v }; // para pruebas automáticas
  if (v.fase === 'lobby') {
    hud.mostrar(false);
    mostrarPantalla(true);
    const firma = `lobby|${v.version}`;
    if (firma !== firmaPantalla) {
      firmaPantalla = firma;
      pantallaLobby(pantalla, v, {
        alSentarse: (asiento) => enviar('sentarse', { asiento }),
        alBot: (asiento, bot) => enviar('bot', { asiento, bot }),
        alIniciar: () => enviar('iniciar'),
        alSalir: salir,
      });
    }
    mesa.procesarEventos(v, true);
    return;
  }
  hud.mostrar(true);
  hud.actualizar(v);
  mesa.actualizar(v);
  mesa.procesarEventos(v, primeraVista);
  primeraVista = false;
  if (v.fase === 'fin') {
    const firma = `fin|${v.numeroMano}|${v.esHost}`;
    if (firma !== firmaPantalla) {
      firmaPantalla = firma;
      setTimeout(() => {
        if (vista?.fase !== 'fin') return;
        mostrarPantalla(true);
        pantallaFin(pantalla, v, { alRevancha: () => enviar('revancha'), alSalir: salir });
      }, 2500);
    }
  } else {
    firmaPantalla = '';
    mostrarPantalla(false);
  }
}

// Arranque: reconectar a la sala guardada si coincide con el enlace (o si no hay enlace).
const enlace = new URLSearchParams(location.search).get('sala')?.toUpperCase();
const guardada = sesionGuardada();
if (guardada && (!enlace || enlace === guardada.codigo)) conectar(guardada);
else inicio();
