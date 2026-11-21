/* Personajes de la mesa, colores de equipo y señas. El dibujo está en pixel.ts. */
import { PERSONAJES, personajeSVG } from './pixel';

/** Colores de los equipos (estética CRT). */
export const COLOR_EQUIPO: [string, string] = ['#5ab0ff', '#ff4d5e'];
export const NOMBRE_EQUIPO = ['Celeste', 'Colorado'] as const;

/** Personaje para un asiento, con la camiseta a rayas de su equipo. */
export function avatarSVG(asiento: number, colorEquipo: string): string {
  return personajeSVG(PERSONAJES[asiento % PERSONAJES.length], colorEquipo);
}

export const SENAS = [
  { k: 'anchoEspada', nombre: 'Ancho de espada', gesto: 'Levantar las cejas' },
  { k: 'anchoBasto', nombre: 'Ancho de basto', gesto: 'Guiñar un ojo' },
  { k: 'sieteEspada', nombre: '7 de espada', gesto: 'Boca torcida a la derecha' },
  { k: 'sieteOro', nombre: '7 de oro', gesto: 'Boca torcida a la izquierda' },
  { k: 'tres', nombre: 'Un 3', gesto: 'Morder el labio' },
  { k: 'dos', nombre: 'Un 2', gesto: 'Trompita' },
  { k: 'anchoFalso', nombre: 'Ancho falso', gesto: 'Abrir la boca' },
  { k: 'envido', nombre: 'Tengo envido', gesto: 'Inclinar la cabeza' },
  { k: 'nada', nombre: 'Nada', gesto: 'Cerrar los ojos' },
] as const;
