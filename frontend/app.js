// ===== Helpers =====
const $ = (s, ctx=document) => ctx.querySelector(s);
const $$ = (s, ctx=document) => Array.from(ctx.querySelectorAll(s));

const toast = (msg) => {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(()=> el.classList.remove('show'), 1700);
};

const setApiStatus = (ok) => {
  const dot = $('#api-status');
  const txt = $('#api-status-text');
  if (dot && txt) {
    dot.classList.toggle('green', ok);
    dot.classList.toggle('red', !ok);
    txt.textContent = ok ? 'API: conectada' : 'API: desconectada';
  }
};

const api = async (path, opts = {}) => {
  try {
    const r = await fetch(window.API + path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || `HTTP ${r.status}`);
    setApiStatus(true);
    return data;
  } catch (e) {
    setApiStatus(false);
    throw e;
  }
};

// ===== Tabs =====
document.addEventListener('DOMContentLoaded', () => {
  $$('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const id = btn.dataset.tab;
      $$('.tab').forEach(t => t.classList.remove('active'));
      const target = document.getElementById(id);
      if (target) target.classList.add('active');
    });
  });
});

// ===== Recargar =====
const reloadBtn = $('#reload-data');
if (reloadBtn) {
  reloadBtn.addEventListener('click', async () => {
    try {
      await Promise.all([loadDashboard(), loadUsers(), loadCustomers(), loadProducts(), loadSales()]);
      toast('Datos recargados');
    } catch (e) {
      console.error(e);
      toast('No se pudo recargar');
    }
  });
}

// ===== Paginación =====
function paginate(rows, page = 1, perPage = 10) {
  const total = rows.length;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return { slice: rows.slice(start, end), page, pages, total };
}
function renderPager(el, { page, pages }, onGo) {
  el.innerHTML = '';
  if (pages <= 1) return;
  const mk = (label, go) => {
    const b = document.createElement('button');
    b.textContent = label;
    b.className = 'small';
    b.addEventListener('click', () => onGo(go));
    return b;
  };
  el.appendChild(mk('⟨', Math.max(1, page - 1)));
  for (let p = 1; p <= pages; p++) {
    const b = mk(String(p), p);
    if (p === page) b.style.outline = '2px solid #3b82f6';
    el.appendChild(b);
  }
  el.appendChild(mk('⟩', Math.min(pages, page + 1)));
}

// ===== USERS CRUD =====
const userForm = $('#user-form');
const userTbody = $('#user-tbody');
let USERS_CACHE = [];
let userPage = 1;

$('#user-new')?.addEventListener('click', () => {
  userForm.reset();
  userForm.classList.remove('hidden');
  userForm.querySelector('input[name=id]').value = '';
});
$('#user-cancel')?.addEventListener('click', () => userForm.classList.add('hidden'));

userForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(userForm);
  const payload = Object.fromEntries(fd.entries());
  const id = payload.id; delete payload.id;
  if (!payload.name || !payload.email) return toast('Nombre y email requeridos');
  try {
    if (id) await api('/users/' + id, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/users', { method: 'POST', body: JSON.stringify(payload) });
    toast('Usuario guardado');
    userForm.classList.add('hidden');
    await loadUsers();
  } catch (e) { toast(e.message); }
});

async function loadUsers() {
  if (!userTbody) return;
  USERS_CACHE = await api('/users');
  filterUsers();
}
function filterUsers() {
  const q = ($('#user-q')?.value || '').toLowerCase();
  const rows = USERS_CACHE.filter(u =>
    (u.name || '').toLowerCase().includes(q) ||
    (u.email || '').toLowerCase().includes(q)
  );
  const { slice, page, pages } = paginate(rows, userPage);
  userTbody.innerHTML = slice.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.name}</td><td>${r.email || ''}</td><td><span class="badge">${r.role}</span></td>
      <td>
        <button class="small" data-edit="${r.id}">Editar</button>
        <button class="small danger" data-del="${r.id}">Eliminar</button>
      </td>
    </tr>`).join('');
  renderPager($('#user-pager'), { page, pages }, (go) => { userPage = go; filterUsers(); });
}
$('#user-q')?.addEventListener('input', () => { userPage = 1; filterUsers(); });
userTbody?.addEventListener('click', async (e) => {
  const id = e.target.dataset?.edit || e.target.dataset?.del;
  if (!id) return;
  if (e.target.dataset?.edit) {
    const r = await api('/users/' + id);
    userForm.classList.remove('hidden');
    userForm.name.value = r.name;
    userForm.email.value = r.email || '';
    userForm.role.value = r.role || 'cashier';
    userForm.id.value = r.id;
  } else if (e.target.dataset?.del) {
    if (!confirm('¿Eliminar usuario?')) return;
    try { await api('/users/' + id, { method: 'DELETE' }); await loadUsers(); toast('Eliminado'); }
    catch (e) { toast(e.message); }
  }
});

// ===== CUSTOMERS CRUD =====
const customerForm = $('#customer-form');
const customerTbody = $('#customer-tbody');
let CUSTOMERS_CACHE = [];
let customerPage = 1;

$('#customer-new')?.addEventListener('click', () => {
  customerForm.reset();
  customerForm.classList.remove('hidden');
  customerForm.querySelector('input[name=id]').value = '';
});
$('#customer-cancel')?.addEventListener('click', () => customerForm.classList.add('hidden'));

customerForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(customerForm);
  const payload = Object.fromEntries(fd.entries());
  const id = payload.id; delete payload.id;
  if (!payload.name) return toast('Nombre requerido');
  try {
    if (id) await api('/customers/' + id, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/customers', { method: 'POST', body: JSON.stringify(payload) });
    toast('Cliente guardado');
    customerForm.classList.add('hidden');
    await loadCustomers();
  } catch (e) { toast(e.message); }
});

async function loadCustomers() {
  if (!customerTbody) return;
  CUSTOMERS_CACHE = await api('/customers');
  filterCustomers();
  const sel = $('#sale-customer');
  if (sel) {
    sel.innerHTML = '<option value="">(Opcional)</option>';
    CUSTOMERS_CACHE.forEach(c => sel.insertAdjacentHTML('beforeend', `<option value="${c.id}">${c.name}</option>`));
  }
}
function filterCustomers() {
  const q = ($('#customer-q')?.value || '').toLowerCase();
  const rows = CUSTOMERS_CACHE.filter(c =>
    (c.name || '').toLowerCase().includes(q) ||
    (c.email || '').toLowerCase().includes(q) ||
    (c.phone || '').includes(q)
  );
  const { slice, page, pages } = paginate(rows, customerPage);
  customerTbody.innerHTML = slice.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.name}</td><td>${r.phone || ''}</td><td>${r.email || ''}</td>
      <td>
        <button class="small" data-edit="${r.id}">Editar</button>
        <button class="small danger" data-del="${r.id}">Eliminar</button>
      </td>
    </tr>`).join('');
  renderPager($('#customer-pager'), { page, pages }, (go) => { customerPage = go; filterCustomers(); });
}
$('#customer-q')?.addEventListener('input', () => { customerPage = 1; filterCustomers(); });
customerTbody?.addEventListener('click', async (e) => {
  const id = e.target.dataset?.edit || e.target.dataset?.del;
  if (!id) return;
  if (e.target.dataset?.edit) {
    const r = await api('/customers/' + id);
    customerForm.classList.remove('hidden');
    ['name', 'phone', 'email', 'address'].forEach(k => customerForm[k].value = r[k] || '');
    customerForm.id.value = r.id;
  } else if (e.target.dataset?.del) {
    if (!confirm('¿Eliminar cliente?')) return;
    try { await api('/customers/' + id, { method: 'DELETE' }); await loadCustomers(); toast('Eliminado'); }
    catch (e) { toast(e.message); }
  }
});

// ===== PRODUCTS CRUD =====
const productForm = $('#product-form');
const productTbody = $('#product-tbody');
let PRODUCTS_CACHE = [];
let productPage = 1;

$('#product-new')?.addEventListener('click', () => {
  productForm.reset();
  productForm.classList.remove('hidden');
  productForm.querySelector('input[name=id]').value = '';
});
$('#product-cancel')?.addEventListener('click', () => productForm.classList.add('hidden'));

productForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData(productForm);
  const payload = Object.fromEntries(fd.entries());
  const id = payload.id; delete payload.id;
  payload.price = parseFloat(payload.price);
  payload.stock = parseInt(payload.stock || '0', 10);
  payload.status = parseInt(payload.status || '1', 10);
  if (!payload.name || isNaN(payload.price)) return toast('Nombre y precio requeridos');
  try {
    if (id) await api('/products/' + id, { method: 'PUT', body: JSON.stringify(payload) });
    else await api('/products', { method: 'POST', body: JSON.stringify(payload) });
    toast('Producto guardado');
    productForm.classList.add('hidden');
    await loadProducts();
  } catch (e) { toast(e.message); }
});

async function loadProducts() {
  if (!productTbody) return;
  PRODUCTS_CACHE = await api('/products');
  filterProducts();
}
function filterProducts() {
  const q = ($('#product-q')?.value || '').toLowerCase();
  const rows = PRODUCTS_CACHE.filter(p =>
    (p.name || '').toLowerCase().includes(q) ||
    (p.sku || '').toLowerCase().includes(q)
  );
  const { slice, page, pages } = paginate(rows, productPage);
  productTbody.innerHTML = slice.map(r => `
    <tr>
      <td>${r.id}</td><td>${r.name}</td><td>${r.sku || ''}</td>
      <td>$${Number(r.price).toFixed(2)}</td>
      <td>${r.stock} ${r.stock < 5 ? '<span class="warn">• bajo</span>' : ''}</td>
      <td>${r.status ? '<span class="ok">activo</span>' : 'inactivo'}</td>
      <td>
        <button class="small" data-edit="${r.id}">Editar</button>
        <button class="small danger" data-del="${r.id}">Eliminar</button>
      </td>
    </tr>`).join('');
  renderPager($('#product-pager'), { page, pages }, (go) => { productPage = go; filterProducts(); });
}
$('#product-q')?.addEventListener('input', () => { productPage = 1; filterProducts(); });
productTbody?.addEventListener('click', async (e) => {
  const id = e.target.dataset?.edit || e.target.dataset?.del;
  if (!id) return;
  if (e.target.dataset?.edit) {
    const r = await api('/products/' + id);
    ['name', 'sku', 'price', 'stock', 'status'].forEach(k => productForm[k].value = r[k]);
    productForm.id.value = r.id;
    productForm.classList.remove('hidden');
  } else if (e.target.dataset?.del) {
    if (!confirm('¿Eliminar producto?')) return;
    try { await api('/products/' + id, { method: 'DELETE' }); await loadProducts(); toast('Eliminado'); }
    catch (e) { toast(e.message); }
  }
});

// ===== SALES =====
const saleForm = $('#sale-form');
const saleItems = $('#sale-items');
const saleTotal = $('#sale-total');
const salesTbody = $('#sales-tbody');
let salesCache = [];

$('#sale-new')?.addEventListener('click', () => {
  if (!saleForm) return;
  saleForm.classList.remove('hidden');
  saleItems.innerHTML = '';
  addSaleItemRow();
  calcTotal();
});
$('#sale-cancel')?.addEventListener('click', () => saleForm.classList.add('hidden'));
$('#add-item')?.addEventListener('click', addSaleItemRow);

function addSaleItemRow() {
  if (!saleItems) return;
  const row = document.createElement('div');
  row.className = 'item';
  const options = (PRODUCTS_CACHE || []).map(p =>
    `<option value="${p.id}">${p.name} ($${Number(p.price).toFixed(2)} | stock: ${p.stock})</option>`
  ).join('');
  row.innerHTML = `
    <select><option value="">Seleccione</option>${options}</select>
    <input type="number" min="1" value="1"/>
    <span class="badge sub">$0.00</span>
    <button type="button" class="small danger remove">x</button>`;
  saleItems.appendChild(row);
  row.addEventListener('input', () => updateRow(row));
  row.querySelector('.remove').addEventListener('click', () => { row.remove(); calcTotal(); });
}
function updateRow(row) {
  const pid = parseInt(row.querySelector('select').value || '0', 10);
  const qty = parseInt(row.querySelector('input').value || '1', 10);
  const p = (PRODUCTS_CACHE || []).find(x => x.id === pid);
  const sub = (p ? Number(p.price) * (qty || 0) : 0);
  row.querySelector('.sub').textContent = '$' + sub.toFixed(2);
  calcTotal();
}
function calcTotal() {
  if (!saleTotal) return;
  let t = 0;
  $$('#sale-items .item').forEach(r => {
    const pid = parseInt(r.querySelector('select').value || '0', 10);
    const qty = parseInt(r.querySelector('input').value || '0', 10);
    const p = (PRODUCTS_CACHE || []).find(x => x.id === pid);
    if (p && qty) t += Number(p.price) * qty;
  });
  saleTotal.textContent = t.toFixed(2);
}
saleForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const customer_id = $('#sale-customer')?.value || null;
  const items = [];
  $$('#sale-items .item').forEach(r => {
    const pid = parseInt(r.querySelector('select').value || '0', 10);
    const qty = parseInt(r.querySelector('input').value || '0', 10);
    if (pid && qty) items.push({ product_id: pid, qty });
  });
  if (!items.length) return toast('Agrega al menos un producto');
  try {
    await api('/sales', { method: 'POST', body: JSON.stringify({ customer_id, items }) });
    toast('Venta guardada');
    saleForm.classList.add('hidden');
    await Promise.all([loadProducts(), loadSales(), loadDashboard()]);
  } catch (e) { toast(e.message); }
});

async function loadSales() {
  if (!salesTbody) return;
  salesCache = await api('/sales');
  salesTbody.innerHTML = salesCache.map(s => `
    <tr>
      <td>${s.id}</td><td>${s.customer_name || '-'}</td>
      <td>$${Number(s.total).toFixed(2)}</td>
      <td>${new Date(s.created_at).toLocaleString()}</td>
      <td>
        <button class="small" data-view="${s.id}">Ver</button>
        <button class="small danger" data-del="${s.id}">Eliminar</button>
      </td>
    </tr>`).join('');
}
salesTbody?.addEventListener('click', async (e) => {
  const id = e.target.dataset?.view || e.target.dataset?.del;
  if (!id) return;
  if (e.target.dataset?.view) {
    const s = await api('/sales/' + id);
    const box = $('#sale-detail');
    if (box) {
      box.classList.remove('hidden');
      box.innerHTML = `<h3>Venta #${s.id}</h3>
        <p><b>Total:</b> $${Number(s.total).toFixed(2)}</p>
        <ul>${s.items.map(i=> `<li>${i.product_name} x ${i.qty} = $${Number(i.subtotal).toFixed(2)}</li>`).join('')}</ul>`;
    }
  } else if (e.target.dataset?.del) {
    if (!confirm('¿Eliminar venta? (no reingresa stock)')) return;
    try { await api('/sales/' + id, { method: 'DELETE' }); await Promise.all([loadSales(), loadDashboard()]); toast('Venta eliminada'); }
    catch (e) { toast(e.message); }
  }
});

// ===== Dashboard =====
async function loadDashboard() {
  const haveKpis = $('#kpi-products') || $('#kpi-customers') || $('#kpi-sales');
  if (!haveKpis) return; // si estás en otra página que no tiene KPIs
  const [products, customers, sales] = await Promise.all([
    api('/products'), api('/customers'), api('/sales')
  ]);

  // cache para otros módulos
  PRODUCTS_CACHE = products;
  CUSTOMERS_CACHE = customers;
  salesCache = sales;

  // KPIs
  $('#kpi-products').textContent = products.length;
  const low = products.filter(p => Number(p.stock) < 5).length;
  $('#kpi-low').textContent = 'Bajo stock: ' + low;
  $('#kpi-customers').textContent = customers.length;

  const todayStr = new Date().toDateString();
  const salesToday = sales.filter(s => new Date(s.created_at).toDateString() === todayStr);
  const revToday = salesToday.reduce((a, b) => a + Number(b.total || 0), 0);
  $('#kpi-sales-today').textContent = salesToday.length;
  $('#kpi-revenue-today').textContent = revToday.toFixed(2);

  const revenue = sales.reduce((a, b) => a + Number(b.total || 0), 0);
  $('#kpi-sales').textContent = sales.length;
  $('#kpi-revenue').textContent = revenue.toFixed(2);

  // Últimas ventas (hasta 8)
  const search = $('#dash-search');
  const render = () => {
    const q = (search?.value || '').toLowerCase();
    const rows = sales
      .filter(s => (s.customer_name || '').toLowerCase().includes(q) || String(s.id).includes(q))
      .slice(0, 8);
    $('#dash-sales-tbody').innerHTML = rows.map(s => `
      <tr><td>${s.id}</td><td>${s.customer_name || '-'}</td><td>$${Number(s.total).toFixed(2)}</td><td>${new Date(s.created_at).toLocaleString()}</td></tr>
    `).join('');
  };
  render();
  search?.addEventListener('input', render);
}

// ===== Init =====
(async () => {
  try {
    await Promise.all([loadDashboard(), loadUsers(), loadCustomers(), loadProducts(), loadSales()]);
    toast('Bienvenida ✨');
  } catch (e) {
    console.error(e);
    toast('No se pudo conectar con la API');
  }
})();
