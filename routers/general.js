const express = require("express");
const async = require("hbs/lib/async");
const router = express.Router();
const db = require("../db");
const dayjs = require("dayjs");

router.get("/", async (req, res) => {
  let allPosts = [];
  try {
    allPosts = await db
      .select("post.id", "post.title", "post.from", "post.createdAt")
      .count("comment.id as commentsCount")
      .from("post")
      .leftJoin("comment", "post.id", "comment.postId")
      .groupBy("post.id")
      .orderBy("post.id", "desc");

    allPosts = allPosts.map((post) => {
      const createdAtText = dayjs(post.createdAt).format("D MMM YYYY - HH:mm");
      return { ...post, createdAtText };
    });
  } catch (e) {
    console.error(e);
  }
  res.render("home", { allPosts }); 
});

module.exports = router; 
