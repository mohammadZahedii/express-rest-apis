const { z } = require("zod");
const mongoose = require("mongoose");

module.exports = z.object({
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
