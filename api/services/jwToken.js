'use strict';

const jwt = require('jsonwebtoken');
const tokenSecret = 'secretissecret';

module.exports = {
  // Generates a token from supplied payload
  sign(payload, expires) {
    return jwt.sign(
      payload,
      tokenSecret, // Token Secret that we sign it with
      {
        expiresIn: expires, // Token Expire time
      }
    );
  },

  // Verifies token on a request
  verify(token, callback) {
    return jwt.verify(
      token, // The token to be verified
      tokenSecret, // Same token we used to sign
      {}, // No Option, for more see https://github.com/auth0/node-jsonwebtoken#jwtverifytoken-secretorpublickey-options-callback
      callback //Pass errors or decoded token to callback
    );
  },
};
