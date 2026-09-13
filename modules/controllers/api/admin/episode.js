const { z } = require("zod");
const mongoose = require("mongoose");

const Controller = require("./../../controller");

class AdminEpisodeController extends Controller {
  findAll = async (req, res) => {
    try {
      const episodes = await this.models.Episode.find().populate({
        path: "course",
        select: "-episodes", // to remove episodes from course
        populate: {
          path: "user",
          select: "name avatar email",
        },
      });

      res.json({
        data: episodes,
        success: true,
      });
    } catch (error) {
      this.errorHandler(error);
    }
  };
  findOne = async (req, res) => {
    try {
      //add validation for episodeId too check is correct or not
      const { id: episodeId } = z
        .object({
          id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid episode id",
          }),
        })
        .parse(req.params);

      const episode = await this.models.Episode.findById(episodeId).populate({
        path: "course",
        select: "-episodes",
        populate: {
          path: "user",
          select: "name avatar email",
        },
      });

      if (!episode) {
        return res.status(404).json({
          message: "Episode not found",
          success: false,
        });
      }

      res.json({
        data: episode,
        success: true,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  create = async (req, res) => {
    const { episode: validationSchema } = this.validations;

    try {
      // Validate the request body using the validation schema
      const result = validationSchema.parse(req.body);

      const courseId = result.course_id;

      //check that the course exists
      const course = await this.models.Course.findById(courseId);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
          success: false,
        });
      }

      const episode = await this.models.Episode.create({
        course: courseId,
        title: result.title,
        body: result.body,
        video_url: result.video_url,
        number: result.number,
        video_count: result.video_count,
        comment_count: result.comment_count,
      });

      await this.models.Course.findByIdAndUpdate(courseId, {
        $push: { episodes: episode._id },
      });

      const newEpisode = await this.models.Episode.findById(
        episode._id,
      ).populate("course");

      res.json({
        data: newEpisode,
        success: true,
      });
    } catch (error) {
      console.log(error);
      this.errorHandler(error, res);
    }
  };
  update = async (req, res) => {
    const { episode: validationSchema } = this.validations;

    const episodeId = req.params.id;

    try {
      //validation

      const result = validationSchema.parse(req.body);

      //check episode exists or not

      const episode = await this.models.Episode.findById(episodeId);

      if (!episode) {
        return res.status(404).json({
          message: "Course not found",
          success: false,
        });
      }

      //check that the course exists
      const course = await this.models.Course.findById(result.course_id);

      if (!course) {
        return res.status(404).json({
          message: "Course not found",
          success: false,
        });
      }

      const newEpisode = await this.models.Episode.findByIdAndUpdate(
        req.params.id,
        {
          course: result.course_id,
          title: result.title,
          body: result.body,
          video_url: result.video_url,
          number: result.number,
          video_count: result.video_count,
          comment_count: result.comment_count,
        },
        {
          new: true,
          runValidator: false,
        },
      ).populate("course");

      res.json({
        data: newEpisode,
        success: true,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  destroy = async (req, res) => {
    try {
      const { id: episodeId } = z
        .object({
          id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid episode id",
          }),
        })
        .parse(req.params);

      const episode =
        await this.models.Episode.findById(episodeId).populate("course");

      if (!episode) {
        return res.status(404).json({
          success: false,
          message: "Episode not found",
        });
      }

      await this.models.Course.findByIdAndUpdate(episode.course._id, {
        $pull: {
          episodes: episode._id,
        },
      });

      await episode.deleteOne();

      res.json({
        success: true,
        message: "Episode deleted successfully",
        data: episode,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
}

module.exports = new AdminEpisodeController();
