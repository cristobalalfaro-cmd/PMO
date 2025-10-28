// Apps Script Web App (Deploy > New deployment > Web app; access: Anyone with the link)
// Actualiza la columna 'Estatus' buscando por ID único.

const CFG = {
  SHEET_ID: 'REEMPLAZA_CON_TU_SHEET_ID', // opcional si el script está ligado
  SHEET_NAME: 'Proyectos',
  COL_ID: 'ID',
  COL_ESTATUS: 'Estatus',
  API_KEY: '' // opcional
};

function doPost(e){
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    if (!payload || !payload.changes || !Array.isArray(payload.changes)) {
      return json({ ok:false, error:"Payload inválido" });
    }

    const ss = CFG.SHEET_ID ? SpreadsheetApp.openById(CFG.SHEET_ID) : SpreadsheetApp.getActive();
    const sh = ss.getSheetByName(CFG.SHEET_NAME);
    if (!sh) return json({ ok:false, error:"Hoja no encontrada" });

    const rng = sh.getDataRange();
    const data = rng.getValues();
    const header = data.shift(); // primera fila
    const idx = colIndexMap(header);

    const idCol = idx(CFG.COL_ID);
    const estCol = idx(CFG.COL_ESTATUS);
    if (idCol == null || estCol == null) return json({ ok:false, error:"Columnas ID/Estatus no encontradas" });

    const idToRow = new Map(); // ID -> row number (1-based within sheet)
    for (let r = 0; r < data.length; r++){
      const id = String(data[r][idCol]||'').trim();
      if (id) idToRow.set(id, r + 2); // +2 por header
    }

    let updated = 0;
    for (const ch of payload.changes) {
      const id = String(ch.id || '').trim();
      const newStatus = ch.newStatus;
      if (!id || !newStatus) continue;
      const rowNum = idToRow.get(id);
      if (!rowNum) continue;
      sh.getRange(rowNum, estCol + 1, 1, 1).setValue(newStatus);
      updated++;
    }

    return json({ ok:true, updated });
  } catch (err) {
    return json({ ok:false, error: String(err) });
  }
}

function json(obj){
  const out = ContentService.createTextOutput(JSON.stringify(obj));
  return out.setMimeType(ContentService.MimeType.JSON);
}
function colIndexMap(header){ const m={}; header.forEach((h,i)=>m[h]=i); return name=>m[name]; }