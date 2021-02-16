const session = require('express-session')
const MongoStore = require('connect-mongo')(session)
const mongoose = require('mongoose')

module.exports = app => {
    
    app.use(
        session({
            secret: process.env.SESS_SECRET,
            resave: true,
            saveUninitialized: false,
            cookie: {
                sameSite: false,
                httpOnly: true,
                maxAge: 1200000 //session=20 min
            },
            store: new MongoStore({
                mongooseConnection: mongoose.connection,
                ttl: 60*60*24
            })
        })
    );

};