// Apps Script - PMO notifications (Lun/Mié/Vie 08:00 America/Santiago)
const CONFIG = {
  SPREADSHEET_ID: 'REEMPLAZA_CON_TU_SHEET_ID',
  SHEET_NAME: 'Proyectos',
  TIMEZONE: 'America/Santiago',
};

function sendPmoEmails() {
  const ss = CONFIG.SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : SpreadsheetApp.getActive();
  const sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  const values = sh.getDataRange().getDisplayValues();
  const header = values.shift();
  const idx = colIndexMap(header);

  const byProject = {};
  for (const row of values) {
    const proyecto = row[idx('Proyecto')] || '';
    if (!proyecto) continue;
    (byProject[proyecto] ||= []).push({
      Tareas: row[idx('Tareas')],
      Deadline: row[idx('Deadline')],
      Estatus: row[idx('Estatus')],
      Owner: row[idx('Owner')],
      Email: row[idx('Email')],
    });
  }

  for (const [proyecto, items] of Object.entries(byProject)) {
    const recipients = [...new Set(items.map(i => i.Email).filter(Boolean))].join(',');
    if (!recipients) continue;

    const html = buildHtml(proyecto, items);
    const subject = `PMO Proyecto ${proyecto}`;
    GmailApp.sendEmail(recipients, subject, 'HTML only', {htmlBody: html});
  }
}

function buildHtml(proyecto, items) {
  const rows = items.map(i => `
    <tr>
      <td>${esc(i.Tareas)}</td>
      <td>${esc(i.Deadline)}</td>
      <td>${esc(i.Owner)}</td>
      <td>${esc(i.Estatus)}</td>
    </tr>`).join('');
  return `
  <div style="font-family:Arial,Helvetica,sans-serif">
    <h2 style="margin:0 0 8px">PMO Proyecto ${esc(proyecto)}</h2>
    <table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse">
      <thead><tr><th>Tarea</th><th>Deadline</th><th>Owner</th><th>Estatus</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </div>`;
}

function esc(s){ return String(s||'').replace(/[<>&]/g, c => ({'<':'&lt;','>':'&gt;','&':'&amp;'}[c])); }
function colIndexMap(header){ const m={}; header.forEach((h,i)=>m[h]=i); return name=>m[name]; }

function createScheduleTrigger() {
  for (const t of ScriptApp.getProjectTriggers()) ScriptApp.deleteTrigger(t);
  ScriptApp.newTrigger('sendPmoEmails').timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(8).nearMinute(0).create();
  ScriptApp.newTrigger('sendPmoEmails').timeBased()
    .onWeekDay(ScriptApp.WeekDay.WEDNESDAY).atHour(8).nearMinute(0).create();
  ScriptApp.newTrigger('sendPmoEmails').timeBased()
    .onWeekDay(ScriptApp.WeekDay.FRIDAY).atHour(8).nearMinute(0).create();
}