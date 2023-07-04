// importing dependencies
const express =require("express");
const bodyparser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8080;
const cors = require("cors");
require("dotenv/config");
const appRoutes = require("./routes/index");
// using middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(bodyparser.json());
app.use("/api", appRoutes);
// endpoint test
app.get("/", (req, res, next) => {
  res.status(200).json({
    message: "welcome to our  voting app",
  });
});
app.use((error, req, res, next) => {
  console.log(error.message);
  res.status(error.status).json({
      status: error.status,
      message: error.message
  });
});
// server activation
app.listen(PORT, () => {
  console.log(`server running on port${PORT}`);
});
