const express = require("express");
const router = express.Router();
const { Subject } = require("rxjs")
const queue = new Subject();
const sqlCon = require("../db/sqlConnect");
const { auth } = require("../middleware/auth");
const { validateEvent } = require("../models/eventModel");
const { sendRequestToHost,sendApproval} = require("../middleware/sendGrid")
queueSub();

router.get("/", async (req, res) => {
    const strSql = `SELECT *,(SELECT count(*) FROM users_events WHERE event_id = events.event_id) current_particepants FROM events `;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err); }
        res.json(results);
    })
})

router.get("/forShow", async (req, res) => {
    const strSql = `SELECT events.event_id,title,city,adress,description,date_created,event_date,max_paticipants,(SELECT count(*) FROM users_events WHERE event_id = events.event_id) current_particepants,user_id FROM events,users_events where events.event_id = users_events.event_id`;
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

router.get("/users/getAllMyEvents",auth, async (req, res) => {
    const host = req.query.host ? "and host = 1" : "";
    const strSql = `SELECT * FROM events where event_id in (SELECT event_id FROM users_events where user_id=${req.tokenData.user_id} ${host})`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })
})

router.get("/users/getParticipants/:event_id", async (req, res) => {
    const event_id = Number(req.params.event_id);
    const host = req.query.host ? "" : "and host = 0";
    const strSql = `SELECT name,email,approved,host FROM users_events,users where event_id =${event_id} ${host} and users.user_id = users_events.user_id `;
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
    let event_id = Number(req.params.event_id);
    let strSql = `SELECT count(*) current_paticipants,(SELECT max_paticipants from events  where event_id=${event_id}) max_paticipants FROM users_events where event_id=${event_id}`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        if (results[0] && results[0].current_paticipants < results[0].max_paticipants) {
            strSql = `INSERT INTO users_events VALUES (?,?,?,?)`;
            sqlCon.query(strSql, [req.tokenData.user_id, event_id, 0, 0], (err, results) => {
                if (err) { return res.json(err); }
                res.json(results);
            })
            queue.next(event_id)
        }
        else {
            res.json({ err: "event maxed out or doesnt exist" });
        }
    })
})

async function queueSub() {
    queue.subscribe((event_id) => {
        let strSql = `select email from users,users_events where event_id = ${event_id} and users.user_id = users_events.user_id`;
        sqlCon.query(strSql, (err, results) => {
            try {
                sendRequestToHost(results);
                console.log(queue);
            }
            catch (err) {
                console.log(err);
            }
        })
    })
}

router.put("/:event_id", async (req, res) => {
    const validBody = validateEvent(req.body);
    if (validBody.error) {
        return res.status(400).json(validBody.error.details);
    }
    const event_id = Number(req.params.event_id);
    const strSql = `Update events set title=?,city=?,adress=?,description=?,event_date=?,max_paticipants=? where  event_id = ${event_id}`;
    let { title, city, adress, description, event_date, max_paticipants } = req.body;
    sqlCon.query(strSql, [title, city, adress, description, event_date, max_paticipants], (err, results) => {
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
    let strSql = `select host from users_events where event_id = ${event_id} and user_id = ${req.tokenData.user_id}`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err); }
        if (results[0] && results[0].host == 1 || req.tokenData.role == "admin") {
            strSql = `Delete from users_events where event_id = ${event_id}`;
            sqlCon.query(strSql, (err, results) => {
                if (err) { return res.json(err); }
                strSql = `Delete from events where event_id = ${event_id}`;
                sqlCon.query(strSql, (err, results) => {
                    if (err) { return res.json(err); }
                    res.json(results);
                })
            })
        }
        else {
            res.json({ err: "unauthorized request" });
        }
    })
})

router.delete("/users/:event_id", auth, async (req, res) => {
    const event_id = Number(req.params.event_id);
    const host = Number(req.body.host);
    let strSql;
    if (req.tokenData.role == "admin" || host) {
        const user_id = req.body.user_id;
        strSql = `Delete from users_events where event_id = ${event_id} and user_id = ${user_id}`;
    }
    else {
        strSql = `Delete from users_events where event_id = ${event_id} and user_id = ${req.tokenData.user_id}`;
    }
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err); }
        res.json(results);
    })
})

router.get("/testing_sg", async (req, res) => {
    sendApproval();
    return res.json("email sent")
})

module.exports = router;