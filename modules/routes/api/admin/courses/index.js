const express = require("express");

const router = express.Router();

//Model

//Controller
const { api: apiController } = config.path.controller;

const AdminCourseController = require(`${apiController}/admin/course`);

//get as list
router.get("/courses", AdminCourseController.findAll);

//Craete new course
router.post("/courses", AdminCourseController.create);

//find one document
router.get("/courses/:id", AdminCourseController.findOne);

//update one document
router.put("/courses/:id", AdminCourseController.update);

//delete one document
router.delete("/courses/:id", AdminCourseController.destroy);

module.exports = router;
