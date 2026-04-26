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
const greenCountEl = document.getElementById('greenCount');
const redCountEl = document.getElementById('redCount');
const expireSoonCountEl = document.getElementById('expireSoonCount');

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCardColorClass(tankColor) {
  const color = String(tankColor || '').toLowerCase();
  if (color === 'green') return 'green';
  return 'red';
}

function getTankColorLabel(tankColor) {
  const color = String(tankColor || '').toLowerCase();
  if (color === 'green') return 'ถังสีเขียว';
  if (color === 'red') return 'ถังสีแดง';
  return 'ไม่ระบุสี';
}

function daysUntil(dateString) {
  if (!dateString) return null;
  const target = new Date(dateString + 'T00:00:00');
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = target - today;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

function isExpireSoon(dateString) {
  const days = daysUntil(dateString);
  return days !== null && days >= 0 && days <= 90;
}

function updateSummary(rows) {
  const total = rows.length;
  const green = rows.filter(r => String(r.tank_color || '').toLowerCase() === 'green').length;
  const red = rows.filter(r => String(r.tank_color || '').toLowerCase() === 'red').length;
  const expireSoon = rows.filter(r => isExpireSoon(r.expiry_date)).length;

  totalCountEl.textContent = total;
  greenCountEl.textContent = green;
  redCountEl.textContent = red;
  expireSoonCountEl.textContent = expireSoon;
}

function renderList(rows) {
  listEl.innerHTML = '';

  if (!rows.length) {
    listEl.innerHTML = `<div class="empty">ไม่พบข้อมูล</div>`;
    return;
  }

  rows.forEach(row => {
    const days = daysUntil(row.expiry_date);
    let expiryText = 'ไม่ระบุวันหมดอายุ';

    if (row.expiry_date) {
      expiryText = `หมดอายุ: ${escapeHtml(row.expiry_date)}`;
      if (days !== null) {
        expiryText += ` (${days} วัน)`;
      }
    }

    const card = document.createElement('div');
    card.className = `card ${getCardColorClass(row.tank_color)}`;

    card.innerHTML = `
      <div class="card-head">
        <h3 class="point-code">${escapeHtml(row.point_code)}</h3>
        <span class="badge">${escapeHtml(getTankColorLabel(row.tank_color))}</span>
      </div>

      <div class="location">${escapeHtml(row.location || '-')}</div>
      <div class="meta">${escapeHtml(row.building || '-')} · ${escapeHtml(row.hospital_zone || '-')}</div>
      <div class="muted">สถานะถัง: ${escapeHtml(row.asset_status || '-')} | รอบติดตั้ง: ${escapeHtml(row.install_round || '-')}</div>
      <div class="muted">${expiryText}</div>
    `;

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

    if (activeFilter === 'red') {
      return String(row.tank_color || '').toLowerCase() === 'red';
    }

    if (activeFilter === 'green') {
      return String(row.tank_color || '').toLowerCase() === 'green';
    }

    if (activeFilter === 'expire_soon') {
      return isExpireSoon(row.expiry_date);
    }

    if (activeFilter === 'no_expiry') {
      return !row.expiry_date;
    }

    return true;
  });

  renderList(filtered);
}

async function loadPoints() {
  statusEl.textContent = 'กำลังโหลดข้อมูล...';
  errorEl.textContent = '';
  listEl.innerHTML = '';

  const { data, error } = await supabaseClient
    .from('v_point_current_asset')
    .select('*')
    .order('point_code', { ascending: true });

  if (error) {
    statusEl.textContent = 'โหลดข้อมูลไม่สำเร็จ';
    errorEl.textContent = error.message;
    return;
  }

  allRows = data || [];
  updateSummary(allRows);
  statusEl.textContent = `โหลดข้อมูลสำเร็จ ${allRows.length} รายการ`;
  applyFilters();
}

searchInput.addEventListener('input', applyFilters);
btnReload.addEventListener('click', loadPoints);

document.querySelectorAll('#filterRow .filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('#filterRow .filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeFilter = btn.dataset.filter;
    applyFilters();
  });
});

loadPoints();