const express = require("express");
const adminRouter = express.Router();

//routes
const coursesRouter = require("./courses");
const episodesRouter = require("./episodes");
const rolesRouter = require("./roles");
const projectsRouter = require("./projects");
const blogRouter = require("./blog");

//middlewares
const authMiddleware = require(`${config.path.middlewares}/authenticate`);
const permissionMiddleware = require(`${config.path.middlewares}/permissions`);

//constant
const { PERMISSIONS } = require(`${config.path.constants}`);

adminRouter.use(
  "/admin",
  authMiddleware,
  // permissionMiddleware(PERMISSIONS.SUPER_ADMIN),
  rolesRouter,
);
adminRouter.use("/admin", authMiddleware, coursesRouter);
adminRouter.use("/admin", authMiddleware, episodesRouter);
adminRouter.use("/admin", authMiddleware, projectsRouter);
adminRouter.use("/admin", authMiddleware, blogRouter);

module.exports = adminRouter;
