// API & App State
const state = {
  token: localStorage.getItem('quiz_admin_token') || '',
  user: JSON.parse(localStorage.getItem('quiz_admin_user') || 'null'),
  currentTab: 'dashboard',
  subjects: [],
  tests: [],
  testsPage: 1,
  questionsPage: 1,
  usersPage: 1,
  resultsPage: 1,
  certificatesPage: 1,
  bulkFile: null
};

// HELPER: Toast Notification
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerText = message;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// HELPER: API Request Wrapper
async function apiFetch(endpoint, options = {}) {
  const headers = {
    ...options.headers
  };

  if (state.token) {
    headers['Authorization'] = `Bearer ${state.token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  try {
    const res = await fetch(endpoint, { ...options, headers });
    const data = await res.json();

    if (res.status === 401) {
      showToast('Sessiya muddati tugadi. Iltimos, qayta kiring', 'error');
      logout();
      return null;
    }

    if (!res.ok) {
      throw new Error(data.message || 'Serverda xatolik yuz berdi');
    }

    return data;
  } catch (err) {
    showToast(err.message, 'error');
    return null;
  }
}

// AUTH: Login
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value.trim();

  const data = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password })
  });

  if (data && data.success) {
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('quiz_admin_token', data.token);
    localStorage.setItem('quiz_admin_user', JSON.stringify(data.user));
    showToast('Tizimga muvaffaqiyatli kirildi', 'success');
    renderAuthUI();
  }
});

// AUTH: Logout
function logout() {
  state.token = '';
  state.user = null;
  localStorage.removeItem('quiz_admin_token');
  localStorage.removeItem('quiz_admin_user');
  renderAuthUI();
}

document.getElementById('logout-btn')?.addEventListener('click', logout);

// Render Auth / App layout
function renderAuthUI() {
  const loginScreen = document.getElementById('login-screen');
  const adminApp = document.getElementById('admin-app');

  if (state.token) {
    loginScreen.style.display = 'none';
    adminApp.style.display = 'flex';

    if (state.user) {
      document.getElementById('admin-fullname').innerText = `${state.user.firstName || ''} ${state.user.lastName || ''}`.trim() || state.user.username;
      document.getElementById('admin-avatar').innerText = (state.user.username || 'A')[0].toUpperCase();
    }

    loadInitialData();
  } else {
    loginScreen.style.display = 'flex';
    adminApp.style.display = 'none';
  }
}

// NAVIGATION: Tab switching
document.querySelectorAll('.sidebar-menu .nav-item').forEach((link) => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const tabName = link.dataset.tab;
    switchTab(tabName);
  });
});

function switchTab(tabName) {
  state.currentTab = tabName;
  document.querySelectorAll('.sidebar-menu .nav-item').forEach((item) => {
    item.classList.toggle('active', item.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-pane').forEach((pane) => {
    pane.classList.remove('active');
  });

  const activePane = document.getElementById(`tab-${tabName}`);
  if (activePane) activePane.classList.add('active');

  const titles = {
    dashboard: 'Dashboard',
    tests: 'Testlar Boshqaruvi',
    questions: 'Savollar Bazasi',
    bulk: 'Ommaviy Savol Yuklash (Bulk Import)',
    users: 'O‘quvchilar Boshqaruvi',
    results: 'Natijalar va Hisobotlar',
    notifications: 'Xabarnomalar (Telegram Broadcast)',
    certificates: 'Berilgan Sertifikatlar',
    subjects: 'Fanlar va Mavzular'
  };
  document.getElementById('page-title').innerText = titles[tabName] || 'Dashboard';

  // Trigger tab data reload
  loadCurrentTabData();

  // Close mobile menu if open
  document.querySelector('.sidebar').classList.remove('show');
}

// Mobile sidebar toggle
document.getElementById('mobile-menu-toggle')?.addEventListener('click', () => {
  document.querySelector('.sidebar').classList.toggle('show');
});

// Refresh button
document.getElementById('refresh-btn')?.addEventListener('click', () => {
  loadCurrentTabData();
  showToast('Ma’lumotlar yangilandi', 'info');
});

// INITIAL DATA
async function loadInitialData() {
  await loadSubjects();
  loadCurrentTabData();
}

function loadCurrentTabData() {
  switch (state.currentTab) {
    case 'dashboard':
      loadDashboardStats();
      break;
    case 'tests':
      loadTests();
      break;
    case 'questions':
      loadQuestions();
      break;
    case 'bulk':
      populateBulkSelects();
      break;
    case 'users':
      loadUsers();
      break;
    case 'results':
      loadResults();
      break;
    case 'notifications':
      loadNotifications();
      break;
    case 'certificates':
      loadCertificates();
      break;
    case 'subjects':
      loadSubjectsList();
      break;
  }
}

// 1. DASHBOARD
async function loadDashboardStats() {
  const res = await apiFetch('/api/statistics/dashboard');
  if (!res || !res.data) return;

  const { summary, dailyTests, subjectDistribution, topStudents, recentResults } = res.data;

  document.getElementById('stat-total-users').innerText = summary.totalUsers || 0;
  document.getElementById('stat-active-today').innerText = `Bugun faol: ${summary.activeTodayUsersCount || 0}`;
  document.getElementById('stat-total-tests').innerText = summary.totalTests || 0;
  document.getElementById('stat-total-questions').innerText = summary.totalQuestions || 0;
  document.getElementById('stat-today-tests').innerText = summary.todayTestsCount || 0;
  document.getElementById('stat-avg-score').innerText = `O‘rtacha natija: ${summary.avgPercentage || 0}%`;

  // Charts
  if (typeof initCharts === 'function') {
    initCharts(dailyTests, subjectDistribution);
  }

  // Top students table
  const topTbody = document.getElementById('top-students-tbody');
  if (topStudents.length === 0) {
    topTbody.innerHTML = `<tr><td colspan="5" class="text-center">O‘quvchilar mavjud emas</td></tr>`;
  } else {
    topTbody.innerHTML = topStudents.map((u, i) => `
      <tr>
        <td><b>#${i + 1}</b></td>
        <td><b>${u.firstName || ''} ${u.lastName || ''}</b> <br><small class="text-dim">@${u.username || 'yo‘q'}</small></td>
        <td><span class="badge badge-active">${u.totalScore} ball</span></td>
        <td>Level ${u.level} (${u.xp} XP)</td>
        <td>${u.totalTests} ta</td>
      </tr>
    `).join('');
  }

  // Recent results table
  const recentTbody = document.getElementById('recent-results-tbody');
  if (recentResults.length === 0) {
    recentTbody.innerHTML = `<tr><td colspan="5" class="text-center">Hali test topshirilmagan</td></tr>`;
  } else {
    recentTbody.innerHTML = recentResults.map((r) => `
      <tr>
        <td><b>${r.userId ? r.userId.firstName : 'O‘quvchi'}</b></td>
        <td>${r.testTitle}</td>
        <td><span class="badge ${r.percentage >= 80 ? 'badge-easy' : r.percentage >= 60 ? 'badge-medium' : 'badge-hard'}">${r.percentage}%</span></td>
        <td>${r.score}/${r.totalPossibleScore}</td>
        <td><small class="text-dim">${new Date(r.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}</small></td>
      </tr>
    `).join('');
  }
}

// 2. SUBJECTS LOADER & MANAGEMENT
async function loadSubjects() {
  const res = await apiFetch('/api/subjects');
  if (res && res.data) {
    state.subjects = res.data;

    // Populate dropdowns across all modals and filters
    const populateSelect = (selectId, addAllOption = false) => {
      const el = document.getElementById(selectId);
      if (!el) return;
      el.innerHTML = addAllOption ? '<option value="">Barcha Fanlar</option>' : '';
      state.subjects.forEach((s) => {
        el.innerHTML += `<option value="${s._id}">${s.icon} ${s.name}</option>`;
      });
    };

    populateSelect('tests-filter-subject', true);
    populateSelect('questions-filter-subject', true);
    populateSelect('test-subject-select');
    populateSelect('q-subject-select');
    populateSelect('bulk-subject-select');
  }
}

async function loadSubjectsList() {
  const res = await apiFetch('/api/subjects');
  const tbody = document.getElementById('subjects-tbody');
  if (!res || !res.data || res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center">Fanlar mavjud emas</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map((s) => `
    <tr>
      <td style="font-size: 1.4rem;">${s.icon}</td>
      <td><b>${s.name}</b></td>
      <td>${s.description || '—'}</td>
      <td><span class="badge ${s.isActive ? 'badge-active' : 'badge-inactive'}">${s.isActive ? 'Faol' : 'Nofaol'}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteSubject('${s._id}')">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

document.getElementById('btn-create-subject')?.addEventListener('click', () => {
  document.getElementById('form-subject').reset();
  document.getElementById('subject-id').value = '';
  openModal('modal-subject');
});

document.getElementById('form-subject')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('sub-name').value.trim();
  const icon = document.getElementById('sub-icon').value.trim();
  const description = document.getElementById('sub-desc').value.trim();

  const res = await apiFetch('/api/subjects', {
    method: 'POST',
    body: JSON.stringify({ name, icon, description })
  });

  if (res && res.success) {
    showToast('Yangi fan qo‘shildi', 'success');
    closeModal('modal-subject');
    await loadSubjects();
    loadSubjectsList();
  }
});

async function deleteSubject(id) {
  if (!confirm('Haqiqatdan ham ushbu fanni va unga tegishli barcha testlarni o‘chirmoqchimisiz?')) return;
  const res = await apiFetch(`/api/subjects/${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Fan o‘chirildi', 'success');
    await loadSubjects();
    loadSubjectsList();
  }
}

// 3. TESTS MANAGEMENT
async function loadTests() {
  const search = document.getElementById('tests-search').value.trim();
  const subjectId = document.getElementById('tests-filter-subject').value;
  const difficulty = document.getElementById('tests-filter-diff').value;

  let query = `?page=${state.testsPage}&limit=15`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (subjectId) query += `&subjectId=${subjectId}`;
  if (difficulty && difficulty !== 'all') query += `&difficulty=${difficulty}`;

  const res = await apiFetch(`/api/tests${query}`);
  const tbody = document.getElementById('tests-tbody');

  if (!res || !res.data || res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Testlar topilmadi</td></tr>`;
    return;
  }

  state.tests = res.data;

  // Populate questions-filter-test
  const qTestSelect = document.getElementById('questions-filter-test');
  if (qTestSelect) {
    qTestSelect.innerHTML = '<option value="">Barcha Testlar</option>' +
      res.data.map((t) => `<option value="${t._id}">${t.title}</option>`).join('');
  }

  tbody.innerHTML = res.data.map((t) => `
    <tr>
      <td><b>${t.title}</b><br><small class="text-dim">${t.topic || 'Umumiy'}</small></td>
      <td>${t.subjectId ? `${t.subjectId.icon} ${t.subjectId.name}` : '—'}</td>
      <td><b>${t.actualQuestionCount || 0}</b> / ${t.totalQuestions}</td>
      <td>${t.durationMinutes} daq</td>
      <td><span class="badge badge-${t.difficulty}">${t.difficulty.toUpperCase()}</span></td>
      <td>${t.isAntiCheatEnabled ? '✅ Yoqilgan' : '❌ O‘chirilgan'}</td>
      <td><span class="badge ${t.isActive ? 'badge-active' : 'badge-inactive'}">${t.isActive ? 'Faol' : 'Nofaol'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="editTest('${t._id}')" title="Tahrirlash">
          <i class="fa-solid fa-pen"></i>
        </button>
        <button class="btn btn-danger btn-sm" onclick="deleteTest('${t._id}')" title="O‘chirish">
          <i class="fa-solid fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');

  renderPagination('tests-pagination', res.page, res.pages, (p) => {
    state.testsPage = p;
    loadTests();
  });
}

document.getElementById('tests-search')?.addEventListener('input', debounce(loadTests, 400));
document.getElementById('tests-filter-subject')?.addEventListener('change', () => { state.testsPage = 1; loadTests(); });
document.getElementById('tests-filter-diff')?.addEventListener('change', () => { state.testsPage = 1; loadTests(); });

document.getElementById('btn-create-test')?.addEventListener('click', () => {
  document.getElementById('form-test').reset();
  document.getElementById('test-id').value = '';
  document.getElementById('modal-test-title').innerText = 'Yangi Test Yaratish';
  openModal('modal-test');
});

async function editTest(id) {
  const res = await apiFetch(`/api/tests/${id}`);
  if (!res || !res.data) return;
  const t = res.data;

  document.getElementById('test-id').value = t._id;
  document.getElementById('test-name').value = t.title;
  document.getElementById('test-subject-select').value = t.subjectId ? t.subjectId._id : '';
  document.getElementById('test-topic').value = t.topic || '';
  document.getElementById('test-duration').value = t.durationMinutes;
  document.getElementById('test-questions-count').value = t.totalQuestions;
  document.getElementById('test-diff').value = t.difficulty;
  document.getElementById('test-points').value = t.pointsPerQuestion;
  document.getElementById('test-passing').value = t.passingPercentage;
  document.getElementById('test-max-attempts').value = t.maxAttempts || 0;
  document.getElementById('test-desc').value = t.description || '';
  document.getElementById('test-anti-cheat').checked = t.isAntiCheatEnabled;
  document.getElementById('test-is-active').checked = t.isActive;

  document.getElementById('modal-test-title').innerText = 'Testni Tahrirlash';
  openModal('modal-test');
}

document.getElementById('form-test')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('test-id').value;
  const body = {
    title: document.getElementById('test-name').value.trim(),
    subjectId: document.getElementById('test-subject-select').value,
    topic: document.getElementById('test-topic').value.trim(),
    durationMinutes: Number(document.getElementById('test-duration').value),
    totalQuestions: Number(document.getElementById('test-questions-count').value),
    difficulty: document.getElementById('test-diff').value,
    pointsPerQuestion: Number(document.getElementById('test-points').value),
    passingPercentage: Number(document.getElementById('test-passing').value),
    maxAttempts: Number(document.getElementById('test-max-attempts').value),
    description: document.getElementById('test-desc').value.trim(),
    isAntiCheatEnabled: document.getElementById('test-anti-cheat').checked,
    isActive: document.getElementById('test-is-active').checked
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/tests/${id}` : '/api/tests';

  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (res && res.success) {
    showToast(id ? 'Test yangilandi' : 'Test yaratildi', 'success');
    closeModal('modal-test');
    loadTests();
  }
});

async function deleteTest(id) {
  if (!confirm('Testni va unga tegishli savollarni o‘chirmoqchimisiz?')) return;
  const res = await apiFetch(`/api/tests/${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Test o‘chirildi', 'success');
    loadTests();
  }
}

// 4. QUESTIONS MANAGEMENT
async function loadQuestions() {
  const search = document.getElementById('questions-search').value.trim();
  const subjectId = document.getElementById('questions-filter-subject').value;
  const testId = document.getElementById('questions-filter-test').value;

  let query = `?page=${state.questionsPage}&limit=15`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (subjectId) query += `&subjectId=${subjectId}`;
  if (testId) query += `&testId=${testId}`;

  const res = await apiFetch(`/api/questions${query}`);
  const tbody = document.getElementById('questions-tbody');

  if (!res || !res.data || res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Savollar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map((q) => {
    const optsPreview = q.options.map((o) => `<b>${o.key}:</b> ${o.text}`).join(' | ');
    return `
      <tr>
        <td>
          <b>${escapeHtml(q.questionText)}</b>
          ${q.imageUrl ? `<br><a href="${q.imageUrl}" target="_blank" class="text-dim" style="font-size: 0.75rem;"><i class="fa-solid fa-image"></i> Rasmni ko‘rish</a>` : ''}
          ${q.explanation ? `<br><small class="text-dim">💡 <i>${escapeHtml(q.explanation)}</i></small>` : ''}
        </td>
        <td>
          ${q.subjectId ? `${q.subjectId.icon} ${q.subjectId.name}` : '—'}
          <br><small class="text-dim">${q.testId ? q.testId.title : 'Umumiy baza'}</small>
        </td>
        <td><small>${escapeHtml(optsPreview)}</small></td>
        <td><span class="badge badge-active">${q.correctAnswer}</span></td>
        <td><span class="badge badge-${q.difficulty}">${q.difficulty.toUpperCase()}</span></td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editQuestion('${q._id}')">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteQuestion('${q._id}')">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  renderPagination('questions-pagination', res.page, res.pages, (p) => {
    state.questionsPage = p;
    loadQuestions();
  });
}

document.getElementById('questions-search')?.addEventListener('input', debounce(loadQuestions, 400));
document.getElementById('questions-filter-subject')?.addEventListener('change', () => { state.questionsPage = 1; loadQuestions(); });
document.getElementById('questions-filter-test')?.addEventListener('change', () => { state.questionsPage = 1; loadQuestions(); });

document.getElementById('btn-create-question')?.addEventListener('click', async () => {
  document.getElementById('form-question').reset();
  document.getElementById('question-id').value = '';
  document.getElementById('modal-question-title').innerText = 'Yangi Savol Qo‘shish';

  // Populate test select for question modal
  const qTestSel = document.getElementById('q-test-select');
  qTestSel.innerHTML = '<option value="">Alohida testga biriktirmaslik</option>' +
    state.tests.map((t) => `<option value="${t._id}">${t.title}</option>`).join('');

  openModal('modal-question');
});

async function editQuestion(id) {
  const res = await apiFetch(`/api/questions/${id}`);
  if (!res || !res.data) return;
  const q = res.data;

  document.getElementById('question-id').value = q._id;
  document.getElementById('q-subject-select').value = q.subjectId ? q.subjectId._id : '';

  const qTestSel = document.getElementById('q-test-select');
  qTestSel.innerHTML = '<option value="">Alohida testga biriktirmaslik</option>' +
    state.tests.map((t) => `<option value="${t._id}">${t.title}</option>`).join('');
  qTestSel.value = q.testId ? q.testId._id : '';

  document.getElementById('q-diff').value = q.difficulty || 'medium';
  document.getElementById('q-text').value = q.questionText;

  const getOpt = (k) => (q.options.find((o) => o.key === k) || {}).text || '';
  document.getElementById('q-opt-a').value = getOpt('A');
  document.getElementById('q-opt-b').value = getOpt('B');
  document.getElementById('q-opt-c').value = getOpt('C');
  document.getElementById('q-opt-d').value = getOpt('D');

  document.getElementById('q-correct').value = q.correctAnswer;
  document.getElementById('q-image-url').value = q.imageUrl || '';
  document.getElementById('q-explanation').value = q.explanation || '';

  document.getElementById('modal-question-title').innerText = 'Savolni Tahrirlash';
  openModal('modal-question');
}

// Question Image File Upload
document.getElementById('q-image-file')?.addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('image', file);

  const res = await apiFetch('/api/questions/upload-image', {
    method: 'POST',
    body: formData
  });

  if (res && res.success) {
    document.getElementById('q-image-url').value = res.imageUrl;
    showToast('Rasm yuklandi', 'success');
  }
});

document.getElementById('form-question')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const id = document.getElementById('question-id').value;

  const options = [
    { key: 'A', text: document.getElementById('q-opt-a').value.trim() },
    { key: 'B', text: document.getElementById('q-opt-b').value.trim() }
  ];

  const optC = document.getElementById('q-opt-c').value.trim();
  const optD = document.getElementById('q-opt-d').value.trim();
  if (optC) options.push({ key: 'C', text: optC });
  if (optD) options.push({ key: 'D', text: optD });

  const body = {
    subjectId: document.getElementById('q-subject-select').value,
    testId: document.getElementById('q-test-select').value || null,
    difficulty: document.getElementById('q-diff').value,
    questionText: document.getElementById('q-text').value.trim(),
    options,
    correctAnswer: document.getElementById('q-correct').value,
    imageUrl: document.getElementById('q-image-url').value.trim(),
    explanation: document.getElementById('q-explanation').value.trim()
  };

  const method = id ? 'PUT' : 'POST';
  const url = id ? `/api/questions/${id}` : '/api/questions';

  const res = await apiFetch(url, { method, body: JSON.stringify(body) });
  if (res && res.success) {
    showToast(id ? 'Savol yangilandi' : 'Savol yaratildi', 'success');
    closeModal('modal-question');
    loadQuestions();
  }
});

async function deleteQuestion(id) {
  if (!confirm('Savolni o‘chirmoqchimisiz?')) return;
  const res = await apiFetch(`/api/questions/${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Savol o‘chirildi', 'success');
    loadQuestions();
  }
}

// 5. BULK IMPORT MANAGEMENT
function populateBulkSelects() {
  const bTestSelect = document.getElementById('bulk-test-select');
  if (bTestSelect) {
    bTestSelect.innerHTML = '<option value="">Alohida testga biriktirmaslik (Umumiy baza)</option>' +
      state.tests.map((t) => `<option value="${t._id}">${t.title}</option>`).join('');
  }
}

const bulkDropzone = document.getElementById('bulk-dropzone');
const bulkFileInput = document.getElementById('bulk-file-input');

bulkDropzone?.addEventListener('click', () => bulkFileInput.click());
bulkFileInput?.addEventListener('change', (e) => {
  handleBulkFileSelect(e.target.files[0]);
});

bulkDropzone?.addEventListener('dragover', (e) => {
  e.preventDefault();
  bulkDropzone.style.borderColor = '#3b82f6';
});
bulkDropzone?.addEventListener('dragleave', () => {
  bulkDropzone.style.borderColor = '';
});
bulkDropzone?.addEventListener('drop', (e) => {
  e.preventDefault();
  bulkDropzone.style.borderColor = '';
  if (e.dataTransfer.files.length > 0) {
    handleBulkFileSelect(e.dataTransfer.files[0]);
  }
});

function handleBulkFileSelect(file) {
  if (!file) return;
  state.bulkFile = file;
  const chip = document.getElementById('selected-file-name');
  chip.style.display = 'inline-block';
  chip.innerText = `📄 ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
}

// Bulk Preview
document.getElementById('btn-preview-bulk')?.addEventListener('click', async () => {
  const subjectId = document.getElementById('bulk-subject-select').value;
  if (!subjectId) {
    return showToast('Avval fanni tanlang', 'error');
  }
  if (!state.bulkFile) {
    return showToast('Faylni tanlang', 'error');
  }

  const formData = new FormData();
  formData.append('file', state.bulkFile);
  formData.append('subjectId', subjectId);
  formData.append('dryRun', 'true');

  const res = await apiFetch('/api/questions/bulk-import', {
    method: 'POST',
    body: formData
  });

  if (res && res.validation) {
    renderBulkPreview(res.validation);
  }
});

function renderBulkPreview(val) {
  const previewBox = document.getElementById('bulk-preview-result');
  const badge = document.getElementById('preview-badge');
  const errorDiv = document.getElementById('preview-errors');
  const tbody = document.getElementById('preview-tbody');

  previewBox.style.display = 'block';

  if (val.success) {
    badge.className = 'badge badge-easy';
    badge.innerText = `Barcha ${val.validCount} ta savol yaroqli ✅`;
    errorDiv.innerHTML = '';
  } else {
    badge.className = 'badge badge-hard';
    badge.innerText = `${val.validCount} ta yaroqli / ${val.errorsCount} ta xato ⚠️`;
    errorDiv.innerHTML = val.errors.map((err) => `<div>❌ ${escapeHtml(err)}</div>`).join('');
  }

  tbody.innerHTML = val.validQuestions.slice(0, 10).map((q, i) => {
    const getOpt = (k) => (q.options.find((o) => o.key === k) || {}).text || '—';
    return `
      <tr>
        <td>${i + 1}</td>
        <td><b>${escapeHtml(q.questionText)}</b></td>
        <td>${escapeHtml(getOpt('A'))}</td>
        <td>${escapeHtml(getOpt('B'))}</td>
        <td>${escapeHtml(getOpt('C'))}</td>
        <td>${escapeHtml(getOpt('D'))}</td>
        <td><span class="badge badge-active">${q.correctAnswer}</span></td>
        <td><small class="text-dim">${escapeHtml(q.explanation || '—')}</small></td>
      </tr>
    `;
  }).join('');

  if (val.validQuestions.length > 10) {
    tbody.innerHTML += `<tr><td colspan="8" class="text-center text-dim">...va yana ${val.validQuestions.length - 10} ta savol</td></tr>`;
  }
}

// Bulk Submit
document.getElementById('bulk-import-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const subjectId = document.getElementById('bulk-subject-select').value;
  const testId = document.getElementById('bulk-test-select').value;

  if (!subjectId) return showToast('Fanni tanlang', 'error');
  if (!state.bulkFile) return showToast('Faylni tanlang', 'error');

  const formData = new FormData();
  formData.append('file', state.bulkFile);
  formData.append('subjectId', subjectId);
  if (testId) formData.append('testId', testId);
  formData.append('dryRun', 'false');

  const res = await apiFetch('/api/questions/bulk-import', {
    method: 'POST',
    body: formData
  });

  if (res && res.success) {
    showToast(res.message, 'success');
    state.bulkFile = null;
    document.getElementById('selected-file-name').style.display = 'none';
    document.getElementById('bulk-preview-result').style.display = 'none';
    document.getElementById('bulk-import-form').reset();
    loadDashboardStats();
  }
});

// 6. USERS MANAGEMENT
async function loadUsers() {
  const search = document.getElementById('users-search').value.trim();
  const status = document.getElementById('users-filter-status').value;

  let query = `?page=${state.usersPage}&limit=15`;
  if (search) query += `&search=${encodeURIComponent(search)}`;
  if (status === 'blocked') query += `&isBlocked=true`;
  if (status === 'active') query += `&isBlocked=false`;

  const res = await apiFetch(`/api/users${query}`);
  const tbody = document.getElementById('users-tbody');

  if (!res || !res.data || res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">O‘quvchilar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map((u) => `
    <tr>
      <td><b>${escapeHtml(u.firstName || '')} ${escapeHtml(u.lastName || '')}</b></td>
      <td>@${u.username || 'yo‘q'}</td>
      <td><code>${u.telegramId || '—'}</code></td>
      <td><b>${u.totalScore}</b> / ${u.xp} XP</td>
      <td>Level ${u.level} (${u.levelName})</td>
      <td>${u.totalTests} ta</td>
      <td><span class="badge ${u.isBlocked ? 'badge-blocked' : 'badge-active'}">${u.isBlocked ? 'Bloklangan' : 'Aktiv'}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewUserStats('${u._id}')" title="Statistika">
          <i class="fa-solid fa-chart-simple"></i>
        </button>
        <button class="btn ${u.isBlocked ? 'btn-success' : 'btn-danger'} btn-sm" onclick="toggleBlockUser('${u._id}')" title="${u.isBlocked ? 'Blokdan chiqarish' : 'Bloklash'}">
          <i class="fa-solid ${u.isBlocked ? 'fa-lock-open' : 'fa-ban'}"></i>
        </button>
      </td>
    </tr>
  `).join('');

  renderPagination('users-pagination', res.page, res.pages, (p) => {
    state.usersPage = p;
    loadUsers();
  });
}

document.getElementById('users-search')?.addEventListener('input', debounce(loadUsers, 400));
document.getElementById('users-filter-status')?.addEventListener('change', () => { state.usersPage = 1; loadUsers(); });

async function toggleBlockUser(id) {
  const res = await apiFetch(`/api/users/${id}/block`, { method: 'PUT' });
  if (res && res.success) {
    showToast(res.message, 'success');
    loadUsers();
  }
}

async function viewUserStats(id) {
  const res = await apiFetch(`/api/users/${id}`);
  if (!res || !res.data) return;
  const { user, results, achievements } = res.data;

  const body = document.getElementById('user-stats-body');
  const accuracy = user.totalQuestions > 0 ? Math.round((user.totalCorrect / user.totalQuestions) * 100) : 0;

  body.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card glass-card">
        <div class="stat-content">
          <span class="stat-label">Jami Ball</span>
          <h3>${user.totalScore}</h3>
          <small class="stat-sub">${user.xp} XP (Level ${user.level})</small>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-content">
          <span class="stat-label">Aniqlik darajasi</span>
          <h3>${accuracy}%</h3>
          <small class="stat-sub">To‘g‘ri: ${user.totalCorrect} / Xato: ${user.totalWrong}</small>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-content">
          <span class="stat-label">Topshirgan Testlari</span>
          <h3>${user.totalTests} ta</h3>
          <small class="stat-sub">Eng yaxshi: ${user.bestScore}%</small>
        </div>
      </div>
    </div>

    <h4 class="mt-4 mb-2"><i class="fa-solid fa-clock-rotate-left"></i> So‘nggi topshirgan testlari:</h4>
    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Test</th>
            <th>Natija</th>
            <th>Ball</th>
            <th>Sana</th>
          </tr>
        </thead>
        <tbody>
          ${results.length === 0 ? '<tr><td colspan="4" class="text-center">Testlar yo‘q</td></tr>' : results.map((r) => `
            <tr>
              <td><b>${r.testTitle}</b></td>
              <td><span class="badge ${r.percentage >= 80 ? 'badge-easy' : 'badge-medium'}">${r.percentage}%</span></td>
              <td>${r.score}/${r.totalPossibleScore}</td>
              <td>${new Date(r.createdAt).toLocaleDateString('uz-UZ')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('user-stats-title').innerText = `${user.firstName || ''} ${user.lastName || ''} (@${user.username || 'yo‘q'})`;
  openModal('modal-user-stats');
}

// 7. RESULTS
async function loadResults() {
  const search = document.getElementById('results-search').value.trim();

  let query = `?page=${state.resultsPage}&limit=15`;
  if (search) query += `&search=${encodeURIComponent(search)}`;

  const res = await apiFetch(`/api/results${query}`);
  const tbody = document.getElementById('results-tbody');

  if (!res || !res.data || res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center">Natijalar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map((r) => `
    <tr>
      <td><b>${r.userId ? `${r.userId.firstName || ''} ${r.userId.lastName || ''}`.trim() : 'O‘quvchi'}</b></td>
      <td>${r.testTitle}</td>
      <td><b>${r.percentage}%</b> (${r.score}/${r.totalPossibleScore})</td>
      <td>✅ ${r.correctCount} / ❌ ${r.wrongCount}</td>
      <td>${Math.floor(r.timeSpentSeconds / 60)} daq ${r.timeSpentSeconds % 60} sek</td>
      <td><span class="badge badge-medium">${r.evaluationBadge}</span></td>
      <td>${new Date(r.createdAt).toLocaleDateString('uz-UZ')}</td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="viewResultDetail('${r._id}')">
          <i class="fa-solid fa-eye"></i> Tafsilot
        </button>
      </td>
    </tr>
  `).join('');

  renderPagination('results-pagination', res.page, res.pages, (p) => {
    state.resultsPage = p;
    loadResults();
  });
}

document.getElementById('results-search')?.addEventListener('input', debounce(loadResults, 400));

async function viewResultDetail(id) {
  const res = await apiFetch(`/api/results/${id}`);
  if (!res || !res.data) return;
  const r = res.data;

  const body = document.getElementById('res-detail-body');
  body.innerHTML = `
    <div class="stats-grid mb-3">
      <div class="stat-card glass-card">
        <div class="stat-content">
          <span class="stat-label">Natija</span>
          <h3>${r.percentage}%</h3>
          <small class="stat-sub">${r.score} / ${r.totalPossibleScore} ball</small>
        </div>
      </div>
      <div class="stat-card glass-card">
        <div class="stat-content">
          <span class="stat-label">To‘g‘ri / Xato</span>
          <h3>${r.correctCount} / ${r.wrongCount}</h3>
          <small class="stat-sub">Javobsiz: ${r.unansweredCount || 0}</small>
        </div>
      </div>
    </div>

    <h4 class="mt-4 mb-2"><i class="fa-solid fa-list-check"></i> Savollar va javoblar tahlili:</h4>
    <div class="table-responsive">
      <table class="custom-table">
        <thead>
          <tr>
            <th>Savol</th>
            <th>Tanlangan javob</th>
            <th>To‘g‘ri javob</th>
            <th>Holat</th>
          </tr>
        </thead>
        <tbody>
          ${(r.answersDetails || []).map((a, i) => `
            <tr>
              <td>
                <b>${i + 1}. ${escapeHtml(a.questionText)}</b>
                ${a.explanation ? `<br><small class="text-dim">💡 <i>${escapeHtml(a.explanation)}</i></small>` : ''}
              </td>
              <td>${a.selectedOption}) ${escapeHtml(a.selectedText || '')}</td>
              <td><b>${a.correctOption}) ${escapeHtml(a.correctText || '')}</b></td>
              <td><span class="badge ${a.isCorrect ? 'badge-easy' : 'badge-hard'}">${a.isCorrect ? 'To‘g‘ri' : 'Xato'}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('res-detail-title').innerText = `${r.testTitle} — ${r.userId ? r.userId.firstName : 'Natija'}`;
  openModal('modal-result-detail');
}

// 8. NOTIFICATIONS (BROADCAST)
async function loadNotifications() {
  const res = await apiFetch('/api/notifications');
  const tbody = document.getElementById('notifications-tbody');

  if (!res || !res.data || res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center">Xabarnomalar yo‘q</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map((n) => `
    <tr>
      <td><b>${escapeHtml(n.title)}</b><br><small class="text-dim">${escapeHtml(n.message).slice(0, 40)}...</small></td>
      <td>${n.targetType === 'all' ? 'Barcha o‘quvchilar' : 'Faol o‘quvchilar'}</td>
      <td><span class="badge badge-active">${n.sentCount} ta</span></td>
      <td>${new Date(n.createdAt).toLocaleDateString('uz-UZ')}</td>
    </tr>
  `).join('');
}

document.getElementById('broadcast-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const title = document.getElementById('notif-title').value.trim();
  const message = document.getElementById('notif-message').value.trim();
  const targetType = document.getElementById('notif-target').value;

  if (!confirm('Ushbu xabarni barcha o‘quvchilarga Telegram orqali yuborishni tasdiqlaysizmi?')) return;

  const res = await apiFetch('/api/notifications', {
    method: 'POST',
    body: JSON.stringify({ title, message, targetType })
  });

  if (res && res.success) {
    showToast(res.message, 'success');
    document.getElementById('broadcast-form').reset();
    loadNotifications();
  }
});

// 9. CERTIFICATES
async function loadCertificates() {
  const search = document.getElementById('cert-search').value.trim();
  let query = `?page=${state.certificatesPage}&limit=15`;
  if (search) query += `&search=${encodeURIComponent(search)}`;

  const res = await apiFetch(`/api/certificates${query}`);
  const tbody = document.getElementById('certificates-tbody');

  if (!res || !res.data || res.data.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center">Sertifikatlar topilmadi</td></tr>`;
    return;
  }

  tbody.innerHTML = res.data.map((c) => {
    const tgId = c.telegramId || c.userId?.telegramId;
    const tgBadge = tgId
      ? `<span class="badge badge-info" style="font-size:0.75rem; margin-left: 5px;"><i class="fa-brands fa-telegram"></i> ${tgId}</span>`
      : '';

    return `
    <tr>
      <td><code>${c.certificateNumber}</code></td>
      <td>
        <b>${escapeHtml(c.userName)}</b>
        ${tgBadge}
      </td>
      <td>${escapeHtml(c.testTitle)}</td>
      <td><span class="badge badge-easy">${c.percentage}%</span></td>
      <td>${new Date(c.issueDate || c.createdAt).toLocaleDateString('uz-UZ')}</td>
      <td>
        <div style="display: flex; gap: 6px; align-items: center;">
          <a href="/api/certificates/${c._id}/download" class="btn btn-primary btn-sm" target="_blank" title="PDF Yuklab olish">
            <i class="fa-solid fa-download"></i> PDF
          </a>
          <button class="btn btn-info btn-sm" onclick="promptSendCertToTg('${c._id}', ${tgId || 'null'}, '${escapeHtml(c.userName).replace(/'/g, "\\'")}')" title="Telegramga jo‘natish">
            <i class="fa-brands fa-telegram"></i> Jo‘natish
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteCertificate('${c._id}')" title="O‘chirish">
            <i class="fa-solid fa-trash"></i>
          </button>
        </div>
      </td>
    </tr>
  `}).join('');

  renderPagination('certificates-pagination', res.page, res.pages, (p) => {
    state.certificatesPage = p;
    loadCertificates();
  });
}

document.getElementById('cert-search')?.addEventListener('input', debounce(loadCertificates, 400));

// Create Certificate Button Click
document.getElementById('btn-create-cert')?.addEventListener('click', () => {
  document.getElementById('form-certificate').reset();
  document.getElementById('cert-percentage').value = 100;
  document.getElementById('cert-subject-title').value = 'O‘zbekiston';
  document.getElementById('cert-test-title').value = 'O‘zbekiston: Mustaqillik va Davlat Ramzlari';
  document.getElementById('cert-send-telegram').checked = true;
  openModal('modal-certificate');
});

// Create Certificate Form Submit
document.getElementById('form-certificate')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const userName = document.getElementById('cert-user-name').value.trim();
  const telegramId = document.getElementById('cert-telegram-id').value.trim();
  const percentage = document.getElementById('cert-percentage').value.trim();
  const subjectTitle = document.getElementById('cert-subject-title').value.trim();
  const testTitle = document.getElementById('cert-test-title').value.trim();
  const sendTelegram = document.getElementById('cert-send-telegram').checked;

  if (!userName) {
    showToast('O‘quvchi ism-familiyasini kiriting', 'error');
    return;
  }

  showToast('Sertifikat yaratilmoqda...', 'info');

  const res = await apiFetch('/api/certificates', {
    method: 'POST',
    body: JSON.stringify({
      userName,
      telegramId: telegramId ? Number(telegramId) : null,
      percentage: Number(percentage) || 100,
      subjectTitle,
      testTitle,
      sendTelegram
    })
  });

  if (res && res.success) {
    showToast(res.message || 'Sertifikat muvaffaqiyatli yaratildi!', 'success');
    closeModal('modal-certificate');
    loadCertificates();
  } else {
    showToast(res?.message || 'Sertifikat yaratishda xatolik yuz berdi', 'error');
  }
});

// Prompt or directly send Certificate to Telegram
function promptSendCertToTg(certId, existingTgId, userName) {
  if (existingTgId) {
    if (confirm(`${userName} (Telegram ID: ${existingTgId}) ga ushbu sertifikatni Telegram bot orqali jo‘natishni tasdiqlaysizmi?`)) {
      sendCertToTelegramDirect(certId, existingTgId);
    }
  } else {
    document.getElementById('send-cert-id').value = certId;
    document.getElementById('send-cert-telegram-id').value = '';
    document.getElementById('send-cert-desc').innerHTML = `<b>${userName}</b> uchun sertifikatni jo‘natish uchun Telegram ID raqamini kiriting:`;
    openModal('modal-send-cert-tg');
  }
}

// Send Certificate to Telegram Directly
async function sendCertToTelegramDirect(certId, telegramId) {
  showToast('Telegramga yuborilmoqda...', 'info');
  const res = await apiFetch(`/api/certificates/${certId}/send-telegram`, {
    method: 'POST',
    body: JSON.stringify({ telegramId })
  });

  if (res && res.success) {
    showToast(res.message || 'Sertifikat Telegramga muvaffaqiyatli yuborildi!', 'success');
    loadCertificates();
  } else {
    showToast(res?.message || 'Telegramga yuborishda xatolik yuz berdi', 'error');
  }
}

// Send Certificate Modal Form Submit
document.getElementById('form-send-cert-tg')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const certId = document.getElementById('send-cert-id').value;
  const telegramId = document.getElementById('send-cert-telegram-id').value.trim();

  if (!telegramId) {
    showToast('Telegram ID ni kiriting', 'error');
    return;
  }

  closeModal('modal-send-cert-tg');
  await sendCertToTelegramDirect(certId, Number(telegramId));
});

// Delete Certificate
async function deleteCertificate(id) {
  if (!confirm('Haqiqatan ham bu sertifikatni o‘chirmoqchimisiz?')) return;

  const res = await apiFetch(`/api/certificates/${id}`, { method: 'DELETE' });
  if (res && res.success) {
    showToast('Sertifikat o‘chirildi', 'success');
    loadCertificates();
  } else {
    showToast(res?.message || 'O‘chirishda xatolik', 'error');
  }
}


// MODAL UTILS
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.add('show');
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) modal.classList.remove('show');
}

document.querySelectorAll('[data-close]').forEach((btn) => {
  btn.addEventListener('click', () => {
    closeModal(btn.dataset.close);
  });
});

window.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-backdrop')) {
    e.target.classList.remove('show');
  }
});

// PAGINATION BUILDER
function renderPagination(containerId, currentPage, totalPages, onPageClick) {
  const container = document.getElementById(containerId);
  if (!container || totalPages <= 1) {
    if (container) container.innerHTML = '';
    return;
  }

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="(${onPageClick})(${i})">${i}</button>`;
  }
  container.innerHTML = html;
}

// UTILS: Debounce & Escape
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function escapeHtml(text) {
  if (!text) return '';
  return text.toString()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  renderAuthUI();
});
