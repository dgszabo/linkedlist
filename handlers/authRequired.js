// npm packages
const jwt = require('jsonwebtoken');

// app imports
const {
  APIError
} = require('../helpers');

// global constants
// const { JWT_SECRET_KEY } = require('../config');
const JWT_SECRET_KEY = 'abc';

function authRequired(request, response, next) {
  try {
    const token = request.headers.authorization.split(' ')[1];
    let decoded =jwt.verify(token, JWT_SECRET_KEY);
    return next();
  } catch (e) {
    return next(
      new APIError(401, 'Unauthorized', 'Missing or invalid auth token.')
    );
  }
}

module.exports = authRequired;