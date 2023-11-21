const multer = require('multer');

let options;
if (process.env.NODE_ENV === 'test') {
  options = { storage: multer.memoryStorage() };
} else {
  options = { dest: 'images/' }
}

const upload = multer(options);

module.exports = upload;