const s = require("../services/authService");
module.exports = {
  async login(req, res) { res.json(await s.login(req.body.nome, req.body.password)); },
};
