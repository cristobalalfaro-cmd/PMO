
# Dashboard · Gestión de Proyectos (con ID único + compartir enlaces)

Incluye:
- Tema oscuro gris/azulado; inputs de filtros en blanco.
- Filtros: Tipo, Cliente, Proyecto, Estatus, Owner.
- Resumen ejecutivo con casilla **Incluir finalizados**.
- **Apertura por estatus** (Atrasados, Próximos ≤21d, +3 semanas) con **edición de Estatus** (select) y botón **Guardar cambios**.
- **Actualiza Estatus por ID único** (columna `ID`).
- Botón **Actualizar** (refresca CSV desde Google Sheets).
- **Copiar enlace**: genera URL con `?cliente=&proyecto=&share=1&email=...`.
- **Clave de acceso**: `Tomi.2016` (modal).
- Scripts de **Apps Script**:
  - Web App para actualizar Estatus por `ID`.
  - Emails L/M/V 08:00 (America/Santiago).

## Configuración
- `data/config.js`:
  - `csvUrl`: tu CSV publicado (ya cargado).
  - `gsUpdateUrl`: pega la URL del **Web App** (Apps Script) para guardar cambios.
  - `columns.id`: **"ID"** (columna justo antes de Tipo, como pediste).

## Web App (Apps Script) para guardar cambios
- Abre el Google Sheet → Extensiones → Apps Script.
- Pega `scripts/apps_script_webapp_api.gs`.
- Ajusta `SHEET_ID` si el script no está ligado al mismo sheet y confirma `SHEET_NAME`.
- Deploy → New deployment → Web App:
  - Execute as: **Me**, Access: **Anyone with the link**.
- Pega la URL en `gsUpdateUrl` (config.js).
- El front enviará `{ changes: [ { id, oldStatus, newStatus } ] }`.

> Recomendación: mantener `ID` único y estable.

## Emails automáticos (L/M/V 08:00)
- Agrega `scripts/apps_script_pmo_emails.gs` al mismo proyecto.
- Ajusta `SPREADSHEET_ID` y Zona horaria del proyecto a **America/Santiago**.
- Ejecuta `createScheduleTrigger()`.

## Compartir sin clave (autorizado por email)
- URL base + `?cliente=<Cliente>&proyecto=<Proyecto>&share=1&email=<correo>`
- Solo concede acceso si `<correo>` aparece en **Email** para ese `Cliente/Proyecto`.

## Desarrollo / Publicación
- VS Code + Live Server para probar.
- GitHub Pages para publicar el sitio estático.
