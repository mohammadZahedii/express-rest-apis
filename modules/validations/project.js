const { z } = require("zod");
const mongoose = require("mongoose");

const { STATUS_VALUES } = require(`${config.path.constants}`);

const createProjectSchema = z.object({
  user_id: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    error: "user_id is invalid",
  }),
  slug: z.string().min("5"),
  title: z.string().min(3),
  description: z.string().min(10),
  cover: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val)),
  techs: z.array(
    z.string().trim().min(2, "هر عنوان حداقل باید 2 کاراکتر داشته باشد"),
  ),
  status: z.enum(STATUS_VALUES.project).default("completed"),
});

const updateProjectSchema = createProjectSchema.partial();

module.exports = {
  create: createProjectSchema,
  update: updateProjectSchema,
};
