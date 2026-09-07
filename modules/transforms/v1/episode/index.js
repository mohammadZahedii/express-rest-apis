const Transform = require("../../transform");

class EpisodeTransform extends Transform {
  transform = (item) => {
    return {
      course_id: item.course,
      title: item.title,
      body: item.body,
      video_url: item.video_url,
    };
  };
}

module.exports = new EpisodeTransform();
