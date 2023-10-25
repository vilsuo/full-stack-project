const express = require('express');
require('express-async-errors');
const { createClient} = require('redis');

const { PORT, REDIS } = require('./util/config');

const loginRouter = require('./controllers/login');
const usersRouter = require('./controllers/users');

const { errorHandler } = require('./util/middleware');

const app = express();

const client = createClient(REDIS);

client.on('error', err => console.log('Redis Client Error', err));

app.use(express.json());

app.get('/ping', async (req, res) => {

  await client.set('ping', 'hello redis2');
  
  const value = await client.get('ping');

  console.log('value from redis', value);

  res.send('pong');
});

app.use('/api/login', loginRouter);
app.use('/api/users', usersRouter);

app.use(errorHandler);

const main = async () => {
  await client.connect();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

main();