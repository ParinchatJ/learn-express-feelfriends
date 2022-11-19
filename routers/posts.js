const express = require("express");
const { route } = require("./general");
const router = express.Router();
const db = require("../db"); //knex
const async = require("hbs/lib/async");
const dayjs = require("dayjs"); //เรียกใช้ dayjs

async function getPostAndComments(postId) {
  let onePost = null;
  let postComments = [];
  try {
    //one post
    const draftPost = await db
      .select("*")
      .from("post")
      .where("id", +postId); //เมื่อ id === +postId (postId ตัวหลังคือ id ที่เราเรียกใช้จาก route อันนี้)
    onePost = draftPost[0]; //เอา post ตัวแรกที่ได้ (ได้ตัวเดียว) มาเป็นข้อมูลตัวเดียว (เราไม่ต้องการ array)
    onePost.createdAtText = dayjs(onePost.createdAt).format(
      "D MMM YYYY - HH:mm"
    ); //format วันที่ในรูปแบบสวยๆ

    //post comments
    postComments = await db
      .select("*")
      .from("comment")
      .where('postId', +postId)
      .orderBy('id', 'asc');
      
    //format วันที่ในรูปแบบสวยๆ
    postComments = postComments.map((comment) => {
      const createdAtText = dayjs(comment.createdAt).format(
        "D MMM YYYY - HH:mm"
      );
      return { ...comment, createdAtText };
    });
  } catch (e) {
    console.error(e);
  }

  const customTitle = !!onePost ? `${onePost.title} | ` : "Not found! | "; //ให้ title แสดงเป็นชื่อแต่ละ post และเช็คว่าถ้าไม่มีให้แสดง Not found
  return { onePost, postComments, customTitle }
}

// router

router.get("/new", (req, res) => {
  res.render("postNew");
});

router.post("/new", async (req, res) => {
  // console.log(req.body)
  const { title, content, from, accepted } = req.body ?? {}; //ถ้าไม่มี title ให้ return ค่าว่าง
  try {
    // validation in new post form
    if (!title || !content || !from) {
      throw new Error('Empty content!');
    } 
    else if (accepted != 'on') {
      throw new Error('No accepted');
    }

    // insert new data in db
                                          // createdAt: new Date() -> ทำให้เวลาที่ save เป็นไปตามประเทศที่ใช้ (1) อีกอันใน db
    await db.insert({ title, content, from, createdAt: new Date() }).into("post");
  } 
  catch (e) {
    console.error(e);

    // validate value and error message
    let errorMessage = 'Somthing error';
    if (e.message === 'Empty content!') {
      errorMessage = 'Pls enter information';
    }
    else if (e.message === 'No accepted') {
      errorMessage = 'No accepted - Pls mark DONE'
    }

    // ใส่ return ให้พอทำเสร็จไม่ต้องลงไปทำข้างล่างต่อ
    return res.render('postNew', {errorMessage, values: { title, content, from }});
  }

  res.redirect("/p/new/done");
  // res.send(`submit form name is ${title}`); //เราสามารถนำข้อมูล title มาเรียกใช้อย่างอื่นได้อีก
});

router.get("/new/done", (req,res) => {
  res.render("postNewDone");
});

router.get("/:postId", async (req, res) => {
  const { postId } = req.params; //นำเลขหน้า (id) มาใช้ และสามารถนำไปใช้อย่างอื่นได้
  // const onePost = allPosts.find((post) => post.id === +id); //find 1 post from allpost (เครื่องหมาย + คือ shortcut แปลงเป็น Number)

  // นำ function ข้างบนมาใช้ 
  const postData = await getPostAndComments(postId);

  res.render("postId", postData);
});

router.post('/:postId/comment', async (req, res) => {
  const { postId } = req.params;
  const { content, from, accepted } = req.body ?? {}; //ถ้าไม่มี title ให้ return ค่าว่าง
  try {
    // validation in new post form
    if ( !content || !from) {
      throw new Error('Empty content!');
    } 
    else if (accepted !== 'on') {
      throw new Error('No accepted');
    }

    // insert new data in db
                                          // createdAt: new Date() -> ทำให้เวลาที่ save เป็นไปตามประเทศที่ใช้ (1) อีกอันใน db
    await db.insert({ content, from, createdAt: new Date(), postId }).into("comment");
  } 
  catch (e) {
    console.error(e);

    // validate value and error message
    let errorMessage = 'Somthing error';
    if (e.message === 'Empty content!') {
      errorMessage = 'Pls enter information';
    }
    else if (e.message === 'No accepted') {
      errorMessage = 'No accepted - Pls mark DONE'
    }
    // นำ function ข้างบนมาใช้ 
    const postData = await getPostAndComments(postId);
    // ใส่ return ให้พอทำเสร็จไม่ต้องลงไปทำข้างล่างต่อ
    return res.render('postId', { ...postData, errorMessage, commentvalues: {  content, from }});
  }

  res.redirect(`/p/${postId}`);
  // res.send(`submit form name is ${title}`); //เราสามารถนำข้อมูล title มาเรียกใช้อย่างอื่นได้อีก
});

module.exports = router;
