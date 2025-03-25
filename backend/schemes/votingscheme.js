const { check } = require('express-validator');

const votingscheme = [
  check('positionId', 'positionId is required').notEmpty().isUUID(),
  check('candidateId', 'candidateId is required').notEmpty().isUUID(),
  check('voterId', 'voterId is required').notEmpty().isUUID(),
  check('electionId', 'electionId is required').notEmpty().isUUID(),
];

module.exports = votingscheme;
