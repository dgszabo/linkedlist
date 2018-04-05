// npm packages
const jwt = require("jsonwebtoken");
const {
  Validator
} = require("jsonschema");
const bcrypt = require("bcrypt");
// app imports
const JWT_SECRET_KEY = 'abc';
const {
  User
} = require("../models");
const {
  APIError
} = require("../helpers");

const {
  authSchema
} = require("../schemas");

// global constants
const v = new Validator();

function auth(request, response, next) {
  const validSchema = validateSchema(
    v.validate(request.body, authSchema),
    "user"
  );
  if (validSchema !== "OK") {
    return next(validSchema);
  }
  return User.readUser(request.body.data.username)
    .then(user => {
      const isValid = bcrypt.compareSync(
        request.body.data.password,
        user.password
      );
      if (!isValid) {
        throw new APIError(401, "Unauthorized", "Invalid password.");
      }
      const newToken = {
        token: jwt.sign({
          username: user.username
        }, JWT_SECRET_KEY)
      };
      return response.json(formatResponse(newToken));
    })
    .catch(err => {
      next(err);
    });
}

module.exports = auth;