const { z } = require("zod");
const { PERMISSIONS } = require(`${config.path.constants}`);

const validPermissions = Object.values(PERMISSIONS);

const createRoleSchema = z.object({
  key: z.string("کلید نقش الزامی است").trim().toLowerCase(),
  name: z
    .string("نام لاتین نقش الزامی است")
    .trim()
    .toLowerCase()
    .min(2, "نام نقش باید حداقل ۲ کاراکتر باشد")
    .max(50, "نام نقش نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"),
  label: z
    .string("عنوان نمایشی نقش الزامی است")
    .trim()
    .min(2, "عنوان نقش باید حداقل ۲ کاراکتر باشد")
    .max(50, "عنوان نقش نمی‌تواند بیشتر از ۵۰ کاراکتر باشد"),
  permissions: z
    .array(
      z.enum(validPermissions, {
        error: "یک یا چند دسترسی انتخاب‌شده نامعتبر است",
      }),
      { error: "لیست دسترسی‌ها باید به صورت آرایه ارسال شود" },
    )
    .default([]),
});

const updateRoleSchema = createRoleSchema.partial();

module.exports = {
  createRoleSchema,
  updateRoleSchema,
};
