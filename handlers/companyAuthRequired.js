// npm packages
const jwt = require('jsonwebtoken');

// app imports
const {
  APIError
} = require('../helpers');

// global constants
// const { JWT_SECRET_KEY } = require('../config');
const JWT_SECRET_KEY = 'abc';

function companyAuthRequired(request, response, next) {
  try {
    const token = request.headers.authorization.split(' ')[1];
    jwt.verify(token, JWT_SECRET_KEY);
    if(jwt.decode(token, JWT_SECRET_KEY).companyId) {
      return next();
    } else {
      return next(new APIError(401, 'Unauthorized', 'Missing or invalid auth token.'));
    };
  } catch (e) {
    return next(
      new APIError(401, 'Unauthorized', 'Missing or invalid auth token.')
    );
  }
}

module.exports = companyAuthRequired;