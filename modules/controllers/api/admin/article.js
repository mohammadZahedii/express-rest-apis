const mongoose = require("mongoose");
const { z } = require("zod");
const slugify = require("slugify");

//controller
const Controller = require(`${config.path.controller.index}/controller`);

//transforms
const MediaTransform = require(`${config.path.transforms}/v1/media`);
const { extractMediaIdsFromHTML } = require(`${config.path.utils}`);

class AdminArticleController extends Controller {
  findAll = async (req, res) => {
    try {
      const ariticles = await this.models.Article.find().populate([
        { path: "author", select: "name email avatar" },
        { path: "cover" },
        { path: "images" },
      ]);

      res.json({
        sucess: true,
        data: ariticles.map((article) => {
          return {
            ...article.toJSON(),
            author: {
              ...article.author.toJSON(),
              avatar: MediaTransform.transform(article.author.avatar),
            },
            images: article.images.map((image) =>
              MediaTransform.transform(image),
            ),
            cover: MediaTransform.transform(article.cover),
          };
        }),
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  findOne = async (req, res) => {
    const paramId = req?.params?.id;

    const isId = mongoose.Types.ObjectId.isValid(paramId);

    try {
      let queryData = {
        _id: paramId,
      };

      if (!isId) {
        queryData = {
          slug: paramId,
        };
      }

      const findedArticle = await this.models.Article.findOne(
        queryData,
      ).populate([
        { path: "author", select: "name email avatar" },
        { path: "cover" },
        { path: "images" },
      ]);

      if (!findedArticle) {
        return res.status(404).json({
          success: false,
          message: "Not found any article",
        });
      }

      res.json({
        success: true,
        data: {
          ...findedArticle.toJSON(),
          author: {
            ...findedArticle.author.toJSON(),
            avatar: MediaTransform.transform(findedArticle.author.avatar),
          },
          images: findedArticle.images.map((image) =>
            MediaTransform.transform(image),
          ),
          cover: MediaTransform.transform(findedArticle.cover),
        },
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  create = async (req, res) => {
    try {
      const validationRes = this.validations.article.create.parse(req.body);
      //get authorId
      const authorId = validationRes?.author || req.user.id;
      //check author is valid or not
      const isUserExist = await this.models.User.findById(authorId);
      if (!isUserExist) {
        return res.status(404).json({
          success: false,
          message: "author id is invalid",
        });
      }

      //slugify body slug
      const normalSlug = slugify(req.body.slug);

      //check is slug exist or not
      const isSlugExist = await this.models.Article.exists({
        slug: normalSlug,
      });
      if (isSlugExist) {
        return res.status(409).json({
          success: false,
          message: "this slug is used before",
        });
      }

      const { cover, ...restBody } = validationRes;

      //extract medias from html body
      const bodyMediaIds = extractMediaIdsFromHTML(restBody.body);

      //collect all media files
      const allMedias = [...bodyMediaIds, cover];

      //check all media ids is based on standard shape or not
      const { ids: finalMediaIds } = z
        .object({
          ids: z.array(
            z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
              message: "invalid media id ",
            }),
          ),
        })
        .parse({ ids: allMedias });
      //check all images is valid or not
      const imagesError = await this.validateImages(finalMediaIds);
      if (imagesError) {
        return res.status(imagesError.status).json({
          message: imagesError.message,
        });
      }

      let savedArticle = await this.models.Article.create({
        title: restBody.title,
        slug: normalSlug,
        body: restBody.body,
        cover,
        images: bodyMediaIds,
        author: authorId,
      });

      await savedArticle.populate([
        { path: "author", select: "name avatar email", populate: "avatar" },
        {
          path: "images",
        },
        {
          path: "cover",
        },
      ]);

      res.status(201).json({
        success: true,
        message: "your article has been created succussfully",
        data: {
          ...savedArticle.toJSON(),
          author: {
            ...savedArticle.author.toJSON(),
            avatar: MediaTransform.transform(savedArticle.author.avatar),
          },
          cover: MediaTransform.transform(savedArticle.cover),
          images: savedArticle.images.map((media) => {
            return MediaTransform.transform(media);
          }),
        },
      });
    } catch (error) {
      this.errorHandler(error, res);
    }
  };
  update = async (req, res) => {};

  destroy = async (req, res) => {};
}

module.exports = new AdminArticleController();
