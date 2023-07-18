const express = require("express");
const router = express.Router();
const sqlCon = require("../db/sqlConnect");
const { auth } = require("../middleware/auth");
const { validateEvent } = require("../models/eventModel")

router.get("/", async (req, res) => {
    const strSql = `SELECT *,(SELECT count(*) FROM users_events where event_id = (select event_id from users_events where events.event_id = users_events.event_id)) current_particepants FROM events `;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err); }
        res.json(results);
    })
})

router.get("/single/:event_id", async (req, res) => {
    const event_id = Number(req.params.event_id);
    const strSql = `SELECT *,(SELECT count(*) FROM users_events where event_id=${event_id}) current_paticipants FROM events where event_id=${event_id}`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err); }
        res.json(results);
    })
})

router.get("/describe", async (req, res) => {
    const strSql = `DESCRIBE events `;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })
})


router.get("/users", async (req, res) => {
    const strSql = `SELECT * FROM users_events `;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })
})

router.get("/users/count/:event_id", async (req, res) => {
    const event_id = Number(req.params.event_id);
    const strSql = `SELECT count(*) current_paticipants,(SELECT max_paticipants from events  where event_id=${event_id}) max_paticipants FROM users_events where event_id=${event_id}`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })
})

router.get("/users/getHostedEvents/:user_id", async (req, res) => {
    const user_id = Number(req.params.user_id);
    const strSql = `SELECT * FROM events where event_id in (SELECT event_id FROM users_events where user_id=${user_id})`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })
})

router.get("/users/getParticipants/:event_id", async (req, res) => {
    const event_id = Number(req.params.event_id);
    const strSql = `SELECT * FROM users_events where event_id =${event_id} and host = 0`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })
})

router.get("/users/describe", async (req, res) => {
    const strSql = `DESCRIBE users_events `;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })
})

router.post("/", auth, async (req, res) => {
    const validBody = validateEvent(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    let strSql = `INSERT INTO events VALUES (null,?,?,?,?,?,?,?)`;
    let { title, city, adress, description, event_date, max_paticipants } = req.body;
    sqlCon.query(strSql, [title, city, adress, description, (new Date).toJSON().slice(0, 10), event_date, max_paticipants], (err, results) => {
        if (err) {
            return res.status(400).json(err);
        }
        // res.status(201).json(results);
        strSql = `INSERT INTO users_events VALUES (?,?,?,?)`;
        sqlCon.query(strSql, [req.tokenData.user_id, results.insertId, 1, 1], (err, results) => {
            if (err) {
                return res.status(400).json(err);
            }
            res.status(201).json(results);
        })
    })
})

router.post("/joinEvent/:event_id", auth, async (req, res) => {
    const event_id = Number(req.params.event_id);
    const strSql = `INSERT INTO users_events VALUES (?,?,?,?)`;
    sqlCon.query(strSql, [req.tokenData.user_id, event_id, 0, 0], (err, results) => {
        if (err) { return res.json(err); }
        res.json(results);
    })
})

router.put("/:event_id", async (req, res) => {
    const validBody = validateEvent(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    const event_id = Number(req.params.event_id);
    const strSql = `Update events set title=?,city=?,adress=?,description=?,event_date=?,max_paticipants=? where  event_id = ${event_id}`;
    let { title, city, adress, description, event_date, max_paticipants } = req.body;
    sqlCon.query(strSql, [title, city, adress, description,event_date, max_paticipants], (err, results) => {
        if (err) {
            return res.status(400).json(err);
        }
        res.status(201).json(results);
    })
})

router.patch("/users/approve", async (req, res) => {
    const user_id = Number(req.body.user_id);
    const event_id = Number(req.body.event_id);
    const strSql = `Update users_events set approved=1 where user_id = ${user_id} and event_id = ${event_id}`; 
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })  
})

router.delete("/:event_id", auth, async (req, res) => {
    const event_id = Number(req.params.event_id);
    let strSql = `Delete from users_events where event_id = ${event_id}`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err); }
        strSql = `Delete from events where event_id = ${event_id}`;
        sqlCon.query(strSql, (err, results) => {
            if (err) { return res.json(err); }
            res.json(results);
        })
    })
})


module.exports = router;