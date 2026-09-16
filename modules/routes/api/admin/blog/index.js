const express = require("express");
const router = express.Router();

//controller

const { api: apiController } = config.path.controller;

//TODO:
router.get("/blog", () => {});
router.get(`/blog/:id`, () => {});
router.post(`/blog`, () => {});
router.put(`/blog/:id`, () => {});
router.delete(`/blog/:id`, () => {});

module.exports = router;
