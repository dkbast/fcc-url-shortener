'use strict';

require('dotenv').load();

//Libraries
const express = require('express');
const mongo = require('mongodb');
const mongoose = require('mongoose');
const dns = require('dns');
const isIp = require('is-ip');
const shortid = require('shortid');

const errorHandler = require('errorhandler');


var cors = require('cors');
var bodyparser = require('body-parser');

var app = express();

// Basic Configuration 
var port = process.env.PORT || 3000;

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);
//mongoose.connect("mongodb://localhost:27017", {useMongoClient:true});
mongoose.connect(process.env.MONGO_URI, {useMongoClient: true});
require(__dirname + '/models/shorturl.js');

// mount middleware
app.use(cors());
app.use(bodyparser.urlencoded({extended: false}));


app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function (req, res) {
    res.sendFile(process.cwd() + '/views/index.html');
});

function stripProtocol(urlWithProtocol) {
    // https://stackoverflow.com/questions/8206269/how-to-remove-http-from-a-url-in-javascript
    return urlWithProtocol.replace(/(^\w+:|^)\/\//, '');
}

// your first API endpoint... 
app.route("/api/shorturl/new").get((req, res) => {
    res.json({"error": "this API endpoint is POST only"});
}).post(function (req, res) {
    let urlString = req.body['url'];
    console.log("urlstring " + urlString);
    //dns lookup needs the url without protocol
    dns.lookup(stripProtocol(urlString), function (err, address, family) {
        if (err) {
            console.log(err)
        }
        console.log("address " + address);
        if (!isIp(address)) {
            res.json({"error": "invalid URL"});
        } else {
            var uniqueid = true;
            var newshortid;
            do {
                newshortid = shortid.generate();
                mongoose.model('shorturl').findOne({shorturl: newshortid}, function (err, url) {
                    console.log("url already taken: " + url);
                    uniqueid = false;
                });
            } while (!uniqueid);

            mongoose.model('shorturl').create({original_url: urlString, short_url: newshortid});
            res.json({original_url: urlString, short_url: newshortid});
        }
    })
});

app.get("/api/shorturl/:shortid", (req, res) => {
    if (req.params.shortid != null) {
        console.log(req.params.shortid);
        mongoose.model('shorturl').findOne({short_url: req.params.shortid}, function (err, document) {
            if (err) {
                console.log(err)
            } else {
                console.log(document.original_url);
                res.redirect(document.original_url);
            }
        })
    } else {
        res.json({"error": "invalid ShortID"});
    }
});

app.listen(port, function () {
    console.log('Node.js listening ...');
});