const express = require("express");

const router = express.Router();

//Controller
const { api: apiController } = config.path.controller;

const AdminEpisodeController = require(`${apiController}/admin/episode`);

//get as list
router.get("/episodes", AdminEpisodeController.findAll);

//Craete new episode
router.post("/episodes", AdminEpisodeController.create);

//find one document
router.get("/episodes/:id", AdminEpisodeController.findOne);

//update one document
router.put("/episodes/:id", AdminEpisodeController.update);

//delete one document
router.delete("/episodes/:id", AdminEpisodeController.destroy);

module.exports = router;
