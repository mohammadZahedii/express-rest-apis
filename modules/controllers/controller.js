const { z } = require("zod");

//Models
const Course = require(`${config.path.models}/Course`);
const Episode = require(`${config.path.models}/Episode`);
const User = require(`${config.path.models}/User`);
const Media = require(`${config.path.models}/Media`);
const Role = require(`${config.path.models}/Role`);

//Validations
//course
const courseValidation = require(`${config.path.validations}/course`);
//episode
const episodeValidation = require(`${config.path.validations}/episode`);
//user
const userValidation = require(`${config.path.validations}/user`);
//role
const roleValidation = require(`${config.path.validations}/role`);
//media
const mediaValidation = require(`${config.path.validations}/media`);
//project
const projectValidation = require(`${config.path.validations}/media`);

class Controller {
  constructor() {
    this.models = { Course, Episode, User, Media, Role };
    this.validations = {
      courseValidation,
      episode: episodeValidation,
      user: {
        register: userValidation.register,
        login: userValidation.login,
        update: userValidation.update,
      },
      role: {
        create: roleValidation.createRoleSchema,
        update: roleValidation.updateRoleSchema,
      },
      media: {
        single: mediaValidation.singleDeleteSchema,
        bulk: mediaValidation.bulkDeleteSchema,
      },
      course: {
        create: courseValidation.create,
        update: courseValidation.update,
      },
      project: {
        create: projectValidation.create,
        update: projectValidation.update,
      },
    };
  }
  errorHandler(error, res) {
    if (error instanceof z.ZodError) {
      return res.status(422).json({
        message: "Validation error",
        issues: error.issues.map((issue) => {
          return {
            field: issue.path[0],
            message: issue.message,
          };
        }),
      });
    } else if (error.code === 11000) {
      const errorKey = Object.keys(error?.errorResponse?.keyValue)?.[0];

      res.status(422).json({
        message: errorKey
          ? `${errorKey} is used before`
          : `information used before`,
      });
    } else {
      res.status(error?.statusCode || 500).json({ message: error.message });
    }
  }

  async validateImages(imageIds) {
    if (!imageIds?.length) return null;

    const uniqueImageIds = [...new Set(imageIds.map(String))];

    const mediaFiles = await this.models.Media.find({
      _id: { $in: uniqueImageIds },
    })
      .select("_id fileType")
      .lean();

    if (mediaFiles.length !== uniqueImageIds.length) {
      return {
        status: 404,
        message: "One or more image media not found",
      };
    }

    const hasNonImage = mediaFiles.some((media) => media.fileType !== "image");

    if (hasNonImage) {
      return {
        status: 400,
        message: "Course images must be image files",
      };
    }

    return null;
  }
}

module.exports = Controller;
