const prisma = require('../db/prisma-db');

// Create a new announcement
const createAnnouncement = async (req, res, next) => {
  try {
    const { electionId, title, content, isPublished } = req.body;

    // Check if the election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    // Create the announcement
    const announcement = await prisma.announcement.create({
      data: {
        electionId,
        title,
        content,
        isPublished: isPublished || false,
      },
    });

    res.status(201).json({
      status: 'success',
      message: 'Announcement created successfully',
      data: announcement,
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    next(new HttpException(500, error.message));
  }
};

// Get all announcements for an election
const getAnnouncementsByElection = async (req, res, next) => {
  try {
    const { electionId } = req.params;
    const { includeUnpublished } = req.query;

    // Check if the election exists
    const election = await prisma.election.findUnique({
      where: { id: electionId },
    });

    if (!election) {
      return res.status(404).json({
        status: 'fail',
        message: 'Election not found',
      });
    }

    // Build query conditions
    const where = { electionId };

    // Only admins should see unpublished announcements
    if (!includeUnpublished || includeUnpublished !== 'true') {
      where.isPublished = true;
    }

    // Get announcements
    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.status(200).json({
      status: 'success',
      data: announcements,
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    next(new HttpException(500, error.message));
  }
};

// Update an announcement
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content, isPublished } = req.body;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        status: 'fail',
        message: 'Announcement not found',
      });
    }

    // Prepare update data
    const updateData = {};

    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (isPublished !== undefined) updateData.isPublished = isPublished;

    // Update the announcement
    const updatedAnnouncement = await prisma.announcement.update({
      where: { id },
      data: updateData,
    });

    res.status(200).json({
      status: 'success',
      message: 'Announcement updated successfully',
      data: updatedAnnouncement,
    });
  } catch (error) {
    console.error('Error updating announcement:', error);
    next(new HttpException(500, error.message));
  }
};

// Delete an announcement
const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if announcement exists
    const existingAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!existingAnnouncement) {
      return res.status(404).json({
        status: 'fail',
        message: 'Announcement not found',
      });
    }

    // Delete the announcement
    await prisma.announcement.delete({
      where: { id },
    });

    res.status(200).json({
      status: 'success',
      message: 'Announcement deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting announcement:', error);
    next(new HttpException(500, error.message));
  }
};

// Get all published announcements
const getAllAnnouncements = async (req, res, next) => {
  try {
    const { includeUnpublished } = req.query;
    const isAdmin = req.user && req.user.isAdmin;

    // Build query conditions
    const where = {};

    // Only admins should see unpublished announcements
    if ((!includeUnpublished || includeUnpublished !== 'true') && !isAdmin) {
      where.isPublished = true;
    }

    // Get announcements with election details
    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        election: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            status: true,
            isActive: true,
          },
        },
      },
    });

    res.status(200).json({
      status: 'success',
      data: announcements,
    });
  } catch (error) {
    console.error('Error fetching all announcements:', error);
    next(new HttpException(500, error.message));
  }
};

// Export all functions
module.exports = {
  getAllAnnouncements,
  createAnnouncement,
  getAnnouncementsByElection,
  updateAnnouncement,
  deleteAnnouncement,
};
