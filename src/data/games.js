import { gameBom } from '../games/bom-waktu.js';
import { gameTod } from '../games/jujur-atau-berani.js';
import { gameTebak } from '../games/tebak-gaya.js';
import { gameSiapa } from '../games/siapa-paling.js';
import { gameDadu } from '../games/dadu-nasib.js';
import { gameTekan } from '../games/tekan-duluan.js';
import { gameRoda } from '../games/roda-hukuman.js';
import { gameRoulette } from '../games/roulette-jari.js';
import { gameCepat } from '../games/jawab-cepat.js';
import { gameTaboo } from '../games/kata-terlarang.js';
import { gameBuzzer } from '../games/adu-bel.js';
import { gameUndercover } from '../games/cari-penyusup.js';
import { gameCodenames } from '../games/kode-rahasia.js';
import { gameColorHunt } from '../games/color-hunt.js';
import { gameStopTimer } from '../games/stop-timer.js';

export const GAMES = [
  {name:'Bom Waktu', how:'Jawab sesuai kategori, oper HP ke kanan. Bom meledak di tangan siapa, dia yang kena.', loud:true, tags:['cepat'], solo:true, run:gameBom},
  {name:'Tekan Duluan', how:'HP di tengah, semua jari siap. Curi start atau paling lambat langsung kena.', loud:true, tags:['cepat'], solo:true, run:gameTekan},
  {name:'Tebak Gaya', how:'HP di jidat, teman kasih kode pakai gaya. Bisa per orang atau per tim, durasi bebas.', loud:true, tags:['tantangan'], solo:true, team:true, run:gameTebak},
  {name:'Siapa Paling...?', how:'Hitungan ketiga semua nunjuk orang. Yang paling banyak ditunjuk, kena.', loud:true, tags:[], solo:true, min:3, run:gameSiapa},
  {name:'Jujur atau Berani', how:'Pertanyaan jujur atau tantangan berani. Nolak berarti hukuman.', loud:false, tags:['tantangan'], solo:true, run:gameTod},
  {name:'Dadu Nasib', how:'Kocok dadu, angkanya nentuin nasib: aman, tantangan, atau seret orang lain.', loud:false, tags:['tantangan'], solo:true, run:gameDadu},
  {name:'Roda Hukuman', how:'Main game lain? Pakai ini buat ngacak hukuman yang kalah.', loud:false, tags:[], solo:true, run:gameRoda},
  {name:'Roulette Jari', how:'Semua tempel satu jari. Detak makin cepat, satu jari kena hukuman.', loud:true, tags:['cepat'], solo:true, run:gameRoulette},
  {name:'Jawab Cepat', how:'Sebutkan 3 hal sesuai prompt dalam 5 detik. Gagal, kena hukuman.', loud:true, tags:['cepat'], solo:true, run:gameCepat},
  {name:'Kata Terlarang', how:'Jelaskan kata rahasia tanpa menyebut 3 kata terlarang. 30 detik.', loud:true, tags:['tantangan'], solo:true, run:gameTaboo},
  {name:'Cari Penyusup', how:'Satu pemain dapat kata berbeda. Debat, lalu voting siapa penyusupnya.', loud:true, tags:['tantangan'], team:true, min:3, run:gameUndercover},
  {name:'Cari Benda', how:'Cari benda sesuai warna, huruf, atau dua huruf. Mode warna bisa scan kamera, 3 ronde.', loud:true, tags:['tantangan'], solo:true, run:gameColorHunt},
  {name:'Adu Bel', how:'Teka-teki cepat. Mode Team atau Solo, yang cepat menekan bel punya 6 detik untuk menjawab.', loud:true, tags:['cepat'], solo:true, team:true, run:gameBuzzer},
  {name:'Stop the Timer', how:'Stop timer tanpa melihat angka. Target acak sama untuk semua pemain, 3 ronde, ronde akhir desimal.', loud:false, tags:['cepat'], solo:true, run:gameStopTimer},
  {name:'Kode Rahasia', how:'Beri 1 petunjuk untuk 3 kata tim. Hindari bom tengkorak.', loud:false, tags:['tantangan'], team:true, min:4, run:gameCodenames},
];

export const FILTERS = {semua:'Semua', solo:'Solo', team:'Team'};
export const TAG_LABELS = {cepat:'Adu cepat', tantangan:'Ada tantangan'};
