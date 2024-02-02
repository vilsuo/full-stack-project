const multer = require('multer');
const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const { FiletypeError } = require('./error');
const { Image, Potrait } = require('../models');
const { FILE_SIZE_LIMIT, FILE_TYPES } = require('../constants');

const options = {};
if (process.env.NODE_ENV === 'test') {
  // throw away the image after upload
  // filepath is null in tests!
  options.storage = multer.memoryStorage();
} else {
  // save image locally
  options.dest = 'images/';
}

const limits = {
  fileSize: FILE_SIZE_LIMIT,
};

const regex = new RegExp(FILE_TYPES.join('|'));

const fileFilter = (req, file, cb) => {
  const mimetype = regex.test(file.mimetype);
  const extname = regex.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }

  cb(new FiletypeError(
    `File upload only supports the filetypes [${FILE_TYPES.join('|')}]`
  ));
};

const upload = multer({
  ...options,
  limits,
  fileFilter,
});

const removeFile = filepath => {
  if (process.env.NODE_ENV === 'test') {
    // files are not saved on testing environment
    return;
  }

  const fullfilepath = getImageFilePath(filepath);

  fs.unlink(fullfilepath, (error) => {
    if (error) {
      logger.error('Error removing file:', error);
    } else {
      logger.info(`Removed file:`, fullfilepath);
    }
  });
};

const removeUserFiles = async (userId) => {
  const imageFilepaths = await Image.findAll({ 
    attributes: ['filepath'],
    where: { userId }
  });

  const potraitPath = await Potrait.findAll({
    attributes: ['filepath'],
    where: { userId }
  });

  imageFilepaths.forEach(image => removeFile(image.filepath));
  potraitPath.forEach(potrait => removeFile(potrait.filepath));
};

const getImageFilePath = filepath => {
  if (process.env.NODE_ENV === 'test') {
    // files are not saved on testing environment
    return;
  }

  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, filepath);

  return fullfilepath;
};

module.exports = {
  upload,
  removeFile,
  removeUserFiles,
  getImageFilePath,
};