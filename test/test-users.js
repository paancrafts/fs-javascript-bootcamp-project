'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const { app, runServer, closeServer } = require('../server');
const { User, List, Comment } = require('../users/models');
const { TEST_DATABASE_URL } = require('../config');

const expect = chai.expect;

// This let's us make HTTP requests
// in our tests.
// see: https://github.com/chaijs/chai-http
chai.use(chaiHttp);

// process.on('unhandledRejection', (e) => {
//   console.log('You forgot to return a Promise! Check your tests! Error: ' + e.message)
// })

describe('User endpoints', function () {
  const username = 'exampleUser';
  const password = 'examplePass';
  const firstName = 'Example';
  const lastName = 'User';
  const usernameB = 'exampleUserB';
  const passwordB = 'examplePassB';
  const firstNameB = 'ExampleB';
  const lastNameB = 'UserB';
  const recipe = { 
    "ingredients" : [ 
      "5 small ripe bananas (about 1 lb), peeled and broken or cut into small pieces", 
      "1/4 cup unsweetened cocoa powder", 
      "1 cup light coconut milk", 
      "1 tsp pure vanilla extract", 
      "1 baked Extra-Easy Whole-Grain Pie Crust, using nut variation with peanuts", 
      "2 tbsp unsalted dry roasted peanuts, chopped", 
      "1 oz dark chocolate (70% or greater), finely chopped"
    ],
    "title" : "Chocolate Banana Freezer Pie",
    "yield": 8,
    "rating" : 3,
    "image" : "https://lh3.googleusercontent.com/Tjg-EyLHs1XsO1XPpDIo4cT23CIO8lRmOfTsLoZ77KsVEc7DkIKpNJSGIX3Jh_ju63Zit7amH11hWhKYkeu3dw=s360",
    'sourceUrl': "source url",
    'sourceName': "source name",
    'yummlyUrl': "yummly url",
    'yummlyLogo': "https://en.wikipedia.org/wiki/Yummly#/media/File:Yummly_logo.png"
  };
  const comment = function(list_id) {
    return {
      "title" : "Chocolate Banana Freezer Pie",
      "list_id": list_id,
      "content" : "Spicy jalapeno bacon ipsum dolor amet voluptate elit sausage, bresaola biltong tempor ham hock tail excepteur shankle cupidatat pork loin. Eu non fatback nisi in shoulder laborum frankfurter boudin t-bone ham hock consectetur hamburger. Ham spare ribs magna bresaola eu beef eiusmod adipisicing swine rump. Exercitation et pastrami sint dolore nostrud. Alcatra sunt drumstick incididunt ad short loin."
    }
  };
  before(function () {
    return runServer(TEST_DATABASE_URL);
  });

  after(function () {
    return closeServer();
  });

  beforeEach(function () {
  
   });

  afterEach(function () {
    return User.deleteMany({});
  });

  describe('/api/users', function () {
    describe('POST', function () {
      it('Should reject users with missing username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with missing password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal('Missing field');
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with non-string username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: 1234,
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with non-string password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: 1234,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with non-string first name', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName: 1234,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('firstName');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with non-string last name', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName: 1234
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Incorrect field type: expected string'
            );
            expect(res.body.location).to.equal('lastName');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with non-trimmed username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: ` ${username} `,
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with non-trimmed password', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: ` ${password} `,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Cannot start or end with whitespace'
            );
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with empty username', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username: '',
            password,
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 1 characters long'
            );
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with password less than ten characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: '123456789',
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at least 10 characters long'
            );
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with password greater than 72 characters', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password: new Array(73).fill('a').join(''),
            firstName,
            lastName
          })
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Must be at most 72 characters long'
            );
            expect(res.body.location).to.equal('password');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should reject users with duplicate username', function () {
        // Create an initial user
        return User.create({
          username,
          password,
          firstName,
          lastName
        })
          .then(() =>
            // Try to create a second user with the same username
            chai.request(app).post('/api/users').send({
              username,
              password,
              firstName,
              lastName
            })
          )
          .then((res) => {
            expect(res).to.have.status(422);
            expect(res.body.reason).to.equal('ValidationError');
            expect(res.body.message).to.equal(
              'Username already taken'
            );
            expect(res.body.location).to.equal('username');
          })
          .catch(err => {
            if (err instanceof chai.AssertionError) {
              throw err;
            }

            const res = err.response;
            
          });
      });
      it('Should create a new user', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
            return user.validatePassword(password);
          })
          .then(passwordIsCorrect => {
            expect(passwordIsCorrect).to.be.true;
          });
      });
      it('Should trim firstName and lastName', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName: ` ${firstName} `,
            lastName: ` ${lastName} `
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({ username });
          })
          .then(user => {
            expect(user).to.not.be.null;
            expect(user.firstName).to.equal(firstName);
            expect(user.lastName).to.equal(lastName);
          });
      });
      it('Should add list to user\'s Shopping lists', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({ user_id: res.body.user_id });
          })
          .then(user => {
            return chai 
              .request(app)
              .post('/api/auth/login')
              .send({
                username,
                password
              })
              .then(res => {
                return chai
                  .request(app)
                  .post('/api/users/lists/add')
                  .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                  .send(recipe)
                  .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body.message).to.equal('List item added');
                    expect(res.body.lists).to.be.an('array');
                    expect(res.body.lists[res.body.lists.length - 1]).to.include.keys(
                      'ingredients',
                      'comments',
                      '_id',
                      'user_id',
                      'title',
                      'rating',
                      'yield',
                      'image',
                      'sourceUrl',
                      'sourceName',
                      'yummlyUrl',
                      'yummlyLogo',
                      '__v'
                    );
                  })
                  .catch(err => {
                    throw err;
                  });
              })
              .catch(err => {
                throw err;
              });
          }); 
      }); // 'Should return Shopping Lists page' ends
      it('Should add comment to list item', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({ user_id: res.body.user_id });
          })
          .then(user => {
            return chai 
              .request(app)
              .post('/api/auth/login')
              .send({
                username,
                password
              })
              .then(res => {
                return chai
                  .request(app)
                  .post('/api/users/lists/add')
                  .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                  .send(recipe)
                  .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body.message).to.equal('List item added');
                    expect(res.body.lists[res.body.lists.length - 1]).to.include.keys(
                      '_id'
                    );
                    return res.body.lists[res.body.lists.length - 1];
                  })
                  .then(list => {
                    return chai
                      .request(app)
                      .post('/api/users/comments/add')
                      .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                      .send(comment(list._id))
                      .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body.title).to.equal(list.title);
                        expect(res.body.list.comments[0].content).to.equal('Spicy jalapeno bacon ipsum dolor amet voluptate elit sausage, bresaola biltong tempor ham hock tail excepteur shankle cupidatat pork loin. Eu non fatback nisi in shoulder laborum frankfurter boudin t-bone ham hock consectetur hamburger. Ham spare ribs magna bresaola eu beef eiusmod adipisicing swine rump. Exercitation et pastrami sint dolore nostrud. Alcatra sunt drumstick incididunt ad short loin.');
                      })
                      .catch(err => { throw err });
                  })
                  .catch(err => { throw err; });
              })
              .catch(err => { throw err; });
          }); 
      }); // 'Should return Shopping Lists page' ends
    });
    describe('DELETE', function() {
      it('Should delete user', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            return chai 
              .request(app)
              .post('/api/auth/login')
              .send({
                username,
                password
              })
              .then(res => {
                return chai
                  .request(app)
                  .delete('/api/users/delete')
                  .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                  .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.message).to.equal('User and related data deleted');
                  })
                  .catch(err => {
                    throw err;
                  });
              });
          })
          .catch(err => {
            throw err;
          });
      });
      it('Should delete list item from user', function () {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({ _id: res.body.user_id });
          })
          .then(user => {
            return chai 
              .request(app)
              .post('/api/auth/login')
              .send({
                username,
                password
              })
              .then(res => {
                return chai
                  .request(app)
                  .post('/api/users/lists/add')
                  .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                  .send(recipe)
                  .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body.message).to.equal('List item added');
                    expect(res.body.lists).to.be.an('array');
                    expect(res.body.lists[res.body.lists.length - 1]).to.include.keys(
                      'ingredients',
                      'comments',
                      '_id',
                      'user_id',
                      'title',
                      'rating',
                      'yield',
                      'image',
                      'sourceUrl',
                      'sourceName',
                      'yummlyUrl',
                      'yummlyLogo',
                      '__v'
                    );
                    return res.body.lists[res.body.lists.length - 1];
                  })
                  .then(list => {
                    return chai
                      .request(app)
                      .delete('/api/users/lists/delete')
                      .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                      .send({
                        list_id: list._id
                      })
                      .then(res => {
                        expect(res).to.have.status(201);
                        expect(res.body.title).to.equal('My saved shopping lists');
                        //expect(res.body.firstName).to.equal(firstName);
                        expect(res.body.lists).to.be.an('array').that.does.not.include(list._id);
                      })
                      .catch(err => { throw err });
                  })
                  .catch(err => { throw err; });
              })
              .catch(err => { throw err; });
          }); 
      });
      it('Should delete comment from list item', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({ user_id: res.body.user_id });
          })
          .then(user => {
            return chai 
              .request(app)
              .post('/api/auth/login')
              .send({
                username,
                password
              })
              .then(res => {
                return chai
                  .request(app)
                  .post('/api/users/lists/add')
                  .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                  .send(recipe)
                  .then(res => {
                    expect(res).to.have.status(201);
                    expect(res.body.message).to.equal('List item added');
                    expect(res.body.lists[res.body.lists.length - 1]).to.include.keys(
                      '_id'
                    );
                    return res.body.lists[res.body.lists.length - 1];
                  })
                  .then(list => {
                    return chai
                      .request(app)
                      .post('/api/users/comments/add')
                      .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                      .send(comment(list._id))
                      .then(res => {
                        expect(res).to.have.status(200);
                        expect(res.body.title).to.equal(list.title);
                        expect(res.body.list.comments[0].content).to.equal('Spicy jalapeno bacon ipsum dolor amet voluptate elit sausage, bresaola biltong tempor ham hock tail excepteur shankle cupidatat pork loin. Eu non fatback nisi in shoulder laborum frankfurter boudin t-bone ham hock consectetur hamburger. Ham spare ribs magna bresaola eu beef eiusmod adipisicing swine rump. Exercitation et pastrami sint dolore nostrud. Alcatra sunt drumstick incididunt ad short loin.');
                        return res.body.list;
                      })
                      .then(list => {
                        return chai
                          .request(app)
                          .delete('/api/users/comments/delete')
                          .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                          .send({ 
                            title: list.title, 
                            list_id: list._id, 
                            comment_id: list.comments[list.comments.length - 1]._id
                          })
                          .then(res => {
                            expect(res).to.have.status(200);
                            expect(res.body.title).to.equal(list.title);
                            expect(res.body.firstName).to.equal(firstName);
                            expect(res.body.list.comments).to.be.an('array');
                            expect(res.body.list).to.have.keys(
                              'title',
                              '_id',
                              'rating',
                              'yield',
                              'image',
                              'ingredients',
                              'comments',
                              'user_id',
                              'sourceUrl',
                              'sourceName',
                              'yummlyUrl',
                              'yummlyLogo',
                              '__v'
                            );
                            return Comment.deleteMany({});
                          })
                      })
                      .catch(err => { throw err });
                  })
                  .catch(err => { throw err; });
              })
              .catch(err => { throw err; });
          }); 
      });
    });
    describe('GET', function() {
      it('Should return Search page', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            return chai 
              .request(app)
              .post('/api/auth/login')
              .send({
                username,
                password
              })
              .then(res => {
                return chai
                  .request(app)
                  .get('/api/users/search')
                  .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                  .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.title).to.equal('Search for recipes');
                    expect(res.body.firstName).to.equal(user.firstName);
                  })
                  .catch(err => {
                    throw err;
                  });
              });
          })
          .catch(err => {
            throw err;
          });
      });
      it('Should return Profile page', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            return chai 
              .request(app)
              .post('/api/auth/login')
              .send({
                username,
                password
              })
              .then(res => {
                return chai
                  .request(app)
                  .get('/api/users/profile')
                  .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                  .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.title).to.equal('My profile');
                    expect(res.body.firstName).to.equal(user.firstName);
                    expect(res.body.lastName).to.equal(user.lastName);
                    expect(res.body.listsCount).to.equal(user.lists.length);
                  })
                  .catch(err => {
                    throw err;
                  });
              })
              .catch(err => {
                throw err;
              });
          }); 
      }); // 'Should return Profile page' ends
      it('Should return Shopping Lists page', function() {
        return chai
          .request(app)
          .post('/api/users')
          .send({
            username,
            password,
            firstName,
            lastName
          })
          .then(res => {
            expect(res).to.have.status(201);
            expect(res.body).to.be.an('object');
            expect(res.body).to.have.keys(
              'username',
              'firstName',
              'lastName',
              'lists',
              'user_id'
            );
            expect(res.body.username).to.equal(username);
            expect(res.body.firstName).to.equal(firstName);
            expect(res.body.lastName).to.equal(lastName);
            return User.findOne({
              username
            });
          })
          .then(user => {
            return chai 
              .request(app)
              .post('/api/auth/login')
              .send({
                username,
                password
              })
              .then(res => {
                return chai
                  .request(app)
                  .get('/api/users/lists')
                  .set( 'Authorization', `Bearer ${ res.body.authToken }` )
                  .then(res => {
                    expect(res).to.have.status(200);
                    expect(res.body.title).to.equal('My saved lists');
                    expect(res.body.firstName).to.equal(user.firstName);
                    expect(res.body.lists).to.be.an('array');
                    if(res.body.lists.length > 0) {
                      expect(res.body.lists).to.be.equal(user.lists);
                    }
                  })
                  .catch(err => {
                    throw err;
                  });
              })
              .catch(err => {
                throw err;
              });
          }); 
      }); // 'Should return Shopping Lists page' ends
    }); // Describe GET ends
  }); // Describe '/api/users' endpoint tests ends
});
