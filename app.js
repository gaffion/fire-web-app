const { createClient } = supabase;

const supabaseClient = createClient(
  window.APP_CONFIG.supabaseUrl,
  window.APP_CONFIG.supabaseAnonKey,
  {
    db: { schema: 'fire' }
  }
);

let allRows = [];

const statusEl = document.getElementById('status');
const errorEl = document.getElementById('error');
const listEl = document.getElementById('list');
const searchInput = document.getElementById('searchInput');
const btnReload = document.getElementById('btnReload');

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

function renderList(rows) {
  listEl.innerHTML = '';

  if (!rows.length) {
    listEl.innerHTML = `<div class="empty">ไม่พบข้อมูล</div>`;
    return;
  }

  rows.forEach(row => {
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
    `;

    listEl.appendChild(card);
  });
}

function applySearch() {
  const q = searchInput.value.trim().toLowerCase();

  const filtered = allRows.filter(row =>
    String(row.point_code || '').toLowerCase().includes(q) ||
    String(row.location || '').toLowerCase().includes(q) ||
    String(row.building || '').toLowerCase().includes(q) ||
    String(row.hospital_zone || '').toLowerCase().includes(q)
  );

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
  statusEl.textContent = `โหลดข้อมูลสำเร็จ ${allRows.length} รายการ`;
  applySearch();
}

searchInput.addEventListener('input', applySearch);
btnReload.addEventListener('click', loadPoints);

loadPoints();