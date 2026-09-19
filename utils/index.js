const cheerio = require("cheerio");
const mongoose = require("mongoose");
/**
 * @param {object} file
 * @returns {boolean}
 */

const isValidFileFieldname = (fieldname) => {
  return /^files\[\d+\]$/.test(fieldname);
};

/**
 * @param {Array} files
 * @returns {Object} { isValid: boolean, error?: string }
 */
const validateFilesPayloadFormat = (files) => {
  const fieldKeys = new Set();

  for (const file of files) {
    const { fieldname } = file;

    //check fieldname is valid or not
    if (!isValidFileFieldname(fieldname)) {
      return {
        isValid: false,
        error: "Invalid <files> fieldname",
      };
    }

    //checking for duplicate keys in entire request
    if (fieldKeys.has(fieldname)) {
      return {
        isValid: false,
        error: `Duplicate field name detected: "${fieldname}". Each index can only have one file.`,
      };
    }
    fieldKeys.add(fieldname);
  }

  return { isValid: true };
};

/**
 * @param {Array} files
 * @returns {Object} { isValid: boolean, error?: string }
 */

/**
 * @param {Array} files
 * @returns {Array} descending sorted files from 0=>n
 */
const sortFilesByIndex = (files) => {
  //clone files
  const currentFiles = [...files];
  return currentFiles.sort((a, b) => {
    const indexA = parseInt(a.fieldname.match(/\d+/)[0]);
    const indexB = parseInt(b.fieldname.match(/\d+/)[0]);

    return indexA - indexB;
  });
};

/**
 * @param {string} message
 * @param {number} [statusCode=500]
 * @returns {Error}
 */
const errorCreator = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

/**
 * @param {string} rawPath
 * @returns {string}
 */
const normalizeToRelativePath = (rawPath) => {
  if (!rawPath || typeof rawPath !== "string") return "";

  //change for example this path to normal path
  //public\\files\\images\\2026-07-29\\d97b5e57-a32f-4d0a-ae26-3b0dd8c77f68.png'
  const normalizePath = rawPath.replaceAll(/\\/g, "/");

  const cleanPath = normalizePath.replace(/public\/files\//, "");

  return cleanPath;
};

/**
 * @param {string} mimetype
 * @returns {string}
 */
const getFileType = (mimetype) => {
  if (!mimetype || typeof mimetype !== "string") return "unknown";

  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  if (mimetype.startsWith("application/")) return "document";

  return "unknown";
};

/**
 * @param {string} htmlString
 * @returns {mongoose.Types.ObjectId[]}
 */

function extractMediaIdsFromHTML(htmlString) {
  if (!htmlString || typeof htmlString !== "string") return [];

  const $ = cheerio.load(htmlString);

  const mediaIds = [];

  $("img[data-media-id]").each((_, el) => {
    const id = $(el).attr("data-media-id");

    if (id && mongoose.isValidObjectId(id)) {
      mediaIds.push(new mongoose.Types.ObjectId(id));
    }
  });

  const uniqueIds = Array.from(new Set(mediaIds.map((id) => id.toString())));

  return uniqueIds;
}

module.exports = {
  extractMediaIdsFromHTML,
  isValidFileFieldname,
  validateFilesPayloadFormat,
  normalizeToRelativePath,
  sortFilesByIndex,
  errorCreator,
  getFileType,
};
