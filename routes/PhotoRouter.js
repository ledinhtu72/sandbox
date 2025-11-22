const express = require("express");
const mongoose = require("mongoose");
const Photo = require("../db/photoModel");
const User = require("../db/userModel");
const router = express.Router();

// Return photos of user with comment user info embedded minimally
router.get("/photosOfUser/:id", async (request, response) => {
  const id = request.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return response.status(400).send({ message: "Invalid user id" });
  }
  try {
    // Use lean() so we get plain JS objects we can modify freely
    const photos = await Photo.find({ user_id: id }).lean().exec();

    // Collect unique user_ids referenced in comments
    const commentUserIds = new Set();
    photos.forEach((p) => {
      if (Array.isArray(p.comments)) {
        p.comments.forEach((c) => {
          if (c.user_id) commentUserIds.add(String(c.user_id));
        });
      }
    });

    const users =
      commentUserIds.size > 0
        ? await User.find(
            { _id: { $in: Array.from(commentUserIds) } },
            "_id first_name last_name"
          ).exec()
        : [];

    const userMap = {};
    users.forEach((u) => {
      userMap[String(u._id)] = {
        _id: u._id,
        first_name: u.first_name,
        last_name: u.last_name,
      };
    });

    // Build response photos with required fields and comment.user as minimal object
    const result = photos.map((p) => {
      const comments = (p.comments || []).map((c) => {
        return {
          _id: c._id,
          comment: c.comment,
          date_time: c.date_time,
          user: userMap[String(c.user_id)] || null,
        };
      });
      return {
        _id: p._id,
        user_id: p.user_id,
        file_name: p.file_name,
        date_time: p.date_time,
        comments: comments,
      };
    });

    response.json(result);
  } catch (err) {
    console.error("Error fetching photos: ", err);
    response.status(500).send({ message: "Internal server error." });
  }
});

module.exports = router;
