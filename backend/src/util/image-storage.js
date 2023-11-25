const multer = require('multer');
const path = require('path');

let options;
if (process.env.NODE_ENV === 'test') {
  options = { storage: multer.memoryStorage() };
} else {
  options = { dest: 'images/' }
}

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('File upload only supports the following filetypes - ' + filetypes));
};

const upload = multer({
  ...options,
  fileFilter,
});

module.exports = upload;