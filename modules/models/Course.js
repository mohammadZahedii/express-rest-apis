const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const MongoosePaginate = require("mongoose-paginate-v2");



const CourseSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    body: { type: String, required: true },
    price: { type: String, required: true },
    images: [{ type: Schema.Types.ObjectId, ref: "Media" }],
    episodes: [{ type: Schema.Types.ObjectId, ref: "Episode" }],
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
  }
);

CourseSchema.plugin(MongoosePaginate);

module.exports = mongoose.model("Course", CourseSchema);
