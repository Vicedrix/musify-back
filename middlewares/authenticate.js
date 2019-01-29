'use strict';

var jwt = require('jwt-simple');
var moment = require('moment');
var secret = 'the_secret_is_here';

exports.ensureAuth = function (req, res, next) {
    if (!req.headers.authorization) {
        return res.status(403).send({
            message: 'The request has not header.'
        });
    }

    var token = req.headers.authorization.replace(/['"]+/g, '');

    try {
        var payload = jwt.decode(token, secret);

        if (payload.exp <= moment().unix()) {
            return res.status(401).send({
                message: 'Token expired.'
            });
        }
    } catch (ex) {
        console.log(ex);
        console.log("token: " + token);
        console.log("secret: " + secret);
        return res.status(404).send({
            message: 'Token not valid.'
        });
    }

    req.user = payload;
    next();
};