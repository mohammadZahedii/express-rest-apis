const { z } = require("zod");
const mongoose = require("mongoose");

const { STATUS_VALUES } = require(`${config.path.constants}`);

const createArticleSchema = z.object({
  title: z.string(3),
  body: z.string(10),
  slug: z.string().trim(),
  cover: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    error: "mediaId is invalid",
  }),
  category: z.string().nullable().default(null),
  tags: z.array(
    s.string().trim().min(5, "هر عنوان حداقل باید 2 کاراکتر داشته باشد"),
  ),
  status: z.enum(STATUS_VALUES.article).default("published"),
  // TODO:normalize date input
  publishedAt: z.date().nullable().default(null),
  images: z
    .array(
      z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
        error: "imageId is invalid",
      }),
    )
    .default([]),
  author: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    error: "authorId is invalid",
  }),
});

const updateArticleSchema = createArticleSchema.partial();

module.exports = {
  create: createArticleSchema,
  update: updateArticleSchema,
};
