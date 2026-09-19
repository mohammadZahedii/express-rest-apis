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
  tags: z
    .array(z.string().trim().min(5, "هر عنوان حداقل باید 2 کاراکتر داشته باشد"))
    .default([]),
  status: z.enum(STATUS_VALUES.article).default("published"),
  // TODO:normalize date input
  publishedAt: z.date().nullable().default(null).optional(),
  author: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      error: "authorId is invalid",
    })
    .optional(),
});

const updateArticleSchema = createArticleSchema.partial();

module.exports = {
  create: createArticleSchema,
  update: updateArticleSchema,
};
