const { createClient } = supabase;

const supabaseClient = createClient(
  window.APP_CONFIG.supabaseUrl,
  window.APP_CONFIG.supabaseAnonKey,
  { db: { schema: 'fire' } }
);

let allRows = [];
let filteredInspectionRows = [];
let activeFilter = 'all';
let currentFormRow = null;
let allIssues = [];
let filteredIssueRows = [];
let activeIssueFilter = 'pending';
let currentIssueRow = null;
let pendingIssueCount = 0;
let allPoints = [];
let filteredPointRows = [];
let activePointFilter = 'all';
let currentPointRow = null;
let isCreatingPoint = false;
let currentUser = null;
let allUsers = [];
let currentUserRow = null;
let isCreatingUser = false;

const SESSION_KEY = 'fireAppSession';

const CHECK_FIELDS = [
  { key: 'pressure_gauge', label: '1) มาตรวัดความดัน' },
  { key: 'safety_pin_and_seal', label: '2) สลักนิรภัยและซีล' },
  { key: 'connection_point', label: '3) จุดข้อต่อ' },
  { key: 'squeeze_handle', label: '4) คันบีบ' },
  { key: 'discharge_hose', label: '5) สายฉีดดับเพลิง' },
  { key: 'external_condition', label: '6) สภาพภายนอก' },
  { key: 'hose_quality', label: '7) คุณภาพสายดับเพลิง' },
  { key: 'expiry_check', label: '8) เช็ควันหมดอายุ' },
  { key: 'readiness', label: '9) ความพร้อมใช้งาน' }
];

const dashboardPage = document.getElementById('dashboardPage');
const inspectionPage = document.getElementById('inspectionPage');
const formPage = document.getElementById('formPage');
const appShell = document.getElementById('appShell');
const loginPage = document.getElementById('loginPage');
const loginUsernameEl = document.getElementById('loginUsername');
const loginPasswordEl = document.getElementById('loginPassword');
const btnLogin = document.getElementById('btnLogin');
const loginErrorEl = document.getElementById('loginError');
const currentUserNameEl = document.getElementById('currentUserName');
const currentUserRoleEl = document.getElementById('currentUserRole');
const btnLogout = document.getElementById('btnLogout');

const navDashboard = document.getElementById('navDashboard');
const navInspection = document.getElementById('navInspection');
const navUsers = document.getElementById('navUsers');
const bottomNav = document.getElementById('bottomNav');

const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const listEl = document.getElementById('list');
const searchInput = document.getElementById('searchInput');
const btnReload = document.getElementById('btnReload');
const btnExportInspectionCsv = document.getElementById('btnExportInspectionCsv');

const totalCountEl = document.getElementById('totalCount');
const checkedCountEl = document.getElementById('checkedCount');
const uncheckedCountEl = document.getElementById('uncheckedCount');
const issueCountEl = document.getElementById('issueCount');

const formPointCodeEl = document.getElementById('formPointCode');
const formLocationEl = document.getElementById('formLocation');
const formBuildingEl = document.getElementById('formBuilding');
const formHospitalZoneEl = document.getElementById('formHospitalZone');
const formTankColorEl = document.getElementById('formTankColor');
const checkItemsWrap = document.getElementById('checkItemsWrap');
const formNoteEl = document.getElementById('formNote');
const btnBack = document.getElementById('btnBack');
const btnSaveCheck = document.getElementById('btnSaveCheck');
const toastEl = document.getElementById('toast');
const issuesPage = document.getElementById('issuesPage');
const issueFormPage = document.getElementById('issueFormPage');

const navIssues = document.getElementById('navIssues');

const issueStatusEl = document.getElementById('issueStatus');
const issueErrorEl = document.getElementById('issueError');
const issueListEl = document.getElementById('issueList');
const issueSearchInput = document.getElementById('issueSearchInput');
const btnReloadIssues = document.getElementById('btnReloadIssues');
const btnExportIssuesCsv = document.getElementById('btnExportIssuesCsv');

const issueFormPointCodeEl = document.getElementById('issueFormPointCode');
const issueFormLocationEl = document.getElementById('issueFormLocation');
const issueFormBuildingEl = document.getElementById('issueFormBuilding');
const issueFormSummaryEl = document.getElementById('issueFormSummary');
const issueFixStatusInput = document.getElementById('issueFixStatusInput');
const issueFixNoteInput = document.getElementById('issueFixNoteInput');
const btnBackIssue = document.getElementById('btnBackIssue');
const btnSaveIssue = document.getElementById('btnSaveIssue');

const pointsPage = document.getElementById('pointsPage');
const navPoints = document.getElementById('navPoints');

const pointStatusEl = document.getElementById('pointStatus');
const pointErrorEl = document.getElementById('pointError');
const pointListEl = document.getElementById('pointList');
const pointSearchInput = document.getElementById('pointSearchInput');
const btnReloadPoints = document.getElementById('btnReloadPoints');
const btnExportPointsCsv = document.getElementById('btnExportPointsCsv');
const btnAddPoint = document.getElementById('btnAddPoint');

const pointFormPage = document.getElementById('pointFormPage');
const pointFormTitleEl = document.getElementById('pointFormTitle');

const pointFormCodeEl = document.getElementById('pointFormCode');
const pointFormLocationEl = document.getElementById('pointFormLocation');
const pointFormBuildingEl = document.getElementById('pointFormBuilding');
const pointFormHospitalZoneEl = document.getElementById('pointFormHospitalZone');
const pointFormNoteEl = document.getElementById('pointFormNote');

const pointFormTankColorEl = document.getElementById('pointFormTankColor');
const pointFormAssetStatusEl = document.getElementById('pointFormAssetStatus');
const pointFormExpiryDateEl = document.getElementById('pointFormExpiryDate');
const pointFormAssetNoteEl = document.getElementById('pointFormAssetNote');
const pointAssetHistoryListEl = document.getElementById('pointAssetHistoryList');

const btnBackPointForm = document.getElementById('btnBackPointForm');
const btnSavePointForm = document.getElementById('btnSavePointForm');
const btnReplaceAsset = document.getElementById('btnReplaceAsset');

const usersPage = document.getElementById('usersPage');
const userFormPage = document.getElementById('userFormPage');
const userSearchInput = document.getElementById('userSearchInput');
const btnReloadUsers = document.getElementById('btnReloadUsers');
const btnAddUser = document.getElementById('btnAddUser');
const userStatusEl = document.getElementById('userStatus');
const userErrorEl = document.getElementById('userError');
const userListEl = document.getElementById('userList');
const userFormUsernameEl = document.getElementById('userFormUsername');
const userFormPasswordEl = document.getElementById('userFormPassword');
const userFormFullnameEl = document.getElementById('userFormFullname');
const userFormRoleEl = document.getElementById('userFormRole');
const userFormStatusEl = document.getElementById('userFormStatus');
const btnBackUserForm = document.getElementById('btnBackUserForm');
const btnSaveUserForm = document.getElementById('btnSaveUserForm');

const btnPassAllChecks = document.getElementById('btnPassAllChecks');

const pointFormBuildingOtherWrapEl = document.getElementById('pointFormBuildingOtherWrap');
const pointFormBuildingOtherEl = document.getElementById('pointFormBuildingOther');

const BUILDINGS_BY_ZONE = {
  'รพ.หนองหาน 1': [
    'อาคาร PCU',
    'อาคารบริหาร 3 ชั้น',
    'อาคารกายภาพบำบัด',
    'อาคารแพทย์แผนไทย',
    'แฟลตแพทย์ 3 ชั้น',
    'แฟลตเจ้าหน้าที่',
    'ไตเทียม',
    'อาคารอื่นๆ...'
  ],
  'รพ.หนองหาน 2': [
    'อาคารผู้ป่วยนอก-อุบัติเหตุฉุกเฉิน',
    'อาคารผู้ป่วยใน 114 เตียง',
    'อาคารโภชนาการ',
    'อาคารคลังยา',
    'อาคารซักฟอก-จ่ายกลาง',
    'อาคารแสงตะวัน',
    'โซนบ้านพักเจ้าหน้าที่',
    'อาคารอื่นๆ...'
  ]
};

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.remove('hidden');
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => {
    toastEl.classList.add('hidden');
  }, 2200);
}

function bindEvent(element, eventName, handler, label) {
  if (!element) {
    console.warn(`Missing element for ${label || eventName}`);
    return;
  }

  element.addEventListener(eventName, handler);
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    role: user.role
  }));
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function setCurrentUser(user) {
  currentUser = user;
  currentUserNameEl.textContent = user
    ? `สวัสดี, ${user.fullname || user.username || '-'}`
    : 'สวัสดี, -';
  currentUserRoleEl.textContent = user ? getRoleLabel(user.role) : '-';
  updateRoleUI();
}

function getCurrentUser() {
  return currentUser;
}

function getCurrentUsername() {
  return getCurrentUser()?.username || 'unknown';
}

function getCurrentFullname() {
  return getCurrentUser()?.fullname || getCurrentUser()?.username || 'ไม่ทราบชื่อผู้ใช้';
}

function getCurrentRole() {
  return String(getCurrentUser()?.role || '').toLowerCase();
}

function isAdmin() {
  return getCurrentRole() === 'admin';
}

function isSupervisor() {
  return getCurrentRole() === 'supervisor';
}

function isInspector() {
  return getCurrentRole() === 'inspector';
}

function canEditPoints() {
  return isAdmin() || isSupervisor();
}

function canReplaceAsset() {
  return isAdmin() || isSupervisor();
}

function canCreatePoint() {
  return isAdmin() || isSupervisor();
}

function canResolveIssue() {
  return isAdmin() || isSupervisor();
}

function canSaveCheck() {
  return isAdmin() || isSupervisor() || isInspector();
}

function canManageUsers() {
  return isAdmin();
}

function getRoleLabel(role) {
  const roleKey = String(role || '').toLowerCase();
  if (roleKey === 'admin') return 'ผู้ดูแลระบบ';
  if (roleKey === 'supervisor') return 'ผู้ควบคุม';
  if (roleKey === 'inspector') return 'ผู้ตรวจสอบ';
  return '-';
}

function getUserStatusLabel(status) {
  const statusKey = String(status || '').toLowerCase();
  if (statusKey === 'active') return 'ใช้งาน';
  if (statusKey === 'inactive') return 'ระงับการใช้งาน';
  return status || '-';
}

function requireCurrentUser() {
  if (getCurrentUser()) return true;
  alert('กรุณาเข้าสู่ระบบใหม่');
  showLoginPage();
  return false;
}

function requireRole(checkFn, message = 'คุณไม่มีสิทธิ์ดำเนินการนี้') {
  if (!requireCurrentUser()) return false;
  if (checkFn()) return true;
  alert(message);
  return false;
}

function setPointFormEditable(canEdit) {
  pointFormCodeEl.readOnly = !canEdit;
  pointFormLocationEl.readOnly = !canEdit;
  pointFormBuildingEl.disabled = !canEdit;
  pointFormHospitalZoneEl.disabled = !canEdit;
  pointFormNoteEl.readOnly = !canEdit;
  pointFormTankColorEl.disabled = !canEdit;
  pointFormAssetStatusEl.disabled = !canEdit;
  pointFormExpiryDateEl.readOnly = !canEdit;
  pointFormAssetNoteEl.readOnly = !canEdit;
  if (pointFormBuildingOtherEl) pointFormBuildingOtherEl.disabled = !canEdit;
  btnSavePointForm.disabled = !canEdit;
}

function setIssueFormEditable(canEdit) {
  issueFixStatusInput.disabled = !canEdit;
  issueFixNoteInput.readOnly = !canEdit;
  btnSaveIssue.disabled = !canEdit;
}

function updateRoleUI() {
  const canManagePoints = canEditPoints();

  navUsers.classList.toggle('hidden', !canManageUsers());
  bottomNav.style.gridTemplateColumns = canManageUsers()
    ? '1fr 1fr 1fr 1fr 1fr'
    : '1fr 1fr 1fr 1fr';
  btnAddPoint.classList.toggle('hidden', !canCreatePoint());
  btnSavePointForm.disabled = !canManagePoints;
  btnReplaceAsset.classList.toggle('hidden', !canReplaceAsset() || isCreatingPoint);
  btnReplaceAsset.disabled = !canReplaceAsset() || isCreatingPoint;
  btnSaveIssue.disabled = !canResolveIssue();

  if (!canManageUsers() && (usersPage && userFormPage) && (
    !usersPage.classList.contains('hidden') || !userFormPage.classList.contains('hidden')
  )) {
    showDashboardPage();
  }
}

function showLoginPage() {
  loginPage.classList.remove('hidden');
  appShell.classList.add('hidden');
  bottomNav.classList.add('hidden');
  loginPasswordEl.value = '';
  loginErrorEl.textContent = '';
}

function showAppShell() {
  loginPage.classList.add('hidden');
  appShell.classList.remove('hidden');
  showDashboardPage();
}

async function logLoginAttempt({ username, loginResult, message, user = null }) {
  const { error } = await supabaseClient
    .from('login_logs')
    .insert({
      username,
      fullname: user?.fullname || null,
      role: user?.role || null,
      login_result: loginResult,
      message,
      device_info: navigator.userAgent
    });

  if (error) {
    console.warn('logLoginAttempt failed:', error.message);
  }
}

async function login() {
  const username = loginUsernameEl.value.trim();
  const password = loginPasswordEl.value;

  loginErrorEl.textContent = '';

  if (!username || !password) {
    loginErrorEl.textContent = 'กรุณากรอกชื่อผู้ใช้และรหัสผ่าน';
    return;
  }

  btnLogin.disabled = true;
  btnLogin.textContent = 'กำลังเข้าสู่ระบบ...';

  const { data: user, error } = await supabaseClient
    .from('users')
    .select('id, username, password, fullname, role, status')
    .eq('username', username)
    .eq('status', 'active')
    .maybeSingle();

  if (error) {
    btnLogin.disabled = false;
    btnLogin.textContent = 'เข้าสู่ระบบ';
    loginErrorEl.textContent = 'เข้าสู่ระบบไม่สำเร็จ';
    await logLoginAttempt({
      username,
      loginResult: 'failed',
      message: error.message
    });
    return;
  }

  if (!user || String(user.password || '') !== password) {
    btnLogin.disabled = false;
    btnLogin.textContent = 'เข้าสู่ระบบ';
    loginErrorEl.textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
    await logLoginAttempt({
      username,
      loginResult: 'failed',
      message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
    });
    return;
  }

  const sessionUser = {
    id: user.id,
    username: user.username,
    fullname: user.fullname,
    role: user.role
  };

  setCurrentUser(sessionUser);
  saveSession(sessionUser);
  await logLoginAttempt({
    username: sessionUser.username,
    loginResult: 'success',
    message: 'เข้าสู่ระบบสำเร็จ',
    user: sessionUser
  });

  btnLogin.disabled = false;
  btnLogin.textContent = 'เข้าสู่ระบบ';
  showAppShell();
  await loadInspectionData();
}

function logout() {
  clearSession();
  setCurrentUser(null);
  currentFormRow = null;
  currentIssueRow = null;
  currentPointRow = null;
  currentUserRow = null;
  isCreatingPoint = false;
  isCreatingUser = false;
  allRows = [];
  allIssues = [];
  allPoints = [];
  allUsers = [];
  pendingIssueCount = 0;
  updateRoleUI();
  showLoginPage();
}

function setActiveNav(page) {
  navDashboard.classList.toggle('active', page === 'dashboard');
  navInspection.classList.toggle('active', page === 'inspection');
  navIssues.classList.toggle('active', page === 'issues');
  navPoints.classList.toggle('active', page === 'points');
  navUsers.classList.toggle('active', page === 'users');
}

function showDashboardPage() {
  dashboardPage.classList.remove('hidden');
  inspectionPage.classList.add('hidden');
  issuesPage.classList.add('hidden');
  pointsPage.classList.add('hidden');
  formPage.classList.add('hidden');
  issueFormPage.classList.add('hidden');
  pointFormPage.classList.add('hidden');
  usersPage.classList.add('hidden');
  userFormPage.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  setActiveNav('dashboard');
}

function showInspectionPage() {
  dashboardPage.classList.add('hidden');
  inspectionPage.classList.remove('hidden');
  issuesPage.classList.add('hidden');
  pointsPage.classList.add('hidden');
  formPage.classList.add('hidden');
  issueFormPage.classList.add('hidden');
  pointFormPage.classList.add('hidden');
  usersPage.classList.add('hidden');
  userFormPage.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  setActiveNav('inspection');
}

function showIssuesPage() {
  dashboardPage.classList.add('hidden');
  inspectionPage.classList.add('hidden');
  pointsPage.classList.add('hidden');
  formPage.classList.add('hidden');
  issueFormPage.classList.add('hidden');
  issuesPage.classList.remove('hidden');
  pointFormPage.classList.add('hidden');
  usersPage.classList.add('hidden');
  userFormPage.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  setActiveNav('issues');
}

function showPointsPage() {
  dashboardPage.classList.add('hidden');
  inspectionPage.classList.add('hidden');
  issuesPage.classList.add('hidden');
  pointsPage.classList.remove('hidden');
  formPage.classList.add('hidden');
  issueFormPage.classList.add('hidden');
  pointFormPage.classList.add('hidden');
  usersPage.classList.add('hidden');
  userFormPage.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  setActiveNav('points');
}

function showIssueFormPage() {
  dashboardPage.classList.add('hidden');
  inspectionPage.classList.add('hidden');
  issuesPage.classList.add('hidden');
  pointsPage.classList.add('hidden');
  formPage.classList.add('hidden');
  issueFormPage.classList.remove('hidden');
  pointFormPage.classList.add('hidden');
  usersPage.classList.add('hidden');
  userFormPage.classList.add('hidden');
  bottomNav.classList.add('hidden');
}

function showFormPage() {
  dashboardPage.classList.add('hidden');
  inspectionPage.classList.add('hidden');
  issuesPage.classList.add('hidden');
  pointsPage.classList.add('hidden');
  issueFormPage.classList.add('hidden');
  formPage.classList.remove('hidden');
  pointFormPage.classList.add('hidden');
  usersPage.classList.add('hidden');
  userFormPage.classList.add('hidden');
  bottomNav.classList.add('hidden');
}

function getCardColorClass(tankColor) {
  return String(tankColor || '').toLowerCase() === 'green' ? 'green' : 'red';
}

function getActionButtonClass(row) {
  if (row.checked) return 'inspection-action-btn edit';
  return String(row.tank_color || '').toLowerCase() === 'green'
    ? 'inspection-action-btn green'
    : 'inspection-action-btn red';
}

function getActionButtonText(row) {
  return row.checked ? 'แก้ไข<br>ข้อมูล' : 'บันทึก<br>การตรวจ';
}

function getTankColorLabel(tankColor) {
  return String(tankColor || '').toLowerCase() === 'green' ? 'สีเขียว' : 'สีแดง';
}

function getTankColorFullLabel(tankColor) {
  const color = String(tankColor || '').toLowerCase();
  if (color === 'green') return 'ถังสีเขียว';
  if (color === 'red') return 'ถังสีแดง';
  return tankColor || '-';
}

function getAssetStatusLabel(status) {
  const statusKey = String(status || '').toLowerCase();
  if (statusKey === 'active') return 'พร้อมใช้งาน';
  if (statusKey === 'damaged') return 'ชำรุด';
  if (statusKey === 'not_ready') return 'ไม่พร้อมใช้';
  if (statusKey === 'disposed') return 'จำหน่าย';
  if (statusKey === 'replaced') return 'เปลี่ยนถังแล้ว';
  return status || '-';
}

function formatDateTime(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getCurrentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function updateSummary(rows) {
  totalCountEl.textContent = rows.length;
  checkedCountEl.textContent = rows.filter(r => r.checked).length;
  uncheckedCountEl.textContent = rows.filter(r => !r.checked).length;
  issueCountEl.textContent = pendingIssueCount;
}

function renderList(rows) {
  listEl.innerHTML = '';

  if (!rows.length) {
    listEl.innerHTML = `<div class="empty">ไม่พบข้อมูล</div>`;
    return;
  }

  rows.forEach(row => {
    const card = document.createElement('div');
    card.className = `inspection-card ${getCardColorClass(row.tank_color)}`;

    card.innerHTML = `
      <div class="inspection-left">
        <div class="inspection-code">${escapeHtml(row.point_code || '-')}</div>
        <div class="inspection-location">${escapeHtml(row.location || '-')}</div>
        <div class="inspection-meta">${escapeHtml(row.building || '-')} · ${escapeHtml(row.hospital_zone || '-')}</div>
        ${
          row.checked_at
            ? `<div class="inspection-sub">ตรวจล่าสุด: ${escapeHtml(formatDateTime(row.checked_at))}</div>`
            : `<div class="inspection-sub">ยังไม่เคยตรวจในเดือนนี้</div>`
        }
      </div>

      <div class="inspection-right">
        <button class="${getActionButtonClass(row)}" type="button">
          ${getActionButtonText(row)}
        </button>
      </div>
    `;

    card.querySelector('button').addEventListener('click', () => openCheckForm(row));
    listEl.appendChild(card);
  });
}

function renderIssueList(rows) {
  issueListEl.innerHTML = '';

  if (!rows.length) {
    issueListEl.innerHTML = `<div class="empty">ไม่พบรายการปัญหา</div>`;
    return;
  }

  rows.forEach(row => {
    const badgeClass = row.fix_status === 'fixed' ? 'fixed' : 'pending';
    const badgeText = row.fix_status === 'fixed' ? 'ซ่อมแล้ว' : 'รอดำเนินการ';

    const card = document.createElement('div');
    card.className = 'inspection-card issue-card';
    card.innerHTML = `
      <div class="inspection-left">
        <div class="card-head">
          <div class="inspection-code">${escapeHtml(row.point_code || '-')}</div>
          <span class="issue-badge ${badgeClass}">${badgeText}</span>
        </div>
        <div class="inspection-location">${escapeHtml(row.location || '-')}</div>
        <div class="inspection-meta">${escapeHtml(row.building || '-')} · ${escapeHtml(row.hospital_zone || '-')}</div>
        <div class="inspection-sub">ปัญหา: ${escapeHtml(row.problem_summary || '-')}</div>
        <div class="inspection-sub">บันทึกล่าสุด: ${escapeHtml(formatDateTime(row.updated_at || row.created_at || ''))}</div>
      </div>

      <div class="inspection-right">
        <button class="inspection-action-btn edit" type="button">จัดการ<br>ปัญหา</button>
      </div>
    `;

    card.querySelector('button').addEventListener('click', () => openIssueForm(row));
    issueListEl.appendChild(card);
  });
}

function applyIssueFilters() {
  const q = issueSearchInput.value.trim().toLowerCase();

  const filtered = allIssues.filter(row => {
    const matchKeyword =
      String(row.point_code || '').toLowerCase().includes(q) ||
      String(row.location || '').toLowerCase().includes(q) ||
      String(row.building || '').toLowerCase().includes(q) ||
      String(row.hospital_zone || '').toLowerCase().includes(q) ||
      String(row.problem_summary || '').toLowerCase().includes(q);

    if (!matchKeyword) return false;
    if (activeIssueFilter === 'pending') return row.fix_status === 'pending';
    if (activeIssueFilter === 'fixed') return row.fix_status === 'fixed';
    return true;
  });

  filteredIssueRows = filtered;
  renderIssueList(filtered);
}

function getIssueFixStatusLabel(status) {
  const statusKey = String(status || '').toLowerCase();
  if (statusKey === 'pending') return 'รอดำเนินการ';
  if (statusKey === 'fixed') return 'ซ่อมแล้ว';
  return status || '-';
}

function exportIssuesCsv() {
  if (!filteredIssueRows.length) {
    alert('ไม่มีข้อมูลสำหรับ export');
    return;
  }

  const headers = [
    'หมายเลขจุดติดตั้ง',
    'พิกัด',
    'อาคาร',
    'เขต',
    'ปัญหาที่พบ',
    'สถานะการแก้ไข',
    'บันทึกการแก้ไข',
    'ผู้รายงาน',
    'ผู้แก้ไข',
    'วันที่สร้าง',
    'วันที่อัปเดตล่าสุด'
  ];

  const rows = filteredIssueRows.map(row => [
    row.point_code || '',
    row.location || '',
    row.building || '',
    row.hospital_zone || '',
    row.problem_summary || '',
    getIssueFixStatusLabel(row.fix_status),
    row.fix_note || '',
    row.reported_by_name || '',
    row.fixed_by_name || '',
    row.created_at ? formatDateTime(row.created_at) : '',
    row.updated_at ? formatDateTime(row.updated_at) : ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(toCsvValue).join(','))
    .join('\r\n');

  downloadCsv(`issues-report-${getCurrentMonthKey()}.csv`, csvContent);
}

function openIssueForm(row) {
  currentIssueRow = row;

  issueFormPointCodeEl.textContent = row.point_code || '-';
  issueFormLocationEl.textContent = row.location || '-';
  issueFormBuildingEl.textContent = `${row.building || '-'} · ${row.hospital_zone || '-'}`;
  issueFormSummaryEl.textContent = row.problem_summary || '-';
  issueFixStatusInput.value = row.fix_status || 'pending';
  issueFixNoteInput.value = row.fix_note || '';
  setIssueFormEditable(canResolveIssue());

  showIssueFormPage();
}

async function saveIssueForm() {
  if (!currentIssueRow) return;
  if (!requireRole(canResolveIssue)) return;

  btnSaveIssue.disabled = true;
  btnSaveIssue.textContent = 'กำลังบันทึก...';

  const validationMessage = validateIssueForm();
  if (validationMessage) {
    resetButton(btnSaveIssue, 'บันทึกข้อมูล');
    alert(validationMessage);
    return;
  }

  const payload = {
    fix_status: issueFixStatusInput.value,
    fix_note: issueFixNoteInput.value.trim(),
    fixed_at: issueFixStatusInput.value === 'fixed' ? new Date().toISOString() : null,
    fixed_by: issueFixStatusInput.value === 'fixed' ? getCurrentUsername() : null,
    fixed_by_name: issueFixStatusInput.value === 'fixed' ? getCurrentFullname() : null
  };

  const { error } = await supabaseClient
    .from('issues')
    .update(payload)
    .eq('id', currentIssueRow.id);

  btnSaveIssue.disabled = false;
  btnSaveIssue.textContent = 'บันทึกข้อมูล';

  if (error) {
    alert('บันทึกการแก้ไขปัญหาไม่สำเร็จ: ' + error.message);
    return;
  }

  showToast('บันทึกการแก้ไขปัญหาสำเร็จ');
  await loadIssuesData();
  showIssuesPage();
}

async function loadIssuesData() {
  issueStatusEl.textContent = 'กำลังโหลดข้อมูล...';
  issueErrorEl.textContent = '';
  issueListEl.innerHTML = '';

  const { data, error } = await supabaseClient
    .from('v_issue_list')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    if (String(error.message || '').includes('v_issue_list')) {
      await loadIssuesDataFallback();
      return;
    }

    issueStatusEl.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    issueErrorEl.textContent = error.message;
    return;
  }

  allIssues = data || [];
  issueStatusEl.textContent = `โหลดข้อมูลสำเร็จ ${allIssues.length} รายการ`;
  applyIssueFilters();
}

async function loadIssuesDataFallback() {
  const { data: issues, error: issuesError } = await supabaseClient
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (issuesError) {
    issueStatusEl.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    issueErrorEl.textContent = issuesError.message;
    return;
  }

  const pointIds = [...new Set((issues || []).map(row => row.point_id).filter(Boolean))];
  let pointMap = new Map();

  if (pointIds.length) {
    const { data: points, error: pointsError } = await supabaseClient
      .from('points')
      .select('id, point_code, location, building, hospital_zone')
      .in('id', pointIds);

    if (pointsError) {
      issueStatusEl.textContent = 'โหลดรายการปัญหาสำเร็จ แต่โหลดข้อมูลจุดติดตั้งไม่สำเร็จ';
      issueErrorEl.textContent = pointsError.message;
    } else {
      pointMap = new Map((points || []).map(point => [String(point.id), point]));
    }
  }

  allIssues = (issues || []).map(row => {
    const point = pointMap.get(String(row.point_id)) || {};
    return {
      ...row,
      point_code: point.point_code || '',
      location: point.location || '',
      building: point.building || '',
      hospital_zone: point.hospital_zone || ''
    };
  });

  issueStatusEl.textContent = `โหลดข้อมูลสำเร็จ ${allIssues.length} รายการ`;
  applyIssueFilters();
}

function applyFilters() {
  const q = searchInput.value.trim().toLowerCase();

  const filtered = allRows.filter(row => {
    const matchKeyword =
      String(row.point_code || '').toLowerCase().includes(q) ||
      String(row.location || '').toLowerCase().includes(q) ||
      String(row.building || '').toLowerCase().includes(q) ||
      String(row.hospital_zone || '').toLowerCase().includes(q);

    if (!matchKeyword) return false;
    if (activeFilter === 'unchecked') return !row.checked;
    if (activeFilter === 'checked') return !!row.checked;
    if (activeFilter === 'issue') return String(row.overall_result || '') === 'พบปัญหา';
    if (activeFilter === 'red') return String(row.tank_color || '').toLowerCase() === 'red';
    if (activeFilter === 'green') return String(row.tank_color || '').toLowerCase() === 'green';
    return true;
  });

  filteredInspectionRows = filtered;
  renderList(filtered);
}

function toCsvValue(value) {
  const text = String(value ?? '');
  return `"${text.replace(/"/g, '""')}"`;
}

function downloadCsv(filename, csvContent) {
  const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function exportInspectionCsv() {
  if (!filteredInspectionRows.length) {
    alert('ไม่มีข้อมูลสำหรับ export');
    return;
  }

  const headers = [
    'หมายเลขจุดติดตั้ง',
    'พิกัด',
    'อาคาร',
    'เขต',
    'สีถัง',
    'สถานะถัง',
    'วันหมดอายุ',
    'วันที่ตรวจ',
    'ผู้ตรวจ',
    'ผลการตรวจ',
    'หมายเหตุ'
  ];

  const rows = filteredInspectionRows.map(row => [
    row.point_code || '',
    row.location || '',
    row.building || '',
    row.hospital_zone || '',
    getTankColorFullLabel(row.tank_color),
    row.asset_status || '',
    row.expiry_date || '',
    row.checked_at ? formatDateTime(row.checked_at) : '',
    row.checked_by_name || '',
    row.checked ? (row.overall_result || '') : 'ยังไม่ตรวจ',
    row.note || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(toCsvValue).join(','))
    .join('\r\n');

  downloadCsv(`inspection-report-${getCurrentMonthKey()}.csv`, csvContent);
}

function buildCheckItems(values = {}) {
  checkItemsWrap.innerHTML = '';

  CHECK_FIELDS.forEach(field => {
    const wrap = document.createElement('div');
    wrap.className = 'check-item';
    wrap.innerHTML = `
      <div class="check-name">${field.label}</div>
      <div class="segment">
        <button type="button" class="pass-btn" data-key="${field.key}">ผ่าน</button>
        <button type="button" class="fail-btn" data-key="${field.key}">ไม่ผ่าน</button>
      </div>
    `;

    const passBtn = wrap.querySelector('.pass-btn');
    const failBtn = wrap.querySelector('.fail-btn');
    const current = values[field.key] || '';

    if (current === 'ผ่าน') passBtn.classList.add('active', 'pass');
    if (current === 'ไม่ผ่าน') failBtn.classList.add('active', 'fail');

    passBtn.addEventListener('click', () => {
      passBtn.classList.add('active', 'pass');
      failBtn.classList.remove('active', 'fail');
    });

    failBtn.addEventListener('click', () => {
      failBtn.classList.add('active', 'fail');
      passBtn.classList.remove('active', 'pass');
    });

    checkItemsWrap.appendChild(wrap);
  });
}

function openCheckForm(row) {
  currentFormRow = row;
  formPointCodeEl.textContent = row.point_code || '-';
  formLocationEl.textContent = row.location || '-';
  formBuildingEl.textContent = row.building || '-';
  formHospitalZoneEl.textContent = row.hospital_zone || '-';
  formTankColorEl.textContent = getTankColorLabel(row.tank_color);
  formNoteEl.value = row.note || '';
  buildCheckItems(row.checkValues || {});
  showFormPage();
}

function getFormValues() {
  const values = {};
  let incomplete = false;

  CHECK_FIELDS.forEach(field => {
    const passBtn = document.querySelector(`.pass-btn[data-key="${field.key}"]`);
    const failBtn = document.querySelector(`.fail-btn[data-key="${field.key}"]`);

    if (passBtn.classList.contains('active')) {
      values[field.key] = 'ผ่าน';
    } else if (failBtn.classList.contains('active')) {
      values[field.key] = 'ไม่ผ่าน';
    } else {
      values[field.key] = '';
      incomplete = true;
    }
  });

  return { values, incomplete };
}

function buildProblemSummary(values) {
  const failed = CHECK_FIELDS
    .filter(field => values[field.key] === 'ไม่ผ่าน')
    .map(field => field.label.replace(/^\d+\)\s*/, ''));

  return failed.join(', ');
}


async function syncIssueForCheck({ checkId, point, overallResult, values }) {
  const { data: existingIssue, error: issueFindError } = await supabaseClient
    .from('issues')
    .select('*')
    .eq('check_id', checkId)
    .maybeSingle();

  if (issueFindError) {
    throw issueFindError;
  }

  if (overallResult === 'พบปัญหา') {
    const problemSummary = buildProblemSummary(values) || 'พบปัญหาจากการตรวจสอบ';

    const issuePayload = {
      point_id: point.point_id,
      check_id: checkId,
      problem_summary: problemSummary,
      reported_by: getCurrentUsername(),
      reported_by_name: getCurrentFullname(),
      fix_status: 'pending',
      fix_note: existingIssue?.fix_note || null,
      fixed_at: null,
      fixed_by: null,
      fixed_by_name: null
    };

    if (existingIssue?.id) {
      const { error } = await supabaseClient
        .from('issues')
        .update(issuePayload)
        .eq('id', existingIssue.id);

      if (error) throw error;
    } else {
      const { error } = await supabaseClient
        .from('issues')
        .insert(issuePayload);

      if (error) throw error;
    }

    return;
  }

  if (existingIssue?.id) {
    const { error } = await supabaseClient
      .from('issues')
      .update({
        fix_status: 'fixed',
        fix_note: existingIssue.fix_note || 'ระบบปิดงานอัตโนมัติหลังตรวจผ่าน',
        fixed_at: new Date().toISOString(),
        fixed_by: getCurrentUsername(),
        fixed_by_name: getCurrentFullname()
      })
      .eq('id', existingIssue.id);

    if (error) throw error;
  }
}

async function saveCheck() {
  if (!currentFormRow) return;
  if (!requireRole(canSaveCheck)) return;

  const { values, incomplete } = getFormValues();
  if (incomplete) {
    alert('กรุณาเลือกผลการตรวจให้ครบทั้ง 9 ข้อ');
    return;
  }

  btnSaveCheck.disabled = true;
  btnSaveCheck.textContent = 'กำลังบันทึก...';

  const monthKey = getCurrentMonthKey();
  const overallResult = Object.values(values).includes('ไม่ผ่าน') ? 'พบปัญหา' : 'ปกติ';

  const payload = {
    point_id: currentFormRow.point_id,
    asset_id: currentFormRow.asset_id || null,
    check_month: monthKey,
    checked_at: new Date().toISOString(),
    checked_by: getCurrentUsername(),
    checked_by_name: getCurrentFullname(),
    inspected_device: navigator.userAgent,
    pressure_gauge: values.pressure_gauge,
    safety_pin_and_seal: values.safety_pin_and_seal,
    connection_point: values.connection_point,
    squeeze_handle: values.squeeze_handle,
    discharge_hose: values.discharge_hose,
    external_condition: values.external_condition,
    hose_quality: values.hose_quality,
    expiry_check: values.expiry_check,
    readiness: values.readiness,
    overall_result: overallResult,
    note: formNoteEl.value.trim()
  };

  const { data: existing, error: checkError } = await supabaseClient
    .from('checks')
    .select('id')
    .eq('point_id', currentFormRow.point_id)
    .eq('check_month', monthKey)
    .maybeSingle();

  if (checkError) {
    btnSaveCheck.disabled = false;
    btnSaveCheck.textContent = 'บันทึกข้อมูล';
    alert('ตรวจสอบข้อมูลเดิมไม่สำเร็จ: ' + checkError.message);
    return;
  }

  let saveError = null;
  let savedCheckId = null;

  if (existing?.id) {
    const { data, error } = await supabaseClient
      .from('checks')
      .update(payload)
      .eq('id', existing.id)
      .select('id')
      .single();

    saveError = error;
    savedCheckId = data?.id || existing.id;
  } else {
    const { data, error } = await supabaseClient
      .from('checks')
      .insert(payload)
      .select('id')
      .single();

    saveError = error;
    savedCheckId = data?.id || null;
  }

  if (saveError) {
    btnSaveCheck.disabled = false;
    btnSaveCheck.textContent = 'บันทึกข้อมูล';
    alert('บันทึกผลการตรวจไม่สำเร็จ: ' + saveError.message);
    return;
  }

  try {
    await syncIssueForCheck({
      checkId: savedCheckId,
      point: currentFormRow,
      overallResult,
      values
    });
  } catch (err) {
    btnSaveCheck.disabled = false;
    btnSaveCheck.textContent = 'บันทึกข้อมูล';
    alert('บันทึกผลการตรวจสำเร็จ แต่จัดการรายการปัญหาไม่สำเร็จ: ' + (err.message || err));
    return;
  }

  btnSaveCheck.disabled = false;
  btnSaveCheck.textContent = 'บันทึกข้อมูล';

  showToast('บันทึกการตรวจสำเร็จ');
  await loadInspectionData();
  showInspectionPage();
}

async function loadInspectionData() {
  statusEl.textContent = 'กำลังโหลดข้อมูล...';
  errorEl.textContent = '';
  listEl.innerHTML = '';

  const monthKey = getCurrentMonthKey();

  const [
      { data: points, error: pointsError },
      { data: checks, error: checksError },
      { data: issues, error: issuesError }
    ] = await Promise.all([
      supabaseClient.from('v_point_current_asset').select('*').order('point_code', { ascending: true }),
      supabaseClient.from('checks').select('*').eq('check_month', monthKey),
      supabaseClient.from('issues').select('id').eq('fix_status', 'pending')
    ]);

  if (pointsError) {
    statusEl.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    errorEl.textContent = pointsError.message;
    return;
  }

  if (checksError) {
    statusEl.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    errorEl.textContent = checksError.message;
    return;
  }

  if (issuesError) {
    statusEl.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    errorEl.textContent = issuesError.message;
    return;
  } 

  const checkMap = new Map();
  (checks || []).forEach(item => checkMap.set(String(item.point_id), item));

  allRows = (points || []).map(row => {
    const check = checkMap.get(String(row.point_id));
    const checkValues = {};
    if (check) {
      CHECK_FIELDS.forEach(field => {
        checkValues[field.key] = check[field.key] || '';
      });
    }

    return {
      ...row,
      checked: !!check,
      checked_at: check?.checked_at || '',
      checked_by_name: check?.checked_by_name || '',
      overall_result: check?.overall_result || '',
      note: check?.note || '',
      checkValues
    };
  });
  
  pendingIssueCount = (issues || []).length;
  updateSummary(allRows);
  statusEl.textContent = `โหลดข้อมูลสำเร็จ ${allRows.length} รายการ`;
  applyFilters();
}

async function loadPointsData() {
  pointStatusEl.textContent = 'กำลังโหลดข้อมูล...';
  pointErrorEl.textContent = '';
  pointListEl.innerHTML = '';

  const { data, error } = await supabaseClient
    .from('v_point_current_asset')
    .select('*')
    .order('point_code', { ascending: true });

  if (error) {
    pointStatusEl.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    pointErrorEl.textContent = error.message;
    return;
  }

  allPoints = data || [];
  pointStatusEl.textContent = `โหลดข้อมูลสำเร็จ ${allPoints.length} รายการ`;
  applyPointFilters();
}

function renderPointsList(rows) {
  pointListEl.innerHTML = '';

  if (!rows.length) {
    pointListEl.innerHTML = `<div class="empty">ไม่พบข้อมูลจุดติดตั้ง</div>`;
    return;
  }

  rows.forEach(row => {
    const card = document.createElement('div');
    card.className = `inspection-card ${getCardColorClass(row.tank_color)}`;

    const tankColorText = row.tank_color === 'green' ? 'ถังสีเขียว' : 'ถังสีแดง';

    card.innerHTML = `
      <div class="inspection-left">
        <div class="inspection-code">${escapeHtml(row.point_code || '-')}</div>
        <div class="inspection-location">${escapeHtml(row.location || '-')}</div>
        <div class="inspection-meta">${escapeHtml(row.building || '-')} · ${escapeHtml(row.hospital_zone || '-')}</div>
        <div class="inspection-sub">สีถัง: ${escapeHtml(tankColorText)}</div>
        <div class="inspection-sub">สถานะถัง: ${escapeHtml(row.asset_status || '-')}</div>
        <div class="inspection-sub">วันหมดอายุ: ${escapeHtml(row.expiry_date || 'ไม่ระบุ')}</div>
      </div>

      <div class="inspection-right">
        <button class="inspection-action-btn edit" type="button">จัดการ<br>จุด</button>
      </div>
    `;

    card.querySelector('button').addEventListener('click', () => {
      openPointForm(row);
    });

    pointListEl.appendChild(card);
  });
}

function applyPointFilters() {
  const q = pointSearchInput.value.trim().toLowerCase();

  const filtered = allPoints.filter(row => {
    const matchKeyword =
      String(row.point_code || '').toLowerCase().includes(q) ||
      String(row.location || '').toLowerCase().includes(q) ||
      String(row.building || '').toLowerCase().includes(q) ||
      String(row.hospital_zone || '').toLowerCase().includes(q);

    if (!matchKeyword) return false;

    if (activePointFilter === 'red') {
      return String(row.tank_color || '').toLowerCase() === 'red';
    }

    if (activePointFilter === 'green') {
      return String(row.tank_color || '').toLowerCase() === 'green';
    }

    if (activePointFilter === 'active') {
      return String(row.asset_status || '').toLowerCase() === 'active';
    }

    if (activePointFilter === 'problem') {
      const status = String(row.asset_status || '').toLowerCase();
      return status === 'damaged' || status === 'not_ready';
    }

    return true;
  });

  filteredPointRows = filtered;
  renderPointsList(filtered);
}

function exportPointsCsv() {
  if (!filteredPointRows.length) {
    alert('ไม่มีข้อมูลสำหรับ export');
    return;
  }

  const headers = [
    'หมายเลขจุดติดตั้ง',
    'พิกัด',
    'อาคาร',
    'เขต',
    'สีถัง',
    'สถานะถัง',
    'วันหมดอายุ',
    'รอบติดตั้ง',
    'หมายเหตุจุดติดตั้ง',
    'หมายเหตุถัง'
  ];

  const rows = filteredPointRows.map(row => [
    row.point_code || '',
    row.location || '',
    row.building || '',
    row.hospital_zone || '',
    getTankColorFullLabel(row.tank_color),
    getAssetStatusLabel(row.asset_status),
    row.expiry_date || '',
    row.install_round || '',
    row.point_note || '',
    row.asset_note || ''
  ]);

  const csvContent = [headers, ...rows]
    .map(row => row.map(toCsvValue).join(','))
    .join('\r\n');

  downloadCsv(`points-report-${getCurrentMonthKey()}.csv`, csvContent);
}

function resetUserForm() {
  userFormUsernameEl.value = '';
  userFormPasswordEl.value = '';
  userFormFullnameEl.value = '';
  userFormRoleEl.value = 'inspector';
  userFormStatusEl.value = 'active';
}

function openNewUserForm() {
  if (!requireRole(canManageUsers)) return;

  isCreatingUser = true;
  currentUserRow = null;
  resetUserForm();
  showUserFormPage();
}

function openUserForm(row) {
  if (!requireRole(canManageUsers)) return;

  isCreatingUser = false;
  currentUserRow = row;
  userFormUsernameEl.value = row.username || '';
  userFormPasswordEl.value = '';
  userFormFullnameEl.value = row.fullname || '';
  userFormRoleEl.value = row.role || 'inspector';
  userFormStatusEl.value = row.status || 'active';
  showUserFormPage();
}

async function loadUsersData() {
  if (!requireRole(canManageUsers)) return;

  userStatusEl.textContent = 'กำลังโหลดข้อมูล...';
  userErrorEl.textContent = '';
  userListEl.innerHTML = '';

  const { data, error } = await supabaseClient
    .from('users')
    .select('id, username, fullname, role, status')
    .order('username', { ascending: true });

  if (error) {
    userStatusEl.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    userErrorEl.textContent = error.message;
    return;
  }

  allUsers = data || [];
  userStatusEl.textContent = `โหลดข้อมูลสำเร็จ ${allUsers.length} รายการ`;
  applyUserFilters();
}

function renderUsersList(rows) {
  userListEl.innerHTML = '';

  if (!rows.length) {
    userListEl.innerHTML = `<div class="empty">ไม่พบข้อมูลผู้ใช้</div>`;
    return;
  }

  rows.forEach(row => {
    const card = document.createElement('div');
    card.className = 'inspection-card';

    card.innerHTML = `
      <div class="inspection-left">
        <div class="inspection-code">${escapeHtml(row.username || '-')}</div>
        <div class="inspection-location">${escapeHtml(row.fullname || '-')}</div>
        <div class="inspection-meta">Role: ${escapeHtml(getRoleLabel(row.role))} · Status: ${escapeHtml(getUserStatusLabel(row.status))}</div>
      </div>

      <div class="inspection-right">
        <button class="inspection-action-btn edit" type="button">จัดการ<br>ผู้ใช้</button>
      </div>
    `;

    card.querySelector('button').addEventListener('click', () => openUserForm(row));
    userListEl.appendChild(card);
  });
}

function applyUserFilters() {
  const q = userSearchInput.value.trim().toLowerCase();

  const filtered = allUsers.filter(row => (
    String(row.username || '').toLowerCase().includes(q) ||
    String(row.fullname || '').toLowerCase().includes(q) ||
    String(row.role || '').toLowerCase().includes(q) ||
    String(row.status || '').toLowerCase().includes(q) ||
    getRoleLabel(row.role).toLowerCase().includes(q) ||
    getUserStatusLabel(row.status).toLowerCase().includes(q)
  ));

  renderUsersList(filtered);
}

async function saveUserForm() {
  if (!requireRole(canManageUsers)) return;

  btnSaveUserForm.disabled = true;
  btnSaveUserForm.textContent = 'กำลังบันทึก...';

  const validationMessage = validateUserForm();
  if (validationMessage) {
    resetButton(btnSaveUserForm, 'บันทึกข้อมูล');
    alert(validationMessage);
    return;
  }

  const username = userFormUsernameEl.value.trim().toLowerCase();
  const password = userFormPasswordEl.value;
  const payload = {
    username,
    fullname: userFormFullnameEl.value.trim(),
    role: userFormRoleEl.value,
    status: userFormStatusEl.value
  };

  const { data: duplicateUsers, error: duplicateError } = await supabaseClient
    .from('users')
    .select('id, username')
    .eq('username', payload.username);

  if (duplicateError) {
    btnSaveUserForm.disabled = false;
    btnSaveUserForm.textContent = 'บันทึกข้อมูล';
    alert('ตรวจสอบ username ไม่สำเร็จ: ' + duplicateError.message);
    return;
  }

  const duplicateUser = (duplicateUsers || []).find(user => (
    isCreatingUser || String(user.id) !== String(currentUserRow?.id)
  ));

  if (duplicateUser) {
    btnSaveUserForm.disabled = false;
    btnSaveUserForm.textContent = 'บันทึกข้อมูล';
    alert('username นี้ถูกใช้แล้ว');
    return;
  }

  if (password) {
    payload.password = password;
  }

  if (isCreatingUser) {
    const { data: insertedUser, error: insertError } = await supabaseClient
      .from('users')
      .insert(payload)
      .select('id')
      .maybeSingle();

    if (insertError) {
      btnSaveUserForm.disabled = false;
      btnSaveUserForm.textContent = 'บันทึกข้อมูล';
      alert('เพิ่มข้อมูลผู้ใช้ไม่สำเร็จ: ' + insertError.message);
      return;
    }

    if (!insertedUser) {
      btnSaveUserForm.disabled = false;
      btnSaveUserForm.textContent = 'บันทึกข้อมูล';
      alert('ไม่สามารถเพิ่มข้อมูลผู้ใช้ได้ อาจติด policy หรือไม่พบแถวข้อมูล');
      return;
    }
  } else {
    const { data: updatedUser, error: updateError } = await supabaseClient
      .from('users')
      .update(payload)
      .eq('id', currentUserRow.id)
      .select('id')
      .maybeSingle();

    if (updateError) {
      btnSaveUserForm.disabled = false;
      btnSaveUserForm.textContent = 'บันทึกข้อมูล';
      alert('บันทึกข้อมูลผู้ใช้ไม่สำเร็จ: ' + updateError.message);
      return;
    }

    if (!updatedUser) {
      btnSaveUserForm.disabled = false;
      btnSaveUserForm.textContent = 'บันทึกข้อมูล';
      alert('ไม่สามารถบันทึกข้อมูลผู้ใช้ได้ อาจติด policy หรือไม่พบแถวข้อมูล');
      return;
    }
  }

  btnSaveUserForm.disabled = false;
  btnSaveUserForm.textContent = 'บันทึกข้อมูล';
  isCreatingUser = false;

  showToast('บันทึกข้อมูลผู้ใช้สำเร็จ');
  await loadUsersData();
  showUsersPage();
}

function showPointFormPage() {
  dashboardPage.classList.add('hidden');
  inspectionPage.classList.add('hidden');
  issuesPage.classList.add('hidden');
  pointsPage.classList.add('hidden');
  formPage.classList.add('hidden');
  issueFormPage.classList.add('hidden');
  pointFormPage.classList.remove('hidden');
  usersPage.classList.add('hidden');
  userFormPage.classList.add('hidden');
  bottomNav.classList.add('hidden');
}

function showUsersPage() {
  if (!requireRole(canManageUsers)) return;

  dashboardPage.classList.add('hidden');
  inspectionPage.classList.add('hidden');
  issuesPage.classList.add('hidden');
  pointsPage.classList.add('hidden');
  formPage.classList.add('hidden');
  issueFormPage.classList.add('hidden');
  pointFormPage.classList.add('hidden');
  usersPage.classList.remove('hidden');
  userFormPage.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  setActiveNav('users');
}

function showUserFormPage() {
  if (!requireRole(canManageUsers)) return;

  dashboardPage.classList.add('hidden');
  inspectionPage.classList.add('hidden');
  issuesPage.classList.add('hidden');
  pointsPage.classList.add('hidden');
  formPage.classList.add('hidden');
  issueFormPage.classList.add('hidden');
  pointFormPage.classList.add('hidden');
  usersPage.classList.add('hidden');
  userFormPage.classList.remove('hidden');
  bottomNav.classList.add('hidden');
}

function formatDateForInput(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

async function loadPointAssetHistory(pointId) {
  if (!pointId) {
    renderPointAssetHistory([]);
    return;
  }

  pointAssetHistoryListEl.innerHTML = `<div class="empty">กำลังโหลดประวัติถัง...</div>`;

  const { data, error } = await supabaseClient
    .from('assets')
    .select('id, install_round, tank_color, asset_status, installed_at, removed_at, remove_reason, note')
    .eq('point_id', pointId)
    .order('install_round', { ascending: false })
    .order('installed_at', { ascending: false })
    .order('id', { ascending: false });

  if (error) {
    pointAssetHistoryListEl.innerHTML = `<div class="empty">โหลดประวัติถังไม่สำเร็จ</div>`;
    alert('โหลดประวัติถังไม่สำเร็จ: ' + error.message);
    return;
  }

  renderPointAssetHistory(data || []);
}

function renderPointAssetHistory(rows) {
  pointAssetHistoryListEl.innerHTML = '';

  if (!rows.length) {
    pointAssetHistoryListEl.innerHTML = `<div class="empty">ยังไม่มีประวัติถังย้อนหลัง</div>`;
    return;
  }

  rows.forEach(row => {
    const card = document.createElement('div');
    card.className = 'asset-history-card';

    card.innerHTML = `
      <div class="info-row"><strong>รอบติดตั้ง:</strong> ${escapeHtml(row.install_round || '-')}</div>
      <div class="info-row"><strong>สีถัง:</strong> ${escapeHtml(getTankColorFullLabel(row.tank_color))}</div>
      <div class="info-row"><strong>สถานะ:</strong> ${escapeHtml(row.asset_status || '-')}</div>
      <div class="info-row"><strong>ติดตั้งเมื่อ:</strong> ${escapeHtml(formatDateTime(row.installed_at) || '-')}</div>
      <div class="info-row"><strong>ถอดเมื่อ:</strong> ${escapeHtml(formatDateTime(row.removed_at) || '-')}</div>
      <div class="info-row"><strong>เหตุผลถอด:</strong> ${escapeHtml(row.remove_reason || '-')}</div>
      <div class="info-row"><strong>หมายเหตุ:</strong> ${escapeHtml(row.note || '-')}</div>
    `;

    pointAssetHistoryListEl.appendChild(card);
  });
}

function resetPointForm() {
  pointFormCodeEl.value = '';
  pointFormLocationEl.value = '';
  pointFormBuildingEl.value = '';
  pointFormHospitalZoneEl.value = '';
  pointFormNoteEl.value = '';
  pointFormTankColorEl.value = 'red';
  pointFormAssetStatusEl.value = 'active';
  pointFormExpiryDateEl.value = '';
  pointFormAssetNoteEl.value = '';
  if (pointFormHospitalZoneEl) pointFormHospitalZoneEl.value = '';
  populateBuildingOptionsByZone('', '');
  if (pointFormBuildingOtherEl) pointFormBuildingOtherEl.value = '';
}

function openNewPointForm() {
  if (!requireRole(canCreatePoint)) return;

  isCreatingPoint = true;
  currentPointRow = null;
  resetPointForm();
  pointFormTitleEl.textContent = 'เพิ่มจุดติดตั้ง';
  btnReplaceAsset.classList.add('hidden');
  btnReplaceAsset.disabled = true;
  setPointFormEditable(true);
  renderPointAssetHistory([]);
  showPointFormPage();
}

async function openPointForm(row) {
  isCreatingPoint = false;
  currentPointRow = row;
  pointFormTitleEl.textContent = 'จัดการจุดติดตั้ง';
  setPointFormEditable(canEditPoints());
  btnReplaceAsset.classList.toggle('hidden', !canReplaceAsset());
  btnReplaceAsset.disabled = !canReplaceAsset();

  pointFormCodeEl.value = row.point_code || '';
  pointFormLocationEl.value = row.location || '';
  pointFormHospitalZoneEl.value = row.hospital_zone || '';
  populateBuildingOptionsByZone(row.hospital_zone || '', row.building || '');
  pointFormNoteEl.value = row.point_note || '';

  pointFormTankColorEl.value = row.tank_color || 'red';
  pointFormAssetStatusEl.value = row.asset_status || 'active';
  pointFormExpiryDateEl.value = formatDateForInput(row.expiry_date);
  pointFormAssetNoteEl.value = row.asset_note || '';

  showPointFormPage();
  await loadPointAssetHistory(row.point_id);
}

async function createPointWithAsset() {
  if (!requireRole(canCreatePoint)) return;

  btnSavePointForm.disabled = true;
  btnSavePointForm.textContent = 'กำลังบันทึก...';

  const validationMessage = validatePointForm();
  if (validationMessage) {
    resetButton(btnSavePointForm, 'บันทึกข้อมูล');
    alert(validationMessage);
    return;
  }

  const pointPayload = {
    point_code: formatPointCode(pointFormCodeEl.value),
    location: pointFormLocationEl.value.trim(),
    building: getResolvedPointBuilding(),
    hospital_zone: pointFormHospitalZoneEl.value.trim(),
    note: pointFormNoteEl.value.trim()
  };

  const { data: duplicatePoints, error: duplicateError } = await supabaseClient
    .from('points')
    .select('id, point_code')
    .eq('point_code', pointPayload.point_code);

  if (duplicateError) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('ตรวจสอบหมายเลขจุดติดตั้งไม่สำเร็จ: ' + duplicateError.message);
    return;
  }

  if ((duplicatePoints || []).length) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('หมายเลขจุดติดตั้งนี้ถูกใช้แล้ว');
    return;
  }

  const { data: insertedPoint, error: pointError } = await supabaseClient
    .from('points')
    .insert(pointPayload)
    .select('id, point_code, location, building, hospital_zone, note')
    .maybeSingle();

  if (pointError) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('เพิ่มข้อมูลจุดติดตั้งไม่สำเร็จ: ' + pointError.message);
    return;
  }

  if (!insertedPoint) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('ไม่สามารถเพิ่มข้อมูลจุดติดตั้งได้ อาจติด policy หรือไม่พบแถวข้อมูล');
    return;
  }

  const { data: insertedAsset, error: assetError } = await supabaseClient
    .from('assets')
    .insert({
      point_id: insertedPoint.id,
      install_round: 1,
      tank_color: pointFormTankColorEl.value,
      asset_status: pointFormAssetStatusEl.value,
      expiry_date: pointFormExpiryDateEl.value || null,
      installed_at: new Date().toISOString(),
      note: pointFormAssetNoteEl.value.trim()
    })
    .select('id')
    .maybeSingle();

  if (assetError) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('เพิ่มข้อมูลถังไม่สำเร็จ: ' + assetError.message);
    return;
  }

  if (!insertedAsset) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('ไม่สามารถเพิ่มข้อมูลถังได้ อาจติด policy หรือไม่พบแถวข้อมูล');
    return;
  }

  btnSavePointForm.disabled = false;
  btnSavePointForm.textContent = 'บันทึกข้อมูล';
  isCreatingPoint = false;

  showToast('เพิ่มจุดติดตั้งสำเร็จ');
  await loadPointsData();
  await loadInspectionData();
  showPointsPage();
}

async function savePointForm() {
  if (isCreatingPoint) {
    await createPointWithAsset();
    return;
  }

  if (!requireRole(canEditPoints)) return;

  if (!currentPointRow) return;

  btnSavePointForm.disabled = true;
  btnSavePointForm.textContent = 'กำลังบันทึก...';

  const validationMessage = validatePointForm();
  if (validationMessage) {
    resetButton(btnSavePointForm, 'บันทึกข้อมูล');
    alert(validationMessage);
    return;
  }

  const pointPayload = {
    point_code: formatPointCode(pointFormCodeEl.value),
    location: pointFormLocationEl.value.trim(),
    building: getResolvedPointBuilding(),
    hospital_zone: pointFormHospitalZoneEl.value.trim(),
    note: pointFormNoteEl.value.trim()
  };

  const assetPayload = {
    tank_color: pointFormTankColorEl.value,
    asset_status: pointFormAssetStatusEl.value,
    expiry_date: pointFormExpiryDateEl.value || null,
    note: pointFormAssetNoteEl.value.trim()
  };

  const { data: duplicatePoints, error: duplicateError } = await supabaseClient
    .from('points')
    .select('id, point_code')
    .eq('point_code', pointPayload.point_code);

  if (duplicateError) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('ตรวจสอบหมายเลขจุดติดตั้งไม่สำเร็จ: ' + duplicateError.message);
    return;
  }

  const duplicatePoint = (duplicatePoints || []).find(point =>
    String(point.id) !== String(currentPointRow.point_id)
  );

  if (duplicatePoint) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('หมายเลขจุดติดตั้งนี้ถูกใช้แล้ว');
    return;
  }

  const { data: updatedPoint, error: pointError } = await supabaseClient
    .from('points')
    .update(pointPayload)
    .eq('id', currentPointRow.point_id)
    .select('id, point_code, location, building, hospital_zone, note')
    .maybeSingle();

  if (pointError) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('บันทึกข้อมูลจุดติดตั้งไม่สำเร็จ: ' + pointError.message);
    return;
  }

  if (!updatedPoint) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('ไม่สามารถอัปเดตข้อมูลจุดติดตั้งได้ อาจติด policy หรือไม่พบแถวข้อมูล');
    return;
  }


if (currentPointRow.asset_id) {
  const { data: updatedAsset, error: assetError } = await supabaseClient
    .from('assets')
    .update(assetPayload)
    .eq('id', currentPointRow.asset_id)
    .select('id, tank_color, asset_status, expiry_date, note')
    .maybeSingle();

  if (assetError) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('บันทึกข้อมูลถังไม่สำเร็จ: ' + assetError.message);
    return;
  }

  if (!updatedAsset) {
    btnSavePointForm.disabled = false;
    btnSavePointForm.textContent = 'บันทึกข้อมูล';
    alert('ไม่สามารถอัปเดตข้อมูลถังได้ อาจติด policy หรือไม่พบแถวข้อมูล');
    return;
  }
}

  btnSavePointForm.disabled = false;
  btnSavePointForm.textContent = 'บันทึกข้อมูล';

  showToast('บันทึกข้อมูลจุดติดตั้งสำเร็จ');
  await loadPointsData();
  await loadInspectionData();
  showPointsPage();
}

async function replaceAssetForPoint() {
  if (!requireRole(canReplaceAsset)) return;

  if (!currentPointRow || !currentPointRow.point_id) {
    alert('ไม่พบข้อมูลจุดติดตั้งสำหรับเปลี่ยนถัง');
    return;
  }

  if (!confirm('ยืนยันการเปลี่ยนถังใหม่ใช่หรือไม่')) return;

  btnReplaceAsset.disabled = true;
  btnReplaceAsset.textContent = 'กำลังเปลี่ยนถัง...';

  const now = new Date().toISOString();
  let oldAsset = null;

  if (currentPointRow.asset_id) {
    const { data, error } = await supabaseClient
      .from('assets')
      .select('id, install_round')
      .eq('id', currentPointRow.asset_id)
      .maybeSingle();

    if (error) {
      btnReplaceAsset.disabled = false;
      btnReplaceAsset.textContent = 'เปลี่ยนถังใหม่';
      alert('ดึงข้อมูลถังเดิมไม่สำเร็จ: ' + error.message);
      return;
    }

    oldAsset = data;
  }

  const oldInstallRound = Number(oldAsset?.install_round || 0);
  const newAssetStatus = 'active';

  if (oldAsset) {
    const { data: updatedAsset, error: updateError } = await supabaseClient
      .from('assets')
      .update({
        asset_status: 'replaced',
        removed_at: now,
        remove_reason: 'เปลี่ยนถังใหม่'
      })
      .eq('id', oldAsset.id)
      .select('id')
      .maybeSingle();

    if (updateError) {
      btnReplaceAsset.disabled = false;
      btnReplaceAsset.textContent = 'เปลี่ยนถังใหม่';
      alert('ปิดถังเดิมไม่สำเร็จ: ' + updateError.message);
      return;
    }

    if (!updatedAsset) {
      btnReplaceAsset.disabled = false;
      btnReplaceAsset.textContent = 'เปลี่ยนถังใหม่';
      alert('ไม่สามารถปิดถังเดิมได้ อาจติด policy หรือไม่พบแถวข้อมูล');
      return;
    }
  }

  const { data: insertedAsset, error: insertError } = await supabaseClient
    .from('assets')
    .insert({
      point_id: currentPointRow.point_id,
      install_round: Number.isFinite(oldInstallRound) ? oldInstallRound + 1 : 1,
      tank_color: pointFormTankColorEl.value,
      asset_status: newAssetStatus,
      expiry_date: pointFormExpiryDateEl.value || null,
      installed_at: now,
      note: pointFormAssetNoteEl.value.trim()
    })
    .select('id')
    .maybeSingle();

  if (insertError) {
    btnReplaceAsset.disabled = false;
    btnReplaceAsset.textContent = 'เปลี่ยนถังใหม่';
    alert('สร้างถังใหม่ไม่สำเร็จ: ' + insertError.message);
    return;
  }

  if (!insertedAsset) {
    btnReplaceAsset.disabled = false;
    btnReplaceAsset.textContent = 'เปลี่ยนถังใหม่';
    alert('ไม่สามารถสร้างถังใหม่ได้ อาจติด policy หรือไม่พบแถวข้อมูล');
    return;
  }

  btnReplaceAsset.disabled = false;
  btnReplaceAsset.textContent = 'เปลี่ยนถังใหม่';

  showToast('เปลี่ยนถังใหม่สำเร็จ');
  await loadPointsData();
  await loadInspectionData();
  showPointsPage();
}

function setAllChecksPass() {
  CHECK_FIELDS.forEach(field => {
    const passBtn = document.querySelector(`.pass-btn[data-key="${field.key}"]`);
    const failBtn = document.querySelector(`.fail-btn[data-key="${field.key}"]`);

    if (passBtn) passBtn.classList.add('active', 'pass');
    if (failBtn) failBtn.classList.remove('active', 'fail');
  });
}

bindEvent(searchInput, 'input', applyFilters, 'searchInput');
bindEvent(btnLogin, 'click', login, 'btnLogin');
bindEvent(loginUsernameEl, 'keydown', event => {
  if (event.key === 'Enter') login();
}, 'loginUsername');
bindEvent(loginPasswordEl, 'keydown', event => {
  if (event.key === 'Enter') login();
}, 'loginPassword');
bindEvent(btnLogout, 'click', logout, 'btnLogout');
bindEvent(btnReload, 'click', loadInspectionData, 'btnReload');
bindEvent(btnExportInspectionCsv, 'click', exportInspectionCsv, 'btnExportInspectionCsv');
bindEvent(btnBack, 'click', showInspectionPage, 'btnBack');
bindEvent(btnSaveCheck, 'click', saveCheck, 'btnSaveCheck');
bindEvent(navDashboard, 'click', showDashboardPage, 'navDashboard');
bindEvent(navInspection, 'click', async () => {
  showInspectionPage();
  await loadInspectionData();
}, 'navInspection');

bindEvent(navIssues, 'click', async () => {
  showIssuesPage();
  await loadIssuesData();
}, 'navIssues');

bindEvent(issueSearchInput, 'input', applyIssueFilters, 'issueSearchInput');
bindEvent(btnReloadIssues, 'click', loadIssuesData, 'btnReloadIssues');
bindEvent(btnExportIssuesCsv, 'click', exportIssuesCsv, 'btnExportIssuesCsv');
bindEvent(btnBackIssue, 'click', showIssuesPage, 'btnBackIssue');
bindEvent(btnSaveIssue, 'click', saveIssueForm, 'btnSaveIssue');

bindEvent(navPoints, 'click', async () => {
  showPointsPage();
  await loadPointsData();
}, 'navPoints');
bindEvent(navUsers, 'click', async () => {
  if (!requireRole(canManageUsers)) return;
  showUsersPage();
  await loadUsersData();
}, 'navUsers');

function formatPointCode(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (!digits) return '';

  const number = parseInt(digits, 10);
  if (Number.isNaN(number)) return '';

  return `P-${String(number).padStart(3, '0')}`;
}

function isValidPointCode(value) {
  return /^P-\d{3}$/.test(formatPointCode(value));
}

function resetButton(button, text) {
  if (!button) return;
  button.disabled = false;
  button.textContent = text;
}

function getResolvedPointBuilding() {
  if (pointFormBuildingEl.value === 'อาคารอื่นๆ...') {
    return pointFormBuildingOtherEl?.value.trim() || '';
  }

  return pointFormBuildingEl.value.trim();
}

function validatePointForm() {
  const formattedPointCode = formatPointCode(pointFormCodeEl.value);
  pointFormCodeEl.value = formattedPointCode;

  if (!formattedPointCode) {
    return 'กรุณาระบุหมายเลขจุดติดตั้ง';
  }

  if (!isValidPointCode(formattedPointCode)) {
    return 'กรุณาระบุหมายเลขจุดติดตั้งให้ถูกต้อง เช่น P-001';
  }

  if (!pointFormHospitalZoneEl.value) {
    return 'กรุณาเลือกเขต';
  }

  if (!pointFormBuildingEl.value) {
    return 'กรุณาเลือกอาคาร';
  }

  if (pointFormBuildingEl.value === 'อาคารอื่นๆ...' && !getResolvedPointBuilding()) {
    return 'กรุณาระบุชื่ออาคาร';
  }

  if (!pointFormLocationEl.value.trim()) {
    return 'กรุณาระบุพิกัด';
  }

  if (!pointFormTankColorEl.value) {
    return 'กรุณาเลือกสีถัง';
  }

  if (!pointFormAssetStatusEl.value) {
    return 'กรุณาเลือกสถานะถัง';
  }

  const expiryDate = pointFormExpiryDateEl.value;
  if (expiryDate) {
    const match = expiryDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    const parsedDate = match
      ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
      : null;
    if (
      !match ||
      Number.isNaN(parsedDate.getTime()) ||
      parsedDate.getFullYear() !== Number(match[1]) ||
      parsedDate.getMonth() !== Number(match[2]) - 1 ||
      parsedDate.getDate() !== Number(match[3])
    ) {
      return 'กรุณาระบุวันหมดอายุให้ถูกต้อง';
    }
  }

  return '';
}

function validateIssueForm() {
  if (!issueFixStatusInput.value) {
    return 'กรุณาเลือกสถานะการแก้ไข';
  }

  if (issueFixStatusInput.value === 'fixed' && !issueFixNoteInput.value.trim()) {
    return 'กรุณากรอกบันทึกการแก้ไข';
  }

  return '';
}

function validateUserForm() {
  const username = userFormUsernameEl.value.trim().toLowerCase();
  userFormUsernameEl.value = username;

  if (!username) {
    return 'กรุณากรอก username';
  }

  if (!/^[a-zA-Z0-9._-]{3,30}$/.test(username)) {
    return 'username ใช้ได้เฉพาะตัวอักษรอังกฤษ ตัวเลข จุด ขีดกลาง และขีดล่าง ความยาว 3-30 ตัวอักษร';
  }

  const password = userFormPasswordEl.value;
  if (isCreatingUser && !password) {
    return 'กรุณากรอก password';
  }

  if (password && password.length < 4) {
    return 'password ต้องยาวอย่างน้อย 4 ตัวอักษร';
  }

  if (!userFormFullnameEl.value.trim()) {
    return 'กรุณากรอกชื่อ-สกุล';
  }

  if (!userFormRoleEl.value) {
    return 'กรุณาเลือก role';
  }

  if (!userFormStatusEl.value) {
    return 'กรุณาเลือก status';
  }

  return '';
}

function populateBuildingOptionsByZone(zone, selectedBuilding = '') {
  if (!pointFormBuildingEl) return;

  const options = BUILDINGS_BY_ZONE[zone] || [];
  pointFormBuildingEl.innerHTML =
    `<option value="">เลือกอาคาร</option>` +
    options.map(name => `<option value="${name}">${name}</option>`).join('');

  if (selectedBuilding && options.includes(selectedBuilding)) {
    pointFormBuildingEl.value = selectedBuilding;
    pointFormBuildingOtherWrapEl?.classList.add('hidden');
    if (pointFormBuildingOtherEl) pointFormBuildingOtherEl.value = '';
    return;
  }

  if (selectedBuilding && !options.includes(selectedBuilding)) {
    pointFormBuildingEl.value = 'อาคารอื่นๆ...';
    pointFormBuildingOtherWrapEl?.classList.remove('hidden');
    if (pointFormBuildingOtherEl) pointFormBuildingOtherEl.value = selectedBuilding;
    return;
  }

  pointFormBuildingEl.value = '';
  pointFormBuildingOtherWrapEl?.classList.add('hidden');
  if (pointFormBuildingOtherEl) pointFormBuildingOtherEl.value = '';
}

function handleHospitalZoneChange() {
  const zone = pointFormHospitalZoneEl.value;
  populateBuildingOptionsByZone(zone, '');
}

function handleBuildingChange() {
  const value = pointFormBuildingEl.value;
  if (value === 'อาคารอื่นๆ...') {
    pointFormBuildingOtherWrapEl?.classList.remove('hidden');
  } else {
    pointFormBuildingOtherWrapEl?.classList.add('hidden');
    if (pointFormBuildingOtherEl) pointFormBuildingOtherEl.value = '';
  }
}

bindEvent(pointSearchInput, 'input', applyPointFilters, 'pointSearchInput');
bindEvent(btnReloadPoints, 'click', loadPointsData, 'btnReloadPoints');
bindEvent(btnExportPointsCsv, 'click', exportPointsCsv, 'btnExportPointsCsv');
bindEvent(btnAddPoint, 'click', openNewPointForm, 'btnAddPoint');

bindEvent(btnBackPointForm, 'click', showPointsPage, 'btnBackPointForm');
bindEvent(btnSavePointForm, 'click', savePointForm, 'btnSavePointForm');
bindEvent(btnReplaceAsset, 'click', replaceAssetForPoint, 'btnReplaceAsset');
bindEvent(userSearchInput, 'input', applyUserFilters, 'userSearchInput');
bindEvent(btnReloadUsers, 'click', loadUsersData, 'btnReloadUsers');
bindEvent(btnAddUser, 'click', openNewUserForm, 'btnAddUser');
bindEvent(btnBackUserForm, 'click', showUsersPage, 'btnBackUserForm');
bindEvent(btnSaveUserForm, 'click', saveUserForm, 'btnSaveUserForm');

bindEvent(pointFormCodeEl, 'blur', () => {
  const formatted = formatPointCode(pointFormCodeEl.value);
  pointFormCodeEl.value = formatted;
}, 'pointFormCodeBlurFormat');

bindEvent(pointFormHospitalZoneEl, 'change', handleHospitalZoneChange, 'pointFormHospitalZoneChange');
bindEvent(pointFormBuildingEl, 'change', handleBuildingChange, 'pointFormBuildingChange');

document.querySelectorAll('#filterRow .filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#filterRow .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

document.querySelectorAll('#issueFilterRow .filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#issueFilterRow .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeIssueFilter = btn.dataset.filter;
    applyIssueFilters();
  });
});

document.querySelectorAll('#pointFilterRow .filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#pointFilterRow .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activePointFilter = btn.dataset.filter;
    applyPointFilters();
  });
});

const savedUser = loadSession();
if (savedUser) {
  setCurrentUser(savedUser);
  showAppShell();
  loadInspectionData();
} else {
  showLoginPage();

  
}

bindEvent(btnPassAllChecks, 'click', setAllChecksPass, 'btnPassAllChecks');


// ─────────────────────────────────────────
// UI PATCH — redesigned rendering overrides
// ─────────────────────────────────────────
/**
 * app-patch.js — UI rendering overrides for Fire Check NH redesign
 * Loaded after app.js; overrides rendering functions while keeping all logic intact.
 */

// ── Constants ──────────────────────────────────────────────────────────────
const RING_C = 2 * Math.PI * 52; // circumference for r=52 ≈ 326.73

const THAI_MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน',
  'พฤษภาคม','มิถุนายน','กรกฎาคม','สิงหาคม',
  'กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม'
];

const PATCH_CHECK_FIELDS = [
  { key: 'pressure_gauge',      label: '1) มาตรวัดความดัน' },
  { key: 'safety_pin_and_seal', label: '2) สลักนิรภัยและซีล' },
  { key: 'connection_point',    label: '3) จุดข้อต่อ' },
  { key: 'squeeze_handle',      label: '4) คันบีบ' },
  { key: 'discharge_hose',      label: '5) สายฉีดดับเพลิง' },
  { key: 'external_condition',  label: '6) สภาพภายนอก' },
  { key: 'hose_quality',        label: '7) คุณภาพสายดับเพลิง' },
  { key: 'expiry_check',        label: '8) เช็ควันหมดอายุ' },
  { key: 'readiness',           label: '9) ความพร้อมใช้งาน' }
];

// ── Dashboard: month label ─────────────────────────────────────────────────
(function setDashMonthLabel() {
  const now = new Date();
  const el = document.getElementById('dashMonthLabel');
  if (el) el.textContent = THAI_MONTHS[now.getMonth()] + ' ' + (now.getFullYear() + 543);
})();

// ── updateSummary — ring + badge + totalAll ────────────────────────────────
const _origUpdateSummary = window.updateSummary;
window.updateSummary = function(rows) {
  // Run original to update all count elements + issueCount from pendingIssueCount
  if (_origUpdateSummary) _origUpdateSummary(rows);

  const total   = rows.length;
  const checked = rows.filter(r => r.checked).length;

  // totalCountAll (bottom of dashboard card)
  const totalAllEl = document.getElementById('totalCountAll');
  if (totalAllEl) totalAllEl.textContent = total;

  // Progress ring
  const pct  = total > 0 ? checked / total : 0;
  const ring = document.getElementById('ringProgress');
  if (ring) {
    ring.style.strokeDasharray  = RING_C + ' ' + RING_C;
    ring.style.strokeDashoffset = RING_C * (1 - pct);
  }

  // Nav badge (reads from DOM after original sets it)
  const issueNum = parseInt((document.getElementById('issueCount') || {}).textContent, 10) || 0;
  const badge    = document.getElementById('issueNavBadge');
  if (badge) badge.textContent = issueNum > 0 ? String(issueNum) : '';
};

// ── showToast ──────────────────────────────────────────────────────────────
window.showToast = function(message) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = message;
  el.className = 'toast success';
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => { el.className = 'toast success hidden'; }, 2400);
};

// ── renderList (inspection cards) ─────────────────────────────────────────
window.renderList = function(rows) {
  const listEl = document.getElementById('list');
  listEl.innerHTML = '';
  if (!rows.length) {
    listEl.innerHTML = '<div class="empty">ไม่พบข้อมูล</div>';
    return;
  }
  rows.forEach(row => {
    const isGreen = String(row.tank_color || '').toLowerCase() === 'green';
    const colorClass = isGreen ? 'green' : 'red';

    const tankTag = isGreen
      ? '<span class="tag green-tank">ถังเขียว</span>'
      : '<span class="tag red-tank">ถังแดง</span>';

    let statusTag;
    if (row.checked) {
      statusTag = String(row.overall_result) === 'พบปัญหา'
        ? '<span class="tag issue">พบปัญหา</span>'
        : '<span class="tag checked">ตรวจแล้ว</span>';
    } else {
      statusTag = '<span class="tag unchecked">ยังไม่ตรวจ</span>';
    }

    const subLine = row.checked_at
      ? '<div class="inspection-sub">ตรวจล่าสุด: ' + escapeHtml(formatDateTime(row.checked_at)) + '</div>'
      : '<div class="inspection-sub">ยังไม่เคยตรวจในเดือนนี้</div>';

    const actionClass = row.checked ? 'edit' : colorClass;
    const actionText  = row.checked ? 'แก้ไข' : 'บันทึกผล';

    const card = document.createElement('div');
    card.className = 'inspection-card ' + colorClass;
    card.innerHTML =
      '<div class="card-stripe"></div>' +
      '<div class="inspection-left">' +
        '<div class="inspection-code">' + escapeHtml(row.point_code || '-') + '</div>' +
        '<div class="inspection-location">' + escapeHtml(row.location || '-') + '</div>' +
        '<div class="inspection-meta">' + escapeHtml(row.building || '-') + ' · ' + escapeHtml(row.hospital_zone || '-') + '</div>' +
        '<div class="inspection-tags">' + tankTag + statusTag + '</div>' +
        subLine +
      '</div>' +
      '<div class="inspection-right">' +
        '<button class="inspection-action-btn ' + actionClass + '" type="button">' + actionText + '</button>' +
      '</div>';
    card.querySelector('button').addEventListener('click', function() { openCheckForm(row); });
    listEl.appendChild(card);
  });
};

// ── renderIssueList ────────────────────────────────────────────────────────
window.renderIssueList = function(rows) {
  const issueListEl = document.getElementById('issueList');
  issueListEl.innerHTML = '';
  if (!rows.length) {
    issueListEl.innerHTML = '<div class="empty">ไม่พบรายการปัญหา</div>';
    return;
  }
  rows.forEach(row => {
    const isFixed = row.fix_status === 'fixed';
    const badge = isFixed
      ? '<span class="issue-badge fixed">ซ่อมแล้ว</span>'
      : '<span class="issue-badge pending">รอดำเนินการ</span>';

    const card = document.createElement('div');
    card.className = 'inspection-card issue-card';
    card.innerHTML =
      '<div class="card-stripe"></div>' +
      '<div class="inspection-left">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:3px">' +
          '<div class="inspection-code">' + escapeHtml(row.point_code || '-') + '</div>' +
          badge +
        '</div>' +
        '<div class="inspection-location">' + escapeHtml(row.location || '-') + '</div>' +
        '<div class="inspection-meta">' + escapeHtml(row.building || '-') + ' · ' + escapeHtml(row.hospital_zone || '-') + '</div>' +
        '<div class="inspection-sub" style="margin-top:6px">ปัญหา: ' + escapeHtml(row.problem_summary || '-') + '</div>' +
        '<div class="inspection-sub">อัปเดต: ' + escapeHtml(formatDateTime(row.updated_at || row.created_at || '')) + '</div>' +
      '</div>' +
      '<div class="inspection-right">' +
        '<button class="inspection-action-btn edit" type="button">จัดการ</button>' +
      '</div>';
    card.querySelector('button').addEventListener('click', function() { openIssueForm(row); });
    issueListEl.appendChild(card);
  });
};

// ── renderPointsList ───────────────────────────────────────────────────────
window.renderPointsList = function(rows) {
  const pointListEl = document.getElementById('pointList');
  pointListEl.innerHTML = '';
  if (!rows.length) {
    pointListEl.innerHTML = '<div class="empty">ไม่พบข้อมูลจุดติดตั้ง</div>';
    return;
  }
  rows.forEach(row => {
    const isGreen = String(row.tank_color || '').toLowerCase() === 'green';
    const colorClass = isGreen ? 'green' : 'red';
    const tankTag = isGreen
      ? '<span class="tag green-tank">ถังเขียว</span>'
      : '<span class="tag red-tank">ถังแดง</span>';

    const statusKey = String(row.asset_status || '').toLowerCase();
    let statusTag;
    if      (statusKey === 'active')   statusTag = '<span class="tag checked">พร้อมใช้งาน</span>';
    else if (statusKey === 'damaged')  statusTag = '<span class="tag issue">ชำรุด</span>';
    else if (statusKey === 'not_ready')statusTag = '<span class="tag unchecked">ไม่พร้อมใช้</span>';
    else if (statusKey === 'replaced') statusTag = '<span class="tag fixed">เปลี่ยนถังแล้ว</span>';
    else                               statusTag = '<span class="tag">' + escapeHtml(row.asset_status || '-') + '</span>';

    const expiryLine = row.expiry_date
      ? '<div class="inspection-sub">วันหมดอายุ: ' + escapeHtml(row.expiry_date) + '</div>'
      : '';

    const card = document.createElement('div');
    card.className = 'inspection-card ' + colorClass;
    card.innerHTML =
      '<div class="card-stripe"></div>' +
      '<div class="inspection-left">' +
        '<div class="inspection-code">' + escapeHtml(row.point_code || '-') + '</div>' +
        '<div class="inspection-location">' + escapeHtml(row.location || '-') + '</div>' +
        '<div class="inspection-meta">' + escapeHtml(row.building || '-') + ' · ' + escapeHtml(row.hospital_zone || '-') + '</div>' +
        '<div class="inspection-tags">' + tankTag + statusTag + '</div>' +
        expiryLine +
      '</div>' +
      '<div class="inspection-right">' +
        '<button class="inspection-action-btn edit" type="button">จัดการ</button>' +
      '</div>';
    card.querySelector('button').addEventListener('click', function() { openPointForm(row); });
    pointListEl.appendChild(card);
  });
};

// ── renderUsersList ────────────────────────────────────────────────────────
window.renderUsersList = function(rows) {
  const userListEl = document.getElementById('userList');
  userListEl.innerHTML = '';
  if (!rows.length) {
    userListEl.innerHTML = '<div class="empty">ไม่พบข้อมูลผู้ใช้</div>';
    return;
  }
  rows.forEach(row => {
    const roleKey = String(row.role || '').toLowerCase();
    const roleTagClass = roleKey === 'admin' ? 'role-admin' : roleKey === 'supervisor' ? 'role-supervisor' : 'role-inspector';
    const statusClass  = String(row.status || '').toLowerCase() === 'active' ? 'status-active' : 'status-inactive';

    const card = document.createElement('div');
    card.className = 'inspection-card';
    card.innerHTML =
      '<div class="card-stripe" style="background:var(--fire)"></div>' +
      '<div class="inspection-left">' +
        '<div class="inspection-code">' + escapeHtml(row.username || '-') + '</div>' +
        '<div class="inspection-location">' + escapeHtml(row.fullname || '-') + '</div>' +
        '<div class="inspection-tags" style="margin-top:7px">' +
          '<span class="tag ' + roleTagClass + '">' + escapeHtml(getRoleLabel(row.role)) + '</span>' +
          '<span class="tag ' + statusClass  + '">' + escapeHtml(getUserStatusLabel(row.status)) + '</span>' +
        '</div>' +
      '</div>' +
      '<div class="inspection-right">' +
        '<button class="inspection-action-btn edit" type="button">แก้ไข</button>' +
      '</div>';
    card.querySelector('button').addEventListener('click', function() { openUserForm(row); });
    userListEl.appendChild(card);
  });
};

// ── buildCheckItems ────────────────────────────────────────────────────────
window.buildCheckItems = function(values) {
  values = values || {};
  const wrap = document.getElementById('checkItemsWrap');
  wrap.innerHTML = '';

  PATCH_CHECK_FIELDS.forEach(function(field) {
    const item = document.createElement('div');
    item.className = 'check-item';
    item.innerHTML =
      '<div class="check-name">' + escapeHtml(field.label) + '</div>' +
      '<div class="segment">' +
        '<button type="button" class="pass-btn" data-key="' + field.key + '">✓ ผ่าน</button>' +
        '<button type="button" class="fail-btn" data-key="' + field.key + '">✕ ไม่ผ่าน</button>' +
      '</div>';

    const passBtn = item.querySelector('.pass-btn');
    const failBtn = item.querySelector('.fail-btn');
    const current = values[field.key] || '';

    if (current === 'ผ่าน')    passBtn.classList.add('active', 'pass');
    if (current === 'ไม่ผ่าน') failBtn.classList.add('active', 'fail');

    passBtn.addEventListener('click', function() {
      passBtn.classList.add('active', 'pass');
      failBtn.classList.remove('active', 'fail');
    });
    failBtn.addEventListener('click', function() {
      failBtn.classList.add('active', 'fail');
      passBtn.classList.remove('active', 'pass');
    });
    wrap.appendChild(item);
  });
};

// ── renderPointAssetHistory ────────────────────────────────────────────────
window.renderPointAssetHistory = function(rows) {
  const histEl = document.getElementById('pointAssetHistoryList');
  histEl.innerHTML = '';
  if (!rows.length) {
    histEl.innerHTML = '<div class="empty">ยังไม่มีประวัติถังย้อนหลัง</div>';
    return;
  }
  rows.forEach(function(row) {
    const card = document.createElement('div');
    card.className = 'asset-history-card';
    let html =
      '<div class="info-row"><strong>รอบติดตั้ง:</strong> ' + escapeHtml(String(row.install_round || '-')) + '</div>' +
      '<div class="info-row"><strong>สีถัง:</strong> ' + escapeHtml(getTankColorFullLabel(row.tank_color)) + '</div>' +
      '<div class="info-row"><strong>สถานะ:</strong> ' + escapeHtml(getAssetStatusLabel(row.asset_status)) + '</div>' +
      '<div class="info-row"><strong>ติดตั้งเมื่อ:</strong> ' + escapeHtml(formatDateTime(row.installed_at) || '-') + '</div>';
    if (row.removed_at)    html += '<div class="info-row"><strong>ถอดเมื่อ:</strong> '    + escapeHtml(formatDateTime(row.removed_at)) + '</div>';
    if (row.remove_reason) html += '<div class="info-row"><strong>เหตุผลถอด:</strong> ' + escapeHtml(row.remove_reason) + '</div>';
    if (row.note)          html += '<div class="info-row"><strong>หมายเหตุ:</strong> '   + escapeHtml(row.note) + '</div>';
    card.innerHTML = html;
    histEl.appendChild(card);
  });
};
