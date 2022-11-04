const express = require("express");
const hbs = require("hbs");
// const res = require("express/lib/response");
const generalRouter = require("./routers/general");
const postsRouter = require("./routers/posts");

const app = express();

app.use(express.urlencoded({ extended: true })); //set ให้ใช้ middleware ที่สามารถเรียกใช้ข้อมูลผ่าน body ได้เลย และที่ set true เพราะให้ express สามารถอ่านค่า array obj ที่ซับซ้อนได้
app.set("view engine", "hbs"); //set เพื่อให้้ใช้ hbs ได้
hbs.registerPartials(__dirname + "/views/partials"); //set ให้ hbs หยิบส่วนประกอบเล็กต่างๆออกมาประกอบเป็นการแสดงหน้าเวป

app.use("/", generalRouter); //ทำ router ให้จัดการระเบียบไฟล์ได้มากขึ้น

app.use("/p", postsRouter);

app.listen(9000, () => {
  //กำหนด localhost and log message
  console.log("can come in web http://localhost:9000");
});

// viewengin เป็น templet express ที่สามารถใช้ .html กับ express ได้
