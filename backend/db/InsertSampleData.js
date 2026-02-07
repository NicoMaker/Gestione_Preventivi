const { db, initDatabase } = require("./init");
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");
const readline = require("readline");

// Configurazione da readline
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Funzione per chiedere input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Funzione helper per promisificare db.run con supporto batch
function runQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.run(query, params, function (err) {
      if (err) reject(err);
      else resolve(this);
    });
  });
}

// Funzione per batch insert (più veloce per grandi volumi)
async function batchInsert(query, dataArray, batchSize = 500) {
  const batches = [];
  for (let i = 0; i < dataArray.length; i += batchSize) {
    batches.push(dataArray.slice(i, i + batchSize));
  }

  let completed = 0;
  for (const batch of batches) {
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run("BEGIN TRANSACTION");
        for (const params of batch) {
          db.run(query, params, (err) => {
            if (err) reject(err);
          });
        }
        db.run("COMMIT", (err) => {
          if (err) reject(err);
          else {
            completed += batch.length;
            process.stdout.write(
              `\r  Progress: ${completed}/${dataArray.length}`,
            );
            resolve();
          }
        });
      });
    });
  }
  console.log(); // Newline dopo progress
}

// Funzione helper per promisificare db.get
function getQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.get(query, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Funzione helper per promisificare db.all
function getAllQuery(query, params = []) {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

// Funzioni di utilità random
const randomElement = (array) =>
  array[Math.floor(Math.random() * array.length)];

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

function randomDate(daysBack) {
  const today = new Date();
  const randomDays = Math.floor(Math.random() * daysBack);
  const date = new Date(today);
  date.setDate(date.getDate() - randomDays);
  return date.toISOString().split("T")[0];
}

/**
 * Genera una data casuale tra una data di inizio e oggi.
 * @param {string} startDateString - La data di inizio in formato 'YYYY-MM-DD'.
 * @returns {string} Una data in formato 'YYYY-MM-DD'.
 */
function randomDateFrom(startDateString) {
  const startDate = new Date(startDateString);
  const today = new Date();

  // Imposta l'orario a mezzanotte per evitare problemi di fuso orario
  startDate.setUTCHours(0, 0, 0, 0);
  today.setUTCHours(0, 0, 0, 0);

  const diffTime = Math.abs(today - startDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return randomDate(diffDays);
}

// Genera nome utente univoco
function generateUsername(index, baseNames) {
  if (index < baseNames.length) {
    return baseNames[index];
  }
  return `User${index + 1}`;
}

// Genera nome marca univoco
function generateMarcaName(index, baseMarche) {
  if (index < baseMarche.length) {
    return baseMarche[index];
  }
  const suffissi = [
    "Motors",
    "Automotive",
    "Racing",
    "Moto",
    "Bikes",
    "Group",
    "Industries",
    "International",
  ];
  const prefissi = [
    "Alpha",
    "Beta",
    "Omega",
    "Prime",
    "Elite",
    "Pro",
    "Max",
    "Ultra",
  ];
  return `${randomElement(prefissi)} ${randomElement(suffissi)} ${Math.floor(
    index / 100,
  )}`;
}

// Genera nome modello univoco
function generateModelloName(index, marcaNome, baseModelli) {
  if (index < baseModelli.length) {
    return baseModelli[index];
  }
  const suffissi = [
    "GT",
    "Sport",
    "Touring",
    "Custom",
    "Classic",
    "R",
    "S",
    "X",
  ];
  const numeri = randomInt(100, 999);
  return `${marcaNome} ${randomElement(suffissi)} ${numeri}`;
}

// Genera nome cliente univoco
function generateClienteName(index, baseNomi, baseCognomi) {
  if (index < baseNomi.length) {
    return `${baseNomi[index]} ${baseCognomi[index % baseCognomi.length]}`;
  }
  return `Cliente ${index + 1}`;
}

// Genera numero telefono casuale
function generateTelefono() {
  return `+39 ${randomInt(300, 399)} ${randomInt(1000000, 9999999)}`;
}

// Genera email casuale
function generateEmail(nome) {
  const domains = [
    "gmail.com",
    "yahoo.it",
    "hotmail.it",
    "outlook.com",
    "libero.it",
  ];
  const cleanNome = nome.toLowerCase().replace(/\s+/g, ".");
  return `${cleanNome}@${randomElement(domains)}`;
}

async function seedDatabase() {
  console.log(
    "🌱 Inizio popolamento database Preventivi con dati casuali...\n",
  );
  const startTime = Date.now();

  try {
    // Inizializza il database (crea le tabelle se non esistono)
    console.log("📋 Inizializzazione database e creazione tabelle...");
    initDatabase();

    // Aspetta che le tabelle siano create
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log("✅ Database inizializzato e tabelle create!\n");

    // Abilita foreign keys
    await runQuery("PRAGMA foreign_keys = ON");

    // Carica configurazione da JSON
    const configPath = path.join(__dirname, "config_preventivi.json");
    const seedConfigTemplate = {
      nomi_utenti: [
        "Mario",
        "Luigi",
        "Giulia",
        "Andrea",
        "Sara",
        "Marco",
        "Francesca",
      ],
      marche: [
        "Ducati",
        "Yamaha",
        "KTM",
        "BMW",
        "Kawasaki",
        "Honda",
        "Suzuki",
        "Aprilia",
        "Triumph",
        "Harley-Davidson",
      ],
      modelli_per_marca: {
        Ducati: [
          "Panigale V4",
          "Monster 821",
          "Multistrada 1260",
          "Scrambler Icon",
        ],
        Yamaha: ["YZF-R1", "MT-07", "Tracer 900", "XSR700"],
        KTM: ["1290 Super Duke", "390 Duke", "790 Adventure", "RC 390"],
        BMW: ["S1000RR", "R1250GS", "F850GS", "G310R"],
        Kawasaki: ["Ninja ZX-10R", "Z900", "Versys 650", "Vulcan S"],
        Honda: ["CBR1000RR", "CB500X", "Africa Twin", "PCX 125"],
        Suzuki: ["GSX-R1000", "V-Strom 650", "SV650", "GSX-S750"],
        Aprilia: ["RSV4", "Tuono V4", "Shiver 900", "RS 660"],
        Triumph: ["Street Triple", "Tiger 900", "Speed Twin", "Scrambler 1200"],
        "Harley-Davidson": ["Sportster", "Street Glide", "Fat Boy", "Iron 883"],
      },
      nomi_clienti: [
        "Mario",
        "Luigi",
        "Giovanni",
        "Paolo",
        "Andrea",
        "Marco",
        "Stefano",
        "Luca",
        "Alessandro",
        "Francesco",
      ],
      cognomi_clienti: [
        "Rossi",
        "Bianchi",
        "Verdi",
        "Russo",
        "Ferrari",
        "Esposito",
        "Colombo",
        "Ricci",
        "Marino",
        "Greco",
      ],
      note_preventivi: [
        "Cliente interessato",
        "Da ricontattare",
        "Preventivo urgente",
        "In attesa di conferma",
        "Cliente indeciso",
        "Possibile sconto richiesto",
        "Cliente abituale",
        "Prima visita",
      ],
    };

    if (!fs.existsSync(configPath)) {
      console.log("⚠ File config_preventivi.json non trovato!");
      console.log("📝 Creazione file di configurazione...");

      fs.writeFileSync(configPath, JSON.stringify(seedConfigTemplate, null, 2));
      console.log(
        "✅ File config_preventivi.json creato con dati di esempio!\n",
      );
    }

    const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

    // Chiedi configurazione da tastiera
    console.log("📊 CONFIGURAZIONE GENERAZIONE DATI (MAX 10000 per tipo)\n");

    const numUtenti = Math.min(
      10000,
      parseInt(
        (await askQuestion(
          "Numero di utenti da creare (1-10000, default 5): ",
        )) || "5",
      ),
    );
    const numMarche = Math.min(
      10000,
      parseInt(
        (await askQuestion(
          "Numero di marche da creare (1-10000, default 10): ",
        )) || "10",
      ),
    );
    const numModelli = Math.min(
      10000,
      parseInt(
        (await askQuestion(
          "Numero di modelli da creare (1-10000, default 40): ",
        )) || "40",
      ),
    );
    const numClienti = Math.min(
      10000,
      parseInt(
        (await askQuestion(
          "Numero di clienti da creare (1-10000, default 50): ",
        )) || "50",
      ),
    );
    const numPreventivi = Math.min(
      10000,
      parseInt(
        (await askQuestion(
          "Numero di preventivi da creare (1-10000, default 100): ",
        )) || "100",
      ),
    );
    const giorniStorico = parseInt(
      (await askQuestion("Giorni di storico (default 365): ")) || "365",
    );

    console.log("\n🚀 Avvio creazione dati...\n");

    // 1. VERIFICA UTENTE ADMIN (già creato automaticamente da init.js)
    console.log("👤 Verifica utente Admin...");
    const adminCheck = await getQuery(
      "SELECT nome FROM utenti WHERE nome = 'Admin'",
    );

    if (adminCheck) {
      console.log(
        "✅ Utente Admin presente (username: Admin, password: Admin123!)\n",
      );
    } else {
      console.log("⚠️ Attenzione: Utente Admin non trovato!\n");
    }

    // 2. CREAZIONE UTENTI AGGIUNTIVI
    if (numUtenti > 1) {
      console.log("👥 Creazione utenti aggiuntivi in batch...");
      const utentiToInsert = [];
      const defaultPassword = "Password123!";
      const hashedPassword = await bcrypt.hash(defaultPassword, 10);

      for (let i = 0; i < numUtenti - 1; i++) {
        const nomeUtente = generateUsername(i, config.nomi_utenti);
        utentiToInsert.push([nomeUtente, hashedPassword]);
      }

      await batchInsert(
        "INSERT OR IGNORE INTO utenti (nome, password) VALUES (?, ?)",
        utentiToInsert,
      );
      console.log(`✅ ${numUtenti - 1} utenti aggiuntivi creati!\n`);
    }

    // 3. CREAZIONE MARCHE IN BATCH
    console.log("🏍️ Creazione marche in batch...");
    const marcheToInsert = [];
    for (let i = 0; i < numMarche; i++) {
      const nomeMarca = generateMarcaName(i, config.marche);
      marcheToInsert.push([nomeMarca]);
    }

    await batchInsert(
      "INSERT OR IGNORE INTO marche (nome) VALUES (?)",
      marcheToInsert,
    );

    // Recupera gli ID delle marche create
    const marcheRows = await getAllQuery("SELECT id, nome FROM marche");
    const marcheIds = {};
    marcheRows.forEach((row) => {
      marcheIds[row.nome] = row.id;
    });
    console.log(`✅ ${Object.keys(marcheIds).length} marche create!\n`);

    // 4. CREAZIONE MODELLI IN BATCH
    console.log("🏍️ Creazione modelli in batch...");
    const modelliToInsert = [];
    const marcheNomi = Object.keys(marcheIds);

    for (let i = 0; i < numModelli; i++) {
      const marcaNome = randomElement(marcheNomi);
      const marcaId = marcheIds[marcaNome];

      // Usa modelli dalla config se disponibili
      let nomeModello;
      if (
        config.modelli_per_marca &&
        config.modelli_per_marca[marcaNome] &&
        i < config.modelli_per_marca[marcaNome].length * 3
      ) {
        const modelliMarca = config.modelli_per_marca[marcaNome];
        nomeModello = randomElement(modelliMarca);
      } else {
        nomeModello = generateModelloName(i, marcaNome, []);
      }

      modelliToInsert.push([nomeModello, marcaId]);
    }

    await batchInsert(
      "INSERT OR IGNORE INTO modelli (nome, marche_id) VALUES (?, ?)",
      modelliToInsert,
    );

    // Recupera gli ID dei modelli creati
    const modelliRows = await getAllQuery("SELECT id, nome FROM modelli");
    const modelliIds = {};
    modelliRows.forEach((row) => {
      modelliIds[row.nome] = row.id;
    });
    console.log(`✅ ${Object.keys(modelliIds).length} modelli creati!\n`);

    // 5. CREAZIONE CLIENTI IN BATCH CON SCENARI REALISTICI
    console.log("👥 Creazione clienti in batch con scenari realistici...");
    const clientiToInsert = [];
    const clientiInfo = []; // Per tenere traccia dei dettagli

    for (let i = 0; i < numClienti; i++) {
      const nomeCliente = generateClienteName(
        i,
        config.nomi_clienti,
        config.cognomi_clienti,
      );
      const numTel = generateTelefono();
      const email = generateEmail(nomeCliente);

      // SCENARI REALISTICI PER CLIENTI:
      const scenario = Math.random();
      let dataPassaggio = null;
      let flagRicontatto = 0;
      let tipoCliente = "";

      if (scenario < 0.15) {
        // 15% - Clienti NUOVI (mai passati, da ricontattare)
        dataPassaggio = null;
        flagRicontatto = 1;
        tipoCliente = "nuovo_ricontattare";
      } else if (scenario < 0.25) {
        // 10% - Clienti NUOVI (mai passati, non da ricontattare - es. solo info telefonica)
        dataPassaggio = null;
        flagRicontatto = 0;
        tipoCliente = "nuovo_no_ricontatto";
      } else if (scenario < 0.45) {
        // 20% - Clienti RECENTI (passati negli ultimi 30 giorni, da ricontattare)
        dataPassaggio = randomDate(30);
        flagRicontatto = 1;
        tipoCliente = "recente_ricontattare";
      } else if (scenario < 0.6) {
        // 15% - Clienti RECENTI (passati negli ultimi 30 giorni, già ricontattati)
        dataPassaggio = randomDate(30);
        flagRicontatto = 0;
        tipoCliente = "recente_ok";
      } else if (scenario < 0.75) {
        // 15% - Clienti INTERMEDI (30-90 giorni fa, alcuni da ricontattare)
        dataPassaggio =
          randomDate(90) < randomDate(30) ? randomDate(90) : randomDate(60);
        flagRicontatto = Math.random() > 0.5 ? 1 : 0;
        tipoCliente = "intermedio";
      } else if (scenario < 0.9) {
        // 15% - Clienti VECCHI (>90 giorni, alcuni da ricontattare)
        const giorniVecchi = randomInt(91, giorniStorico);
        dataPassaggio = randomDate(giorniVecchi);
        flagRicontatto = Math.random() > 0.7 ? 1 : 0; // 30% da ricontattare
        tipoCliente = "vecchio";
      } else {
        // 10% - Clienti MOLTO VECCHI (oltre 6 mesi, rari da ricontattare)
        const giorniMoltoVecchi = randomInt(180, giorniStorico);
        dataPassaggio = randomDate(giorniMoltoVecchi);
        flagRicontatto = Math.random() > 0.9 ? 1 : 0; // Solo 10% da ricontattare
        tipoCliente = "molto_vecchio";
      }

      clientiToInsert.push([
        nomeCliente,
        numTel,
        email,
        dataPassaggio,
        flagRicontatto,
      ]);
      clientiInfo.push({
        nome: nomeCliente,
        dataPassaggio: dataPassaggio,
        flagRicontatto: flagRicontatto,
        tipo: tipoCliente,
      });
    }

    await batchInsert(
      "INSERT OR IGNORE INTO clienti (nome, num_tel, email, data_passaggio, flag_ricontatto) VALUES (?, ?, ?, ?, ?)",
      clientiToInsert,
    );

    // Recupera gli ID dei clienti creati
    const clientiRows = await getAllQuery("SELECT id, nome FROM clienti");
    const clientiIds = {};
    const clientiMap = {}; // Mappa completa con tutti i dati
    clientiRows.forEach((row) => {
      clientiIds[row.nome] = row.id;
      const info = clientiInfo.find((c) => c.nome === row.nome);
      if (info) {
        clientiMap[row.nome] = {
          id: row.id,
          ...info,
        };
      }
    });

    // Statistiche clienti
    const statsClienti = {
      nuovi: clientiInfo.filter((c) => !c.dataPassaggio).length,
      ricontattare: clientiInfo.filter((c) => c.flagRicontatto === 1).length,
      recenti: clientiInfo.filter((c) => c.tipo.includes("recente")).length,
      vecchi: clientiInfo.filter((c) => c.tipo.includes("vecchio")).length,
    };

    console.log(`✅ ${Object.keys(clientiIds).length} clienti creati!`);
    console.log(`   📊 Nuovi (senza passaggio): ${statsClienti.nuovi}`);
    console.log(`   📊 Da ricontattare: ${statsClienti.ricontattare}`);
    console.log(`   📊 Recenti (< 30gg): ${statsClienti.recenti}`);
    console.log(`   📊 Vecchi (> 90gg): ${statsClienti.vecchi}\n`);

    // 6. CREAZIONE PREVENTIVI (ORDINI) CON SCENARI REALISTICI
    console.log("📋 Creazione preventivi con scenari realistici...");
    const preventiviToInsert = [];
    const clientiNomi = Object.keys(clientiIds);
    const modelliNomiArray = Object.keys(modelliIds);
    const preventiviStats = {
      conModelloSpecifico: 0,
      soloMarca: 0,
      conNote: 0,
      primaDataPassaggio: 0,
      dopoDataPassaggio: 0,
      senzaDataPassaggio: 0,
      vecchi: 0,
      recenti: 0,
    };

    for (let i = 0; i < numPreventivi; i++) {
      const clienteNome = randomElement(clientiNomi);
      const clienteId = clientiIds[clienteNome];
      const clienteData = clientiMap[clienteNome];

      // CALCOLO DATA MOVIMENTO BASATA SUL CLIENTE
      let dataMovimento;

      if (!clienteData.dataPassaggio) {
        // Cliente mai passato - preventivo può essere di qualsiasi data nel periodo
        dataMovimento = randomDate(giorniStorico);
        preventiviStats.senzaDataPassaggio++;
      } else {
        const dataPassaggioDate = new Date(clienteData.dataPassaggio);

        // 60% preventivi PRIMA del passaggio, 40% DOPO
        if (Math.random() < 0.6) {
          // Preventivo prima del passaggio (da 1 a 60 giorni prima)
          const giorniPrima = randomInt(1, 60);
          const dataPrev = new Date(dataPassaggioDate);
          dataPrev.setDate(dataPrev.getDate() - giorniPrima);
          dataMovimento = dataPrev.toISOString().split("T")[0];
          preventiviStats.primaDataPassaggio++;
        } else {
          // Preventivo dopo il passaggio (da 1 a 30 giorni dopo)
          const giorniDopo = randomInt(1, 30);
          const dataPrev = new Date(dataPassaggioDate);
          dataPrev.setDate(dataPrev.getDate() + giorniDopo);

          // Assicurati che non sia nel futuro
          const oggi = new Date();
          if (dataPrev > oggi) {
            dataPrev.setTime(
              oggi.getTime() - randomInt(1, 7) * 24 * 60 * 60 * 1000,
            );
          }

          dataMovimento = dataPrev.toISOString().split("T")[0];
          preventiviStats.dopoDataPassaggio++;
        }
      }

      // Statistiche temporali
      const giorniDataMovimento = Math.floor(
        (new Date() - new Date(dataMovimento)) / (1000 * 60 * 60 * 24),
      );
      if (giorniDataMovimento < 30) {
        preventiviStats.recenti++;
      } else if (giorniDataMovimento > 180) {
        preventiviStats.vecchi++;
      }

      // SCELTA MODELLO/MARCA
      let modelloId = null;
      let marcaId = null;

      // 75% hanno modello specifico, 25% solo marca
      if (Math.random() < 0.75) {
        const modelloNome = randomElement(modelliNomiArray);
        modelloId = modelliIds[modelloNome];

        // Ottieni la marca del modello
        const modelloRow = await getQuery(
          "SELECT marche_id FROM modelli WHERE id = ?",
          [modelloId],
        );
        marcaId = modelloRow ? modelloRow.marche_id : null;
        preventiviStats.conModelloSpecifico++;
      } else {
        // Solo marca senza modello specifico
        const marcaNome = randomElement(marcheNomi);
        marcaId = marcheIds[marcaNome];
        preventiviStats.soloMarca++;
      }

      // NOTE - più probabili per certi tipi di clienti
      let note = null;
      const probabilitaNote = clienteData.flagRicontatto === 1 ? 0.7 : 0.4;

      if (Math.random() < probabilitaNote) {
        // Seleziona nota appropriata al contesto
        const noteContest = [...config.note_preventivi];

        if (clienteData.flagRicontatto === 1) {
          noteContest.push(
            "Da ricontattare con urgenza",
            "Cliente in attesa risposta",
          );
        }

        if (!clienteData.dataPassaggio) {
          noteContest.push("Primo contatto", "Mai passato in negozio");
        }

        if (giorniDataMovimento > 90) {
          noteContest.push("Preventivo scaduto", "Da aggiornare");
        }

        note = randomElement(noteContest);
        preventiviStats.conNote++;
      }

      preventiviToInsert.push([
        dataMovimento,
        modelloId,
        clienteId,
        marcaId,
        note,
      ]);
    }

    await batchInsert(
      "INSERT INTO ordini (data_movimento, modello_id, cliente_id, marca_id, note) VALUES (?, ?, ?, ?, ?)",
      preventiviToInsert,
    );

    console.log(`✅ ${numPreventivi} preventivi creati!`);
    console.log(
      `   📊 Con modello specifico: ${preventiviStats.conModelloSpecifico}`,
    );
    console.log(`   📊 Solo marca: ${preventiviStats.soloMarca}`);
    console.log(`   📊 Con note: ${preventiviStats.conNote}`);
    console.log(
      `   📊 Prima del passaggio: ${preventiviStats.primaDataPassaggio}`,
    );
    console.log(
      `   📊 Dopo il passaggio: ${preventiviStats.dopoDataPassaggio}`,
    );
    console.log(
      `   📊 Cliente mai passato: ${preventiviStats.senzaDataPassaggio}`,
    );
    console.log(`   📊 Recenti (<30gg): ${preventiviStats.recenti}`);
    console.log(`   📊 Vecchi (>180gg): ${preventiviStats.vecchi}\n`);

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log("✅ Database popolato con successo!");
    console.log("\n" + "=".repeat(60));
    console.log("📊 RIEPILOGO FINALE");
    console.log("=".repeat(60));
    console.log("\n👥 UTENTI:");
    console.log(`  • 1 Admin (password: Admin123!)`);
    console.log(
      `  • ${numUtenti - 1} utenti aggiuntivi (password: Password123!)`,
    );
    console.log(`  • Totale: ${numUtenti} utenti`);

    console.log("\n🏍️ MARCHE E MODELLI:");
    console.log(`  • ${Object.keys(marcheIds).length} marche`);
    console.log(`  • ${Object.keys(modelliIds).length} modelli`);

    console.log("\n👥 CLIENTI:");
    console.log(`  • Totale: ${Object.keys(clientiIds).length}`);
    console.log(`  • Nuovi (mai passati): ${statsClienti.nuovi}`);
    console.log(`  • Da ricontattare: ${statsClienti.ricontattare}`);
    console.log(`  • Recenti (< 30 giorni): ${statsClienti.recenti}`);
    console.log(`  • Vecchi (> 90 giorni): ${statsClienti.vecchi}`);

    console.log("\n📋 PREVENTIVI:");
    console.log(`  • Totale: ${numPreventivi}`);
    console.log(
      `  • Con modello specifico: ${preventiviStats.conModelloSpecifico}`,
    );
    console.log(`  • Solo marca: ${preventiviStats.soloMarca}`);
    console.log(`  • Con note: ${preventiviStats.conNote}`);
    console.log(
      `  • Prima passaggio cliente: ${preventiviStats.primaDataPassaggio}`,
    );
    console.log(
      `  • Dopo passaggio cliente: ${preventiviStats.dopoDataPassaggio}`,
    );
    console.log(
      `  • Cliente mai passato: ${preventiviStats.senzaDataPassaggio}`,
    );
    console.log(`  • Recenti (< 30 giorni): ${preventiviStats.recenti}`);
    console.log(`  • Vecchi (> 180 giorni): ${preventiviStats.vecchi}`);

    console.log("\n⏱️ PERFORMANCE:");
    console.log(`  • Periodo storico: ${giorniStorico} giorni`);
    console.log(`  • Tempo di esecuzione: ${duration} secondi`);
    console.log("\n" + "=".repeat(60));
  } catch (error) {
    console.error("❌ Errore durante il popolamento:", error);
    if (rl) rl.close();
    if (db) db.close();
  } finally {
    rl.close();
    db.close(() => {
      console.log("\n🔒 Connessione al database chiusa.");
    });
  }
}

// Esegui il seeding
seedDatabase();
