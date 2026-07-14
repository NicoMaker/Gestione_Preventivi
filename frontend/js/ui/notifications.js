// ==================== UI: NOTIFICHE TOAST ====================
// File: js/ui/notifications.js
// Scopo: notifica toast nell'angolo dello schermo.
// Nota: consolidata dalla versione attiva nell'originale (quella di ui.js,
//       che nell'ordine di caricamento sovrascriveva quella di realtime.js).

function showNotification(message, type = "info", duration = 5000) {
  const container = document.getElementById("notificationContainer");
  if (!container) return;

  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.innerHTML = message;

  container.appendChild(notification);

  setTimeout(() => notification.classList.add("show"), 10);
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, duration);
}

// Esposizione globale
window.showNotification = showNotification;
