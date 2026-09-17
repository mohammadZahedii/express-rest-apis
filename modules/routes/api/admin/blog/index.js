const express = require("express");
const router = express.Router();

//controller
const { api: apiController } = config.path.controller.api;
const AdminArticleController = require(`${apiController}/admin/article`);

//middlewares
const AuthMiddleware = require(`${config.path.middlewares}`);

//TODO:
router.get("/blog", AuthMiddleware, AdminArticleController.findAll);
router.get(`/blog/:id`, AuthMiddleware, AdminArticleController.findOne);
router.post(`/blog`, AuthMiddleware, AdminArticleController.create);
router.put(`/blog/:id`, AuthMiddleware, AdminArticleController.update);
router.delete(`/blog/:id`, AuthMiddleware, AdminArticleController.destroy);

module.exports = router;
