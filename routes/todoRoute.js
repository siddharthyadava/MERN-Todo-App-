const express = require("express");
const {
  createTodoController,
  getTodoController,
  deleteTodoController,
} = require("../controllers/todoController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

//create todo
router.post("/create", authMiddleware, createTodoController);

//GET TODO
router.post("/getAll/:userId", authMiddleware, getTodoController);

//DELETE TODO
router.post('/delete/:id', authMiddleware, deleteTodoController);

module.exports = router;
