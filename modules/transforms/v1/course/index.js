const Transform = require("../../transform");

const EpisodeTransform = require(`${config.path.transforms}/v1/episode`);
const MediaTransform = require(`${config.path.transforms}/v1/media`);
const UserTransform = require(`${config.path.transforms}/v1/user`);

class CourseTransform extends Transform {
  constructor() {
    super();
    this.withEpisodesStatus = false;
    this.withUserStatus = false;
  }

  transform = (item) => {
    return {
      id: item._id,
      title: item.title,
      body: item.body,
      price: item.price,
      images: this.transformImages(item.images),
      ...this.showEpisodes(item),
      ...this.showUsers(item),
    };
  };

  transformImages = (images) => {
    if (!images || images.length === 0) return [];

    return images.map((image) => {
      //if image is populated (media document) transform it,
      //otherwise it is just an ObjectId so return it as is
      if (typeof image === "object" && image.path) {
        return MediaTransform.transform(image);
      }

      return image;
    });
  };

  showEpisodes = (item) => {
    if (this.withEpisodesStatus) {
      return {
        episodes: EpisodeTransform.transformCollection(item.episodes),
      };
    }
    return {};
  };

  showUsers = (item) => {
    if (this.withUsersStatus) {
      return {
        users: UserTransform.transformCollection(item.users),
      };
    }
    return {};
  };

  withUsers = () => {
    this.withUsersStatus = true;
    return this;
  };

  withEpisodes = () => {
    this.withEpisodesStatus = true;
    // console.log(this, "THIS");
    return this;
  };

  withPaginate(result) {
    return {
      items: result.docs,
      total: result.totalDocs,
      limit: result.limit,
      pages: result.totalPages,
      page: result.page,
      hasPrevPage: result.hasPrevPage,
      hasNextPage: result.hasNextPage,
    };
  }
}

module.exports = new CourseTransform();
