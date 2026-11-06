// Errori HTTP e gestione centralizzata (risposte JSON { error })
class HttpError extends Error {
  constructor(status, message, extra = {}) {
    super(message);
    this.status = status;
    this.extra = extra;
  }
}
function catchErrors(handler) {
  return async (req, res, next) => {
    try { await handler(req, res, next); } catch (err) { next(err); }
  };
}
function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...err.extra });
  }
  console.error("Errore non gestito:", err);
  res.status(500).json({ error: err.message || "Errore del server" });
}
module.exports = { HttpError, catchErrors, errorHandler };
