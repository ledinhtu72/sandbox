const express = require("express");
const mongoose = require("mongoose");
const User = require("../db/userModel");
const router = express.Router();

// Return a list of users for sidebar: only _id, first_name, last_name
router.get("/list", async (request, response) => {
  try {
    const users = await User.find({}, "_id first_name last_name").exec();
    response.json(users);
  } catch (err) {
    console.error("Error fetching user list: ", err);
    response.status(500).send({ message: "Internal server error." });
  }
});

// Return detailed user info for given id
router.get("/:id", async (request, response) => {
  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send({ message: "Invalid user id" });
  }
  try {
    const user = await User.findById(
      id,
      "_id first_name last_name location description occupation"
    ).exec();
    if (!user) {
      return response.status(400).send({ message: "User not found" });
    }
    response.json(user);
  } catch (err) {
    console.error("Error fetching user: ", err);
    response.status(500).send({ message: "Internal server error." });
  }
});

module.exports = router;
