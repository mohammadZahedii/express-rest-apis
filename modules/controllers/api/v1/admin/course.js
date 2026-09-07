const Controller = require(`${config.path.controller.index}/controller.js`);

//Transforms
const CourseTransform = require(`${config.path.transforms}/v1/course`);

class AdminCourseController extends Controller {
  constructor() {
    super();
    this.findAll = this.findAll.bind(this);
    this.findOne = this.findOne.bind(this);
    this.create = this.create.bind(this);
    this.update = this.update.bind(this);
    this.destroy = this.destroy.bind(this);
  }

  async findAll(req, res) {
    try {
      let courses = await this.models.Course.paginate(
        {},
        {
          page: req?.query?.page || 1,
          limit: req?.query?.limit || 1,
          populate: [
            { path: "user", select: "avatar name email" },
            { path: "images" },
            {
              path: "episodes",
              select: "-course",
            },
          ],
        },
      );

      res.json({ ...CourseTransform.withPaginate(courses) });
    } catch (err) {
      console.log(err, "ERRORR");
      res.status(500).json({ message: "Database error" });
    }
  }

  async findOne(req, res) {
    try {
      const paramId = req.params.id;
      if (!paramId) {
        return res.status(404).json({
          message: "Not found any course",
        });
      }
      const course = await this.models.Course.findById(req.params.id)
        .populate("episodes")
        .populate("images");
      res.json({
        message: "Success",
        data: course,
      });
    } catch (error) {
      throw error;
    }
  }

  async create(req, res) {
    try {
      const userExists = await this.models.User.findById(req.body.user_id);

      console.log(userExists, "USEREXISTS");
      if (!userExists) {
        return res.status(404).json({
          success: false,
          message: "user_id is invalid",
        });
      }

      //Validation
      const validationData = this.validations.courseValidation.create.parse(
        req.body,
      );
      //check all images exist in media collection and are images
      const imagesError = await this.validateImages(validationData.images);
      if (imagesError) {
        return res.status(imagesError.status).json({
          message: imagesError.message,
        });
      }

      const { user_id, ...courseData } = validationData;

      let savedCourse = await this.models.Course.create({
        ...courseData,
        user: user_id,
      });

      await savedCourse.populate([
        "images",
        "episodes",
        { path: "user", populate: "roles" },
      ]);

      return res.status(201).json({
        message: "Course created",
        data: CourseTransform.withEpisodes().withUser().transform(savedCourse),
      });
    } catch (error) {
      console.error(error, "ERROR");
      this.errorHandler(error, res);
    }
  }
  async update(req, res) {
    try {
      //Validation
      const validationData = this.validations.courseValidation.parse(req.body);
      //check all images exist in media collection and are images
      const imagesError = await this.validateImages(validationData.images);
      if (imagesError) {
        return res.status(imagesError.status).json({
          message: imagesError.message,
        });
      }

      const updatedCourse = await this.models.Course.findByIdAndUpdate(
        req.params.id,
        validationData,
        {
          new: true,
          runValidators: false,
        },
      )
        .populate("images")
        .populate("episodes");

      res.json({
        data: CourseTransform.withEpisodes().transform(updatedCourse),
      });
    } catch (error) {
      console.error(error, "ERROR");
      this.errorHandler(error, res);
    }
  }

  async destroy(req, res) {
    try {
      const paramId = req.params.id;

      if (!paramId) {
        return res.status(404).json({
          message: "Not found any course",
        });
      }

      const findedCourse = await this.models.Course.findByIdAndDelete(paramId);

      res.json({ message: "successfully deleted", data: findedCourse });
    } catch (error) {
      throw error;
    }
  }
}

const controller = new AdminCourseController();

module.exports = controller;
