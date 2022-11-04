const express = require('express');
const { route } = require('./general');
const router = express.Router();
const db = require('../db'); //knex
const async = require('hbs/lib/async');

router.get("/new", (req, res) => {
    res.render("postNew");
  });
  
router.post("/new", (req, res) => {
    // console.log(req.body)
    const { title } = req.body ?? {}; //ถ้าไม่มี title ให้ return ค่าว่าง
    res.send(`submit form name is ${title}`); //เราสามารถนำข้อมูล title มาเรียกใช้อย่างอื่นได้อีก
  });
  
router.get("/:postId", async (req, res) => {
    const { postId } = req.params; //นำเลขหน้า (id) มาใช้ และสามารถนำไปใช้อย่างอื่นได้
    // const onePost = allPosts.find((post) => post.id === +id); //find 1 post from allpost (เครื่องหมาย + คือ shortcut แปลงเป็น Number)

    let onePost = null;
    let postComments = [];
    try {
      //one post
      const draftPost = await db
        .select('*')
        .from('post')
        .where('id', +postId) //เมื่อ id === +postId (postId ตัวหลังคือ id ที่เราเรียกใช้จาก route อันนี้)
      onePost = draftPost[0]; //เอา post ตัวแรกที่ได้ (ได้ตัวเดียว) มาเป็นข้อมูลตัวเดียว (เราไม่ต้องการ array)

      //post comments
      postComments = await db
        .select('*')
        .from('comment')
        .where('postId' +postId)  //เมื่อ postId === +postId (postId ตัวหลังคือ id ที่เราเรียกใช้จาก route อันนี้)
    }
    catch (e) {
      console.error(e);
    }

    const customTitle = !!onePost ? `${onePost.title} | ` : "Not found! | "; //ให้ title แสดงเป็นชื่อแต่ละ post และเช็คว่าถ้าไม่มีให้แสดง Not found

    res.render("postId", { onePost, postComments, customTitle });
  });

module.exports = router;