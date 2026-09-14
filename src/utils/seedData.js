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
    { name: 'Dasturlash', icon: '💻', description: 'JavaScript, Python, Node.js va Web dasturlash testlari', order: 1 },
    { name: 'Matematika', icon: '📘', description: 'Algebra, Geometriya va Mantiqiy masalalar', order: 2 },
    { name: 'Ingliz tili', icon: '📗', description: 'Grammar, Vocabulary va IELTS darajasi testlari', order: 3 },
    { name: 'Informatika', icon: '📕', description: 'Kompyuter savodxonligi, Tarmoqlar va IT asoslari', order: 4 },
    { name: 'Ona tili', icon: '📙', description: 'O‘zbek tili grammatikasi va adabiyot testlari', order: 5 }
  ];

  const createdSubjects = await Subject.insertMany(subjectsData);
  const progSubject = createdSubjects.find((s) => s.name === 'Dasturlash');
  const mathSubject = createdSubjects.find((s) => s.name === 'Matematika');
  const engSubject = createdSubjects.find((s) => s.name === 'Ingliz tili');
  const infoSubject = createdSubjects.find((s) => s.name === 'Informatika');

  console.log('📝 Testlar yaratilmoqda...');
  const jsTest = await Test.create({
    title: 'JavaScript Basic Test',
    subjectId: progSubject._id,
    topic: 'O‘zgaruvchilar, Funksiyalar va DOM',
    description: 'JavaScript tilining asosiy sintaksisi va tushunchalari bo‘yicha 10 ta savol.',
    durationMinutes: 10,
    totalQuestions: 10,
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
    totalQuestions: 8,
    pointsPerQuestion: 1,
    passingPercentage: 70,
    difficulty: 'medium',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  const mathTest = await Test.create({
    title: 'Matematika: Mantiq va Hisoblash',
    subjectId: mathSubject._id,
    topic: 'Tenglamalar va Foizlar',
    description: 'Algebraik amallar va mantiqiy fikrlash sinovi.',
    durationMinutes: 15,
    totalQuestions: 6,
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
    totalQuestions: 6,
    pointsPerQuestion: 1,
    passingPercentage: 60,
    difficulty: 'easy',
    isActive: true,
    isAntiCheatEnabled: true,
    createdBy: adminUser._id
  });

  console.log('❓ Savollar bazasi to‘ldirilmoqda...');
  const questionsData = [
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
    }
  ];

  await Question.insertMany(questionsData);
  console.log(`✅ ${questionsData.length} ta savol muvaffaqiyatli yuklandi.`);

  // Create demo mock students for leaderboard preview
  console.log('🏆 Namunaviy o‘quvchilar va reyting yaratilmoqda...');
  const student1 = await User.create({
    telegramId: 10001,
    firstName: 'Abubakr',
    lastName: 'Qodirov',
    username: 'abubakr_dev',
    role: 'user',
    totalTests: 25,
    totalQuestions: 250,
    totalCorrect: 235,
    totalWrong: 15,
    totalScore: 980,
    xp: 1470,
    level: 3,
    levelName: 'Advanced',
    bestScore: 98,
    bestSubject: 'Dasturlash'
  });

  const student2 = await User.create({
    telegramId: 10002,
    firstName: 'Ali',
    lastName: 'Valiyev',
    username: 'ali_uz',
    role: 'user',
    totalTests: 20,
    totalQuestions: 200,
    totalCorrect: 180,
    totalWrong: 20,
    totalScore: 920,
    xp: 1380,
    level: 3,
    levelName: 'Advanced',
    bestScore: 95,
    bestSubject: 'Matematika'
  });

  const student3 = await User.create({
    telegramId: 10003,
    firstName: 'Hasan',
    lastName: 'Karimov',
    username: 'hasan_k',
    role: 'user',
    totalTests: 18,
    totalQuestions: 180,
    totalCorrect: 160,
    totalWrong: 20,
    totalScore: 870,
    xp: 1250,
    level: 3,
    levelName: 'Advanced',
    bestScore: 90,
    bestSubject: 'Ingliz tili'
  });

  // Sample Result
  await Result.create({
    userId: student1._id,
    telegramId: student1.telegramId,
    testId: jsTest._id,
    testTitle: jsTest.title,
    subjectTitle: progSubject.name,
    totalQuestions: 6,
    correctCount: 6,
    wrongCount: 0,
    percentage: 100,
    score: 90,
    totalPossibleScore: 60,
    timeSpentSeconds: 180,
    evaluationBadge: "A'lo",
    passed: true,
    answersDetails: [
      {
        questionText: "Node.js nima?",
        selectedOption: 'B',
        selectedText: 'JavaScript runtime environment (muhiti)',
        correctOption: 'B',
        correctText: 'JavaScript runtime environment (muhiti)',
        isCorrect: true,
        explanation: 'Node.js bu V8 motorida ishlovchi runtime.'
      }
    ]
  });

  console.log('🎉 Seed jarayoni muvaffaqiyatli yakunlandi!');
  console.log('--------------------------------------------------');
  console.log('📌 Admin Login ma’lumotlari:');
  console.log(`   Login:    ${adminUser.username}`);
  console.log(`   Parol:    ${process.env.ADMIN_PASSWORD || 'admin123'}`);
  console.log('--------------------------------------------------');

  process.exit(0);
};

seed();
