const mongoose = require("mongoose");

const CourseTransform = require("../../../../transforms/v1/course");
const Controller = require("../../../controller");

class HomeCourseController extends Controller {
  findAll = async (req, res) => {
    const { user_id: userId } = req.query;
    let queries = {};
    try {
      if (userId) {
        if (!mongoose.Types.ObjectId.isValid(userId)) {
          return res.status(400).json({
            success: false,
            message: "user id format is invalid",
          });
        }
        const userExists = await this.models.User.exists({ _id: userId });

        if (!userExists) {
          return res.status(404).json({
            success: false,
            message: "Not found user",
          });
        }

        queries["user"] = userId;
      }

      const courses = await this.models.Course.find(queries)
        .populate("user", "name avatar")
        .populate("images")
        .populate("episodes", "title body price video_url");

      res.json({
        data: courses,
        success: true,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  findOne = async (req, res) => {
    try {
      const paramId = req.params.id;

      if (!paramId) {
        return res.status(404).json({
          message: "Not found any course",
        });
      }

      const course = await this.models.Course.findById(req.params.id)
        .populate("user", "avatar name")
        .populate("images")
        .populate("episodes", "title body price video_url");

      res.json({
        data: course,
        success: true,
      });
    } catch (error) {
      this.errorHandler(error);
    }
  };
}

module.exports = new HomeCourseController();
