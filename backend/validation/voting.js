const prisma = require('../db/prisma-db');
// const HttpException = require('./http-exception');

// Check if vote already exists
const checkVoteExists = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;
    const { positionId, electionId } = req.body;

    // Skip this check if no electionId is provided
    if (!electionId) {
      return next();
    }

    // Get election settings
    const settings = await prisma.electionSettings.findUnique({
      where: { electionId },
    });

    // If multiple votes are allowed, skip this check
    if (settings?.allowMultipleVotes) {
      return next();
    }

    // Check if user has already voted for this position in this election
    const existingVote = await prisma.voting.findFirst({
      where: {
        voterId: userId,
        positionId,
        electionId,
      },
    });

    if (existingVote) {
      return res.status(400).json({
        status: 'fail',
        message: 'You have already voted for this position in this election',
      });
    }

    next();
  } catch (error) {
    console.error('Error checking vote existence:', error);
    next(error);
  }
};

// Check for double voting
const doubleVoting = async (req, res, next) => {
  try {
    // Get user ID from authenticated user
    const userId = req.user.id;
    const { positionId, candidateId, electionId } = req.body;

    // Skip this check if no electionId is provided
    if (!electionId) {
      return next();
    }

    // Verify the candidate belongs to the specified position
    const candidate = await prisma.candidates.findUnique({
      where: { id: candidateId },
    });

    if (!candidate || candidate.positionId !== positionId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Candidate does not belong to the specified position',
      });
    }

    // Verify the position is part of the election
    const electionPosition = await prisma.electionPosition.findFirst({
      where: {
        electionId,
        positionId,
      },
    });

    if (!electionPosition) {
      return res.status(400).json({
        status: 'fail',
        message: 'This position is not part of the specified election',
      });
    }

    next();
  } catch (error) {
    console.error('Error in double voting check:', error);
    next(error);
  }
};

module.exports = {
  checkVoteExists,
  doubleVoting,
};
