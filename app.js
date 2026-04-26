const { createClient } = supabase;

const supabaseClient = createClient(
  window.APP_CONFIG.supabaseUrl,
  window.APP_CONFIG.supabaseAnonKey,
  { db: { schema: 'fire' } }
);

let allRows = [];
let activeFilter = 'all';
let currentFormRow = null;

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

const navDashboard = document.getElementById('navDashboard');
const navInspection = document.getElementById('navInspection');
const bottomNav = document.getElementById('bottomNav');

const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const listEl = document.getElementById('list');
const searchInput = document.getElementById('searchInput');
const btnReload = document.getElementById('btnReload');

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

function setActiveNav(page) {
  navDashboard.classList.toggle('active', page === 'dashboard');
  navInspection.classList.toggle('active', page === 'inspection');
}

function showDashboardPage() {
  dashboardPage.classList.remove('hidden');
  inspectionPage.classList.add('hidden');
  formPage.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  setActiveNav('dashboard');
}

function showInspectionPage() {
  dashboardPage.classList.add('hidden');
  inspectionPage.classList.remove('hidden');
  formPage.classList.add('hidden');
  bottomNav.classList.remove('hidden');
  setActiveNav('inspection');
}

function showFormPage() {
  dashboardPage.classList.add('hidden');
  inspectionPage.classList.add('hidden');
  formPage.classList.remove('hidden');
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
  issueCountEl.textContent = rows.filter(r => String(r.overall_result || '') === 'พบปัญหา').length;
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
        <div class="inspection-sub">วันหมดอายุ: ${escapeHtml(row.expiry_date || 'ไม่ระบุ')}</div>
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

  renderList(filtered);
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

async function saveCheck() {
  if (!currentFormRow) return;

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
    checked_by: 'demo',
    checked_by_name: 'ผู้ทดสอบระบบ',
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

  if (existing?.id) {
    const { error } = await supabaseClient.from('checks').update(payload).eq('id', existing.id);
    saveError = error;
  } else {
    const { error } = await supabaseClient.from('checks').insert(payload);
    saveError = error;
  }

  btnSaveCheck.disabled = false;
  btnSaveCheck.textContent = 'บันทึกข้อมูล';

  if (saveError) {
    alert('บันทึกผลการตรวจไม่สำเร็จ: ' + saveError.message);
    return;
  }

  showToast('บันทึกการตรวจสำเร็จ');
  await loadInspectionData();
  showInspectionPage();
}

async function loadInspectionData() {
  statusEl.textContent = 'กำลังโหลดข้อมูล...';
  errorEl.textContent = '';
  listEl.innerHTML = '';

  const monthKey = getCurrentMonthKey();

  const [{ data: points, error: pointsError }, { data: checks, error: checksError }] = await Promise.all([
    supabaseClient.from('v_point_current_asset').select('*').order('point_code', { ascending: true }),
    supabaseClient.from('checks').select('*').eq('check_month', monthKey)
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
      overall_result: check?.overall_result || '',
      note: check?.note || '',
      checkValues
    };
  });

  updateSummary(allRows);
  statusEl.textContent = `โหลดข้อมูลสำเร็จ ${allRows.length} รายการ`;
  applyFilters();
}

searchInput.addEventListener('input', applyFilters);
btnReload.addEventListener('click', loadInspectionData);
btnBack.addEventListener('click', showInspectionPage);
btnSaveCheck.addEventListener('click', saveCheck);
navDashboard.addEventListener('click', showDashboardPage);
navInspection.addEventListener('click', showInspectionPage);

document.querySelectorAll('#filterRow .filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#filterRow .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

loadInspectionData();
showDashboardPage();