const { z } = require("zod");
const mongoose = require("mongoose");

const createCourseSchema = z.object({
  user_id: z.string().refine(
    (val) => {
      return mongoose.Types.ObjectId.isValid(val);
    },
    {
      error: "user_id is invalid",
    },
  ),
  title: z.string().min(3),
  body: z.string().min(10),
  price: z.string(),
  images: z
    .array(
      z.string().refine(
        (val) => {
          return mongoose.Types.ObjectId.isValid(val);
        },
        { message: "imageId is invalid" },
      ),
    )
    .default([]),
  episodes: z
    .array(
      z.string().refine(
        (val) => {
          return mongoose.Types.ObjectId.isValid(val);
        },
        { message: "imageId is invalid" },
      ),
    )
    .default([]),
});

const updateCourseSchema = createCourseSchema.partial();

module.exports = {
  create: createCourseSchema,
  update: updateCourseSchema,
};
