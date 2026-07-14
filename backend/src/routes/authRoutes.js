const express = require("express");
const c = require("../controllers/authController");
const { catchErrors } = require("../middleware/errorHandler");
const router = express.Router();
router.post("/login", catchErrors(c.login));
module.exports = router;
