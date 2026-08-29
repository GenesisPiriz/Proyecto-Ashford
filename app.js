const STORAGE_KEY = "ashford-accounting-v1";
const accountCatalog = [
  "Caja",
  "Bancos",
  "Cuenta Corriente Proveedores",
  "Cuenta Corriente Clientes",
  "Mercaderías",
  "Compras",
  "Ventas",
  "IVA Crédito",
  "IVA Débito",
  "Capital",
  "Servicios",
  "Gastos de Administración",
  "Impuestos",
];

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function getDefaultState() {
  return {
    suppliers: [
      { id: "prov-1", name: "Distribuidora del Este", cuit: "21456789012", contact: "Lucía García" },
      { id: "prov-2", name: "Bodega Sur", cuit: "21567890123", contact: "Javier Moreno" },
      { id: "prov-3", name: "Fábrica Única", cuit: "21678901234", contact: "Ana López" },
    ],
    purchases: [
      { id: "cmp-1", proveedorId: "prov-1", date: "2026-08-05", concept: "Mercaderías de venta", amount: 16000, iva: 3040, total: 19040 },
      { id: "cmp-2", proveedorId: "prov-2", date: "2026-08-12", concept: "Productos de limpieza", amount: 8500, iva: 1615, total: 10115 },
    ],
    payments: [
      { id: "pay-1", proveedorId: "prov-1", date: "2026-08-18", method: "Banco", amount: 9000 },
    ],
    supplierMovements: [
      { id: "mov-1", supplierId: "prov-1", type: "Factura", date: "2026-08-05", reference: "F-001", amount: 19040, detail: "Mercaderías de venta" },
      { id: "mov-2", supplierId: "prov-1", type: "Pago", date: "2026-08-18", reference: "P-010", amount: 9000, detail: "Transferencia bancaria" },
      { id: "mov-3", supplierId: "prov-2", type: "Factura", date: "2026-08-12", reference: "F-002", amount: 10115, detail: "Productos de limpieza" },
      { id: "mov-4", supplierId: "prov-3", type: "Débito", date: "2026-08-15", reference: "D-003", amount: 3500, detail: "Ajuste por intereses" },
    ],
    journalEntries: [
      {
        id: "as-1",
        date: "2026-08-10",
        detail: "Ajuste de caja",
        lines: [
          { account: "Caja", type: "Debe", amount: 12000 },
          { account: "Capital", type: "Haber", amount: 12000 },
        ],
      },
    ],
    clients: [
      { id: "cli-1", name: "Juan Pérez SRL", rut: "1234567-8", contact: "Juan Pérez" },
      { id: "cli-2", name: "Empresa Tech SA", rut: "2345678-9", contact: "Carlos López" },
      { id: "cli-3", name: "Comercial Central", rut: "3456789-0", contact: "Marisa García" },
    ],
    sales: [
      { id: "vta-1", clientId: "cli-1", date: "2026-08-06", concept: "Venta de productos", amount: 12000, iva: 2640, total: 14640 },
      { id: "vta-2", clientId: "cli-2", date: "2026-08-14", concept: "Servicios de consultoría", amount: 8000, iva: 1760, total: 9760 },
    ],
    collections: [
      { id: "cob-1", clientId: "cli-1", date: "2026-08-20", method: "Banco", amount: 7000 },
    ],
    clientMovements: [
      { id: "mov-c1", clientId: "cli-1", type: "Factura", date: "2026-08-06", dueDate: "2026-09-05", reference: "F-101", amount: 14640, currency: "UYU", detail: "Venta de productos", subtotal: 12000, ivaRate: 22 },
      { id: "mov-c2", clientId: "cli-1", type: "Cobranza", date: "2026-08-20", dueDate: "2026-08-20", reference: "CB-001", amount: 7000, currency: "UYU", detail: "Transferencia bancaria", subtotal: 7000, ivaRate: 0 },
      { id: "mov-c3", clientId: "cli-2", type: "Factura", date: "2026-08-14", dueDate: "2026-09-14", reference: "F-102", amount: 9760, currency: "UYU", detail: "Servicios de consultoría", subtotal: 8000, ivaRate: 22 },
    ],
  };
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    return getDefaultState();
  }

  try {
    const parsed = JSON.parse(saved);
    return { ...getDefaultState(), ...parsed };
  } catch (error) {
    console.warn("Fallo al leer el almacenamiento local. Se recupera estado por defecto.", error);
    return getDefaultState();
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

let state = loadState();

function formatCurrency(value) {
  return new Intl.NumberFormat("es-UY", { style: "currency", currency: "UYU" }).format(Number(value || 0));
}

function getSupplierName(supplierId) {
  const supplier = state.suppliers.find((item) => item.id === supplierId);
  return supplier ? supplier.name : "Proveedor no encontrado";
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

    return {
      ...supplier,
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

  function addLine(account, type, amount) {
    if (!rows.has(account)) {
      rows.set(account, { account, Debe: 0, Haber: 0 });
    }

    const row = rows.get(account);
    if (type === "Debe") {
      row.Debe += Number(amount || 0);
    } else {
      row.Haber += Number(amount || 0);
    }
  }

  state.purchases.forEach((purchase) => {
    addLine("Compras", "Debe", purchase.amount);
    addLine("IVA Crédito", "Debe", purchase.iva);
    addLine("Cuenta Corriente Proveedores", "Haber", purchase.total);
  });

  state.payments.forEach((payment) => {
    addLine("Cuenta Corriente Proveedores", "Debe", payment.amount);
    addLine(payment.method === "Efectivo" ? "Caja" : "Bancos", "Haber", payment.amount);
  });

  state.journalEntries.forEach((entry) => {
    entry.lines.forEach((line) => {
      addLine(line.account, line.type, line.amount);
    });
  });

  return Array.from(rows.values()).map((row) => ({
    ...row,
    saldo: row.Debe - row.Haber,
  }));
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

    return {
      ...client,
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

  function addLine(account, type, amount) {
    if (!rows.has(account)) {
      rows.set(account, { account, Debe: 0, Haber: 0 });
    }

    const row = rows.get(account);
    if (type === "Debe") {
      row.Debe += Number(amount || 0);
    } else {
      row.Haber += Number(amount || 0);
    }
  }

  state.sales.forEach((sale) => {
    addLine("Cuenta Corriente Clientes", "Debe", sale.total);
    addLine("Ventas", "Haber", sale.amount);
    addLine("IVA Débito", "Haber", sale.iva);
  });

  state.collections.forEach((collection) => {
    addLine(collection.method === "Efectivo" ? "Caja" : "Bancos", "Debe", collection.amount);
    addLine("Cuenta Corriente Clientes", "Haber", collection.amount);
  });

  return Array.from(rows.values()).map((row) => ({
    ...row,
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

  document.getElementById("stats-compras").textContent = formatCurrency(totalCompras);
  document.getElementById("stats-saldo").textContent = formatCurrency(saldoProveedores);
  document.getElementById("stats-pagos").textContent = formatCurrency(totalPagos);
  document.getElementById("stats-asientos").textContent = String(state.journalEntries.length);

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

  const base = values.length ? values : [
    { date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10), label: "Distribuidora del Este", amount: 9000 },
    { date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString().slice(0, 10), label: "Bodega Sur", amount: 6000 },
    { date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 18).toISOString().slice(0, 10), label: "Fábrica Única", amount: 4500 },
  ];

  const dates = base.slice(0, 4);
  const monthLabel = new Date(dates[0].date).toLocaleString("es-UY", { month: "long", year: "numeric" });
  const dayCells = Array.from({ length: 7 }, (_, index) => {
    const day = index + 1;
    const isActive = dates.some((entry) => new Date(entry.date).getDate() === day);
    return `<span class="calendar-day ${isActive ? "active" : ""}">${day}</span>`;
  }).join("");

  calendar.innerHTML = `
    <div class="calendar-header">${monthLabel}</div>
    <div class="calendar-grid">${dayCells}</div>
  `;

  dueList.innerHTML = dates
    .map(
      (entry) => `
        <li>
          <span>${entry.date}</span>
          <strong>${entry.label}</strong>
          <small>${formatCurrency(entry.amount)}</small>
        </li>
      `,
    )
    .join("");
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
        </tr>
      `,
    )
    .join("");
}

function renderSupplierTable() {
  const body = document.getElementById("supplier-table-body");
  const balances = getSupplierBalances();

  body.innerHTML = balances
    .map((supplier) => {
      const statusClass = supplier.saldo > 0 ? "warn" : "ok";
      const statusText = supplier.saldo > 0 ? "Adeuda" : "Al día";
      return `
        <tr>
          <td>${supplier.name}</td>
          <td>${supplier.cuit}</td>
          <td>${supplier.contact || "-"}</td>
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
  const balances = getSupplierBalances();

  body.innerHTML = balances
    .map((supplier) => {
      const status = supplier.saldo > 0 ? "warn" : "ok";
      const label = supplier.saldo > 0 ? "En deuda" : "Sin deuda";
      return `
        <tr>
          <td>${supplier.name}</td>
          <td class="amount">${formatCurrency(supplier.compras)}</td>
          <td class="amount">${formatCurrency(supplier.pagos)}</td>
          <td class="amount">${formatCurrency(supplier.saldo)}</td>
          <td><span class="status ${status}">${label}</span></td>
        </tr>
      `;
    })
    .join("");
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
          <td>${row.account}</td>
          <td class="amount">${formatCurrency(row.Debe)}</td>
          <td class="amount">${formatCurrency(row.Haber)}</td>
          <td class="amount">${formatCurrency(row.saldo)}</td>
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
          <td>${entry.lines.map((line) => `${line.account} ${line.type}`).join(" / ")}</td>
          <td class="amount">${formatCurrency(entry.lines.reduce((sum, line) => sum + Number(line.amount || 0), 0))}</td>
        </tr>
      `,
    )
    .join("");
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
        </tr>
      `,
    )
    .join("");
}

function renderClientTable() {
  const body = document.getElementById("client-table-body");
  const balances = getClientBalances();

  body.innerHTML = balances
    .map((client) => {
      const statusClass = client.saldo > 0 ? "warn" : "ok";
      const statusText = client.saldo > 0 ? "Adeuda" : "Al día";
      return `
        <tr>
          <td>${client.name}</td>
          <td>${client.rut}</td>
          <td>${client.contact || "-"}</td>
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
  const balances = getClientBalances();

  body.innerHTML = balances
    .map((client) => {
      const status = client.saldo > 0 ? "warn" : "ok";
      const label = client.saldo > 0 ? "Debe" : "Al día";
      return `
        <tr>
          <td>${client.name}</td>
          <td class="amount">${formatCurrency(client.facturas)}</td>
          <td class="amount">${formatCurrency(client.notasCredito)}</td>
          <td class="amount">${formatCurrency(client.debitos)}</td>
          <td class="amount">${formatCurrency(client.cobranzas)}</td>
          <td class="amount">${formatCurrency(client.saldo)}</td>
          <td><span class="status ${status}">${label}</span></td>
        </tr>
      `;
    })
    .join("");
}

function renderClientCurrentAccounts() {
  const body = document.getElementById("client-current-account-body");
  const balances = getClientBalances();

  body.innerHTML = balances
    .map((client) => {
      const status = client.saldo > 0 ? "warn" : "ok";
      const label = client.saldo > 0 ? "En deuda" : "Saldo cero";
      return `
        <tr>
          <td>${client.name}</td>
          <td class="amount">${formatCurrency(client.ventas)}</td>
          <td class="amount">${formatCurrency(client.cobranzas)}</td>
          <td class="amount">${formatCurrency(client.saldo)}</td>
          <td><span class="status ${status}">${label}</span></td>
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
        </tr>
      `,
    )
    .join("");
}

function renderClientVoucherDetailsTable() {
  const body = document.getElementById("client-voucher-details-body");
  if (!body) return;

  body.innerHTML = state.clientMovements
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
          <td>${row.account}</td>
          <td class="amount">${formatCurrency(row.Debe)}</td>
          <td class="amount">${formatCurrency(row.Haber)}</td>
          <td class="amount">${formatCurrency(row.saldo)}</td>
        </tr>
      `,
    )
    .join("");
}

function getClientName(clientId) {
  const client = state.clients.find((item) => item.id === clientId);
  return client ? client.name : "Cliente no encontrado";
}

function renderSelectors() {
  const supplierOptions = state.suppliers.map((supplier) => supplier.name);
  populateSelector("purchase-supplier", supplierOptions);
  populateSelector("payment-supplier", supplierOptions);
  populateSelector("movement-supplier", supplierOptions);
  populateSelector("journal-account-1", accountCatalog);
  populateSelector("journal-account-2", accountCatalog);

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

  const journalAccount1 = document.getElementById("journal-account-1");
  const journalAccount2 = document.getElementById("journal-account-2");
  if (journalAccount1.options.length) journalAccount1.value = "Caja";
  if (journalAccount2.options.length) journalAccount2.value = "Capital";

  const clientOptions = state.clients.map((client) => client.name);
  populateSelector("sales-client", clientOptions);
  populateSelector("collection-client", clientOptions);
  populateSelector("client-movement-client", clientOptions);

  const salesClient = document.getElementById("sales-client");
  const collectionClient = document.getElementById("collection-client");
  const clientMovementClient = document.getElementById("client-movement-client");
  if (state.clients.length && salesClient.options.length) {
    salesClient.value = state.clients[0].name;
  }
  if (state.clients.length && collectionClient.options.length) {
    collectionClient.value = state.clients[0].name;
  }
  if (state.clients.length && clientMovementClient.options.length) {
    clientMovementClient.value = state.clients[0].name;
  }
}

function renderVoucherDetailsTable() {
  const body = document.getElementById("voucher-details-body");
  if (!body) return;

  body.innerHTML = state.supplierMovements
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
        </tr>
      `;
    })
    .join("");
}

function renderAll() {
  renderSelectors();
  renderStats();
  renderHomeActivity();
  renderPaymentCalendar();
  renderPurchaseTable();
  renderSupplierTable();
  renderCurrentAccounts();
  renderProviderAccountTable();
  renderVoucherDetailsTable();
  renderPaymentTable();
  renderLedgerTable();
  renderJournalTable();
  renderSalesTable();
  renderClientTable();
  renderClientAccountTable();
  renderClientCurrentAccounts();
  renderCollectionTable();
  renderClientVoucherDetailsTable();
  renderClientLedgerTable();
}

function attachEvents() {
  document.querySelectorAll(".sidebar-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".sidebar-btn").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const homeScreen = document.getElementById("home-screen");
      const processScreen = document.getElementById("process-screen");
      const clientsScreen = document.getElementById("clients-screen");
      const view = button.dataset.view;

      homeScreen.classList.toggle("active", view === "home");
      processScreen.classList.toggle("active", view === "process");
      clientsScreen.classList.toggle("active", view === "clients");
    });
  });

  document.querySelectorAll(".secondary-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const targetView = button.dataset.view;
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

  document.querySelectorAll(".nav-btn").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((item) => item.classList.remove("active"));
      document.querySelectorAll(".panel").forEach((item) => item.classList.remove("active"));

      button.classList.add("active");
      const target = document.getElementById(button.dataset.target);
      if (target) target.classList.add("active");
    });
  });

  document.querySelectorAll(".provider-action").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".provider-action").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const selectedMovement = button.dataset.movement;
      const title = document.getElementById("movement-title");
      if (title) title.textContent = `Registrar ${selectedMovement.toLowerCase()}`;
    });
  });

  document.getElementById("supplier-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("supplier-name").value.trim();
    const cuit = document.getElementById("supplier-cuit").value.trim();
    const contact = document.getElementById("supplier-contact").value.trim();

    if (!name || !cuit) return;

    state.suppliers.unshift({
      id: createId("prov"),
      name,
      cuit,
      contact,
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
    const amount = Number(document.getElementById("movement-amount").value || 0);
    const detail = document.getElementById("movement-detail").value.trim();

    if (!supplier || !date || !dueDate || !reference || !detail || !amount) return;

    state.supplierMovements.unshift({
      id: createId("mov"),
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
    saveState();
    renderAll();
  });

  document.getElementById("purchase-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const supplierName = document.getElementById("purchase-supplier").value;
    const supplier = state.suppliers.find((item) => item.name === supplierName);
    const date = document.getElementById("purchase-date").value;
    const concept = document.getElementById("purchase-concept").value.trim();
    const amount = Number(document.getElementById("purchase-amount").value || 0);
    const iva = Number(document.getElementById("purchase-iva").value || 0);

    if (!supplier || !date || !concept) return;

    state.purchases.unshift({
      id: createId("cmp"),
      proveedorId: supplier.id,
      date,
      concept,
      amount,
      iva,
      total: amount + iva,
    });

    event.target.reset();
    document.getElementById("purchase-date").valueAsDate = new Date();
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

    state.payments.unshift({
      id: createId("pay"),
      proveedorId: supplier.id,
      date,
      method,
      amount,
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

  document.querySelectorAll(".client-action").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll(".client-action").forEach((item) => item.classList.remove("active"));
      button.classList.add("active");

      const selectedMovement = button.dataset.movement;
      const title = document.getElementById("client-movement-title");
      if (title) title.textContent = `${selectedMovement === "Cobranza" ? "Registrar cobranza" : "Registrar " + selectedMovement.toLowerCase()}`;
    });
  });

  document.getElementById("client-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("client-name").value.trim();
    const rut = document.getElementById("client-rut").value.trim();
    const contact = document.getElementById("client-contact").value.trim();

    if (!name || !rut) return;

    state.clients.unshift({
      id: createId("cli"),
      name,
      rut,
      contact,
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
    const amount = Number(document.getElementById("client-movement-amount").value || 0);
    const detail = document.getElementById("client-movement-detail").value.trim();

    if (!client || !date || !dueDate || !reference || !detail || !amount) return;

    state.clientMovements.unshift({
      id: createId("mov-c"),
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
    saveState();
    renderAll();
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

    state.sales.unshift({
      id: createId("vta"),
      clientId: client.id,
      date,
      concept,
      amount,
      iva,
      total: amount + iva,
    });

    event.target.reset();
    document.getElementById("sales-date").valueAsDate = new Date();
    saveState();
    renderAll();
  });

  document.getElementById("collection-form").addEventListener("submit", (event) => {
    event.preventDefault();

    const clientName = document.getElementById("collection-client").value;
    const client = state.clients.find((item) => item.name === clientName);
    const date = document.getElementById("collection-date").value;
    const method = document.getElementById("collection-method").value;
    const amount = Number(document.getElementById("collection-amount").value || 0);

    if (!client || !date || !amount) return;

    state.collections.unshift({
      id: createId("cob"),
      clientId: client.id,
      date,
      method,
      amount,
    });

    event.target.reset();
    document.getElementById("collection-date").valueAsDate = new Date();
    saveState();
    renderAll();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("purchase-date").valueAsDate = new Date();
  document.getElementById("payment-date").valueAsDate = new Date();
  document.getElementById("journal-date").valueAsDate = new Date();
  document.getElementById("sales-date").valueAsDate = new Date();
  document.getElementById("collection-date").valueAsDate = new Date();
  document.getElementById("client-movement-date").valueAsDate = new Date();
  document.getElementById("client-movement-due-date").valueAsDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 15);

  attachEvents();
  renderAll();
});
