// Service utenti: validazione password, unicità, ultimo utente, force logout
const bcrypt = require("bcrypt");
const repo = require("../repositories/utentiRepository");
const realtime = require("../realtime/socket");
const { HttpError } = require("../middleware/errorHandler");

function isPasswordStrong(password) {
  return typeof password === "string" && /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(password);
}

module.exports = {
  lista() { return repo.lista(); },

  async crea({ nome, password }) {
    if (!nome || !password) throw new HttpError(400, "Nome e password obbligatori");
    if (nome.length < 3) throw new HttpError(400, "Il nome deve contenere almeno 3 caratteri.");
    if (!isPasswordStrong(password))
      throw new HttpError(400, "La password deve contenere almeno 8 caratteri, una maiuscola, una minuscola e un numero.");

    const hashedPassword = await bcrypt.hash(password, 10);
    let result;
    try { result = await repo.crea(nome.trim(), hashedPassword); }
    catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(400, "Nome già esistente");
      throw new HttpError(500, "Errore durante la creazione utente");
    }
    realtime.emit("utente_aggiunto");
    realtime.emit("utenti_aggiornati");
    return { id: result.lastID, nome: nome.trim() };
  },

  async aggiorna(id, { nome, password, current_user }) {
    if (!nome && !password) throw new HttpError(400, "Nome o Password obbligatori");
    const user = await repo.trovaPerId(id);
    if (!user) throw new HttpError(404, "Utente non trovato");

    if (nome && nome.length < 3) throw new HttpError(400, "Il nome deve contenere almeno 3 caratteri.");

    const isCurrentUser = user.nome === current_user;
    const newNome = nome ? nome.trim() : user.nome;
    let newPasswordHash = user.password;

    if (password && password.trim() !== "") {
      if (!isPasswordStrong(password))
        throw new HttpError(400, "La nuova password non rispetta i requisiti (8 car., 1 maiuscola, 1 minuscola, 1 numero).");
      newPasswordHash = await bcrypt.hash(password, 10);
    }

    let result;
    try { result = await repo.aggiorna(id, newNome, newPasswordHash); }
    catch (err) {
      if (String(err.message).includes("UNIQUE")) throw new HttpError(400, "Nome già esistente");
      throw new HttpError(500, "Errore durante l'aggiornamento utente");
    }
    if (result.changes === 0) throw new HttpError(404, "Utente non trovato");

    realtime.emit("utente_modificato", { id, oldNome: user.nome, newNome });
    realtime.emit("utenti_aggiornati");

    // Force logout dell'utente modificato (credenziali cambiate)
    realtime.forceLogoutUser(Number(id), "account_updated");

    return { id, nome: newNome, utente_modificato: isCurrentUser };
  },

  async elimina(id, currentUser) {
    if ((await repo.conta()) <= 1) throw new HttpError(400, "Non puoi eliminare l'unico utente rimasto");
    const user = await repo.trovaPerId(id);
    if (!user) throw new HttpError(404, "Utente non trovato");

    const isCurrentUser = user.nome === currentUser;
    const result = await repo.elimina(id);
    if (result.changes === 0) throw new HttpError(404, "Utente non trovato");

    realtime.emit("utente_eliminato", { id, nome: user.nome });
    realtime.emit("utenti_aggiornati");
    realtime.forceLogoutUser(Number(id), "account_deleted");

    return { success: true, id, utente_eliminato: isCurrentUser };
  },
};
