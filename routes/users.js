const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const sqlCon = require("../db/sqlConnect");
const { validateUser, validateLogin, createToken,validateEmailSent } = require("../models/userModel");
const { auth } = require("../middleware/auth");
const novu = require("../middleware/notification");
const { async } = require("rxjs");
const { UserSend } = require("../middleware/sendGrid")

router.get("/", async (req, res) => {
  const strSql = `SELECT user_id,name,email,role FROM users `;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.get("/describe", async (req, res) => {
  const strSql = `DESCRIBE users `;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.get("/userInfo", auth, async (req, res) => {
  const strSql = `SELECT user_id,name,email FROM users WHERE user_id = ${req.tokenData.user_id}`;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.get("/checkToken", auth, async (req, res) => {
  res.json({ user_id: req.tokenData.user_id, role: req.tokenData.role })
})

router.post("/", async (req, res) => {
  const validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const q = `INSERT INTO users VALUES (null,?,?,?,?,?)`;
  let { name, email, password } = req.body;
  password = await bcrypt.hash(password, 10);
  sqlCon.query(q, [name, password, email, "user", (new Date).toJSON().slice(0, 10)], (err, results) => {
    if (err) {
      if (err.sqlState == 23000) {
        return res.status(401).json({ err: "the email already exists in the system" });
      }
      return res.status(400).json(err);
    }
    console.log(results);
    const strSql = `SELECT * FROM users WHERE user_id = ${results.insertId}`;
    sqlCon.query(strSql, (err, results) => {
      if (err) { return res.json(err); }
      subscribe(results[0]);
    })
    res.status(201).json(results);
  })
})

async function subscribe(results) {
  const subscriberId = results.user_id + "";
  await novu.subscribers.identify(subscriberId, {
    email: results.email,
    firstName: results.name,
  });
}

router.post("/login", async (req, res) => {
  const validBody = validateLogin(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const q = `SELECT * FROM users WHERE email = ?`;
  let { email, password } = req.body;
  sqlCon.query(q, [email], async (err, results) => {
    if (err) {
      return res.status(400).json(err);
    }
    if (results.length == 0) {
      return res.status(401).json({ err: "Email not found " });
    }
    const user = results[0];
    if (user.role == "banned") {
      return res.status(401).json({ err: "this user has been banned for inapropriate conduct" });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ err: "Password worng" });
    }
    const token = createToken(user.user_id, user.role);
    res.json({ token });
  })
})

router.put("/:user_id", async (req, res) => {
  const validBody = validateUser(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  const user_id = Number(req.params.user_id);
  const strSql = `Update events set name=?,password=?,email=? where  user_id = ${user_id}`;
  let { name, password, email } = req.body;
  sqlCon.query(strSql, [name, password, email], (err, results) => {
    if (err) {
      return res.status(400).json(err);
    }
    res.status(201).json(results);
  })
})

router.patch("/ban/:id", async (req, res) => {
  const id = Number(req.params.id);
  const strSql = `Update users set role='banned' WHERE user_id=${id}`;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.patch("/updateRole/:id/:role", async (req, res) => {
  const id = Number(req.params.id);
  const newRole = String(req.params.role);
  const strSql = `Update users set role=? WHERE user_id=?`;
  sqlCon.query(strSql, [newRole, id], (err, results) => {
    if (err) { return res.json(err); }
    res.json(results);
  })
})

router.delete("/:user_id", auth, async (req, res) => {
  const user_id = Number(req.params.user_id);
  let strSql = `Delete from users_events where user_id = ${user_id}`;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err); }
    strSql = `Delete from users where user_id = ${user_id}`;
    sqlCon.query(strSql, (err, results) => {
      if (err) { return res.json(err); }
      strSql = `Delete from events where event_id not in (select event_id from users_events)`;
      sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err); }
        res.json(results);
      })
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

router.post("/sendMail", auth, async (req, res) => {
  const validBody = validateEmailSent(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details);
  }
  UserSend(req.body.email,req.body.subject,req.body.text)
})


module.exports = router;