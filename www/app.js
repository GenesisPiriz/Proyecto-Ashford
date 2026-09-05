const STORAGE_KEY = "ashford-accounting-v2";
const accountChapters = [
  { code: "100000", name: "Activos", classification: "Activo" },
  { code: "200000", name: "Pasivos", classification: "Pasivo" },
  { code: "300000", name: "Pérdidas", classification: "Pérdidas" },
  { code: "400000", name: "Ganancias", classification: "Devengamiento" },
];
let accountPlan = [
  ["110000", "Caja", "Caja principal", "Activos"],
  ["110010", "Bancos", "Fondos en cuentas bancarias", "Activos"],
  ["110020", "Mercaderías", "Inventario de mercaderías", "Activos", "Inventario"],
  ["110030", "Cheques y conformes a cobrar", "Documentos comerciales a cobrar", "Activos"],
  ["110040", "Provisiones a recibir", "Importes provisionados a recibir", "Activos"],
  ["110050", "Inversiones", "Inversiones financieras y comerciales", "Activos"],
  ["110060", "Cuenta Corriente Clientes", "Créditos por ventas a clientes", "Activos"],
  ["110070", "Cuentas a cobrar diversas", "Otros créditos del activo", "Activos"],
  ["110080", "Bienes de uso", "Bienes destinados a la actividad", "Activos"],
  ["110090", "Amortizaciones acumuladas", "Amortizaciones de bienes de uso", "Activos"],
  ["210000", "Acreedores", "Deudas comerciales con terceros", "Pasivos"],
  ["210010", "Vales bancarios", "Obligaciones documentadas con bancos", "Pasivos"],
  ["210020", "Tarjeta de crédito", "Saldos de tarjetas de crédito", "Pasivos"],
  ["210030", "Otros pasivos", "Otras obligaciones a pagar", "Pasivos"],
  ["210040", "Cuenta Corriente Proveedores", "Deudas comerciales con proveedores", "Pasivos"],
  ["210050", "IVA Crédito", "Impuesto al valor agregado crédito fiscal", "Pasivos"],
  ["210060", "IVA Débito", "Impuesto al valor agregado débito fiscal", "Pasivos"],
  ["210070", "Impuestos", "Impuestos y tasas a pagar", "Pasivos"],
  ["210080", "Provisiones sobre gastos a pagar", "Gastos provisionados a pagar", "Pasivos", "Provisiones sobre gastos"],
  ["210090", "Capital", "Capital integrado", "Pasivos"],
  ["310000", "Gastos generales", "Gastos generales del emprendimiento", "Pérdidas"],
  ["310010", "Costos operativos", "Costos necesarios para operar", "Pérdidas"],
  ["310020", "Impuestos sobre gastos", "Impuestos reconocidos como gasto", "Pérdidas", "Impuestos"],
  ["310030", "Provisiones sobre gastos del período", "Provisiones reconocidas como gasto", "Pérdidas", "Provisiones sobre gastos"],
  ["310040", "Servicios", "Gastos por servicios contratados", "Pérdidas"],
  ["310050", "Gastos de Administración", "Gastos generales de administración", "Pérdidas"],
  ["310060", "Compras", "Compras de bienes y mercaderías", "Pérdidas"],
  ["310070", "Costo de ventas", "Costo de mercaderías vendidas", "Pérdidas"],
  ["310080", "Gastos financieros", "Intereses y gastos financieros", "Pérdidas"],
  ["310090", "Pérdidas diversas", "Otras pérdidas del período", "Pérdidas"],
  ["410000", "Ventas", "Ingresos por ventas", "Ganancias"],
  ["410010", "Descuentos obtenidos", "Descuentos obtenidos de proveedores", "Ganancias"],
  ["410020", "Ganancias diversas", "Otros ingresos del período", "Ganancias"],
].map(([code, name, description, chapter, displayName]) => ({ code, name, description, chapter, displayName: displayName || name }));
const accountCatalog = accountPlan.map((account) => account.name);
let accountByName = new Map(accountPlan.map((account) => [account.name, account]));

function formatAccount(accountName) {
  const account = accountByName.get(accountName);
  return account ? `${account.code} · ${account.displayName} · ${account.description}` : accountName;
}

function getAccountDisplayName(accountName) {
  const account = accountByName.get(accountName);
  return account ? `${account.code} · ${account.displayName}` : accountName;
}
const URUGUAY_TIME_ZONE = "America/Montevideo";
const SESSION_KEY = "ashford-current-user-v1";
const THEME_KEY = "ashford-theme-v1";
const API_BASE_URL = window.ASHFORD_API_URL || "";

function getUruguayDateParts(date = new Date()) {
  return Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", {
      timeZone: URUGUAY_TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)]),
  );
}

function getUruguayDateString(date = new Date()) {
  const parts = getUruguayDateParts(date);
  return `${parts.year}-${String(parts.month).padStart(2, "0")}-${String(parts.day).padStart(2, "0")}`;
}

function getTaskDateStatus(dueDate, done) {
  if (done) return "Completada";
  const today = getUruguayDateString();
  if (dueDate < today) return "Vencida";
  if (dueDate === today) return "Hoy";
  return "Próxima";
}

function getUruguayHolidays(year) {
  return [
    ["01-01", "Año Nuevo"],
    ["04-19", "Desembarco de los Treinta y Tres Orientales"],
    ["05-01", "Día de los Trabajadores"],
    ["05-18", "Batalla de Las Piedras"],
    ["06-19", "Natalicio de Artigas"],
    ["07-18", "Jura de la Constitución"],
    ["08-25", "Declaratoria de la Independencia"],
    ["10-12", "Día de la Raza"],
    ["11-02", "Día de los Difuntos"],
    ["12-25", "Día de la Familia"],
  ].map(([date, name]) => ({ date: `${year}-${date}`, name }));
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getCreationMetadata() {
  return { createdBy: currentUser?.name || "Sistema" };
}

function addDays(dateString, days) {
  const date = new Date(`${dateString}T00:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function buildReference(prefix) {
  return `${prefix}-${Date.now().toString().slice(-6)}`;
}

function getDefaultState() {
  return {
    users: [],
    suppliers: [],
    purchases: [],
    payments: [],
    supplierMovements: [],
    journalEntries: [],
    clients: [],
    inventory: [],
    calendarAgenda: [],
    calendarNotes: [],
    calendarTasks: [],
    inventoryMovements: [],
    sales: [],
    collections: [],
    clientMovements: [],
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return applyAuditDefaults(getDefaultState());
  }

  try {
    const parsed = JSON.parse(saved);
    return applyAuditDefaults({ ...getDefaultState(), ...parsed });
  } catch (error) {
    console.warn("Fallo al leer el almacenamiento local. Se recupera estado por defecto.", error);
    return applyAuditDefaults(getDefaultState());
  }
}

function applyAuditDefaults(nextState) {
  const collections = ["suppliers", "purchases", "payments", "supplierMovements", "journalEntries", "clients", "inventory", "calendarAgenda", "calendarNotes", "calendarTasks", "inventoryMovements", "sales", "collections", "clientMovements"];
  collections.forEach((collection) => {
    nextState[collection] = (nextState[collection] || []).map((record) => ({ createdBy: record.createdBy || "Sistema", ...record }));
  });
  nextState.users = (nextState.users || []).map((user) => ({
    ...user,
    role: user.role === "Gerencial" ? "Gerencial" : "Administrador",
  }));
  return nextState;
}

function getCurrentUser() {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) || "null");
  } catch (error) {
    return null;
  }
}

let currentUser = getCurrentUser();

function saveState() {
  const actor = currentUser?.name || "Sistema";
  const collections = ["suppliers", "purchases", "payments", "supplierMovements", "journalEntries", "clients", "inventory", "calendarAgenda", "calendarNotes", "calendarTasks", "inventoryMovements", "sales", "collections", "clientMovements"];
  collections.forEach((collection) => {
    state[collection] = (state[collection] || []).map((record) => ({ createdBy: record.createdBy || actor, ...record }));
  });
  state.accountPlan = accountPlan;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();
let invoiceDraft = [];
let selectedCalendarDate = "";
let selectedCurrentAccountSupplierId = "";
let accountPlanEditMode = false;

if (Array.isArray(state.accountPlan) && state.accountPlan.length) {
  accountPlan = state.accountPlan;
  accountByName = new Map(accountPlan.map((account) => [account.name, account]));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(Number(value || 0));
}

function getSupplierName(supplierId) {
  const supplier = state.suppliers.find((item) => item.id === supplierId);
  return supplier ? supplier.name : "Proveedor no encontrado";
}

function createSupplierMovementRecord({
  supplierId,
  type,
  date,
  dueDate,
  currency = "UYU",
  reference,
  subtotal = 0,
  ivaRate = 0,
  amount = 0,
  detail,
  items = [],
}) {
  const movement = {
    ...getCreationMetadata(),
    id: createId("mov"),
    supplierId,
    type,
    date,
    dueDate: dueDate || date,
    currency,
    reference: reference || buildReference(type === "Pago" ? "P" : "F"),
    subtotal: Number(subtotal || 0),
    ivaRate: Number(ivaRate || 0),
    amount: Number(amount || 0),
    detail: detail || `${type} - Proveedor`,
  };

  state.supplierMovements.unshift(movement);
  return movement;
}

function getSupplierBalances() {
  return state.suppliers.map((supplier) => {
    const purchaseTotal = state.purchases
      .filter((purchase) => purchase.proveedorId === supplier.id)
      .reduce((sum, purchase) => sum + Number(purchase.total || 0), 0);

    const paymentTotal = state.payments
      .filter((payment) => payment.proveedorId === supplier.id)
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

    const facturas = state.supplierMovements
      .filter((movement) => movement.supplierId === supplier.id && movement.type === "Factura")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0) + purchaseTotal;

    const notasCredito = state.supplierMovements
      .filter((movement) => movement.supplierId === supplier.id && movement.type === "Nota de crédito")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0);

    const debitos = state.supplierMovements
      .filter((movement) => movement.supplierId === supplier.id && movement.type === "Débito")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0);

    const pagos = state.supplierMovements
      .filter((movement) => movement.supplierId === supplier.id && movement.type === "Pago")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0) + paymentTotal;

    const saldo = facturas + debitos - notasCredito - pagos;
    const createdBy = [...new Set([
      ...state.purchases.filter((item) => item.proveedorId === supplier.id).map((item) => item.createdBy || "Sistema"),
      ...state.payments.filter((item) => item.proveedorId === supplier.id).map((item) => item.createdBy || "Sistema"),
      ...state.supplierMovements.filter((item) => item.supplierId === supplier.id).map((item) => item.createdBy || "Sistema"),
    ])].join(", ") || "Sistema";

    return {
      ...supplier,
      createdBy,
      facturas,
      notasCredito,
      debitos,
      pagos,
      saldo,
      compras: purchaseTotal,
      pagosHistoricos: paymentTotal,
    };
  });
}

function buildLedgerRows() {
  const rows = new Map();

  function addLine(account, type, amount, createdBy) {
    if (!rows.has(account)) {
      rows.set(account, { account, Debe: 0, Haber: 0, createdBy: new Set() });
    }

    const row = rows.get(account);
    if (createdBy) row.createdBy.add(createdBy);
    if (type === "Debe") {
      row.Debe += Number(amount || 0);
    } else {
      row.Haber += Number(amount || 0);
    }
  }

  state.purchases.forEach((purchase) => {
    addLine("Compras", "Debe", purchase.amount, purchase.createdBy);
    addLine("IVA Crédito", "Debe", purchase.iva, purchase.createdBy);
    addLine("Cuenta Corriente Proveedores", "Haber", purchase.total, purchase.createdBy);
  });

  state.payments.forEach((payment) => {
    addLine("Cuenta Corriente Proveedores", "Debe", payment.amount, payment.createdBy);
    addLine(payment.method === "Efectivo" ? "Caja" : "Bancos", "Haber", payment.amount, payment.createdBy);
  });

  state.journalEntries.forEach((entry) => {
    entry.lines.forEach((line) => {
      addLine(line.account, line.type, line.amount, entry.createdBy);
    });
  });

  return Array.from(rows.values()).map((row) => ({
    ...row,
    createdBy: Array.from(row.createdBy).join(", ") || "Sistema",
    saldo: row.Debe - row.Haber,
  }));
}

function createClientMovementRecord({
  clientId,
  type,
  date,
  dueDate,
  currency = "UYU",
  reference,
  subtotal = 0,
  ivaRate = 0,
  amount = 0,
  detail,
  items = [],
}) {
  const movement = {
    ...getCreationMetadata(),
    id: createId("mov-c"),
    clientId,
    type,
    date,
    dueDate: dueDate || date,
    currency,
    reference: reference || buildReference(type === "Cobranza" ? "CB" : "F"),
    subtotal: Number(subtotal || 0),
    ivaRate: Number(ivaRate || 0),
    amount: Number(amount || 0),
    detail: detail || `${type} - Cliente`,
    items,
  };

  state.clientMovements.unshift(movement);
  return movement;
}

function getClientBalances() {
  return state.clients.map((client) => {
    const salesTotal = state.sales
      .filter((sale) => sale.clientId === client.id)
      .reduce((sum, sale) => sum + Number(sale.total || 0), 0);

    const collectionTotal = state.collections
      .filter((collection) => collection.clientId === client.id)
      .reduce((sum, collection) => sum + Number(collection.amount || 0), 0);

    const facturas = state.clientMovements
      .filter((movement) => movement.clientId === client.id && movement.type === "Factura")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0) + salesTotal;

    const notasCredito = state.clientMovements
      .filter((movement) => movement.clientId === client.id && movement.type === "Nota de crédito")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0);

    const debitos = state.clientMovements
      .filter((movement) => movement.clientId === client.id && movement.type === "Nota de débito")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0);

    const cobranzas = state.clientMovements
      .filter((movement) => movement.clientId === client.id && movement.type === "Cobranza")
      .reduce((sum, movement) => sum + Number(movement.amount || 0), 0) + collectionTotal;

    const saldo = facturas + debitos - notasCredito - cobranzas;
    const createdBy = [...new Set([
      ...state.sales.filter((item) => item.clientId === client.id).map((item) => item.createdBy || "Sistema"),
      ...state.collections.filter((item) => item.clientId === client.id).map((item) => item.createdBy || "Sistema"),
      ...state.clientMovements.filter((item) => item.clientId === client.id).map((item) => item.createdBy || "Sistema"),
    ])].join(", ") || "Sistema";

    return {
      ...client,
      createdBy,
      facturas,
      notasCredito,
      debitos,
      cobranzas,
      saldo,
      ventas: salesTotal,
      cobranzasHistoricas: collectionTotal,
    };
  });
}

function buildClientLedgerRows() {
  const rows = new Map();

  function addLine(account, type, amount, createdBy) {
    if (!rows.has(account)) {
      rows.set(account, { account, Debe: 0, Haber: 0, createdBy: new Set() });
    }

    const row = rows.get(account);
    if (createdBy) row.createdBy.add(createdBy);
    if (type === "Debe") {
      row.Debe += Number(amount || 0);
    } else {
      row.Haber += Number(amount || 0);
    }
  }

  state.sales.forEach((sale) => {
    addLine("Cuenta Corriente Clientes", "Debe", sale.total, sale.createdBy);
    addLine("Ventas", "Haber", sale.amount, sale.createdBy);
    addLine("IVA Débito", "Haber", sale.iva, sale.createdBy);
  });

  state.collections.forEach((collection) => {
    addLine(collection.method === "Efectivo" ? "Caja" : "Bancos", "Debe", collection.amount, collection.createdBy);
    addLine("Cuenta Corriente Clientes", "Haber", collection.amount, collection.createdBy);
  });

  return Array.from(rows.values()).map((row) => ({
    ...row,
    createdBy: Array.from(row.createdBy).join(", ") || "Sistema",
    saldo: row.Debe - row.Haber,
  }));
}

function populateSelector(selectorId, items) {
  const selector = document.getElementById(selectorId);
  if (!selector) return;

  selector.innerHTML = items
    .map((item) => `<option value="${item}">${item}</option>`)
    .join("");
}

function renderStats() {
  const totalCompras = state.purchases.reduce((sum, item) => sum + Number(item.total || 0), 0);
  const totalPagos = state.payments.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const saldoProveedores = getSupplierBalances().reduce((sum, item) => sum + Number(item.saldo || 0), 0);

  const statElements = {
    compras: document.getElementById("stats-compras"),
    saldo: document.getElementById("stats-saldo"),
    pagos: document.getElementById("stats-pagos"),
    asientos: document.getElementById("stats-asientos"),
  };

  if (statElements.compras) statElements.compras.textContent = formatCurrency(totalCompras);
  if (statElements.saldo) statElements.saldo.textContent = formatCurrency(saldoProveedores);
  if (statElements.pagos) statElements.pagos.textContent = formatCurrency(totalPagos);
  if (statElements.asientos) statElements.asientos.textContent = String(state.journalEntries.length);

  const homeCompras = document.getElementById("home-compras");
  const homePagos = document.getElementById("home-pagos");
  const homeSaldo = document.getElementById("home-saldo");

  if (homeCompras) homeCompras.textContent = formatCurrency(totalCompras);
  if (homePagos) homePagos.textContent = formatCurrency(totalPagos);
  if (homeSaldo) homeSaldo.textContent = formatCurrency(saldoProveedores);
}

function renderHomeActivity() {
  const recentList = document.getElementById("recent-activity-list");
  if (!recentList) return;

  const activities = [
    ...state.purchases.map((item) => ({
      label: `${getSupplierName(item.proveedorId)} · Compra`,
      date: item.date,
      amount: item.total,
    })),
    ...state.payments.map((item) => ({
      label: `${getSupplierName(item.proveedorId)} · Pago`,
      date: item.date,
      amount: item.amount,
    })),
    ...state.journalEntries.map((item) => ({
      label: `${item.detail} · Asiento`,
      date: item.date,
      amount: item.lines.reduce((sum, line) => sum + Number(line.amount || 0), 0),
    })),
    ...state.supplierMovements.map((item) => ({
      label: `${getSupplierName(item.supplierId)} · ${item.type}`,
      date: item.date,
      amount: item.amount,
    })),
  ]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 4);

  recentList.innerHTML = activities
    .map(
      (item) => `
        <li>
          <span>${item.label}</span>
          <small>${item.date}</small>
          <strong>${formatCurrency(item.amount)}</strong>
        </li>
      `,
    )
    .join("");
}

function renderPaymentCalendar() {
  const dueList = document.getElementById("payment-due-list");
  const calendar = document.getElementById("mini-calendar");
  if (!dueList || !calendar) return;

  const values = state.supplierMovements
    .filter((item) => item.type === "Factura" || item.type === "Pago")
    .map((item) => ({
      date: item.date,
      label: getSupplierName(item.supplierId),
      amount: item.amount,
    }));

  const today = getUruguayDateParts();
  const monthStart = new Date(Date.UTC(today.year, today.month - 1, 1, 12));
  const firstWeekday = (monthStart.getUTCDay() + 6) % 7;
  const daysInMonth = new Date(Date.UTC(today.year, today.month, 0)).getUTCDate();
  const holidays = getUruguayHolidays(today.year);
  const holidayDates = new Map(holidays.map((holiday) => [holiday.date, holiday.name]));
  const monthPrefix = `${today.year}-${String(today.month).padStart(2, "0")}-`;
  const dates = values.filter((entry) => entry.date.startsWith(monthPrefix)).slice(0, 4);
  const monthLabel = new Intl.DateTimeFormat("es-UY", { timeZone: URUGUAY_TIME_ZONE, month: "long", year: "numeric" }).format(monthStart);
  const dayCells = Array.from({ length: firstWeekday + daysInMonth }, (_, index) => {
    if (index < firstWeekday) return "<span class=\"calendar-day empty\"></span>";
    const day = index - firstWeekday + 1;
    const date = `${monthPrefix}${String(day).padStart(2, "0")}`;
    const isActive = values.some((entry) => entry.date === date);
    const isToday = date === getUruguayDateString();
    const isHoliday = holidayDates.has(date);
    return `<button type="button" class="calendar-day ${isActive ? "active" : ""} ${isToday ? "today" : ""} ${isHoliday ? "holiday" : ""}" data-calendar-date="${date}" title="${holidayDates.get(date) || `Agendar para ${date}`}" aria-label="${date}">${day}</button>`;
  }).join("");

  calendar.innerHTML = `
    <div class="calendar-header">${monthLabel} · ${new Intl.DateTimeFormat("es-UY", { timeZone: URUGUAY_TIME_ZONE, hour: "2-digit", minute: "2-digit" }).format(new Date())} hs</div>
    <div class="calendar-grid">${dayCells}</div>
  `;

  dueList.innerHTML = dates
    .map(
      (entry) => `
        <li>
          <span>${new Intl.DateTimeFormat("es-UY", { timeZone: URUGUAY_TIME_ZONE, dateStyle: "short" }).format(new Date(`${entry.date}T12:00:00Z`))}</span>
          <strong>${entry.label}</strong>
          <small>${formatCurrency(entry.amount)}</small>
        </li>
      `,
    )
    .join("");

  if (!dates.length) {
    dueList.innerHTML = `<li><span>No hay vencimientos próximos</span></li>`;
  }
}

function renderCalendarDashboard() {
  const agendaList = document.getElementById("calendar-agenda-list");
  const dueList = document.getElementById("calendar-due-list");
  const notesList = document.getElementById("calendar-notes-list");
  const tasksList = document.getElementById("calendar-tasks-list");

  if (agendaList) {
    const agendaEntries = [...state.calendarAgenda].sort((a, b) => new Date(a.date) - new Date(b.date));
    agendaList.innerHTML = agendaEntries
      .map(
        (item) => `
          <li>
            <div class="agenda-item-header">
              <strong>${item.title}</strong>
              <button type="button" class="delete-btn" data-agenda-id="${item.id}" aria-label="Eliminar evento">×</button>
            </div>
            <small>${item.date}</small>
            <p>${item.detail || ""}</p>
          </li>
        `,
      )
      .join("");
  }

  if (dueList) {
    const dueEntries = [
      ...state.supplierMovements
        .filter((item) => item.dueDate || item.date)
        .map((item) => ({
          date: item.dueDate || item.date,
          label: `${getSupplierName(item.supplierId)} · Pago`,
          amount: item.amount,
          kind: "Pago",
        })),
      ...state.clientMovements
        .filter((item) => item.dueDate || item.date)
        .map((item) => ({
          date: item.dueDate || item.date,
          label: `${getClientName(item.clientId)} · Cobro`,
          amount: item.amount,
          kind: "Cobro",
        })),
    ]
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 8);

    dueList.innerHTML = dueEntries
      .map(
        (item) => `
          <li>
            <div class="due-entry-row">
              <span>${item.date}</span>
              <strong>${item.kind}</strong>
            </div>
            <div class="due-entry-meta">${item.label}</div>
            <small>${formatCurrency(item.amount)}</small>
          </li>
        `,
      )
      .join("");
  }

  if (notesList) {
    const notes = [...state.calendarNotes].sort((a, b) => new Date(b.date) - new Date(a.date));
    notesList.innerHTML = notes
      .map(
        (note) => `
          <li>
            <div class="agenda-item-header">
              <small>${note.date}</small>
              <button type="button" class="delete-btn" data-note-id="${note.id}" aria-label="Eliminar nota">×</button>
            </div>
            <p>${note.text}</p>
          </li>
        `,
      )
      .join("");
  }

  if (tasksList) {
    const tasks = [...state.calendarTasks].sort((a, b) => Number(a.done) - Number(b.done) || new Date(a.dueDate) - new Date(b.dueDate));
    tasksList.innerHTML = tasks
      .map(
        (task) => {
          const status = getTaskDateStatus(task.dueDate, task.done);
          return `
          <li class="task-item ${task.done ? "done" : ""} task-${status.toLowerCase()}">
            <div class="task-row">
              <label>
                <input type="checkbox" data-task-id="${task.id}" ${task.done ? "checked" : ""} />
                <span>${task.title}</span>
              </label>
              <button type="button" class="delete-btn" data-task-id="${task.id}" aria-label="Eliminar tarea">×</button>
            </div>
            <small>${task.dueDate} · ${status}</small>
          </li>
        `;
        },
      )
      .join("");
  }
}

function renderPurchaseTable() {
  const body = document.getElementById("purchase-table-body");
  body.innerHTML = state.purchases
    .map(
      (item) => `
        <tr>
          <td>${getSupplierName(item.proveedorId)}</td>
          <td>${item.date}</td>
          <td>${item.concept}</td>
          <td class="amount">${formatCurrency(item.amount)}</td>
          <td class="amount">${formatCurrency(item.iva)}</td>
          <td class="amount">${formatCurrency(item.total)}</td>
          <td>${item.createdBy || "Sistema"}</td>
        </tr>
      `,
    )
    .join("");
}

function sortBalancesBySaldoDesc(items) {
  return [...items].sort((a, b) => Math.abs(Number(b.saldo || 0)) - Math.abs(Number(a.saldo || 0)) || Number(b.saldo || 0) - Number(a.saldo || 0));
}

function sortMovementsByDueDateAsc(items) {
  return [...items].sort((a, b) => {
    const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
    return dateA - dateB;
  });
}

function renderSupplierTable() {
  const body = document.getElementById("supplier-table-body");
  const balances = sortBalancesBySaldoDesc(getSupplierBalances());

  body.innerHTML = balances
    .map((supplier) => {
      const statusClass = supplier.saldo > 0 ? "warn" : "ok";
      const statusText = supplier.saldo > 0 ? "Debe" : "Al día";
      return `
        <tr>
          <td>${supplier.name}</td>
          <td>${supplier.cuit}</td>
          <td>${supplier.contact || "-"}</td>
          <td>${supplier.address || "-"}</td>
          <td>${supplier.country || "-"}</td>
          <td>${supplier.phone || "-"}</td>
          <td>${supplier.email || "-"}</td>
          <td>${supplier.notes || "-"}</td>
          <td class="amount">
            <span class="status ${statusClass}">${statusText}</span>
            <div>${formatCurrency(supplier.saldo)}</div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderCurrentAccounts() {
  const body = document.getElementById("current-account-body");
  const selector = document.getElementById("current-account-supplier");
  const search = document.getElementById("current-account-search");
  const detail = document.getElementById("current-account-detail");
  if (!body || !selector || !detail) return;

  if (!state.suppliers.length) {
    selector.innerHTML = "<option value=\"\">No hay proveedores cargados</option>";
    detail.innerHTML = "<div class=\"card\">No hay proveedores para consultar.</div>";
    body.innerHTML = "";
    return;
  }

  const searchTerm = search?.value.trim().toLowerCase() || "";
  const filteredSuppliers = state.suppliers.filter((supplier) => supplier.name.toLowerCase().includes(searchTerm));
  if (!filteredSuppliers.length) {
    selector.innerHTML = "<option value=\"\">Sin coincidencias</option>";
    detail.innerHTML = `<div class="card">No se encontró un proveedor para “${search.value}”.</div>`;
    body.innerHTML = "";
    return;
  }
  if (!selectedCurrentAccountSupplierId || !filteredSuppliers.some((supplier) => supplier.id === selectedCurrentAccountSupplierId)) {
    selectedCurrentAccountSupplierId = filteredSuppliers[0].id;
  }
  selector.innerHTML = filteredSuppliers
    .map((supplier) => `<option value="${supplier.id}">${supplier.name}</option>`)
    .join("");
  selector.value = selectedCurrentAccountSupplierId;

  const supplier = state.suppliers.find((item) => item.id === selectedCurrentAccountSupplierId);
  const balance = getSupplierBalances().find((item) => item.id === selectedCurrentAccountSupplierId);
  if (!supplier || !balance) return;

  const movements = state.supplierMovements
    .filter((movement) => movement.supplierId === supplier.id)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
  state.purchases
    .filter((purchase) => purchase.proveedorId === supplier.id)
    .filter((purchase) => !movements.some((movement) => movement.date === purchase.date && movement.type === "Factura" && Number(movement.amount) === Number(purchase.total)))
    .forEach((purchase) => movements.push({ date: purchase.date, type: "Factura", reference: "Compra", detail: purchase.concept, amount: purchase.total, createdBy: purchase.createdBy || "Sistema" }));
  state.payments
    .filter((payment) => payment.proveedorId === supplier.id)
    .filter((payment) => !movements.some((movement) => movement.date === payment.date && ["Pago", "Pago a proveedor"].includes(movement.type) && Number(movement.amount) === Number(payment.amount)))
    .forEach((payment) => movements.push({ date: payment.date, type: "Pago", reference: "Pago", detail: payment.method, amount: payment.amount, createdBy: payment.createdBy || "Sistema" }));
  movements.sort((a, b) => new Date(a.date) - new Date(b.date));
  let runningBalance = 0;
  const rows = movements.map((movement) => {
    const isCredit = ["Pago", "Pago a proveedor", "Nota de crédito"].includes(movement.type);
    const debe = isCredit ? 0 : Number(movement.amount || 0);
    const haber = isCredit ? Number(movement.amount || 0) : 0;
    runningBalance += debe - haber;
    return { movement, debe, haber, runningBalance };
  });

  const status = balance.saldo > 0 ? "warn" : "ok";
  const label = balance.saldo > 0 ? "Debe" : "Al día";
  detail.innerHTML = `
    <div class="card provider-account-summary">
      <div>
        <span class="eyebrow">Proveedor seleccionado</span>
        <h3>${supplier.name}</h3>
        <p>CUIT: ${supplier.cuit} · Contacto: ${supplier.contact || "-"}</p>
      </div>
      <div class="provider-account-totals">
        <span>Facturas ${formatCurrency(balance.facturas)}</span>
        <span>Notas de crédito ${formatCurrency(balance.notasCredito)}</span>
        <span>Débitos ${formatCurrency(balance.debitos)}</span>
        <span>Pagos ${formatCurrency(balance.pagos)}</span>
        <strong class="status ${status}">${label}: ${formatCurrency(balance.saldo)}</strong>
      </div>
    </div>
  `;

  body.innerHTML = rows.length
    ? rows.map(({ movement, debe, haber, runningBalance }) => `
        <tr>
          <td>${movement.date}</td>
          <td>${movement.type}</td>
          <td>${movement.reference || "-"}</td>
          <td>${movement.detail || "-"}</td>
          <td class="amount">${formatCurrency(debe)}</td>
          <td class="amount">${formatCurrency(haber)}</td>
          <td class="amount">${formatCurrency(runningBalance)}</td>
          <td>${movement.createdBy || "Sistema"}</td>
        </tr>
      `).join("")
    : `<tr><td colspan="8">No hay movimientos registrados para este proveedor.</td></tr>`;
}

function renderPaymentTable() {
  const body = document.getElementById("payment-table-body");
  body.innerHTML = state.payments
    .map(
      (item) => `
        <tr>
          <td>${getSupplierName(item.proveedorId)}</td>
          <td>${item.date}</td>
          <td>${item.method}</td>
          <td class="amount">${formatCurrency(item.amount)}</td>
          <td>${item.createdBy || "Sistema"}</td>
        </tr>
      `,
    )
    .join("");
}

function renderLedgerTable() {
  const body = document.getElementById("ledger-table-body");
  const rows = buildLedgerRows();

  body.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${getAccountDisplayName(row.account)}</td>
          <td class="amount">${formatCurrency(row.Debe)}</td>
          <td class="amount">${formatCurrency(row.Haber)}</td>
          <td class="amount">${formatCurrency(row.saldo)}</td>
          <td>${row.createdBy}</td>
        </tr>
      `,
    )
    .join("");
}

function renderJournalTable() {
  const body = document.getElementById("journal-table-body");
  body.innerHTML = state.journalEntries
    .map(
      (entry) => `
        <tr>
          <td>${entry.date}</td>
          <td>${entry.detail}</td>
          <td>${entry.lines.map((line) => `${getAccountDisplayName(line.account)} ${line.type}`).join(" / ")}</td>
          <td class="amount">${formatCurrency(entry.lines.reduce((sum, line) => sum + Number(line.amount || 0), 0))}</td>
          <td>${entry.createdBy || "Sistema"}</td>
        </tr>
      `,
    )
    .join("");
}

function renderAccountPlanTable() {
  const body = document.getElementById("account-plan-body");
  if (!body) return;
  const searchTerm = document.getElementById("account-plan-search")?.value.trim().toLowerCase() || "";
  const chapterFilter = document.getElementById("account-plan-chapter-filter")?.value || "all";
  const filteredPlan = accountPlan.filter((account) => {
    const matchesChapter = chapterFilter === "all" || account.chapter === chapterFilter;
    const searchText = `${account.code} ${account.displayName} ${account.description}`.toLowerCase();
    return matchesChapter && searchText.includes(searchTerm);
  });
  body.innerHTML = accountChapters.map((chapter) => `
    <tr class="account-chapter-row"><td colspan="5"><strong>${chapter.code} · ${chapter.name}</strong></td></tr>
    ${filteredPlan.filter((account) => account.chapter === chapter.name).map((account) => `<tr><td>${account.code}</td><td>${account.chapter}</td><td>${account.displayName}</td><td>${account.description}</td><td>${currentUser?.role === "Gerencial" && accountPlanEditMode ? `<button type="button" class="small-btn account-edit-btn" data-account-code="${account.code}">Editar</button>` : "Solo consulta"}</td></tr>`).join("")}
  `).join("");
}

function renderAccountPlanAdmin() {
  const admin = document.getElementById("account-plan-admin");
  const chapterSelect = document.getElementById("account-form-chapter");
  const chapterFilter = document.getElementById("account-plan-chapter-filter");
  const editToggle = document.getElementById("account-plan-edit-toggle");
  if (!admin || !chapterSelect || !chapterFilter || !editToggle) return;
  admin.classList.toggle("hidden", currentUser?.role !== "Gerencial" || !accountPlanEditMode);
  editToggle.classList.toggle("hidden", currentUser?.role !== "Gerencial");
  editToggle.textContent = accountPlanEditMode ? "Cerrar modificación" : "Modificar plan";
  chapterSelect.innerHTML = accountChapters.map((chapter) => `<option value="${chapter.name}">${chapter.code} · ${chapter.name}</option>`).join("");
  chapterFilter.innerHTML = `<option value="all">Todos los capítulos</option>${accountChapters.map((chapter) => `<option value="${chapter.name}">${chapter.code} · ${chapter.name}</option>`).join("")}`;
}

function renderSalesTable() {
  const body = document.getElementById("sales-table-body");
  body.innerHTML = state.sales
    .map(
      (item) => `
        <tr>
          <td>${getClientName(item.clientId)}</td>
          <td>${item.date}</td>
          <td>${item.concept}</td>
          <td class="amount">${formatCurrency(item.amount)}</td>
          <td class="amount">${formatCurrency(item.iva)}</td>
          <td class="amount">${formatCurrency(item.total)}</td>
          <td>${item.createdBy || "Sistema"}</td>
        </tr>
      `,
    )
    .join("");
}

function renderClientTable() {
  const body = document.getElementById("client-table-body");
  const balances = sortBalancesBySaldoDesc(getClientBalances());

  body.innerHTML = balances
    .map((client) => {
      const statusClass = client.saldo > 0 ? "warn" : "ok";
      const statusText = client.saldo > 0 ? "Debe" : "Cobrado";
      return `
        <tr>
          <td>${client.name}</td>
          <td>${client.rut}</td>
          <td>${client.contact || "-"}</td>
          <td>${client.address || "-"}</td>
          <td>${client.country || "-"}</td>
          <td>${client.phone || "-"}</td>
          <td>${client.email || "-"}</td>
          <td>${client.notes || "-"}</td>
          <td class="amount">
            <span class="status ${statusClass}">${statusText}</span>
            <div>${formatCurrency(client.saldo)}</div>
          </td>
        </tr>
      `;
    })
    .join("");
}

function renderClientAccountTable() {
  const body = document.getElementById("client-account-body");
  const balances = sortBalancesBySaldoDesc(getClientBalances());

  body.innerHTML = balances
    .map((client) => {
      const status = client.saldo > 0 ? "warn" : "ok";
      const label = client.saldo > 0 ? "Debe" : "Cobrado";
      return `
        <tr>
          <td>${client.name}</td>
          <td class="amount">${formatCurrency(client.facturas)}</td>
          <td class="amount">${formatCurrency(client.notasCredito)}</td>
          <td class="amount">${formatCurrency(client.debitos)}</td>
          <td class="amount">${formatCurrency(client.cobranzas)}</td>
          <td class="amount">${formatCurrency(client.saldo)}</td>
          <td><span class="status ${status}">${label}</span></td>
          <td>${client.createdBy}</td>
        </tr>
      `;
    })
    .join("");
}

function renderClientCurrentAccounts() {
  const body = document.getElementById("client-current-account-body");
  const balances = sortBalancesBySaldoDesc(getClientBalances());

  body.innerHTML = balances
    .map((client) => {
      const status = client.saldo > 0 ? "warn" : "ok";
      const label = client.saldo > 0 ? "Debe" : "Cobrado";
      return `
        <tr>
          <td>${client.name}</td>
          <td class="amount">${formatCurrency(client.ventas)}</td>
          <td class="amount">${formatCurrency(client.cobranzas)}</td>
          <td class="amount">${formatCurrency(client.saldo)}</td>
          <td><span class="status ${status}">${label}</span></td>
          <td>${client.createdBy}</td>
        </tr>
      `;
    })
    .join("");
}

function renderCollectionTable() {
  const body = document.getElementById("collection-table-body");
  body.innerHTML = state.collections
    .map(
      (item) => `
        <tr>
          <td>${getClientName(item.clientId)}</td>
          <td>${item.date}</td>
          <td>${item.method}</td>
          <td class="amount">${formatCurrency(item.amount)}</td>
          <td>${item.createdBy || "Sistema"}</td>
        </tr>
      `,
    )
    .join("");
}

function getInventoryProduct(productId) {
  return state.inventory.find((item) => item.id === productId);
}

function getInventoryAverageCost(productId) {
  const product = getInventoryProduct(productId);
  if (!product) return 0;
  return Number(product.averageCost ?? product.unitCost ?? 0);
}

function getInventoryCostOfSale(productId) {
  return state.inventoryMovements
    .filter((movement) => movement.productId === productId && ["Salida", "Venta"].includes(movement.type))
    .reduce((sum, movement) => sum + Number(movement.totalCost || 0), 0);
}

function createInventoryMovement({ productId, type, date, quantity, unitCost, reference, detail, source = "Manual" }) {
  const product = getInventoryProduct(productId);
  if (!product) return null;

  const normalizedType = type || "Entrada";
  const qty = Number(quantity || 0);
  const currentStock = Number(product.stock || 0);
  const currentUnitCost = Number(product.averageCost ?? product.unitCost ?? unitCost ?? 0);
  const movementUnitCost = Number(unitCost ?? currentUnitCost ?? 0);
  const totalCost = qty * movementUnitCost;

  const movement = {
    ...getCreationMetadata(),
    id: createId("inv-mov"),
    productId,
    type: normalizedType,
    date,
    reference: reference || buildReference("INV"),
    quantity: qty,
    unitCost: movementUnitCost,
    totalCost,
    detail: detail || `${normalizedType} de stock`,
    source,
  };

  state.inventoryMovements.unshift(movement);

  if (["Entrada", "Ajuste positivo"].includes(normalizedType)) {
    const newStock = currentStock + qty;
    const existingValue = currentStock * currentUnitCost;
    product.stock = newStock;
    product.unitCost = movementUnitCost;
    product.averageCost = newStock > 0 ? (existingValue + totalCost) / newStock : movementUnitCost;
  }

  if (["Salida", "Venta", "Ajuste negativo"].includes(normalizedType)) {
    const reducedStock = Math.max(0, currentStock - qty);
    product.stock = reducedStock;
    product.unitCost = currentUnitCost || movementUnitCost;
    product.averageCost = currentUnitCost || movementUnitCost;
  }

  return movement;
}

function renderInventorySummary() {
  const totalStock = state.inventory.reduce((sum, item) => sum + Number(item.stock || 0), 0);
  const totalStockValue = state.inventory.reduce((sum, item) => {
    const unitCost = Number(item.averageCost ?? item.unitCost ?? 0);
    return sum + Number(item.stock || 0) * unitCost;
  }, 0);
  const totalCostOfSale = state.inventoryMovements
    .filter((movement) => ["Salida", "Venta"].includes(movement.type))
    .reduce((sum, movement) => sum + Number(movement.totalCost || 0), 0);
  const lowStockProducts = state.inventory.filter((item) => Number(item.stock || 0) <= 5).length;

  const ids = {
    stock: document.getElementById("inventory-total-stock"),
    value: document.getElementById("inventory-total-value"),
    cost: document.getElementById("inventory-cost-of-sale"),
    alerts: document.getElementById("inventory-low-stock"),
  };

  if (ids.stock) ids.stock.textContent = `${totalStock} u.`;
  if (ids.value) ids.value.textContent = formatCurrency(totalStockValue);
  if (ids.cost) ids.cost.textContent = formatCurrency(totalCostOfSale);
  if (ids.alerts) ids.alerts.textContent = `${lowStockProducts} ítems`;
}

function normalizeCodeValue(value) {
  if (value === null || value === undefined) return "";
  return String(value).trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
}

function renderInventoryTable() {
  const body = document.getElementById("inventory-table-body");
  if (!body) return;

  body.innerHTML = state.inventory
    .map((item) => {
      const currentUnitCost = Number(item.averageCost ?? item.unitCost ?? 0);
      const totalValue = Number(item.stock || 0) * currentUnitCost;
      const costOfSale = getInventoryCostOfSale(item.id);
      const stockClass = Number(item.stock || 0) <= 5 ? "warn" : "ok";
      const stockLabel = Number(item.stock || 0) <= 5 ? "Stock bajo" : "Disponible";

      return `
        <tr>
          <td>${item.name}</td>
          <td>${item.barcode || item.sku || "-"}</td>
          <td>${item.sku}</td>
          <td>${item.category}</td>
          <td class="amount">${Number(item.stock || 0)}</td>
          <td class="amount">${formatCurrency(currentUnitCost)}</td>
          <td class="amount">${formatCurrency(totalValue)}</td>
          <td class="amount">${formatCurrency(costOfSale || item.costOfSale || 0)}</td>
          <td>${item.location || "-"}</td>
          <td><span class="status ${stockClass}">${stockLabel}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderInventoryMovementTable() {
  const body = document.getElementById("inventory-movement-table-body");
  if (!body) return;

  body.innerHTML = state.inventoryMovements
    .slice(0, 12)
    .map((movement) => {
      const product = getInventoryProduct(movement.productId);
      return `
        <tr>
          <td>${movement.date}</td>
          <td>${product ? product.name : "Producto"}</td>
          <td><span class="status ${movement.type === "Salida" || movement.type === "Venta" ? "warn" : "ok"}">${movement.type}</span></td>
          <td class="amount">${Number(movement.quantity || 0)}</td>
          <td class="amount">${formatCurrency(movement.unitCost || 0)}</td>
          <td class="amount">${formatCurrency(movement.totalCost || 0)}</td>
          <td>${movement.reference || "-"}</td>
          <td>${movement.detail || "-"}</td>
          <td>${movement.createdBy || "Sistema"}</td>
        </tr>
      `;
    })
    .join("");
}

function findProductByCode(codeValue) {
  if (!codeValue) return null;

  const rawValue = String(codeValue).trim();
  const normalized = normalizeCodeValue(rawValue);
  const rawDigits = rawValue.replace(/\D/g, "");

  return state.inventory.find((item) => {
    const barcode = (item.barcode || "").toString().trim();
    const sku = (item.sku || "").toString().trim();
    const id = (item.id || "").toString().trim();
    const barcodeNormalized = normalizeCodeValue(barcode);
    const skuNormalized = normalizeCodeValue(sku);
    const idNormalized = normalizeCodeValue(id);
    const barcodeDigits = String(barcode).replace(/\D/g, "");
    const skuDigits = String(sku).replace(/\D/g, "");
    const idDigits = String(id).replace(/\D/g, "");

    return (
      barcode === rawValue ||
      sku === rawValue ||
      id === rawValue ||
      barcodeNormalized === normalized ||
      skuNormalized === normalized ||
      idNormalized === normalized ||
      barcodeDigits === rawDigits ||
      skuDigits === rawDigits ||
      idDigits === rawDigits
    );
  }) || null;
}

function addProductToInvoice(productCode, quantity = 1) {
  const product = findProductByCode(productCode);
  if (!product) {
    return { ok: false, message: "Producto no encontrado. Revisá el código de barras, QR o SKU." };
  }

  const qty = Number(quantity || 1);
  if (!qty || qty <= 0) {
    return { ok: false, message: "La cantidad debe ser mayor a cero." };
  }

  const existing = invoiceDraft.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += qty;
  } else {
    invoiceDraft.push({
      productId: product.id,
      name: product.name,
      sku: product.sku,
      barcode: product.barcode || product.sku,
      quantity: qty,
      unitPrice: Number(product.averageCost ?? product.unitCost ?? 0),
    });
  }

  renderInvoiceDraft();
  return {
    ok: true,
    product,
    message: `Validado y agregado: ${product.name}`,
    shortMessage: `Agregado: ${product.name}`,
  };
}

window.findProductByCode = findProductByCode;
window.addProductToInvoice = addProductToInvoice;

function renderInvoiceDraft() {
  const body = document.getElementById("invoice-items-body");
  const totalEl = document.getElementById("invoice-total");
  if (!body) return;

  if (!invoiceDraft.length) {
    body.innerHTML = `<tr><td colspan="6">No hay productos en la factura.</td></tr>`;
    if (totalEl) totalEl.textContent = formatCurrency(0);
    return;
  }

  const subtotal = invoiceDraft.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
  const iva = subtotal * 0.22;
  const total = subtotal + iva;

  body.innerHTML = invoiceDraft
    .map(
      (item) => `
        <tr>
          <td>${item.name}</td>
          <td>${item.sku}</td>
          <td class="amount">${item.quantity}</td>
          <td class="amount">${formatCurrency(item.unitPrice)}</td>
          <td class="amount">${formatCurrency(item.quantity * item.unitPrice)}</td>
          <td><button type="button" class="remove-item-btn" data-product-id="${item.productId}">Quitar</button></td>
        </tr>
      `,
    )
    .join("");

  if (totalEl) totalEl.textContent = formatCurrency(total);

  const subtotalEl = document.getElementById("invoice-subtotal");
  const ivaEl = document.getElementById("invoice-iva");
  if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
  if (ivaEl) ivaEl.textContent = formatCurrency(iva);
}

function renderClientVoucherDetailsTable() {
  const body = document.getElementById("client-voucher-details-body");
  if (!body) return;

  body.innerHTML = sortMovementsByDueDateAsc(state.clientMovements)
    .map((movement) => {
      const subtotal = Number(movement.subtotal || 0);
      const ivaRate = Number(movement.ivaRate || 0);
      const ivaAmount = subtotal > 0 ? (subtotal * ivaRate) / 100 : 0;
      const total = movement.type === "Cobranza" ? movement.amount : (subtotal + ivaAmount) || movement.amount;
      
      return `
        <tr>
          <td>${movement.date}</td>
          <td>${getClientName(movement.clientId)}</td>
          <td>${movement.type}</td>
          <td>${movement.reference}</td>
          <td class="amount">${formatCurrency(subtotal || movement.amount)}</td>
          <td class="amount">${formatCurrency(ivaAmount)}</td>
          <td class="amount">${formatCurrency(total)}</td>
          <td>${movement.currency || "UYU"}</td>
          <td>${movement.dueDate || "-"}</td>
          <td>${movement.createdBy || "Sistema"}</td>
        </tr>
      `;
    })
    .join("");
}

function renderClientLedgerTable() {
  const body = document.getElementById("client-ledger-table-body");
  const rows = buildClientLedgerRows();

  body.innerHTML = rows
    .map(
      (row) => `
        <tr>
          <td>${getAccountDisplayName(row.account)}</td>
          <td class="amount">${formatCurrency(row.Debe)}</td>
          <td class="amount">${formatCurrency(row.Haber)}</td>
          <td class="amount">${formatCurrency(row.saldo)}</td>
          <td>${row.createdBy}</td>
        </tr>
      `,
    )
    .join("");
}

function getClientName(clientId) {
  const client = state.clients.find((item) => item.id === clientId);
  return client ? client.name : "Cliente no encontrado";
}

const COMPANY_EXPORT_INFO = {
  name: "Genesis Joyería",
  city: "Montevideo",
  phone: "098 973 416",
  instagram: "genesis.joyeria.uy",
  tiktok: "genesis.joyeria.uy",
  logo: "Logo Ashford.png",
};

function loadCompanyLogoDataUrl() {
  return new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const sourceCanvas = document.createElement("canvas");
      sourceCanvas.width = image.naturalWidth;
      sourceCanvas.height = image.naturalHeight;
      const sourceContext = sourceCanvas.getContext("2d");
      sourceContext.drawImage(image, 0, 0);
      const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;
      let minX = sourceCanvas.width;
      let minY = sourceCanvas.height;
      let maxX = 0;
      let maxY = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        const red = pixels[index];
        const green = pixels[index + 1];
        const blue = pixels[index + 2];
        if (red < 180 || green < 180 || blue < 180) {
          const pixelIndex = index / 4;
          const x = pixelIndex % sourceCanvas.width;
          const y = Math.floor(pixelIndex / sourceCanvas.width);
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
      const padding = 24;
      const cropX = Math.max(0, minX - padding);
      const cropY = Math.max(0, minY - padding);
      const cropWidth = Math.min(sourceCanvas.width - cropX, maxX - minX + padding * 2 + 1);
      const cropHeight = Math.min(sourceCanvas.height - cropY, maxY - minY + padding * 2 + 1);
      const canvas = document.createElement("canvas");
      const outputSize = 500;
      canvas.width = outputSize;
      canvas.height = outputSize;
      const context = canvas.getContext("2d");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, outputSize, outputSize);
      const scale = Math.min((outputSize - 24) / cropWidth, (outputSize - 24) / cropHeight);
      const outputWidth = cropWidth * scale;
      const outputHeight = cropHeight * scale;
      context.drawImage(sourceCanvas, cropX, cropY, cropWidth, cropHeight, (outputSize - outputWidth) / 2, (outputSize - outputHeight) / 2, outputWidth, outputHeight);
      resolve(canvas.toDataURL("image/png"));
    };
    image.onerror = () => resolve(null);
    image.src = encodeURI(`./${COMPANY_EXPORT_INFO.logo}`);
  });
}

async function addCompanyPdfHeader(pdf, title) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const logoDataUrl = await loadCompanyLogoDataUrl();
  pdf.setFillColor(13, 59, 102);
  pdf.roundedRect(12, 10, pageWidth - 24, 38, 3, 3, "F");
  if (logoDataUrl) {
    pdf.setFillColor(255, 255, 255);
    pdf.setDrawColor(54, 162, 235);
    pdf.roundedRect(16, 13, 32, 32, 2, 2, "FD");
    pdf.addImage(logoDataUrl, "PNG", 18, 15, 28, 28, undefined, "FAST");
  }
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(16);
  pdf.text(COMPANY_EXPORT_INFO.name, logoDataUrl ? 52 : 18, 23);
  pdf.setFontSize(10);
  pdf.text(`${COMPANY_EXPORT_INFO.city} · Tel. ${COMPANY_EXPORT_INFO.phone}`, logoDataUrl ? 52 : 18, 31);
  pdf.setFontSize(8);
  pdf.text(`Instagram: ${COMPANY_EXPORT_INFO.instagram} · TikTok: ${COMPANY_EXPORT_INFO.tiktok}`, logoDataUrl ? 52 : 18, 37);
  pdf.setFontSize(12);
  pdf.text(title, pageWidth - 18, 42, { align: "right" });
  pdf.setTextColor(0, 0, 0);
}

function drawPdfField(pdf, label, value, x, y, width, height = 16) {
  pdf.setDrawColor(54, 162, 235);
  pdf.setFillColor(220, 238, 255);
  pdf.roundedRect(x, y, width, height, 2, 2, "FD");
  pdf.setFontSize(8);
  pdf.setTextColor(49, 93, 130);
  pdf.text(label.toUpperCase(), x + 4, y + 5);
  pdf.setFontSize(10);
  pdf.setTextColor(13, 59, 102);
  pdf.text(String(value || "-"), x + 4, y + 12);
}

function addPdfFooter(pdf) {
  const pageCount = pdf.internal.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    pdf.setPage(page);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    pdf.setDrawColor(54, 162, 235);
    pdf.line(14, pageHeight - 27, pageWidth - 14, pageHeight - 27);
    pdf.setFontSize(8);
    pdf.setTextColor(49, 93, 130);
    pdf.text("Los cambios se aceptan dentro de los primeros 10 días de realizada la compra.", pageWidth / 2, pageHeight - 19, { align: "center" });
    pdf.text(`Gracias por elegir ${COMPANY_EXPORT_INFO.name}.`, pageWidth / 2, pageHeight - 12, { align: "center" });
    pdf.setTextColor(0, 0, 0);
  }
}

function drawPdfItemsTable(pdf, items, startY) {
  const pageWidth = pdf.internal.pageSize.getWidth();
  const x = 14;
  const widths = [72, 34, 34, pageWidth - 28 - 72 - 34 - 34];
  const headers = ["Descripción", "Código", "Precio unitario", "Total"];
  const rowHeight = 12;
  let y = startY;
  pdf.setDrawColor(54, 162, 235);
  pdf.setFillColor(13, 59, 102);
  pdf.rect(x, y, pageWidth - 28, 11, "FD");
  pdf.setFontSize(8);
  pdf.setTextColor(255, 255, 255);
  let columnX = x;
  headers.forEach((header, index) => {
    pdf.text(header, columnX + 3, y + 7);
    columnX += widths[index];
  });
  y += 11;
  pdf.setTextColor(13, 59, 102);
  items.forEach((item, index) => {
    pdf.setFillColor(index % 2 ? 239 : 220, index % 2 ? 247 : 238, 255);
    pdf.rect(x, y, pageWidth - 28, rowHeight, "FD");
    const values = [
      String(item.description || "-"),
      String(item.code || "-"),
      formatCurrency(item.unitPrice || 0),
      formatCurrency(item.total || 0),
    ];
    columnX = x;
    values.forEach((value, valueIndex) => {
      const text = pdf.splitTextToSize(value, widths[valueIndex] - 6)[0];
      pdf.text(text, columnX + 3, y + 8);
      columnX += widths[valueIndex];
    });
    y += rowHeight;
  });
  return y;
}

async function generateClientVoucherPdf(movement) {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.warn("jsPDF no está disponible. No se pudo generar el comprobante PDF.");
    return;
  }

  const client = state.clients.find((item) => item.id === movement.clientId);
  const subtotal = Number(movement.subtotal || 0);
  const ivaRate = Number(movement.ivaRate || 0);
  const ivaAmount = subtotal > 0 ? (subtotal * ivaRate) / 100 : 0;
  const total = movement.type === "Cobranza" ? Number(movement.amount || 0) : (subtotal + ivaAmount) || Number(movement.amount || 0);

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  await addCompanyPdfHeader(pdf, "Comprobante respaldatorio");

  const pageWidth = pdf.internal.pageSize.getWidth();
  const fieldGap = 6;
  const fieldWidth = (pageWidth - 28 - fieldGap) / 2;
  const paymentType = movement.paymentType || (movement.dueDate && movement.date && movement.dueDate !== movement.date ? "Crédito" : "Contado");
  drawPdfField(pdf, "Tipo de comprobante", movement.type, 14, 56, fieldWidth);
  drawPdfField(pdf, "Pago", paymentType, 14 + fieldWidth + fieldGap, 56, fieldWidth);
  drawPdfField(pdf, "Fecha de emisión", movement.date, 14, 76, fieldWidth);
  drawPdfField(pdf, "Fecha de vencimiento", movement.dueDate || movement.date, 14 + fieldWidth + fieldGap, 76, fieldWidth);
  drawPdfField(pdf, "Cliente", client ? client.name : "Cliente no encontrado", 14, 96, pageWidth - 28);
  drawPdfField(pdf, "Referencia", movement.reference, 14, 116, fieldWidth);
  drawPdfField(pdf, "Moneda", movement.currency || "UYU", 14 + fieldWidth + fieldGap, 116, fieldWidth);
  drawPdfField(pdf, "Detalle", movement.detail, 14, 136, pageWidth - 28, 22);

  const items = movement.items?.length ? movement.items : [{
    description: movement.detail,
    code: movement.reference,
    unitPrice: subtotal || total,
    total,
  }];
  const itemsEndY = drawPdfItemsTable(pdf, items, 166);
  pdf.setDrawColor(54, 162, 235);
  pdf.setFillColor(220, 238, 255);
  const summaryY = itemsEndY + 8;
  pdf.roundedRect(14, summaryY, pageWidth - 28, 40, 2, 2, "FD");
  pdf.setTextColor(13, 59, 102);
  pdf.setFontSize(11);
  pdf.text("Resumen de importes", 18, summaryY + 8);
  pdf.setFontSize(10);
  pdf.text(`Subtotal: ${formatCurrency(subtotal || total)}`, 18, summaryY + 19);
  pdf.text(`IVA (${ivaRate}%): ${formatCurrency(ivaAmount)}`, 18, summaryY + 28);
  pdf.setFontSize(12);
  pdf.text(`TOTAL: ${formatCurrency(total)}`, pageWidth - 18, summaryY + 28, { align: "right" });
  addPdfFooter(pdf);

  pdf.save(`comprobante-${movement.type.toLowerCase().replace(/\s+/g, "-")}-${movement.reference || movement.date || "voucher"}.pdf`);
}

function renderSelectors() {
  const supplierOptions = state.suppliers.map((supplier) => supplier.name);
  populateSelector("purchase-supplier", supplierOptions);
  populateSelector("payment-supplier", supplierOptions);
  populateSelector("movement-supplier", supplierOptions);
  ["journal-account-1", "journal-account-2"].forEach((selectorId) => {
    const selector = document.getElementById(selectorId);
    if (!selector) return;
    selector.innerHTML = accountPlan
      .map((account) => `<option value="${account.name}">${account.code} · ${account.displayName} · ${account.description}</option>`)
      .join("");
  });

  const purchaseSupplier = document.getElementById("purchase-supplier");
  const paymentSupplier = document.getElementById("payment-supplier");
  const movementSupplier = document.getElementById("movement-supplier");
  if (state.suppliers.length && purchaseSupplier.options.length) {
    purchaseSupplier.value = state.suppliers[0].name;
  }
  if (state.suppliers.length && paymentSupplier.options.length) {
    paymentSupplier.value = state.suppliers[0].name;
  }
  if (state.suppliers.length && movementSupplier.options.length) {
    movementSupplier.value = state.suppliers[0].name;
  }

  const inventoryProductSelect = document.getElementById("inventory-movement-product");
  if (inventoryProductSelect) {
    inventoryProductSelect.innerHTML = state.inventory
      .map((item) => `<option value="${item.id}">${item.name} (${item.sku})</option>`)
      .join("");
    if (state.inventory.length) {
      inventoryProductSelect.value = state.inventory[0].id;
      const selected = state.inventory[0];
      const unitInput = document.getElementById("inventory-movement-unit-cost");
      if (unitInput) unitInput.value = Number(selected.averageCost ?? selected.unitCost ?? 0);
    }
  }

  const journalAccount1 = document.getElementById("journal-account-1");
  const journalAccount2 = document.getElementById("journal-account-2");
  if (journalAccount1.options.length) journalAccount1.value = "Caja";
  if (journalAccount2.options.length) journalAccount2.value = "Capital";

  const clientOptions = state.clients.map((client) => client.name);
  populateSelector("sales-client", clientOptions);
  populateSelector("collection-client", clientOptions);
  populateSelector("client-movement-client", clientOptions);
  populateSelector("invoice-client", clientOptions);

  const salesClient = document.getElementById("sales-client");
  const collectionClient = document.getElementById("collection-client");
  const clientMovementClient = document.getElementById("client-movement-client");
  const invoiceClient = document.getElementById("invoice-client");
  if (state.clients.length && salesClient.options.length) {
    salesClient.value = state.clients[0].name;
  }
  if (state.clients.length && collectionClient.options.length) {
    collectionClient.value = state.clients[0].name;
  }
  if (state.clients.length && clientMovementClient.options.length) {
    clientMovementClient.value = state.clients[0].name;
  }
  if (state.clients.length && invoiceClient.options.length) {
    invoiceClient.value = state.clients[0].name;
  }
}

function renderVoucherDetailsTable() {
  const body = document.getElementById("voucher-details-body");
  if (!body) return;

  body.innerHTML = sortMovementsByDueDateAsc(state.supplierMovements)
    .map((movement) => {
      const subtotal = Number(movement.subtotal || 0);
      const ivaRate = Number(movement.ivaRate || 0);
      const ivaAmount = subtotal > 0 ? (subtotal * ivaRate) / 100 : 0;
      const total = movement.type === "Pago a proveedor" || movement.type === "Pago" ? movement.amount : (subtotal + ivaAmount) || movement.amount;
      
      return `
        <tr>
          <td>${movement.date}</td>
          <td>${getSupplierName(movement.supplierId)}</td>
          <td>${movement.type}</td>
          <td>${movement.reference}</td>
          <td class="amount">${formatCurrency(subtotal || movement.amount)}</td>
          <td class="amount">${formatCurrency(ivaAmount)}</td>
          <td class="amount">${formatCurrency(total)}</td>
          <td>${movement.currency || "UYU"}</td>
          <td>${movement.dueDate || "-"}</td>
          <td>${movement.createdBy || "Sistema"}</td>
        </tr>
      `;
    })
    .join("");
}

function renderProviderAccountTable() {
  const body = document.getElementById("provider-account-body");
  const balances = getSupplierBalances();

  body.innerHTML = balances
    .map((supplier) => {
      const status = supplier.saldo > 0 ? "warn" : "ok";
      const label = supplier.saldo > 0 ? "Debe" : "Al día";
      return `
        <tr>
          <td>${supplier.name}</td>
          <td class="amount">${formatCurrency(supplier.facturas)}</td>
          <td class="amount">${formatCurrency(supplier.notasCredito)}</td>
          <td class="amount">${formatCurrency(supplier.debitos)}</td>
          <td class="amount">${formatCurrency(supplier.pagos)}</td>
          <td class="amount">${formatCurrency(supplier.saldo)}</td>
          <td><span class="status ${status}">${label}</span></td>
          <td>${supplier.createdBy}</td>
        </tr>
      `;
    })
    .join("");
}

function getAccountClassification(account) {
  const map = {
    Caja: "Activo",
    Bancos: "Activo",
    "Cuenta Corriente Proveedores": "Pasivo",
    "Cuenta Corriente Clientes": "Activo",
    Mercaderías: "Activo",
    Compras: "Devengamiento",
    Ventas: "Devengamiento",
    "IVA Crédito": "Impuestos",
    "IVA Débito": "Impuestos",
    Capital: "Pasivo",
    Servicios: "Pérdidas",
    "Gastos de Administración": "Pérdidas",
    Impuestos: "Impuestos",
    "Gastos generales": "Pérdidas",
    "Costos operativos": "Pérdidas",
    "Impuestos sobre gastos": "Pérdidas",
    "Provisiones sobre gastos del período": "Pérdidas",
    "Costo de ventas": "Pérdidas",
    "Gastos financieros": "Pérdidas",
    "Pérdidas diversas": "Pérdidas",
    "Acreedores": "Pasivo",
    "Vales bancarios": "Pasivo",
    "Tarjeta de crédito": "Pasivo",
    "Otros pasivos": "Pasivo",
    "Provisiones sobre gastos a pagar": "Pasivo",
    "Descuentos obtenidos": "Devengamiento",
    "Ganancias diversas": "Devengamiento",
  };

  return map[account] || "Activo";
}

function getDateWindow(periodValue) {
  const today = new Date();
  const startDate = document.getElementById("reports-start-date")?.value;
  const endDate = document.getElementById("reports-end-date")?.value;
  const selectedYear = Number(document.getElementById("reports-year")?.value);

  if (periodValue === "custom") {
    return { start: startDate || null, end: endDate || startDate || null };
  }

  if (periodValue === "specific-year" && selectedYear) {
    return {
      start: `${selectedYear}-01-01`,
      end: `${selectedYear}-12-31`,
    };
  }

  if (periodValue === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  if (periodValue === "quarter") {
    const start = new Date(today.getFullYear(), today.getMonth() - 2, 1);
    const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  if (periodValue === "year") {
    const start = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  return { start: null, end: null };
}

function isWithinPeriod(dateValue, periodValue) {
  if (!dateValue) return true;
  const window = getDateWindow(periodValue);
  if (!window.start || !window.end) return true;

  const value = new Date(`${dateValue}T00:00:00`);
  const start = new Date(`${window.start}T00:00:00`);
  const end = new Date(`${window.end}T00:00:00`);
  return value >= start && value <= end;
}

function getPreviousPeriodWindow(periodValue) {
  const today = new Date();

  if (periodValue === "month") {
    const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const end = new Date(today.getFullYear(), today.getMonth(), 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  if (periodValue === "quarter") {
    const start = new Date(today.getFullYear(), today.getMonth() - 5, 1);
    const end = new Date(today.getFullYear(), today.getMonth() - 2, 0);
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  if (periodValue === "year") {
    const start = new Date(today.getFullYear() - 2, today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate());
    return { start: start.toISOString().slice(0, 10), end: end.toISOString().slice(0, 10) };
  }

  return { start: null, end: null };
}

function buildAccountSummaryRows() {
  const rows = new Map();
  const periodValue = document.getElementById("reports-period")?.value || "all";
  const accountFilter = document.getElementById("reports-account-filter")?.value || "all";

  function addLine(account, type, amount, dateValue) {
    if (!isWithinPeriod(dateValue, periodValue)) return;
    if (accountFilter !== "all" && account !== accountFilter) return;

    if (!rows.has(account)) {
      rows.set(account, { account, Debe: 0, Haber: 0, classification: getAccountClassification(account) });
    }

    const row = rows.get(account);
    if (type === "Debe") {
      row.Debe += Number(amount || 0);
    } else {
      row.Haber += Number(amount || 0);
    }
  }

  state.journalEntries.forEach((entry) => {
    entry.lines.forEach((line) => {
      addLine(line.account, line.type, line.amount, entry.date);
    });
  });

  state.purchases.forEach((purchase) => {
    addLine("Compras", "Debe", purchase.amount, purchase.date);
    addLine("IVA Crédito", "Debe", purchase.iva, purchase.date);
    addLine("Cuenta Corriente Proveedores", "Haber", purchase.total, purchase.date);
  });

  state.payments.forEach((payment) => {
    addLine("Cuenta Corriente Proveedores", "Debe", payment.amount, payment.date);
    addLine(payment.method === "Efectivo" ? "Caja" : "Bancos", "Haber", payment.amount, payment.date);
  });

  state.sales.forEach((sale) => {
    addLine("Cuenta Corriente Clientes", "Debe", sale.total, sale.date);
    addLine("Ventas", "Haber", sale.amount, sale.date);
    addLine("IVA Débito", "Haber", sale.iva, sale.date);
  });

  state.collections.forEach((collection) => {
    addLine(collection.method === "Efectivo" ? "Caja" : "Bancos", "Debe", collection.amount, collection.date);
    addLine("Cuenta Corriente Clientes", "Haber", collection.amount, collection.date);
  });

  return Array.from(rows.values())
    .map((row) => ({
      ...row,
      saldo: row.Debe - row.Haber,
    }))
    .sort((a, b) => a.account.localeCompare(b.account));
}

function renderAccountingReports() {
  const accountRows = buildAccountSummaryRows();
  const periodValue = document.getElementById("reports-period")?.value || "all";
  const compareValue = document.getElementById("reports-compare")?.value || "none";
  const previousWindow = compareValue !== "none" ? getPreviousPeriodWindow(periodValue) : null;
  const startDateInput = document.getElementById("reports-start-date");
  const endDateInput = document.getElementById("reports-end-date");
  const yearInput = document.getElementById("reports-year");
  if (startDateInput) startDateInput.closest(".report-custom-field")?.classList.add("visible");
  if (endDateInput) endDateInput.closest(".report-custom-field")?.classList.add("visible");
  if (yearInput) yearInput.closest(".report-year-field")?.classList.toggle("visible", periodValue === "specific-year");

  const tableBody = document.getElementById("account-report-body");
  if (tableBody) {
    tableBody.innerHTML = accountRows
      .map(
        (row) => `
          <tr>
            <td>${getAccountDisplayName(row.account)}</td>
            <td>${row.classification}</td>
            <td class="amount">${formatCurrency(row.Debe)}</td>
            <td class="amount">${formatCurrency(row.Haber)}</td>
            <td class="amount"><span class="status ${row.saldo >= 0 ? "ok" : "warn"}">${formatCurrency(row.saldo)}</span></td>
          </tr>
        `,
      )
      .join("");
  }

  const groupTableBody = document.getElementById("account-group-report-body");
  if (groupTableBody) {
    const groups = ["Activo", "Pasivo", "Pérdidas", "Devengamiento", "Impuestos"];
    const groupRows = groups.map((group) => {
      const total = accountRows
        .filter((row) => row.classification === group)
        .reduce((sum, row) => sum + Number(row.saldo || 0), 0);
      return {
        group,
        total,
        label: total >= 0 ? "Saldo positivo" : "Saldo negativo",
      };
    });

    groupTableBody.innerHTML = groupRows
      .map(
        (row) => `
          <tr>
            <td>${row.group}</td>
            <td class="amount">${formatCurrency(row.total)}</td>
            <td><span class="status ${row.total >= 0 ? "ok" : "warn"}">${row.label}</span></td>
          </tr>
        `,
      )
      .join("");
  }

  const summaryIds = {
    activos: document.getElementById("report-activos"),
    pasivos: document.getElementById("report-pasivos"),
    perdidas: document.getElementById("report-perdidas"),
    devengamiento: document.getElementById("report-devengamiento"),
    impuestos: document.getElementById("report-impuestos"),
  };

  const currentSummary = {
    activos: accountRows.filter((row) => row.classification === "Activo").reduce((sum, row) => sum + Number(row.saldo || 0), 0),
    pasivos: accountRows.filter((row) => row.classification === "Pasivo").reduce((sum, row) => sum + Number(row.saldo || 0), 0),
    perdidas: accountRows.filter((row) => row.classification === "Pérdidas").reduce((sum, row) => sum + Number(row.saldo || 0), 0),
    devengamiento: accountRows.filter((row) => row.classification === "Devengamiento").reduce((sum, row) => sum + Number(row.saldo || 0), 0),
    impuestos: accountRows.filter((row) => row.classification === "Impuestos").reduce((sum, row) => sum + Number(row.saldo || 0), 0),
  };

  if (summaryIds.activos) summaryIds.activos.textContent = formatCurrency(currentSummary.activos);
  if (summaryIds.pasivos) summaryIds.pasivos.textContent = formatCurrency(currentSummary.pasivos);
  if (summaryIds.perdidas) summaryIds.perdidas.textContent = formatCurrency(currentSummary.perdidas);
  if (summaryIds.devengamiento) summaryIds.devengamiento.textContent = formatCurrency(currentSummary.devengamiento);
  if (summaryIds.impuestos) summaryIds.impuestos.textContent = formatCurrency(currentSummary.impuestos);

  const balanceBody = document.getElementById("balance-general-body");
  if (balanceBody) {
    const assets = currentSummary.activos;
    const liabilities = currentSummary.pasivos;
    const equity = Math.max(0, Math.abs(liabilities) - Math.abs(assets));

    balanceBody.innerHTML = `
      <tr><td>Activos</td><td class="amount">${formatCurrency(assets)}</td></tr>
      <tr><td>Pasivos</td><td class="amount">${formatCurrency(liabilities)}</td></tr>
      <tr><td>Patrimonio</td><td class="amount">${formatCurrency(equity)}</td></tr>
    `;
  }

  const resultsBody = document.getElementById("estado-resultados-body");
  if (resultsBody) {
    const revenue = accountRows.filter((row) => row.classification === "Devengamiento" && row.account === "Ventas").reduce((sum, row) => sum + Number(row.saldo || 0), 0);
    const purchases = accountRows.filter((row) => row.classification === "Devengamiento" && row.account === "Compras").reduce((sum, row) => sum + Number(row.saldo || 0), 0);
    const taxes = accountRows.filter((row) => row.classification === "Impuestos").reduce((sum, row) => sum + Number(row.saldo || 0), 0);
    const result = revenue - purchases - taxes;

    resultsBody.innerHTML = `
      <tr><td>Ventas</td><td class="amount">${formatCurrency(revenue)}</td></tr>
      <tr><td>Compras</td><td class="amount">${formatCurrency(purchases)}</td></tr>
      <tr><td>Impuestos</td><td class="amount">${formatCurrency(taxes)}</td></tr>
      <tr><td>Resultado neto</td><td class="amount">${formatCurrency(result)}</td></tr>
    `;
  }

  const cashflowBody = document.getElementById("cashflow-body");
  if (cashflowBody) {
    const cashIn = state.collections.reduce((sum, operation) => sum + Number(operation.amount || 0), 0);
    const cashOut = state.payments.reduce((sum, operation) => sum + Number(operation.amount || 0), 0);
    const cashBalance = cashIn - cashOut;

    cashflowBody.innerHTML = `
      <tr><td>Ingresos de caja</td><td class="amount">${formatCurrency(cashIn)}</td></tr>
      <tr><td>Egresos de caja</td><td class="amount">${formatCurrency(cashOut)}</td></tr>
      <tr><td>Saldo de caja</td><td class="amount">${formatCurrency(cashBalance)}</td></tr>
    `;
  }

  const varianceBadge = document.getElementById("reports-variance");
  if (varianceBadge && previousWindow && compareValue !== "none") {
    const currentNet = currentSummary.activos + currentSummary.pasivos;
    const previousRows = buildPeriodRows(previousWindow.start, previousWindow.end);
    const previousNet = previousRows.filter((row) => row.classification === "Activo" || row.classification === "Pasivo").reduce((sum, row) => sum + Number(row.saldo || 0), 0);
    const delta = currentNet - previousNet;
    varianceBadge.textContent = `${delta >= 0 ? "+" : ""}${formatCurrency(delta)} vs. período anterior`;
  }
}

function renderReportsAccountFilter() {
  const selector = document.getElementById("reports-account-filter");
  if (!selector) return;
  const selectedValue = selector.value || "all";
  selector.innerHTML = `<option value="all">Todas las cuentas</option>${accountPlan
    .map((account) => `<option value="${account.name}">${account.code} · ${account.name}</option>`)
    .join("")}`;
  selector.value = accountPlan.some((account) => account.name === selectedValue) ? selectedValue : "all";
}

function buildPeriodRows(startDate, endDate) {
  const rows = new Map();

  function addLine(account, type, amount, dateValue) {
    if (!dateValue) return;
    const valueDate = new Date(`${dateValue}T00:00:00`);
    const start = startDate ? new Date(`${startDate}T00:00:00`) : null;
    const end = endDate ? new Date(`${endDate}T00:00:00`) : null;

    if (start && valueDate < start) return;
    if (end && valueDate > end) return;

    if (!rows.has(account)) {
      rows.set(account, { account, Debe: 0, Haber: 0, classification: getAccountClassification(account) });
    }

    const row = rows.get(account);
    if (type === "Debe") row.Debe += Number(amount || 0);
    else row.Haber += Number(amount || 0);
  }

  state.journalEntries.forEach((entry) => {
    entry.lines.forEach((line) => addLine(line.account, line.type, line.amount, entry.date));
  });
  state.purchases.forEach((purchase) => {
    addLine("Compras", "Debe", purchase.amount, purchase.date);
    addLine("IVA Crédito", "Debe", purchase.iva, purchase.date);
    addLine("Cuenta Corriente Proveedores", "Haber", purchase.total, purchase.date);
  });
  state.payments.forEach((payment) => {
    addLine("Cuenta Corriente Proveedores", "Debe", payment.amount, payment.date);
    addLine(payment.method === "Efectivo" ? "Caja" : "Bancos", "Haber", payment.amount, payment.date);
  });
  state.sales.forEach((sale) => {
    addLine("Cuenta Corriente Clientes", "Debe", sale.total, sale.date);
    addLine("Ventas", "Haber", sale.amount, sale.date);
    addLine("IVA Débito", "Haber", sale.iva, sale.date);
  });
  state.collections.forEach((collection) => {
    addLine(collection.method === "Efectivo" ? "Caja" : "Bancos", "Debe", collection.amount, collection.date);
    addLine("Cuenta Corriente Clientes", "Haber", collection.amount, collection.date);
  });

  return Array.from(rows.values()).map((row) => ({ ...row, saldo: row.Debe - row.Haber }));
}

async function exportAccountingReportPdf() {
  if (!window.jspdf || !window.jspdf.jsPDF) {
    console.warn("jsPDF no está disponible para exportar el informe.");
    return;
  }

  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF();
  const rows = buildAccountSummaryRows();

  await addCompanyPdfHeader(pdf, "Informe contable - Ashford");
  pdf.setFontSize(10);
  pdf.text(`Período: ${document.getElementById("reports-period")?.value || "Todo"}`, 14, 56);

  let y = 66;
  rows.slice(0, 18).forEach((row) => {
    pdf.text(`${getAccountDisplayName(row.account)} | ${row.classification} | ${formatCurrency(row.saldo)}`, 14, y);
    y += 7;
  });

  addPdfFooter(pdf);
  pdf.save("informe-contable-ashford.pdf");
}

function exportAccountingReportExcel() {
  if (!window.XLSX) {
    console.warn("XLSX no está disponible para exportar el informe.");
    return;
  }

  const periodValue = document.getElementById("reports-period")?.value || "all";
  const periodLabel = periodValue === "custom"
    ? `${document.getElementById("reports-start-date")?.value || ""} al ${document.getElementById("reports-end-date")?.value || ""}`
    : periodValue;
  const filterByPeriod = (item) => isWithinPeriod(item.date, periodValue);
  const workbook = XLSX.utils.book_new();

  const addSheet = (name, rows) => {
    const companyRows = rows.map((row) => ({ Empresa: COMPANY_EXPORT_INFO.name, ...row }));
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(companyRows), name);
  };

  addSheet("Empresa", [{
    Empresa: COMPANY_EXPORT_INFO.name,
    Ciudad: COMPANY_EXPORT_INFO.city,
    Telefono: COMPANY_EXPORT_INFO.phone,
    Instagram: COMPANY_EXPORT_INFO.instagram,
    TikTok: COMPANY_EXPORT_INFO.tiktok,
    Logo: COMPANY_EXPORT_INFO.logo,
    Nota: "El logo se encuentra incluido en la aplicación y se referencia por su nombre de archivo.",
  }]);

  addSheet("Resumen contable", buildAccountSummaryRows().map((row) => ({
    Cuenta: row.account,
    Clasificacion: row.classification,
    Debe: row.Debe,
    Haber: row.Haber,
    Saldo: row.saldo,
    Periodo: periodLabel,
  })));
  addSheet("Compras", state.purchases.filter(filterByPeriod).map((item) => ({
    Fecha: item.date,
    Proveedor: getSupplierName(item.proveedorId),
    Concepto: item.concept,
    Neto: item.amount,
    IVA: item.iva,
    Total: item.total,
    RealizadoPor: item.createdBy || "Sistema",
  })));
  addSheet("Pagos", state.payments.filter(filterByPeriod).map((item) => ({
    Fecha: item.date,
    Proveedor: getSupplierName(item.proveedorId),
    Medio: item.method,
    Monto: item.amount,
    RealizadoPor: item.createdBy || "Sistema",
  })));
  addSheet("Ventas", state.sales.filter(filterByPeriod).map((item) => ({
    Fecha: item.date,
    Cliente: getClientName(item.clientId),
    Concepto: item.concept,
    Neto: item.amount,
    IVA: item.iva,
    Total: item.total,
    RealizadoPor: item.createdBy || "Sistema",
  })));
  addSheet("Cobranzas", state.collections.filter(filterByPeriod).map((item) => ({
    Fecha: item.date,
    Cliente: getClientName(item.clientId),
    Medio: item.method,
    Monto: item.amount,
    RealizadoPor: item.createdBy || "Sistema",
  })));
  addSheet("Inventario", state.inventory.map((item) => ({
    SKU: item.sku,
    Codigo: item.barcode,
    Producto: item.name,
    Categoria: item.category,
    Stock: item.stock,
    CostoUnitario: item.unitCost,
    CostoPromedio: item.averageCost,
    CostoDeVenta: item.costOfSale || 0,
    Ubicacion: item.location,
  })));
  addSheet("Calendario", [
    ...state.calendarAgenda.map((item) => ({ Fecha: item.date, Tipo: "Evento", Titulo: item.title, Detalle: item.detail || "" })),
    ...state.calendarNotes.map((item) => ({ Fecha: item.date, Tipo: "Alerta", Titulo: item.text, Detalle: "" })),
    ...state.calendarTasks.map((item) => ({ Fecha: item.dueDate, Tipo: "Tarea", Titulo: item.title, Detalle: item.done ? "Completada" : "Pendiente" })),
  ]);

  XLSX.writeFile(workbook, "informe-contable-ashford.xlsx");
}

function renderAll() {
  renderSelectors();
  renderStats();
  renderHomeActivity();
  renderPaymentCalendar();
  renderCalendarDashboard();
  renderPurchaseTable();
  renderSupplierTable();
  renderCurrentAccounts();
  renderProviderAccountTable();
  renderVoucherDetailsTable();
  renderPaymentTable();
  renderLedgerTable();
  renderJournalTable();
  renderAccountPlanTable();
  renderAccountPlanAdmin();
  renderSalesTable();
  renderClientTable();
  renderClientAccountTable();
  renderClientCurrentAccounts();
  renderCollectionTable();
  renderClientVoucherDetailsTable();
  renderClientLedgerTable();
  renderInventorySummary();
  renderInventoryTable();
  renderInventoryMovementTable();
  renderReportsAccountFilter();
  renderAccountingReports();
}

function normalizeImportHeader(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function getImportedValue(row, names) {
  const entries = Object.entries(row);
  const entry = entries.find(([key]) => names.includes(normalizeImportHeader(key)));
  return entry ? entry[1] : "";
}

function mapImportedProduct(row) {
  const name = String(getImportedValue(row, ["nombre", "producto", "name"])).trim();
  const sku = String(getImportedValue(row, ["sku", "codigoarticulo", "codigo"])).trim();
  const barcode = String(getImportedValue(row, ["codigodebarras", "barcode", "ean"])).trim() || sku;
  const category = String(getImportedValue(row, ["categoria", "rubro", "category"])).trim();
  const stock = Number(String(getImportedValue(row, ["stock", "cantidad", "existencia"])).replace(",", ".")) || 0;
  const unitCost = Number(String(getImportedValue(row, ["costounitario", "costeunitario", "precio", "costo"])).replace(",", ".")) || 0;
  const costOfSale = Number(String(getImportedValue(row, ["costodeventa", "costoventa", "costosalida"])).replace(",", ".")) || 0;
  const location = String(getImportedValue(row, ["ubicacion", "deposito", "location"])).trim();
  return { name, sku, barcode, category, stock, unitCost, averageCost: unitCost, costOfSale, location };
}

function addImportedProducts(rows) {
  const existingSkus = new Set(state.inventory.map((item) => item.sku.toLowerCase()));
  let imported = 0;
  let skipped = 0;
  rows.forEach((row) => {
    const product = mapImportedProduct(row);
    if (!product.name || !product.sku || !product.category || existingSkus.has(product.sku.toLowerCase())) {
      skipped += 1;
      return;
    }
    Object.assign(product, getCreationMetadata());
    product.id = createId("inv");
    state.inventory.unshift(product);
    existingSkus.add(product.sku.toLowerCase());
    if (product.stock > 0 && product.unitCost > 0) {
      createInventoryMovement({
        productId: product.id,
        type: "Entrada",
        date: getUruguayDateString(),
        quantity: product.stock,
        unitCost: product.unitCost,
        reference: `IMP-${product.sku}`,
        detail: "Importación masiva de inventario",
        source: "Importación",
      });
    }
    imported += 1;
  });
  return { imported, skipped };
}

async function readPdfInventoryRows(file) {
  if (!window.pdfjsLib) throw new Error("PDF.js no está disponible");
  const document = await window.pdfjsLib.getDocument({ data: await file.arrayBuffer(), disableWorker: true }).promise;
  const rows = [];
  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    content.items.map((item) => item.str).join("\t").split(/\n|\t(?=[^\t]*\t)/).forEach((line) => {
      const values = line.split(/\s{2,}|\||;/).map((value) => value.trim()).filter(Boolean);
      if (values.length >= 3 && !/nombre|producto|sku/i.test(values[0])) {
        rows.push({ Nombre: values[0], SKU: values[1], Categoria: values[2], Stock: values[3], "Costo unitario": values[4], Ubicacion: values.slice(5).join(" ") });
      }
    });
  }
  return rows;
}

async function importInventoryFile(file) {
  const status = document.getElementById("inventory-import-status");
  try {
    let rows;
    if (file.name.toLowerCase().endsWith(".pdf")) {
      rows = await readPdfInventoryRows(file);
    } else {
      if (!window.XLSX) throw new Error("XLSX no está disponible");
      const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(firstSheet, { defval: "" });
    }
    const result = addImportedProducts(rows);
    saveState();
    renderAll();
    if (status) status.textContent = `Importados: ${result.imported}. Omitidos: ${result.skipped} (faltantes o SKU repetido).`;
  } catch (error) {
    if (status) status.textContent = `No se pudo importar el archivo: ${error.message}`;
  }
}

function initializeAuthentication() {
  const authScreen = document.getElementById("auth-screen");
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const toggleButton = document.getElementById("auth-toggle-btn");
  const message = document.getElementById("auth-message");
  const userBadge = document.getElementById("current-user-badge");
  const logoutButton = document.getElementById("logout-btn");
  const manageUsersButton = document.getElementById("manage-users-btn");
  const myAccountButton = document.getElementById("my-account-btn");
  const userManagementModal = document.getElementById("user-management-modal");
  const managedUsersSection = document.getElementById("managed-users-section");
  const managedUsersBody = document.getElementById("managed-users-body");
  const managedUserForm = document.getElementById("managed-user-form");
  const managedUserCancel = document.getElementById("managed-user-cancel");
  const managedUserStatus = document.getElementById("managed-user-status");
  const passwordStatus = document.getElementById("password-status");
  let registering = false;

  async function apiRequest(url, options = {}) {
    const response = await fetch(`${API_BASE_URL}${url}`, { credentials: "include", headers: { "Content-Type": "application/json", ...options.headers }, ...options });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "No se pudo completar la solicitud.");
    return data;
  }

  const updateAuthView = () => {
    if (authScreen) authScreen.classList.toggle("hidden", Boolean(currentUser));
    if (userBadge) userBadge.textContent = currentUser ? `${currentUser.name} · ${currentUser.role}` : "Usuario";
    if (manageUsersButton) manageUsersButton.classList.toggle("hidden", currentUser?.role !== "Gerencial");
  };

  const resetManagedUserForm = () => {
    managedUserForm?.reset();
    const id = document.getElementById("managed-user-id");
    const submit = document.getElementById("managed-user-submit");
    id.value = "";
    submit.textContent = "Crear Administrador";
    managedUserCancel?.classList.add("hidden");
  };

  const renderManagedUsers = (users) => {
    if (!managedUsersBody) return;
    const administrators = users.filter((item) => item.role === "Administrador");
    managedUsersBody.innerHTML = administrators.map((managedUser) => `
      <tr>
        <td>${managedUser.name}</td>
        <td>${managedUser.email}</td>
        <td><span class="status ${managedUser.active ? "ok" : "danger"}">${managedUser.active ? "Activo" : "Inactivo"}</span></td>
        <td>
          <button type="button" class="small-btn managed-user-edit" data-user-id="${managedUser.id}">Modificar</button>
          <button type="button" class="small-btn managed-user-toggle" data-user-id="${managedUser.id}" data-active="${managedUser.active}">${managedUser.active ? "Inactivar" : "Activar"}</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="4">No hay usuarios Administradores.</td></tr>`;
    managedUsersBody.querySelectorAll(".managed-user-edit").forEach((button) => {
      button.addEventListener("click", () => {
        const managedUser = administrators.find((item) => item.id === button.dataset.userId);
        if (!managedUser) return;
        document.getElementById("managed-user-id").value = managedUser.id;
        document.getElementById("managed-user-name").value = managedUser.name;
        document.getElementById("managed-user-email").value = managedUser.email;
        document.getElementById("managed-user-password").value = "";
        document.getElementById("managed-user-submit").textContent = "Guardar cambios";
        managedUserCancel?.classList.remove("hidden");
      });
    });
    managedUsersBody.querySelectorAll(".managed-user-toggle").forEach((button) => {
      button.addEventListener("click", async () => {
        try {
          await apiRequest(`/api/users/${encodeURIComponent(button.dataset.userId)}`, { method: "PATCH", body: JSON.stringify({ active: button.dataset.active !== "true" }) });
          await loadManagedUsers();
        } catch (error) {
          if (managedUserStatus) managedUserStatus.textContent = error.message;
        }
      });
    });
  };

  const loadManagedUsers = async () => {
    if (currentUser?.role !== "Gerencial") return;
    const data = await apiRequest("/api/users");
    renderManagedUsers(data.users || []);
  };

  const openUserManagement = async () => {
    userManagementModal?.classList.remove("hidden");
    userManagementModal?.setAttribute("aria-hidden", "false");
    managedUsersSection?.classList.toggle("hidden", currentUser?.role !== "Gerencial");
    if (passwordStatus) passwordStatus.textContent = "";
    if (managedUserStatus) managedUserStatus.textContent = "";
    resetManagedUserForm();
    if (currentUser?.role === "Gerencial") {
      try { await loadManagedUsers(); } catch (error) { if (managedUserStatus) managedUserStatus.textContent = error.message; }
    }
  };

  const closeUserManagement = () => {
    userManagementModal?.classList.add("hidden");
    userManagementModal?.setAttribute("aria-hidden", "true");
  };

  myAccountButton?.addEventListener("click", openUserManagement);
  manageUsersButton?.addEventListener("click", openUserManagement);
  document.getElementById("close-user-management-modal")?.addEventListener("click", closeUserManagement);
  userManagementModal?.querySelector("[data-close-user-modal='true']")?.addEventListener("click", closeUserManagement);

  document.getElementById("change-password-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await apiRequest("/api/auth/password", { method: "POST", body: JSON.stringify({ currentPassword: document.getElementById("current-password").value, newPassword: document.getElementById("new-password").value }) });
      event.target.reset();
      if (passwordStatus) passwordStatus.textContent = "Contraseña actualizada correctamente.";
    } catch (error) {
      if (passwordStatus) passwordStatus.textContent = error.message;
    }
  });

  managedUserCancel?.addEventListener("click", resetManagedUserForm);
  managedUserForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (currentUser?.role !== "Gerencial") return;
    const id = document.getElementById("managed-user-id").value;
    const payload = { name: document.getElementById("managed-user-name").value.trim(), email: document.getElementById("managed-user-email").value.trim() };
    const password = document.getElementById("managed-user-password").value;
    if (password) payload.password = password;
    try {
      await apiRequest(id ? `/api/users/${encodeURIComponent(id)}` : "/api/users", { method: id ? "PATCH" : "POST", body: JSON.stringify({ ...payload, ...(!id ? { password, role: "Administrador" } : {}) }) });
      if (managedUserStatus) managedUserStatus.textContent = id ? "Usuario modificado correctamente." : "Administrador creado correctamente.";
      resetManagedUserForm();
      await loadManagedUsers();
    } catch (error) {
      if (managedUserStatus) managedUserStatus.textContent = error.message;
    }
  });

  const showRegistration = () => {
    registering = !registering;
    loginForm?.classList.toggle("hidden", registering);
    registerForm?.classList.toggle("hidden", !registering);
    toggleButton.textContent = registering ? "Ya tengo una cuenta" : "Crear una cuenta nueva";
    if (message) message.textContent = registering ? "Creá una cuenta para un nuevo usuario." : "Ingresá con tu cuenta para continuar.";
  };

  toggleButton?.addEventListener("click", showRegistration);
  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.getElementById("login-email").value.trim().toLowerCase();
    const password = document.getElementById("login-password").value;
    try {
      const data = await apiRequest("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
      currentUser = data.user;
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      updateAuthView();
      renderAll();
    } catch (error) {
      if (message) message.textContent = error.message;
    }
  });

  registerForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (currentUser?.role !== "Gerencial") {
      if (message) message.textContent = "Solo un usuario Gerencial puede dar de alta usuarios.";
      return;
    }
    const name = document.getElementById("register-name").value.trim();
    const email = document.getElementById("register-email").value.trim().toLowerCase();
    const password = document.getElementById("register-password").value;
    const role = document.getElementById("register-role").value;
    try {
      await apiRequest("/api/users", { method: "POST", body: JSON.stringify({ name, email, password, role }) });
      registerForm.reset();
      registering = false;
      authScreen?.classList.add("hidden");
      updateAuthView();
      renderAll();
      if (message) message.textContent = "Usuario creado correctamente.";
    } catch (error) {
      if (message) message.textContent = error.message;
    }
  });

  logoutButton?.addEventListener("click", async () => {
    await apiRequest("/api/auth/logout", { method: "POST" }).catch(() => {});
    currentUser = null;
    sessionStorage.removeItem(SESSION_KEY);
    updateAuthView();
    renderAll();
  });

  currentUser = null;
  apiRequest("/api/auth/me")
    .then((data) => {
      currentUser = data.user;
      if (currentUser) sessionStorage.setItem(SESSION_KEY, JSON.stringify(currentUser));
      updateAuthView();
      renderAll();
    })
    .catch(() => updateAuthView());
}

function initializeTheme() {
  const toggle = document.getElementById("theme-toggle-btn");
  const dark = localStorage.getItem(THEME_KEY) === "dark";
  document.body.classList.toggle("dark-mode", dark);
  if (toggle) toggle.textContent = dark ? "Modo claro" : "Modo oscuro";
  toggle?.addEventListener("click", () => {
    const enabled = document.body.classList.toggle("dark-mode");
    localStorage.setItem(THEME_KEY, enabled ? "dark" : "light");
    toggle.textContent = enabled ? "Modo claro" : "Modo oscuro";
  });
}

function attachEvents() {
  document.querySelectorAll(".sidebar-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-btn").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const homeScreen = document.getElementById("home-screen");
      const processScreen = document.getElementById("process-screen");
      const clientsScreen = document.getElementById("clients-screen");
      const inventoryScreen = document.getElementById("inventory-screen");
      const reportsScreen = document.getElementById("reports-screen");
      const calendarScreen = document.getElementById("calendar-screen");
      const view = button.dataset.view;

      homeScreen.classList.toggle("active", view === "home");
      processScreen.classList.toggle("active", view === "process");
      clientsScreen.classList.toggle("active", view === "clients");
      if (inventoryScreen) inventoryScreen.classList.toggle("active", view === "inventory");
      if (reportsScreen) reportsScreen.classList.toggle("active", view === "reports");
      if (calendarScreen) calendarScreen.classList.toggle("active", view === "calendar");

      if (view === "clients") {
        document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
        const clientsTab = document.querySelector('[data-target="panel-clientes"]');
        if (clientsTab) {
          clientsTab.classList.add("active");
        }
        document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
        const clientsPanel = document.getElementById("panel-clientes");
        if (clientsPanel) clientsPanel.classList.add("active");
      }

      if (view === "process") {
        document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
        const processTab = document.querySelector('[data-target="panel-compra"]');
        if (processTab) {
          processTab.classList.add("active");
        }
        document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
        const processPanel = document.getElementById("panel-compra");
        if (processPanel) processPanel.classList.add("active");
      }

      if (view === "inventory") {
        document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
        const inventoryTab = document.querySelector('[data-target="panel-inventario"]');
        if (inventoryTab) {
          inventoryTab.classList.add("active");
        }
        document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
        const inventoryPanel = document.getElementById("panel-inventario");
        if (inventoryPanel) inventoryPanel.classList.add("active");
      }

      if (view === "reports") {
        document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
        const reportsTab = document.querySelector('[data-target="panel-informes"]');
        if (reportsTab) {
          reportsTab.classList.add("active");
        }
        document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
        const reportsPanel = document.getElementById("panel-informes");
        if (reportsPanel) reportsPanel.classList.add("active");
      }

      if (view === "calendar") {
        document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
        const calendarTab = document.querySelector('[data-target="panel-agenda"]');
        if (calendarTab) {
          calendarTab.classList.add("active");
        }
        document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
        const agendaPanel = document.getElementById("panel-agenda");
        if (agendaPanel) agendaPanel.classList.add("active");
      }
    });
  });

  document.querySelectorAll(".secondary-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const targetView = button.dataset.view;
      if (!targetView) return;

      document.querySelectorAll(".sidebar-btn").forEach((item) => item.classList.toggle("active", item.dataset.view === targetView));
      document.getElementById("home-screen").classList.toggle("active", targetView === "home");
      document.getElementById("process-screen").classList.toggle("active", targetView !== "home");

      if (targetView !== "home") {
        document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
        const providerTab = document.querySelector('[data-target="panel-proveedores"]');
        if (providerTab) {
          providerTab.classList.add("active");
        }
        document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));
        const providerPanel = document.getElementById("panel-proveedores");
        if (providerPanel) providerPanel.classList.add("active");
      }
    });
  });

  const currentAccountSupplier = document.getElementById("current-account-supplier");
  if (currentAccountSupplier) {
    currentAccountSupplier.addEventListener("change", (event) => {
      selectedCurrentAccountSupplierId = event.target.value;
      renderCurrentAccounts();
    });
  }
  const currentAccountSearch = document.getElementById("current-account-search");
  if (currentAccountSearch) currentAccountSearch.addEventListener("input", renderCurrentAccounts);

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));

      button.classList.add("active");
      if (button.dataset.target === "panel-plan-cuentas") {
        document.querySelectorAll(".sidebar-btn").forEach((item) => item.classList.toggle("active", item.dataset.view === "reports"));
        document.querySelectorAll(".view").forEach((item) => item.classList.toggle("active", item.id === "reports-screen"));
      }
      const target = document.getElementById(button.dataset.target);
      if (target) target.classList.add("active");
    });
  });

  const accountPlanForm = document.getElementById("account-plan-form");
  const accountEditCode = document.getElementById("account-edit-code");
  const accountFormCode = document.getElementById("account-form-code");
  const accountFormChapter = document.getElementById("account-form-chapter");
  const accountFormName = document.getElementById("account-form-name");
  const accountFormDescription = document.getElementById("account-form-description");
  const accountFormCancel = document.getElementById("account-form-cancel");
  const accountPlanStatus = document.getElementById("account-plan-status");
  const accountPlanEditToggle = document.getElementById("account-plan-edit-toggle");
  const accountPlanSearch = document.getElementById("account-plan-search");
  const accountPlanChapterFilter = document.getElementById("account-plan-chapter-filter");

  accountPlanEditToggle?.addEventListener("click", () => {
    if (currentUser?.role !== "Gerencial") return;
    accountPlanEditMode = !accountPlanEditMode;
    renderAll();
  });
  accountPlanSearch?.addEventListener("input", renderAccountPlanTable);
  accountPlanChapterFilter?.addEventListener("change", renderAccountPlanTable);

  accountPlanForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (currentUser?.role !== "Gerencial") return;
    const code = accountFormCode.value.trim();
    const chapter = accountFormChapter.value;
    const name = accountFormName.value.trim();
    const description = accountFormDescription.value.trim();
    if (!/^\d{6}$/.test(code) || !name || !description) {
      accountPlanStatus.textContent = "Completá código de 6 números, cuenta y descripción.";
      return;
    }
    const editing = accountEditCode.value;
    if (accountPlan.some((account) => account.code === code && account.code !== editing)) {
      accountPlanStatus.textContent = "Ese código ya existe.";
      return;
    }
    if (editing) {
      const account = accountPlan.find((item) => item.code === editing);
      if (account) Object.assign(account, { code, name, displayName: name, description, chapter });
      accountPlanStatus.textContent = "Cuenta modificada correctamente.";
    } else {
      accountPlan.push({ code, name, displayName: name, description, chapter });
      accountPlanStatus.textContent = "Cuenta creada correctamente.";
    }
    accountByName = new Map(accountPlan.map((account) => [account.name, account]));
    accountPlanForm.reset();
    accountEditCode.value = "";
    saveState();
    renderAll();
  });

  accountFormCancel?.addEventListener("click", () => {
    accountPlanForm.reset();
    accountEditCode.value = "";
    accountFormCancel.classList.add("hidden");
  });

  document.addEventListener("click", (event) => {
    const editButton = event.target.closest("[data-account-code]");
    if (!editButton || currentUser?.role !== "Gerencial") return;
    const account = accountPlan.find((item) => item.code === editButton.dataset.accountCode);
    if (!account) return;
    accountEditCode.value = account.code;
    accountFormCode.value = account.code;
    accountFormChapter.value = account.chapter;
    accountFormName.value = account.name;
    accountFormDescription.value = account.description;
    accountFormCancel.classList.remove("hidden");
    accountFormName.focus();
  });

  const supplierMovementModal = document.getElementById("supplier-movement-modal");

  function openSupplierMovementModal(selectedMovement) {
    if (!supplierMovementModal) return;
    const title = document.getElementById("movement-title");
    const movementType = document.getElementById("movement-type");
    const supplierSelect = document.getElementById("movement-supplier");

    if (movementType) movementType.value = selectedMovement;
    if (title) title.textContent = `Registrar ${selectedMovement.toLowerCase()}`;
    if (supplierSelect && !supplierSelect.value && state.suppliers.length) {
      supplierSelect.value = state.suppliers[0].name;
    }

    supplierMovementModal.classList.remove("hidden");
    supplierMovementModal.setAttribute("aria-hidden", "false");
  }

  function closeSupplierMovementModal() {
    if (!supplierMovementModal) return;
    supplierMovementModal.classList.add("hidden");
    supplierMovementModal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".provider-action").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".provider-action").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const selectedMovement = button.dataset.movement;
      openSupplierMovementModal(selectedMovement);
    });
  });

  const closeSupplierMovementButton = document.getElementById("close-supplier-movement-modal");
  if (closeSupplierMovementButton) {
    closeSupplierMovementButton.addEventListener("click", closeSupplierMovementModal);
  }

  const supplierModalBackdrop = document.querySelector("[data-close-supplier-modal='true']");
  if (supplierModalBackdrop) {
    supplierModalBackdrop.addEventListener("click", closeSupplierMovementModal);
  }

  const updateSupplierMovementTotals = () => {
    const subtotal = Number(document.getElementById("movement-subtotal")?.value || 0);
    const ivaRate = Number(document.getElementById("movement-iva-rate")?.value || 0);
    const iva = subtotal * ivaRate / 100;
    const total = subtotal + iva;
    const ivaOutput = document.getElementById("movement-iva");
    const totalInput = document.getElementById("movement-amount");
    if (ivaOutput) ivaOutput.textContent = formatCurrency(iva);
    if (totalInput) totalInput.value = total.toFixed(2);
  };

  ["input", "change"].forEach((eventName) => {
    document.getElementById("movement-subtotal")?.addEventListener(eventName, updateSupplierMovementTotals);
    document.getElementById("movement-iva-rate")?.addEventListener(eventName, updateSupplierMovementTotals);
  });
  updateSupplierMovementTotals();

  document.getElementById("supplier-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("supplier-name").value.trim();
    const cuit = document.getElementById("supplier-cuit").value.trim();
    const contact = document.getElementById("supplier-contact").value.trim();
    const address = document.getElementById("supplier-address").value.trim();
    const country = document.getElementById("supplier-country").value.trim();
    const phone = document.getElementById("supplier-phone").value.trim();
    const email = document.getElementById("supplier-email").value.trim();
    const notes = document.getElementById("supplier-notes").value.trim();

    if (!name || !cuit) return;

    state.suppliers.unshift({
      ...getCreationMetadata(),
      id: createId("prov"),
      name,
      cuit,
      contact,
      address,
      country,
      phone,
      email,
      notes,
    });

    event.target.reset();
    saveState();
    renderAll();
  });

  document.getElementById("supplier-movement-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const supplierName = document.getElementById("movement-supplier").value;
    const supplier = state.suppliers.find((item) => item.name === supplierName);
    const selectedMovement = document.getElementById("movement-type").value || "Factura";
    const date = document.getElementById("movement-date").value;
    const dueDate = document.getElementById("movement-due-date").value;
    const currency = document.getElementById("movement-currency").value || "UYU";
    const reference = document.getElementById("movement-reference").value.trim();
    const subtotal = Number(document.getElementById("movement-subtotal").value || 0);
    const ivaRate = Number(document.getElementById("movement-iva-rate").value || 0);
    const amount = subtotal + (subtotal * ivaRate / 100);
    const detail = document.getElementById("movement-detail").value.trim();

    if (!supplier || !date || !dueDate || !reference || !detail || !amount) return;

    createSupplierMovementRecord({
      supplierId: supplier.id,
      type: selectedMovement,
      date,
      dueDate,
      currency,
      reference,
      subtotal,
      ivaRate,
      amount,
      detail,
    });

    event.target.reset();
    document.getElementById("movement-date").valueAsDate = new Date();
    document.getElementById("movement-due-date").valueAsDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15);
    document.getElementById("movement-type").value = "Factura";
    document.getElementById("movement-currency").value = "UYU";
    document.getElementById("movement-iva-rate").value = "22";
    updateSupplierMovementTotals();
    saveState();
    renderAll();
    closeSupplierMovementModal();
  });

  const updatePurchaseTotals = () => {
    const amount = Number(document.getElementById("purchase-amount")?.value || 0);
    const ivaRate = Number(document.getElementById("purchase-iva-rate")?.value || 0);
    const iva = amount * ivaRate / 100;
    const total = amount + iva;
    const ivaInput = document.getElementById("purchase-iva");
    const totalInput = document.getElementById("purchase-total");
    if (ivaInput) ivaInput.textContent = formatCurrency(iva);
    if (totalInput) totalInput.textContent = formatCurrency(total);
  };

  ["input", "change"].forEach((eventName) => {
    document.getElementById("purchase-amount")?.addEventListener(eventName, updatePurchaseTotals);
    document.getElementById("purchase-iva-rate")?.addEventListener(eventName, updatePurchaseTotals);
  });
  updatePurchaseTotals();

  document.getElementById("purchase-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const supplierName = document.getElementById("purchase-supplier").value;
    const supplier = state.suppliers.find((item) => item.name === supplierName);
    const date = document.getElementById("purchase-date").value;
    const concept = document.getElementById("purchase-concept").value.trim();
    const amount = Number(document.getElementById("purchase-amount").value || 0);
    const ivaRate = Number(document.getElementById("purchase-iva-rate").value || 0);
    const iva = amount * ivaRate / 100;

    if (!supplier || !date || !concept) return;

    const total = amount + iva;
    const purchase = {
      ...getCreationMetadata(),
      id: createId("cmp"),
      proveedorId: supplier.id,
      date,
      concept,
      amount,
      iva,
      total,
    };

    state.purchases.unshift(purchase);
    createSupplierMovementRecord({
      supplierId: supplier.id,
      type: "Factura",
      date,
      dueDate: addDays(date, 15),
      currency: "UYU",
      reference: buildReference("F"),
      subtotal: amount,
      ivaRate,
      amount: total,
      detail: concept,
      items: [{ description: concept, code: buildReference("VTA"), unitPrice: amount, total }],
    });

    event.target.reset();
    document.getElementById("purchase-date").valueAsDate = new Date();
    document.getElementById("purchase-iva-rate").value = "22";
    updatePurchaseTotals();
    saveState();
    renderAll();
  });

  document.getElementById("payment-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const supplierName = document.getElementById("payment-supplier").value;
    const supplier = state.suppliers.find((item) => item.name === supplierName);
    const date = document.getElementById("payment-date").value;
    const method = document.getElementById("payment-method").value;
    const amount = Number(document.getElementById("payment-amount").value || 0);

    if (!supplier || !date || !amount) return;

    const payment = {
      ...getCreationMetadata(),
      id: createId("pay"),
      proveedorId: supplier.id,
      date,
      method,
      amount,
    };

    state.payments.unshift(payment);
    createSupplierMovementRecord({
      supplierId: supplier.id,
      type: "Pago",
      date,
      dueDate: date,
      currency: "UYU",
      reference: buildReference("P"),
      subtotal: amount,
      ivaRate: 0,
      amount,
      detail: `${method} - Pago a proveedor`,
    });

    event.target.reset();
    document.getElementById("payment-date").valueAsDate = new Date();
    saveState();
    renderAll();
  });

  document.getElementById("journal-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const date = document.getElementById("journal-date").value;
    const detail = document.getElementById("journal-detail").value.trim();
    const account1 = document.getElementById("journal-account-1").value;
    const type1 = document.getElementById("journal-type-1").value;
    const amount1 = Number(document.getElementById("journal-amount-1").value || 0);
    const account2 = document.getElementById("journal-account-2").value;
    const type2 = document.getElementById("journal-type-2").value;
    const amount2 = Number(document.getElementById("journal-amount-2").value || 0);

    if (!date || !detail || !amount1 || !amount2) return;

    state.journalEntries.unshift({
      ...getCreationMetadata(),
      id: createId("as"),
      date,
      detail,
      lines: [
        { account: account1, type: type1, amount: amount1 },
        { account: account2, type: type2, amount: amount2 },
      ],
    });

    event.target.reset();
    document.getElementById("journal-date").valueAsDate = new Date();
    saveState();
    renderAll();
  });

  const clientMovementModal = document.getElementById("client-movement-modal");

  function openClientMovementModal(selectedMovement) {
    if (!clientMovementModal) return;
    const title = document.getElementById("client-movement-title");
    const movementType = document.getElementById("client-movement-type");
    const clientSelect = document.getElementById("client-movement-client");
    const labels = {
      Factura: "Emitir factura",
      "Nota de crédito": "Emitir nota de crédito",
      "Nota de débito": "Emitir débito",
      Cobranza: "Registrar cobranza",
    };

    if (movementType) movementType.value = selectedMovement;
    if (title) title.textContent = labels[selectedMovement] || `Registrar ${selectedMovement.toLowerCase()}`;
    if (clientSelect && !clientSelect.value && state.clients.length) {
      clientSelect.value = state.clients[0].name;
    }

    clientMovementModal.classList.remove("hidden");
    clientMovementModal.setAttribute("aria-hidden", "false");
  }

  function closeClientMovementModal() {
    if (!clientMovementModal) return;
    clientMovementModal.classList.add("hidden");
    clientMovementModal.setAttribute("aria-hidden", "true");
  }

  document.querySelectorAll(".client-action").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".client-action").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const selectedMovement = button.dataset.movement;
      openClientMovementModal(selectedMovement);
    });
  });

  const closeClientMovementButton = document.getElementById("close-client-movement-modal");
  if (closeClientMovementButton) {
    closeClientMovementButton.addEventListener("click", closeClientMovementModal);
  }

  const modalBackdrop = document.querySelector("[data-close-modal='true']");
  if (modalBackdrop) {
    modalBackdrop.addEventListener("click", closeClientMovementModal);
  }

  const updateClientMovementTotals = () => {
    const subtotal = Number(document.getElementById("client-movement-subtotal")?.value || 0);
    const ivaRate = Number(document.getElementById("client-movement-iva-rate")?.value || 0);
    const iva = subtotal * ivaRate / 100;
    const total = subtotal + iva;
    const ivaOutput = document.getElementById("client-movement-iva");
    const totalInput = document.getElementById("client-movement-amount");
    if (ivaOutput) ivaOutput.textContent = formatCurrency(iva);
    if (totalInput) totalInput.value = total.toFixed(2);
  };

  ["input", "change"].forEach((eventName) => {
    document.getElementById("client-movement-subtotal")?.addEventListener(eventName, updateClientMovementTotals);
    document.getElementById("client-movement-iva-rate")?.addEventListener(eventName, updateClientMovementTotals);
  });
  updateClientMovementTotals();

  document.getElementById("client-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("client-name").value.trim();
    const rut = document.getElementById("client-rut").value.trim();
    const contact = document.getElementById("client-contact").value.trim();
    const address = document.getElementById("client-address").value.trim();
    const country = document.getElementById("client-country").value.trim();
    const phone = document.getElementById("client-phone").value.trim();
    const email = document.getElementById("client-email").value.trim();
    const notes = document.getElementById("client-notes").value.trim();

    if (!name || !rut) return;

    state.clients.unshift({
      ...getCreationMetadata(),
      id: createId("cli"),
      name,
      rut,
      contact,
      address,
      country,
      phone,
      email,
      notes,
    });

    event.target.reset();
    saveState();
    renderAll();
  });

  document.getElementById("client-movement-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const clientName = document.getElementById("client-movement-client").value;
    const client = state.clients.find((item) => item.name === clientName);
    const selectedMovement = document.getElementById("client-movement-type").value || "Factura";
    const date = document.getElementById("client-movement-date").value;
    const dueDate = document.getElementById("client-movement-due-date").value;
    const currency = document.getElementById("client-movement-currency").value || "UYU";
    const reference = document.getElementById("client-movement-reference").value.trim();
    const subtotal = Number(document.getElementById("client-movement-subtotal").value || 0);
    const ivaRate = Number(document.getElementById("client-movement-iva-rate").value || 0);
    const amount = subtotal + (subtotal * ivaRate / 100);
    const detail = document.getElementById("client-movement-detail").value.trim();

    if (!client || !date || !dueDate || !reference || !detail || !amount) return;

    const newMovement = createClientMovementRecord({
      clientId: client.id,
      type: selectedMovement,
      date,
      dueDate,
      currency,
      reference,
      subtotal,
      ivaRate,
      amount,
      detail,
    });

    event.target.reset();
    document.getElementById("client-movement-date").valueAsDate = new Date();
    document.getElementById("client-movement-due-date").valueAsDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15);
    document.getElementById("client-movement-type").value = "Factura";
    document.getElementById("client-movement-currency").value = "UYU";
    document.getElementById("client-movement-iva-rate").value = "22";
    updateClientMovementTotals();
    saveState();
    renderAll();
    closeClientMovementModal();
    generateClientVoucherPdf(newMovement);
  });

  document.getElementById("sales-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const clientName = document.getElementById("sales-client").value;
    const client = state.clients.find((item) => item.name === clientName);
    const date = document.getElementById("sales-date").value;
    const concept = document.getElementById("sales-concept").value.trim();
    const amount = Number(document.getElementById("sales-amount").value || 0);
    const iva = Number(document.getElementById("sales-iva").value || 0);

    if (!client || !date || !concept) return;

    const total = amount + iva;
    const sale = {
      ...getCreationMetadata(),
      id: createId("vta"),
      clientId: client.id,
      date,
      concept,
      amount,
      iva,
      total,
    };

    state.sales.unshift(sale);
    const saleMovement = createClientMovementRecord({
      clientId: client.id,
      type: "Factura",
      date,
      dueDate: addDays(date, 15),
      currency: "UYU",
      reference: buildReference("F"),
      subtotal: amount,
      ivaRate: amount > 0 ? (iva / amount) * 100 : 0,
      amount: total,
      detail: concept,
    });

    event.target.reset();
    document.getElementById("sales-date").valueAsDate = new Date();
    saveState();
    renderAll();
    generateClientVoucherPdf(saleMovement);
  });

  document.getElementById("collection-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const clientName = document.getElementById("collection-client").value;
    const client = state.clients.find((item) => item.name === clientName);
    const date = document.getElementById("collection-date").value;
    const method = document.getElementById("collection-method").value;
    const amount = Number(document.getElementById("collection-amount").value || 0);

    if (!client || !date || !amount) return;

    const collection = {
      ...getCreationMetadata(),
      id: createId("cob"),
      clientId: client.id,
      date,
      method,
      amount,
    };

    state.collections.unshift(collection);
    const collectionMovement = createClientMovementRecord({
      clientId: client.id,
      type: "Cobranza",
      date,
      dueDate: date,
      currency: "UYU",
      reference: buildReference("CB"),
      subtotal: amount,
      ivaRate: 0,
      amount,
      detail: `${method} - Cobranza recibida`,
      items: [{ description: `Cobranza - ${method}`, code: buildReference("CB"), unitPrice: amount, total: amount }],
    });

    event.target.reset();
    document.getElementById("collection-date").valueAsDate = new Date();
    saveState();
    renderAll();
    generateClientVoucherPdf(collectionMovement);
  });

  const invoiceForm = document.getElementById("invoice-form");
  const emitBtn = document.getElementById("invoice-emit-btn");
  if (invoiceForm) {
    const invoiceCodeInput = document.getElementById("invoice-product-code");
    const invoiceQtyInput = document.getElementById("invoice-product-quantity");
    const scanBtn = document.getElementById("invoice-scan-btn");
    const invoiceStatus = document.getElementById("invoice-status");
    const invoiceStatusModal = document.getElementById("invoice-status-modal");
    const invoiceVideo = document.getElementById("invoice-video");
    const invoiceCanvas = document.getElementById("invoice-canvas");
    const invoiceScannerModal = document.getElementById("invoice-scanner-modal");
    const invoiceCameraBtn = document.getElementById("invoice-camera-btn");
    const invoiceUsbBtn = document.getElementById("invoice-usb-btn");
    const invoiceManualScanBtn = document.getElementById("invoice-manual-scan-btn");
    const closeInvoiceScannerBtn = document.getElementById("close-invoice-scanner");
    let invoiceScannerStream = null;
    let invoiceScannerReader = null;
    let invoiceScannerActive = false;
    let usbScannerEnabled = false;
    let usbScannerBuffer = "";
    let usbScannerTimer = null;

    function updateInvoiceStatus(message, isError = false, targetStatus = invoiceStatus) {
      if (!targetStatus) return;
      targetStatus.textContent = message;
      targetStatus.style.color = isError ? "#b33b3b" : "#1f9d76";
    }

    function updateScannerStatus(message, isError = false) {
      updateInvoiceStatus(message, isError, invoiceStatus);
      updateInvoiceStatus(message, isError, invoiceStatusModal);
    }

    function openInvoiceScannerModal() {
      if (!invoiceScannerModal) return;
      invoiceScannerModal.classList.remove("hidden");
      invoiceScannerModal.setAttribute("aria-hidden", "false");
    }

    function closeInvoiceScannerModal() {
      stopInvoiceScanner();
      usbScannerEnabled = false;
      if (invoiceScannerModal) {
        invoiceScannerModal.classList.add("hidden");
        invoiceScannerModal.setAttribute("aria-hidden", "true");
      }
    }

    function stopInvoiceScanner() {
      invoiceScannerActive = false;
      if (invoiceScannerReader && typeof invoiceScannerReader.reset === "function") {
        try {
          invoiceScannerReader.reset();
        } catch (error) {
          console.warn("No se pudo resetear el lector ZXing:", error);
        }
      }
      invoiceScannerReader = null;

      if (invoiceScannerStream) {
        invoiceScannerStream.getTracks().forEach((track) => track.stop());
        invoiceScannerStream = null;
      }
      if (invoiceVideo) {
        invoiceVideo.srcObject = null;
      }
      if (invoiceCanvas) {
        invoiceCanvas.style.display = "none";
      }
    }

    function flashScannerValidation(isValid) {
      const preview = document.querySelector(".scanner-preview-wrap");
      if (!preview) return;
      preview.classList.remove("scanner-valid", "scanner-invalid");
      void preview.offsetWidth;
      preview.classList.add(isValid ? "scanner-valid" : "scanner-invalid");
      clearTimeout(flashScannerValidation.timeoutId);
      flashScannerValidation.timeoutId = setTimeout(() => {
        preview.classList.remove("scanner-valid", "scanner-invalid");
      }, 900);
    }

    function validateAndAddInvoiceProduct(rawCode, qtyOverride = null) {
      const cleanCode = String(rawCode || "").trim();
      if (!cleanCode) return false;

      const qty = Number(qtyOverride ?? invoiceQtyInput?.value ?? 1);
      const product = findProductByCode(cleanCode);
      if (!product) {
        flashScannerValidation(false);
        updateScannerStatus(`Código no válido: ${cleanCode}. El artículo no existe en inventario.`, true);
        if (invoiceCodeInput) invoiceCodeInput.value = cleanCode;
        return false;
      }

      const result = addProductToInvoice(cleanCode, qty);
      flashScannerValidation(result.ok);

      if (result.ok) {
        updateScannerStatus(`Validado y agregado: ${product.name} (${product.barcode || product.sku || cleanCode})`, false);
        if (invoiceCodeInput) invoiceCodeInput.value = cleanCode;
        invoiceQtyInput.value = "1";
        setTimeout(() => closeInvoiceScannerModal(), 700);
        return true;
      }

      updateScannerStatus(result.message, true);
      if (invoiceCodeInput) invoiceCodeInput.value = cleanCode;
      return false;
    }

    function handleInvoiceScannedCode(code) {
      if (!code) return;
      validateAndAddInvoiceProduct(code, invoiceQtyInput?.value ?? 1);
    }

    async function startInvoiceScanner() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        updateScannerStatus("La cámara no está disponible en este navegador.", true);
        return;
      }

      try {
        invoiceScannerActive = true;
        updateScannerStatus("Escáner activo. Apunte la cámara al código QR.");

        const mobileVideoConstraints = {
          facingMode: { ideal: "environment" },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        };

        invoiceScannerStream = await navigator.mediaDevices.getUserMedia({
          video: mobileVideoConstraints,
        });
        if (invoiceVideo) {
          invoiceVideo.srcObject = invoiceScannerStream;
          invoiceVideo.setAttribute("playsinline", "true");
          invoiceVideo.setAttribute("webkit-playsinline", "true");
          await invoiceVideo.play();
        }

        if (invoiceCanvas) {
          invoiceCanvas.style.display = "block";
        }

        const detector = "BarcodeDetector" in window ? new window.BarcodeDetector({ formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e"] }) : null;
        if (detector) {
          const tick = async () => {
            if (!invoiceScannerActive || !invoiceVideo || document.hidden) return;
            try {
              const barcodes = await detector.detect(invoiceVideo);
              if (barcodes && barcodes.length) {
                const code = barcodes[0].rawValue;
                if (code) {
                  handleInvoiceScannedCode(code);
                  stopInvoiceScanner();
                  return;
                }
              }
            } catch (error) {
              // Ignorar errores de detección durante el escaneo continuo.
            }
            if (invoiceScannerActive) {
              requestAnimationFrame(tick);
            }
          };
          requestAnimationFrame(tick);
          return;
        }

        if (window.ZXing) {
          const ReaderClass = window.ZXing.BrowserMultiFormatReader || window.ZXing.BrowserBarcodeReader || window.ZXing.BrowserQRCodeReader;
          if (ReaderClass) {
            const codeReader = new ReaderClass();
            invoiceScannerReader = codeReader;

            const formats = [
              window.ZXing.BarcodeFormat.QR_CODE,
              window.ZXing.BarcodeFormat.EAN_13,
              window.ZXing.BarcodeFormat.EAN_8,
              window.ZXing.BarcodeFormat.CODE_128,
              window.ZXing.BarcodeFormat.CODE_39,
              window.ZXing.BarcodeFormat.UPC_A,
              window.ZXing.BarcodeFormat.UPC_E,
            ];

            const hints = new Map();
            if (window.ZXing.DecodeHintType && window.ZXing.DecodeHintType.POSSIBLE_FORMATS) {
              hints.set(window.ZXing.DecodeHintType.POSSIBLE_FORMATS, formats);
            }

            const videoInputDevices = typeof codeReader.getVideoInputDevices === "function" ? await codeReader.getVideoInputDevices() : [];
            const selectedDeviceId = videoInputDevices[0] ? videoInputDevices[0].deviceId : undefined;

            const decodeHandler = (result, error) => {
              if (!invoiceScannerActive) return;
              if (result) {
                const code = typeof result.getText === "function" ? result.getText() : result.text;
                handleInvoiceScannedCode(code);
                stopInvoiceScanner();
                return;
              }

              if (error && !["NotFoundException", "CheckSumException", "FormatException"].includes(error.name)) {
                console.warn("Error del escáner ZXing:", error);
              }
            };

            if (typeof codeReader.decodeFromVideoElement === "function") {
              codeReader.decodeFromVideoElement(invoiceVideo, decodeHandler, hints);
              return;
            }

            if (typeof codeReader.decodeFromVideoDevice === "function") {
              codeReader.decodeFromVideoDevice(selectedDeviceId, invoiceVideo, decodeHandler, hints);
              return;
            }
          }
        }

        updateScannerStatus("La cámara está lista, pero este navegador no soporta detección automática de códigos de barras. Podés ingresar el código manualmente.", false);
      } catch (error) {
        console.error("Error al iniciar el escáner:", error);
        updateScannerStatus("No se pudo acceder a la cámara. Revisá permisos o ingresá el código manualmente.", true);
      }
    }

    function enableUsbScannerListener() {
      usbScannerEnabled = true;
      updateScannerStatus("Escáner USB activo. Esperando lectura del código desde el dispositivo conectado.", false);
    }

    document.addEventListener("keydown", (event) => {
      if (!usbScannerEnabled) return;
      if (event.target && event.target.closest("input, textarea, select")) {
        if (event.target.id === "invoice-product-code") return;
      }

      if (event.key === "Enter") {
        const scannedCode = usbScannerBuffer.trim();
        if (scannedCode) {
          handleInvoiceScannedCode(scannedCode);
        }
        usbScannerBuffer = "";
        return;
      }

      if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
        usbScannerBuffer += event.key;
        clearTimeout(usbScannerTimer);
        usbScannerTimer = setTimeout(() => {
          usbScannerBuffer = "";
        }, 80);
      }
    });

    if (scanBtn) {
      scanBtn.addEventListener("click", async () => {
        openInvoiceScannerModal();
        if (invoiceScannerActive) {
          stopInvoiceScanner();
          updateScannerStatus("Escáner detenido.");
          return;
        }
        await startInvoiceScanner();
      });
    }

    if (invoiceCameraBtn) {
      invoiceCameraBtn.addEventListener("click", async () => {
        if (invoiceScannerActive) {
          stopInvoiceScanner();
          updateScannerStatus("Cámara detenida.");
          return;
        }
        await startInvoiceScanner();
      });
    }

    if (invoiceUsbBtn) {
      invoiceUsbBtn.addEventListener("click", () => {
        enableUsbScannerListener();
      });
    }

    if (invoiceManualScanBtn) {
      invoiceManualScanBtn.addEventListener("click", () => {
        usbScannerEnabled = false;
        closeInvoiceScannerModal();
        if (invoiceCodeInput) {
          invoiceCodeInput.focus();
        }
      });
    }

    if (closeInvoiceScannerBtn) {
      closeInvoiceScannerBtn.addEventListener("click", () => closeInvoiceScannerModal());
    }

    if (invoiceScannerModal) {
      const backdrop = invoiceScannerModal.querySelector(".modal-backdrop");
      if (backdrop) {
        backdrop.addEventListener("click", () => closeInvoiceScannerModal());
      }
    }

    invoiceForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const code = document.getElementById("invoice-product-code").value.trim();
      const qty = Number(document.getElementById("invoice-product-quantity").value || 1);
      const result = validateAndAddInvoiceProduct(code, qty);
      updateInvoiceStatus(result ? "Artículo validado y agregado a la factura." : "No se pudo validar el artículo.", !result);
    });
  }

  if (emitBtn) {
    emitBtn.addEventListener("click", () => {
      if (!invoiceDraft.length) {
        updateInvoiceStatus("No hay productos cargados en la factura.", true);
        return;
      }

      const clientName = document.getElementById("invoice-client").value;
      const client = state.clients.find((item) => item.name === clientName);
      const date = document.getElementById("invoice-date").value;

      if (!client || !date) {
        updateInvoiceStatus("Seleccioná cliente y fecha para emitir la factura.", true);
        return;
      }

      const subtotal = invoiceDraft.reduce((sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0), 0);
      const iva = subtotal * 0.22;
      const total = subtotal + iva;

      const sale = {
        ...getCreationMetadata(),
        id: createId("vta"),
        clientId: client.id,
        date,
        concept: "Factura por venta escaneada",
        amount: subtotal,
        iva,
        total,
      };

      state.sales.unshift(sale);
      const movement = createClientMovementRecord({
        clientId: client.id,
        type: "Factura",
        date,
        dueDate: addDays(date, 15),
        currency: "UYU",
        reference: buildReference("F"),
        subtotal,
        ivaRate: 22,
        amount: total,
        detail: "Factura emitida por productos escaneados",
        items: invoiceDraft.map((item) => ({
          description: item.name,
          code: item.sku || item.barcode,
          unitPrice: Number(item.unitPrice || 0),
          total: Number(item.quantity || 0) * Number(item.unitPrice || 0),
        })),
      });

      invoiceDraft.forEach((item) => {
        const product = getInventoryProduct(item.productId);
        if (!product) return;

        if (Number(product.stock || 0) >= Number(item.quantity || 0)) {
          product.stock = Number(product.stock || 0) - Number(item.quantity || 0);
        }

        createInventoryMovement({
          productId: product.id,
          type: "Venta",
          date,
          quantity: Number(item.quantity || 0),
          unitCost: Number(item.unitPrice || 0),
          reference: buildReference("SAL"),
          detail: `Venta facturada - ${product.name}`,
          source: "Factura",
        });
      });

      invoiceDraft = [];
      renderInvoiceDraft();
      document.getElementById("invoice-product-code").value = "";
      document.getElementById("invoice-product-quantity").value = "1";
      saveState();
      renderAll();
      generateClientVoucherPdf(movement);
      updateInvoiceStatus("Factura emitida correctamente.");
    });
  }

  document.querySelectorAll(".remove-item-btn").forEach((button) => {
    button.addEventListener("click", (event) => {
      const productId = event.currentTarget.dataset.productId;
      invoiceDraft = invoiceDraft.filter((item) => item.productId !== productId);
      renderInvoiceDraft();
    });
  });

  const inventoryForm = document.getElementById("inventory-form");
  const inventoryImportButton = document.getElementById("inventory-import-btn");
  const inventoryImportFile = document.getElementById("inventory-import-file");
  if (inventoryImportButton && inventoryImportFile) {
    inventoryImportButton.addEventListener("click", () => inventoryImportFile.click());
    inventoryImportFile.addEventListener("change", (event) => {
      const [file] = event.target.files;
      if (file) importInventoryFile(file);
      event.target.value = "";
    });
  }

  if (inventoryForm) {
    inventoryForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const name = document.getElementById("inventory-name").value.trim();
      const sku = document.getElementById("inventory-sku").value.trim();
      const barcode = document.getElementById("inventory-barcode").value.trim() || sku;
      const category = document.getElementById("inventory-category").value.trim();
      const stock = Number(document.getElementById("inventory-stock").value || 0);
      const unitCost = Number(document.getElementById("inventory-unit-price").value || 0);
      const location = document.getElementById("inventory-location").value.trim();

      if (!name || !sku || !category) return;

      const product = {
        ...getCreationMetadata(),
        id: createId("inv"),
        sku,
        barcode,
        name,
        category,
        stock,
        unitCost,
        averageCost: unitCost,
        location,
      };

      state.inventory.unshift(product);

      if (stock > 0 && unitCost > 0) {
        createInventoryMovement({
          productId: product.id,
          type: "Entrada",
          date: new Date().toISOString().slice(0, 10),
          quantity: stock,
          unitCost,
          reference: `INI-${product.sku}`,
          detail: "Stock inicial del producto",
          source: "Alta de producto",
        });
      }

      event.target.reset();
      saveState();
      renderAll();
    });

    const agendaForm = document.getElementById("calendar-agenda-form");
    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-calendar-date]");
      if (button) {
        selectedCalendarDate = button.dataset.calendarDate;
        const quickForm = document.getElementById("calendar-quick-form");
        const selectedDate = document.getElementById("calendar-selected-date");
        if (selectedDate) selectedDate.textContent = `Fecha seleccionada: ${selectedCalendarDate}`;
        if (quickForm) quickForm.classList.remove("hidden");
        document.getElementById("calendar-quick-title")?.focus();
      }
    });

    const quickCalendarForm = document.getElementById("calendar-quick-form");
    if (quickCalendarForm) {
      quickCalendarForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const type = document.getElementById("calendar-quick-type").value;
        const title = document.getElementById("calendar-quick-title").value.trim();
        if (!selectedCalendarDate || !title) return;

        if (type === "event") {
          state.calendarAgenda.push({ ...getCreationMetadata(), id: createId("evt"), date: selectedCalendarDate, title, type: "Agenda", detail: "" });
        } else if (type === "alert") {
          state.calendarNotes.push({ ...getCreationMetadata(), id: createId("note"), date: selectedCalendarDate, text: title });
        } else {
          state.calendarTasks.push({ ...getCreationMetadata(), id: createId("task"), title, dueDate: selectedCalendarDate, done: false });
        }

        event.target.reset();
        document.getElementById("calendar-quick-form").classList.add("hidden");
        saveState();
        renderAll();
      });
    }

    if (agendaForm) {
      agendaForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = document.getElementById("agenda-title").value.trim();
        const date = document.getElementById("agenda-date").value;
        const detail = document.getElementById("agenda-detail").value.trim();
        if (!title || !date) return;
        state.calendarAgenda.push({ ...getCreationMetadata(), id: createId("evt"), date, title, type: "Agenda", detail });
        event.target.reset();
        document.getElementById("agenda-date").value = getUruguayDateString();
        saveState();
        renderAll();
      });
    }

    const notesForm = document.getElementById("calendar-notes-form");
    if (notesForm) {
      notesForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const date = document.getElementById("notes-date").value;
        const text = document.getElementById("notes-text").value.trim();
        if (!date || !text) return;
        state.calendarNotes.push({ ...getCreationMetadata(), id: createId("note"), date, text });
        event.target.reset();
        document.getElementById("notes-date").value = getUruguayDateString();
        saveState();
        renderAll();
      });
    }

    const tasksForm = document.getElementById("calendar-tasks-form");
    if (tasksForm) {
      tasksForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const title = document.getElementById("tasks-title").value.trim();
        const dueDate = document.getElementById("tasks-duedate").value;
        if (!title || !dueDate) return;
        state.calendarTasks.push({ ...getCreationMetadata(), id: createId("task"), title, dueDate, done: false });
        event.target.reset();
        document.getElementById("tasks-duedate").value = getUruguayDateString();
        saveState();
        renderAll();
      });
    }
  }

  const inventoryMovementForm = document.getElementById("inventory-movement-form");
  if (inventoryMovementForm) {
    inventoryMovementForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const productId = document.getElementById("inventory-movement-product").value;
      const type = document.getElementById("inventory-movement-type").value;
      const quantity = Number(document.getElementById("inventory-movement-quantity").value || 0);
      const unitCost = Number(document.getElementById("inventory-movement-unit-cost").value || 0);
      const date = document.getElementById("inventory-movement-date").value;
      const reference = document.getElementById("inventory-movement-reference").value.trim();
      const detail = document.getElementById("inventory-movement-detail").value.trim();

      if (!productId || !date || !quantity || quantity <= 0) return;

      const product = getInventoryProduct(productId);
      if (!product) return;

      createInventoryMovement({
        productId,
        type,
        date,
        quantity,
        unitCost: type === "Salida" || type === "Venta" ? getInventoryAverageCost(productId) || unitCost : unitCost || getInventoryAverageCost(productId),
        reference: reference || `${type.slice(0, 3).toUpperCase()}-${Date.now().toString().slice(-6)}`,
        detail: detail || `${type} de ${product.name}`,
        source: type === "Venta" ? "Costo de venta" : "Movimiento de stock",
      });

      event.target.reset();
      document.getElementById("inventory-movement-date").valueAsDate = new Date();
      document.getElementById("inventory-movement-unit-cost").value = getInventoryAverageCost(productId) || 0;
      saveState();
      renderAll();
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./service-worker.js").catch((error) => console.warn("No se pudo registrar la aplicación instalable.", error));
  }
  initializeAuthentication();
  initializeTheme();
  document.getElementById("purchase-date").valueAsDate = new Date();
  document.getElementById("payment-date").valueAsDate = new Date();
  document.getElementById("journal-date").valueAsDate = new Date();
  document.getElementById("sales-date").valueAsDate = new Date();
  document.getElementById("collection-date").valueAsDate = new Date();
  document.getElementById("client-movement-date").valueAsDate = new Date();
  document.getElementById("client-movement-due-date").valueAsDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15);
  const inventoryMovementDate = document.getElementById("inventory-movement-date");
  if (inventoryMovementDate) inventoryMovementDate.valueAsDate = new Date();

  const invoiceDate = document.getElementById("invoice-date");
  if (invoiceDate) invoiceDate.valueAsDate = new Date();

  const reportsPeriod = document.getElementById("reports-period");
  if (reportsPeriod) reportsPeriod.value = "custom";

  const reportsCompare = document.getElementById("reports-compare");
  if (reportsCompare) reportsCompare.value = "previous-month";

  const currentDate = getUruguayDateString();
  const reportsStartDate = document.getElementById("reports-start-date");
  const reportsEndDate = document.getElementById("reports-end-date");
  const reportsYear = document.getElementById("reports-year");
  if (reportsStartDate) reportsStartDate.value = `${getUruguayDateParts().year}-01-01`;
  if (reportsEndDate) reportsEndDate.value = currentDate;
  if (reportsYear) reportsYear.value = String(getUruguayDateParts().year);

  ["agenda-date", "notes-date", "tasks-duedate"].forEach((id) => {
    const dateInput = document.getElementById(id);
    if (dateInput) dateInput.value = getUruguayDateString();
  });

  const reportsPdfBtn = document.getElementById("reports-pdf-btn");
  if (reportsPdfBtn) reportsPdfBtn.addEventListener("click", exportAccountingReportPdf);
  const reportsExcelBtn = document.getElementById("reports-excel-btn");
  if (reportsExcelBtn) reportsExcelBtn.addEventListener("click", exportAccountingReportExcel);

  ["reports-period", "reports-compare", "reports-start-date", "reports-end-date", "reports-year", "reports-account-filter"].forEach((id) => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener("change", renderAccountingReports);
    }
  });

  attachEvents();
  renderAll();
  window.setInterval(() => {
    renderPaymentCalendar();
    renderCalendarDashboard();
  }, 60000);
});
