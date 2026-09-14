const Transform = require("../../transform");

const { normalizeToRelativePath } = require(`${global.config.path.utils}`);

class MediaTransform extends Transform {
  transform = (item) => {
    return {
      id: item._id || item.id,
      originalName: item.originalname,
      filename: item.filename,
      mimetype: item.mimetype,
      size: item.size,
      fileType: item.fileType,
      url: this.buildUrl(item),
    };
  };

  buildUrl = (item) => {
    const baseUrl = process.env.APP_BASE_URL || "http://localhost:8000";

    const normalizedPath = normalizeToRelativePath(item.path);

    return `${baseUrl}/uploads/${normalizedPath}`;
  };
}

module.exports = new MediaTransform();
