const express = require('express');
const app = express();
const {getSubDomain} = require("./helpers");
const {makeTemplate} = require("./template");
const db = require("./db");
require("dotenv").config({ path: "./.env" });
let port = process.env.PORT;

const HTML = "./public/index.html";
const CSS = "./public/style.css";
const JS = "./public/script.js";

app.get('/style.css', function(req, res) {
    const host = req.hostname;
    const subdomain = getSubDomain(host);

    // Find Store With Subdomain
    db.query({
        sql: "SELECT * FROM stores WHERE subdomain = ?",
        values: [subdomain]
    }, function(error, results) {
        if (results.length != 0) {
            const template = makeTemplate(results[0], CSS);
            res.send(template);
        }
    })
})

app.get('/script.js', function(req, res) {
    const host = req.hostname;
    const subdomain = getSubDomain(host);

    // Find Store With Subdomain
    db.query({
        sql: "SELECT * FROM stores WHERE subdomain = ?",
        values: [subdomain]
    }, function(error, results) {
        if (results.length != 0) {
            const template = makeTemplate(results[0], JS);
            res.setHeader('content-type', 'application/javascript');
            res.send(template);
        }
    })
})

app.get('/', function(req, res) {
    const host = req.hostname;
    const subdomain = getSubDomain(host);

    // Find Store With Subdomain
    db.query({
        sql: "SELECT * FROM stores WHERE subdomain = ?",
        values: [subdomain]
    }, function(error, results) {
        if (results.length != 0) {
            const template = makeTemplate(results[0], HTML);
            res.send(template);
        } else {
            res.sendFile(__dirname + "/public/404.html");
        }
    })
})

app.use('/', express.static('public'))

const server = app.listen(port || 8000, function() {
    const host = server.address().address
    const port = server.address().port

    console.log("App listening at http://%s:%s", host, port)
})
