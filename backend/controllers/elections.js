const prisma = require('../db/prisma-db');

// Create a new election
const createElection = async (req, res, next) => {
  try {
    const { title, description, startDate, endDate, positions, settings } =
      req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      return res.status(400).json({
        status: 'fail',
        message: 'End date must be after start date',
      });
    }

    // Create the election with a transaction to ensure all related data is created
    const result = await prisma.$transaction(async (tx) => {
      // Create the election
      const election = await tx.election.create({
        data: {
          title,
          description,
          startDate: start,
          endDate: end,
          status: determineElectionStatus(start, end),
          isActive: false,
        },
      });

      // Create election settings if provided
      if (settings) {
        await tx.electionSettings.create({
          data: {
            electionId: election.id,
            allowMultipleVotes: settings.allowMultipleVotes || false,
            resultsVisibility: settings.resultsVisibility || 'AFTER_END',
            requireVerification: settings.requireVerification || true,
            allowAbstention: settings.allowAbstention || false,
          },
        });
      } else {
        // Create default settings
        await tx.electionSettings.create({
          data: {
            electionId: election.id,
          },
        });
      }

      // Associate positions with the election if provided
      if (positions && positions.length > 0) {
        const positionLinks = positions.map((positionId) => ({
          positionId,
          electionId: election.id,
        }));

        await tx.electionPosition.createMany({
          data: positionLinks,
        });
      }

      // Return the created election with its relations
      return await tx.election.findUnique({
        where: { id: election.id },
        include: {
          positions: {
            include: {
              position: true,
            },
          },
          settings: true,
        },
      });
    });

    res.status(201).json({
      status: 'success',
      message: 'Election created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error creating election:', error);
    next(new HttpException(500, error.message));
  }
};

// Get all elections with pagination and filtering
const getAllElections = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status, search, active } = req.query;
    const skip = (Number.parseInt(page) - 1) * Number.parseInt(limit);

    // Build filter conditions
    const where = {};

    if (status) {
      where.status = status;
    }

    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get elections with count
    const [elections, totalCount] = await Promise.all([
      prisma.election.findMany({
        where,
        skip,
        take: Number.parseInt(limit),
        orderBy: { startDate: 'desc' },
        include: {
          positions: {
            include: {
              position: true,
            },
          },
          settings: true,
          _count: {
            select: {
              votes: true,
            },
          },
        },
      }),
      prisma.election.count({ where }),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / Number.parseInt(limit));

    res.status(200).json({
      status: 'success',
      data: {
        elections,
        pagination: {
          total: totalCount,
          pages: totalPages,
          page: Number.parseInt(page),
          limit: Number.parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching elections:', error);
    next(new HttpException(500, error.message));
  }
};

// Get a single election by ID
const getElectionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const election = await prisma.election.findUnique({
      where: { id },
      include: {
        positions: {
          include: {
            position: {
              include: {
                candidates: true,
              },
            },
          },
        },
        settings: true,
        announcements: {
          where: {
            isPublished: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
        _count: {
          select: {
            votes: true,
          },
        },
      },
    });

    if (!election) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    res.status(200).json({
      status: 'success',
      data: election,
    });
  } catch (error) {
    console.error('Error fetching election:', error);
    next(new HttpException(500, error.message));
  }
};

// Update an election
const updateElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, startDate, endDate, isActive, status } =
      req.body;

    // Check if election exists
    const existingElection = await prisma.election.findUnique({
      where: { id },
    });

    if (!existingElection) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    // Prepare update data
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;

    if (startDate !== undefined) {
      updateData.startDate = new Date(startDate);
    }

    if (endDate !== undefined) {
      updateData.endDate = new Date(endDate);
    }

    if (isActive !== undefined) {
      updateData.isActive = isActive;
    }

    if (status !== undefined) {
      updateData.status = status;
    } else if (startDate || endDate) {
      // Recalculate status if dates changed
      const start = startDate
        ? new Date(startDate)
        : existingElection.startDate;
      const end = endDate ? new Date(endDate) : existingElection.endDate;
      updateData.status = determineElectionStatus(start, end);
    }

    // Update the election
    const updatedElection = await prisma.election.update({
      where: { id },
      data: updateData,
      include: {
        positions: {
          include: {
            position: true,
          },
        },
        settings: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Election updated successfully',
      data: updatedElection,
    });
  } catch (error) {
    console.error('Error updating election:', error);
    next(new HttpException(500, error.message));
  }
};

// Delete an election
const deleteElection = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if election exists
    const existingElection = await prisma.election.findUnique({
      where: { id },
    });

    if (!existingElection) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    // Delete the election and all related data in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete related announcements
      await tx.announcement.deleteMany({
        where: { electionId: id },
      });

      // Delete related election positions
      await tx.electionPosition.deleteMany({
        where: { electionId: id },
      });

      // Delete election settings
      await tx.electionSettings.deleteMany({
        where: { electionId: id },
      });

      // Delete votes related to this election
      await tx.voting.deleteMany({
        where: { electionId: id },
      });

      // Finally delete the election
      await tx.election.delete({
        where: { id },
      });
    });

    res.status(200).json({
      status: 'success',
      message: 'Election deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting election:', error);
    next(new HttpException(500, error.message));
  }
};

// Add positions to an election
const addPositionsToElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { positions } = req.body;

    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of position IDs',
      });
    }

    // Check if election exists
    const existingElection = await prisma.election.findUnique({
      where: { id },
    });

    if (!existingElection) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    // Get existing position links to avoid duplicates
    const existingLinks = await prisma.electionPosition.findMany({
      where: {
        electionId: id,
        positionId: {
          in: positions,
        },
      },
      select: {
        positionId: true,
      },
    });

    const existingPositionIds = existingLinks.map((link) => link.positionId);

    // Filter out positions that are already linked
    const newPositions = positions.filter(
      (positionId) => !existingPositionIds.includes(positionId),
    );

    if (newPositions.length === 0) {
      return res.status(200).json({
        status: 'success',
        message: 'All positions are already added to this election',
      });
    }

    // Create new position links
    const positionLinks = newPositions.map((positionId) => ({
      positionId,
      electionId: id,
    }));

    await prisma.electionPosition.createMany({
      data: positionLinks,
    });

    // Get updated election with positions
    const updatedElection = await prisma.election.findUnique({
      where: { id },
      include: {
        positions: {
          include: {
            position: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      message: `${newPositions.length} positions added to the election`,
      data: updatedElection,
    });
  } catch (error) {
    console.error('Error adding positions to election:', error);
    next(new HttpException(500, error.message));
  }
};

// Remove positions from an election
const removePositionsFromElection = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { positions } = req.body;

    if (!positions || !Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an array of position IDs',
      });
    }

    // Check if election exists
    const existingElection = await prisma.election.findUnique({
      where: { id },
    });

    if (!existingElection) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    // Delete the position links
    await prisma.electionPosition.deleteMany({
      where: {
        electionId: id,
        positionId: {
          in: positions,
        },
      },
    });

    // Get updated election with positions
    const updatedElection = await prisma.election.findUnique({
      where: { id },
      include: {
        positions: {
          include: {
            position: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Positions removed from the election',
      data: updatedElection,
    });
  } catch (error) {
    console.error('Error removing positions from election:', error);
    next(new HttpException(500, error.message));
  }
};

// Update election settings
const updateElectionSettings = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      allowMultipleVotes,
      resultsVisibility,
      requireVerification,
      allowAbstention,
    } = req.body;

    // Check if election exists
    const existingElection = await prisma.election.findUnique({
      where: { id },
      include: {
        settings: true,
      },
    });

    if (!existingElection) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    // Prepare update data
    const updateData = {};

    if (allowMultipleVotes !== undefined)
      updateData.allowMultipleVotes = allowMultipleVotes;
    if (resultsVisibility !== undefined)
      updateData.resultsVisibility = resultsVisibility;
    if (requireVerification !== undefined)
      updateData.requireVerification = requireVerification;
    if (allowAbstention !== undefined)
      updateData.allowAbstention = allowAbstention;

    // Update or create settings
    let settings;

    if (existingElection.settings) {
      // Update existing settings
      settings = await prisma.electionSettings.update({
        where: { electionId: id },
        data: updateData,
      });
    } else {
      // Create new settings
      settings = await prisma.electionSettings.create({
        data: {
          ...updateData,
          electionId: id,
        },
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Election settings updated successfully',
      data: settings,
    });
  } catch (error) {
    console.error('Error updating election settings:', error);
    next(new HttpException(500, error.message));
  }
};

// Helper function to determine election status based on dates
const determineElectionStatus = (startDate, endDate) => {
  const now = new Date();

  if (now < startDate) {
    return 'UPCOMING';
  } else if (now >= startDate && now <= endDate) {
    return 'ONGOING';
  } else {
    return 'COMPLETED';
  }
};

// Export all functions
module.exports = {
  createElection,
  getAllElections,
  getElectionById,
  updateElection,
  deleteElection,
  addPositionsToElection,
  removePositionsFromElection,
  updateElectionSettings,
};
