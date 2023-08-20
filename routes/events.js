const express = require("express");
const router = express.Router();
const { Subject } = require("rxjs")
const queue = new Subject();
const sqlCon = require("../db/sqlConnect");
const { auth } = require("../middleware/auth");
const { validateEvent } = require("../models/eventModel");
const { sendRequestToHost, sendApproval } = require("../middleware/sendGrid")
const novu = require("../middleware/notification")
queueSub();

router.get("/", async (req, res) => {
    const strSql = `SELECT *,(SELECT count(*) FROM users_events WHERE event_id = events.event_id) current_particepants FROM events `;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err); }
        res.json(results);
    })
})

router.get("/loggedIn/:user_id", async (req, res) => {
    const user_id = Number(req.params.user_id);
    const strSql = `SELECT *,(SELECT count(*) FROM users_events WHERE event_id = events.event_id) current_particepants FROM events where event_id not in (select event_id from users_events where user_id = ${user_id})`;
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

router.get("/users/getAllMyEvents", auth, async (req, res) => {
    const host = req.query.host ? "and host = 1" : "and host = 0";
    const strSql = `SELECT * FROM events where events.event_id in (SELECT event_id FROM users_events where user_id=${req.tokenData.user_id} ${host})`;
    sqlCon.query(strSql, (err, results) => {
        if (err) { return res.json(err) }
        res.json(results)
    })
})

router.get("/users/getParticipants/:event_id", async (req, res) => {
    const event_id = Number(req.params.event_id);
    const host = req.query.host ? "" : "and host = 0";
    const strSql = `SELECT users.user_id,name,email,approved,host FROM users_events,users where event_id =${event_id} ${host} and users.user_id = users_events.user_id `;
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
            const user_id = req.tokenData.user_id;
            queue.next({ event_id, reqType: "toHostApprove", user_id })
        }
        else {
            res.json({ err: "event maxed out or doesnt exist" });
        }
    })
})

async function queueSub() {
    queue.subscribe((subObject) => {
        let { user_id, event_id, reqType } = subObject;
        let strSql;
        if (reqType == "toHostApprove") {
            strSql = `select email,users.user_id from users,users_events where event_id = ${event_id} and users.user_id = users_events.user_id and host = 1`;
            sqlCon.query(strSql, (err, results) => {
                if (err) { console.log(err) }
                const reciverEmail = results[0]?.email;
                const reciverId = results[0]?.user_id;
                strSql = `select title from events where event_id = ${event_id}`
                sqlCon.query(strSql, (err, results) => {
                    if (err) { console.log(err) }
                    const title = results[0]?.title;
                    strSql = `select email,name from users where user_id = ${user_id}`
                    sqlCon.query(strSql, (err, results) => {
                        console.log("dsfgdsg")
                        if (err) { console.log(err) }
                        novu.trigger('send-join-request-to-host', {
                            to: {
                              subscriberId: reciverId+"",
                              email: reciverEmail
                            },
                            payload: {
                              title: title,
                              name: results[0]?.name,
                              email: results[0]?.email,
                              unsubscribe: 'unsubscribe',
                              unsubscribe_preferences: 'unsubscribe_preferences'
                            }
                          });
                        // sendRequestToHost(reciverEmail,title,results[0].name,results[0].email)
                    })
                })
            })
        }

        if (reqType == "backAsApproved") {
            strSql = `select email from users where user_id = ${user_id}`;
            sqlCon.query(strSql, (err, results) => {
                if (err) { console.log(err) }
                const email = results[0].email;
                strSql = `select title,event_date from events where event_id = ${event_id}`
                sqlCon.query(strSql, (err, results) => {
                    if (err) { console.log(err) }
                   // sendApproval(email, results[0].title)
                   console.log(user_id,email,results[0].title,results[0].event_date)
                   const Event_Date = (results[0]?.event_date).toISOString() ;
                   console.log(Event_Date)
                   novu.trigger('submit-event-approval', {
                    to: {
                      subscriberId: user_id+"",
                      email: email
                    },
                    payload: {
                      title: results[0].title,
                      unsubscribe: 'unsubscribe',
                      unsubscribe_preferences: 'unsubscribe_preferences',
                      sendAt: Event_Date
                    }
                  });
                })
            })
        }
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
        queue.next({ event_id, reqType: "backAsApproved", user_id })
        res.json(results)
    })
})

router.delete("/deleteEvent/:event_id", auth, async (req, res) => {
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

router.delete("/users/removeUser/:event_id", auth, async (req, res) => {
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

router.post("/testing_n", async (req, res) => {
    const user_id = Number(req.body.user_id);
    const email = req.body.email;
    await novu.trigger('event-reminder', {          
            to: {
                subscriberId: user_id,
                email: email
              },
              payload: {
                title: `adam's bbq`,
                eventName: '<REPLACE_WITH_DATA>',
                eventDate: '<REPLACE_WITH_DATA>',
                rsvpLink: '<REPLACE_WITH_DATA>'
              }
          });
    return res.json("email sent")
})

module.exports = router;