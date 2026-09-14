const { z } = require("zod");
const mongoose = require("mongoose");
const Controller = require(`${config.path.controller.index}/controller.js`);

//transforms

const MediaTransform = require(`${config.path.transforms}/v1/media`);

class AdminProjectController extends Controller {
  findAll = async (req, res) => {
    try {
      let projects = await this.models.Project.find().populate([
        { path: "user", select: "avatar email name", populate: "avatar" },
        { path: "cover" },
      ]);

      res.json({
        success: true,
        data: projects.map((project) => {
          return {
            ...project.toJSON(),
            cover: MediaTransform.transform(project.cover),
            user: {
              ...project.user.toJSON(),
              avatar: MediaTransform.transform(project.user.avatar),
            },
          };
        }),
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  findOne = async (req, res) => {
    try {
      const { id: projectId } = z
        .object({
          id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            error: "invalid projectId",
          }),
        })
        .parse(req.params);

      const project = await this.models.Project.findById(projectId).populate([
        { path: "user", select: "avatar name email", populate: "avatar" },
        { path: "cover" },
      ]);

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Not found any project",
        });
      }

      res.json({
        success: true,
        data: {
          ...project.toJSON(),
          cover: MediaTransform.transform(project.cover),
          user: {
            ...project.user.toJSON(),
            avatar: MediaTransform.transform(project.user.avatar),
          },
        },
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  create = async (req, res) => {
    try {
      const validatedBody = this.validations.project.create.parse(req.body);

      const { user_id, slug, cover, ...rest } = validatedBody;

      //check for user exist or not
      const isUserExist = await this.models.User.findById(user_id);

      if (!isUserExist) {
        return res.status(404).json({
          success: false,
          message: "userId is invalid",
        });
      }

      //check is slug used before
      const projects = await this.models.Project.find({ slug });

      if (Array.isArray(projects) && projects.length > 0) {
        return res.status(400).json({
          success: false,
          message: "slug is used before",
        });
      }

      //check for cover existance
      const imagesError = await this.validateImages([cover]);
      if (imagesError) {
        return res.status(imagesError.status).json({
          message: imagesError.message,
        });
      }

      //create project
      const savedProject = await this.models.Project.create({
        ...rest,
        slug,
        cover,
        user: user_id,
      });

      //update user projects field
      await this.models.User.findByIdAndUpdate(
        { _id: user_id },
        {
          $addToSet: {
            projects: savedProject._id,
          },
        },
      );
      //doing population
      await savedProject.populate([
        { path: "user", select: "avatar email name" },
        { path: "cover" },
      ]);

      res.json({
        success: true,
        // data: savedProject,
        data: {
          ...savedProject.toJSON(),
          cover: MediaTransform.transform(savedProject.cover),
        },
      });
      // const result  = this.
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  update = async (req, res) => {
    try {
      const { id: projectId } = z
        .object({
          id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            error: "invalid projectId",
          }),
        })
        .parse(req.params);

      const validationRes = this.validations.project.update.parse(req.body);

      //check entire project existence
      const currentProject = await this.models.Project.findById(projectId);
      if (!currentProject) {
        return res.status(404).json({
          success: false,
          message: "not found any project,check project id",
        });
      }

      const { user_id, ...projectData } = validationRes;

      if (user_id) {
        const isUserExist = await this.models.User.findById(user_id);
        if (!isUserExist) {
          return res.status(404).json({
            success: false,
            message: "userId is invalid",
          });
        }

        //remove entire project from prev user
        await this.models.User.findByIdAndUpdate(currentProject.user, {
          $pull: {
            projects: currentProject._id,
          },
        });

        //add project o new user
        await this.models.User.findByIdAndUpdate(user_id, {
          $addToSet: {
            projects: currentProject._id,
          },
        });
      }

      //update project now
      const updatedProject = await this.models.Project.findByIdAndUpdate(
        projectId,
        {
          $set: projectData,
        },
      ).populate([
        { path: "user", select: "avatar email name", populate: "avatar" },
        { path: "cover" },
      ]);

      res.json({
        success: true,
        data: {
          ...updatedProject.toJSON(),
          user: {
            ...updatedProject.user.toJSON(),
            avatar: MediaTransform.transform(updatedProject.user.avatar),
          },
          cover: MediaTransform.transform(updatedProject.cover),
        },
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  destroy = async (req, res) => {
    try {
      const { id: projectId } = z
        .object({
          id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            error: "invalid projectId",
          }),
        })
        .parse(req.params);

      //check project existence
      const currentProject = await this.models.Project.findById(projectId);
      if (!currentProject) {
        return res.status(404).json({
          success: false,
          message: "not found any project,check project id",
        });
      }

      //delete current project
      await this.models.Project.findByIdAndDelete(projectId);

      //remove project from user that assign on it
      await this.models.User.updateMany(
        {
          projects: currentProject._id,
        },
        {
          $pull: {
            projects: currentProject._id,
          },
        },
      );

      res.json({ success: true, message: "successfully deleted" });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
}

module.exports = new AdminProjectController();
