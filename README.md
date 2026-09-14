# 🎓 Telegram Quiz Bot & Web Admin Panel Platform

O‘quvchilar uchun test ishlash, bilimlarini sinash, sertifikat olish hamda administratorlar uchun testlar va natijalarni to‘liq boshqarish imkoniyatini beruvchi professional platforma.

---

## 🌟 Asosiy Imkoniyatlar

### 🤖 1. Telegram Bot (O‘quvchilar uchun):
- **Ro‘yxatdan o‘tish & Bosh Menyu:** `/start` orqali tezkor profil ochiladi.
- **Fanlar & Testlar Katalogi:** Fanlar (Matematika, Informatika, Dasturlash, Ingliz tili, Ona tili va h.k.) bo‘yicha ajratilgan testlar.
- **Interaktiv Test Ishlash:** Savollar bittadan ko‘rsatiladi, inline variantlar (`[A] [B] [C] [D]`), rasmlar, oldingi/keyingi savolga o‘tish va javobni o‘zgartirish imkoniyati.
- **Real-Time Timer:** Belgilangan vaqt tugashi bilan test avtomatik yakunlanadi.
- **Natija & Baholash:** Foiz, to‘plangan ball, sarflangan vaqt va baholash (`A'lo`, `Juda yaxshi`, `Yaxshi`).
- **🔎 Xatolar Tahlili:** Test tugagach noto‘g‘ri belgilangan savollar, to‘g‘ri javob va admin qoldirgan tushuntirish/izoh ko‘rsatiladi.
- **🏆 PDF Sertifikat:** 80% dan yuqori ball to‘plagan o‘quvchilarga maxsus QR kodli, raqamli PDF sertifikat avtomatik generatsiya qilinadi va bot orqali yuboriladi.
- **🔥 Daily Challenge:** Har kuni yangilanadigan 10 ta savolli tezkor sinov.
- **🎲 Random Test:** Barcha fanlardan tasodifiy savollar to‘plami.
- **🏆 Reyting (Leaderboard):** Eng ko‘p ball to‘plagan top o‘quvchilar ro‘yxati va bonus ballar.
- **👤 Shaxsiy Profil & Level:** XP yig‘ish, daraja (Beginner, Student, Advanced, Expert, Master) va yutuqlar (Achievements).
- **🛡 Anti-Cheat:** Savollar va variantlar tartibini tasodifiy aralashtirish (shuffle) hamda urinishlar soni cheklovi.

### 💻 2. Web Admin Panel (Administratorlar uchun):
- **Modern Dark UI & Glassmorphism:** Zamonaviy, toza va tezkor boshqaruv paneli.
- **Jonli Dashboard:** Jami o‘quvchilar, bugungi testlar, o‘rtacha aniqlik, kunlik dinamika va fanlar taqsimoti grafiklari (Chart.js).
- **Testlar Boshqaruvi:** Yangi test yaratish, vaqt, ball, daraja (Easy, Medium, Hard), o‘tish bali va anti-cheat sozlash.
- **Savollar Bazasi:** Savol matni, 4 ta variant, to‘g‘ri javob, rasm yuklash va izoh kiritish.
- **📥 Bulk Import:** Excel (.xlsx, .csv) yoki JSON fayldan 100, 500, 1000 tagacha savollarni bir vaqtning o‘zida yuklash (Oldindan tekshirish va xatoliklar previewsi bilan).
- **👥 O‘quvchilar Boshqaruvi:** Barcha o‘quvchilarni ko‘rish, qidirish, bloklash/blokdan chiqarish va har bir o‘quvchining shaxsiy natijalari tahlili.
- **📈 Natijalar & Eksport:** Barcha natijalarni ko‘rish va **Excel (.xlsx)** hamda **CSV** formatlarda yuklab olish.
- **📢 Xabarnoma (Broadcast):** Barcha yoki faol o‘quvchilarga Telegram orqali xabar, e'lon va yangiliklar tarqatish.
- **🏆 Sertifikatlar:** Berilgan barcha PDF sertifikatlarni ko‘rish va yuklab olish.

---

## 🛠 Texnologiyalar

- **Backend:** Node.js, Express.js
- **Database:** MongoDB & Mongoose ORM
- **Telegram Bot:** Telegraf v4
- **Admin Frontend:** HTML5, Modern CSS3 (Glassmorphism, Responsive), Vanilla JS, Chart.js, FontAwesome
- **Sertifikat:** PDFKit & QRCode
- **Import/Export:** xlsx, multer
- **Xavfsizlik:** JWT, bcryptjs, Helmet, CORS, express-rate-limit

---

## 🚀 O‘rnatish va Ishga Tushirish

### 1. Repository va Paketlarni o‘rnatish
```bash
# Loyiha papkasiga kiring
cd "c:/Users/user/Desktop/uz Bot"

# Kerakli kutubxonalarni o‘rnating
npm install
```

### 2. Telegram Bot olish (BotFather)
1. Telegramda [@BotFather](https://t.me/BotFather) botiga kiring.
2. `/newbot` buyrug‘ini yuboring.
3. Botingiz nomini va username'ini kiriting (masalan: `MeningQuizBot`).
4. BotFather bergan **HTTP API Token**ni nusxalab oling.

### 3. `.env` Faylini Sozlash
Loyiha ildizidagi `.env` faylini oching va qiymatlarni o‘zingizga moslang:

```env
PORT=5000
NODE_ENV=development

# MongoDB ulanishi (Lokal yoki MongoDB Atlas)
MONGODB_URI=mongodb://127.0.0.1:27017/uz_quiz_bot

# BotFather'dan olingan token
BOT_TOKEN=7777777777:AAFakeTokenForLocalDevReplaceWithRealOne

# Xavfsizlik kaliti
JWT_SECRET=super_secret_jwt_key_quiz_bot_uz_2026_x99!

# Boshlang'ich Admin login va paroli
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
ADMIN_FULLNAME=Asosiy Admin
```

### 4. Boshlang‘ich Ma'lumotlarni Yuklash (Seed)
Barcha fanlar, testlar, namunaviy savollar va admin hisobini bazaga yuklash uchun:

```bash
npm run seed
```

> **Default Admin:**
> - **Login:** `admin`
> - **Parol:** `admin123`

### 5. Server va Botni Ishga Tushirish

**Development rejimida (nodemon bilan):**
```bash
npm run dev
```

**Production rejimida:**
```bash
npm start
```

Ishga tushgandan so‘ng:
- 🌐 **Web Admin Panel:** [http://localhost:5000](http://localhost:5000)
- 📡 **REST API:** [http://localhost:5000/api](http://localhost:5000/api)
- 🤖 **Telegram Bot:** Telegramda botingizga `/start` yuborib testlarni boshlashingiz mumkin.

---

## 📁 Loyiha Tuzilmasi (Architecture)

```
uz-bot/
├── .env                  # Sozlamalar va tokenlar
├── .env.example          # Namuna sozlamalar
├── package.json          # Paketlar ro‘yxati
├── server.js             # Express API va Botni birlashtiruvchi server
├── certificates/         # Generatsiya qilingan PDF sertifikatlar
├── uploads/              # Yuklangan rasm va fayllar
└── src/
    ├── config/
    │   └── db.js         # MongoDB ulanishi
    ├── models/           # 10 ta Mongoose modeli
    │   ├── User.js
    │   ├── Subject.js
    │   ├── Category.js
    │   ├── Test.js
    │   ├── Question.js
    │   ├── Attempt.js
    │   ├── Result.js
    │   ├── Achievement.js
    │   ├── Notification.js
    │   └── Certificate.js
    ├── controllers/      # REST API mantiqlari
    │   ├── authController.js
    │   ├── userController.js
    │   ├── testController.js
    │   ├── questionController.js
    │   ├── resultController.js
    │   ├── subjectController.js
    │   ├── statisticsController.js
    │   ├── notificationController.js
    │   └── certificateController.js
    ├── routes/           # REST API yo‘nalishlari
    ├── middleware/       # Auth, Upload, Error, RateLimit
    ├── services/         # Sertifikat, Scoring, Export, Telegram Bot servislari
    ├── bot/              # Telegram Bot moduli
    │   ├── index.js
    │   ├── commands/     # /start, /help
    │   ├── handlers/     # Test engine, Menyular, Challenges
    │   ├── keyboards/    # Reply & Inline klaviaturalar
    │   └── middleware/   # User session & auth
    ├── utils/
    │   └── seedData.js   # Boshlang‘ich ma’lumotlar yuklovchi skript
    └── public/           # Web Admin SPA Frontend
        ├── index.html
        ├── css/
        │   └── style.css
        └── js/
            ├── app.js
            └── charts.js
```

---

## 📊 REST API Ro‘yxati

| Yo‘l | Metod | Tavsif | Kirish |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Admin login | Ochiq |
| `/api/auth/me` | `GET` | Joriy profil | Himoyalangan |
| `/api/statistics/dashboard` | `GET` | Dashboard statistikasi | Admin |
| `/api/subjects` | `GET, POST` | Fanlar CRUD | Admin / Ochiq |
| `/api/tests` | `GET, POST, PUT, DELETE` | Testlar CRUD | Admin / Ochiq |
| `/api/questions` | `GET, POST, PUT, DELETE` | Savollar CRUD | Admin |
| `/api/questions/bulk-import` | `POST` | Excel/JSON savollar importi | Admin |
| `/api/users` | `GET` | O‘quvchilar ro‘yxati | Admin |
| `/api/users/:id/block` | `PUT` | O‘quvchini bloklash | Admin |
| `/api/results` | `GET` | Natijalar ro‘yxati | Admin |
| `/api/results/export/:format` | `GET` | Natijalarni Excel/CSV eksport qilish | Admin |
| `/api/notifications` | `GET, POST` | Telegram orqali xabar tarqatish | Admin |
| `/api/certificates` | `GET` | Sertifikatlar ro‘yxati | Admin |
| `/api/certificates/:id/download` | `GET` | PDF Sertifikatni yuklab olish | Ochiq |
