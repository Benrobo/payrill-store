const express = require('express');
const app = express();
const {getSubDomain} = require("./helpers");
const {makeTemplate} = require("./template");
const db = require("./db");

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
            res.send("Store Not Found");
        }
    })
})

app.use('/', express.static('public'))

const server = app.listen(8000, function() {
    const host = server.address().address
    const port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)
})