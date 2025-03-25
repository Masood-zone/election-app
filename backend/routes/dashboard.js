const { Router } = require('express');
const dashboardRouter = Router();
const { verifyToken } = require('../verification/verifytoken');
const dashboardController = require('../controllers/dashboard');
const electionController = require('../controllers/elections');
const announcementController = require('../controllers/announcement');

// Public routes
dashboardRouter.get('/elections', electionController.getAllElections);
dashboardRouter.get('/elections/:id', electionController.getElectionById);
dashboardRouter.get(
  '/elections/:electionId/announcements',
  announcementController.getAnnouncementsByElection,
);

// Protected routes (require authentication)
dashboardRouter.use(verifyToken);
dashboardRouter.get(
  '/elections/:id/results',
  dashboardController.getElectionResults,
);

module.exports = dashboardRouter;
