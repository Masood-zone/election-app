const { check } = require('express-validator');

const voterscheme = [
  check('studentName', 'student name is required')
    .isMongoId()
    .exists()
    .notEmpty(),
  check('email', 'email is required').isEmail().notEmpty(),
  check('password', 'password is required').notEmpty(),
];

const voterLoginScheme = [
  check('studentId', 'student id is required').notEmpty(),
  check('password', 'password is required').notEmpty(),
];

module.exports = {
  voterscheme,
  voterLoginScheme,
};
