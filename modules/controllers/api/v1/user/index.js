//controllers
const Controller = require("../../../controller");

//transformers
const UserTransform = require("./../../../../transforms/v1/user");

const { deletedUselessFiles } = require(`${config.path.middlewares}/upload`);

class UserController extends Controller {
  profile = async (req, res) => {
    return res.json({
      success: true,
      data: UserTransform.transform(req.user),
    });
  };
  update = async (req, res) => {
    const userId = req.user.id;

    try {
      const validationResult = this.validations.user.update().parse(req.body);
      const userData = await this.models.User.findById(userId);

      if (!userData) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      const { roleIds, ...userFields } = validationResult;

      const updateQueries = {
        $set: userFields,
      };

      if (roleIds !== undefined) {
        const validRolesCount = await this.models.Role.countDocuments({
          _id: { $in: roleIds },
        });

        if (validRolesCount !== roleIds.length) {
          return res.status(400).json({
            success: false,
            message: "One or more role Ids are invalid",
          });
        }
        updateQueries.$set.roles = roleIds;
      }

      //if we had avatar in request body
      const newAvatarId = userFields?.avatar;
      let oldMediaIdToDelete = null;

      if (newAvatarId) {
        const avatarMedia = await this.models.Media.findById(newAvatarId);

        //check avatar media exists in media collection
        if (!avatarMedia) {
          return res.status(404).json({
            success: false,
            message: "Avatar media not found",
          });
        }

        //avatar must always be an image
        if (avatarMedia.fileType !== "image") {
          return res.status(400).json({
            success: false,
            message: "Avatar must be an image file",
          });
        }
      }

      //check we uploaded avatar before
      if (
        newAvatarId &&
        userData?.avatar &&
        newAvatarId !== userData.avatar.toString()
      ) {
        oldMediaIdToDelete = userData.avatar;
      }

      //update user data
      const updatedUser = await this.models.User.findByIdAndUpdate(
        userId,
        updateQueries,
        {
          new: true,
          runValidators: true,
        },
      )
        .populate("avatar")
        .populate("roles");

      //delete old avatar if we had one
      if (oldMediaIdToDelete) {
        const mediaFile =
          await this.models.Media.findByIdAndDelete(oldMediaIdToDelete);

        //remove media file from storage and db
        if (mediaFile) {
          await this.models.Media.findByIdAndDelete(oldMediaIdToDelete);
          deletedUselessFiles(mediaFile);
        }
      }

      res.json({
        success: true,
        message: "User updated successfully",
        data: UserTransform.transform(updatedUser),
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
}

module.exports = new UserController();
