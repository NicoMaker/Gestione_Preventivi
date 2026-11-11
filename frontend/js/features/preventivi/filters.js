// ==================== PREVENTIVI: FILTRI ====================
// File: js/crud/preventivi/filters.js
// Scopo: salvataggio/ripristino filtri in localStorage, applicazione filtri,
//        e listener sui controlli di ricerca.
// Stato condiviso: ordini, allOrdini (config.js)

function saveOrdiniFilter() {
  localStorage.setItem(
    "filter_ordini_search",
    document.getElementById("filterOrdini")?.value || "",
  );
  localStorage.setItem(
    "filter_ordini_data_passaggio",
    document.getElementById("filterOrdiniDataPassaggio")?.value || "",
  );
  localStorage.setItem(
    "filter_ordini_data_preventivo",
    document.getElementById("filterOrdiniDataPreventivo")?.value || "",
  );
  localStorage.setItem(
    "filter_ordini_ricontattato",
    document.getElementById("filterOrdiniRicontattato")?.value || "tutti",
  );
  localStorage.setItem(
    "filter_ordini_contratto",
    document.getElementById("filterOrdiniContratto")?.value || "tutti",
  );
}

function restoreOrdiniFilter() {
  const savedSearch = localStorage.getItem("filter_ordini_search") || "";
  const savedDataPassaggio =
    localStorage.getItem("filter_ordini_data_passaggio") || "";
  const savedDataPreventivo =
    localStorage.getItem("filter_ordini_data_preventivo") || "";
  const savedRicontattato =
    localStorage.getItem("filter_ordini_ricontattato") || "tutti";
  const savedContratto =
    localStorage.getItem("filter_ordini_contratto") || "tutti";

  const si = document.getElementById("filterOrdini");
  const sp = document.getElementById("filterOrdiniDataPassaggio");
  const sd = document.getElementById("filterOrdiniDataPreventivo");
  const sr = document.getElementById("filterOrdiniRicontattato");
  const sc = document.getElementById("filterOrdiniContratto");

  if (si) si.value = savedSearch;
  if (sp) sp.value = savedDataPassaggio;
  if (sd) sd.value = savedDataPreventivo;
  if (sr) sr.value = savedRicontattato;
  if (sc) sc.value = savedContratto;

  applyOrdiniFilter(
    savedSearch.toLowerCase(),
    savedDataPassaggio,
    savedDataPreventivo,
    savedRicontattato,
    savedContratto,
  );
}

function applyOrdiniFilter(
  searchTerm = "",
  dataPassaggio = "",
  dataPreventivo = "",
  ricontattoVal = "tutti",
  contrattoVal = "tutti",
) {
  ordini = allOrdini.filter((o) => {
    const matchText =
      !searchTerm ||
      o.cliente_nome.toLowerCase().includes(searchTerm) ||
      (o.cliente_tel && o.cliente_tel.toLowerCase().includes(searchTerm)) ||
      (o.cliente_email && o.cliente_email.toLowerCase().includes(searchTerm)) ||
      (o.marca_nome && o.marca_nome.toLowerCase().includes(searchTerm)) ||
      (o.modello_nome && o.modello_nome.toLowerCase().includes(searchTerm)) ||
      (o.note && o.note.toLowerCase().includes(searchTerm)) ||
      (o.cliente_note && o.cliente_note.toLowerCase().includes(searchTerm));

    const matchDataPassaggio =
      !dataPassaggio ||
      (o.cliente_data_passaggio && o.cliente_data_passaggio === dataPassaggio);

    const matchDataPreventivo =
      !dataPreventivo ||
      (o.data_movimento && o.data_movimento.startsWith(dataPreventivo));

    const matchRicontattato =
      ricontattoVal === "tutti" ||
      (ricontattoVal === "si" && o.cliente_flag_ricontatto == 1) ||
      (ricontattoVal === "no" && !o.cliente_flag_ricontatto);

    const matchContratto =
      contrattoVal === "tutti" ||
      (contrattoVal === "si" && o.contratto_finito == 1) ||
      (contrattoVal === "no" && !o.contratto_finito);

    return (
      matchText &&
      matchDataPassaggio &&
      matchDataPreventivo &&
      matchRicontattato &&
      matchContratto
    );
  });
  renderOrdini();
}

function getOrdiniFilterValues() {
  return {
    searchTerm:
      document.getElementById("filterOrdini")?.value.toLowerCase() || "",
    dataPassaggio:
      document.getElementById("filterOrdiniDataPassaggio")?.value || "",
    dataPreventivo:
      document.getElementById("filterOrdiniDataPreventivo")?.value || "",
    ricontattoVal:
      document.getElementById("filterOrdiniRicontattato")?.value || "tutti",
    contrattoVal:
      document.getElementById("filterOrdiniContratto")?.value || "tutti",
  };
}

// Applica filtro corrente + salva (handler condiviso dai controlli)
function onOrdiniFilterChange() {
  const v = getOrdiniFilterValues();
  saveOrdiniFilter();
  applyOrdiniFilter(
    v.searchTerm,
    v.dataPassaggio,
    v.dataPreventivo,
    v.ricontattoVal,
    v.contrattoVal,
  );
}

document
  .getElementById("filterOrdini")
  ?.addEventListener("input", onOrdiniFilterChange);
document
  .getElementById("filterOrdiniDataPassaggio")
  ?.addEventListener("change", onOrdiniFilterChange);
document
  .getElementById("filterOrdiniDataPreventivo")
  ?.addEventListener("change", onOrdiniFilterChange);
document
  .getElementById("filterOrdiniRicontattato")
  ?.addEventListener("change", onOrdiniFilterChange);
document
  .getElementById("filterOrdiniContratto")
  ?.addEventListener("change", onOrdiniFilterChange);

window.restoreOrdiniFilter = restoreOrdiniFilter;
window.applyOrdiniFilter = applyOrdiniFilter;
