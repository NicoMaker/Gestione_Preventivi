// scripts/seed-database.js
// Script per popolare il database con dati di esempio completi
// Eseguire con: node scripts/seed-database.js
// ⚠️ IMPORTANTE: Ogni modello DEVE avere una marca associata (marche_id obbligatorio)

const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "Preventivi.db");
const DB_DIR = path.dirname(DB_PATH);

console.log("=".repeat(60));
console.log("SEED DATABASE - Popolamento dati di esempio");
console.log("=".repeat(60));

// Crea la cartella db se non esiste
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log(`\n✓ Cartella database creata: ${DB_DIR}`);
}

// Connessione al database
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Errore connessione database:", err.message);
    process.exit(1);
  }
  console.log(`\n✓ Database connesso: ${DB_PATH}`);
});

// Abilita le foreign keys
db.run("PRAGMA foreign_keys = ON");

// Funzione per inserimento con promise
function runQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve(this.lastID);
    });
  });
}

// Funzione per query con promise
function getQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

// Funzione per inizializzare le tabelle
async function initTables() {
  console.log("\n[INIT] Creazione tabelle...");

  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // Tabella utenti
        await runQuery(`CREATE TABLE IF NOT EXISTS utenti (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log("  ✓ Tabella utenti OK");

        // Tabella marche
        await runQuery(`CREATE TABLE IF NOT EXISTS marche (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL UNIQUE,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log("  ✓ Tabella marche OK");

        // Tabella clienti
        await runQuery(`CREATE TABLE IF NOT EXISTS clienti (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL UNIQUE,
          num_tel TEXT,
          email TEXT,
          data_passaggio DATE,
          flag_ricontatto INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
        console.log("  ✓ Tabella clienti OK");

        // Tabella modelli - ⚠️ marche_id è obbligatorio (NOT NULL)
        await runQuery(`CREATE TABLE IF NOT EXISTS modelli (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          nome TEXT NOT NULL UNIQUE,
          marche_id INTEGER NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (marche_id) REFERENCES marche(id)
        )`);
        console.log("  ✓ Tabella modelli OK (marca obbligatoria)");

        // Tabella ordini (preventivi) - con contratto_finito
        await runQuery(`CREATE TABLE IF NOT EXISTS ordini (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data_movimento DATETIME DEFAULT CURRENT_TIMESTAMP,
          modello_id INTEGER,
          cliente_id INTEGER NOT NULL,
          marca_id INTEGER,
          note TEXT,
          contratto_finito INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (modello_id) REFERENCES modelli(id),
          FOREIGN KEY (cliente_id) REFERENCES clienti(id),
          FOREIGN KEY (marca_id) REFERENCES marche(id)
        )`);
        console.log("  ✓ Tabella ordini OK (con contratto_finito)");

        // ⚠️ MIGRAZIONE SICURA: aggiunge contratto_finito se il DB esiste già
        // Non perde nessun dato esistente - i record già presenti avranno valore 0
        db.run(
          "ALTER TABLE ordini ADD COLUMN contratto_finito INTEGER DEFAULT 0",
          (err) => {
            if (err) {
              if (err.message.includes("duplicate column")) {
                console.log("  ✓ Colonna contratto_finito già presente");
              } else {
                console.error("  ✗ Errore migrazione contratto_finito:", err.message);
              }
            } else {
              console.log("  ✓ Colonna contratto_finito aggiunta (record esistenti = 0)");
            }
          }
        );

        console.log("✓ Tutte le tabelle sono pronte");
        resolve();
      } catch (err) {
        console.error("✗ Errore creazione tabelle:", err.message);
        reject(err);
      }
    });
  });
}

// Funzione per pulizia database (opzionale)
async function pulisciDatabase() {
  console.log("\n[PULIZIA] Svuotamento tabelle...");
  try {
    await runQuery("DELETE FROM ordini");
    await runQuery("DELETE FROM modelli");
    await runQuery("DELETE FROM marche");
    await runQuery("DELETE FROM clienti");
    await runQuery("DELETE FROM utenti");
    console.log("✓ Tutte le tabelle sono state svuotate");
  } catch (err) {
    console.error("✗ Errore pulizia:", err.message);
  }
}

// ==================== SEED UTENTI ====================
async function seedUtenti() {
  console.log("\n[UTENTI] Popolamento utenti...");

  const utenti = [
    { nome: "Admin", password: "Admin123!" },
    { nome: "Mario_Rossi", password: "Password123!" },
    { nome: "Luca_Bianchi", password: "Sicura456!" },
    { nome: "Giulia_Verdi", password: "Test789!" },
    { nome: "Francesco_Neri", password: "Demo2024!" },
  ];

  const utentiIds = [];

  for (const utente of utenti) {
    try {
      const hashedPassword = await bcrypt.hash(utente.password, 10);
      const id = await runQuery(
        "INSERT INTO utenti (nome, password) VALUES (?, ?)",
        [utente.nome, hashedPassword]
      );
      utentiIds.push(id);
      console.log(`  ✓ Utente: ${utente.nome} / ${utente.password} (ID: ${id})`);
    } catch (err) {
      if (err.message.includes("UNIQUE")) {
        console.log(`  → Utente ${utente.nome} già esistente, skip`);
      } else {
        console.error(`  ✗ Errore utente ${utente.nome}:`, err.message);
      }
    }
  }

  console.log(`✓ ${utentiIds.length} utenti inseriti`);
  return utentiIds;
}

// ==================== SEED MARCHE ====================
async function seedMarche() {
  console.log("\n[MARCHE] Popolamento marche...");

  const marche = [
    "Volkswagen", "BMW", "Mercedes-Benz", "Audi", "Toyota",
    "Ford", "Fiat", "Peugeot", "Renault", "Opel",
    "Alfa Romeo", "Tesla", "Volvo", "Nissan", "Honda",
    "Mazda", "Hyundai", "Kia", "Skoda", "Seat",
  ];

  const marcheIds = {};

  for (const marca of marche) {
    try {
      const id = await runQuery("INSERT INTO marche (nome) VALUES (?)", [marca]);
      marcheIds[marca] = id;
      console.log(`  ✓ Marca: ${marca} (ID: ${id})`);
    } catch (err) {
      if (err.message.includes("UNIQUE")) {
        console.log(`  → Marca ${marca} già esistente, skip`);
        const existing = await getQuery("SELECT id FROM marche WHERE nome = ?", [marca]);
        if (existing) marcheIds[marca] = existing.id;
      } else {
        console.error(`  ✗ Errore marca ${marca}:`, err.message);
      }
    }
  }

  console.log(`✓ ${Object.keys(marcheIds).length} marche inserite`);
  return marcheIds;
}

// ==================== SEED MODELLI ====================
async function seedModelli(marcheIds) {
  console.log("\n[MODELLI] Popolamento modelli...");
  console.log("⚠️  IMPORTANTE: Ogni modello DEVE avere una marca associata");

  const modelli = [
    // Volkswagen
    { nome: "Golf VIII 1.5 TSI Life", marche_id: marcheIds["Volkswagen"] },
    { nome: "Polo 1.0 TSI Comfortline", marche_id: marcheIds["Volkswagen"] },
    { nome: "Tiguan 2.0 TDI 4Motion", marche_id: marcheIds["Volkswagen"] },
    { nome: "T-Roc 1.0 TSI Style", marche_id: marcheIds["Volkswagen"] },
    // BMW
    { nome: "Serie 3 320d xDrive", marche_id: marcheIds["BMW"] },
    { nome: "Serie 1 118i M Sport", marche_id: marcheIds["BMW"] },
    { nome: "X3 xDrive20d", marche_id: marcheIds["BMW"] },
    { nome: "Serie 5 530e Plug-in Hybrid", marche_id: marcheIds["BMW"] },
    // Mercedes-Benz
    { nome: "Classe A 180d Automatic", marche_id: marcheIds["Mercedes-Benz"] },
    { nome: "Classe C 220d 4Matic", marche_id: marcheIds["Mercedes-Benz"] },
    { nome: "GLA 200d Business", marche_id: marcheIds["Mercedes-Benz"] },
    { nome: "EQA 250 Electric", marche_id: marcheIds["Mercedes-Benz"] },
    // Audi
    { nome: "A3 Sportback 35 TDI S tronic", marche_id: marcheIds["Audi"] },
    { nome: "A4 Avant 40 TDI quattro", marche_id: marcheIds["Audi"] },
    { nome: "Q3 35 TFSI S line", marche_id: marcheIds["Audi"] },
    { nome: "e-tron 55 quattro", marche_id: marcheIds["Audi"] },
    // Toyota
    { nome: "Yaris Hybrid Active", marche_id: marcheIds["Toyota"] },
    { nome: "Corolla Hybrid Executive", marche_id: marcheIds["Toyota"] },
    { nome: "RAV4 Hybrid AWD", marche_id: marcheIds["Toyota"] },
    { nome: "C-HR 1.8 Hybrid", marche_id: marcheIds["Toyota"] },
    // Ford
    { nome: "Fiesta 1.0 EcoBoost Titanium", marche_id: marcheIds["Ford"] },
    { nome: "Focus 1.5 EcoBlue ST-Line", marche_id: marcheIds["Ford"] },
    { nome: "Puma 1.0 EcoBoost Hybrid", marche_id: marcheIds["Ford"] },
    { nome: "Kuga 2.5 PHEV ST-Line", marche_id: marcheIds["Ford"] },
    // Fiat
    { nome: "500 Hybrid Dolcevita", marche_id: marcheIds["Fiat"] },
    { nome: "Panda 1.0 Hybrid City Cross", marche_id: marcheIds["Fiat"] },
    { nome: "Tipo 1.6 Multijet Business", marche_id: marcheIds["Fiat"] },
    { nome: "500X 1.3 FireFly Cross", marche_id: marcheIds["Fiat"] },
    // Peugeot
    { nome: "208 1.2 PureTech GT Line", marche_id: marcheIds["Peugeot"] },
    { nome: "2008 1.5 BlueHDi Allure", marche_id: marcheIds["Peugeot"] },
    { nome: "3008 1.5 BlueHDi GT", marche_id: marcheIds["Peugeot"] },
    { nome: "e-208 Electric", marche_id: marcheIds["Peugeot"] },
    // Renault
    { nome: "Clio 1.0 TCe Intens", marche_id: marcheIds["Renault"] },
    { nome: "Captur 1.3 TCe Techno", marche_id: marcheIds["Renault"] },
    { nome: "Megane 1.5 dCi Zen", marche_id: marcheIds["Renault"] },
    { nome: "ZOE Electric R135", marche_id: marcheIds["Renault"] },
    // Opel
    { nome: "Corsa 1.2 Elegance", marche_id: marcheIds["Opel"] },
    { nome: "Astra 1.5 Diesel Innovation", marche_id: marcheIds["Opel"] },
    { nome: "Crossland 1.2 Turbo GS Line", marche_id: marcheIds["Opel"] },
    { nome: "Mokka-e Electric Edition", marche_id: marcheIds["Opel"] },
    // Alfa Romeo
    { nome: "Giulietta 1.6 JTDm Super", marche_id: marcheIds["Alfa Romeo"] },
    { nome: "Giulia 2.2 Turbodiesel", marche_id: marcheIds["Alfa Romeo"] },
    { nome: "Stelvio 2.2 Diesel Q4", marche_id: marcheIds["Alfa Romeo"] },
    { nome: "Tonale 1.5 Hybrid Speciale", marche_id: marcheIds["Alfa Romeo"] },
    // Tesla
    { nome: "Model 3 Long Range", marche_id: marcheIds["Tesla"] },
    { nome: "Model Y Performance", marche_id: marcheIds["Tesla"] },
    { nome: "Model S Plaid", marche_id: marcheIds["Tesla"] },
    { nome: "Model X Long Range", marche_id: marcheIds["Tesla"] },
    // Volvo
    { nome: "XC40 T3 R-Design", marche_id: marcheIds["Volvo"] },
    { nome: "XC60 D4 AWD Momentum", marche_id: marcheIds["Volvo"] },
    { nome: "V60 T6 Plug-in Hybrid", marche_id: marcheIds["Volvo"] },
    { nome: "C40 Recharge Pure Electric", marche_id: marcheIds["Volvo"] },
    // Nissan
    { nome: "Micra 1.0 IG-T N-Sport", marche_id: marcheIds["Nissan"] },
    { nome: "Juke 1.0 DIG-T Tekna", marche_id: marcheIds["Nissan"] },
    { nome: "Qashqai 1.3 DIG-T N-Connecta", marche_id: marcheIds["Nissan"] },
    { nome: "Leaf Electric e+", marche_id: marcheIds["Nissan"] },
    // Honda
    { nome: "Civic 1.0 VTEC Turbo Elegance", marche_id: marcheIds["Honda"] },
    { nome: "HR-V 1.5 i-VTEC Executive", marche_id: marcheIds["Honda"] },
    { nome: "CR-V 1.5 VTEC Turbo Elegance", marche_id: marcheIds["Honda"] },
    { nome: "e Electric Advance", marche_id: marcheIds["Honda"] },
    // Mazda
    { nome: "Mazda2 1.5 Skyactiv-G Evolve", marche_id: marcheIds["Mazda"] },
    { nome: "Mazda3 2.0 Skyactiv-X Exceed", marche_id: marcheIds["Mazda"] },
    { nome: "CX-30 2.0 Skyactiv-G Exceed", marche_id: marcheIds["Mazda"] },
    { nome: "MX-30 Electric First Edition", marche_id: marcheIds["Mazda"] },
    // Hyundai
    { nome: "i20 1.0 T-GDI 48V XTech", marche_id: marcheIds["Hyundai"] },
    { nome: "i30 1.6 CRDi Business", marche_id: marcheIds["Hyundai"] },
    { nome: "Tucson 1.6 CRDi 48V XTech", marche_id: marcheIds["Hyundai"] },
    { nome: "Kona Electric 64 kWh Exellence", marche_id: marcheIds["Hyundai"] },
    // Kia
    { nome: "Picanto 1.0 GT Line", marche_id: marcheIds["Kia"] },
    { nome: "Stonic 1.0 T-GDI Urban", marche_id: marcheIds["Kia"] },
    { nome: "Sportage 1.6 CRDi Business", marche_id: marcheIds["Kia"] },
    { nome: "e-Niro Electric 64 kWh", marche_id: marcheIds["Kia"] },
    // Skoda
    { nome: "Fabia 1.0 TSI Ambition", marche_id: marcheIds["Skoda"] },
    { nome: "Octavia 2.0 TDI Style", marche_id: marcheIds["Skoda"] },
    { nome: "Karoq 1.5 TSI Style", marche_id: marcheIds["Skoda"] },
    { nome: "Enyaq iV 80", marche_id: marcheIds["Skoda"] },
    // Seat
    { nome: "Ibiza 1.0 TSI FR", marche_id: marcheIds["Seat"] },
    { nome: "Leon 1.5 TSI FR", marche_id: marcheIds["Seat"] },
    { nome: "Arona 1.0 TSI Xcellence", marche_id: marcheIds["Seat"] },
    { nome: "Tarraco 2.0 TDI 4Drive Xcellence", marche_id: marcheIds["Seat"] },
  ];

  const modelliIds = [];
  let errorCount = 0;

  for (const modello of modelli) {
    if (!modello.marche_id) {
      console.error(`  ✗ ERRORE: Modello "${modello.nome}" non ha marca associata! SALTATO.`);
      errorCount++;
      continue;
    }

    try {
      const id = await runQuery(
        "INSERT INTO modelli (nome, marche_id) VALUES (?, ?)",
        [modello.nome, modello.marche_id]
      );
      modelliIds.push({ id, ...modello });
      console.log(`  ✓ Modello: ${modello.nome} (ID: ${id}, Marca ID: ${modello.marche_id})`);
    } catch (err) {
      if (err.message.includes("UNIQUE")) {
        console.log(`  → Modello ${modello.nome} già esistente, skip`);
      } else if (err.message.includes("NOT NULL")) {
        console.error(`  ✗ ERRORE: Modello "${modello.nome}" manca marca_id (NOT NULL violation)`);
        errorCount++;
      } else {
        console.error(`  ✗ Errore modello ${modello.nome}:`, err.message);
        errorCount++;
      }
    }
  }

  console.log(`✓ ${modelliIds.length} modelli inseriti`);
  if (errorCount > 0) {
    console.warn(`⚠️  ${errorCount} modelli NON inseriti per mancanza marca`);
  }
  return modelliIds;
}

// ==================== SEED CLIENTI ====================
async function seedClienti() {
  console.log("\n[CLIENTI] Popolamento clienti...");
  console.log("  Casi coperti: [📱 solo cellulare] [📧 solo email] [📱📧 entrambi]");

  const clienti = [
    // Solo CELLULARE
    { nome: "Marco Neri", num_tel: "3478901234", email: null, data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Anna Verdi", num_tel: "3391234567", email: null, data_passaggio: "2024-01-25", flag_ricontatto: 1 },
    { nome: "Francesca Moretti", num_tel: "3500228246", email: null, data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Roberto Colombo", num_tel: "3356998375", email: null, data_passaggio: "2024-03-01", flag_ricontatto: 1 },
    { nome: "Andrea Santoro", num_tel: "3497654321", email: null, data_passaggio: "2024-12-28", flag_ricontatto: 1 },
    { nome: "Matteo Romano", num_tel: "3489012345", email: null, data_passaggio: "2024-10-15", flag_ricontatto: 0 },
    { nome: "Davide Costa", num_tel: "3338765432", email: null, data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Stefano Fontana", num_tel: "3345641621", email: null, data_passaggio: "2024-07-12", flag_ricontatto: 0 },
    { nome: "Alessandro Greco", num_tel: "3384567890", email: null, data_passaggio: "2024-05-22", flag_ricontatto: 1 },
    { nome: "Simone Caruso", num_tel: "3336789012", email: null, data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Claudio Battaglia", num_tel: "3447890123", email: null, data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Monica Martini", num_tel: "3356942968", email: null, data_passaggio: null, flag_ricontatto: 1 },
    // Solo EMAIL
    { nome: "Cristina Fabbri", num_tel: null, email: "cristina.fabbri@gmail.com", data_passaggio: "2024-02-10", flag_ricontatto: 0 },
    { nome: "Emanuele Mancini", num_tel: null, email: "emanuele.mancini@libero.it", data_passaggio: null, flag_ricontatto: 1 },
    { nome: "Serena Pellegrini", num_tel: null, email: "serena.pellegrini@outlook.com", data_passaggio: "2024-04-18", flag_ricontatto: 0 },
    { nome: "Daniele Ferretti", num_tel: null, email: "daniele.ferretti@yahoo.it", data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Irene Marchetti", num_tel: null, email: "irene.marchetti@hotmail.it", data_passaggio: "2024-08-05", flag_ricontatto: 1 },
    { nome: "Tommaso Serra", num_tel: null, email: "tommaso.serra@email.it", data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Beatrice Longo", num_tel: null, email: "beatrice.longo@gmail.com", data_passaggio: "2024-11-22", flag_ricontatto: 1 },
    { nome: "Nicola Ferrara", num_tel: null, email: "nicola.ferrara@live.it", data_passaggio: null, flag_ricontatto: 0 },
    // ENTRAMBI
    { nome: "Giovanni Bianchi", num_tel: "3331234567", email: "giovanni.bianchi@email.it", data_passaggio: "2024-01-15", flag_ricontatto: 0 },
    { nome: "Maria Rossi", num_tel: "3349876543", email: "maria.rossi@gmail.com", data_passaggio: "2024-02-20", flag_ricontatto: 1 },
    { nome: "Luca Ferrari", num_tel: "3356789012", email: "luca.ferrari@yahoo.it", data_passaggio: "2024-03-10", flag_ricontatto: 0 },
    { nome: "Silvia Conti", num_tel: "3486111039", email: "silvia.conti@libero.it", data_passaggio: "2024-02-05", flag_ricontatto: 1 },
    { nome: "Paolo Ricci", num_tel: "3340772694", email: "paolo.ricci@outlook.com", data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Elena Gallo", num_tel: "3401234567", email: "elena.gallo@email.it", data_passaggio: "2024-12-20", flag_ricontatto: 1 },
    { nome: "Chiara Esposito", num_tel: "3356781234", email: "chiara.espo@hotmail.it", data_passaggio: "2024-11-10", flag_ricontatto: 0 },
    { nome: "Giulia Marino", num_tel: "3340823923", email: "giulia.marino@live.it", data_passaggio: "2024-09-05", flag_ricontatto: 1 },
    { nome: "Valentina Bruno", num_tel: "3452345678", email: "valentina.bruno@yahoo.it", data_passaggio: "2024-08-20", flag_ricontatto: 1 },
    { nome: "Laura De Luca", num_tel: "3473456789", email: "laura.deluca@gmail.com", data_passaggio: "2024-06-18", flag_ricontatto: 0 },
    { nome: "Federica Piras", num_tel: "3495678901", email: "federica.piras@libero.it", data_passaggio: "2024-04-30", flag_ricontatto: 0 },
    { nome: "Alessia Lombardi", num_tel: "3502544514", email: "alessia.lombardi@email.it", data_passaggio: null, flag_ricontatto: 0 },
    { nome: "Riccardo Vitale", num_tel: "3358901234", email: "riccardo.vitale@gmail.com", data_passaggio: null, flag_ricontatto: 0 },
  ];

  const clientiIds = [];
  let countSoloCel = 0, countSoloMail = 0, countEntrambi = 0;

  for (const cliente of clienti) {
    try {
      const id = await runQuery(
        "INSERT INTO clienti (nome, num_tel, email, data_passaggio, flag_ricontatto) VALUES (?, ?, ?, ?, ?)",
        [cliente.nome, cliente.num_tel, cliente.email, cliente.data_passaggio, cliente.flag_ricontatto]
      );
      clientiIds.push({ id, ...cliente });

      let caso;
      if (cliente.num_tel && !cliente.email) { caso = "📱 solo cel"; countSoloCel++; }
      else if (!cliente.num_tel && cliente.email) { caso = "📧 solo mail"; countSoloMail++; }
      else { caso = "📱📧 entrambi"; countEntrambi++; }

      console.log(`  ✓ [${caso}] ${cliente.nome} (ID: ${id})`);
    } catch (err) {
      if (err.message.includes("UNIQUE")) {
        console.log(`  → Cliente ${cliente.nome} già esistente, skip`);
      } else {
        console.error(`  ✗ Errore cliente ${cliente.nome}:`, err.message);
      }
    }
  }

  console.log(`✓ ${clientiIds.length} clienti inseriti:`);
  console.log(`  📱 Solo cellulare: ${countSoloCel}`);
  console.log(`  📧 Solo email:     ${countSoloMail}`);
  console.log(`  📱📧 Entrambi:     ${countEntrambi}`);
  return clientiIds;
}

// ==================== SEED ORDINI/PREVENTIVI ====================
async function seedOrdini(clientiIds, modelliIds, marcheIds) {
  console.log("\n[ORDINI] Popolamento preventivi...");
  console.log("  Casi coperti: [✅ contratto finito] [🔴 non finito]");

  // contratto_finito: 1 = finito ✅, 0 = non finito 🔴
  const ordini = [
    {
      cliente_id: clientiIds[0]?.id,
      modello_id: modelliIds[0]?.id,
      marca_id: marcheIds["Volkswagen"],
      note: "Cliente interessato a finanziamento. Valutazione permuta auto usata.",
      data_movimento: "2024-01-16",
      contratto_finito: 1, // ✅ Contratto chiuso
    },
    {
      cliente_id: clientiIds[1]?.id,
      modello_id: modelliIds[8]?.id,
      marca_id: marcheIds["Mercedes-Benz"],
      note: "Preventivo con optional: tetto apribile, sedili riscaldati, telecamera posteriore.",
      data_movimento: "2024-02-21",
      contratto_finito: 0, // 🔴 In trattativa
    },
    {
      cliente_id: clientiIds[2]?.id,
      modello_id: modelliIds[16]?.id,
      marca_id: marcheIds["Toyota"],
      note: "Cliente cerca auto ibrida per risparmio carburante. Budget max 30.000 EUR.",
      data_movimento: "2024-03-11",
      contratto_finito: 1, // ✅ Venduto
    },
    {
      cliente_id: clientiIds[3]?.id,
      modello_id: null,
      marca_id: marcheIds["BMW"],
      note: "Cliente indeciso tra Serie 1 e Serie 3. Richiesto confronto prezzi.",
      data_movimento: "2024-01-26",
      contratto_finito: 0, // 🔴 Cliente indeciso
    },
    {
      cliente_id: clientiIds[4]?.id,
      modello_id: null,
      marca_id: marcheIds["Audi"],
      note: "Interessato a gamma SUV Audi. Test drive da programmare.",
      data_movimento: "2024-02-10",
      contratto_finito: 0, // 🔴 Da seguire
    },
    {
      cliente_id: clientiIds[5]?.id,
      modello_id: null,
      marca_id: null,
      note: "Cliente cerca auto compatta benzina. Budget 15.000 EUR. Prima auto.",
      data_movimento: "2024-02-06",
      contratto_finito: 0, // 🔴 Generico, in attesa
    },
    {
      cliente_id: clientiIds[6]?.id,
      modello_id: null,
      marca_id: null,
      note: "Richiesta preventivo generico per auto elettrica aziendale.",
      data_movimento: "2024-03-05",
      contratto_finito: 1, // ✅ Ordine aziendale confermato
    },
    {
      cliente_id: clientiIds[7]?.id,
      modello_id: modelliIds[24]?.id,
      marca_id: marcheIds["Fiat"],
      note: "Cliente ha chiesto: colore rosso, cerchi in lega 16\", sensori parcheggio, navigatore integrato, garanzia estesa 3 anni.",
      data_movimento: "2024-03-02",
      contratto_finito: 1, // ✅ Consegnata
    },
    {
      cliente_id: clientiIds[8]?.id,
      modello_id: modelliIds[32]?.id,
      marca_id: marcheIds["Renault"],
      note: "URGENTE: Cliente necessita auto entro fine mese per lavoro. Disponibile subito?",
      data_movimento: "2024-12-15",
      contratto_finito: 0, // 🔴 Urgente, da chiudere
    },
    // Più preventivi per lo stesso cliente (clientiIds[9])
    {
      cliente_id: clientiIds[9]?.id,
      modello_id: modelliIds[4]?.id,
      marca_id: marcheIds["BMW"],
      note: "Prima proposta: BMW Serie 3 - Prezzo listino 48.000 EUR",
      data_movimento: "2024-12-20",
      contratto_finito: 0, // 🔴 Scartata
    },
    {
      cliente_id: clientiIds[9]?.id,
      modello_id: modelliIds[12]?.id,
      marca_id: marcheIds["Audi"],
      note: "Seconda proposta: Audi A4 - Cliente preferisce questo modello",
      data_movimento: "2024-12-21",
      contratto_finito: 0, // 🔴 Alternativa
    },
    {
      cliente_id: clientiIds[9]?.id,
      modello_id: modelliIds[9]?.id,
      marca_id: marcheIds["Mercedes-Benz"],
      note: "Terza proposta: Mercedes Classe C - Accettata! In attesa conferma finanziamento",
      data_movimento: "2024-12-22",
      contratto_finito: 1, // ✅ Scelta finale confermata
    },
    {
      cliente_id: clientiIds[10]?.id,
      modello_id: modelliIds[40]?.id,
      marca_id: marcheIds["Tesla"],
      note: "Cliente vuole passare all'elettrico. Interessato a wallbox domestica.",
      data_movimento: "2024-12-28",
      contratto_finito: 0, // 🔴 In valutazione
    },
    {
      cliente_id: clientiIds[11]?.id,
      modello_id: modelliIds[28]?.id,
      marca_id: marcheIds["Peugeot"],
      note: "Cliente cerca SUV compatto. Budget flessibile.",
      data_movimento: "2024-11-12",
      contratto_finito: 1, // ✅ Acquistato
    },
    {
      cliente_id: clientiIds[12]?.id,
      modello_id: modelliIds[20]?.id,
      marca_id: marcheIds["Ford"],
      note: "Permuta Ford Focus 2018 - Valutazione 12.000 EUR",
      data_movimento: "2024-10-16",
      contratto_finito: 1, // ✅ Permuta + acquisto conclusi
    },
    {
      cliente_id: clientiIds[13]?.id,
      modello_id: modelliIds[36]?.id,
      marca_id: marcheIds["Opel"],
      note: "Auto per neopatentato. Assicurazione inclusa nel preventivo.",
      data_movimento: "2024-09-06",
      contratto_finito: 0, // 🔴 In attesa approvazione genitori
    },
    {
      cliente_id: clientiIds[14]?.id,
      modello_id: modelliIds[48]?.id,
      marca_id: marcheIds["Nissan"],
      note: "Cliente aziendale - Richiesto preventivo flotta 5 auto",
      data_movimento: "2024-08-25",
      contratto_finito: 1, // ✅ Flotta consegnata
    },
    {
      cliente_id: clientiIds[15]?.id,
      modello_id: modelliIds[56]?.id,
      marca_id: marcheIds["Hyundai"],
      note: null,
      data_movimento: "2024-08-21",
      contratto_finito: 0,
    },
    {
      cliente_id: clientiIds[16]?.id,
      modello_id: modelliIds[60]?.id,
      marca_id: marcheIds["Kia"],
      note: null,
      data_movimento: "2024-07-13",
      contratto_finito: 1, // ✅
    },
    {
      cliente_id: clientiIds[17]?.id,
      modello_id: modelliIds[68]?.id,
      marca_id: marcheIds["Skoda"],
      note: "Preventivo valido fino al 30/06/2024",
      data_movimento: "2024-06-19",
      contratto_finito: 0, // 🔴 Scaduto, da aggiornare
    },
    {
      cliente_id: clientiIds[18]?.id,
      modello_id: modelliIds[72]?.id,
      marca_id: marcheIds["Seat"],
      note: "Sconto promozionale -15% applicato",
      data_movimento: "2024-05-23",
      contratto_finito: 1, // ✅ Chiuso con sconto
    },
    {
      cliente_id: clientiIds[19]?.id,
      modello_id: modelliIds[44]?.id,
      marca_id: marcheIds["Volvo"],
      note: "Cliente richiede preventivo aggiornato con nuovi incentivi statali",
      data_movimento: "2024-05-01",
      contratto_finito: 0,
    },
    {
      cliente_id: clientiIds[20]?.id,
      modello_id: modelliIds[1]?.id,
      marca_id: marcheIds["Volkswagen"],
      note: "Ordine confermato e consegnato. Cliente soddisfatto.",
      data_movimento: "2024-01-10",
      contratto_finito: 1, // ✅
    },
    {
      cliente_id: clientiIds[21]?.id,
      modello_id: modelliIds[24]?.id,
      marca_id: marcheIds["Fiat"],
      note: "Preventivo annullato - Cliente ha acquistato altrove",
      data_movimento: "2024-02-14",
      contratto_finito: 0, // 🔴 Perso
    },
    {
      cliente_id: clientiIds[22]?.id,
      modello_id: null,
      marca_id: marcheIds["Toyota"],
      note: "Richiesta informazioni generiche su gamma ibrida",
      data_movimento: "2024-03-20",
      contratto_finito: 0,
    },
    {
      cliente_id: clientiIds[23]?.id,
      modello_id: modelliIds[11]?.id,
      marca_id: marcheIds["Mercedes-Benz"],
      note: "Auto elettrica con autonomia 400km. Incentivi disponibili: 6.000 EUR",
      data_movimento: "2024-11-05",
      contratto_finito: 1, // ✅ Incentivo ottenuto, venduta
    },
    {
      cliente_id: clientiIds[24]?.id,
      modello_id: modelliIds[33]?.id,
      marca_id: marcheIds["Renault"],
      note: "Cliente chiede info su punti ricarica in città e costi energia",
      data_movimento: "2024-10-18",
      contratto_finito: 0,
    },
  ];

  const ordiniIds = [];
  let countFiniti = 0, countNonFiniti = 0;

  for (const ordine of ordini) {
    if (!ordine.cliente_id) continue;

    try {
      const id = await runQuery(
        "INSERT INTO ordini (cliente_id, modello_id, marca_id, note, data_movimento, contratto_finito) VALUES (?, ?, ?, ?, ?, ?)",
        [
          ordine.cliente_id,
          ordine.modello_id,
          ordine.marca_id,
          ordine.note,
          ordine.data_movimento,
          ordine.contratto_finito,
        ]
      );
      ordiniIds.push(id);

      if (ordine.contratto_finito) countFiniti++;
      else countNonFiniti++;

      const clienteNome = clientiIds.find(c => c.id === ordine.cliente_id)?.nome || "N/A";
      const modelloNome = modelliIds.find(m => m.id === ordine.modello_id)?.nome || "N/A";
      const statoIcon = ordine.contratto_finito ? "✅" : "🔴";

      console.log(
        `  ${statoIcon} Preventivo ID ${id} | Cliente: ${clienteNome} | Modello: ${modelloNome}`
      );
    } catch (err) {
      console.error(`  ✗ Errore preventivo:`, err.message);
    }
  }

  console.log(`✓ ${ordiniIds.length} preventivi inseriti:`);
  console.log(`  ✅ Contratto finito:     ${countFiniti}`);
  console.log(`  🔴 Contratto non finito: ${countNonFiniti}`);
  return ordiniIds;
}

// ==================== FUNZIONE PRINCIPALE ====================
async function seedDatabase() {
  try {
    console.log("\n" + "=".repeat(60));
    console.log("INIZIO POPOLAMENTO DATABASE");
    console.log("=".repeat(60));

    await initTables();

    // Decommenta per partire da zero:
    // await pulisciDatabase();

    const utentiIds  = await seedUtenti();
    const marcheIds  = await seedMarche();
    const modelliIds = await seedModelli(marcheIds);
    const clientiIds = await seedClienti();
    const ordiniIds  = await seedOrdini(clientiIds, modelliIds, marcheIds);

    console.log("\n" + "=".repeat(60));
    console.log("SEED COMPLETATO CON SUCCESSO!");
    console.log("=".repeat(60));
    console.log("\nRIEPILOGO:");
    console.log(`  • Utenti:     ${utentiIds.length}`);
    console.log(`  • Marche:     ${Object.keys(marcheIds).length}`);
    console.log(`  • Modelli:    ${modelliIds.length} (tutti con marca obbligatoria)`);
    console.log(`  • Clienti:    ${clientiIds.length}`);
    console.log(`      📱 Solo cellulare: ${clientiIds.filter(c => c.num_tel && !c.email).length}`);
    console.log(`      📧 Solo email:     ${clientiIds.filter(c => !c.num_tel && c.email).length}`);
    console.log(`      📱📧 Entrambi:     ${clientiIds.filter(c => c.num_tel && c.email).length}`);
    console.log(`  • Preventivi: ${ordiniIds.length}`);
    console.log("\n✓ Database pronto all'uso!");
    console.log("⚠️  Tutti i modelli hanno una marca associata (NOT NULL)");
    console.log("✅  Il campo contratto_finito è presente in tutti i preventivi");
    console.log("=".repeat(60) + "\n");
  } catch (err) {
    console.error("\n✗ ERRORE DURANTE IL SEED:", err);
  } finally {
    db.close((err) => {
      if (err) console.error("Errore chiusura database:", err.message);
    });
  }
}

seedDatabase();