// ==================== INIZIALIZZAZIONE APP ====================
// File: js/app.js
// Dipende da: config.js, ui.js, clienti.js, preventivi.js, marche.js, modelli.js, utenti.js, stampa.js

document.addEventListener("DOMContentLoaded", () => {
  // ---- Auth guard ----
  const nomeUtente = localStorage.getItem("nomeUtente");
  if (!nomeUtente) {
    window.location.href = "index.html";
    return;
  }
  document.getElementById("currentUser").textContent = nomeUtente;

  // ---- Mobile menu ----
  const mobileMenuToggle = document.getElementById("mobileMenuToggle");
  const sidebar = document.getElementById("sidebar");

  if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("mobile-open");
      mobileMenuToggle.classList.toggle("active");
    });

    document.addEventListener("click", (e) => {
      if (
        window.innerWidth <= 768 &&
        !sidebar.contains(e.target) &&
        !mobileMenuToggle.contains(e.target)
      ) {
        sidebar.classList.remove("mobile-open");
        mobileMenuToggle.classList.remove("active");
      }
    });
  }

  // ---- Navigazione sezioni ----
  document.querySelectorAll(".nav-item[data-section]").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const section = item.dataset.section;

      document
        .querySelectorAll(".nav-item")
        .forEach((i) => i.classList.remove("active"));
      document
        .querySelectorAll(".content-section")
        .forEach((s) => s.classList.remove("active"));

      item.classList.add("active");
      document.getElementById(`section-${section}`).classList.add("active");
      localStorage.setItem("activeSection", section);

      if (window.innerWidth <= 768) {
        sidebar.classList.remove("mobile-open");
        mobileMenuToggle?.classList.remove("active");
      }

      // Carica dati della sezione attivata
      const loaders = {
        clienti: loadClienti,
        ordini: loadOrdini,
        marche: loadMarche,
        modelli: loadModelli,
        utenti: loadUtenti,
      };
      loaders[section]?.();
    });
  });

  // Ripristina la sezione salvata
  const savedSection = localStorage.getItem("activeSection") || "clienti";
  const targetNav = document.querySelector(
    `.nav-item[data-section="${savedSection}"]`,
  );
  if (targetNav) {
    targetNav.click();
  } else {
    document.querySelector('.nav-item[data-section="clienti"]')?.click();
  }

  // ---- Logout ----
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("nomeUtente");
    localStorage.removeItem("utenteId");
    localStorage.removeItem("activeSection");
    window.location.href = "index.html";
  });

  // ---- Toggle password nel modal Utenti ----
  const togglePassword = document.getElementById("toggleUtentePassword");
  const passwordInput = document.getElementById("utentePassword");

  if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
      if (passwordInput.type === "password") {
        passwordInput.type = "text";
        togglePassword.innerHTML = `
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.08 2.58" />
          <line x1="1" y1="1" x2="23" y2="23" />
        `;
        togglePassword.style.color = "#6366f1";
      } else {
        passwordInput.type = "password";
        togglePassword.innerHTML = `
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
          <circle cx="12" cy="12" r="3" />
        `;
        togglePassword.style.color = "#64748b";
      }
    });
  }

  // ---- Ricarica preventivi se era la sezione salvata ----
  if (savedSection === "ordini") {
    setTimeout(() => loadOrdini(), 500);
  }
});
