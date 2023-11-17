const router = require('express').Router();

// add limits: https://github.com/expressjs/multer#limits
const multer = require('multer');

const upload = multer({ dest: 'images/' });

router.post('/profilepicture', upload.single('image'), async (req, res) => {

  console.log('file', req.file);
  console.log('body', req.body);

  console.log('caption', req.body.caption)

  return res.send({ file: req.file, body: req.body });
});

module.exports = router;