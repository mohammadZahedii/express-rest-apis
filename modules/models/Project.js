const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MongoosePaginate = require("mongoose-paginate-v2");

const ProjectSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
    },
    description: { type: String, required: true },
    cover: { type: Schema.Types.ObjectId, ref: "Media" },
    // images: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    techs: [{ type: String, trim: true }],
    // demoUrl: { type: String, trim: true },
    // sourceUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ["in_progress", "completed", "archived"],
      default: "completed",
    },
    featured: { type: Boolean, default: false },
    startedAt: { type: Date },
    finishedAt: { type: Date },
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

ProjectSchema.plugin(MongoosePaginate);

module.exports = mongoose.model("Project", ProjectSchema);
