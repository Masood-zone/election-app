// importing all dependencies
const { validationResult } = require('express-validator');
const HttpException = require('../validation/http-exception');
const prisma = require('../db/prisma-db');

// saving a vote
const addVoting = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array(),
    });
  }

  try {
    // Get the current user's ID from the request object
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not authenticated',
      });
    }

    const userId = req.user.id;
    const { positionId, candidateId, electionId } = req.body;

    // Verify the election exists and is active if electionId is provided
    if (electionId) {
      const election = await prisma.election.findUnique({
        where: { id: electionId },
      });

      if (!election) {
        return res.status(404).json({
          status: 'fail',
          message: 'Election not found',
        });
      }

      if (!election.isActive) {
        return res.status(403).json({
          status: 'fail',
          message: 'This election is not currently active',
        });
      }

      const now = new Date();
      if (now < election.startDate || now > election.endDate) {
        return res.status(403).json({
          status: 'fail',
          message: 'Voting is not currently open for this election',
        });
      }

      // Check if the position is part of this election
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

      // Check if multiple votes are allowed
      const settings = await prisma.electionSettings.findUnique({
        where: { electionId },
      });

      if (!settings?.allowMultipleVotes) {
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
            message:
              'You have already voted for this position in this election',
          });
        }
      }
    }

    // Create data object with the current user's ID
    const data = {
      positionId,
      candidateId,
      voterId: userId,
      electionId,
    };

    const vote = await prisma.voting.create({
      data,
      include: {
        positions: {
          select: {
            id: true,
            positionName: true,
          },
        },
        candidates: {
          select: {
            id: true,
            candidateName: true,
          },
        },
        election: electionId
          ? {
              select: {
                id: true,
                title: true,
              },
            }
          : undefined,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Vote saved successfully',
      vote: {
        id: vote.id,
        position: vote.positions
          ? {
              id: vote.positions.id,
              name: vote.positions.positionName,
            }
          : null,
        candidate: vote.candidates
          ? {
              id: vote.candidates.id,
              name: vote.candidates.candidateName,
            }
          : null,
        election: vote.election
          ? {
              id: vote.election.id,
              title: vote.election.title,
            }
          : null,
      },
    });
  } catch (error) {
    next(new HttpException(422, error.message));
  }
};

// saving multiple votes
const saveMassvotes = async (req, res, next) => {
  try {
    // Get the current user's ID from the request object
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not authenticated',
      });
    }

    const userId = req.user.id;
    const votesData = req.body;

    if (!Array.isArray(votesData) || votesData.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'No votes provided or invalid format',
      });
    }

    // Check if all votes have the same electionId
    const electionIds = [
      ...new Set(votesData.map((vote) => vote.electionId).filter(Boolean)),
    ];

    if (electionIds.length > 1) {
      return res.status(400).json({
        status: 'fail',
        message: 'All votes must be for the same election',
      });
    }

    const electionId = electionIds[0];

    // Verify the election if an electionId is provided
    if (electionId) {
      const election = await prisma.election.findUnique({
        where: { id: electionId },
      });

      if (!election) {
        return res.status(404).json({
          status: 'fail',
          message: 'Election not found',
        });
      }

      if (!election.isActive) {
        return res.status(403).json({
          status: 'fail',
          message: 'This election is not currently active',
        });
      }

      const now = new Date();
      if (now < election.startDate || now > election.endDate) {
        return res.status(403).json({
          status: 'fail',
          message: 'Voting is not currently open for this election',
        });
      }

      // Check if multiple votes are allowed
      const settings = await prisma.electionSettings.findUnique({
        where: { electionId },
      });

      if (!settings?.allowMultipleVotes) {
        // Get positions the user has already voted for in this election
        const existingVotes = await prisma.voting.findMany({
          where: {
            voterId: userId,
            electionId,
          },
          select: {
            positionId: true,
          },
        });

        const votedPositions = new Set(
          existingVotes.map((vote) => vote.positionId),
        );

        // Check for duplicate positions in the request
        const positionsInRequest = votesData.map((vote) => vote.positionId);
        const duplicatePositions = positionsInRequest.filter(
          (pos, index) => positionsInRequest.indexOf(pos) !== index,
        );

        if (duplicatePositions.length > 0) {
          return res.status(400).json({
            status: 'fail',
            message: 'Duplicate positions found in request',
          });
        }

        // Check if user has already voted for any of these positions
        const alreadyVotedPositions = positionsInRequest.filter((pos) =>
          votedPositions.has(pos),
        );

        if (alreadyVotedPositions.length > 0) {
          return res.status(400).json({
            status: 'fail',
            message:
              'You have already voted for some of these positions in this election',
          });
        }
      }

      // Verify all positions are part of the election
      const positionIds = votesData.map((vote) => vote.positionId);
      const electionPositions = await prisma.electionPosition.findMany({
        where: {
          electionId,
          positionId: {
            in: positionIds,
          },
        },
        select: {
          positionId: true,
        },
      });

      const validPositionIds = new Set(
        electionPositions.map((ep) => ep.positionId),
      );
      const invalidPositions = positionIds.filter(
        (pos) => !validPositionIds.has(pos),
      );

      if (invalidPositions.length > 0) {
        return res.status(400).json({
          status: 'fail',
          message: 'Some positions are not part of the specified election',
        });
      }
    }

    // Add user ID to each vote
    const processedVotes = votesData.map((vote) => ({
      ...vote,
      voterId: userId,
    }));

    const result = await prisma.voting.createMany({
      data: processedVotes,
    });

    res.status(201).json({
      status: 'success',
      message: `${result.count} votes saved successfully`,
      count: result.count,
    });
  } catch (error) {
    next(new HttpException(422, error.message));
  }
};

// Get votes made by the currently logged-in user
const getMyVotes = async (req, res, next) => {
  try {
    // Get the current user's ID from the request object
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        status: 'fail',
        message: 'User not authenticated',
      });
    }

    const userId = req.user.id;
    const { electionId } = req.query;

    // Build the query conditions
    const whereCondition = {
      voterId: userId,
    };

    // Add election filter if provided
    if (electionId) {
      whereCondition.electionId = electionId;
    }

    // Fetch votes for the current user with position and candidate details
    const votes = await prisma.voting.findMany({
      where: whereCondition,
      include: {
        positions: {
          select: {
            id: true,
            positionName: true,
            description: true,
          },
        },
        candidates: {
          select: {
            id: true,
            candidateName: true,
            profile: true,
          },
        },
        election: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            status: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    // Format the response
    const formattedVotes = votes.map((vote) => ({
      id: vote.id,
      position: vote.positions
        ? {
            id: vote.positions.id,
            name: vote.positions.positionName,
            description: vote.positions.description,
          }
        : null,
      candidate: vote.candidates
        ? {
            id: vote.candidates.id,
            name: vote.candidates.candidateName,
            profile: vote.candidates.profile,
          }
        : null,
      election: vote.election
        ? {
            id: vote.election.id,
            title: vote.election.title,
            status: vote.election.status,
          }
        : null,
      votedAt: vote.timestamp || vote.createdAt,
    }));

    // Group votes by election if no specific election was requested
    let response;
    if (!electionId && formattedVotes.length > 0) {
      const votesByElection = {};

      formattedVotes.forEach((vote) => {
        const electionId = vote.election?.id || 'unknown';
        if (!votesByElection[electionId]) {
          votesByElection[electionId] = {
            election: vote.election || {
              id: 'unknown',
              title: 'Unknown Election',
            },
            votes: [],
          };
        }
        votesByElection[electionId].votes.push(vote);
      });

      response = {
        status: 'success',
        totalVotes: formattedVotes.length,
        elections: Object.values(votesByElection),
      };
    } else {
      response = {
        status: 'success',
        count: formattedVotes.length,
        votes: formattedVotes,
      };
    }

    res.status(200).json(response);
  } catch (error) {
    next(new HttpException(500, error.message));
  }
};

// loading all votes with counts
const getVotes = async (req, res, next) => {
  try {
    const { electionId } = req.query;

    // Build the query conditions
    const whereCondition = {};
    if (electionId) {
      whereCondition.electionId = electionId;
    }

    // Get vote counts grouped by position and candidate
    const voteGroups = await prisma.voting.groupBy({
      by: ['positionId', 'candidateId'],
      where: whereCondition,
      _count: {
        voterId: true,
      },
    });

    // Get total vote count
    const totalVotes = await prisma.voting.count({
      where: whereCondition,
    });

    // Get position and candidate details for each vote group
    const detailedVotes = await Promise.all(
      voteGroups.map(async (voteGroup) => {
        const position = await prisma.positions.findUnique({
          where: { id: voteGroup.positionId },
          select: { id: true, positionName: true, description: true },
        });

        const candidate = await prisma.candidates.findUnique({
          where: { id: voteGroup.candidateId },
          select: { id: true, candidateName: true, profile: true },
        });

        return {
          position: position || {
            id: voteGroup.positionId,
            positionName: 'Unknown Position',
          },
          candidate: candidate || {
            id: voteGroup.candidateId,
            candidateName: 'Unknown Candidate',
          },
          voteCount: voteGroup._count.voterId,
        };
      }),
    );

    // Group by position for better organization
    const votesByPosition = {};
    detailedVotes.forEach((vote) => {
      const positionId = vote.position.id;
      if (!votesByPosition[positionId]) {
        votesByPosition[positionId] = {
          position: vote.position,
          candidates: [],
          totalVotesForPosition: 0,
        };
      }
      votesByPosition[positionId].candidates.push({
        candidate: vote.candidate,
        voteCount: vote.voteCount,
        percentage:
          totalVotes > 0
            ? Number.parseFloat(
                ((vote.voteCount / totalVotes) * 100).toFixed(2),
              )
            : 0,
      });
      votesByPosition[positionId].totalVotesForPosition += vote.voteCount;
    });

    // Sort candidates by vote count within each position
    Object.values(votesByPosition).forEach((positionResult) => {
      positionResult.candidates.sort((a, b) => b.voteCount - a.voteCount);
    });

    // Get election details if electionId was provided
    let election = null;
    if (electionId) {
      election = await prisma.election.findUnique({
        where: { id: electionId },
        select: {
          id: true,
          title: true,
          startDate: true,
          endDate: true,
          status: true,
        },
      });
    }

    res.status(200).json({
      status: 'success',
      election,
      totalVotes,
      positions: Object.values(votesByPosition),
    });
  } catch (error) {
    next(new HttpException(500, error.message));
  }
};

// exporting all functions
module.exports = {
  addVoting,
  getVotes,
  saveMassvotes,
  getMyVotes,
};
