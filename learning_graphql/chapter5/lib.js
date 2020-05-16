const fs = require("fs");

const uploadStream = (stream, path) =>
  new Promise((resolve, reject) => {
    stream
      .on("error", (error) => {
        if (stream.truncated) {
          fs.unlinkSync(path);
        }
        reject(error);
      })
      .on("end", resolve)
      .pipe(fs.createWriteStream(path));
  });
module.exports = { uploadStream };
