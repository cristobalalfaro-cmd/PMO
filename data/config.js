window.DASHBOARD_CONFIG = {
  csvUrl: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQCLX_7PvU7qhaYZ14_nRcVhsTciJDiq1ibWxJbZ6Bq5FjAz3-Lc0JJX7bqeLcdDVRX5phGY6_xQ5_C/pub?gid=980611467&single=true&output=csv",
  gsUpdateUrl: "https://script.google.com/macros/s/AKfycbzeN0ESKLAetxQJHWnZwo-CEOi-CboGCmE_MOQo9nys-C3Z8NY2Mh4WxHX_iYLdGh326A/exec", // Apps Script Web App URL (POST)
  columns: {
    id: "ID",
    tipo: "Tipo",
    cliente: "Cliente",
    proyecto: "Proyecto",
    tareas: "Tareas",
    deadline: "Deadline",
    estatus: "Estatus",
    owner: "Owner",
    email: "Email"
  },
  estatusOptions: ["No iniciado","Iniciado","On Hold","Finalizado"]
};
