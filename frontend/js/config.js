// ==================== CONFIGURAZIONE E STATO GLOBALE ====================
// File: js/config.js

const API_URL = "/api";

// ==================== DOWNLOAD DATABASE ====================
function downloadDatabase(event) {
  event.preventDefault();

  const downloadUrl = "/api/admin/download-db";

  const link = document.createElement("a");
  link.href = downloadUrl;
  link.style.display = "none";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  if (typeof showNotification === "function") {
    showNotification("📥 Download database avviato...", "info");
  }
}

// ==================== STATO GLOBALE ====================
let clienti = [];
let ordini = [];
let marche = [];
let modelli = [];
let utenti = [];

// Array sorgente (tutti i record non filtrati)
let allClienti = [];
let allOrdini = [];
let allMarche = [];
let allModelli = [];

/**
 * Formatta un numero di telefono per la visualizzazione.
 * Condivisa tra clienti, preventivi, stampa e company-loader.
 */
function formatPhoneNumber(phone) {
  if (!phone || phone === "-") return phone;

  let cleaned = phone.replace(/\s+/g, "");

  if (cleaned.startsWith("+39")) {
    return cleaned.replace(/(\+39)(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  } else if (cleaned.startsWith("+")) {
    return cleaned.replace(/(\+\d{1,3})(\d{3})(\d{3})(\d{4})/, "$1 $2 $3 $4");
  } else if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1 $2 $3");
  } else if (cleaned.length > 6) {
    return cleaned.replace(/(\d{3})(?=\d)/g, "$1 ");
  }

  return phone;
}

/**
 * Formatta una data ISO in formato italiano (DD/MM/YYYY).
 */
function formatDate(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleDateString("it-IT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Converte una data ISO in formato YYYY-MM-DD per gli input type="date".
 */
function formatDateForInput(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
