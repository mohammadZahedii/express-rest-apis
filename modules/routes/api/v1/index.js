const express = require("express");
const router = express.Router();

//routes
const courseRoutes = require("./courses");
const authRoutes = require("./auth");
const userRoutes = require("./user");
const uploadRoute = require("./upload");
const projectRoutes = require("./projects");

router.use("/v1/courses", courseRoutes);
router.use("/v1/auth", authRoutes);
router.use("/v1/user", userRoutes);
router.use("/v1/upload", uploadRoute);
router.use("/v1/projects", projectRoutes);

module.exports = router;
