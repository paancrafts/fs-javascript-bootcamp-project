'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');

const {User, List, Comment} = require('./models');

const router = express.Router();

const jsonParser = bodyParser.json();
const { router: localStrategy, jwtStrategy } = require('../auth');


passport.use(localStrategy);
passport.use(jwtStrategy);

const jwtAuth = passport.authenticate('jwt', {session: false});

// Post to register a new user
router.post('/', jsonParser, (req, res) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField
    });
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Incorrect field type: expected string',
      location: nonStringField
    });
  }

  // If the username and password aren't trimmed we give an error.  Users might
  // expect that these will work without trimming (i.e. they want the password
  // "foobar ", including the space at the end).  We need to reject such values
  // explicitly so the users know what's happening, rather than silently
  // trimming them and expecting the user to understand.
  // We'll silently trim the other fields, because they aren't credentials used
  // to log in, so it's less of a problem.
  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Cannot start or end with whitespace',
      location: nonTrimmedField
    });
  }

  const sizedFields = {
    username: {
      min: 1
    },
    password: {
      min: 10,
      // bcrypt truncates after 72 characters, so let's not give the illusion
      // of security by storing extra (unused) info
      max: 72
    }
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
            req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
            req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField]
          .min} characters long`
        : `Must be at most ${sizedFields[tooLargeField]
          .max} characters long`,
      location: tooSmallField || tooLargeField
    });
  }

  let {username, password, firstName = '', lastName = ''} = req.body;
  // Username and password come in pre-trimmed, otherwise we throw an error
  // before this
  firstName = firstName.trim();
  lastName = lastName.trim();

  return User.find({username})
    .count()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject({
          code: 422,
          reason: 'ValidationError',
          message: 'Username already taken',
          location: 'username'
        });
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName
      });
    })
    .then(user => {
      return res.status(201).json(user.serialize());
    })
    .catch(err => {
      // Forward validation errors on to the client, otherwise give a 500
      // error because something unexpected has happened
      if (err.reason === 'ValidationError') {
        return res.status(err.code).json(err);
      }
      res.status(500).json({code: 500, message: 'Internal server error'});
    });
});
// delete user account
router.delete('/delete', jwtAuth, (req, res) => {
  List
  .find({ user_id: req.user.user_id })
  .then(lists => {
    const listIds = lists.map( list => { return list._id; }); 
    List.deleteMany({ _id: { $in: listIds } })
    .then(() => {
      Comment.deleteMany({ list_id: { $in: listIds } })
      .then()
      .catch( err => console.log(err) )
    })
  })
  .then(() => {
    User.deleteAccount(req.user.user_id)
    .then(() => {
      return res.status(200).json({ message: 'User and related data deleted' });
    })
  })
  .catch( err => console.log(err) );
});
// search route
router.get('/search', jwtAuth, (req, res) => {
  User
  .findOne({ _id: req.user.user_id })
  .then( user => {
    res.status(200).json({
      title: 'Search for recipes',
      firstName: user.firstName
      });
  })
  .catch( err => console.log(err));
});
// profile route
router.get('/profile', jwtAuth, (req, res) => {
  User
    .findOne({ _id: req.user.user_id })
    .then( user => {
      res.status(200).json({
        title: 'My profile',
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.username,
        listsCount: user.lists.length
      });
    })
    .catch( err => console.log(err));
});
// lists route
router.get('/lists', jwtAuth, (req, res) => {
  User
  .findById({ _id: req.user.user_id })
  .then(user => {
    res.status(200).json({
      title: 'My saved lists',
      firstName: user.firstName,
      lists: user.lists
    });
  })
  .catch(err => res.json(err));
});
// save a new list
router.post('/lists/add', jsonParser, jwtAuth, (req, res) => {
  List.createList(req.body, req.user)
    .then(list => {
      User
      .findOne({ _id: req.user.user_id })
      .then(user => {
        user.lists.push(list);
        return user.save();
      })
      .then(user => {
        res.status(201).json({ message: 'List item added', lists: user.lists });
      })
      .catch( err => res.status(500).json({ message: err.statusText }));
    });
});
// update list rating
router.put('/lists/update', jsonParser, jwtAuth, (req, res) => {
  List
  .findById(req.body.list_id)
  .then(list => {
    list.rating = req.body.rating;
    return list.save();
  })
  .then(list => {
    let firstName;
    User
    .findOne({ _id: req.user.user_id })
    .then( user => {
      const listToUpdate = user.lists.find(function(list){
        return list._id == req.body.list_id;
      });
      listToUpdate.rating = req.body.rating;
      firstName = user.firstName;
      return user.save();
    })
    .catch(err => console.log(err));
    res.status(201).json({
      message: 'Rating updated',
      firstName: firstName,
      list_id: list._id,
      rating: list.rating
    });
  })
  .catch(err => console.log(err))
});
// delete list item
router.delete('/lists/delete', jsonParser, jwtAuth, (req, res) => {
  List
  .findById(req.body.list_id)
  .then(list => {
    const commentIds = list.comments.map(comment => {
      return comment._id;
    });
    Comment.deleteMany({ _id: {$in : commentIds }}).then()
    return list;
  })
  .then(list => {
    List
    .deleteOne({ _id: req.body.list_id})
    .then( list => {
      User
      .findOne({ _id: req.user.user_id })
      .then( user => {
        user.lists = user.lists.filter(function(list){
          return list._id != req.body.list_id;
        });
        return user.save();
      })
      .then(user => {
        res.status(201).json({
          title: 'My saved shopping lists',
          lists: user.lists
        });
      })
      .catch(err => console.log(err));
    })
  })
  .catch(err => console.log(err))
});
// show list route
router.get('/list', jwtAuth, (req, res) => {
  User 
  .findById({ _id: req.user.user_id })
  .then(user => {
    const list = user.lists.filter( list => { return list._id == req.query.list_id; } );
    res.json({
      firstName: req.user.firstName,
      list: list[0]
    });
  })
  .catch(err => res.json(err));
});
// Post to save a new list comment
router.post('/comments/add', jsonParser, jwtAuth, (req, res) => {
  Comment.addComment(req.body.content, req.body.list_id)
  .then(comment => {
    User
    .findOne({ _id: req.user.user_id })
    .then(user => {
      const listToAddComm = user.lists.filter( list => {
        return list._id == req.body.list_id;
      });
      listToAddComm[0].comments.push(comment);
      return user.save();
    })
    .then(user => {
      List
        .findById(req.body.list_id)
        .then(list => {
          list.comments.push(comment);
          list.save();
        })
        .catch(err => console.log(err));
      return user;
    })
    .then(user => {
      const listToReturn = user.lists.filter(list => {
        return list._id == req.body.list_id;
      });
      return res.status(200).json({
        title: req.body.title,
        firstName: user.firstName,
        list: listToReturn[0]
      });
    })
    .catch( err => res.status(500).json({ message: err.statusText }))
  })
});
// delete list comment
router.delete('/comments/delete', jsonParser, jwtAuth, (req, res) => {
  Comment.deleteOne({ _id: req.body.comment_id })
  .then(() => {
    User
      .findById(req.user.user_id)
      .then(user => {
        List
          .findById(req.body.list_id)
          .then(list => {
            list.comments = list.comments.filter(comment => {
              return comment._id != req.body.comment_id;
            })
            list.save();
          })
          .catch(err => console.log(err));
          return user;
      })
      .then(user => {
        const listToRemComm = user.lists.filter(list => {
          return list._id == req.body.list_id;
        });
        listToRemComm[0].comments = listToRemComm[0].comments.filter(comment => {
          return comment._id != req.body.comment_id;
        });
        user.save();
        const listToReturn = user.lists.filter(list => {
          return list._id == req.body.list_id;
        });
        return res.status(200).json({
          title: req.body.title,
          firstName: user.firstName,
          list: listToReturn[0]
        });
      })
      .catch(err => console.log(err));
  })    
  .catch(err => console.log(err));
});

module.exports = {router};
