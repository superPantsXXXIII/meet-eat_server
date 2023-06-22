const express = require("express");
const router = express.Router();
const sqlCon = require("../db/sqlConnect");
const mysql = require("mysql2")
const Joi = require("joi")

router.get("/", async (req, res) => {
  const perPage = Number(req.query.perPage) || 5;
  const skip = Number(req.query.skip) || 0;
  const category = req.query.category;
  let where = ""
  if (category) { where = `WHERE sports = ${mysql.escape(category)}` }
  const strSql = `SELECT * FROM players ${where} LIMIT ${skip},${perPage}`;
  sqlCon.query(strSql, (err, results) => {
    if (err) { return res.json(err) }
    res.json(results)
  })
})

router.get("/test", async (req, res) => {
  const perPage = req.query.perPage || 5;
  const skip = req.query.skip || 0;
  const strSql = `SELECT * from players LIMIT ${skip},${perPage}`
  sqlCon.query(strSql, (err, results, fields) => {
    if (err) { return res.json(err) }
    res.json(results)
  })
})

router.post("/", async (req, res) => {
  const validBody = validatePlayer(req.body);
  if (validBody.error) {
    return res.status(400).json(validBody.error.details)
  }
  //const strSql = `INSERT INTO players values (NULL,'${req.body.name}','${req.body.birth_year}','${req.body.sports}')`
  const strSql = `INSERT INTO players values (NULL,?,?,?)`
  const { name, birth_year, sports } = req.body;
  sqlCon.query(strSql, [name, birth_year, sports], (err, results, fields) => {
    if (err) { return res.json(err) }
    res.json(results)
  })
})

router.put("/:id", async(req,res) => {
  const validBody = validatePlayer(req.body);
  if(validBody.error){
    return res.status(400).json(validBody.error.details);
  }
  const id = Number(req.params.id);
  const strSql = `UPDATE players SET name = ? , birth_year = ?, sports = ? WHERE id = ${id}`;
  const {name, birth_year, sports} = req.body;
  sqlCon.query(strSql, [name, birth_year, sports] ,(err, results) => {
    if (err) { return res.json(err) }
    res.json(results)
  })
})

router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id)
  const strSql = `DELETE FROM players WHERE id=${id}`
  sqlCon.query(strSql, (err, results, fields) => {
    if (err) { return res.json(err) }
    res.json(results)
  })
})

const validatePlayer = (_reqBody) => {
  let joiSchema = Joi.object({
    name: Joi.string().min(2).max(400).required(),
    birth_year: Joi.number().min(1900).max(2100).required(),
    sports: Joi.string().min(2).max(400).required(),
  })
  return joiSchema.validate(_reqBody)
}

module.exports = router;