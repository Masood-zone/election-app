//  importing all dependencies ,controllers and validator
const { Router } = require('express');
const adminRouter = Router();
const authentication = require('../validation/auth');
const verification = require('../verification/verifyusers');
const electionController = require('../controllers/elections');
const announcementController = require('../controllers/announcement');
const dashboardController = require('../controllers/dashboard');

const admin = require('../controllers/admin');
const userScheme = require('../schemes/userscheme');
const validation = require('../validation/user');
const votes = require('../controllers/voting');

// Protect all admin routes
adminRouter.use(verification.authenticateAdmin);
adminRouter.post(
  '/register',
  [...userScheme],
  validation.checkUserExists,
  admin.saveUser,
);
adminRouter.post('/login', authentication.userEmail, admin.login);
adminRouter.get('/profile', verification.userToken, admin.getMe);

// Dashboard routes
adminRouter.get('/dashboard', dashboardController.getDashboardAnalytics);
adminRouter.get(
  '/analytics/historical',
  dashboardController.getHistoricalAnalytics,
);

// Election routes
adminRouter.post('/elections', electionController.createElection);
adminRouter.get('/elections', electionController.getAllElections);
adminRouter.get('/elections/:id', electionController.getElectionById);
adminRouter.put('/elections/:id', electionController.updateElection);
adminRouter.delete('/elections/:id', electionController.deleteElection);
adminRouter.post(
  '/elections/:id/positions',
  electionController.addPositionsToElection,
);
adminRouter.delete(
  '/elections/:id/positions',
  electionController.removePositionsFromElection,
);
adminRouter.patch(
  '/elections/:id/settings',
  electionController.updateElectionSettings,
);
adminRouter.get(
  '/elections/:id/results',
  dashboardController.getElectionResults,
);

// Announcement routes
adminRouter.post('/announcements', announcementController.createAnnouncement);
adminRouter.get(
  '/elections/:electionId/announcements',
  announcementController.getAnnouncementsByElection,
);
adminRouter.patch(
  '/announcements/:id',
  announcementController.updateAnnouncement,
);
adminRouter.delete(
  '/announcements/:id',
  announcementController.deleteAnnouncement,
);

// Admin-only routes
adminRouter.get('/votes', votes.getVotes);
adminRouter.get('/', admin.getAllUsers);
adminRouter.get('/:id', admin.getSingleUser);
adminRouter.patch('/update/:id', admin.updateUser);
adminRouter.delete('/:id', admin.deleteUser);

//  exporting all routes
module.exports = adminRouter;
