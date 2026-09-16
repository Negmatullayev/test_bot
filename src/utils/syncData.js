require('dotenv').config();
const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Test = require('../models/Test');
const Question = require('../models/Question');
const User = require('../models/User');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uz_quiz_bot');
    console.log(`[MongoDB] Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error('[MongoDB Error]:', err.message);
    process.exit(1);
  }
};

const sync = async () => {
  await connectDB();
  console.log('🔄 Yangi fanlar, testlar va savollar sinxronizatsiya qilinmoqda...');

  // 1. Get or create Admin user for test creation
  let admin = await User.findOne({ role: 'admin' });
  if (!admin) {
    admin = await User.create({
      username: process.env.ADMIN_USERNAME || 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      firstName: process.env.ADMIN_FULLNAME || 'Asosiy Admin',
      role: 'admin',
      isBlocked: false
    });
  }

  // 2. Ensure Subjects
  const subjectsData = [
    { name: 'O‘zbekiston', icon: '🇺🇿', description: 'Mustaqillik, Davlat ramzlari (Bayroq, Gerb, Madhiya), Konstitutsiya va O‘zbekiston qonunlari', order: 1 },
    { name: 'Informatika', icon: '💻', description: 'Kompyuter savodxonligi, Qurilmalar, Tarmoqlar va Kiberxavfsizlik asoslari', order: 2 },
    { name: 'Dasturlash', icon: '⚡', description: 'JavaScript, Python, Node.js va Web dasturlash testlari', order: 3 },
    { name: 'Matematika', icon: '📘', description: 'Algebra, Geometriya va Mantiqiy masalalar', order: 4 },
    { name: 'Ingliz tili', icon: '📗', description: 'Grammar, Vocabulary va IELTS darajasi testlari', order: 5 },
    { name: 'Ona tili', icon: '📙', description: 'O‘zbek tili grammatikasi va adabiyot testlari', order: 6 }
  ];

  const subjectsMap = {};
  for (const s of subjectsData) {
    let sub = await Subject.findOne({ name: s.name });
    if (!sub) {
      sub = await Subject.create(s);
      console.log(`➕ Fan qo‘shildi: ${s.icon} ${s.name}`);
    } else {
      sub.icon = s.icon;
      sub.description = s.description;
      sub.order = s.order;
      sub.isActive = true;
      await sub.save();
    }
    subjectsMap[s.name] = sub;
  }

  // 3. Tests Definition
  const testsToSync = [
    {
      subjectName: 'O‘zbekiston',
      title: 'O‘zbekiston: Mustaqillik va Davlat Ramzlari',
      topic: 'Mustaqillik, Bayroq, Gerb, Madhiya va Milliy Qadriyatlar',
      description: 'O‘zbekiston davlat mustaqilligi, ramzlari va muhim tarixiy sanalar bo‘yicha keng qamrovli test.',
      durationMinutes: 12,
      totalQuestions: 10,
      pointsPerQuestion: 1,
      passingPercentage: 60,
      difficulty: 'easy',
      questions: [
        {
          questionText: 'O‘zbekiston Respublikasi Davlat mustaqilligi rasman qachon e’lon qilingan?',
          options: [
            { key: 'A', text: '1991-yil 31-avgust' },
            { key: 'B', text: '1991-yil 1-sentabr' },
            { key: 'C', text: '1992-yil 8-dekabr' },
            { key: 'D', text: '1990-yil 20-iyun' }
          ],
          correctAnswer: 'A',
          explanation: 'O‘zbekiston mustaqilligi 1991-yil 31-avgustda e’lon qilingan, 1-sentabr esa Mustaqillik bayrami kuni sifatida nishonlanadi.',
          difficulty: 'easy'
        },
        {
          questionText: 'O‘zbekiston Respublikasining Davlat bayrog‘i qachon qabul qilingan?',
          options: [
            { key: 'A', text: '1991-yil 18-noyabr' },
            { key: 'B', text: '1992-yil 2-iyul' },
            { key: 'C', text: '1991-yil 31-avgust' },
            { key: 'D', text: '1992-yil 10-dekabr' }
          ],
          correctAnswer: 'A',
          explanation: '"O‘zbekiston Respublikasining Davlat bayrog‘i to‘g‘risida"gi Qonun 1991-yil 18-noyabrda qabul qilingan.',
          difficulty: 'easy'
        },
        {
          questionText: 'O‘zbekiston Respublikasining Davlat gerbi qachon qabul qilingan?',
          options: [
            { key: 'A', text: '1991-yil 18-noyabr' },
            { key: 'B', text: '1992-yil 2-iyul' },
            { key: 'C', text: '1992-yil 8-dekabr' },
            { key: 'D', text: '1993-yil 9-aprel' }
          ],
          correctAnswer: 'B',
          explanation: '"O‘zbekiston Respublikasining Davlat gerbi to‘g‘risida"gi Qonun 1992-yil 2-iyulda qabul qilingan.',
          difficulty: 'easy'
        },
        {
          questionText: 'O‘zbekiston Respublikasining Davlat madhiyasi to‘g‘risidagi qonun qachon qabul qilingan?',
          options: [
            { key: 'A', text: '1992-yil 10-dekabr' },
            { key: 'B', text: '1991-yil 18-noyabr' },
            { key: 'C', text: '1992-yil 2-iyul' },
            { key: 'D', text: '1993-yil 1-yanvar' }
          ],
          correctAnswer: 'A',
          explanation: 'O‘zbekiston Respublikasi Davlat madhiyasi 1992-yil 10-dekabrda qabul qilingan.',
          difficulty: 'easy'
        },
        {
          questionText: 'O‘zbekiston Respublikasi Davlat madhiyasining musiqasi va she’ri mualliflari kimlar?',
          options: [
            { key: 'A', text: 'Musiqa: Mutal Burhonov, She’r: Abdulla Oripov' },
            { key: 'B', text: 'Musiqa: Yunus Rajabiy, She’r: Erkin Vohidov' },
            { key: 'C', text: 'Musiqa: To‘xtasin Jalilov, She’r: G‘afur G‘ulom' },
            { key: 'D', text: 'Musiqa: Doni Zokirov, She’r: Hamid Olimjon' }
          ],
          correctAnswer: 'A',
          explanation: 'Madhiya musiqasini Mutal Burhonov bastalagan, she’rini esa O‘zbekiston Qahramoni Abdulla Oripov yozgan.',
          difficulty: 'easy'
        },
        {
          questionText: 'Davlat bayrog‘idagi 12 ta yulduz nimani anglatadi?',
          options: [
            { key: 'A', text: '12 ta viloyatni' },
            { key: 'B', text: 'O‘zbekiston xalqining qadimgi madaniyati, 12 oy va komillik ramzini' },
            { key: 'C', text: '12 ta vazirlikni' },
            { key: 'D', text: '12 nafar buyuk allomani' }
          ],
          correctAnswer: 'B',
          explanation: '12 yulduz qadimiy ajdodlarimiz taqvimi, 12 oy hamda mukammallik va go‘zallik ramzini bildiradi.',
          difficulty: 'medium'
        },
        {
          questionText: 'O‘zbekiston Respublikasi Davlat gerbida qaysi afsonaviy qush tasvirlangan va u nimaning ramzi?',
          options: [
            { key: 'A', text: 'Semurg‘ — boylik va savdo' },
            { key: 'B', text: 'Humo qushi — baxt va erksevarlik ramzi' },
            { key: 'C', text: 'Lochin — kuch va shijoat' },
            { key: 'D', text: 'Burgut — mardlik va jasorat' }
          ],
          correctAnswer: 'B',
          explanation: 'Gerbimiz markazida qanotlarini yozgan afsonaviy Humo qushi — baxt va erksevarlik ramzi sifatida gavdalangan.',
          difficulty: 'easy'
        },
        {
          questionText: 'O‘zbek tiliga Davlat tili maqomi qachon berilgan?',
          options: [
            { key: 'A', text: '1989-yil 21-oktabr' },
            { key: 'B', text: '1991-yil 1-sentabr' },
            { key: 'C', text: '1992-yil 8-dekabr' },
            { key: 'D', text: '1990-yil 1-oktabr' }
          ],
          correctAnswer: 'A',
          explanation: '"Davlat tili haqida"gi tarixiy qonun 1989-yil 21-oktabrda qabul qilingan.',
          difficulty: 'easy'
        },
        {
          questionText: 'O‘zbekistonning milliy valyutasi — "So‘m" qachon muomalaga kiritilgan?',
          options: [
            { key: 'A', text: '1994-yil 1-iyul' },
            { key: 'B', text: '1991-yil 1-sentabr' },
            { key: 'C', text: '1992-yil 1-yanvar' },
            { key: 'D', text: '1995-yil 1-yanvar' }
          ],
          correctAnswer: 'A',
          explanation: 'O‘zbekiston Respublikasining milliy valyutasi "So‘m" 1994-yil 1-iyuldan boshlab to‘laqonli muomalaga kiritilgan.',
          difficulty: 'medium'
        },
        {
          questionText: 'O‘zbekiston Respublikasi Birlashgan Millatlar Tashkilotiga (BMT) qachon a’zo bo‘lgan?',
          options: [
            { key: 'A', text: '1992-yil 2-mart' },
            { key: 'B', text: '1991-yil 31-avgust' },
            { key: 'C', text: '1993-yil 5-may' },
            { key: 'D', text: '1994-yil 10-sentabr' }
          ],
          correctAnswer: 'A',
          explanation: 'O‘zbekiston 1992-yil 2-martda xalqaro hamjamiyatning teng huquqli a’zosi sifatida BMTga qabul qilingan.',
          difficulty: 'medium'
        }
      ]
    },
    {
      subjectName: 'O‘zbekiston',
      title: 'O‘zbekiston Konstitutsiyasi va Qonunlari',
      topic: 'Konstitutsiya, Huquqiy asoslar va Davlat boshqaruvi',
      description: 'Yangi tahrirdagi Konstitutsiya, inson huquqlari, Oliy Majlis va O‘zbekiston qonunchiligi bo‘yicha test.',
      durationMinutes: 15,
      totalQuestions: 10,
      pointsPerQuestion: 1,
      passingPercentage: 70,
      difficulty: 'medium',
      questions: [
        {
          questionText: 'O‘zbekiston Respublikasining ilk Konstitutsiyasi qachon qabul qilingan?',
          options: [
            { key: 'A', text: '1992-yil 8-dekabr' },
            { key: 'B', text: '1991-yil 1-sentabr' },
            { key: 'C', text: '1993-yil 1-yanvar' },
            { key: 'D', text: '1990-yil 20-iyun' }
          ],
          correctAnswer: 'A',
          explanation: 'O‘zbekiston Respublikasining ilk Konstitutsiyasi 1992-yil 8-dekabrda XII chaqiriq Oliy Kengashning 11-sessiyasida qabul qilingan.',
          difficulty: 'easy'
        },
        {
          questionText: 'Yangi tahrirdagi O‘zbekiston Respublikasi Konstitutsiyasi umumxalq referendumi orqali qachon qabul qilindi?',
          options: [
            { key: 'A', text: '2023-yil 30-aprel' },
            { key: 'B', text: '2022-yil 8-dekabr' },
            { key: 'C', text: '2021-yil 24-oktabr' },
            { key: 'D', text: '2024-yil 1-yanvar' }
          ],
          correctAnswer: 'A',
          explanation: 'Yangi tahrirdagi Konstitutsiya 2023-yil 30-aprelda o‘tkazilgan umumxalq referendumi asosida qabul qilingan va 1-maydan kuchga kirgan.',
          difficulty: 'easy'
        },
        {
          questionText: 'Yangi Konstitutsiyaning 1-moddasiga ko‘ra, O‘zbekiston qanday davlat deb e’lon qilingan?',
          options: [
            { key: 'A', text: 'Suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlat' },
            { key: 'B', text: 'Faqatgina federativ va diniy davlat' },
            { key: 'C', text: 'Monarxiya va konfederativ respublika' },
            { key: 'D', text: 'Parlamentar totalitar davlat' }
          ],
          correctAnswer: 'A',
          explanation: 'Konstitutsiya 1-moddasi: "O‘zbekiston — boshqaruvning respublika shakliga ega bo‘lgan suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlatdir".',
          difficulty: 'easy'
        },
        {
          questionText: 'Konstitutsiyaga ko‘ra, davlat hokimiyatining birdan-bir manbai kim?',
          options: [
            { key: 'A', text: 'O‘zbekiston xalqi' },
            { key: 'B', text: 'Vazirlar Mahkamasi' },
            { key: 'C', text: 'Sud hokimiyati' },
            { key: 'D', text: 'Siyosiy partiyalar' }
          ],
          correctAnswer: 'A',
          explanation: 'O‘zbekiston Respublikasi Konstitutsiyasiga muvofiq, xalq davlat hokimiyatining birdan-bir manbaidir.',
          difficulty: 'easy'
        },
        {
          questionText: 'O‘zbekiston Respublikasida oliy davlat vakillik organi va qonun chiqaruvchi hokimiyat qaysi?',
          options: [
            { key: 'A', text: 'Oliy Majlis (Qonunchilik palatasi va Senat)' },
            { key: 'B', text: 'Vazirlar Mahkamasi' },
            { key: 'C', text: 'Konstitutsiyaviy Sud' },
            { key: 'D', text: 'Bosh prokuratura' }
          ],
          correctAnswer: 'A',
          explanation: 'O‘zbekiston Respublikasi Oliy Majlisi oliy davlat vakillik organi bo‘lib, qonun chiqaruvchi hokimiyatni amalga oshiradi.',
          difficulty: 'easy'
        },
        {
          questionText: 'O‘zbekiston Respublikasida ijro etuvchi hokimiyatni qaysi organ amalga oshiradi?',
          options: [
            { key: 'A', text: 'O‘zbekiston Respublikasi Vazirlar Mahkamasi' },
            { key: 'B', text: 'Oliy Majlis Senati' },
            { key: 'C', text: 'Oliy Sud' },
            { key: 'D', text: 'Markaziy Saylov Komissiyasi' }
          ],
          correctAnswer: 'A',
          explanation: 'O‘zbekiston Respublikasi Vazirlar Mahkamasi (Hukumat) ijro etuvchi hokimiyatni amalga oshiruvchi oliy organdir.',
          difficulty: 'medium'
        },
        {
          questionText: 'Yangi Konstitutsiyaga asosan O‘zbekiston Respublikasi Prezidenti necha yil muddatga saylanadi?',
          options: [
            { key: 'A', text: '7 yil' },
            { key: 'B', text: '5 yil' },
            { key: 'C', text: '4 yil' },
            { key: 'D', text: '6 yil' }
          ],
          correctAnswer: 'A',
          explanation: 'Yangi tahrirdagi Konstitutsiyaga binoan O‘zbekiston Respublikasi Prezidenti 7 yil muddatga saylanadi.',
          difficulty: 'medium'
        },
        {
          questionText: 'O‘zbekiston Respublikasida fuqarolar necha yoshdan boshlab saylov huquqiga ega bo‘ladilar?',
          options: [
            { key: 'A', text: '18 yoshdan' },
            { key: 'B', text: '16 yoshdan' },
            { key: 'C', text: '21 yoshdan' },
            { key: 'D', text: '25 yoshdan' }
          ],
          correctAnswer: 'A',
          explanation: '18 yoshga to‘lgan O‘zbekiston Respublikasi fuqarolari saylash huquqiga egadirlar.',
          difficulty: 'easy'
        },
        {
          questionText: 'Inson huquqlari va erkinliklarining kafolatlari bo‘yicha O‘zbekistonda o‘lim jazosi qanday maqomda?',
          options: [
            { key: 'A', text: 'O‘zbekiston Respublikasida o‘lim jazosi butunlay taqiqlangan' },
            { key: 'B', text: 'Faqat og‘ir jinoyatlarda qo‘llaniladi' },
            { key: 'C', text: 'Vaqtincha to‘xtatilgan' },
            { key: 'D', text: 'Harbiy holatda qo‘llaniladi' }
          ],
          correctAnswer: 'A',
          explanation: 'Yangi Konstitutsiya 25-moddasiga ko‘ra, O‘zbekiston Respublikasida o‘lim jazosi qat’iyan taqiqlangan.',
          difficulty: 'medium'
        },
        {
          questionText: 'O‘zbekiston Respublikasida sud hokimiyatining mustaqilligi qanday kafolatlanadi?',
          options: [
            { key: 'A', text: 'Sud hokimiyati qonun chiqaruvchi va ijro etuvchi hokimiyatlardan, siyosiy partiyalardan mustaqil ish yuritadi' },
            { key: 'B', text: 'Sud hokimiyati shahar hokimiyatiga hisobot beradi' },
            { key: 'C', text: 'Sudlar faoliyatini jamoat tashkilotlari nazorat qiladi' },
            { key: 'D', text: 'Sudlar qonun chiqaruvchi organga bo‘ysunadi' }
          ],
          correctAnswer: 'A',
          explanation: 'Sud hokimiyati boshqa hokimiyat tarmoqlaridan to‘liq mustaqil bo‘lib, faqat Konstitutsiya va qonunlarga bo‘ysunadi.',
          difficulty: 'medium'
        }
      ]
    },
    {
      subjectName: 'Informatika',
      title: 'Informatika: Kompyuter Savodxonligi va Qurilmalar',
      topic: 'Protsessor, Xotiralar, Kirish-Chiqish va Dasturiy ta’minot',
      description: 'Kompyuter tuzilishi, o‘lchov birliklari va Windows operatsion tizimi asoslari.',
      durationMinutes: 10,
      totalQuestions: 10,
      pointsPerQuestion: 1,
      passingPercentage: 60,
      difficulty: 'easy',
      questions: [
        {
          questionText: 'Kompyuterning asosiy hisoblash va mantiqiy amallarini bajaruvchi "miyasi" qaysi qurilma?',
          options: [
            { key: 'A', text: 'Protsessor (CPU)' },
            { key: 'B', text: 'Qattiq disk (HDD)' },
            { key: 'C', text: 'Tezkor xotira (RAM)' },
            { key: 'D', text: 'Ona plata (Motherboard)' }
          ],
          correctAnswer: 'A',
          explanation: 'Markaziy protsessor (CPU) — barcha hisob-kitoblar va buyruqlarni qayta ishlovchi asosiy mikrosxemadir.',
          difficulty: 'easy'
        },
        {
          questionText: 'Kompyuter o‘chirilganda undagi barcha ma’lumotlar o‘chib ketadigan tezkor xotira turi qaysi?',
          options: [
            { key: 'A', text: 'RAM (Operativ xotira)' },
            { key: 'B', text: 'ROM (Doimiy xotira)' },
            { key: 'C', text: 'SSD flesh xotira' },
            { key: 'D', text: 'HDD magnit diski' }
          ],
          correctAnswer: 'A',
          explanation: 'RAM (Random Access Memory) bu energiya ta’minotiga bog‘liq vaqtinchalik tezkor xotira hisoblanadi.',
          difficulty: 'easy'
        },
        {
          questionText: 'Axborotning eng kichik o‘lchov birligi nima deb ataladi?',
          options: [
            { key: 'A', text: 'Bit' },
            { key: 'B', text: 'Bayt' },
            { key: 'C', text: 'Kilobayt' },
            { key: 'D', text: 'Piksel' }
          ],
          correctAnswer: 'A',
          explanation: 'Bit (binary digit) — axborotning eng kichik birligi bo‘lib, faqat 0 yoki 1 qiymatini qabul qiladi.',
          difficulty: 'easy'
        },
        {
          questionText: '1 Bayt necha bitga teng?',
          options: [
            { key: 'A', text: '8 bit' },
            { key: 'B', text: '16 bit' },
            { key: 'C', text: '4 bit' },
            { key: 'D', text: '1024 bit' }
          ],
          correctAnswer: 'A',
          explanation: '1 Bayt = 8 bit.',
          difficulty: 'easy'
        },
        {
          questionText: '1 Gigabayt (GB) necha Megabayt (MB) ga teng?',
          options: [
            { key: 'A', text: '1024 MB' },
            { key: 'B', text: '1000 MB' },
            { key: 'C', text: '100 MB' },
            { key: 'D', text: '1048576 MB' }
          ],
          correctAnswer: 'A',
          explanation: 'Informatikada ikkilik tizim bo‘yicha 1 GB = 1024 MB (2^10 MB) bo‘ladi.',
          difficulty: 'easy'
        },
        {
          questionText: 'Quyidagilardan qaysi biri axborotni kiritish qurilmasi hisoblanadi?',
          options: [
            { key: 'A', text: 'Klaviatura va Skaner' },
            { key: 'B', text: 'Monitor' },
            { key: 'C', text: 'Printer' },
            { key: 'D', text: 'Karnay (Kolonka)' }
          ],
          correctAnswer: 'A',
          explanation: 'Klaviatura, sichqoncha va skaner axborotni kompyuterga kiritish qurilmalaridir.',
          difficulty: 'easy'
        },
        {
          questionText: 'Windows tizimida belgilangan fayl yoki matndan nusxa olish (Copy) uchun qaysi klavishlar birikmasi ishlatiladi?',
          options: [
            { key: 'A', text: 'Ctrl + C' },
            { key: 'B', text: 'Ctrl + V' },
            { key: 'C', text: 'Ctrl + X' },
            { key: 'D', text: 'Ctrl + Z' }
          ],
          correctAnswer: 'A',
          explanation: 'Ctrl + C — nusxa olish (Copy), Ctrl + V esa joylashtirish (Paste) vazifasini bajaradi.',
          difficulty: 'easy'
        },
        {
          questionText: 'Kompyuter apparat qismlari va dasturlarni boshqaruvchi asosiy tizimli dasturiy ta’minot nima?',
          options: [
            { key: 'A', text: 'Operatsion tizim' },
            { key: 'B', text: 'Matn muharriri' },
            { key: 'C', text: 'Grafik dastur' },
            { key: 'D', text: 'Elektron jadval' }
          ],
          correctAnswer: 'A',
          explanation: 'Operatsion tizim (Windows, Linux, macOS) — butun kompyuter resurslarini boshqaruvchi asosiy tizimli dasturdir.',
          difficulty: 'easy'
        },
        {
          questionText: 'Quyidagilardan qaysi biri operatsion tizim hisoblanmaydi?',
          options: [
            { key: 'A', text: 'Microsoft Word' },
            { key: 'B', text: 'Windows 11' },
            { key: 'C', text: 'Ubuntu Linux' },
            { key: 'D', text: 'macOS' }
          ],
          correctAnswer: 'A',
          explanation: 'Microsoft Word bu matn terish uchun mo‘ljallangan amaliy dasturdir, operatsion tizim emas.',
          difficulty: 'easy'
        },
        {
          questionText: 'Qattiq disk (HDD) va SSD xotiralarning asosiy farqi nimada?',
          options: [
            { key: 'A', text: 'SSD elektron mikrosxemalarda ishlaydi va HDDga nisbatan ancha tezroq' },
            { key: 'B', text: 'HDD faqat internetda ishlaydi' },
            { key: 'C', text: 'SSD kompyuter o‘chsa ma’lumotni o‘chiradi' },
            { key: 'D', text: 'Hech qanday farqi yo‘q' }
          ],
          correctAnswer: 'A',
          explanation: 'SSD flesh-xotira asosida ishlaydi, mexanik aylanuvchi disklarga ega emas va HDDdan bir necha barobar tezroq ishlaydi.',
          difficulty: 'medium'
        }
      ]
    },
    {
      subjectName: 'Informatika',
      title: 'Informatika: Tarmoqlar, Internet va Kiberxavfsizlik',
      topic: 'Internet, IP/DNS protokollari va Axborot xavfsizligi',
      description: 'Kompyuter tarmoqlari, brauzerlar, kiberxavfsizlik va viruslardan himoyalanish testlari.',
      durationMinutes: 12,
      totalQuestions: 8,
      pointsPerQuestion: 1,
      passingPercentage: 65,
      difficulty: 'medium',
      questions: [
        {
          questionText: 'Internet tarmog‘iga ulangan har bir qurilmaning unikal raqamli manzili nima deyiladi?',
          options: [
            { key: 'A', text: 'IP manzil (IP address)' },
            { key: 'B', text: 'URL manzil' },
            { key: 'C', text: 'HTML kod' },
            { key: 'D', text: 'SMS kod' }
          ],
          correctAnswer: 'A',
          explanation: 'IP manzil — tarmoqdagi qurilmalarni bir-biridan farqlovchi va ularga murojaat qilish imkonini beruvchi unikal manzildir.',
          difficulty: 'easy'
        },
        {
          questionText: 'Domen nomlarini (masalan: kun.uz) mos IP manzilga aylantirib beruvchi tizim qaysi?',
          options: [
            { key: 'A', text: 'DNS (Domain Name System)' },
            { key: 'B', text: 'FTP' },
            { key: 'C', text: 'SMTP' },
            { key: 'D', text: 'DHCP' }
          ],
          correctAnswer: 'A',
          explanation: 'DNS tizimi inson tushunadigan domen nomlarini kompyuter tushunadigan raqamli IP manzillarga o‘girib beradi.',
          difficulty: 'medium'
        },
        {
          questionText: 'Veb-sayt xavfsiz va ma’lumotlar shifrlangan holatda uzatilayotganini qaysi protokol bildiradi?',
          options: [
            { key: 'A', text: 'HTTPS' },
            { key: 'B', text: 'HTTP' },
            { key: 'C', text: 'FTP' },
            { key: 'D', text: 'TELNET' }
          ],
          correctAnswer: 'A',
          explanation: 'HTTPS (HyperText Transfer Protocol Secure) — SSL/TLS orqali shifrlangan xavfsiz protokoldir.',
          difficulty: 'easy'
        },
        {
          questionText: 'Foydalanuvchini aldamchi havolalar orqali login, parol yoki bank karta ma’lumotlarini o‘g‘irlashga qaratilgan kiberhujum turi qaysi?',
          options: [
            { key: 'A', text: 'Fishing (Phishing)' },
            { key: 'B', text: 'Spam' },
            { key: 'C', text: 'DDoS' },
            { key: 'D', text: 'Mining' }
          ],
          correctAnswer: 'A',
          explanation: 'Fishing — kiberjinoyatchilar tomonidan soxta sahifalar orqali shaxsiy ma’lumotlarni o‘marganlik usulidir.',
          difficulty: 'easy'
        },
        {
          questionText: 'Bir xona, bino yoki muassasa doirasidagi lokal kompyuter tarmog‘i qisqartmasi qanday?',
          options: [
            { key: 'A', text: 'LAN (Local Area Network)' },
            { key: 'B', text: 'WAN (Wide Area Network)' },
            { key: 'C', text: 'MAN (Metropolitan Area Network)' },
            { key: 'D', text: 'PAN (Personal Area Network)' }
          ],
          correctAnswer: 'A',
          explanation: 'LAN — cheklangan maydondagi kompyuterlarni o‘zaro bog‘lovchi lokal tarmoq hisoblanadi.',
          difficulty: 'easy'
        },
        {
          questionText: 'Kiberxavfsizlikda kuchli parolni qanday yaratish tavsiya etiladi?',
          options: [
            { key: 'A', text: 'Katta-kichik harflar, raqamlar va maxsus belgilardan iborat kamida 8-12 belgili parol' },
            { key: 'B', text: 'Faqat tug‘ilgan yil va ism' },
            { key: 'C', text: '12345678 kabi ketma-ket raqamlar' },
            { key: 'D', text: 'Faqatgina telefon raqami' }
          ],
          correctAnswer: 'A',
          explanation: 'Kuchli parol turli registrdagi harflar, sonlar va maxsus belgilardan iborat bo‘lishi lozim.',
          difficulty: 'easy'
        },
        {
          questionText: '2FA (Ikki bosqichli autentifikatsiya) ning asosiy maqsadi nima?',
          options: [
            { key: 'A', text: 'Parol o‘g‘irlangan taqdirda ham tasdiqlash kodi orqali akkauntni himoyalash' },
            { key: 'B', text: 'Internet tezligini 2 barobarga oshirish' },
            { key: 'C', text: 'Kompyuterni tezroq o‘chirib-yoqish' },
            { key: 'D', text: 'Fayllarni ikki marta nusxalash' }
          ],
          correctAnswer: 'A',
          explanation: '2FA — hisobga kirishda paroldan tashqari telefonga yoki ilovaga keladigan bir martalik kodni talab qiluvchi himoya qatlamidir.',
          difficulty: 'easy'
        },
        {
          questionText: 'Veb-sahifalarni ko‘rish va internetda ma’lumot izlash uchun ishlatiladigan dastur qanday ataladi?',
          options: [
            { key: 'A', text: 'Brauzer (Browser)' },
            { key: 'B', text: 'Kompilyator' },
            { key: 'C', text: 'Drayver' },
            { key: 'D', text: 'Arxivator' }
          ],
          correctAnswer: 'A',
          explanation: 'Google Chrome, Firefox, Edge, Safari kabi dasturlar brauzer (veb-ko‘ruvchi) dasturlar hisoblanadi.',
          difficulty: 'easy'
        }
      ]
    },
    {
      subjectName: 'Ona tili',
      title: 'Ona tili: Grammatika va imlo',
      topic: 'So‘z turkumlari, gap bo‘laklari va imlo qoidalari',
      description: 'O‘zbek tili grammatikasi va imlo qoidalari bo‘yicha 20 ta savol.',
      durationMinutes: 20,
      totalQuestions: 20,
      pointsPerQuestion: 1,
      passingPercentage: 60,
      difficulty: 'medium',
      questions: [
        ['O‘zbek tilida nechta unli tovush bor?', ['5 ta', '6 ta', '7 ta', '8 ta'], 'B'],
        ['Qaysi qatorda faqat otlar berilgan?', ['Kitob, daftar, maktab', 'Chiroyli, katta, baland', 'Bormoq, kelmoq, yozmoq', 'Tez, sekin, bugun'], 'A'],
        ['Sifat qanday so‘roqlarga javob bo‘ladi?', ['Kim? nima?', 'Nima qildi?', 'Qanday? qanaqa?', 'Qachon?'], 'C'],
        ['Fe’l nimani bildiradi?', ['Predmet nomini', 'Harakat yoki holatni', 'Belgini', 'Miqdorni'], 'B'],
        ['Son so‘z turkumi nimani bildiradi?', ['Predmetning belgisini', 'Harakatni', 'Predmetning miqdori yoki tartibini', 'Joyni'], 'C'],
        ['Olmoshning asosiy xususiyati qaysi?', ['Ot, sifat, son o‘rnida qo‘llanadi', 'Faqat harakatni bildiradi', 'Faqat belgini bildiradi', 'Gap oxirida keladi'], 'A'],
        ['“O‘quvchilar kitob o‘qidilar” gapida ega qaysi?', ['Kitob', 'O‘qidilar', 'O‘quvchilar', 'Gapda ega yo‘q'], 'C'],
        ['“Bahorda gullar ochiladi” gapida kesim qaysi?', ['Bahorda', 'Gullar', 'Ochiladi', 'Bahorda gullar'], 'C'],
        ['Qaysi gap darak gap hisoblanadi?', ['Bugun darsga borasanmi?', 'Vatanimiz obod bo‘lsin!', 'Bugun havo iliq.', 'Kitobni o‘qi!'], 'C'],
        ['So‘roq gap oxiriga qaysi tinish belgisi qo‘yiladi?', ['Nuqta', 'Vergul', 'So‘roq belgisi', 'Ikki nuqta'], 'C'],
        ['Undalma qatnashgan gapni toping.', ['Aziz do‘stim, seni kutdim.', 'Men maktabga bordim.', 'Bugun yomg‘ir yog‘di.', 'U kitob o‘qidi.'], 'A'],
        ['Qaysi so‘z to‘g‘ri yozilgan?', ['ma’sul', 'mas’ul', 'masul', 'maʼsuliyat'], 'B'],
        ['“Gulzor” so‘zi qaysi usul bilan yasalgan?', ['Qo‘shimcha qo‘shish', 'So‘zlarni qo‘shish', 'Qisqartirish', 'Takrorlash'], 'A'],
        ['Sinonim so‘zlar qatorini toping.', ['Katta-kichik', 'Chiroyli-go‘zal', 'Oq-qora', 'Yoz-qish'], 'B'],
        ['Antonim so‘zlar qatorini toping.', ['Go‘zal-chiroyli', 'Vatan-yurt', 'Issiq-sovuq', 'Tez-chaqqon'], 'C'],
        ['“Maktabning bog‘i” birikmasida “maktabning” qanday bo‘lak?', ['Qaratqich aniqlovchi', 'Sifatlovchi aniqlovchi', 'To‘ldiruvchi', 'Hol'], 'A'],
        ['Ko‘plik qo‘shimchasi qaysi?', ['-chi', '-lik', '-lar', '-kor'], 'C'],
        ['Qaysi qatorda ravish berilgan?', ['Chiroyli', 'Bugun', 'Kitob', 'Yugurdi'], 'B'],
        ['“Men do‘stimga xat yozdim” gapida “do‘stimga” qanday bo‘lak?', ['Ega', 'Kesim', 'To‘ldiruvchi', 'Hol'], 'C'],
        ['Qo‘shma so‘zni toping.', ['Gul', 'Ota-ona', 'Kitob', 'Chiroyli'], 'B']
      ].map(([questionText, optionTexts, correctAnswer]) => ({
        questionText,
        options: optionTexts.map((text, index) => ({ key: String.fromCharCode(65 + index), text })),
        correctAnswer,
        difficulty: 'medium'
      }))
    },
    {
      subjectName: 'Informatika',
      title: '9-sinf olimpiadasi: Informatika',
      topic: 'Qurilmalar, xotira tashuvchilar va kompyuter tarmoqlari',
      description: '9-sinf Informatika Cambridge darsligi asosida 45 ta olimpiada savoli.',
      durationMinutes: 45,
      totalQuestions: 45,
      pointsPerQuestion: 1,
      passingPercentage: 60,
      difficulty: 'medium',
      questions: [
        ['Qaysi biri ma’lumot kiritish qurilmasi?', ['Printer', 'Skaner', 'Monitor', 'Zummer'], 'B'],
        ['Sensorli ekranda kursorni qaysi qurilma yordamida harakatlantirish mumkin?', ['Manipulyator', 'Klaviatura', 'Sensor panel', 'Printer'], 'C'],
        ['Tasvirlar va hujjatlarni raqamlashtirish uchun qaysi qurilma ishlatiladi?', ['Mikrofon', 'Monitor', 'Skaner', 'Printer'], 'C'],
        ['Qaysi kiritish qurilmasi inson tomonidan bevosita ma’lumot kiritishni talab qilmaydi?', ['Joystik', 'Shtrix-kod o‘qish qurilmasi', 'Klaviatura', 'Pult'], 'B'],
        ['Raqamli kameraning afzalliklaridan biri nima?', ['Suratni qog‘ozga chop etish', 'Suratni darhol ko‘rish va o‘chirish', 'Shtrix-kodni o‘qish', 'Videoni kompyuterga yuklash'], 'B'],
        ['Ma’lumotni chiqarish qurilmasini tanlang.', ['Klaviatura', 'Sichqoncha', 'Displey ekrani', 'Skaner'], 'C'],
        ['Kompyuterdan chop etish qaysi qurilma orqali amalga oshiriladi?', ['Monitor', 'Displey ekrani', 'Skaner', 'Printer'], 'D'],
        ['Kompyuterdan audio chiqarish uchun qaysi qurilma qo‘llaniladi?', ['Karnay', 'Skaner', 'Klaviatura', 'Printer'], 'A'],
        ['OMR nima?', ['Kompyuterdan chop etuvchi printer turi', 'Optik belgilarni o‘qish qurilmasi', 'Optik belgilarni skanerlash jarayoni', 'Magnit siyohni aniqlash jarayoni'], 'B'],
        ['Joystik qaysi sohada keng foydalaniladi?', ['O‘yinlar', 'Tibbiyot', 'Dasturlash', 'Matn kiritish'], 'A'],
        ['TFT monitoridan kichikroq va yengilroq monitor turi qaysi?', ['CRT', 'IPS/LCD', 'TFT', 'Purkagichli printer'], 'B'],
        ['Bosma belgilarni raqamli shaklga aylantirish uchun qaysi qurilma ishlatiladi?', ['Manipulyator', 'Klaviatura', 'Skaner', 'MICR'], 'C'],
        ['MICR texnologiyasi qaysi sohada qo‘llaniladi?', ['Bank ishi', 'O‘yinlar', 'Veb-sayt yaratish', 'Grafik dizayn'], 'A'],
        ['RFID nima uchun qo‘llaniladi?', ['Radiochastotani aniqlash', 'Kredit kartalarni o‘qish', 'Ma’lumotlarni qayta ishlash', 'Sensorli ekranlarni boshqarish'], 'A'],
        ['Chiqarish qurilmasi sifatida qaysi qurilmadan foydalaniladi?', ['Monitor', 'Klaviatura', 'Joystik', 'Sensor'], 'A'],
        ['Xotira qurilmasi nima?', ['Ma’lumotlarni saqlash va o‘qish qurilmasi', 'Ma’lumotlarni doimiy saqlaydigan optik disk', 'Magnitli ma’lumot yozish qurilmasi', 'Faqat RAM bilan bog‘liq qurilma'], 'A'],
        ['Magnitli ma’lumot tashuvchilar qanday ishlaydi?', ['Lazer bilan kuydirib yozadi', 'Magnit qutblanishini o‘zgartirish orqali saqlaydi', 'Optik chiziqlar bilan yozadi', 'Elektr energiyasini talab qiladi'], 'B'],
        ['Qaysi qurilma optik ma’lumot tashuvchi hisoblanadi?', ['USB fleshka', 'SD karta', 'CD-RW disk', 'Qattiq disk'], 'C'],
        ['Magnitli xotira qurilmasining kamchiligi nima?', ['Juda kichik hajmli', 'Ma’lumotlarga kirish tezligi past', 'Xavfsizlik darajasi past', 'Faqat bir marta yoziladi'], 'B'],
        ['Optik tashuvchilarda ma’lumotlar qanday saqlanadi?', ['Qattiq diskda magnitlangan holda', 'Lazer yordamida yaratilgan chuqurchalar orqali', 'Faqat RAM xotirada', 'USB ulagich orqali'], 'B'],
        ['Qattiq holatdagi tashuvchilarning afzalligi nima?', ['Harakatlanuvchi qismlarga ega', 'Juda tez kirish imkonini beradi', 'Katta ma’lumot saqlay olmaydi', 'Faqat elektr bilan ishlaydi'], 'B'],
        ['CD-RW disklar qanday tashuvchi?', ['Faqat o‘qiydi', 'Yozish va o‘chirish mumkin', 'Faqat bir marta yoziladi', 'Harakatlanuvchi qismlarga ega'], 'B'],
        ['Portativ qattiq disklardan foydalanishning afzalligi nima?', ['Faqat kompyuter ichida ishlatiladi', 'Tashqi quvvat manbaisiz ishlaydi', 'Faqat bir martalik yoziladi', 'Faqat internet orqali uzatadi'], 'B'],
        ['Magnit tasmali diskovodning afzalligi nima?', ['Ma’lumotlar ketma-ket saqlanadi', 'Darhol kirish mumkin', 'Internet talab qiladi', 'Faqat kichik fayllar saqlanadi'], 'A'],
        ['DVD-RW disklar qanday tashuvchi?', ['Faqat o‘qiydi', 'Bir martalik yozish imkoniyati', 'Ko‘p marta yozish va o‘chirish mumkin', 'Faqat musiqa uchun'], 'C'],
        ['Qaysi xotira portativ va mustahkam?', ['CD-ROM', 'DVD-RW', 'USB fleshka', 'Magnit tasma'], 'C'],
        ['Ma’lumotlarni ketma-ket saqlash qanday xususiyatga ega?', ['Tez kirish imkonini beradi', 'Xavfsiz saqlaydi', 'Har bir ma’lumotni ketma-ket o‘qishni talab qiladi', 'Katta hajmni boshqarishni osonlashtiradi'], 'C'],
        ['Qattiq holatdagi xotiraning asosiy kamchiligi nima?', ['Foydalanish qiyin', 'Qimmat va xizmat muddati qisqa', 'Ko‘p energiya talab qiladi', 'Faqat bitta kompyuterda ishlaydi'], 'B'],
        ['Dasturlar va operatsion tizimni saqlash uchun qaysi qurilma ishlatiladi?', ['Optik disk', 'Qattiq disk', 'SD karta', 'USB fleshka'], 'B'],
        ['Blu-ray disklari qanday maqsadda ishlatiladi?', ['Faqat zaxiralash uchun', 'Kichik fayllar uchun', 'Yuqori sifatli videolarni saqlash uchun', 'Faqat musiqa uchun'], 'C'],
        ['LAN tarmog‘i qayerlarda keng qo‘llaniladi?', ['Xalqaro korxonalarda', 'Shahar tarmoqlarida', 'Uy, maktab va ofislarda', 'Radiostansiyalarda'], 'C'],
        ['WAN tarmog‘i qanday hududlarni qamrab oladi?', ['Bitta binoni', 'Mahalliy joylarni', 'Katta geografik hududlarni', 'Faqat shaharlarni'], 'C'],
        ['Routerning vazifasi nima?', ['Fayllarni saqlash', 'Ma’lumotlarni eng yaxshi yo‘nalishda uzatish', 'Kompyuterlarni ta’mirlash', 'Signalni kuchaytirish'], 'B'],
        ['Wi-Fi texnologiyasining asosiy afzalligi nima?', ['Tezkor o‘rnatilishi', 'Faqat uyda ishlatilishi', 'Kabel orqali uzatish', 'Har qanday masofani qamrab olish'], 'A'],
        ['Bluetooth texnologiyasining o‘ziga xosligi nimada?', ['Uzoq masofada ishlaydi', 'Katta hajmdagi ma’lumot uzatadi', 'Qisqa masofada simsiz aloqa o‘rnatadi', 'Internet tezligini oshiradi'], 'C'],
        ['Modemning vazifasi nima?', ['Ma’lumotni raqamli signallarga aylantirish', 'Ma’lumotlarni analog shaklda qabul qilish va yuborish', 'Faqat lokal tarmoqni boshqarish', 'Faqat Wi-Fi orqali uzatish'], 'B'],
        ['Svichning asosiy funksiyasi nima?', ['Xabarlarni kerakli qurilmaga yo‘naltirish', 'Xabarlarni barcha qurilmalarga yuborish', 'Har bir qurilmaga signal uzatish', 'Ma’lumotlarni qayta ishlash'], 'A'],
        ['Kompyuter tarmoqlari xavfsizligi nima uchun zarur?', ['Internet tezligini oshirish uchun', 'Ruxsatsiz kirishni oldini olish uchun', 'Qurilmalar sonini ko‘paytirish uchun', 'Signalni kuchaytirish uchun'], 'B'],
        ['WLAN tarmog‘ining to‘g‘ri xususiyati qaysi?', ['Faqat kabel orqali ishlaydi', 'Qisqa masofada simsiz aloqa o‘rnatadi', 'Faqat ofislarda ishlatiladi', 'Faqat bitta kompyuterga ulanadi'], 'B'],
        ['Router ma’lumot paketini qanday saqlaydi?', ['Arxiv fayllarda', 'Yo‘nalish jadvallarida', 'Kompyuter xotirasida', 'Paketlarni serverga uzatadi'], 'B'],
        ['Tarmoq interfeysi kartasi nima?', ['Kompyuterni tarmoqqa ulash imkonini beruvchi qurilma', 'Ma’lumot saqlash qurilmasi', 'Internet tezligini oshiruvchi qurilma', 'Dasturlarni boshqaruvchi tizim'], 'A'],
        ['Intranet nima?', ['Mahalliy kompyuter tarmog‘i', 'Bitta kompaniya ichida ishlatiladigan tarmoq', 'Butun dunyo tarmog‘i', 'Simsiz tarmoq texnologiyasi'], 'B'],
        ['Modem qanday ishlaydi?', ['Raqamli signalni analog signalga o‘zgartiradi', 'Faqat tarmoq kartalari bilan ishlaydi', 'Wi-Fi signallarini uzatadi', 'Faqat LANni boshqaradi'], 'A'],
        ['Tarmoq xavfsizligini ta’minlash usuli qaysi?', ['Parol va shifrlash', 'Signalni kuchaytirish', 'Ko‘proq kompyuter qo‘shish', 'Faqat simli tarmoqdan foydalanish'], 'A'],
        ['Faks va elektron pochta o‘rtasidagi farqni ifodalovchi javobni tanlang.', ['Faks ma’lumotni nusxa ko‘rinishida uzatadi, elektron pochta esa raqamli xabar yuboradi', 'Faksda viruslar bo‘lmaydi', 'Elektron pochta qimmat', 'Elektron pochta faqat ichki tarmoqda ishlaydi'], 'A']
      ].map(([questionText, optionTexts, correctAnswer]) => ({
        questionText,
        options: optionTexts.map((text, index) => ({ key: String.fromCharCode(65 + index), text })),
        correctAnswer,
        difficulty: 'medium'
      }))
    }
  ];

  // 4. Create or Update Tests and Questions
  for (const t of testsToSync) {
    const subject = subjectsMap[t.subjectName];
    if (!subject) continue;

    let testDoc = await Test.findOne({ title: t.title, subjectId: subject._id });
    if (!testDoc) {
      testDoc = await Test.create({
        title: t.title,
        subjectId: subject._id,
        topic: t.topic,
        description: t.description,
        durationMinutes: t.durationMinutes,
        totalQuestions: t.totalQuestions,
        pointsPerQuestion: t.pointsPerQuestion,
        passingPercentage: t.passingPercentage,
        difficulty: t.difficulty,
        isActive: true,
        isAntiCheatEnabled: true,
        createdBy: admin._id
      });
      console.log(`📝 Yangi test yaratildi: ${t.title}`);
    } else {
      testDoc.topic = t.topic;
      testDoc.description = t.description;
      testDoc.durationMinutes = t.durationMinutes;
      testDoc.totalQuestions = t.totalQuestions;
      testDoc.passingPercentage = t.passingPercentage;
      testDoc.difficulty = t.difficulty;
      testDoc.isActive = true;
      await testDoc.save();
    }

    // Delete existing questions for this test and re-insert fresh
    await Question.deleteMany({ testId: testDoc._id });
    const formattedQuestions = t.questions.map((q) => ({
      testId: testDoc._id,
      subjectId: subject._id,
      questionText: q.questionText,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
      difficulty: q.difficulty || 'easy',
      points: 1
    }));
    await Question.insertMany(formattedQuestions);
    console.log(`✅ ${t.title}: ${formattedQuestions.length} ta savol yuklandi.`);
  }

  console.log('🎉 Sinxronizatsiya muvaffaqiyatli bajarildi!');
  process.exit(0);
};

sync();
