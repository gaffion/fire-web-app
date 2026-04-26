const { createClient } = supabase;

const supabaseClient = createClient(
  window.APP_CONFIG.supabaseUrl,
  window.APP_CONFIG.supabaseAnonKey,
  {
    db: { schema: 'fire' }
  }
);

let allRows = [];
let activeFilter = 'all';

const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const listEl = document.getElementById('list');
const searchInput = document.getElementById('searchInput');
const btnReload = document.getElementById('btnReload');

const totalCountEl = document.getElementById('totalCount');
const checkedCountEl = document.getElementById('checkedCount');
const uncheckedCountEl = document.getElementById('uncheckedCount');
const issueCountEl = document.getElementById('issueCount');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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

function updateSummary(rows) {
  const total = rows.length;
  const checked = rows.filter(r => r.checked).length;
  const unchecked = rows.filter(r => !r.checked).length;
  const issues = rows.filter(r => String(r.overall_result || '') === 'พบปัญหา').length;

  totalCountEl.textContent = total;
  checkedCountEl.textContent = checked;
  uncheckedCountEl.textContent = unchecked;
  issueCountEl.textContent = issues;
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
        <button class="${getActionButtonClass(row)}" data-point-id="${row.point_id}">
          ${getActionButtonText(row)}
        </button>
      </div>
    `;

    const btn = card.querySelector('button');
    btn.addEventListener('click', () => {
      alert(`ต่อไปจะเปิดฟอร์มตรวจของ ${row.point_code}`);
    });

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

function getCurrentMonthKey() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

async function loadInspectionData() {
  statusEl.textContent = 'กำลังโหลดข้อมูล...';
  errorEl.textContent = '';
  listEl.innerHTML = '';

  const monthKey = getCurrentMonthKey();

  const [{ data: points, error: pointsError }, { data: checks, error: checksError }] = await Promise.all([
    supabaseClient
      .from('v_point_current_asset')
      .select('*')
      .order('point_code', { ascending: true }),
    supabaseClient
      .from('checks')
      .select('point_id, checked_at, overall_result')
      .eq('check_month', monthKey)
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
  (checks || []).forEach(item => {
    checkMap.set(String(item.point_id), item);
  });

  allRows = (points || []).map(row => {
    const check = checkMap.get(String(row.point_id));
    return {
      ...row,
      checked: !!check,
      checked_at: check?.checked_at || '',
      overall_result: check?.overall_result || ''
    };
  });

  updateSummary(allRows);
  statusEl.textContent = `โหลดข้อมูลสำเร็จ ${allRows.length} รายการ`;
  applyFilters();
}

searchInput.addEventListener('input', applyFilters);
btnReload.addEventListener('click', loadInspectionData);

document.querySelectorAll('#filterRow .filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#filterRow .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

loadInspectionData();