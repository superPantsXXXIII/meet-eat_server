const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const sqlCon = require("../db/sqlConnect");
const {validateUser,validateLogin,createToken} = require("../models/userModel");
const { auth } = require("../middleware/auth");

router.get("/", async(req,res) => {
  const strSql = `SELECT * FROM users `;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.get("/describe", async(req,res) => {
  const strSql = `DESCRIBE users `;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.get("/userInfo",auth, async(req,res) => {
  const strSql = `SELECT id,name,email FROM users WHERE id = ${req.tokenData.user_id}`;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.post("/",async(req,res) => {
  const validBody = validateUser(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  const q = `INSERT INTO users VALUES (null,?,?,?,?,?)`;
  let {name,email,password} = req.body;
  password = await bcrypt.hash(password, 10);
  sqlCon.query(q,[name,password,email,"user",(new Date).toJSON().slice(0, 10)],(err,results) => {
    if(err){
      if(err.sqlState == 23000){
        return res.status(401).json({err:"the email already exists in the system"});
      }
      return res.status(400).json(err);
    }
    res.status(201).json(results);
  })
})

router.post("/login",async(req,res) => {
  const validBody = validateLogin(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  const q = `SELECT * FROM users WHERE email = ?`;
  let {email,password} = req.body;
  sqlCon.query(q,[email],async(err,results) => {
    if(err){
      return res.status(400).json(err);
    }
    if(results.length == 0){
      return res.status(401).json({err:"Email not found "});
    }
    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if(!validPassword){
      return res.status(401).json({err:"Password worng"});
    }
    const token = createToken(user.user_id);
    res.json({token});
  })
})

router.patch("/ban/:id", async(req,res) => {
  const id = Number(req.params.id);
  const strSql = `Update users set role='banned' WHERE user_id=${id}`;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.delete("/:user_id",auth,async (req, res) =>{
  const user_id = Number(req.params.user_id);
  let strSql = `Delete from users_events where user_id = ${user_id}`;
  sqlCon.query(strSql, (err, results) => {
      if (err) { return res.json(err); }
      strSql = `Delete from users where user_id = ${user_id}`;
      sqlCon.query(strSql, (err, results) => {
          if (err) { return res.json(err); }
          res.json(results);
      })
  })
})

// router.patch("/update/:id", async(req,res) => {
//   const id = Number(req.params.id);
//   const strSql = `Update users set password='' WHERE user_id=${id}`;
//   sqlCon.query(strSql, (err, results) => {
//     if (err) { return res.json(err); }
//     res.json(results);
//   })
// })

module.exports = router;