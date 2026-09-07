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

      //first create the course and then add the user to the
      // course's users array and add the course to the user's courses array
      let savedCourse = await this.models.Course.create({
        ...courseData,
        users: [user_id],
      });

      await this.models.User.findByIdAndUpdate(
        req.body.user_id,
        {
          $addToSet: {
            courses: savedCourse._id,
          },
        },
        {
          runValidators: true,
        },
      );

      await savedCourse.populate([
        { path: "images" },
        { path: "episodes" },
        {
          path: "users",
          populate: [
            { path: "roles" },
            { path: "courses", select: "title body price id" },
          ],
        },
      ]);

      return res.status(201).json({
        message: "Course created",
        data: CourseTransform.withEpisodes().withUsers().transform(savedCourse),
      });
    } catch (error) {
      console.error(error, "ERROR");
      this.errorHandler(error, res);
    }
  }

  async update(req, res) {
    const userId = req?.body?.user_id;

    try {
      //Validation
      const validationData = this.validations.courseValidation.update.parse(
        req.body,
      );
      //check all images exist in media collection and are images
      const imagesError = await this.validateImages(validationData.images);
      if (imagesError) {
        return res.status(imagesError.status).json({
          message: imagesError.message,
        });
      }

      //update courses on user model
      if (userId) {
        await this.models.User.findByIdAndUpdate(userId, {
          $addToSet: { courses: req.params.id },
        });
      }

      const updateQuery = {
        $set: courseData,
      };

      if (userId) {
        updateQuery.$addToSet = {
          users: userId,
        };
      }

      const updatedCourse = await this.models.Course.findByIdAndUpdate(
        req.params.id,
        updateQuery,
        {
          new: true,
          runValidators: false,
        },
      )
        .populate("images")
        .populate("episodes")
        .populate({
          path: "users",
          populate: [{ path: "courses", select: "title body price id" }],
        });

      await res.json({
        success: true,
        data: CourseTransform.withEpisodes()
          .withUsers()
          .transform(updatedCourse),
      });
    } catch (error) {
      console.error(error, "ERROR");
      this.errorHandler(error, res);
    }
  }

  async destroy(req, res) {
    try {
      const courseId = req.params.id;

      if (!courseId) {
        return res.status(404).json({
          message: "Not found any course",
        });
      }

      const findedCourse = await this.models.Course.findByIdAndDelete(
        courseId,
      ).select("-users -episodes -images");

      await this.models.User.updateMany(
        {
          courses: findedCourse._id,
        },
        {
          $pull: {
            courses: findedCourse._id,
          },
        },
      );

      res.json({
        success: true,
        message: "successfully deleted",
        data: findedCourse,
      });
    } catch (error) {
      throw error;
    }
  }
}

const controller = new AdminCourseController();

module.exports = controller;
