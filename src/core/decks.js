import { deck } from './random.js';
import { HUKUMAN } from '../data/hukuman.js';
import { TANTANGAN } from '../data/tantangan.js';
import { JUJUR } from '../data/jujur.js';
import { SIAPA } from '../data/siapa.js';
import { KATEGORI } from '../data/kategori.js';
import { CEPAT } from '../data/cepat.js';
import { TABOO } from '../data/taboo.js';
import { UNDERCOVER } from '../data/undercover.js';

export const drawHukuman = Object.fromEntries(Object.entries(HUKUMAN).map(([k, list]) => [k, deck(list)]));
export const drawTantangan = deck(TANTANGAN);
export const drawJujur = deck(JUJUR);
export const drawSiapa = deck(SIAPA);
export const drawKategori = deck(KATEGORI);
export const drawCepat = deck(CEPAT);
export const drawTaboo = deck(TABOO);
export const drawUndercover = deck(UNDERCOVER);
export const drawBuzzerKategori = deck(KATEGORI);
