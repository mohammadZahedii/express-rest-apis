const Controller = require("../../../controller");
const UserTransform = require("./../../../../transforms/v1/user");
const { ROLE_KEYS } = require(`${config.path.constants}`);
const jwt = require("jsonwebtoken");

class AuthController extends Controller {
  register = async (req, res) => {
    try {
      //validation
      const result = this.validations.user.register().parse(req.body);

      //check user is exist or not
      const user = await this.models.User.findOne({
        $or: [{ name: result.name }, { email: result.email }],
      });

      if (user) {
        return res.status(422).json({
          success: false,
          message: "User already exists",
        });
      }

      const baseRole = await this.models.Role.findOne({ key: ROLE_KEYS.USER });

      const createdUser = await this.models.User.create({
        name: result.name,
        email: result.email,
        password: result.password,
        roles: [baseRole._id],
      });

      const userData = await this.models.User.findById(
        createdUser._id,
      ).populate("roles");

      //transform user data with user transform and force it by 'true' to create token
      const transformedUser = UserTransform.transform(userData, true);

      //store refresh token in db
      userData.refreshToken.push({
        token: transformedUser.token.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 6 * 6 * 1000),
      });

      await userData.save();

      //201 means new resource created
      res.status(201).json({
        success: true,
        message: "you registered successfully",
        data: transformedUser,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  login = async (req, res) => {
    try {
      //validation
      const result = this.validations.user.login().parse(req.body);

      //check user existence from database
      const user = await this.models.User.findOne({
        email: result.email,
      }).populate("roles");

      if (user === null) {
        return res.status(422).json({
          success: false,
          message: "اطلاعات وارد شده صحیح نیست",
        });
      }

      //check for user is admin or not for login

      let isUserAdmin = false;
      const roles = user?.roles || [];
      roles.forEach((role) => {
        if (role.key === ROLE_KEYS.ADMIN) {
          isUserAdmin = true;
        }
      });

      if (!isUserAdmin) {
        return res.status(403).json({
          success: false,
          message: "you dont have permission",
        });
      }

      //check that password entered correctly or not
      //comparePassword() method define on userSchema and we access on it
      //as instance of user model methods after we find it from db
      const isPasswordCorrect = await user.comparePassword(result.password);

      if (!isPasswordCorrect) {
        return res.status(422).json({
          success: false,
          message: "incorrect password",
        });
      }

      //true means we should create token
      const transformedUser = UserTransform.transform(user, true);

      //remove before expires tokens to not being crowded db
      user.refreshToken = user.refreshToken.filter(
        (t) => t.expiresAt > new Date(),
      );

      user.refreshToken.push({
        token: transformedUser.token.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await user.save();

      res.json({
        success: true,
        message: "ورود شما با موفقیت انجام شد",
        data: transformedUser,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  //new method for refreshToken
  refresh = async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token is required",
        });
      }

      //verify authentication of token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, global.config.secret.refreshToken);
      } catch (error) {
        return res.status(401).json({
          success: false,
          message: "Session expired or invalid token",
        });
      }

      //find user and check existence user based on refresh token and userId
      const user = await this.models.User.findOne({
        _id: decoded.user_id,
        refreshToken: {
          $elemMatch: {
            token: refreshToken,
            expiresAt: { $lte: new Date() },
          },
        },
      });

      if (!user) {
        return res
          .status(401)
          .json({ succss: false, message: "Invalid token or token expired" });
      }

      //create new accessToken

      const newAccessToken = jwt.sign(
        { user_id: user._id },
        global.config.secret.accessToken,
        { expiresIn: "2h" },
      );

      //for more safety create (Rotate) our refresh token to have more age on it
      const newRefreshToken = jwt.sign(
        { user_id: user._id },
        global.config.secret.refreshToken,
        { expiresIn: "7d" },
      );

      //update new refresh token in db
      user.refreshToken = user.refreshToken.filter((session) => {
        return session.token !== refreshToken && session.expiresAt > new Date();
      });

      user.refreshToken.push({
        token: newRefreshToken,
        expiresIn: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      await user.save();

      return res.json({
        success: true,
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
}

module.exports = new AuthController();
