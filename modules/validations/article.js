const { z } = require("zod");
const mongoose = require("mongoose");

const { STATUS_VALUES } = require(`${config.path.constants}`);

const articleBaseSchema = z.object({
  title: z.string().trim().min(3),
  body: z.string().min(10),
  slug: z.string().trim(),

  cover: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    error: "mediaId is invalid",
  }),

  category: z.string().nullable(),

  tags: z.array(
    z.string().trim().min(2, "هر عنوان حداقل باید 2 کاراکتر داشته باشد"),
  ),

  status: z.enum(STATUS_VALUES.article),

  publishedAt: z.date().nullable(),

  author: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      error: "authorId is invalid",
    })
    .optional(),
});

const createArticleSchema = articleBaseSchema.extend({
  category: articleBaseSchema.shape.category.default(null),
  tags: articleBaseSchema.shape.tags.default([]),
  status: articleBaseSchema.shape.status.default("published"),
  publishedAt: articleBaseSchema.shape.publishedAt.default(null),
});

const updateArticleSchema = articleBaseSchema.partial().extend({
  slug: z.never({ error: "اسلاگ مقاله قابل تغییر نیست" }).optional(),
  publishedAt: z
    .never({ error: "زمان انتشار مقاله قابل تغییر نیست" })
    .optional(),
});

module.exports = {
  create: createArticleSchema,
  update: updateArticleSchema,
};
