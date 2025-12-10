# SETUP
---
### Instalasi modul dan prisama client
- instal deps
    ```bash
    npm install
    ```

- generate prima client
    ```bash
    npx prisma generate
    ```
    lalu lanjutkan dengan migrasi database
    ```bash
    npx prisma db push
    ```

---

### struktur folder
```text
generated (prisma client)
├── (berisi file bawaan dari prisma client yang telah di generate)
node_modules
prisma/
├──schema.prisma
scripts/
├──createAdmin.js
src/
├── config/
│   ├── cloudinary.js
│   └── supabase.js
├── controllers/
│   ├── adminAuth.controller.js
│   ├── artist.controller.js
│   ├── follow.controller.js
│   ├── likeSong.controller.js
│   ├── music.controller.js
│   ├── playlist.controller.js
│   ├── publicArtist.controller.js
│   ├── publicSong.controller.js
│   ├── search.contrroller.js
│   ├── song.controller.js
│   ├── user.controller.js
│   └── userAuth.controller.js 
├── middleware/
│   ├── adminAuth.js
│   ├── auth.js
│   └── upload.js
├── routes/
│   ├── adminArtist.routes.js
│   ├── adminAuth.routes.js
│   ├── adminSong.routes.js
│   ├── music.routes.js
│   ├── public.routes.js
│   ├── user.routes.js 
│   └── userAuth.routes.js
├──utils/
│   ├── cloudinaryUpload.js
│   ├── prisma.js
│   ├── redis.js
│   ├── retry.js
│   └── uploadAudio.js
├──app.js
.env
.gitignire
package-lock.json
package.json
README.md
server.js
```
Pastikan semua susunan folder dan file sesuai dengan struktur yang ada

---

### run in local host
jalankan
```bash
node server.js
```
jika berhasil akan muncul tulisan 
Server running on port 5000    
```bash
Server running on port 5000
```

</br>

# API
---
### User Auth
- User Register
    ```bash
    GET /api/auth/users/register 
    ```
    API ini digunakan untuk membuat akun user. 

- User Login
    ```bash
    PUT /api/auth/users/login 
    ```
    API ini digunakan agar user bisa login ke web pemutar music. ketika user sudah login, maka user akan mendapatkan JWT Token dan session disimpan ke redis

---

### User
semua end point user memerlukan authorization Header
- Get data user
    ```bash
    GET /api/users/me 
    ```
    API ini digunakan untuk mengambil data User
    
- update data user
    ```bash
    PUT /api/auth/users/me
    ```
    API ini digunakan untuk meng-update profile user (json)

- upload dan ganti avatar user
    ```bash
    PUT /api/auth/users/avatar
    ```
    API ini digunakan untuk mengupload dan mengganti avatar user menggunakan form-data (file: <image>).

- user logout
    ```bash
    POST /api/auth/users/logout 
    ```
    API ini digunakan untuk menghapus session user pada Redis dan meng-logout user

- menambahkan lagu kesukaan user (like song)
    ```bash
    POST /api/users/favorites/:songId
    ```
    API ini digunakan untuk menambahkan lagu yang dilike oleh user ke daftar lagu favorit user 

- menghapus lagu kesukaan user (unlike song)
    ```bash
    DELETE /api/favorites/:songId
    ```
    API ini digunakan untuk mengahapus lagu yang diunlike dari daftar lagu favorit 

- melihat lagu kesukaan user
    ```bash
    GET /api/users/favorites
    ```
    API ini digunakan untuk mengambil semua lagu yang sudah disukai oleh user menjadi sebuah playlist

- mengikuti artist
    ```bash
    POST /api/users/follow/:artistId
    ```
    API ini digunakan agar user dapat mengikuti artist tertentu

- batal mengikuti artist
    ```bash
    DELETE /api/users/follow/:artistId    
    ```
    API ini digunakan agar user dapat batal mengikuti artist tertentu

- menapatkan data artist yang diikuti (following)
    ```bash
    GET /api/users/following
    ```
    API ini digunakan untuk menampilkan daftar artist yang diikuti oleh user

---

### Admin
- admin login
    ```bash
    POST /api/auth/admin/login
    ```
    API ini digunakanan oleh admin untuk login. ketika admin sudah login, maka admin akan mendapatkan JWT Token dan session disimpan ke redis


- admin logout
    ```bash
    POST /api/auth/admin/logout
    ```
    API ini digunakan untuk menghapus session admin pada Redis dan meng-logout admin

---

### Artist (admin only)
semua end point artist dari sisi admin memerlukan authorization Header
- membuat artist
    ```bash
    POST /api/admin/artists
    ```
    API ini digunakan untuk membuat artist menggunaan form JSON

- mengupload avatar artist
    ```bash
    POST /api/admin/avatar
    ```
    API ini digunakan untuk men-upload menganti photo porifle dari artist.

- mendapatkan list artist
    ```bash
    GET /api/admin/artists
    ```
    API ini digunakan untuk mendapatkan semua list informasi dari artist yang ada

- medapatkan deskripsi dari salah satu artist
    ```bash
    GET /api/admin/artists/:id
    ```
    API ini digunakan untuk mendapatkan detail dari salah satu artist berdasarkan id nya

- memperbarui data artist
    ```bash
    PUT /api/admin/artists/:id
    ```
    API ini digunakan untuk memperbarui data artist menggunaan form JSON

- menghapus artist
    ```bash
    DELETE /api/admin/artists/:id
     
    ```
    API ini digunakan untuk menhapus salah satu admin berdasarkan Id nya


### Song (admin only)
semua end point song dari sisi admin memerlukan authorization Header
- Membuat Lagu
    ```bash
    POST /api/admin/songs
    ```
    API ini digunakan untuk men-upload lagu/ saat meng-upload lagu akan langsung meng-upload lagu dan cover secara bersamaan. lagu akan dihubungkan dengan artist id. jika ditemukan maka ,akan terhubung dan bisa diupload. jika tidak ditemukan, maka upload tidak akan bisa dilakukan

- mendapatkan list data semua lagu
    ```bash
    GET /api/admin/songs
    ```
    API ini digunakan untuk mendapatkan semua data dari lagu

- mendapatkan detail dari salah satu lagu
    ```bash
    GET /api/admin/songs/:id
    ```
    API ini digunakan untuk menampilkan detail dari salah satu lagu berdasarkan id nya

- memperbarui cover lagu
    ```bash
    PUT /api/admin/songs/:id/cover
    ```
    API ini digunakan untuk memperbarui cover dari lagu yang dinginkan berdasarkan id nya

- memperbarui data lagu
    ```bash
    PUT /api/admin/songs/:id
    ```
    API ini digunakan untuk memperbarui data lagu yang dinginkan berdasarkan id nya

- menghapus lagu
    ```bash
    DELETE /api/admin/songs/:id
    ```
    API ini digunakan untuk menghapus salah satu lagu berdasarkan id nya

---

### Song (public)
semua end point public tidak memerlukan authorization Header
- Mendapatkan list semua lagu (bisa digunakan untuk menampilkan lagu pada halaman pencarian)
    ```bash
    GET /api/public/songs
    ```
    API ini digunakan untuk mendapatkan list lagu untuk ditampilakn kepada guest (bukan user yang telah login)

- Mendapatkan detail dari sala satu lagu
    ```bash
    GET /api/public/songs/:id
    ```
    API ini digunakan untuk mendapatkan detail dari salah satu lagu untuk ditampilakn kepada guest (bukan user yang telah login)
---

### Artist (public)
semua end point public tidak memerlukan authorization Header
- Mendapatkan list semua  artist (bisa digunakan untuk menampilakn nama nama artist pada halaman pencarian)
    ```bash
    GET /api/public/artists
    ```
    API ini digunakan untuk mendapatkan list artists untuk ditampilakn kepada guest (bukan user yang telah login) 

- Mendapatkan detail salah satu artist
    ```bash
    GET /api/public/artists/:id
    ```
    API ini digunakan untuk menampilkan detail dari salah satu artist untuk ditampilakn kepada guest (bukan user yang telah login)

---

### Public
semua end point public tidak memerlukan authorization Header
- search
    ```bash
    GET /api/public/search
    ```
    API ini digunakan untuk mencari lagu maupun artist menggunakan params

---

### music
semua end point music memerlukan authorization Header
- memutar music
    ```bash
    POST /api/music/play/:songsId
    ```
    API ini digunakan untuk memutar lagu sesuai dengan songsId dari lagu tersebut

- recently play
    ```bash
    GET /api/music/recent
    ```
    API ini digunakan untuk mendapatkan data lagu yang diputar akhir akhir ini

---

### playlist (user)
semua end point playlist memerlukan authorization Header
- membuat playlist
    ```bash
    POST /api/users/playlist
    ```
    API ini digunakan agar user dapat membuat palylist

- melihat playlist user
    ```bash
    GET /api/users/playlist
    ```
    API ini digunakan untuk melihat semua playlist yang dimiliki oleh user

- melihat detail salah satu playlist
    ```bash
    GET /api/users/playlist
    ```
    API ini digunakan untuk mendapatkan detail dari salah satu album berdasarkan id albumnya

- menambahkan lagu ke playlist
    ```bash
    POST /api/users/playlist/:id/add-song
    ```
    API ini digunakan untuk menambahkan lagu kedalam playlist yang dimiliki oleh user

- menghapus lagu dari playlist
    ```bash
    DELETE /api/users/playlist/song/:playlistSongId
    ```
    API ini digunakan untuk manghapus lagu dari playlist yang dimiliki oleh user

- menghapus playlist
    ```bash
    POST /api/users/playlist
    ```
    API ini digunakan untuk mengapus playlist yang dimiliki oleh user

- mendapatkan playlist rekomendasi
    ```bash
    POST /api/users/playlist/recommend
    ```
    API ini digunakan unutk membuat playlist rekomendasi berdasarkan jumlah mendengarkan lagu si user

---

🔗 **Postmant Documentation:** [Click here to view the Postmant Documentation](https://documenter.getpostman.com/view/49108277/2sB3dQwpth)