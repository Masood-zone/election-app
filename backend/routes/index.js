//  importing express
const { Router } = require('express');
const appRouter = Router();
const admin = require('./admin');
const candidates = require('./candidates');
const positions = require('./position');
const voters = require('./voters');
const voting = require('./voting');
const dashboard = require('./dashboard');

// User routes
appRouter.use('/voters', voters);
appRouter.use('/voting', voting);

//  Admin routes
appRouter.use('/admin', admin);
appRouter.use('/candidates', candidates);
appRouter.use('/positions', positions);
appRouter.use('/dashboard', dashboard);

// exporting all routes
module.exports = appRouter;
