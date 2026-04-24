# 🔭 YOKOGAWA AQ7933 OTDR Simulator

> **Simulator Pelatihan OTDR Interaktif** — Belajar membaca grafik fiber optik, mengidentifikasi kejadian, dan menganalisis redaman seperti teknisi profesional, langsung dari browser!

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-otdr--simulator.vercel.app-1976d2?style=for-the-badge)](https://otdr-simulator.vercel.app)
[![GitHub](https://img.shields.io/badge/GitHub-Hanya--Faiz%2Fotdr--simulator-181717?style=for-the-badge&logo=github)](https://github.com/Hanya-Faiz/otdr-simulator)
![Mobile Ready](https://img.shields.io/badge/📱_Mobile-Friendly-success?style=for-the-badge)

---

## 📖 Daftar Isi

1. [Apa itu OTDR?](#-apa-itu-otdr)
2. [Fitur Simulator](#-fitur-simulator)
3. [Cara Menggunakan](#-cara-menggunakan)
4. [Panduan Panel & Fitur](#-panduan-panel--fitur)
5. [Jenis Kejadian (Events)](#-jenis-kejadian-events)
6. [Standar PT Telkom Indonesia](#-standar-pt-telkom-indonesia)
7. [Cara Mengerjakan Kuis](#-cara-mengerjakan-kuis)
8. [Panduan Mobile (HP)](#-panduan-mobile-hp)
9. [Level Kesulitan](#-level-kesulitan)
10. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
11. [Menjalankan Secara Lokal](#-menjalankan-secara-lokal)

---

## 🤔 Apa itu OTDR?

**OTDR** (Optical Time Domain Reflectometer) adalah alat ukur profesional yang digunakan oleh teknisi telekomunikasi untuk:

- Mengukur **panjang kabel fiber optik**
- Mendeteksi **lokasi kerusakan** (putus, tekukan, sambungan buruk)
- Mengukur **redaman (loss)** di setiap titik sambungan
- Memastikan kualitas jaringan memenuhi **standar PT Telkom Indonesia**

Alat OTDR asli seperti Yokogawa AQ7933 harganya sangat mahal. Simulator ini hadir agar **siswa bisa berlatih secara gratis** di browser tanpa memerlukan alat fisik!

> 💡 **Analogi OTDR:** Bayangkan kamu menyorot senter ke dalam pipa panjang. Cahaya berjalan sepanjang pipa, lalu memantul kembali. Dari pola pantulan itu, kamu bisa tahu di mana ada sumbatan, lekukan, atau ujung pipa. Itulah cara kerja OTDR — hanya saja menggunakan laser pada kabel kaca (fiber optik).

---

## ✨ Fitur Simulator

| Fitur | Keterangan |
|---|---|
| 🎲 **Generate Trace Acak** | Membuat grafik OTDR baru secara acak dengan parameter realistis |
| 📊 **Grafik Interaktif** | Zoom (scroll/pinch), pan (drag), dan keyboard navigation (WASD/Arrow) |
| 🔍 **Kursor A/B** | Penanda untuk mengukur jarak dan redaman antar dua titik |
| 📋 **Kuis Identifikasi** | Uji kemampuan mengidentifikasi jenis kejadian (Splice/Connector/End) |
| 🧠 **Analisis AI Otomatis** | Laporan otomatis kondisi kabel + rekomendasi perbaikan |
| 📁 **Import File .SOR** | Buka file OTDR asli dari alat Yokogawa (format Telcordia) |
| 💾 **Ekspor Biner .SOR** | Simpan trace buatan ke format .SOR yang bisa dibuka di software Yokogawa |
| 📱 **Responsif Mobile** | Bisa digunakan nyaman di HP, tablet, maupun laptop |
| 🌐 **Multi-fiber Project** | Kelola proyek pengukuran banyak fiber sekaligus |

---

## 🚀 Cara Menggunakan

### Langkah 1 — Buka Website

Buka **https://otdr-simulator.vercel.app** di browser HP atau laptop kamu.

---

### Langkah 2 — Pilih Level Kesulitan

Di bagian **toolbar atas** (laptop) atau **strip atas** (HP), pilih level:

| Level | Cocok Untuk |
|---|---|
| **Easy** | Pemula — grafik mulus tanpa noise |
| **Normal** | Latihan umum — seperti kondisi lapangan biasa |
| **Hard** | Latihan lanjutan — noise tinggi, splice kecil sulit terlihat |
| **Advanced** | Simulasi kabel rusak/tua — ada ghost reflection |

---

### Langkah 3 — Generate Trace

Klik tombol **▶ GENERATE** (biru) untuk membuat grafik OTDR baru secara acak.

Simulator akan otomatis:
- Membuat trace (jejak) fiber dengan parameter random
- Mendeteksi semua kejadian (splice, connector, end of fiber)
- Menghitung total redaman

---

### Langkah 4 — Baca Grafik

Grafik OTDR akan muncul di panel utama. Ini adalah **"foto rontgen" kabel fiber optik** kamu.

**Cara membaca grafik:**
- Sumbu **X (horizontal)** = Jarak dalam kilometer (km)
- Sumbu **Y (vertikal)** = Redaman dalam dB (semakin turun = sinyal makin lemah)
- Garis **merah menurun** = jalur kabel normal (sinyal melemah seiring jarak)

---

### Langkah 5 — Navigasi Grafik

| Aksi | Cara di Laptop | Cara di HP |
|---|---|---|
| Zoom in/out | Scroll mouse | Pinch (cubit layar) |
| Geser kiri/kanan | Klik+drag | Swipe |
| Mikro-navigasi | Tombol WASD / Arrow | — |
| Reset tampilan | Klik "Reset Zoom" | Klik "Reset Zoom" |

---

### Langkah 6 — Kerjakan Kuis

Pergi ke tab **Daftar Kejadian** (laptop) atau tekan tombol **Kuis** di navbar bawah (HP).

Identifikasi setiap kejadian yang terdeteksi, lalu klik **Cek Jawaban** untuk lihat skor kamu!

---

## 📐 Panduan Panel & Fitur

### Panel Kanan — Info Pengukuran

Berisi parameter pengukuran OTDR seperti:

| Parameter | Penjelasan |
|---|---|
| **Panjang Gelombang** | Warna laser yang digunakan (1310nm / 1550nm / 1625nm) |
| **Lebar Pulsa** | "Kecepatan kedip" laser — kecil untuk presisi, besar untuk jarak jauh |
| **Rentang Jarak** | Batas jangkauan pengukuran alat |
| **IOR** | Indeks bias kaca fiber — digunakan untuk konversi waktu ke jarak |
| **Total Redaman** | Jumlah semua kerugian sinyal di seluruh jalur |
| **Jarak Total** | Panjang kabel fiber sesungguhnya |
| **Durasi** | Lama pengukuran — makin lama, grafik makin mulus (averaging) |

---

### Panel Bawah — Tiga Tab Utama

#### 📋 Tab "Daftar Kejadian" (Kuis)
- Tabel berisi semua kejadian yang terdeteksi di jalur kabel
- Setiap baris adalah satu kejadian dengan jarak lokasinya
- Tugasmu: pilih jenis kejadian yang tepat untuk setiap baris
- Klik **Cek Jawaban** untuk melihat skor

#### 🗺️ Tab "Gambar Kejadian"
- Diagram visual jalur kabel dari ujung ke ujung
- Menampilkan posisi setiap kejadian (splice, connector, end) secara proporsional
- Cocok untuk memahami topologi jalur kabel

#### 🧠 Tab "Analisis Masalah Otomatis"
Tiga bagian analisis otomatis:
- **A. Analisa Masalah** — deskripsi kondisi setiap kejadian berdasarkan standar PT Telkom
- **B. Langkah Perbaikan** — rekomendasi tindakan teknis yang harus dilakukan
- **C. Link Budget** — perhitungan apakah sinyal cukup kuat sampai ke pelanggan

---

## 🔎 Jenis Kejadian (Events)

Ini adalah tiga jenis kejadian yang perlu kamu kenali di grafik OTDR:

### 1. 🔴 Connector (Konektor Reflektif)

```
dB ┤
   │     ↑ spike/lonjakan tajam
   │    ╱╲
   │───╱  ╲───
   │
   └────────── km
```

- **Bentuk:** Lonjakan (spike) tajam seperti jarum ke atas, lalu turun kembali
- **Penyebab:** Pantulan cahaya (Fresnel reflection) dari celah udara antara dua konektor
- **Standar Telkom:** Redaman konektor **≤ 0.50 dB**
- **Contoh:** Konektor SC/APC, ST, LC yang tidak rapat atau kotor

---

### 2. 🟠 Splice (Sambungan Non-Reflektif)

```
dB ┤
   │  sebelum     sesudah
   │────────╲───────────
   │         ╲
   └──────────╲────── km
```

- **Bentuk:** Penurunan garis seperti "anak tangga" — sinyal turun permanen tapi tidak ada lonjakan
- **Penyebab:** Peleburan (fusion splicing) dua ujung kabel fiber
- **Standar Telkom:** Redaman splice **≤ 0.10 dB**
- **Contoh:** Penyambungan kabel di tiang, joint closure di bawah tanah

---

### 3. 🟢 End of Fiber (Ujung Kabel)

```
dB ┤
   │──────────╲
   │           ╲
   │            ╲___________  (noise floor)
   └──────────────────────── km
```

- **Bentuk:** Garis menurun drastis sampai menyentuh batas bawah grafik (noise floor)
- **Penyebab:** Ujung kabel (dipotong bersih) atau kabel putus
- **Penanda:** Titik ini menandai panjang kabel sesungguhnya

---

## 📊 Standar PT Telkom Indonesia

### Redaman per Kilometer (Fiber Attenuation)

| Panjang Gelombang | Redaman Maksimal | Keterangan |
|---|---|---|
| **1310 nm** | ≤ 0.35 dB/km | O-Band — jarak menengah, perangkat lama |
| **1550 nm** | ≤ 0.22 dB/km | C-Band — standar utama FTTH Telkom |
| **1625 nm** | ≤ 0.22 dB/km | L-Band — monitoring jaringan aktif |

### Redaman per Titik Kejadian (Event Loss)

| Tipe Kejadian | Batas Lolos | Jika Melebihi |
|---|---|---|
| Splice / Sambungan | ≤ 0.10 dB | Splicing ulang |
| Connector / Konektor | ≤ 0.50 dB | Bersihkan atau ganti |
| Macrobending / Tekukan | ≤ 0.10 dB | Luruskan jalur kabel |

### Link Budget FTTH (OLT → ONT)

```
Rx Power = Tx Power OLT - Total Loss
```

| Parameter | Nilai |
|---|---|
| Tx Power OLT (asumsi) | +3.00 dBm |
| Total Loss Layak | 15 dB – 28 dB |
| Rx Power Minimum ONT | ≥ −27 dBm |
| Rx Power Maksimum ONT | ≤ −13 dBm |

> ⚠️ Jika Rx Power < −27 dBm → Sinyal terlalu lemah → Pelanggan LOS (merah)
> ⚠️ Jika Rx Power > −13 dBm → Sinyal terlalu kuat → Pakai attenuator

---

## ✏️ Cara Mengerjakan Kuis

Kuis adalah cara utama untuk melatih kemampuan analisis OTDR kamu!

### Langkah-langkah:

**1.** Generate trace baru (klik GENERATE)

**2.** Buka tab **"Daftar Kejadian"** (laptop) / tab **Kuis** (HP)

**3.** Perhatikan tabel yang muncul:

| Kolom | Artinya |
|---|---|
| **No. Kejadian** | Nomor urut kejadian dari kiri ke kanan grafik |
| **Lokasi/Jarak (km)** | Posisi kejadian di jalur kabel |
| **Jenis Anomali (Tebakan)** | Dropdown yang harus kamu isi |
| **Status** | Muncul setelah kamu klik "Cek Jawaban" |

**4.** Untuk setiap baris, klik dropdown dan pilih:
- `Splice` — jika terlihat penurunan anak tangga tanpa lonjakan
- `Connector` — jika terlihat lonjakan/spike ke atas
- `End of Fiber` — jika terlihat sinyal langsung turun total

**5.** Ada juga 3 pertanyaan tambahan di bawah tabel:
- **Jarak Kabel Total** → lihat posisi kejadian "End of Fiber" di grafik
- **Redaman /km** → lihat panjang gelombang di panel Info, sesuaikan dengan standar Telkom
- **Total Loss** → ambil dari nilai "Total Redaman" di panel Info

**6.** Klik **Cek Jawaban** → Lihat skor dan penjelasan setiap jawaban

> 💡 **Tips:** Gunakan tombol **Bantuan** (ikon ❓) di menu atas untuk membuka panduan lengkap termasuk contoh bentuk grafik setiap jenis kejadian.

---

## 📱 Panduan Mobile (HP)

Website ini sudah dioptimalkan untuk digunakan di smartphone!

### Layout Mobile

```
┌────────────────────────────┐
│  YOKOGAWA AQ7933 SIMULATOR │  ← Title bar
├────────────────────────────┤
│ [Baca .SOR] [Normal▼] [▶GENERATE] │  ← Quick action strip
├────────────────────────────┤
│  Analisis  │ Proyek Multi  │  ← Tab menu utama
├────────────────────────────┤
│                            │
│    [ GRAFIK OTDR ]         │  ← Area konten
│    atau                    │     (berganti sesuai
│    [ TABEL KUIS ]          │      nav bawah)
│    atau                    │
│    [ ANALISIS AI ]         │
│    atau                    │
│    [ INFO PARAMETER ]      │
│                            │
├────────────────────────────┤
│ 📊Grafik │📋Kuis │🧠AI │ℹInfo │  ← Navigasi bawah
└────────────────────────────┘
```

### Tombol Navigasi Bawah

| Ikon | Nama | Isi Panel |
|---|---|---|
| 📊 | **Grafik** | Grafik OTDR + kontrol kursor |
| 📋 | **Kuis** | Tabel identifikasi kejadian |
| 🧠 | **Analisis AI** | Laporan analisis otomatis |
| ℹ | **Info** | Data parameter pengukuran |

### Gestur Layar

| Gestur | Fungsi |
|---|---|
| Cubit (pinch) | Zoom in/out grafik |
| Swipe kiri/kanan | Geser grafik |
| Tap | Pilih menu / dropdown |
| Scroll vertikal | Scroll tabel/laporan |

---

## 🎯 Level Kesulitan

### Easy — Pemula
- Tidak ada noise
- Semua kejadian terlihat sangat jelas
- Spike konektor tajam, step splice terbaca nyata
- **Cocok untuk:** Siswa yang baru pertama kali belajar OTDR

### Normal — Latihan Umum
- Noise rendah, seperti kondisi lapangan nyata
- Semua kejadian masih dapat diidentifikasi dengan cermat
- **Cocok untuk:** Latihan sehari-hari di kelas

### Hard — Teknik Lanjutan
- Noise tinggi
- Splice redaman rendah (< 0.05 dB) bisa menyatu dengan noise
- Perlu analisis kemiringan (slope) grafik yang teliti
- **Cocok untuk:** Persiapan ujian kompetensi / UKK

### Advanced — Ahli / Expert
- Noise eksponensial di ujung jalur
- Terdapat pantulan hantu (ghost reflection)
- Kejadian bergerombol berdekatan
- **Cocok untuk:** Simulasi kabel tua / jalur bermasalah berat

---

## 🛠️ Teknologi yang Digunakan

| Teknologi | Kegunaan |
|---|---|
| **React 18** | Framework UI utama |
| **Vite** | Build tool & dev server |
| **Chart.js + react-chartjs-2** | Render grafik OTDR interaktif |
| **chartjs-plugin-zoom** | Fitur zoom & pan grafik |
| **chartjs-plugin-annotation** | Kursor A/B marker di grafik |
| **sor-reader** | Parser file .SOR Telcordia |
| **lucide-react** | Ikon UI |
| **Vercel** | Hosting & deployment |

---

## 💻 Menjalankan Secara Lokal

Jika ingin menjalankan simulator di komputer sendiri (untuk pengembangan atau penggunaan offline):

### Prasyarat
- [Node.js](https://nodejs.org) versi 18 atau lebih baru
- Git

### Langkah-langkah

```bash
# 1. Clone repository
git clone https://github.com/Hanya-Faiz/otdr-simulator.git

# 2. Masuk ke folder project
cd otdr-simulator

# 3. Install semua dependensi
npm install

# 4. Jalankan server development
npm run dev
```

Buka browser dan akses: **http://localhost:5173**

### Agar bisa diakses dari HP (jaringan yang sama):

```bash
npm run dev -- --host
```

Akan muncul alamat IP lokal (contoh: `http://192.168.1.5:5173`) yang bisa dibuka di HP selama terhubung ke WiFi yang sama.

### Build untuk produksi:

```bash
npm run build
```

---

## 🗂️ Struktur Project

```
otdr-simulator/
├── public/
│   ├── yokogawa.sor          # Template file SOR untuk ekspor
│   └── yokogawa.svg          # Ikon aplikasi
├── src/
│   ├── components/
│   │   ├── OTDRChart.jsx     # Komponen grafik utama (Chart.js)
│   │   ├── Sidebar.jsx       # Panel info parameter kanan
│   │   ├── EventQuizTable.jsx # Tabel kuis identifikasi kejadian
│   │   ├── EventDiagram.jsx  # Diagram visual posisi kejadian
│   │   └── AIAnalysisForm.jsx # Panel analisis AI otomatis
│   ├── utils/
│   │   ├── otdrSimulation.js # Engine generate trace OTDR
│   │   ├── exportSor.js      # Export ke format .SOR
│   │   └── exportSorInjector.js # Injeksi binary SOR
│   ├── App.jsx               # Komponen utama aplikasi
│   ├── index.css             # Stylesheet utama + responsive
│   └── main.jsx              # Entry point React
├── index.html
├── vite.config.js
└── README.md                 # Dokumentasi ini
```

---

## ❓ FAQ (Pertanyaan Umum)

**Q: Apakah simulator ini bisa digunakan tanpa internet?**
> Bisa, dengan menjalankan secara lokal (`npm run dev`). Setelah server berjalan, koneksi internet tidak diperlukan.

**Q: Apakah file .SOR dari alat OTDR asli bisa dibuka?**
> Ya! Klik tombol **Baca** lalu pilih file `.sor` dari komputer kamu. Simulator mendukung format Telcordia standar yang digunakan Yokogawa, EXFO, dan JDSU.

**Q: Bagaimana cara mengekspor hasil trace ke file .SOR?**
> Klik tombol **Ekspor Biner** di toolbar. Simulator akan melakukan injeksi data trace ke template Yokogawa asli dan mengunduh file `.sor` yang bisa dibuka di software Yokogawa OTDR Viewer.

**Q: Skor kuis saya selalu salah. Ada tips?**
> - Baca grafik dengan zoom in di area sekitar kejadian
> - Connector selalu punya **lonjakan ke atas** (spike), Splice **tidak ada lonjakan** (hanya turun)
> - End of Fiber selalu di titik paling kanan dan grafiknya turun sangat tajam
> - Gunakan tab **Bantuan** untuk melihat contoh bentuk grafik setiap jenis

**Q: Apakah bisa latihan tanpa generate ulang?**
> Ya. Grafik yang sudah ada tetap bisa dianalisis ulang tanpa klik GENERATE. Kamu bisa coba jawab kuis berkali-kali dengan grafik yang sama sampai semua benar.

---

## 👨‍💻 Kontribusi

Project ini open-source dan terbuka untuk kontribusi. Jika kamu menemukan bug atau ingin menambah fitur:

1. Fork repository ini
2. Buat branch baru: `git checkout -b fitur-baru`
3. Commit perubahan: `git commit -m "feat: tambah fitur X"`
4. Push ke branch: `git push origin fitur-baru`
5. Buat Pull Request

---

## 📄 Lisensi

Project ini dibuat untuk keperluan pendidikan dan pelatihan teknik fiber optik.

---

<div align="center">

Dibuat dengan ❤️ untuk siswa SMK Teknik Komputer dan Jaringan

**[Buka Simulator →](https://otdr-simulator.vercel.app)**

</div>
