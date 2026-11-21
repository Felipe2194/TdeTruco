/*
 * Rivales del modo 1v1 contra bots: quiénes son y cómo juegan.
 * El dibujo de cada uno está en src/client/arte/rivales.ts (mismo `id`).
 *
 * `juego` es la personalidad del bot, de 0 a 1:
 *   truco   → cuánto canta y sube el truco
 *   envido  → cuánto canta y quiere el envido
 *   mentira → cuánto canta sin tener cartas (y cuánto quiere de pura pinta)
 */
export interface Perfil {
  truco: number;
  envido: number;
  mentira: number;
}

export interface DatosRival {
  id: string;
  nombre: string;
  apodo: string;
  /** Lo que dice al sentarse a la mesa. */
  frase: string;
  estilo: string;
  juego: Perfil;
  frases: { gana: string; pierde: string };
}

export const DATOS_RIVALES: DatosRival[] = [
  {
    id: 'cobrador', nombre: 'El Cobrador', apodo: 'el de las deudas', frase: 'Cada truco se paga, pibe.',
    estilo: 'Canta truco seguido y sube al retruco cuando huele miedo.',
    juego: { truco: 0.85, envido: 0.4, mentira: 0.35 },
    frases: { gana: 'Anotá la deuda.', pierde: 'Esto no queda así. Te voy a cobrar.' },
  },
  {
    id: 'humo', nombre: 'Doña Humo', apodo: 'la del fogón', frase: 'Yo espero, m\'hijo. El humo siempre sube.',
    estilo: 'Paciente: juega callada, casi nunca miente y castiga en el envido.',
    juego: { truco: 0.3, envido: 0.75, mentira: 0.1 },
    frases: { gana: 'Te dije que había que esperar.', pierde: 'Bien jugado, m\'hijo. Cebate un mate.' },
  },
  {
    id: 'sapo', nombre: 'Sapardo', apodo: 'delegado del charco', frase: '¡Envido! ...¿Qué? Siempre canto envido.',
    estilo: 'Canta envido con cualquier cosa. Si no tiene, se va al mazo rápido.',
    juego: { truco: 0.45, envido: 0.95, mentira: 0.5 },
    frases: { gana: '¡Croac! ¡Paro general de festejo!', pierde: 'Esto lo llevo a la asamblea.' },
  },
  {
    id: 'robot', nombre: 'Robo-Gaucho M-80', apodo: 'modelo de exportación', frase: 'PROBABILIDAD DE GANAR: 73,2 %.',
    estilo: 'Calcula todo: nunca miente, quiere solo cuando le dan los números.',
    juego: { truco: 0.5, envido: 0.5, mentira: 0 },
    frases: { gana: 'RESULTADO ESPERADO. APAGANDO.', pierde: 'ERROR 404: VICTORIA NO ENCONTRADA.' },
  },
  {
    id: 'tarotista', nombre: 'La Tarotista', apodo: 've tus cartas', frase: 'Ya sé lo que tenés. ¿Querés que te lo diga?',
    estilo: 'Mentirosa: canta truco sin nada y te hace dudar con el tercer ojo.',
    juego: { truco: 0.75, envido: 0.55, mentira: 0.8 },
    frases: { gana: 'Estaba escrito en las cartas.', pierde: 'Las cartas mintieron... por esta vez.' },
  },
  {
    id: 'calavera', nombre: 'El Tano Calavera', apodo: 'murió jugando', frase: 'Me morí en un retruco. Volví por la revancha.',
    estilo: 'Canchero: va siempre al retruco y al vale cuatro, aunque sea de pura pinta.',
    juego: { truco: 0.9, envido: 0.35, mentira: 0.55 },
    frases: { gana: '¡Eso es tener muerto el partido!', pierde: 'Bah. Total, ya estoy muerto.' },
  },
  {
    id: 'antena', nombre: 'El Pibe Antena', apodo: 'creció al lado de la planta', frase: 'Me llegan señales... del más allá. Truco.',
    estilo: 'Impredecible: a veces canta todo, a veces nada. Nadie sabe qué tiene.',
    juego: { truco: 0.6, envido: 0.6, mentira: 0.6 },
    frases: { gana: 'Las antenas nunca fallan.', pierde: 'Interferencia... había interferencia.' },
  },
  {
    id: 'caudillo', nombre: 'El Caudillo Pálido', apodo: 'el jefe final', frase: 'En esta mesa mando yo.',
    estilo: 'El más difícil: juega fuerte, te corre con la falta y casi no se equivoca.',
    juego: { truco: 0.7, envido: 0.7, mentira: 0.3 },
    frases: { gana: 'Como debía ser.', pierde: 'Exijo una revancha. Ahora.' },
  },
];

export const datosRival = (id: string | undefined) => DATOS_RIVALES.find((r) => r.id === id);
