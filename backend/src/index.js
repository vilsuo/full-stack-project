const express = require('express');
require('express-async-errors');

const { PORT } = require('./util/config');

const loginRouter = require('./controllers/login');
const usersRouter = require('./controllers/users');

const { errorHandler } = require('./util/middleware');

const app = express();

app.use(express.json());

app.get('/ping', (req, res) => {
  console.log('someone pinged')
  res.send('pong');
});

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});