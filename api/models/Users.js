/**
 * Users.js
 *
 * @description :: A model definition represents a database table/collection.
 * @docs        :: https://sailsjs.com/docs/concepts/models-and-orm/models
 */
'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  attributes: {
    email: { type: 'string', required: true, unique: true },
    password: { type: 'string', required: true },
    name: { type: 'string', required: true },
  },

  // Here we encrypt password before creating a User
  beforeCreate(values, next) {
    bcrypt.genSalt(10, (err, salt) => {
      if (err) {
        sails.log.error(err);
        return next();
      }

      bcrypt.hash(values.password, salt, (error, hash) => {
        if (error) {
          sails.log.error(error);
          return next();
        }
        values.password = hash; // Here is our encrypted password
        return next();
      });
    });
  },

  comparePassword(password, encryptedPassword) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(password, encryptedPassword, (err, match) => {
        if (err) {
          sails.log.error(err);
          return reject('Something went wrong!');
        }
        if (match) {
          return resolve();
        } else {
          return reject('Mismatch passwords');
        }
      });
    });
  },
};
