const { it } = require("zod/locales");
const Transform = require("../../transform");
const CourseTransform = require(`${config.path.transforms}/v1/course`);

const MediaTransform = require("../media");

const jwt = require("jsonwebtoken");

class UserTransform extends Transform {
  transform = (item, createToken = false) => {
    this.createToken = createToken;

    return {
      id: item?._id || item?.id,
      name: item.name,
      email: item.email,
      avatar: this.transformAvatar(item.avatar),
      roles: item.roles || [],
      courses: item?.courses || [],
      ...this.withToken(item),
    };
  };

  transformAvatar = (avatar) => {
    if (!avatar) return null;

    //if avatar is populated (media document) transform it,
    //otherwise it is just an ObjectId so return it as is
    if (typeof avatar === "object" && avatar.path) {
      return MediaTransform.transform(avatar);
    }

    return avatar;
  };

  withToken = (item) => {
    if (item?.token?.accessToken && item?.token?.refreshToken) {
      return {
        token: {
          accessToken: item.token.accessToken,
          refreshToken: item.token.refreshToken,
        },
      };
    }

    if (this.createToken) {
      //we have two scret key for more security for accessToken and refreshToken
      const accessSecretKey = global.config.secret.accessToken;
      const refreshSecretKey = global.config.secret.refreshToken;

      const payload = { user_id: item._id };

      //create accessToken for short term token (e.g 30 minutes)
      const accessToken = jwt.sign(payload, accessSecretKey, {
        expiresIn: "2h",
      });

      //create refreshToken for long term token (e.g 7 days)
      const refreshToken = jwt.sign(payload, refreshSecretKey, {
        expiresIn: "7d",
      });

      return {
        token: {
          accessToken,
          refreshToken,
        },
      };
    }

    return {};
  };
}

module.exports = new UserTransform();
