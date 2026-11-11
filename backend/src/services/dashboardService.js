// Service dashboard: trasforma i dati aggregati in KPI, grafico e "cose da fare"
const repo = require("../repositories/dashboardRepository");

const GIORNI_PREVENTIVO_APERTO = 30;
const ESEMPI_MAX = 5;

const NOMI_MESI = [
  "Gen", "Feb", "Mar", "Apr", "Mag", "Giu",
  "Lug", "Ago", "Set", "Ott", "Nov", "Dic",
];

// Ultimi n mesi (compreso quello corrente) come [{ chiave: "2026-03", etichetta: "Mar" }]
function ultimiMesi(n) {
  const oggi = new Date();
  const mesi = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(oggi.getUTCFullYear(), oggi.getUTCMonth() - i, 1));
    const chiave = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    mesi.push({ chiave, etichetta: NOMI_MESI[d.getUTCMonth()] });
  }
  return mesi;
}

const esempi = (righe) => righe.slice(0, ESEMPI_MAX).map((r) => r.nome);

module.exports = {
  async panoramica() {
    const mesi = ultimiMesi(6);
    const [
      kpi, scaduti, prossimi, aperti, senzaRecapiti, senzaPreventivi,
      marcheVuote, modelliVuoti, andamento, top, ultimi,
    ] = await Promise.all([
      repo.conteggi(),
      repo.ricontattiScaduti(),
      repo.ricontattiProssimi(),
      repo.preventiviAperti(GIORNI_PREVENTIVO_APERTO),
      repo.clientiSenzaRecapiti(),
      repo.clientiSenzaPreventivi(),
      repo.marcheInutilizzate(),
      repo.modelliInutilizzati(),
      repo.andamentoMensile(`${mesi[0].chiave}-01`),
      repo.topMarche(5),
      repo.ultimiPreventivi(6),
    ]);

    // ── Cose da fare, ordinate per urgenza ──
    const azioni = [];
    const aggiungi = (righe, def) => {
      if (righe.length)
        azioni.push({ ...def, conteggio: righe.length, esempi: esempi(righe) });
    };
    aggiungi(scaduti, {
      codice: "ricontatti_scaduti",
      gravita: "alta",
      titolo: "Clienti da ricontattare subito",
      descrizione: "La data di ricontatto è oggi o già passata e non sono stati ricontattati.",
      sezione: "clienti",
      azione: "Apri i clienti",
    });
    aggiungi(prossimi, {
      codice: "ricontatti_settimana",
      gravita: "media",
      titolo: "Ricontatti in arrivo questa settimana",
      descrizione: "Hanno la data di ricontatto nei prossimi 7 giorni.",
      sezione: "clienti",
      azione: "Apri i clienti",
    });
    aggiungi(aperti, {
      codice: "preventivi_aperti",
      gravita: "media",
      titolo: `Preventivi non conclusi da oltre ${GIORNI_PREVENTIVO_APERTO} giorni`,
      descrizione: "Contratto ancora aperto: sollecita il cliente o chiudi la pratica.",
      sezione: "ordini",
      azione: "Apri i preventivi",
    });
    aggiungi(senzaRecapiti, {
      codice: "senza_recapiti",
      gravita: "media",
      titolo: "Clienti senza telefono né email",
      descrizione: "Non puoi ricontattarli: aggiungi almeno un recapito.",
      sezione: "clienti",
      azione: "Apri i clienti",
    });
    aggiungi(senzaPreventivi, {
      codice: "senza_preventivi",
      gravita: "info",
      titolo: "Clienti senza preventivi",
      descrizione: "Crea un preventivo oppure, se non servono, eliminali.",
      sezione: "clienti",
      azione: "Apri i clienti",
    });
    aggiungi(marcheVuote, {
      codice: "marche_inutilizzate",
      gravita: "info",
      titolo: "Marche mai usate",
      descrizione: "Nessun modello né preventivo collegato: puoi eliminarle.",
      sezione: "marche",
      azione: "Apri le marche",
    });
    aggiungi(modelliVuoti, {
      codice: "modelli_inutilizzati",
      gravita: "info",
      titolo: "Modelli mai usati",
      descrizione: "Nessun preventivo collegato: puoi eliminarli.",
      sezione: "modelli",
      azione: "Apri i modelli",
    });

    // ── Andamento ultimi 6 mesi ──
    const mappa = new Map(andamento.map((r) => [r.mese, r]));
    const serie = mesi.map(({ chiave, etichetta }) => ({
      mese: chiave,
      etichetta,
      creati: mappa.get(chiave)?.creati || 0,
      conclusi: mappa.get(chiave)?.conclusi || 0,
    }));

    return {
      generato_il: new Date().toISOString(),
      kpi: {
        ...kpi,
        tasso_conclusione: kpi.preventivi
          ? Math.round((kpi.preventivi_conclusi / kpi.preventivi) * 100)
          : 0,
      },
      azioni,
      andamento: serie,
      top_marche: top,
      ultimi_preventivi: ultimi,
    };
  },
};
