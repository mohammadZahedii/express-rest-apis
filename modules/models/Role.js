const mongoose = require("mongoose");
const { PERMISSIONS } = require(`${config.path.constants}`);

const Schema = mongoose.Schema;

const RoleSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      required: true,
      trim: true,
    },

    permissions: [
      {
        type: String,
        enum: Object.values(PERMISSIONS),
      },
    ],
    isSystem: {
      type: Boolean,
      default: false,
      immutable: true,
    },
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
    timestamps: true,
  },
);

module.exports = mongoose.model("Role", RoleSchema);
