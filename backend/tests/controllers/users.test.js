// It would be better to run our tests using a database that is
// installed and running on the developer's local machine. The
// optimal solution would be to have every test execution use a
// separate database


//const mongoose = require('mongoose')

const supertest = require('supertest');
const app = require('../../src/index');

const api = supertest(app);

test('users are returned as json', async () => {
  await api
    .get('/api/users')
    .expect(200)
    .expect('Content-Type', /application\/json/)
});

/*
afterAll(async () => {
  await mongoose.connection.close()
})
*/