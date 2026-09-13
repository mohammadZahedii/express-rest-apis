const express = require("express");
const router = express.Router();

const AdminRoleController = require(`${config.path.controller.api}/admin/role`);

//get all roles
router.get("/roles", AdminRoleController.findAll);

//create new role
router.post("/roles", AdminRoleController.create);

//find specific role
router.get("/roles/:id", AdminRoleController.findOne);

//update specific role
router.put("/roles/:id", AdminRoleController.update);

//remove specific role
router.delete("/roles/:id", AdminRoleController.destroy);

module.exports = router;
