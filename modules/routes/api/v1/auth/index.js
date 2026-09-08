const express = require("express");
const router = express.Router();

const AuthController = require(`${config.path.controller.api}/v1/auth`);

//routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

module.exports = router;
