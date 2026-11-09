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
import { gameFlipVoice } from '../games/flip-voice.js';
import { gameSambung } from '../games/sambung-kata.js';
import { gameHitung } from '../games/hitung-bareng.js';
import { gameGambar } from '../games/gambar-buta.js';

export const GAMES = [
  {name:'Bom Waktu', how:'Jawab sesuai kategori, langsung oper HP ke kanan. Yang lagi pegang pas bom meledak, dia yang kena.', loud:true, tags:['cepat'], solo:true, run:gameBom},
  {name:'Tekan Duluan', how:'HP di tengah meja, semua jari siap di kotaknya. Curi start atau paling lambat langsung kena.', loud:true, tags:['cepat'], solo:true, run:gameTekan},
  {name:'Tebak Gaya', how:'HP di jidat menghadap teman, yang lain kasih kode pakai gerakan. Bisa Solo atau Team, durasi bebas.', loud:true, tags:['tantangan'], solo:true, team:true, run:gameTebak},
  {name:'Siapa Paling...?', how:'Hitungan ketiga semua serentak nunjuk satu orang. Suara terbanyak langsung kena.', loud:true, tags:[], solo:true, min:3, run:gameSiapa},
  {name:'Jujur atau Berani', how:'Pilih spill jujur atau jalanin dare. Nolak atau skip? Langsung masuk hukuman.', loud:false, tags:['tantangan'], solo:true, run:gameTod},
  {name:'Dadu Nasib', how:'Kocok dadu, angkanya nentuin nasibmu: lolos, kena dare, atau nyeret teman sebelah.', loud:false, tags:['tantangan'], solo:true, run:gameDadu},
  {name:'Roda Hukuman', how:'Habis taruhan atau main game luar? Putar ini buat ngacak hukuman yang kalah.', loud:false, tags:[], solo:true, run:gameRoda},
  {name:'Roulette Jari', how:'Tiap orang tempel satu jari di layar, urutan bebas. Roulette merah muter dan berhenti di satu jari yang kena.', loud:true, tags:['cepat'], solo:true, run:gameRoulette},
  {name:'Jawab Cepat', how:'Sebut 3 hal sesuai prompt dalam 5 detik. Nge-blank atau jawaban ngawur? Kena hukuman.', loud:true, tags:['cepat'], solo:true, run:gameCepat},
  {name:'Kata Terlarang', how:'Jelaskan kata utama dalam 30 detik tanpa keceplosan 3 kata terlarang di bawahnya.', loud:true, tags:['tantangan'], solo:true, run:gameTaboo},
  {name:'Cari Penyusup', how:'Satu orang dapat kata yang beda tipis tanpa sadar. Kasih clue satu-satu, debat, lalu vote siapa penyusupnya.', loud:true, tags:['tantangan'], team:true, min:3, run:gameUndercover},
  {name:'Cari Benda', how:'Adu cepat cari barang di sekitar selama 5 ronde: ronde warna discan kamera, ronde kata diadu siapa cepat.', loud:true, tags:['tantangan'], solo:true, run:gameColorHunt},
  {name:'Flip My Voice', how:'Suara dibalik plus efek random. Tebak kata aslinya, tiru suara terbalik, atau tebak suara siapa.', loud:true, tags:['tantangan'], solo:true, run:gameFlipVoice},
  {name:'Adu Bel', how:'Rebutan bel di tengah meja, yang pencet duluan punya 6 detik buat jawab. Bisa Team atau Solo.', loud:true, tags:['cepat'], solo:true, team:true, run:gameBuzzer},
  {name:'Stop the Timer', how:'Hentikan timer tepat di angka target tanpa lihat detiknya jalan. 3 ronde, ronde terakhir pakai desimal.', loud:false, tags:['cepat'], solo:true, run:gameStopTimer},
  {name:'Kode Rahasia', how:'Main 2 tim. Ketua tim kasih 1 kata clue buat nebak 3 kartu timnya. Salah buka bom = langsung kalah.', loud:false, tags:['tantangan'], team:true, min:4, run:gameCodenames},
  {name:'Sambung Kata', how:'Sambung kata dari huruf terakhir sesuai kategori. Makin lama waktunya makin sempit, dilarang ngulang kata.', loud:true, tags:['cepat'], solo:true, run:gameSambung},
  {name:'Hitung Bareng', how:'Hitung 1, 2, 3 gantian, tapi angka tertentu wajib diganti kata aturan. Makin tinggi angkanya, makin banyak aturannya.', loud:true, tags:['cepat'], solo:true, run:gameHitung},
  {name:'Gambar Buta', how:'Gambar kata rahasia di kanvas kosong (goresan disembunyikan). Pas waktu habis, gambarnya muncul dan semua nebak.', loud:true, tags:['tantangan'], solo:true, run:gameGambar},
];

export const FILTERS = {semua:'Semua', solo:'Solo', team:'Team'};
export const TAG_LABELS = {cepat:'Adu cepat', tantangan:'Ada tantangan'};
