const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: Schema.Types.ObjectId, ref: "Media", default: null },
    courses: [{ type: Schema.Types.ObjectId, ref: "Course" }],
    roles: [{ type: Schema.Types.ObjectId, ref: "Role" }],
    projects: [{ type: Schema.Types.ObjectId, ref: "Project" }],
    refreshToken: [
      {
        token: String,
        expiresAt: Date,
      },
    ],
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

UserSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.comparePassword = function (currentPassword) {
  return bcrypt.compare(currentPassword, this.password);
};

module.exports = mongoose.model("User", UserSchema);
