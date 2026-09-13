const express = require("express");

const router = express.Router();

//find all projects
router.get("/projects", (req, res) =>
  res.json({ message: "find all projects" }),
);

router.get("/projects/:id", (req, res) =>
  res.json({ message: "find on projects" }),
);
router.post("/projects", (req, res) => res.json({ message: "create project" }));
router.put("/projects/:id", (req, res) =>
  res.json({ message: "update project" }),
);

router.delete("/projects/:id", (req, res) =>
  res.json({ message: "project deleted" }),
);

module.exports = router;
