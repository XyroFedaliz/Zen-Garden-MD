# ZenGarden WhatsApp Bot

![home](assets/Zen.gif)

Bot WhatsApp sederhana menggunakan Baileys Multi-Device. Dibuat oleh Xyro.

## Fitur

- Kirim pesan dengan tombol (button) dan list
- Buat stiker dari gambar, video, atau teks gaya brat
- Download media dari Pinterest dan Instagram
- Struktur command modular (mudah ditambah)
- Support Pairing Code login

## Struktur Folder
```
Zen-Garden-MD
├── assets/ # Asset tambahan (gambar, suara, dll)
├── Backup/ # Folder backup file command/data
├── commands/ # Semua file command bot
│ ├── ping.js
│ ├── brat.js
│ ├── button.js
│ ├── list.js
│ └── ...dll
├── config/ # Konfigurasi (API key, setting, dsb)
├── lib/ # Library tambahan (sticker, exif, downloader)
├── tmp/ # Folder file sementara (untuk brat, konversi stiker)
├── index.js # Entry point utama bot (koneksi WhatsApp)
├── zen.js # Handler pesan dan perintah
├── package.json # Daftar dependensi proyek
├── package-lock.json # Lockfile untuk NPM
├── README.md # Dokumentasi proyek
└── ZenAuth/ # (Akan muncul setelah pairing) Menyimpan sesi login WhatsApp
```


## Cara Install

1. Clone repositori:

```
git clone https://github.com/your-username/zengarden-bot
cd zengarden-bot
```

2. Install dependensi:
```
npm install
```

3. Jalankan bot:
```
node index.js
```
> Saat pertama kali dijalankan, akan diminta memasukkan nomor WhatsApp untuk pairing.

📄 Lisensi
Proyek ini dibuat untuk tujuan pembelajaran. Bebas digunakan dan dimodifikasi. Tidak diperjualbelikan.
