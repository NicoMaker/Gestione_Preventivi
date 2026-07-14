const s = require("../services/utentiService");
module.exports = {
  async lista(req, res) { res.json(await s.lista()); },
  async crea(req, res) { res.json(await s.crea(req.body)); },
  async aggiorna(req, res) { res.json(await s.aggiorna(req.params.id, req.body)); },
  async elimina(req, res) { res.json(await s.elimina(req.params.id, req.query.current_user || req.body.current_user)); },
};
