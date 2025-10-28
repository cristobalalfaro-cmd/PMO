// =======================================
// Dashboard Gestión de Proyectos
// =======================================

// --- Configuración global ---
let ALL_DATA = [];
let FILTERED_DATA = [];
let PENDING_CHANGES = [];

// Solicitud de clave al ingresar
document.addEventListener("DOMContentLoaded", async () => {
  if (!sessionStorage.getItem("auth_ok")) {
    const pwd = prompt("🔐 Ingresa la clave de acceso:");
    if (pwd !== "Tomi.2016") {
      alert("Clave incorrecta. Acceso denegado.");
      window.location.href = "https://google.com";
      return;
    }
    sessionStorage.setItem("auth_ok", "1");
  }

  await loadData();
  setupFilters();
  renderDashboard();

  document.querySelector("#btn-refresh")?.addEventListener("click", loadData);
  document.querySelector("#btn-save")?.addEventListener("click", saveChanges);
});

// --- Cargar datos desde el CSV de Google Sheets ---
async function loadData() {
  try {
    const res = await fetch(DASHBOARD_CONFIG.csvUrl);
    const text = await res.text();
    const rows = Papa.parse(text, { header: true }).data;

    ALL_DATA = rows.filter(r => r.ID && r.Tipo); // limpia filas vacías
    applyFilters();

    alert("✅ Datos actualizados correctamente.");
  } catch (err) {
    console.error("Error cargando datos:", err);
    alert("❌ No se pudieron cargar los datos desde Google Sheets.");
  }
}

// --- Aplicar filtros ---
function setupFilters() {
  const filterIds = ["tipo-filter", "cliente-filter", "proyecto-filter", "owner-filter", "estatus-filter"];
  filterIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("change", applyFilters);
  });
  document.querySelector("#clear-filters")?.addEventListener("click", clearFilters);
}

function clearFilters() {
  document.querySelectorAll("select").forEach(s => s.value = "Todos");
  applyFilters();
}

function applyFilters() {
  const tipo = document.getElementById("tipo-filter")?.value || "Todos";
  const cliente = document.getElementById("cliente-filter")?.value || "Todos";
  const proyecto = document.getElementById("proyecto-filter")?.value || "Todos";
  const estatus = document.getElementById("estatus-filter")?.value || "Todos";
  const owner = document.getElementById("owner-filter")?.value || "Todos";

  FILTERED_DATA = ALL_DATA.filter(r => {
    return (tipo === "Todos" || r.Tipo === tipo) &&
           (cliente === "Todos" || r.Cliente === cliente) &&
           (proyecto === "Todos" || r.Proyecto === proyecto) &&
           (estatus === "Todos" || r.Estatus === estatus) &&
           (owner === "Todos" || r.Owner === owner);
  });

  renderDashboard();
}

// --- Render principal del dashboard ---
function renderDashboard() {
  renderResumen();
  renderEstatus();
  renderReporte();
}

// --- Resumen Ejecutivo ---
function renderResumen() {
  const totalProyectos = ALL_DATA.filter(r => r.Tipo === "Proyecto").length;
  const totalPropuestas = ALL_DATA.filter(r => r.Tipo === "Propuesta").length;
  const totalAtrasadas = ALL_DATA.filter(r => !isFinalizado(r) && isAtrasada(r)).length;
  const totalIniciadas = ALL_DATA.filter(r => r.Estatus === "Iniciado").length;
  const atrasadasFinalizadas = ALL_DATA.filter(r => isAtrasada(r) && r.Estatus === "Finalizado").length;

  const ratio = ALL_DATA.length > 0
    ? ((ALL_DATA.filter(r => r.Estatus === "Finalizado").length / ALL_DATA.length) * 100).toFixed(1)
    : 0;

  document.getElementById("resumen-container").innerHTML = `
    <ul>
      <li>Total Tareas Proyectos: <b>${totalProyectos}</b></li>
      <li>Total Tareas Propuestas: <b>${totalPropuestas}</b></li>
      <li>Tareas Atrasadas: <b>${totalAtrasadas}</b></li>
      <li>Tareas Iniciadas: <b>${totalIniciadas}</b></li>
      <li>Tareas Atrasadas Finalizadas: <b>${atrasadasFinalizadas}</b></li>
      <li>Ratio Cumplimiento (Finalizadas / Totales): <b>${ratio}%</b></li>
    </ul>`;
}

function isFinalizado(r) {
  return (r.Estatus || "").toLowerCase() === "finalizado";
}

function isAtrasada(r) {
  if (!r.Deadline) return false;
  const fecha = new Date(r.Deadline);
  const hoy = new Date();
  return fecha < hoy && !isFinalizado(r);
}

// --- Apertura por Estatus ---
function renderEstatus() {
  const cont = document.getElementById("estatus-container");
  if (!cont) return;

  const atrasados = FILTERED_DATA.filter(r => isAtrasada(r));
  const proximos = FILTERED_DATA.filter(r => daysToDeadline(r) <= 21 && daysToDeadline(r) >= 0);
  const futuros = FILTERED_DATA.filter(r => daysToDeadline(r) > 21);

  cont.innerHTML = `
    <div class="estatus-group"><h4>Atrasados (${atrasados.length})</h4>${renderTable(atrasados)}</div>
    <div class="estatus-group"><h4>Próximos vencimientos (≤21 días) (${proximos.length})</h4>${renderTable(proximos)}</div>
    <div class="estatus-group"><h4>Programadas +3 semanas (${futuros.length})</h4>${renderTable(futuros)}</div>`;
}

function daysToDeadline(r) {
  if (!r.Deadline) return 999;
  const fecha = new Date(r.Deadline);
  const hoy = new Date();
  return Math.floor((fecha - hoy) / (1000 * 60 * 60 * 24));
}

function renderTable(list) {
  if (list.length === 0) return "<p>Sin tareas en esta categoría.</p>";
  return `
    <table class="tabla-estatus">
      <thead>
        <tr><th>Cliente</th><th>Proyecto</th><th>Tareas</th><th>Deadline</th><th>Owner</th><th>Estatus</th></tr>
      </thead>
      <tbody>
        ${list.map(r => `
          <tr>
            <td>${r.Cliente}</td>
            <td>${r.Proyecto}</td>
            <td>${r.Tareas}</td>
            <td>${r.Deadline}</td>
            <td>${r.Owner}</td>
            <td>
              <select data-id="${r.ID}" onchange="markChange(this)">
                ${["No iniciado","Iniciado","On Hold","Finalizado"].map(opt =>
                  `<option ${opt === r.Estatus ? "selected" : ""}>${opt}</option>`
                ).join("")}
              </select>
            </td>
          </tr>`).join("")}
      </tbody>
    </table>`;
}

function markChange(sel) {
  const id = sel.dataset.id;
  const newStatus = sel.value;
  const existing = PENDING_CHANGES.find(c => c.id === id);
  if (existing) existing.newStatus = newStatus;
  else PENDING_CHANGES.push({ id, newStatus });
}

// --- Guardar cambios en Google Sheets ---
async function saveChanges() {
  try {
    if (!PENDING_CHANGES || PENDING_CHANGES.length === 0) {
      alert("No hay cambios pendientes para guardar.");
      return;
    }

    const btn = document.querySelector("#btn-save");
    if (btn) {
      btn.disabled = true;
      btn.textContent = "Guardando...";
    }

    const res = await fetch(DASHBOARD_CONFIG.gsUpdateUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain" }, // evita preflight
      body: JSON.stringify({ changes: PENDING_CHANGES })
    });

    const txt = await res.text();
    let out;
    try {
      out = JSON.parse(txt);
    } catch (e) {
      out = { ok: false, error: "Respuesta no JSON" };
    }

    if (out.ok) {
      alert(`✅ Cambios guardados correctamente (${out.updated} filas actualizadas).`);
      PENDING_CHANGES = [];
      await loadData(); // recarga los datos actualizados
    } else {
      alert(`⚠️ Error al guardar: ${out.error || "Error desconocido"}`);
    }
  } catch (err) {
    console.error("Error al guardar cambios:", err);
    alert("❌ Error de red al guardar cambios.");
  } finally {
    const btn = document.querySelector("#btn-save");
    if (btn) {
      btn.disabled = false;
      btn.textContent = "Guardar cambios";
    }
  }
}

// --- Reporte gráfico (torta de estatus) ---
function renderReporte() {
  const ctx = document.getElementById("chart-estatus")?.getContext("2d");
  if (!ctx) return;
  const counts = { "No iniciado":0, "Iniciado":0, "On Hold":0, "Finalizado":0 };
  FILTERED_DATA.forEach(r => { if (r.Estatus) counts[r.Estatus]++; });

  if (window.statusChart) window.statusChart.destroy();
  window.statusChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: Object.keys(counts),
      datasets: [{
        data: Object.values(counts),
        backgroundColor: ["#ff4d4d","#ffc107","#17a2b8","#28a745"]
      }]
    },
    options: {
      plugins: {
        legend: { labels: { color: "#fff" } },
        tooltip: {
          callbacks: {
            label: (context) => {
              const total = context.chart._metasets[0].total;
              const pct = ((context.parsed / total) * 100).toFixed(1);
              return `${context.label}: ${pct}%`;
            }
          }
        }
      }
    }
  });
}
