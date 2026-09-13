const express = require("express");

const router = express.Router();

router.get("/", (req, res) => res.json("get home projects"));

router.get("/:id", (req, res) => res.json("get home project id"));

module.exports = router;
