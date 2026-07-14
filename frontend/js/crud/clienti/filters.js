// ==================== CLIENTI: FILTRI ====================
// File: js/crud/clienti/filters.js
// Scopo: salvataggio/ripristino/applicazione/reset filtri clienti.
// Stato condiviso: clienti, allClienti (config.js)

function saveClientiFilters() {
  localStorage.setItem(
    "filter_clienti_search",
    document.getElementById("filterClienti")?.value || "",
  );
  localStorage.setItem(
    "filter_clienti_data",
    document.getElementById("filterDataPassaggio")?.value || "",
  );
  localStorage.setItem(
    "filter_clienti_ricontattato",
    document.getElementById("filterClientiRicontattato")?.value || "tutti",
  );
}

function restoreClientiFilters() {
  const savedSearch = localStorage.getItem("filter_clienti_search") || "";
  const savedData = localStorage.getItem("filter_clienti_data") || "";
  const savedRicontattato =
    localStorage.getItem("filter_clienti_ricontattato") || "tutti";

  const searchInput = document.getElementById("filterClienti");
  const dataInput = document.getElementById("filterDataPassaggio");
  const ricontattoSelect = document.getElementById("filterClientiRicontattato");

  if (searchInput) searchInput.value = savedSearch;
  if (dataInput) dataInput.value = savedData;
  if (ricontattoSelect) ricontattoSelect.value = savedRicontattato;

  applyClientiFilters();
}

function applyClientiFilters() {
  const searchTerm =
    document.getElementById("filterClienti")?.value.toLowerCase() || "";
  const dataPassaggio =
    document.getElementById("filterDataPassaggio")?.value || "";
  const ricontattoVal =
    document.getElementById("filterClientiRicontattato")?.value || "tutti";

  clienti = allClienti.filter((c) => {
    const matchesText =
      !searchTerm ||
      c.nome.toLowerCase().includes(searchTerm) ||
      (c.num_tel && c.num_tel.toLowerCase().includes(searchTerm)) ||
      (c.email && c.email.toLowerCase().includes(searchTerm)) ||
      (c.data_passaggio && c.data_passaggio.includes(searchTerm)) ||
      (c.note && c.note.toLowerCase().includes(searchTerm));

    const matchesData =
      !dataPassaggio ||
      (c.data_passaggio && c.data_passaggio.startsWith(dataPassaggio));

    const matchesRicontattato =
      ricontattoVal === "tutti" ||
      (ricontattoVal === "si" && c.flag_ricontatto == 1) ||
      (ricontattoVal === "no" && !c.flag_ricontatto);

    return matchesText && matchesData && matchesRicontattato;
  });

  renderClienti();
}

document.getElementById("filterClienti")?.addEventListener("input", () => {
  saveClientiFilters();
  applyClientiFilters();
});
document.getElementById("filterDataPassaggio")?.addEventListener("change", () => {
  saveClientiFilters();
  applyClientiFilters();
});
document
  .getElementById("filterClientiRicontattato")
  ?.addEventListener("change", () => {
    saveClientiFilters();
    applyClientiFilters();
  });

function resetClientiFilters() {
  document.getElementById("filterDataPassaggio").value = "";
  document.getElementById("filterClientiRicontattato").value = "tutti";
  localStorage.removeItem("filter_clienti_data");
  localStorage.removeItem("filter_clienti_ricontattato");
  applyClientiFilters();
}

window.restoreClientiFilters = restoreClientiFilters;
window.applyClientiFilters = applyClientiFilters;
window.resetClientiFilters = resetClientiFilters;
