// ==================== SOCKET.IO REAL-TIME ====================
// File: js/realtime.js
// Scopo: SOLO gestione della connessione Socket.IO e degli eventi real-time.
//        Le notifiche/dialog sono in js/ui/ (notifications.js, dialogs.js).
// Dipende da: ui/dialogs.js (forceLogout usa showAlertModal), i vari load*()

let socket = null;
let ignoreNextUpdate = false;

// Ignora il prossimo aggiornamento socket (usato dopo un'azione locale
// per evitare un doppio refresh).
function ignoreNextSocketUpdate(duration = 2000) {
  ignoreNextUpdate = true;
  setTimeout(() => {
    ignoreNextUpdate = false;
  }, duration);
}

// Esegue un load* solo se non stiamo ignorando gli update e la funzione esiste
function refreshIf(nomeFn) {
  if (!ignoreNextUpdate && typeof window[nomeFn] === "function") {
    window[nomeFn]();
  }
}

function initSocket() {
  const socketUrl = window.location.origin;

  socket = io(socketUrl, {
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionAttempts: 5,
  });

  socket.on("connect", () => {
    console.log("✅ Connesso al server real-time");
    // Registra l'utente per il force-logout mirato
    const utenteId = localStorage.getItem("utenteId");
    if (utenteId) socket.emit("register_user", utenteId);
  });
  socket.on("disconnect", () =>
    console.log("❌ Disconnesso dal server real-time"),
  );
  socket.on("connect_error", (error) =>
    console.error("Errore connessione Socket.IO:", error),
  );

  // ── Marche ──
  socket.on("marca_aggiunta", () => refreshIf("loadMarche"));
  socket.on("marca_modificata", () => {
    refreshIf("loadMarche");
    refreshIf("loadProdotti");
  });
  socket.on("marca_eliminata", () => {
    refreshIf("loadMarche");
    refreshIf("loadProdotti");
  });
  socket.on("marche_aggiornate", () => refreshIf("loadMarche"));

  // ── Modelli ──
  socket.on("modello_aggiunto", () => refreshIf("loadModelli"));
  socket.on("modello_modificato", () => refreshIf("loadModelli"));
  socket.on("modello_eliminato", () => refreshIf("loadModelli"));
  socket.on("modelli_aggiornati", () => refreshIf("loadModelli"));

  // ── Preventivi (ex ordini) ──
  socket.on("ordine_aggiunto", () => refreshIf("loadOrdini"));
  socket.on("ordine_modificato", () => refreshIf("loadOrdini"));
  socket.on("ordine_eliminato", () => refreshIf("loadOrdini"));
  socket.on("ordini_aggiornati", () => refreshIf("loadOrdini"));
  socket.on("dati_aggiornati", () => refreshIf("loadOrdini"));

  // ── Clienti ──
  socket.on("cliente_aggiunto", () => refreshIf("loadClienti"));
  socket.on("cliente_modificato", () => refreshIf("loadClienti"));
  socket.on("cliente_eliminato", () => refreshIf("loadClienti"));
  socket.on("clienti_aggiornati", () => refreshIf("loadClienti"));

  // ── Utenti (con force-logout se riguarda l'utente loggato) ──
  socket.on("utente_modificato", (data) => {
    const currentUsername = localStorage.getItem("nomeUtente");
    if (data.oldNome && currentUsername === data.oldNome) {
      forceLogout(
        "Il tuo account è stato modificato. Effettua di nuovo il login.",
      );
      return;
    }
    refreshIf("loadUtenti");
  });

  socket.on("utente_eliminato", (data) => {
    const currentUsername = localStorage.getItem("nomeUtente");
    if (data.nomeUtente && currentUsername === data.nomeUtente) {
      forceLogout("Il tuo account è stato eliminato.");
      return;
    }
    refreshIf("loadUtenti");
  });

  socket.on("utente_aggiunto", () => refreshIf("loadUtenti"));
  socket.on("utenti_aggiornati", () => refreshIf("loadUtenti"));

  // Force-logout mirato dal server (stanza user:<id>)
  socket.on("forceLogout", (data) => {
    forceLogout(
      (data && data.reason === "account_deleted")
        ? "Il tuo account è stato eliminato."
        : "Il tuo account è stato modificato. Effettua di nuovo il login.",
    );
  });
}

// Logout forzato: mostra un alert e reindirizza al login
function forceLogout(message) {
  showAlertModal(
    message || "Sei stato disconnesso.",
    "Sessione Terminata",
    "warning",
  );
  setTimeout(() => {
    localStorage.removeItem("nomeUtente");
    localStorage.removeItem("utenteId");
    localStorage.removeItem("activeSection");
    window.location.href = "index.html";
  }, 2000);
}

// Auto-inizializzazione al DOM pronto
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSocket);
} else {
  initSocket();
}

// Esposizione globale
window.ignoreNextSocketUpdate = ignoreNextSocketUpdate;
window.forceLogout = forceLogout;
