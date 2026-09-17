const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const MongoosePaginate = require("mongoose-paginate-v2");

const ArticleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "عنوان خیلی کوتاه است (حداقل ۳ کاراکتر)"],
      maxlength: [200, "عنوان خیلی طولانی است (حداکثر ۲۰۰ کاراکتر)"],
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    body: {
      type: String,
      required: true,
    },
    cover: {
      type: Schema.Types.ObjectId,
      ref: "Media",
    },

    category: {
      type: String,
      trim: true,
      default: null,
      index: true,
    },

    tags: {
      type: [String],
      default: [],
      index: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
    },

    publishedAt: {
      type: Date,
      default: null,
    },
    images: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    author: { type: Schema.Types.ObjectId, ref: "User" },
  },
  {
    toJSON: {
      virtuals: true, // add virtual fields like id
      transform: function (doc, ret) {
        ret.id = doc._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true, //it means anytime executed toObject() method on this document
      //put virtual fields like id in final object
    },
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

ArticleSchema.plugin(MongoosePaginate);

ArticleSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "published" && !this.publishedAt) {
      this.publishedAt = new Date();
    }

    if (this.status !== "published") {
      this.publishedAt = null;
    }
  }
  next();
});

module.exports = mongoose.model("Article", ArticleSchema);
