const express = require("express");

const router = express.Router();

//Controller

const ProjectController = require(
  `${config.path.controller.api}/admin/project`,
);

//find all projects
router.get("/projects", ProjectController.findAll);
//find one project
router.get("/projects/:id", ProjectController.findOne);
//create project
router.post("/projects", ProjectController.create);
//update project
router.put("/projects/:id", ProjectController.update);
//delete project
router.delete("/projects/:id", ProjectController.destroy);

module.exports = router;
