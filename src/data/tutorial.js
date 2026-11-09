// Kunci = nama game di games.js. win = cara aman/menang, lose = siapa yang kena hukuman. demo = animasi mini (opsional).
export const BASICS = [
  {t:'Squad up', d:'Masukin 2–6 nama pemain, urut sesuai posisi duduk searah jarum jam.'},
  {t:'Pilih game', d:'Satu HP dipakai bareng—kadang dioper keliling, kadang ditaruh di tengah meja.'},
  {t:'Terima nasib', d:'Yang kalah langsung dapat hukuman acak. Rekor kena hukuman tercatat di klasemen beranda.'}
];

export const TUTORIAL = {
  'Bom Waktu': {
    steps:[
      'Cek kategori yang muncul, lalu tap Nyalain bom.',
      'Sebut 1 jawaban yang masuk kategori, langsung tap OPER dan kasih HP ke pemain di kananmu.',
      'Dilarang nyebut jawaban yang udah dipakai pemain sebelumnya. Timer bomnya acak!'
    ],
    win:'Pastikan HP udah pindah tangan sebelum bomnya meledak.',
    lose:'Siapa pun yang lagi megang HP pas bom meledak.'
  },
  'Tekan Duluan': {
    demo:'tekan',
    steps:[
      'Taruh HP di tengah meja. Tiap pemain jaga 1 kotak namanya sendiri.',
      'Waktu kotak masih hitam (TAHAN), jangan disentuh sama sekali.',
      'Begitu layar berubah merah (TEKAN!), tap kotakmu secepat mungkin.'
    ],
    win:'Tap lebih cepat dari yang lain setelah layar berubah merah.',
    lose:'Yang kepencet sebelum merah (curi start), atau yang paling lambat.'
  },
  'Tebak Gaya': {
    steps:[
      'Atur mode (Solo atau Team), durasi, dan pilih kategori kata.',
      'Penebak tempel HP di jidat (layar menghadap teman). Teman kasih petunjuk pakai gerakan tanpa nyebut katanya.',
      'Tap sisi kanan layar kalau tebakan benar, atau tap sisi kiri buat skip.'
    ],
    win:'Kumpulin tebakan benar terbanyak sebelum waktu habis.',
    lose:'Pemain atau tim dengan skor paling rendah di akhir putaran.'
  },
  'Siapa Paling...?': {
    steps:[
      'Satu orang bacain kartu pertanyaan "Siapa di sini yang paling..." keras-keras.',
      'Tap Mulai hitung—layar bakal hitung mundur 3, 2, 1.',
      'Pas hitungan habis, semua orang wajib langsung nunjuk 1 teman (nggak boleh nunjuk diri sendiri).'
    ],
    win:'Nggak jadi orang yang paling banyak ditunjuk.',
    lose:'Pemain yang dapat tunjukan paling banyak (kalau seri, kena bareng).'
  },
  'Jujur atau Berani': {
    steps:[
      'Layar bakal nunjukin giliran siapa yang main.',
      'Pilih Jujur (jawab pertanyaan blak-blakan) atau Berani (lakuin tantangan langsung).',
      'Kalau udah kelar, tap Selesai. Kalau nolak atau nggak sanggup, tap Nolak.'
    ],
    win:'Jawab jujur atau selesaikan tantangan sesuai kartu.',
    lose:'Pemain yang pilih Nolak / nggak berani jalanin kartunya.'
  },
  'Dadu Nasib': {
    steps:[
      'Pemain yang dapat giliran tap Kocok dadu.',
      'Angka 1 = Aman. Angka 2 = Tantangan buatmu. Angka 3 = Hukuman buatmu.',
      'Angka 4 = Bebas tunjuk 1 tumbal. Angka 5 = Kamu & teman kananmu kena. Angka 6 = Kamu aman, sisanya kena semua!'
    ],
    win:'Dapat angka 1, 4, atau 6.',
    lose:'Tergantung angka dadu yang keluar.'
  },
  'Roda Hukuman': {
    steps:[
      'Dipakai kalau kalian lagi main game luar, suit, atau taruhan kecil.',
      'Begitu ada yang kalah, buka halaman ini.',
      'Tap Ganti hukuman buat ngacak ulang, atau jalankan hukuman yang berhenti di layar.'
    ],
    win:'Ini murni alat pengacak hukuman, nggak ada skor menang-kalah.',
    lose:'Siapa pun yang kalah di kesepakatan kalian.'
  },
  'Roulette Jari': {
    demo:'roulette',
    steps:[
      'Taruh HP di tengah meja.',
      'Tiap pemain tempel dan tahan 1 jari di layar (urutan bebas, nggak perlu sesuai nama).',
      'Setelah semua jari nempel, lampu merah bakal muter dan melambat sampai berhenti di 1 jari.'
    ],
    win:'Roulette merah nggak berhenti di jarimu, dan jarimu nggak lepas duluan.',
    lose:'Pemilik jari tempat lampu merah berhenti, atau yang ngangkat jari sebelum putaran selesai.'
  },
  'Jawab Cepat': {
    steps:[
      'Lihat giliran siapa, lalu tap Mulai untuk membuka pertanyaan.',
      'Dalam 5 detik, sebutkan 3 hal sesuai kartu yang muncul.',
      'Pemain lain jadi juri: tap Benar kalau masuk akal, atau Gagal kalau nge-blank/ngawur.'
    ],
    win:'Sebut 3 jawaban valid sebelum 5 detik habis.',
    lose:'Waktu habis atau jawabanmu ditolak teman-teman.'
  },
  'Kata Terlarang': {
    steps:[
      'Pegang HP menghadap dirimu sendiri, jangan sampai pemain lain lihat layar.',
      'Jelaskan Kata Rahasia di bagian atas dalam 30 detik supaya teman-temanmu bisa menebaknya.',
      'Pantangan: dilarang keras mengucapkan 3 Kata Terlarang yang tertulis di bawahnya!'
    ],
    win:'Ada teman yang berhasil nebak kata rahasiamu dengan benar dalam 30 detik.',
    lose:'Waktu habis belum ketebak, atau kamu keceplosan sebut kata terlarang.'
  },
  'Cari Penyusup': {
    steps:[
      'Oper HP keliling: tiap orang buka kata rahasianya sendiri-sendiri lalu tutup lagi.',
      'Mayoritas (Warga) dapat kata yang sama, tapi 1 orang (Penyusup) dapat kata yang mirip tanpa dia sadari.',
      'Sebut 1 kalimat petunjuk secara bergiliran, debat siapa yang mencurigakan, lalu tap nama orangnya saat voting.'
    ],
    win:'Warga menang kalau berhasil vote Penyusup. Penyusup menang kalau warga salah tangkap.',
    lose:'Penyusup kalau ketahuan; atau semua Warga kalau salah tuduh orang!'
  },
  'Cari Benda': {
    steps:[
      'Main 5 ronde: 2 ronde warna, 2 ronde kata, dan 1 ronde gabungan.',
      'Begitu prompt muncul, cari barang nyata di sekitar kalian lalu balik ke meja dan tap namamu.',
      'Ronde warna dinilai langsung pakai scan kamera HP (mana yang warnanya paling mirip); ronde kata dinilai hakim.'
    ],
    win:'Kumpulin poin tertinggi dari total 5 ronde.',
    lose:'Pemain dengan poin paling rendah di akhir ronde ke-5.'
  },
  'Flip My Voice': {
    steps:[
      'Pilih 1 dari 3 mode: Tebak Kata (tanpa mic), Flip Chain (sambung rekaman terbalik), atau Tebak Siapa.',
      'Aplikasi memutar audio yang sudah dibalik (reverse) dan ditambah efek suara.',
      'Tebak kata aslinya, tirukan bunyi terbaliknya supaya pas dibalik lagi jadi benar, atau tebak pemilik suaranya.'
    ],
    win:'Poin tertinggi setelah semua ronde selesai.',
    lose:'Pemain dengan poin paling kecil di akhir permainan.'
  },
  'Adu Bel': {
    steps:[
      'Pilih mode Team (2 tim) atau Solo, lalu taruh HP di tengah meja.',
      'Begitu soal "Sebutkan 3..." muncul, cepat-cepatan tap tombol belmu.',
      'Yang mencet duluan punya 6 detik buat jawab; kalau salah, poin pindah ke lawan (Team) atau bisa dicuri (Solo).'
    ],
    win:'Tim atau pemain pertama yang mencapai target 5 poin.',
    lose:'Tim yang kalah, atau pemilik poin terendah di mode Solo.'
  },
  'Stop the Timer': {
    steps:[
      'Setiap ronde punya angka detik target (misal 4 detik). Semua pemain dapat target yang sama.',
      'Tap Mulai—timer berjalan tanpa menampilkan angka di layar. Tap Stop waktu menurut feeling-mu sudah pas.',
      'Main 3 ronde (ronde ke-3 pakai angka desimal). Selisih meleset tiap ronde dijumlahkan.'
    ],
    win:'Total selisih meleset (error) paling kecil dari 3 ronde.',
    lose:'Pemain dengan total selisih meleset paling besar.'
  },
  'Kode Rahasia': {
    demo:'kode',
    steps:[
      'Butuh minimal 4 orang (2 Tim). Tiap tim punya 1 pemberi clue (Spymaster) yang boleh mengintip warna kartu.',
      'Spymaster hanya boleh kasih 1 kata petunjuk supaya timnya bisa menebak 3 kartu milik mereka dari 9 kata di layar.',
      'Tim berdiskusi lalu tap 1 kata: kalau kartu sendiri boleh lanjut, kalau kartu netral/lawan ganti giliran, kalau kena X (Bom) langsung kalah.'
    ],
    win:'Tim pertama yang berhasil membuka 3 kartu warna timnya.',
    lose:'Tim yang kalah cepat, atau tim yang nggak sengaja membuka kartu Bom (X).'
  },
  'Sambung Kata': {
    steps:[
      'Lihat kategori ronde ini. Pemain pertama mengetik 1 kata yang sesuai.',
      'Pemain berikutnya wajib mengetik kata baru yang diawali huruf terakhir dari kata sebelumnya.',
      'Makin panjang rantai katanya, timer makin singkat (10 detik turun sampai 4 detik). Kalau kata teman ngawur, tap Gugat kata tadi!'
    ],
    win:'Tetap bertahan nyambung kata sampai ada pemain lain yang buntu.',
    lose:'Yang kehabisan waktu, nyerah, atau katanya digugat dan disepakati nggak masuk kategori.'
  },
  'Hitung Bareng': {
    steps:[
      'Cek kartu aturan di layar (misal: Kelipatan 3 → sebut "Valid", Ada angka 7 → sebut "Yapping").',
      'Hitung 1, 2, 3... secara bergiliran. Ucapkan angka atau kata penggantinya keras-keras, lalu tap Udah ngomong.',
      'Tiap 8 angka bakal muncul aturan tambahan! Kalau ada yang salah sebut, pemain lain langsung tap tombol Salah!'
    ],
    win:'Fokus dan nggak kepleset lidah waktu aturan makin numpuk.',
    lose:'Yang salah ngomong atau kelamaan mikir sampai waktu (3 detik) habis.'
  },
  'Gambar Buta': {
    steps:[
      'Pemain yang dapat giliran mengintip kata rahasia sendirian, lalu tap Mulai gambar.',
      'Gambar benda itu pakai jari di kotak kanvas selama 20 detik—tapi goresanmu sengaja disembunyikan (layar tetap kosong)!',
      'Setelah waktu habis, hasil gambarnya baru dimunculkan dan semua pemain lain ramai-ramai menebak.'
    ],
    win:'Minimal ada 1 teman yang berhasil menebak gambarmu dengan benar.',
    lose:'Penggambar kena hukuman kalau nggak ada satu pun teman yang bisa menebak bentuknya.'
  }
};
