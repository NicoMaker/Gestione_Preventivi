// backend/db/init.js
const sqlite3 = require("sqlite3").verbose();
const bcrypt = require("bcrypt");
const path = require("path");
const fs = require("fs");

const DB_PATH = path.join(__dirname, "../../data/database.db");
const DB_DIR = path.dirname(DB_PATH);

// Crea la cartella data se non esiste
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
  console.log("Cartella database creata:", DB_DIR);
}

// Connessione al database SQLite
const db = new sqlite3.Database(DB_PATH, (err) => {
  if (err) {
    console.error("Errore apertura database:", err.message);
    process.exit(1);
  }
  console.log("Database SQLite connesso:", DB_PATH);
});

// Abilita le foreign keys
db.run("PRAGMA foreign_keys = ON");

// Funzione di inizializzazione
function initDatabase() {
  db.serialize(async () => {
    // ==================== TABELLA UTENTI ====================
    db.run(
      `CREATE TABLE IF NOT EXISTS utenti (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Errore creazione tabella utenti:", err.message);
        } else {
          console.log("Tabella utenti OK");

          // Crea utente admin di default
          db.get("SELECT COUNT(*) as count FROM utenti", async (err, row) => {
            if (err) {
              console.error("Errore conteggio utenti:", err.message);
              return;
            }

            if (row.count === 0) {
              const defaultUser = "Admin";
              const defaultPassword = "Admin123!";
              const hashedPassword = await bcrypt.hash(defaultPassword, 10);

              db.run(
                "INSERT INTO utenti (nome, password) VALUES (?, ?)",
                [defaultUser, hashedPassword],
                (err) => {
                  if (err) {
                    console.error("Errore creazione utente di default:", err.message);
                  } else {
                    console.log(
                      `Utente di default creato: ${defaultUser} / ${defaultPassword}`
                    );
                  }
                }
              );
            }
          });
        }
      }
    );

    // ==================== TABELLA MARCHE ====================
    db.run(
      `CREATE TABLE IF NOT EXISTS marche (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Errore creazione tabella marche:", err.message);
        } else {
          console.log("Tabella marche OK");
        }
      }
    );

    // ==================== TABELLA CLIENTI (AGGIORNATA) ====================
    db.run(
      `CREATE TABLE IF NOT EXISTS clienti (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        num_tel TEXT,
        email TEXT,
        data_passaggio DATE,
        flag_ricontatto INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,
      (err) => {
        if (err) {
          console.error("Errore creazione tabella clienti:", err.message);
        } else {
          console.log("Tabella clienti OK");
          
          // Aggiungi colonne se non esistono (migrazione)
          db.run("ALTER TABLE clienti ADD COLUMN data_passaggio DATE", (err) => {
            if (err && !err.message.includes("duplicate column")) {
              console.error("Errore aggiunta data_passaggio:", err.message);
            }
          });
          
          db.run("ALTER TABLE clienti ADD COLUMN flag_ricontatto INTEGER DEFAULT 0", (err) => {
            if (err && !err.message.includes("duplicate column")) {
              console.error("Errore aggiunta flag_ricontatto:", err.message);
            }
          });
        }
      }
    );

    // ==================== TABELLA MODELLI ====================
    db.run(
      `CREATE TABLE IF NOT EXISTS modelli (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nome TEXT NOT NULL UNIQUE,
        marche_id INTEGER,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (marche_id) REFERENCES marche(id)
      )`,
      (err) => {
        if (err) {
          console.error("Errore creazione tabella modelli:", err.message);
        } else {
          console.log("Tabella modelli OK");
        }
      }
    );

    // ==================== TABELLA PREVENTIVI (EX ORDINI) ====================
    db.run(
      `CREATE TABLE IF NOT EXISTS ordini (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        data_movimento DATETIME DEFAULT CURRENT_TIMESTAMP,
        modello_id INTEGER,
        cliente_id INTEGER NOT NULL,
        marca_id INTEGER,
        note TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (modello_id) REFERENCES modelli(id),
        FOREIGN KEY (cliente_id) REFERENCES clienti(id),
        FOREIGN KEY (marca_id) REFERENCES marche(id)
      )`,
      (err) => {
        if (err) {
          console.error("Errore creazione tabella ordini:", err.message);
        } else {
          console.log("Tabella ordini OK");
        }
      }
    );
  });
}

module.exports = { db, initDatabase };