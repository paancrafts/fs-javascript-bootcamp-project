'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const CommentSchema = mongoose.Schema({ 
  list_id: { type: mongoose.Schema.Types.ObjectId, ref: 'List' },
  content: 'string' 
});

CommentSchema.methods.serialize = function() {
  return {
    user_id: this.user_id,
    content: this.content
  };
};

CommentSchema.statics.addComment = function(content, listId) {
  return this.create({ content: content, list_id: listId });
};

const ListSchema = mongoose.Schema({ 
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: 'string',
  rating: Number,
  yield: Number,
  image: 'string',
  ingredients: [],
  sourceUrl: 'string',
  sourceName: 'string',
  yummlyUrl: 'string',
  yummlyLogo: 'string',
  comments: [CommentSchema]
});

ListSchema.methods.serialize = function() {
  return {
    user_id: this.user_id,
    title: this.title,
    rating: this.rating,
    yield: this.yield,
    image: this.image,
    ingredients: this.ingredients,
    sourceUrl: this.sourceUrl,
    sourceName: this.sourceName,
    yummlyUrl: this.yummlyUrl,
    yummlyLogo: this.yummlyLogo,
    comments: this.comments
  };
};

ListSchema.statics.createList = function(body, user) {
  return this.create({ 
    user_id: user.user_id,
    title : body.title,
    rating: body.rating,
    yield: body.yield,
    image: body.image,
    ingredients: body.ingredients,
    sourceUrl: body.sourceUrl,
    sourceName: body.sourceName,
    yummlyUrl: body.yummlyUrl,
    yummlyLogo: body.yummlyLogo
   });
};

const UserSchema = mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {type: String, default: ''},
  lastName: {type: String, default: ''},
  lists: [ListSchema]
});

UserSchema.methods.serialize = function() {
  return {
    username: this.username || '',
    firstName: this.firstName || '',
    lastName: this.lastName || '',
    lists: this.lists || '',
    user_id: this._id || ''
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

UserSchema.statics.deleteAccount = function(userId) {
  return this.deleteOne({ _id: userId });
};

const List = mongoose.model('List', ListSchema);
const User = mongoose.model('User', UserSchema);
const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {User, List, Comment};
