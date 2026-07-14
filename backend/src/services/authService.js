// Service autenticazione
const bcrypt = require("bcrypt");
const repo = require("../repositories/utentiRepository");
const { HttpError } = require("../middleware/errorHandler");

module.exports = {
  async login(nome, password) {
    if (!nome || !password) throw new HttpError(400, "Nome e password obbligatori");
    const user = await repo.trovaPerNome(nome);
    if (!user) throw new HttpError(401, "Credenziali non valide");
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) throw new HttpError(401, "Credenziali non valide");
    return { success: true, message: "Login effettuato con successo", nome: user.nome, id: user.id };
  },
};
