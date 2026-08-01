#  Toko Kelontong Berkah — POS & ERP Store Management System

> **Developed by jb with fixs** — *Speed • Security • Trust*  
> **Owner**: Fikri Rusdinerza

<p flex gap-2>
  <img src="https://img.shields.io/badge/Frontend-React%20%7C%20Vite-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React" />
  <img src="https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
  <img src="https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
</p>

Aplikasi Web **Dashboard Toko Kelontong & Mode Kasir POS Eceran** berbasis **Fullstack React + Express + MongoDB** dengan antarmuka **Neumorphic Soft Matte Gray & Dual Sidebar Layout**, pendeteksian notifikasi **QRIS Bank Indonesia (Alfamart Style)**, serta **Cetak Struk Thermal Otomatis (Auto-Print)**.

---

##  Fitur Utama System

### 1.  Mode Kasir POS (Point of Sale)
- **Tampilan Kasir Cepat**: Filter kategori produk, pencarian barang cepat, dan pengelolaan Keranjang Belanja (*Cart Management*).
- **Multi-Metode Pembayaran**:
  - **Tunai**: Preset tombol uang cepat (10k, 20k, 50k, 100k, Uang Pas) dan kalkulator kembalian otomatis.
  - **QRIS BI (Alfamart Style)**: Template kartu resmi QRIS BI & GPN, audio chime (*Ding-Ding!*), dan verifikasi pembayaran otomatis.
  - **Transfer**: Pembayaran Bank Transfer.
  - **Kasbon / Utang**: Input nama pelanggan kasbon.
- **Cetak Struk Thermal Otomatis (Auto-Print)**: Nota kasir format 58mm / 80mm yang langsung mencetak saat transaksi lunas.

### 2.  Multi-User Role & Hak Akses (RBAC)
- **Role Admin / Pemilik Toko (`admin`)**:
  - Access ke Dashboard Utama, Laporan Laba Rugi P&L, Export Excel/PDF, Audit Stok Opname, Hapus Data, dan Pengaturan User.
- **Role Kasir / Karyawan (`kasir`)**:
  - Access khusus operasional: Mode POS Kasir, Katalog Barang (Lihat & Restok), dan Kas Harian. Dibatasi dari melihat laba bersih P&L atau menghapus transaksi.

### 3.  Dashboard Analytics & HPP Historical Snapshot
- **Harga Snapshot**: Menyimpan `harga_saat_transaksi` dan `harga_modal_saat_transaksi` secara otomatis saat transaksi terjadi agar perhitungan HPP dan Laba Rugi 100% akurat secara historis.
- **Laporan Laba Rugi (P&L Statement)**: Rumus `Omset - HPP - Biaya Operasional = Laba Bersih`.
- **Low Stock Monitoring & Stok Opname**: Audit stok fisik vs sistem dengan pencatatan selisih barang.

---

##  Tech Stack

- **Frontend**: React (Vite), Tailwind CSS, Recharts, Lucide Icons, Axios.
- **Backend**: Node.js, Express.js (Modular MVC), JWT Authentication, Bcryptjs.
- **Database**: MongoDB + Mongoose ODM.
- **Export Utilities**: ExcelJS (`.xlsx`), PDFMake (`.pdf`).

---

##  Kredensial Demo Account

| Role | Nama | Username | Password | Hak Akses |
|---|---|---|---|---|
| **Admin / Owner** | **Fikri Rusdinerza (Owner)** | `admin` | `admin123` | Full Access (Dashboard, P&L, Export, Users) |
| **Kasir / Karyawan** | **Kasir POS** | `kasir` | `kasir123` | POS Kasir, Restok Barang, Kas Harian |

---

##  Langkah Instalasi & Cara Menjalankan Project

### 1. Clone Repository
```bash
git clone https://github.com/fixxs/Dasboard-toko-kelontong.git
cd Dasboard-toko-kelontong
```

### 2. Setup Backend (Node.js + Express + MongoDB)
```bash
cd backend
npm install

# Salin file environment
cp .env.example .env

# Jalankan seeder data awal (Admin, Kasir, 10 Produk Sembako, 7 Hari Transaksi)
npm run seed

# Jalankan server backend (Port 5000)
npm run dev
```

### 3. Setup Frontend (React + Vite)
Buka terminal baru:
```bash
cd frontend
npm install

# Jalankan server frontend development (Port 5173)
npm run dev
```

Akses aplikasi di browser pada **http://localhost:5173**.

---
