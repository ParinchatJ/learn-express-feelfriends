const express = require("express");
const { route } = require("./general");
const router = express.Router();
const db = require("../db");
const async = require("hbs/lib/async");
const dayjs = require("dayjs");

async function getPostAndComments(postId) {
  let onePost = null;
  let postComments = [];
  try {
    //one post
    const draftPost = await db
      .select("*")
      .from("post")
      .where("id", +postId);
    onePost = draftPost[0];
    onePost.createdAtText = dayjs(onePost.createdAt).format(
      "D MMM YYYY - HH:mm"
    );

    //post comments
    postComments = await db
      .select("*")
      .from("comment")
      .where("postId", +postId)
      .orderBy("id", "asc");

    postComments = postComments.map((comment) => {
      const createdAtText = dayjs(comment.createdAt).format(
        "D MMM YYYY - HH:mm"
      );
      return { ...comment, createdAtText };
    });
  } catch (e) {
    console.error(e);
  }

  const customTitle = !!onePost ? `${onePost.title} | ` : "Not found! | ";
  return { onePost, postComments, customTitle };
}

// router

router.get("/new", (req, res) => {
  res.render("postNew");
});

router.post("/new", async (req, res) => {
  const { title, content, from, accepted } = req.body ?? {};
  try {
    if (!title || !content || !from) {
      throw new Error("Empty content!");
    } else if (accepted != "on") {
      throw new Error("No accepted");
    }

    await db
      .insert({ title, content, from, createdAt: new Date() })
      .into("post");
  } catch (e) {
    console.error(e);

    let errorMessage = "Somthing error";
    if (e.message === "Empty content!") {
      errorMessage = "Pls enter information";
    } else if (e.message === "No accepted") {
      errorMessage = "No accepted - Pls mark DONE";
    }

    return res.render("postNew", {
      errorMessage,
      values: { title, content, from },
    });
  }

  res.redirect("/p/new/done");
});

router.get("/new/done", (req, res) => {
  res.render("postNewDone");
});

router.get("/:postId", async (req, res) => {
  const { postId } = req.params;

  const postData = await getPostAndComments(postId);

  res.render("postId", postData);
});

router.post("/:postId/comment", async (req, res) => {
  const { postId } = req.params;
  const { content, from, accepted } = req.body ?? {};
  try {
    if (!content || !from) {
      throw new Error("Empty content!");
    } else if (accepted !== "on") {
      throw new Error("No accepted");
    }

    await db
      .insert({ content, from, createdAt: new Date(), postId })
      .into("comment");
  } catch (e) {
    console.error(e);

    let errorMessage = "Somthing error";
    if (e.message === "Empty content!") {
      errorMessage = "Pls enter information";
    } else if (e.message === "No accepted") {
      errorMessage = "No accepted - Pls mark DONE";
    }

    const postData = await getPostAndComments(postId);

    return res.render("postId", {
      ...postData,
      errorMessage,
      commentvalues: { content, from },
    });
  }

  res.redirect(`/p/${postId}`);
});

module.exports = router;
