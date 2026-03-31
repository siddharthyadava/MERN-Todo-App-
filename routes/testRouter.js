const express = require("express");
const {
  keepAliveController,
  testingController,
} = require("../controllers/testController");

//router object
const router = express.Router();

//Routes
router.get("/", testingController);
router.get("/keepalive", keepAliveController);

//export
module.exports = router;
