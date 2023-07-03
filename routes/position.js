const { Router } = require("express");
const positionsRouter = Router();
// const express = require("express");
// // const Router = express.Router();
// // const { Router } = require(express);
// const positionsRouter = express.Router();
const positions = require("../controllers/positions");
const validation = require("../validation/position");
positionsRouter.post( "/",validation.checkpositionExists,positions.createPosition);
positionsRouter.get("/", positions.getAllPosition);
positionsRouter.get("/:id", positions.getPositionById);
positionsRouter.delete("/:id", positions.deletePostion);
positionsRouter.patch("/:id", positions.updatePosition);
module.exports = positionsRouter;
