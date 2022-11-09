const express = require("express");
const async = require("hbs/lib/async");
const router = express.Router(); //เรียกใช้ router
const db = require("../db"); //เรียกใช้ knex
const dayjs = require('dayjs'); //เรียกใช้ dayjs

router.get("/", async (req, res) => {
  //ให้ app รับ express มาใช้และรับ param 2 ตัวคือ path, method
  // const { q, sortBy } = req.query; //Deconstruct ตัวแปรออกมาจากการ query path (link)

  //การดึงข้อมูลจาก db โดยใช้ผ่าน knex
  let allPosts = [];
  try {
    allPosts = await db
      .select("post.id", "post.title", "post.from", "post.createdAt") //ใช้ข้อมูลอะไรมาแสดงบ้าง
      .count("comment.id as commentsCount") //ให้นับ comment id เป็นหัวตารางชื่อ commentsCount
      .from("post") //จากตาราง post
      .leftJoin("comment", "post.id", "comment.postId") //ให้ตาราง comment join post โดย field ขื่อ id and postId
      .groupBy("post.id") //เรียงโดย..
      .orderBy("post.id", "desc"); //เรียงโดย.. แบบกลับด้าน

    //format วันที่ในรูปแบบสวยๆ
    allPosts = allPosts.map(post => {
      const createdAtText = dayjs(post.createdAt).format('D MMM YYYY - HH:mm');
      return { ...post, createdAtText };
    });

  } catch (e) {
    console.error(e);
  }
  res.render("home", { allPosts }); //(1:file .hbs, 2:ตัวแปรที่จะส่งไปใข้)
});

module.exports = router; //export เตรียมเอาไปใช้
