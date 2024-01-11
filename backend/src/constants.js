// session
const SESSION_ID = 'connect.sid';

// file upload
const FILE_SIZE_LIMIT = 2097152; // = 2 Mb, 1048576 = 1 Mb

// pagination
const DEFAULT_PAGE_NUMBER = 0;
const DEFAULT_PAGE_SIZE = 10;

// database data types
const STRING_MAX_LENGTH = 255;

// database enums
const IMAGE_PUBLIC = 'public';
const IMAGE_PRIVATE = 'private';
const IMAGE_PRIVACIES = [IMAGE_PUBLIC, IMAGE_PRIVATE];

module.exports = {
  SESSION_ID,
  
  FILE_SIZE_LIMIT,

  DEFAULT_PAGE_NUMBER,
  DEFAULT_PAGE_SIZE,

  STRING_MAX_LENGTH,

  IMAGE_PUBLIC, IMAGE_PRIVATE,
  IMAGE_PRIVACIES,
};