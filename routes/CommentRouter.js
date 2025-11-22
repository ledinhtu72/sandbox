const express = require("express");
const router = express.Router();

// Minimal placeholder router to avoid missing require in index.js
router.get("/", (req, res) => {
  res.status(200).send({ message: "Comment router placeholder" });
});

module.exports = router;
