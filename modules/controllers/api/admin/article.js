const slugify = require("slugify");
//controller
const Controller = require(`${config.path.controller.index}/controller`);

class AdminArticleController extends Controller {
  findAll = async (req, res) => {
    res.json({ message: slugify("aritcle route controller") });
  };
  findOne = async (req, res) => {};
  create = async (req, res) => {};
  update = async (req, res) => {};
  destroy = async (req, res) => {};
}

module.exports = new AdminArticleController();
