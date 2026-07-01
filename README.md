# The Sovereign Guild - Gamified Task Management System

[![Node.js Version](https://img.shields.io/badge/node->=%2016.0.0-brightgreen)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/Framework-MDA%20(Mechanics%2C%20Dynamics%2C%20Aesthetics)-blue)](https://vtechworks.lib.vt.edu/handle/10919/11261)
[![Database](https://img.shields.io/badge/Database-MySQL%20%2F%20PostgreSQL-orange)](https://www.dbeaver.io/)

**The Sovereign Guild** adalah platform *gamified task management* berbasis web yang dirancang untuk memitigasi prokrastinasi akademik dan meningkatkan motivasi intrinsik mahasiswa. Dengan mengintegrasikan **Framework MDA (Mechanics, Dynamics, Aesthetics)**, aplikasi ini mentransformasikan manajemen tugas konvensional yang monoton menjadi sebuah ekosistem pemenuhan kebutuhan otonomi (*autonomy*) yang dinamis dan imersif.

Proyek ini dikembangkan sebagai penelitian skripsi untuk memperoleh gelar Sarjana Terapan (S.Tr.Kom.) pada Program Studi Teknik Informatika, Jurusan Teknik Informatika dan Komputer, **Politeknik Negeri Jakarta**.

---

## 🎮 Fitur Utama (Game Mechanics & Dynamics)

Sistem ini membungkus logika manajemen tugas ke dalam mekanik permainan RPG (*Role-Playing Game*) yang komprehensif:

*   **Guild System & Role Assignment**: Pengguna dapat bergabung ke dalam *Sovereign Guild* sebagai *Guild Master* atau *Adventurer*.
*   **Quest Management**: Tugas akademik dikonversi menjadi *Quests* (Misi). Menyelesaikan tugas tepat waktu memberikan imbalan instan berupa XP dan Level.
*   **Buffs & Debuffs System**: Sistem umpan balik dinamis yang memengaruhi status karakter berdasarkan kedisiplinan pengumpulan tugas (termasuk mekanik *broken shield quests*).
*   **Duel System**: Fitur kompetitif antar-pengguna untuk meningkatkan keterikatan sosial (*social relatedness*) dan motivasi bertugas.
*   **Achievement System**: Penghargaan digital (*digital rewards*) sebagai validasi psikologis atas pencapaian produktivitas pengguna.
*   **Real-time Chat & Invitation**: Fitur kolaborasi *sprint* fungsional di dalam *Guild*.

---

## 🏗️ Arsitektur Sistem & Database

Aplikasi ini dibangun menggunakan arsitektur modular yang memisahkan konteks logika *gameplay* dan manajemen pengguna secara terstruktur:

*   **Backend**: Node.js / Express.js (Modular Rest API)
*   **Database Management**: Dikelola menggunakan **DBeaver** dengan skema relasi yang mengoptimalkan penyimpanan data karakter, *quest*, *buff/debuff*, log *duel*, dan pencapaian (*achievements*).
*   **Perancangan Flow**: Dimodelkan menggunakan pendekatan **PlantUML** untuk visualisasi ERD, Class Diagram, dan Activity Diagram yang presisi.

---

## 🚀 Memulai (Getting Started)

### Prasyarat
Sebelum menjalankan proyek, pastikan Anda telah menginstal:
*   [Node.js](https://nodejs.org/) (Versi direkomendasikan: v16+)
*   DBMS (MySQL / PostgreSQL) yang terhubung dengan DBeaver

### Instalasi & Konfigurasi

1.  **Klon Repositori**
    ```bash
    git clone [https://github.com/username/guild-task-backend.git](https://github.com/username/guild-task-backend.git)
    cd guild-task-backend
    ```

2.  **Instalasi Dependensi**
    ```bash
    npm install
    ```

3.  **Konfigurasi Environment Variables**
    Buat berkas `.env` pada direktori akar proyek dan sesuaikan konfigurasi database Anda:
    ```env
    PORT=5000
    DB_HOST=localhost
    DB_USER=root
    DB_PASS=rahasia
    DB_NAME=sovereign_guild
    JWT_SECRET=your_secret_key
    ```

4.  **Menjalankan Server**
    ```bash
    node server.js
    ```
    Server akan berjalan pada port yang telah ditentukan (Contoh: `http://localhost:5000`).

---

## 🧪 Pengujian Sistem

Validasi sistem dilakukan melalui metode **Black Box Testing** dan pengujian langsung kepada pengguna melalui kuisioner **User Acceptance Testing (UAT)** untuk mengukur aspek fungsionalitas, usabilitas, serta dampak psikologis elemen gamifikasi terhadap prokrastinasi.

---

## 📜 Lisensi & Hak Cipta

**Hak Cipta milik Jurusan TIK Politeknik Negeri Jakarta.**  
Dilarang mengumumkan dan memperbanyak sebagian atau seluruh karya tulis ini dalam bentuk apapun tanpa izin tertulis dari Jurusan TIK Politeknik Negeri Jakarta.

---
*"May You The Beauty Be Blessed."*
