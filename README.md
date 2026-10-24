# Mabar

**16 game pesta untuk 2–6 orang di satu HP.**

A 16-game party app for 2–6 players on one phone.

Live: **https://www.ivanjairus.xyz/mabar/**

## Isi

- 16 game: Bom Waktu, Tekan Duluan, Tebak Gaya, Siapa Paling...?, Jujur atau Berani, Dadu Nasib, Roda Hukuman, Roulette Jari, Jawab Cepat, Kata Terlarang, Cari Penyusup, Cari Benda, Flip My Voice, Adu Bel, Stop the Timer, dan Kode Rahasia.
- 1.451 kartu bank utama, plus 32 kartu warna dan prompt dinamis untuk Cari Benda.
- Filter Solo dan Team. Beberapa game punya mode lokal, tim, atau free-for-all.
- Hukuman per game, bukan satu dek global, supaya tempo tiap game tetap pas.
- Cari Benda memakai scan kamera untuk ronde warna. Frame diproses di browser, tidak diunggah.
- Tanpa akun dan tanpa backend. Daftar pemain serta hitungan hukuman disimpan di `localStorage` dengan key `mainrame`.

## Menjalankan

```bash
npm install
npm run dev
```

Buka URL yang dicetak Vite, biasanya `http://localhost:5173/mabar/`.

Build produksi:

```bash
npm run build
npm run preview
```

Hasil build ada di `dist/mabar/`. Preview biasanya berjalan di `http://localhost:4173/mabar/`.

Kamera hanya bisa dipakai di secure context: HTTPS atau localhost. Kalau dibuka lewat `http://IP-LAN`, scan akan menampilkan pesan error.

## Struktur

```text
src/core/      state, UI, audio, suara, timer, deck, hukuman, tim, warna
src/data/      bank kartu, palet warna, dan katalog game
src/games/     satu file per game
src/main.js    home, pemain, filter, toast
src/styles.css seluruh CSS
public/        favicon dan ikon
```

## Menambah game

1. Buat modul di `src/games/`, lalu ekspor fungsi `game...`.
2. Daftarkan nama, deskripsi, filter, dan fungsi `run` di `src/data/games.js`.
3. Taruh data baru di `src/data/`, bukan di dalam komponen game.
4. Jalankan `npm run build` dan uji alurnya di browser, termasuk layout HP.

## Kamera dan privasi

Scan warna mengambil satu frame dari kamera, memotong area tengah, lalu menghitung rata-rata RGB dan jarak warna di ruang Lab. Semua proses terjadi di browser. Tidak ada frame yang dikirim ke server.

Kalau kamera tidak didukung, izin ditolak, atau halaman bukan HTTPS, game menampilkan pesan error dan hakim bisa menilai manual.

## Suara dan privasi

Flip My Voice punya tiga mode:

- **Tebak Kata**: aplikasi memutar kata dari bank audio yang sudah dibalik dan diberi efek. Semua pemain menebak kata aslinya. Suara sama di semua perangkat dan tanpa mikrofon.
- **Flip Chain**: pemain pertama merekam kata, audionya dibalik dan diberi efek, pemain berikutnya meniru suara itu, lalu audionya dibalik kembali dan hakim menilai.
- **Tebak Siapa**: semua pemain merekam satu kalimat dengan suara lucu, lalu tiap pemain menebak satu suara milik siapa.

Efek suara acak di setiap ronde: **chipmunk**, **monster**, dan **vibrato**. Flip Chain dan Tebak Siapa memakai mikrofon. Rekaman hanya diproses di browser dan tidak diunggah. Mikrofon butuh HTTPS dan izin; kalau browser tidak mendukung, game menampilkan pesan error dan kembali ke mode lain.

Bank audio Tebak Kata ada di `public/voice/words/`. File dibuat dengan eSpeak NG 1.52.0 voice Indonesia. eSpeak NG berlisensi GPLv3; file MP3 di folder itu adalah output audio yang dipakai sebagai data game. Detail ada di `public/voice/words/NOTICE.txt`.

## Deploy

Mabar dilayani sebagai aplikasi Vite dengan base `/mabar/` dan output `dist/mabar/`. Project Vercel `ij-mabar` melayani `/mabar/`, lalu gateway `ivanjairus.xyz` meneruskan `/mabar/` ke project tersebut.

- `vercel.json`: build `npm run build`, output `dist`
- `vite.config.js`: base `/mabar/`, outDir `dist/mabar`

## Lisensi

MIT. Kode, kartu, copy, dan aset di repositori ini boleh dipakai, diubah, dan didistribusikan kembali dengan mencantumkan notis lisensi. Lihat [LICENSE](LICENSE).

Font: Bricolage Grotesque, SIL Open Font License 1.1, dimuat lewat Google Fonts.
