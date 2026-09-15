require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Subject = require('../models/Subject');
const Category = require('../models/Category');
const Test = require('../models/Test');
const Question = require('../models/Question');
const Result = require('../models/Result');
const Achievement = require('../models/Achievement');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/uz_quiz_bot');
    console.log(`[MongoDB] Connected for seeding: ${conn.connection.host}`);
  } catch (err) {
    console.error('[MongoDB Error]:', err.message);
    process.exit(1);
  }
};

const seed = async () => {
  await connectDB();

  if (process.env.RESET_DATABASE !== 'true') {
    console.log('⚠️ Seed bekor qilindi: mavjud ma’lumotlarni o‘chirmaslik uchun RESET_DATABASE=true belgilang.');
    await mongoose.disconnect();
    return;
  }

  console.log('🧹 Eski test ma’lumotlari tozalanmoqda...');
  await Promise.all([
    User.deleteMany({}),
    Subject.deleteMany({}),
    Category.deleteMany({}),
    Test.deleteMany({}),
    Question.deleteMany({}),
    Result.deleteMany({}),
    Achievement.deleteMany({})
  ]);

  console.log('👤 Admin hisobi yaratilmoqda...');
  const adminUser = await User.create({
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    firstName: process.env.ADMIN_FULLNAME || 'Asosiy Admin',
    lastName: '',
    role: 'admin',
    isBlocked: false
  });
  console.log(`✅ Admin yaratildi: ${adminUser.username} / ${process.env.ADMIN_PASSWORD || 'admin123'}`);

  console.log('📚 Fanlar va Kategoriyalar yaratilmoqda...');
  const subjectsData = [
    { name: 'O‘zbekiston', icon: '🇺🇿', description: 'Mustaqillik, Davlat ramzlari (Bayroq, Gerb, Madhiya), Konstitutsiya va O‘zbekiston qonunlari', order: 1 },
    { name: 'Informatika', icon: '💻', description: 'Kompyuter savodxonligi, Qurilmalar, Tarmoqlar va Kiberxavfsizlik asoslari', order: 2 },
    { name: 'Dasturlash', icon: '⚡', description: 'JavaScript, Python, Node.js va Web dasturlash testlari', order: 3 },
    { name: 'Matematika', icon: '📘', description: 'Algebra, Geometriya va Mantiqiy masalalar', order: 4 },
    { name: 'Ingliz tili', icon: '📗', description: 'Grammar, Vocabulary va IELTS darajasi testlari', order: 5 },
    { name: 'Ona tili', icon: '📙', description: 'O‘zbek tili grammatikasi va adabiyot testlari', order: 6 },
    { name: '11-sinf olimpiada', icon: '🏆', description: '11-sinf informatika, ma’lumotlar ombori va Delphi bo‘yicha olimpiada savollari', order: 7 },
    { name: '10-sinf olimpiada', icon: '🏆', description: '10-sinf Python va dasturlash asoslari bo‘yicha olimpiada savollari', order: 8 }
  ];

  const createdSubjects = await Subject.insertMany(subjectsData);
  const uzSubject = createdSubjects.find((s) => s.name === 'O‘zbekiston');
  const infoSubject = createdSubjects.find((s) => s.name === 'Informatika');
  const progSubject = createdSubjects.find((s) => s.name === 'Dasturlash');
  const mathSubject = createdSubjects.find((s) => s.name === 'Matematika');
  const engSubject = createdSubjects.find((s) => s.name === 'Ingliz tili');
  const nativeLanguageSubject = createdSubjects.find((s) => s.name === 'Ona tili');
  const olympiadSubject = createdSubjects.find((s) => s.name === '11-sinf olimpiada');
  const tenthGradeSubject = createdSubjects.find((s) => s.name === '10-sinf olimpiada');

  console.log('📝 Testlar yaratilmoqda...');
  
  // 1. O'ZBEKISTON TESTS
  const uzSymbolsTest = await Test.create({
    title: 'O‘zbekiston: Mustaqillik va Davlat Ramzlari',
    subjectId: uzSubject._id,
    topic: 'Mustaqillik, Bayroq, Gerb, Madhiya va Milliy Qadriyatlar',
    description: 'O‘zbekiston davlat mustaqilligi, ramzlari va muhim tarixiy sanalar bo‘yicha keng qamrovli test.',
    durationMinutes: 12,
    totalQuestions: 10,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'easy',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const uzConstitutionTest = await Test.create({
    title: 'O‘zbekiston Konstitutsiyasi va Qonunlari',
    subjectId: uzSubject._id,
    topic: 'Konstitutsiya, Huquqiy asoslar va Davlat boshqaruvi',
    description: 'Yangi tahrirdagi Konstitutsiya, inson huquqlari, Oliy Majlis va O‘zbekiston qonunchiligi bo‘yicha test.',
    durationMinutes: 15,
    totalQuestions: 10,
    pointsPerQuestion: 1,
    passingPercentage: 70,
    difficulty: 'medium',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  // 2. INFORMATIKA TESTS
  const infoBasicsTest = await Test.create({
    title: 'Informatika: Kompyuter Savodxonligi va Qurilmalar',
    subjectId: infoSubject._id,
    topic: 'Protsessor, Xotiralar, Kirish-Chiqish va Dasturiy ta’minot',
    description: 'Kompyuter tuzilishi, o‘lchov birliklari va Windows operatsion tizimi asoslari.',
    durationMinutes: 10,
    totalQuestions: 10,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'easy',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const infoNetworksTest = await Test.create({
    title: 'Informatika: Tarmoqlar, Internet va Kiberxavfsizlik',
    subjectId: infoSubject._id,
    topic: 'Internet, IP/DNS protokollari va Axborot xavfsizligi',
    description: 'Kompyuter tarmoqlari, brauzerlar, kiberxavfsizlik va viruslardan himoyalanish testlari.',
    durationMinutes: 12,
    totalQuestions: 8,
    pointsPerQuestion: 1,
    passingPercentage: 65,
    difficulty: 'medium',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  // 3. DASTURLASH TESTS
  const jsTest = await Test.create({
    title: 'JavaScript Basic Test',
    subjectId: progSubject._id,
    topic: 'O‘zgaruvchilar, Funksiyalar va DOM',
    description: 'JavaScript tilining asosiy sintaksisi va tushunchalari bo‘yicha savollar.',
    durationMinutes: 10,
    totalQuestions: 6,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'easy',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const pythonTest = await Test.create({
    title: 'Python Asoslari Testi',
    subjectId: progSubject._id,
    topic: 'Ma’lumot turlari, Sikllar va Funksiyalar',
    description: 'Python dasturlash tili boshlang‘ich daraja testi.',
    durationMinutes: 12,
    totalQuestions: 3,
    pointsPerQuestion: 1,
    passingPercentage: 70,
    difficulty: 'medium',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  // 4. MATEMATIKA & INGLIZ TILI TESTS
  const mathTest = await Test.create({
    title: 'Matematika: Mantiq va Hisoblash',
    subjectId: mathSubject._id,
    topic: 'Tenglamalar va Foizlar',
    description: 'Algebraik amallar va mantiqiy fikrlash sinovi.',
    durationMinutes: 15,
    totalQuestions: 2,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'medium',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const engTest = await Test.create({
    title: 'English Grammar (Pre-Intermediate)',
    subjectId: engSubject._id,
    topic: 'Tenses & Modal Verbs',
    description: 'Ingliz tili zamonlari va grammatik qoidalari.',
    durationMinutes: 10,
    totalQuestions: 2,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'easy',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const nativeLanguageTest = await Test.create({
    title: 'Ona tili: Grammatika va imlo',
    subjectId: nativeLanguageSubject._id,
    topic: 'So‘z turkumlari, gap bo‘laklari va imlo qoidalari',
    description: 'O‘zbek tili grammatikasi va imlo qoidalari bo‘yicha 20 ta savol.',
    durationMinutes: 20,
    totalQuestions: 20,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'medium',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const olympiadTest = await Test.create({
    title: '11-sinf olimpiada: Informatika va dasturlash',
    subjectId: olympiadSubject._id,
    topic: 'MOBT, MS Access, obyektga yo‘naltirilgan dasturlash va Delphi',
    description: '11-sinf o‘quvchilari uchun informatika va dasturlash bo‘yicha olimpiada testi.',
    durationMinutes: 40,
    totalQuestions: 40,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'medium',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const tenthGradeTest = await Test.create({
    title: '10-sinf olimpiada: Python va dasturlash asoslari',
    subjectId: tenthGradeSubject._id,
    topic: 'Axborot, Python, algoritmlar va dasturlash asoslari',
    description: '10-sinf o‘quvchilari uchun Python va dasturlash asoslari bo‘yicha olimpiada testi.',
    durationMinutes: 40,
    totalQuestions: 40,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'medium',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const tenthGradeQuestions = [
    ['Axborotlar qanday shakllarda uzatilishi mumkin?', ['Matnli, raqamli', 'Ovozli, grafik', 'Matnli, raqamli, ovozli va grafik', 'To‘g‘ri javob yo‘q'], 'C'],
    ['Ma’lumotlar turi bu - ... .', ['O‘zgaruvchi yoki doimiy qiymatlardagi ma’lumotlar shakli', 'Kompyuterda berilgan ma’lumotlar', 'Dasturlash tili haqida beriladigan ma’lumotlar', 'To‘g‘ri javob yo‘q'], 'A'],
    ['O‘zgaruvchi qabul qilgan qiymat turini qaysi funksiya yordamida aniqlash mumkin?', ['input()', 'type()', 'str()', 'len()'], 'B'],
    ['`//` ushbu arifmetik amalning nomi nima?', ['Bo‘lish', 'Bo‘linmaning qoldig‘ini hisoblash', 'Bo‘linmaning butun qiymatini hisoblash', 'Darajaga oshirish'], 'C'],
    ['Satr nima?', ['So‘zlar ketma-ketligi', 'Harf, son, belgi va probeldan tarkib topgan belgilar ketma-ketligi', 'Faqat harflar to‘plami', 'To‘g‘ri javob yo‘q'], 'B'],
    ['Satr uzunligini qaysi funksiya yordamida aniqlash mumkin?', ['len()', 'print()', 'input()', 'type()'], 'A'],
    ['Satrlarni birlashtirish uchun qaysi amal qo‘llaniladi?', ['+', '-', '/', '*'], 'A'],
    ['Pythonda satrdagi belgilarni raqamlash nechchidan boshlanadi?', ['1 dan', '0 dan', '2 dan', '-1 dan'], 'B'],
    ['print() qanday vazifa bajaradi?', ['Satr uzunligini aniqlaydi', 'Satrlarni birlashtiradi', 'Ma’lumotlarni ekranga chiqaradi', 'Ma’lumotlarni kiritadi'], 'C'],
    ['end va sep print parametrlari nima uchun qo‘llaniladi?', ['Ma’lumotlarni chiqarish parametrlarini o‘zgartirish uchun', 'Python dasturiga ma’lumotlarni yozish uchun', 'O‘zgaruvchini o‘chirish uchun', 'To‘g‘ri javob yo‘q'], 'A'],
    ['Dasturlash jarayonida asosan necha xil algoritmdan foydalaniladi?', ['2 xil', '3 xil', '5 xil', '4 xil'], 'B'],
    ['Buyruqlarning qat’iy ketma-ketlikda tartib bilan bajarilishi nima deb ataladi?', ['Algoritm', 'Dasturlash jarayoni', 'Chiziqli algoritm', 'Tarmoqlanuvchi algoritm'], 'C'],
    ['Chiziqli algoritmlarning dastur shaklida yozilishiga nima deyiladi?', ['Chiziqli dastur', 'Chiziqli algoritm', 'Sikl', 'To‘g‘ri javob yo‘q'], 'A'],
    ['Amallarning qat’iy ketma-ketlikda bajarilishi nima deb ataladi?', ['Chiziqli dastur', 'Chiziqli ijro', 'Tarmoqlanuvchi algoritm', 'Chiziqli algoritm'], 'D'],
    ['O‘zgaruvchilarni taqqoslash uchun qanday amallardan foydalaniladi?', ['Sodda amallardan', 'Mantiqiy amallardan', 'Arifmetik amallardan', 'To‘g‘ri javob yo‘q'], 'B'],
    ['Taqqoslash amallariga qaysi amallar kiradi?', ['<, >, ==, !=', '<, =, +, -', '>, +, =', '+, -, *, /'], 'A'],
    ['Biror shartga ko‘ra buyruqlar ketma-ketligining bajarilishi yoki bajarilmasligini belgilovchi algoritm nima deb ataladi?', ['Dasturlash algoritmi', 'Tekshiruvchi algoritm', 'Tarmoqlanuvchi algoritm', 'Chiziqli algoritm'], 'C'],
    ['if operatori tarkibidagi shart True qiymat qaytarsa, buyruqlar bloki bajariladimi?', ['Yo‘q', 'Ha', 'Faqat False bo‘lsa', 'Bajarilmaydi'], 'B'],
    ['Buyruqlar bloki if operatoridan keyingi satrda xat boshidan nechta probel qoldirib yoziladi?', ['4 ta', '8 ta', '2 ta', 'Probel qoldirmay'], 'A'],
    ['Shartni tekshirish uchun qaysi operatordan foydalaniladi?', ['print()', 'if', 'for', 'while'], 'B'],
    ['Shartdan kelib chiqib, mos buyruqlar ketma-ketligini bajaradigan ifning takomillashgan ko‘rinishi qaysi?', ['elif operatori', 'if operatori', 'case operatori', 'for operatori'], 'A'],
    ['elif so‘zi qanday ma’noni anglatadi?', ['Aks holda agar', 'Rost va yolg‘on', 'Takrorlash', 'To‘g‘ri javob yo‘q'], 'A'],
    ['Murakkab shartli ifodalarni yozish uchun nimalardan foydalaniladi?', ['Operatorlardan', 'Mantiqiy amallardan', 'Taqqoslash amallaridan', 'Barcha javoblar to‘g‘ri'], 'D'],
    ['`==` belgisi qanday nomlanadi?', ['Teng emas', 'Katta yoki teng', 'Aynan teng', 'Qiymat berish'], 'C'],
    ['`\t` belgisining nomi nima?', ['Tabulyatsiya belgisi', 'Yangi satrga o‘tish belgisi', 'Bittalik qo‘shtirnoq belgisi', 'Bo‘sh joy belgisi'], 'A'],
    ['Chiziqli tuzilishga ega algoritm blok-sxemasi asosan nimalar yordamida tuziladi?', ['Algoritmni boshlash va tugatish bloki', 'Kiritish/chiqarish va funksional bloklar', 'Ulanish chiziqlari', 'Barcha javoblar to‘g‘ri'], 'D'],
    ['Bir chiziq bo‘ylab joylashgan, ketma-ket bajariladigan ko‘rsatmalar to‘plami ko‘rinishidagi algoritm nima?', ['Chiziqli algoritm', 'Chiziqli tuzilish', 'Tarmoqlanuvchi algoritm', 'To‘g‘ri javob yo‘q'], 'A'],
    ['Hozirgi kunda keng tarqalgan dasturlash tillari qaysi qatorda berilgan?', ['Pascal, Delphi, C, C++', 'Java, Python', 'JavaScript, Python, C++', 'Barcha javoblar to‘g‘ri'], 'D'],
    ['Tarmoqlanuvchi struktura odatda qandaydir mantiqiy shartni nimani o‘z ichiga oladi?', ['Tekshirish blokini', 'Tarmoqlanuvchi tuzilishni', 'Kiritish blokini', 'To‘g‘ri javob yo‘q'], 'A'],
    ['Parametrning har xil qiymatlari asosida algoritmda takrorlanish yuz beradigan jarayonlarga nima deyiladi?', ['Tarmoqlanuvchi algoritm', 'Takrorlanuvchi algoritm', 'Tekshiriluvchi algoritm', 'Chiziqli algoritm'], 'B'],
    ['Hisoblash jarayonining ko‘p marta takrorlanadigan qismi nima deb yuritiladi?', ['SUMM', 'PRODUCT', 'Sikl tanasi', 'Ichki sikl tanasi'], 'C'],
    ['Tarkibida bir necha turdagi algoritmlar qatnashgan algoritmga nima deyiladi?', ['Aralash algoritm', 'Tarmoqlanuvchi algoritm', 'Tekshiruvchi algoritm', 'Chiziqli algoritm'], 'A'],
    ['Kompyuter uchun dastur tuzish jarayoni nima deyiladi?', ['Kompyuter dasturi', 'Dasturlash', 'Dasturchi', 'Algoritm'], 'B'],
    ['Kompyuterda biror masalani hal qilish uchun eng avvalo nima qilinadi?', ['Kompyuterga yoziladi', 'Dastur tuziladi', 'Modeli va algoritmi tuziladi', 'Natija chiqariladi'], 'C'],
    ['Yaratilgan matn kompyuter tilida nima deb ataladi?', ['Yozilgan dastur', 'Tuzilgan dastur', 'Algoritm', 'Kodlovchi'], 'A'],
    ['Dastur tuzuvchi shaxs nima deb yuritiladi?', ['Dasturchi', 'Foydalanuvchi', 'Operator', 'To‘g‘ri javob yo‘q'], 'A'],
    ['Kir yuvish mashinasi ham dasturlash asosida ishlaydimi?', ['Yo‘q', 'Ha', 'Faqat mexanik rejimda', 'To‘g‘ri javob yo‘q'], 'B'],
    ['Kompyuter tushunadigan va muloqot olib boradigan “til” nima deb ataladi?', ['Dastur', 'Dasturlash tili', 'Dasturlash algoritmi', 'Ma’lumotlar turi'], 'B'],
    ['Translyator nima?', ['Dastur turi', 'Dasturchi nomi', 'Kompyuter qurilmasi', 'Dastur kodini tarjima qiluvchi vosita'], 'D'],
    ['IDE so‘zining to‘liq nomi nima?', ['Integrated Development Environment', 'Integrated Development', 'Internet Development Editor', 'To‘g‘ri javob yo‘q'], 'A']
  ].map(([questionText, optionTexts, correctAnswer]) => ({
    testId: tenthGradeTest._id,
    subjectId: tenthGradeSubject._id,
    questionText,
    options: optionTexts.map((text, index) => ({
      key: String.fromCharCode(65 + index),
      text
    })),
    correctAnswer,
    difficulty: 'medium',
    points: 1
  }));

  const nativeLanguageQuestions = [
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
    testId: nativeLanguageTest._id,
    subjectId: nativeLanguageSubject._id,
    questionText,
    options: optionTexts.map((text, index) => ({ key: String.fromCharCode(65 + index), text })),
    correctAnswer,
    difficulty: 'medium',
    points: 1
  }));

  console.log('❓ Savollar bazasi to‘ldirilmoqda...');
  const questionsData = [
    // ==========================================
    // 🇺🇿 O‘ZBEKISTON: MUSTAQILLIK VA RAMZLAR
    // ==========================================
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasi Davlat mustaqilligi rasman qachon e’lon qilingan?',
      options: [
        { key: 'A', text: '1991-yil 31-avgust' },
        { key: 'B', text: '1991-yil 1-sentabr' },
        { key: 'C', text: '1992-yil 8-dekabr' },
        { key: 'D', text: '1990-yil 20-iyun' }
      ],
      correctAnswer: 'A',
      explanation: 'O‘zbekiston mustaqilligi 1991-yil 31-avgustda e’lon qilingan, 1-sentabr esa Mustaqillik bayrami kuni sifatida nishonlanadi.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasining Davlat bayrog‘i qachon qabul qilingan?',
      options: [
        { key: 'A', text: '1991-yil 18-noyabr' },
        { key: 'B', text: '1992-yil 2-iyul' },
        { key: 'C', text: '1991-yil 31-avgust' },
        { key: 'D', text: '1992-yil 10-dekabr' }
      ],
      correctAnswer: 'A',
      explanation: '"O‘zbekiston Respublikasining Davlat bayrog‘i to‘g‘risida"gi Qonun 1991-yil 18-noyabrda qabul qilingan.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasining Davlat gerbi qachon qabul qilingan?',
      options: [
        { key: 'A', text: '1991-yil 18-noyabr' },
        { key: 'B', text: '1992-yil 2-iyul' },
        { key: 'C', text: '1992-yil 8-dekabr' },
        { key: 'D', text: '1993-yil 9-aprel' }
      ],
      correctAnswer: 'B',
      explanation: '"O‘zbekiston Respublikasining Davlat gerbi to‘g‘risida"gi Qonun 1992-yil 2-iyulda qabul qilingan.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasining Davlat madhiyasi to‘g‘risidagi qonun qachon qabul qilingan?',
      options: [
        { key: 'A', text: '1992-yil 10-dekabr' },
        { key: 'B', text: '1991-yil 18-noyabr' },
        { key: 'C', text: '1992-yil 2-iyul' },
        { key: 'D', text: '1993-yil 1-yanvar' }
      ],
      correctAnswer: 'A',
      explanation: 'O‘zbekiston Respublikasi Davlat madhiyasi 1992-yil 10-dekabrda qabul qilingan.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasi Davlat madhiyasining musiqasi va she’ri mualliflari kimlar?',
      options: [
        { key: 'A', text: 'Musiqa: Mutal Burhonov, She’r: Abdulla Oripov' },
        { key: 'B', text: 'Musiqa: Yunus Rajabiy, She’r: Erkin Vohidov' },
        { key: 'C', text: 'Musiqa: To‘xtasin Jalilov, She’r: G‘afur G‘ulom' },
        { key: 'D', text: 'Musiqa: Doni Zokirov, She’r: Hamid Olimjon' }
      ],
      correctAnswer: 'A',
      explanation: 'Madhiya musiqasini Mutal Burhonov bastalagan, she’rini esa O‘zbekiston Qahramoni Abdulla Oripov yozgan.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'Davlat bayrog‘idagi 12 ta yulduz nimani anglatadi?',
      options: [
        { key: 'A', text: '12 ta viloyatni' },
        { key: 'B', text: 'O‘zbekiston xalqining qadimgi madaniyati, 12 oy va komillik ramzini' },
        { key: 'C', text: '12 ta vazirlikni' },
        { key: 'D', text: '12 nafar buyuk allomani' }
      ],
      correctAnswer: 'B',
      explanation: '12 yulduz qadimiy ajdodlarimiz taqvimi, 12 oy hamda mukammallik va go‘zallik ramzini bildiradi.',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasi Davlat gerbida qaysi afsonaviy qush tasvirlangan va u nimaning ramzi?',
      options: [
        { key: 'A', text: 'Semurg‘ — boylik va savdo' },
        { key: 'B', text: 'Humo qushi — baxt va erksevarlik ramzi' },
        { key: 'C', text: 'Lochin — kuch va shijoat' },
        { key: 'D', text: 'Burgut — mardlik va jasorat' }
      ],
      correctAnswer: 'B',
      explanation: 'Gerbimiz markazida qanotlarini yozgan afsonaviy Humo qushi — baxt va erksevarlik ramzi sifatida gavdalangan.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbek tiliga Davlat tili maqomi qachon berilgan?',
      options: [
        { key: 'A', text: '1989-yil 21-oktabr' },
        { key: 'B', text: '1991-yil 1-sentabr' },
        { key: 'C', text: '1992-yil 8-dekabr' },
        { key: 'D', text: '1990-yil 1-oktabr' }
      ],
      correctAnswer: 'A',
      explanation: '"Davlat tili haqida"gi tarixiy qonun 1989-yil 21-oktabrda qabul qilingan.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekistonning milliy valyutasi — "So‘m" qachon muomalaga kiritilgan?',
      options: [
        { key: 'A', text: '1994-yil 1-iyul' },
        { key: 'B', text: '1991-yil 1-sentabr' },
        { key: 'C', text: '1992-yil 1-yanvar' },
        { key: 'D', text: '1995-yil 1-yanvar' }
      ],
      correctAnswer: 'A',
      explanation: 'O‘zbekiston Respublikasining milliy valyutasi "So‘m" 1994-yil 1-iyuldan boshlab to‘laqonli muomalaga kiritilgan.',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: uzSymbolsTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasi Birlashgan Millatlar Tashkilotiga (BMT) qachon a’zo bo‘lgan?',
      options: [
        { key: 'A', text: '1992-yil 2-mart' },
        { key: 'B', text: '1991-yil 31-avgust' },
        { key: 'C', text: '1993-yil 5-may' },
        { key: 'D', text: '1994-yil 10-sentabr' }
      ],
      correctAnswer: 'A',
      explanation: 'O‘zbekiston 1992-yil 2-martda xalqaro hamjamiyatning teng huquqli a’zosi sifatida BMTga qabul qilingan.',
      difficulty: 'medium',
      points: 1
    },

    // ==========================================
    // 🇺🇿 O‘ZBEKISTON: KONSTITUTSIYA VA QONUNLAR
    // ==========================================
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasining ilk Konstitutsiyasi qachon qabul qilingan?',
      options: [
        { key: 'A', text: '1992-yil 8-dekabr' },
        { key: 'B', text: '1991-yil 1-sentabr' },
        { key: 'C', text: '1993-yil 1-yanvar' },
        { key: 'D', text: '1990-yil 20-iyun' }
      ],
      correctAnswer: 'A',
      explanation: 'O‘zbekiston Respublikasining ilk Konstitutsiyasi 1992-yil 8-dekabrda XII chaqiriq Oliy Kengashning 11-sessiyasida qabul qilingan.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'Yangi tahrirdagi O‘zbekiston Respublikasi Konstitutsiyasi umumxalq referendumi orqali qachon qabul qilindi?',
      options: [
        { key: 'A', text: '2023-yil 30-aprel' },
        { key: 'B', text: '2022-yil 8-dekabr' },
        { key: 'C', text: '2021-yil 24-oktabr' },
        { key: 'D', text: '2024-yil 1-yanvar' }
      ],
      correctAnswer: 'A',
      explanation: 'Yangi tahrirdagi Konstitutsiya 2023-yil 30-aprelda o‘tkazilgan umumxalq referendumi asosida qabul qilingan va 1-maydan kuchga kirgan.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'Yangi Konstitutsiyaning 1-moddasiga ko‘ra, O‘zbekiston qanday davlat deb e’lon qilingan?',
      options: [
        { key: 'A', text: 'Suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlat' },
        { key: 'B', text: 'Faqatgina federativ va diniy davlat' },
        { key: 'C', text: 'Monarxiya va konfederativ respublika' },
        { key: 'D', text: 'Parlamentar totalitar davlat' }
      ],
      correctAnswer: 'A',
      explanation: 'Konstitutsiya 1-moddasi: "O‘zbekiston — boshqaruvning respublika shakliga ega bo‘lgan suveren, demokratik, huquqiy, ijtimoiy va dunyoviy davlatdir".',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'Konstitutsiyaga ko‘ra, davlat hokimiyatining birdan-bir manbai kim?',
      options: [
        { key: 'A', text: 'O‘zbekiston xalqi' },
        { key: 'B', text: 'Vazirlar Mahkamasi' },
        { key: 'C', text: 'Sud hokimiyati' },
        { key: 'D', text: 'Siyosiy partiyalar' }
      ],
      correctAnswer: 'A',
      explanation: 'O‘zbekiston Respublikasi Konstitutsiyasiga muvofiq, xalq davlat hokimiyatining birdan-bir manbaidir.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasida oliy davlat vakillik organi va qonun chiqaruvchi hokimiyat qaysi?',
      options: [
        { key: 'A', text: 'Oliy Majlis (Qonunchilik palatasi va Senat)' },
        { key: 'B', text: 'Vazirlar Mahkamasi' },
        { key: 'C', text: 'Konstitutsiyaviy Sud' },
        { key: 'D', text: 'Bosh prokuratura' }
      ],
      correctAnswer: 'A',
      explanation: 'O‘zbekiston Respublikasi Oliy Majlisi oliy davlat vakillik organi bo‘lib, qonun chiqaruvchi hokimiyatni amalga oshiradi.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasida ijro etuvchi hokimiyatni qaysi organ amalga oshiradi?',
      options: [
        { key: 'A', text: 'O‘zbekiston Respublikasi Vazirlar Mahkamasi' },
        { key: 'B', text: 'Oliy Majlis Senati' },
        { key: 'C', text: 'Oliy Sud' },
        { key: 'D', text: 'Markaziy Saylov Komissiyasi' }
      ],
      correctAnswer: 'A',
      explanation: 'O‘zbekiston Respublikasi Vazirlar Mahkamasi (Hukumat) ijro etuvchi hokimiyatni amalga oshiruvchi oliy organdir.',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'Yangi Konstitutsiyaga asosan O‘zbekiston Respublikasi Prezidenti necha yil muddatga saylanadi?',
      options: [
        { key: 'A', text: '7 yil' },
        { key: 'B', text: '5 yil' },
        { key: 'C', text: '4 yil' },
        { key: 'D', text: '6 yil' }
      ],
      correctAnswer: 'A',
      explanation: 'Yangi tahrirdagi Konstitutsiyaga binoan O‘zbekiston Respublikasi Prezidenti 7 yil muddatga saylanadi.',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasida fuqarolar necha yoshdan boshlab saylov huquqiga ega bo‘ladilar?',
      options: [
        { key: 'A', text: '18 yoshdan' },
        { key: 'B', text: '16 yoshdan' },
        { key: 'C', text: '21 yoshdan' },
        { key: 'D', text: '25 yoshdan' }
      ],
      correctAnswer: 'A',
      explanation: '18 yoshga to‘lgan O‘zbekiston Respublikasi fuqarolari saylash huquqiga egadirlar.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'Inson huquqlari va erkinliklarining kafolatlari bo‘yicha O‘zbekistonda o‘lim jazosi qanday maqomda?',
      options: [
        { key: 'A', text: 'O‘zbekiston Respublikasida o‘lim jazosi butunlay taqiqlangan' },
        { key: 'B', text: 'Faqat og‘ir jinoyatlarda qo‘llaniladi' },
        { key: 'C', text: 'Vaqtincha to‘xtatilgan' },
        { key: 'D', text: 'Harbiy holatda qo‘llaniladi' }
      ],
      correctAnswer: 'A',
      explanation: 'Yangi Konstitutsiya 25-moddasiga ko‘ra, O‘zbekiston Respublikasida o‘lim jazosi qat’iyan taqiqlangan.',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: uzConstitutionTest._id,
      subjectId: uzSubject._id,
      questionText: 'O‘zbekiston Respublikasida sud hokimiyatining mustaqilligi qanday kafolatlanadi?',
      options: [
        { key: 'A', text: 'Sud hokimiyati qonun chiqaruvchi va ijro etuvchi hokimiyatlardan, siyosiy partiyalardan mustaqil ish yuritadi' },
        { key: 'B', text: 'Sud hokimiyati shahar hokimiyatiga hisobot beradi' },
        { key: 'C', text: 'Sudlar faoliyatini jamoat tashkilotlari nazorat qiladi' },
        { key: 'D', text: 'Sudlar qonun chiqaruvchi organga bo‘ysunadi' }
      ],
      correctAnswer: 'A',
      explanation: 'Sud hokimiyati boshqa hokimiyat tarmoqlaridan to‘liq mustaqil bo‘lib, faqat Konstitutsiya va qonunlarga bo‘ysunadi.',
      difficulty: 'medium',
      points: 1
    },

    // ==========================================
    // 💻 INFORMATIKA: SAVODXONLIK VA QURILMALAR
    // ==========================================
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: 'Kompyuterning asosiy hisoblash va mantiqiy amallarini bajaruvchi "miyasi" qaysi qurilma?',
      options: [
        { key: 'A', text: 'Protsessor (CPU)' },
        { key: 'B', text: 'Qattiq disk (HDD)' },
        { key: 'C', text: 'Tezkor xotira (RAM)' },
        { key: 'D', text: 'Ona plata (Motherboard)' }
      ],
      correctAnswer: 'A',
      explanation: 'Markaziy protsessor (CPU) — barcha hisob-kitoblar va buyruqlarni qayta ishlovchi asosiy mikrosxemadir.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: 'Kompyuter o‘chirilganda undagi barcha ma’lumotlar o‘chib ketadigan tezkor xotira turi qaysi?',
      options: [
        { key: 'A', text: 'RAM (Operativ xotira)' },
        { key: 'B', text: 'ROM (Doimiy xotira)' },
        { key: 'C', text: 'SSD flesh xotira' },
        { key: 'D', text: 'HDD magnit diski' }
      ],
      correctAnswer: 'A',
      explanation: 'RAM (Random Access Memory) bu energiya ta’minotiga bog‘liq vaqtinchalik tezkor xotira hisoblanadi.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: 'Axborotning eng kichik o‘lchov birligi nima deb ataladi?',
      options: [
        { key: 'A', text: 'Bit' },
        { key: 'B', text: 'Bayt' },
        { key: 'C', text: 'Kilobayt' },
        { key: 'D', text: 'Piksel' }
      ],
      correctAnswer: 'A',
      explanation: 'Bit (binary digit) — axborotning eng kichik birligi bo‘lib, faqat 0 yoki 1 qiymatini qabul qiladi.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: '1 Bayt necha bitga teng?',
      options: [
        { key: 'A', text: '8 bit' },
        { key: 'B', text: '16 bit' },
        { key: 'C', text: '4 bit' },
        { key: 'D', text: '1024 bit' }
      ],
      correctAnswer: 'A',
      explanation: '1 Bayt = 8 bit.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: '1 Gigabayt (GB) necha Megabayt (MB) ga teng?',
      options: [
        { key: 'A', text: '1024 MB' },
        { key: 'B', text: '1000 MB' },
        { key: 'C', text: '100 MB' },
        { key: 'D', text: '1048576 MB' }
      ],
      correctAnswer: 'A',
      explanation: 'Informatikada ikkilik tizim bo‘yicha 1 GB = 1024 MB (2^10 MB) bo‘ladi.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: 'Quyidagilardan qaysi biri axborotni kiritish qurilmasi hisoblanadi?',
      options: [
        { key: 'A', text: 'Klaviatura va Skaner' },
        { key: 'B', text: 'Monitor' },
        { key: 'C', text: 'Printer' },
        { key: 'D', text: 'Karnay (Kolonka)' }
      ],
      correctAnswer: 'A',
      explanation: 'Klaviatura, sichqoncha va skaner axborotni kompyuterga kiritish qurilmalaridir.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: 'Windows tizimida belgilangan fayl yoki matndan nusxa olish (Copy) uchun qaysi klavishlar birikmasi ishlatiladi?',
      options: [
        { key: 'A', text: 'Ctrl + C' },
        { key: 'B', text: 'Ctrl + V' },
        { key: 'C', text: 'Ctrl + X' },
        { key: 'D', text: 'Ctrl + Z' }
      ],
      correctAnswer: 'A',
      explanation: 'Ctrl + C — nusxa olish (Copy), Ctrl + V esa joylashtirish (Paste) vazifasini bajaradi.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: 'Kompyuter apparat qismlari va dasturlarni boshqaruvchi asosiy tizimli dasturiy ta’minot nima?',
      options: [
        { key: 'A', text: 'Operatsion tizim' },
        { key: 'B', text: 'Matn muharriri' },
        { key: 'C', text: 'Grafik dastur' },
        { key: 'D', text: 'Elektron jadval' }
      ],
      correctAnswer: 'A',
      explanation: 'Operatsion tizim (Windows, Linux, macOS) — butun kompyuter resurslarini boshqaruvchi asosiy tizimli dasturdir.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: 'Quyidagilardan qaysi biri operatsion tizim hisoblanmaydi?',
      options: [
        { key: 'A', text: 'Microsoft Word' },
        { key: 'B', text: 'Windows 11' },
        { key: 'C', text: 'Ubuntu Linux' },
        { key: 'D', text: 'macOS' }
      ],
      correctAnswer: 'A',
      explanation: 'Microsoft Word bu matn terish uchun mo‘ljallangan amaliy dasturdir, operatsion tizim emas.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoBasicsTest._id,
      subjectId: infoSubject._id,
      questionText: 'Qattiq disk (HDD) va SSD xotiralarning asosiy farqi nimada?',
      options: [
        { key: 'A', text: 'SSD elektron mikrosxemalarda ishlaydi va HDDga nisbatan ancha tezroq' },
        { key: 'B', text: 'HDD faqat internetda ishlaydi' },
        { key: 'C', text: 'SSD kompyuter o‘chsa ma’lumotni o‘chiradi' },
        { key: 'D', text: 'Hech qanday farqi yo‘q' }
      ],
      correctAnswer: 'A',
      explanation: 'SSD flesh-xotira asosida ishlaydi, mexanik aylanuvchi disklarga ega emas va HDDdan bir necha barobar tezroq ishlaydi.',
      difficulty: 'medium',
      points: 1
    },

    // ==========================================
    // 🌐 INFORMATIKA: TARMOQLAR VA KIBERXAVFSIZLIK
    // ==========================================
    {
      testId: infoNetworksTest._id,
      subjectId: infoSubject._id,
      questionText: 'Internet tarmog‘iga ulangan har bir qurilmaning unikal raqamli manzili nima deyiladi?',
      options: [
        { key: 'A', text: 'IP manzil (IP address)' },
        { key: 'B', text: 'URL manzil' },
        { key: 'C', text: 'HTML kod' },
        { key: 'D', text: 'SMS kod' }
      ],
      correctAnswer: 'A',
      explanation: 'IP manzil — tarmoqdagi qurilmalarni bir-biridan farqlovchi va ularga murojaat qilish imkonini beruvchi unikal manzildir.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoNetworksTest._id,
      subjectId: infoSubject._id,
      questionText: 'Domen nomlarini (masalan: kun.uz) mos IP manzilga aylantirib beruvchi tizim qaysi?',
      options: [
        { key: 'A', text: 'DNS (Domain Name System)' },
        { key: 'B', text: 'FTP' },
        { key: 'C', text: 'SMTP' },
        { key: 'D', text: 'DHCP' }
      ],
      correctAnswer: 'A',
      explanation: 'DNS tizimi inson tushunadigan domen nomlarini kompyuter tushunadigan raqamli IP manzillarga o‘girib beradi.',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: infoNetworksTest._id,
      subjectId: infoSubject._id,
      questionText: 'Veb-sayt xavfsiz va ma’lumotlar shifrlangan holatda uzatilayotganini qaysi protokol bildiradi?',
      options: [
        { key: 'A', text: 'HTTPS' },
        { key: 'B', text: 'HTTP' },
        { key: 'C', text: 'FTP' },
        { key: 'D', text: 'TELNET' }
      ],
      correctAnswer: 'A',
      explanation: 'HTTPS (HyperText Transfer Protocol Secure) — SSL/TLS orqali shifrlangan xavfsiz protokoldir.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoNetworksTest._id,
      subjectId: infoSubject._id,
      questionText: 'Foydalanuvchini aldamchi havolalar orqali login, parol yoki bank karta ma’lumotlarini o‘g‘irlashga qaratilgan kiberhujum turi qaysi?',
      options: [
        { key: 'A', text: 'Fishing (Phishing)' },
        { key: 'B', text: 'Spam' },
        { key: 'C', text: 'DDoS' },
        { key: 'D', text: 'Mining' }
      ],
      correctAnswer: 'A',
      explanation: 'Fishing — kiberjinoyatchilar tomonidan soxta sahifalar orqali shaxsiy ma’lumotlarni o‘marganlik usulidir.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoNetworksTest._id,
      subjectId: infoSubject._id,
      questionText: 'Bir xona, bino yoki muassasa doirasidagi lokal kompyuter tarmog‘i qisqartmasi qanday?',
      options: [
        { key: 'A', text: 'LAN (Local Area Network)' },
        { key: 'B', text: 'WAN (Wide Area Network)' },
        { key: 'C', text: 'MAN (Metropolitan Area Network)' },
        { key: 'D', text: 'PAN (Personal Area Network)' }
      ],
      correctAnswer: 'A',
      explanation: 'LAN — cheklangan maydondagi kompyuterlarni o‘zaro bog‘lovchi lokal tarmoq hisoblanadi.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoNetworksTest._id,
      subjectId: infoSubject._id,
      questionText: 'Kiberxavfsizlikda kuchli parolni qanday yaratish tavsiya etiladi?',
      options: [
        { key: 'A', text: 'Katta-kichik harflar, raqamlar va maxsus belgilardan iborat kamida 8-12 belgili parol' },
        { key: 'B', text: 'Faqat tug‘ilgan yil va ism' },
        { key: 'C', text: '12345678 kabi ketma-ket raqamlar' },
        { key: 'D', text: 'Faqatgina telefon raqami' }
      ],
      correctAnswer: 'A',
      explanation: 'Kuchli parol turli registrdagi harflar, sonlar va maxsus belgilardan iborat bo‘lishi lozim.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoNetworksTest._id,
      subjectId: infoSubject._id,
      questionText: '2FA (Ikki bosqichli autentifikatsiya) ning asosiy maqsadi nima?',
      options: [
        { key: 'A', text: 'Parol o‘g‘irlangan taqdirda ham tasdiqlash kodi orqali akkauntni himoyalash' },
        { key: 'B', text: 'Internet tezligini 2 barobarga oshirish' },
        { key: 'C', text: 'Kompyuterni tezroq o‘chirib-yoqish' },
        { key: 'D', text: 'Fayllarni ikki marta nusxalash' }
      ],
      correctAnswer: 'A',
      explanation: '2FA — hisobga kirishda paroldan tashqari telefonga yoki ilovaga keladigan bir martalik kodni talab qiluvchi himoya qatlamidir.',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: infoNetworksTest._id,
      subjectId: infoSubject._id,
      questionText: 'Veb-sahifalarni ko‘rish va internetda ma’lumot izlash uchun ishlatiladigan dastur qanday ataladi?',
      options: [
        { key: 'A', text: 'Brauzer (Browser)' },
        { key: 'B', text: 'Kompilyator' },
        { key: 'C', text: 'Drayver' },
        { key: 'D', text: 'Arxivator' }
      ],
      correctAnswer: 'A',
      explanation: 'Google Chrome, Firefox, Edge, Safari kabi dasturlar brauzer (veb-ko‘ruvchi) dasturlar hisoblanadi.',
      difficulty: 'easy',
      points: 1
    },
    // JavaScript Questions
    {
      testId: jsTest._id,
      subjectId: progSubject._id,
      questionText: "JavaScript'da qayta qiymat berib bo‘lmaydigan (o‘zgarmas) o‘zgaruvchi qaysi kalit so‘z orqali e'lon qilinadi?",
      options: [
        { key: 'A', text: 'var' },
        { key: 'B', text: 'let' },
        { key: 'C', text: 'const' },
        { key: 'D', text: 'static' }
      ],
      correctAnswer: 'C',
      explanation: "const kalit so‘zi o‘zgarmas (constant) o‘zgaruvchilar e'lon qilish uchun ishlatiladi.",
      difficulty: 'easy',
      points: 1
    },
    {
      testId: jsTest._id,
      subjectId: progSubject._id,
      questionText: "JavaScript tilida '2' + 2 ifodasi qanday natija qaytaradi?",
      options: [
        { key: 'A', text: '4' },
        { key: 'B', text: '"22"' },
        { key: 'C', text: 'NaN' },
        { key: 'D', text: 'TypeError' }
      ],
      correctAnswer: 'B',
      explanation: "Matn (string) va raqam qo‘shilganda JavaScript matnlarni birlashtiradi (string concatenation).",
      difficulty: 'easy',
      points: 1
    },
    {
      testId: jsTest._id,
      subjectId: progSubject._id,
      questionText: "JavaScript qaysi turdagi dasturlash tili hisoblanadi?",
      options: [
        { key: 'A', text: 'Faqat server-side til' },
        { key: 'B', text: 'Kompilyatsiya qilinadigan qat’iy tipli til' },
        { key: 'C', text: 'Ko‘p paradigmali, dinamik tipli interpretatsiya qilinuvchi til' },
        { key: 'D', text: 'Faqat ma’lumotlar bazasi tili' }
      ],
      correctAnswer: 'C',
      explanation: "JavaScript — prototype asosidagi, dinamik tipli, multi-paradigma til hisoblanadi.",
      difficulty: 'medium',
      points: 1
    },
    {
      testId: jsTest._id,
      subjectId: progSubject._id,
      questionText: "Quyidagilardan qaysi biri JavaScript'da ma'lumot turi (Data Type) EMAS?",
      options: [
        { key: 'A', text: 'Symbol' },
        { key: 'B', text: 'BigInt' },
        { key: 'C', text: 'Float' },
        { key: 'D', text: 'Boolean' }
      ],
      correctAnswer: 'C',
      explanation: "JavaScript'da barcha raqamlar (shu jumladan kasr sonlar) 'Number' turi ostida bo‘ladi, alohida 'Float' turi yo‘q.",
      difficulty: 'medium',
      points: 1
    },
    {
      testId: jsTest._id,
      subjectId: progSubject._id,
      questionText: "Node.js nima?",
      options: [
        { key: 'A', text: 'Yangi dasturlash tili' },
        { key: 'B', text: 'JavaScript runtime environment (muhiti)' },
        { key: 'C', text: 'Frontend UI freymvorki' },
        { key: 'D', text: 'SQL ma’lumotlar bazasi' }
      ],
      correctAnswer: 'B',
      explanation: "Node.js bu Chrome V8 motorida ishlaydigan JavaScript runtime muhiti hisoblanadi.",
      difficulty: 'easy',
      points: 1
    },
    {
      testId: jsTest._id,
      subjectId: progSubject._id,
      questionText: "Massivning oxiriga yangi element qo‘shish uchun qaysi metod ishlatiladi?",
      options: [
        { key: 'A', text: 'array.pop()' },
        { key: 'B', text: 'array.push()' },
        { key: 'C', text: 'array.shift()' },
        { key: 'D', text: 'array.unshift()' }
      ],
      correctAnswer: 'B',
      explanation: "push() metodi massiv oxiriga yangi element qo‘shadi va yangi uzunlikni qaytaradi.",
      difficulty: 'easy',
      points: 1
    },

    // Python Questions
    {
      testId: pythonTest._id,
      subjectId: progSubject._id,
      questionText: "Python tilida funksiya e'lon qilish uchun qaysi kalit so‘z ishlatiladi?",
      options: [
        { key: 'A', text: 'function' },
        { key: 'B', text: 'def' },
        { key: 'C', text: 'func' },
        { key: 'D', text: 'define' }
      ],
      correctAnswer: 'B',
      explanation: "Python'da funksiyalar 'def function_name():' ko‘rinishida e'lon qilinadi.",
      difficulty: 'easy',
      points: 1
    },
    {
      testId: pythonTest._id,
      subjectId: progSubject._id,
      questionText: "Python'da o‘zgarmas (immutable) to‘plam qaysi biri?",
      options: [
        { key: 'A', text: 'List' },
        { key: 'B', text: 'Dictionary' },
        { key: 'C', text: 'Tuple' },
        { key: 'D', text: 'Set' }
      ],
      correctAnswer: 'C',
      explanation: "Tuple (kortej) yaratilgandan keyin uning elementlarini o‘zgartirib bo‘lmaydi.",
      difficulty: 'medium',
      points: 1
    },
    {
      testId: pythonTest._id,
      subjectId: progSubject._id,
      questionText: "Python'da len([10, 20, 30, 40]) ifodasining natijasi qanday bo‘ladi?",
      options: [
        { key: 'A', text: '3' },
        { key: 'B', text: '4' },
        { key: 'C', text: '40' },
        { key: 'D', text: '10' }
      ],
      correctAnswer: 'B',
      explanation: "len() funksiyasi ro‘yxatdagi elementlar sonini (uzunligini) qaytaradi.",
      difficulty: 'easy',
      points: 1
    },

    // Math Questions
    {
      testId: mathTest._id,
      subjectId: mathSubject._id,
      questionText: "Agar 3x + 15 = 45 bo‘lsa, x ning qiymatini toping:",
      options: [
        { key: 'A', text: '10' },
        { key: 'B', text: '15' },
        { key: 'C', text: '20' },
        { key: 'D', text: '30' }
      ],
      correctAnswer: 'A',
      explanation: "3x = 45 - 15 => 3x = 30 => x = 10.",
      difficulty: 'easy',
      points: 1
    },
    {
      testId: mathTest._id,
      subjectId: mathSubject._id,
      questionText: "250 sonining 20% i nechaga teng?",
      options: [
        { key: 'A', text: '40' },
        { key: 'B', text: '50' },
        { key: 'C', text: '60' },
        { key: 'D', text: '25' }
      ],
      correctAnswer: 'B',
      explanation: "250 * 0.20 = 50.",
      difficulty: 'easy',
      points: 1
    },

    // English Questions
    {
      testId: engTest._id,
      subjectId: engSubject._id,
      questionText: "Choose the correct sentence in Present Perfect:",
      options: [
        { key: 'A', text: 'She has already finished her homework.' },
        { key: 'B', text: 'She is finish her homework.' },
        { key: 'C', text: 'She did finished her homework.' },
        { key: 'D', text: 'She has finish her homework.' }
      ],
      correctAnswer: 'A',
      explanation: "Present Perfect formulasi: have/has + V3 (Past Participle).",
      difficulty: 'easy',
      points: 1
    },
    {
      testId: engTest._id,
      subjectId: engSubject._id,
      questionText: "What is the synonym of 'Quick'?",
      options: [
        { key: 'A', text: 'Slow' },
        { key: 'B', text: 'Fast' },
        { key: 'C', text: 'Heavy' },
        { key: 'D', text: 'Quiet' }
      ],
      correctAnswer: 'B',
      explanation: "'Quick' va 'Fast' ikkalasi ham tezkor ma'nosini beradi.",
      difficulty: 'easy',
      points: 1
    },

    // 11-SINF OLIMPIADA: INFORMATIKA VA DELPHI
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'MOBTning kengaytirilgan shakli keltirilgan qatorni belgilang.',
      options: [
        { key: 'A', text: 'Ma’lumotlar omborini boshqarish tizimlari' },
        { key: 'B', text: 'Ma’lumotlarni oson boshqarish tizimi' },
        { key: 'C', text: 'Ma’lumotlarni og‘riqli bilish tili' },
        { key: 'D', text: 'Ma’lumotlar va obyektlar bilan ishlash tizimi' }
      ],
      correctAnswer: 'A',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ma’lumotlar ombori tuzishning asosiy usullari qaysilar?',
      options: [
        { key: 'A', text: 'Ierarxik, tarmoq' },
        { key: 'B', text: 'Ierarxik, relyatsion' },
        { key: 'C', text: 'Ierarxik, tarmoq, relyatsion' },
        { key: 'D', text: 'To‘g‘ri javob yo‘q' }
      ],
      correctAnswer: 'C',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ma’lumotlar omborining shajara usuli yana qanday yuritiladi?',
      options: [
        { key: 'A', text: 'Tarmoq' },
        { key: 'B', text: 'Relyatsion' },
        { key: 'C', text: 'Ierarxik' },
        { key: 'D', text: 'Barcha javoblar to‘g‘ri' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ma’lumotlar qaysi usuldan foydalanib olinishi mumkin?',
      options: [
        { key: 'A', text: 'Tuzilmalashtirilgan va tuzilmalashtirilmagan' },
        { key: 'B', text: 'Tizimlashtirilgan va tizilmalashtirilgan' },
        { key: 'C', text: 'Model va algoritm' },
        { key: 'D', text: 'To‘g‘ri javob yo‘q' }
      ],
      correctAnswer: 'A',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ma’lumotlar omborini boshqarish tizimlariga misol keltirilgan to‘g‘ri qatorni toping.',
      options: [
        { key: 'A', text: 'MySQL, MS Access, OpenOffice.org Base, Cache, IMS, Firebird' },
        { key: 'B', text: 'Word, Access, Excel va FrontPage' },
        { key: 'C', text: 'PowerPoint, Excel, MySQL va Dreamweaver' },
        { key: 'D', text: 'Access, FrontPage, Publisher va Paint' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'MOBT nima?',
      options: [
        { key: 'A', text: 'Jadvallar bilan ishlash uchun mo‘ljallangan dastur' },
        { key: 'B', text: 'Matnlar bilan ishlash uchun mo‘ljallangan dastur tizimi' },
        { key: 'C', text: 'Ma’lumotlar omborini bilish tizimi' },
        { key: 'D', text: 'Foydalanuvchilar tomonidan MOni yaratish, to‘ldirish va birgalikda qo‘llash uchun mo‘ljallangan dasturiy vositalar tizimi' }
      ],
      correctAnswer: 'D',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Access dasturining asosiy menyulari to‘liq keltirilgan qatorni toping.',
      options: [
        { key: 'A', text: 'Файл, Поля, Главная, Создание, Внешние данные, Работа с базами данных, Таблица' },
        { key: 'B', text: 'Файл, Поля, Главная, Работа с базами данных, Таблица' },
        { key: 'C', text: 'Файл, Поля, Главная, Создание, Внешние данные' },
        { key: 'D', text: 'Файл, Поля, Главная, Создание, Внешние данные, Работа с базами данных, Таблица, Окно, Справка' }
      ],
      correctAnswer: 'D',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Таблицы, Запросы, Формы, Страницы, Отчёты va Макрослар Access uchun nima hisoblanadi?',
      options: [
        { key: 'A', text: 'Asosiy menyular' },
        { key: 'B', text: 'Uskunalar paneli' },
        { key: 'C', text: 'Asosiy elementlari' },
        { key: 'D', text: 'Asosiy funksiyalar' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'MS Access 2010dagi tasvirlanadigan maydon turlari necha xil bo‘ladi?',
      options: [
        { key: 'A', text: '8' },
        { key: 'B', text: '10' },
        { key: 'C', text: '12' },
        { key: 'D', text: '15' }
      ],
      correctAnswer: 'C',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'MS Access fayllarining kengaytmasi qanday?',
      options: [
        { key: 'A', text: '*.exe' },
        { key: 'B', text: '*.bin' },
        { key: 'C', text: '*.pdf' },
        { key: 'D', text: '*.accdb' }
      ],
      correctAnswer: 'D',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Obyektga mo‘ljallangan dasturlash tillari to‘g‘ri keltirilgan javobni belgilang.',
      options: [
        { key: 'A', text: 'Pascal' },
        { key: 'B', text: 'Delphi' },
        { key: 'C', text: 'C++' },
        { key: 'D', text: 'Barcha javoblar to‘g‘ri' }
      ],
      correctAnswer: 'D',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ilovalar yana qanday nomlar bilan yuritiladi?',
      options: [
        { key: 'A', text: 'Texnik ta’minot' },
        { key: 'B', text: 'Amaliy dasturlar' },
        { key: 'C', text: 'Dasturiy ta’minot' },
        { key: 'D', text: 'Drayverlar' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Dastur matnini kompyuter tushunadigan mashina kodiga o‘girib beruvchi qurilma nima deb ataladi?',
      options: [
        { key: 'A', text: 'Translyator' },
        { key: 'B', text: 'Shina' },
        { key: 'C', text: 'Visual dasturlash' },
        { key: 'D', text: 'Assembler' }
      ],
      correctAnswer: 'A',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Mikroprotsessorning buyruqlari yana qanday yuritiladi?',
      options: [
        { key: 'A', text: 'Mashina kodi' },
        { key: 'B', text: 'Assembler' },
        { key: 'C', text: 'Operatsion tizim' },
        { key: 'D', text: 'Umumlashgan dasturlar' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Tuzilmaviy dasturlash tili to‘g‘ri keltirilgan qatorni toping.',
      options: [
        { key: 'A', text: 'Turbo Pascal' },
        { key: 'B', text: 'Delphi' },
        { key: 'C', text: 'Java' },
        { key: 'D', text: 'C++' }
      ],
      correctAnswer: 'A',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Delphi nomi qayerdan olingan?',
      options: [
        { key: 'A', text: 'Odamning ismi' },
        { key: 'B', text: 'Faylasufning ismi' },
        { key: 'C', text: 'Misrdagi ibodatxona nomi' },
        { key: 'D', text: 'Yunonistondagi ibodatxona nomi' }
      ],
      correctAnswer: 'D',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Delphi dasturi interfeysi bo‘limlari to‘g‘ri keltirilgan qatorni toping.',
      options: [
        { key: 'A', text: 'Uskunalar paneli, obyektlar brauzeri, obyektlar inspektori, dastur kodi oynasi, sarlavha satri, obyektlar paneli, ilova oynasi' },
        { key: 'B', text: 'Obyektlar inspektori, dastur kodi oynasi, sarlavha satri, obyektlar paneli, asosiy menyu, ilova oynasi' },
        { key: 'C', text: 'Uskunalar paneli, obyektlar brauzeri, obyektlar inspektori, dastur kodi oynasi, sarlavha satri, obyektlar paneli, asosiy menyu, ilova oynasi' },
        { key: 'D', text: 'To‘g‘ri javob yo‘q' }
      ],
      correctAnswer: 'C',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Delphi dasturining asosiy menyusi necha bo‘limdan iborat?',
      options: [
        { key: 'A', text: '9' },
        { key: 'B', text: '10' },
        { key: 'C', text: '11' },
        { key: 'D', text: '13' }
      ],
      correctAnswer: 'B',
      difficulty: 'medium',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Object TreeView punkti qaysi menyuda joylashgan?',
      options: [
        { key: 'A', text: 'Project' },
        { key: 'B', text: 'View' },
        { key: 'C', text: 'Component' },
        { key: 'D', text: 'File' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Delphida yaratilgan ilovalar qanday nomlanadi?',
      options: [
        { key: 'A', text: 'Proyekt' },
        { key: 'B', text: 'Prezentatsiya' },
        { key: 'C', text: 'Slayd' },
        { key: 'D', text: 'Hujjat' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ilovalarni saqlash usullari to‘g‘ri keltirilgan qatorni belgilang.',
      options: [
        { key: 'A', text: 'Save, Save As, Save Project As, Save All' },
        { key: 'B', text: 'Save' },
        { key: 'C', text: 'Save As, Save' },
        { key: 'D', text: 'Barcha javoblar to‘g‘ri' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Dasturni tuzib bo‘lgach ilovani ishga tushirish uchun qaysi klavishni bosish lozim?',
      options: [
        { key: 'A', text: 'Run' },
        { key: 'B', text: 'F8' },
        { key: 'C', text: 'F9' },
        { key: 'D', text: 'Shift' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Tugma Delphi dasturida qanday yuritiladi?',
      options: [
        { key: 'A', text: 'Pusk' },
        { key: 'B', text: 'Button' },
        { key: 'C', text: 'Caption' },
        { key: 'D', text: 'Cancel' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Matn belgisi belgilangan miqdordan oshganda xabar chiqaruvchi oyna uchun qaysi tugma lozim?',
      options: [
        { key: 'A', text: 'Button' },
        { key: 'B', text: 'Caption' },
        { key: 'C', text: 'ShowMessage' },
        { key: 'D', text: 'To‘g‘ri javob yo‘q' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ilovaning birinchi oynasi qanday nomlanadi?',
      options: [
        { key: 'A', text: 'Forma' },
        { key: 'B', text: 'Dastur kodi' },
        { key: 'C', text: 'Ko‘rinish' },
        { key: 'D', text: 'Ilovaning yuzi' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ilovaning ikkinchi oynasi qanday nomlanadi?',
      options: [
        { key: 'A', text: 'Forma' },
        { key: 'B', text: 'Dastur kodi' },
        { key: 'C', text: 'Ko‘rinish' },
        { key: 'D', text: 'Ilovaning yuzi' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ilova oynasining kengligi qaysi xossa orqali o‘zgartiriladi?',
      options: [
        { key: 'A', text: 'Caption' },
        { key: 'B', text: 'Form' },
        { key: 'C', text: 'Width' },
        { key: 'D', text: 'Run' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Butun son turidagi kattalikni matn satri turidagi kattalikka o‘tkazish uchun qaysi funksiyadan foydalanamiz?',
      options: [
        { key: 'A', text: 'IntToStr' },
        { key: 'B', text: 'Height' },
        { key: 'C', text: 'Width' },
        { key: 'D', text: 'Caption' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Height xossasi nima uchun qo‘llaniladi?',
      options: [
        { key: 'A', text: 'Balandlik' },
        { key: 'B', text: 'Chapdan tekislash' },
        { key: 'C', text: 'Kenglik' },
        { key: 'D', text: 'Yuqoridan joylashuv' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Labelning asosiy xossasi qaysi?',
      options: [
        { key: 'A', text: 'Form' },
        { key: 'B', text: 'Button' },
        { key: 'C', text: 'Caption' },
        { key: 'D', text: 'Name' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'CheckBox obyektining asosiy xossasi qaysi?',
      options: [
        { key: 'A', text: 'CheckRound' },
        { key: 'B', text: 'CheckHouse' },
        { key: 'C', text: 'Checked' },
        { key: 'D', text: 'Caption' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Pascal dasturida matnning chiqarilishi qaysi operator yordamida bajariladi?',
      options: [
        { key: 'A', text: 'Case' },
        { key: 'B', text: 'Read' },
        { key: 'C', text: 'If...Else...' },
        { key: 'D', text: 'Write' }
      ],
      correctAnswer: 'D',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Delphi dasturida matn kiritish uchun qaysi obyekt ishlatiladi?',
      options: [
        { key: 'A', text: 'Check' },
        { key: 'B', text: 'RadioGroup' },
        { key: 'C', text: 'Edit' },
        { key: 'D', text: 'Project' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Items qanday tarjima qilinadi?',
      options: [
        { key: 'A', text: 'Loyiha' },
        { key: 'B', text: 'Mashina' },
        { key: 'C', text: 'Inspector' },
        { key: 'D', text: 'Variant' }
      ],
      correctAnswer: 'D',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ustun atamasi Delphi dasturlash tilida qanday yuritiladi?',
      options: [
        { key: 'A', text: 'Columns' },
        { key: 'B', text: 'CheckBox' },
        { key: 'C', text: 'RadioGroup' },
        { key: 'D', text: 'To‘g‘ri javob yo‘q' }
      ],
      correctAnswer: 'A',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Ro‘yxat qutisi to‘g‘ri keltirilgan qatorni belgilang.',
      options: [
        { key: 'A', text: 'CheckBox' },
        { key: 'B', text: 'ListBox' },
        { key: 'C', text: 'ComboBox' },
        { key: 'D', text: 'OutBox' }
      ],
      correctAnswer: 'B',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Yashirin ro‘yxat qutisi qaysi qatorda keltirilgan?',
      options: [
        { key: 'A', text: 'CheckBox' },
        { key: 'B', text: 'ListBox' },
        { key: 'C', text: 'ComboBox' },
        { key: 'D', text: 'OutBox' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Sonni kiritish maydonchasi keltirilgan qatorni belgilang.',
      options: [
        { key: 'A', text: 'Column' },
        { key: 'B', text: 'Items' },
        { key: 'C', text: 'SpinEdit' },
        { key: 'D', text: 'ComboBox' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Qiymat Delphi dasturlash tilida qanday yuritiladi?',
      options: [
        { key: 'A', text: 'SpinEdit' },
        { key: 'B', text: 'ListBox' },
        { key: 'C', text: 'Value' },
        { key: 'D', text: 'Samples' }
      ],
      correctAnswer: 'C',
      difficulty: 'easy',
      points: 1
    },
    {
      testId: olympiadTest._id,
      subjectId: olympiadSubject._id,
      questionText: 'Namuna Delphi dasturlash tilida qanday yuritiladi?',
      options: [
        { key: 'A', text: 'SpinEdit' },
        { key: 'B', text: 'ListBox' },
        { key: 'C', text: 'Value' },
        { key: 'D', text: 'Samples' }
      ],
      correctAnswer: 'D',
      difficulty: 'easy',
      points: 1
    },

    ...tenthGradeQuestions,
    ...nativeLanguageQuestions
  ];

  await Question.insertMany(questionsData);
  console.log(`✅ ${questionsData.length} ta savol muvaffaqiyatli yuklandi.`);

  console.log('🎉 Seed jarayoni muvaffaqiyatli yakunlandi!');
  console.log('--------------------------------------------------');
  console.log('📌 Admin Login ma’lumotlari:');
  console.log(`   Login:    ${adminUser.username}`);
  console.log(`   Parol:    ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  console.log('--------------------------------------------------');

  process.exit(0);
};

seed();
