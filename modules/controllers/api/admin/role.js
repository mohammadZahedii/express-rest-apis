const { z } = require("zod");

const mongoose = require("mongoose");

const Controller = require("../../controller");

class AdminRoleController extends Controller {
  findAll = async (req, res) => {
    try {
      const roles = await this.models.Role.find();
      res.json({
        data: roles,
        success: true,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  findOne = async (req, res) => {
    try {
      const { id: roleId } = z
        .object({
          id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
            message: "Invalid role id",
          }),
        })
        .parse(req.params);

      const role = await this.models.Role.findById(roleId);
      res.json({
        success: true,
        data: role,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  create = async (req, res) => {
    try {
      //validation
      const validationResult = this.validations.role.create.parse(req.body);
      const newRole = await this.models.Role.create(validationResult);
      res.json({
        success: true,
        data: newRole,
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  update = async (req, res) => {
    const { id: roleId } = z
      .object({
        id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: "Invalid role id",
        }),
      })
      .parse(req.params);

    try {
      const validationResult = this.validations.role.update.parse(req.body);

      const updatedRole = await this.models.Role.findByIdAndUpdate(
        roleId,
        validationResult,
        { new: true, runValidators: true },
      );

      res.json({ success: true, data: updatedRole });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  destroy = async (req, res) => {
    const { id: roleId } = z
      .object({
        id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
          message: "Invalid role id",
        }),
      })
      .parse(req.params);

    try {
      const roleData = await this.models.Role.findByIdAndDelete(roleId);

      res.json({ success: true, data: roleData });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
}

module.exports = new AdminRoleController();
